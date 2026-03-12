<template>
    <div v-if="friend" class="flex flex-col flex-1 min-h-0 overflow-hidden bg-base-100">
        <!-- 头部：聊天对象 -->
        <header
            class="flex items-center gap-3 px-4 py-3 shrink-0 border-b border-base-300/80 bg-gradient-to-b from-base-100 to-base-200/40 shadow-sm">
            <div class="avatar">
                <div class="w-10 rounded-full ring-2 ring-base-300/90 ring-offset-1 ring-offset-base-100">
                    <img :src="friend.character?.photo" :alt="friend.character?.name" />
                </div>
            </div>
            <div class="min-w-0">
                <span class="font-semibold text-base truncate block">{{ friend.character?.name }}</span>
                <span class="text-xs text-base-content/55">聊天中</span>
            </div>
        </header>

        <!-- 消息区域：仅此区域可滚动，保证输入框始终在视口内 -->
        <section ref="scrollContainerRef" class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 bg-base-200/20">
            <div v-if="!props.friend"
                class="flex flex-col items-center justify-center h-full text-base-content/50 text-sm">
                <span>暂无消息</span>
                <span class="mt-1">发送一条消息开始对话</span>
            </div>
            <div v-else class="flex flex-col gap-3">
                <div v-if="isLoading" class="mb-2 text-center">
                    <div class="loading loading-spinner loading-lg"></div>
                </div>
                <div v-else class="text-center">
                    <div class="text-xs opacity-60">已经拉到头了~</div>
                </div>
                <div ref="sentinelRef" class="h-2 mb-2 w-100"></div>

                <!-- 流式加载历史消息 -->
                <Messages v-model:scroll-container="scrollContainerRef" v-for="message in messages" :key="message.id"
                    :messages="message" :character="friend.character" />
            </div>
        </section>

        <!-- 输入区 -->
        <footer class="flex gap-2 p-4 border-t border-base-300 shrink-0 bg-base-100">
            <input v-model="inputText" type="text" placeholder="输入消息..." class="input input-bordered w-full input-sm"
                @keydown.enter.prevent="handleEnterKey" />
            <button type="button" class="btn btn-primary btn-sm shrink-0" :disabled="!inputText.trim()" @click="send">
                发送
            </button>
        </footer>
    </div>
    <div v-else
        class="flex flex-col flex-1 min-h-0 items-center justify-center min-h-[20rem] text-base-content/40 text-sm">
        <p>在左侧选择一位好友开始聊天</p>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { sendMessageStream, getMessageHistory } from '@/api/friends';
import Messages from '@/component/Friendship/Messages.vue';

// 流式加载哨兵
const sentinelRef = ref(null);
const scrollContainerRef = ref(null);
const messages = ref([]);
const isLoading = ref(false);
const hasMessages = ref(true);

// 消息分页信息
const messagePageInfo = reactive({
    page: 1,
    page_size: 20,
    total: 0,
    next: null,
})

// 加载历史消息
const loadHistoryMessages = async () => {
    // 通过父组件 key 强制重新挂载子组件
    if (!props.friend?.uuid || isLoading.value || !hasMessages.value) return;
    isLoading.value = true;
    let newMessages = [];

    try {
        const response = await getMessageHistory(props.friend.uuid, messagePageInfo.page, messagePageInfo.page_size);
        console.log('加载历史消息响应 ==> ', response);
        if (response?.status === 200) {
            const data = response.data;
            newMessages = data.results ?? [];
            messagePageInfo.total = data.count ?? 0;
            messagePageInfo.next = data.next ?? null;
        }
    } catch (error) {
        console.log('加载历史消息失败 ==> ', error);
        hasMessages.value = false;
    } finally {
        isLoading.value = false;
        if (newMessages.length === 0 || (messagePageInfo.total > 0 && messages.value.length >= messagePageInfo.total)) {
            hasMessages.value = false;
        } else {
            const oldWindowHeight = scrollContainerRef.value.scrollHeight;
            for (const message of newMessages) {
                // 由于是历史消息，所以需要将消息添加到列表前面
                handlerPushfrontMessage({
                    role: 'assistant',
                    content: message.output,
                    id: crypto.randomUUID(),
                    created_at: message.created_at,
                });
                handlerPushfrontMessage({
                    role: 'user',
                    content: message.user_message,
                    id: crypto.randomUUID(),
                    created_at: message.created_at,
                });
            }
            messagePageInfo.page += 1;
            await nextTick();
            const newWindowHeight = scrollContainerRef.value.scrollHeight;
            scrollContainerRef.value.scrollTop = scrollContainerRef.value.scrollHeight + (newWindowHeight - oldWindowHeight);

            if (checkSentinelInViewport()) {
                loadHistoryMessages();
            }
        }
    }
}

// 自动滚动到列表底部
const scrollToBottom = async () => {
    await nextTick();
    scrollContainerRef.value.scrollTop = scrollContainerRef.value.scrollHeight;
}

// 将消息添加到列表后面
const handlerPushbackMessage = (message) => {
    messages.value.push(message);
    scrollToBottom();
}

// 将中断内容标记为真
const handlerMarkInterrupted = () => {
    messages.value.at(-3).is_interrupted = true;
}

// 将内容添加到列表最后的消息体中
const addContentToLastMessage = (content) => {
    messages.value.at(-1).content += content;
    scrollToBottom();
}

// 将消息添加到列表前面
const handlerPushfrontMessage = (message) => {
    messages.value.unshift(message);
}

// 检查哨兵是否在列表滚动容器视口内
const checkSentinelInViewport = () => {
    if (!sentinelRef.value || !scrollContainerRef.value) return false;
    const rect = sentinelRef.value.getBoundingClientRect();
    const scrollRect = scrollContainerRef.value.getBoundingClientRect();
    return rect.top < scrollRect.bottom && rect.bottom > scrollRect.top;
};

const props = defineProps({
    friend: {
        type: Object,
        default: null,
    },
});

// 输入框内容
const inputText = ref('');

// 打断说话
let procesId = 0;

// 处理回车发送，避免中文输入法组字阶段误触发发送
const handleEnterKey = (event) => {
    // 中文输入法正在组字时，忽略回车
    if (event.isComposing) return;
    send();
};

// 发送消息
const send = async () => {
    const text = inputText.value.trim();
    if (!text) return;

    const currentProcesId = ++procesId;

    inputText.value = '';

    handlerPushbackMessage({ role: 'interrupted', is_interrupted: false, id: crypto.randomUUID() });
    handlerPushbackMessage({ role: 'user', content: text, id: crypto.randomUUID() });
    handlerPushbackMessage({ role: 'assistant', content: '', id: crypto.randomUUID() });

    // TODO: 调用发送消息 API，并接收对方回复
    try {
        sendMessageStream({ friend_uuid: props.friend.uuid, message: text }, (data, isDone) => {
            if (currentProcesId !== procesId) {
                handlerMarkInterrupted();
                return;
            }
            if (data.content) {
                console.log('接受消息 ==> ', data.content);
                // 由于最后一条消息是属于助手，并且content为空，所以在流式接受信息时，一并加上内容
                addContentToLastMessage(data.content);
            }
        }, (error) => {
            console.log('流式发送消息失败 ==> ', error);
        });
    } catch (error) {
        console.log('发送消息失败 ==> ', error);
        ElMessage.error(error?.response?.data?.errors || '发送消息失败');
    }
};

let observer = null;
onMounted(async () => {
    await nextTick();
    await loadHistoryMessages();
    const scrollRoot = scrollContainerRef.value;
    if (sentinelRef.value && scrollRoot) {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) loadHistoryMessages();
                });
            },
            { root: scrollRoot, rootMargin: '2px', threshold: 0 }
        );
        observer.observe(sentinelRef.value);
    }
});

onUnmounted(() => {
    if (observer) observer.disconnect();
});
</script>
