<template>
    <div v-if="friend" class="flex flex-col flex-1 min-h-0 overflow-hidden bg-base-100">
        <!-- 头部：聊天对象 -->
        <header class="flex items-center gap-3 px-4 py-3 border-b border-base-300 shrink-0">
            <div class="avatar">
                <div class="w-10 rounded-full ring-2 ring-base-300">
                    <img :src="friend.character?.photo" :alt="friend.character?.name" />
                </div>
            </div>
            <span class="font-semibold text-base truncate">{{ friend.character?.name }}</span>
        </header>

        <!-- 消息区域：仅此区域可滚动，保证输入框始终在视口内 -->
        <section class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 bg-base-200/30">
            <div v-if="!messages.length"
                class="flex flex-col items-center justify-center h-full text-base-content/50 text-sm">
                <span>暂无消息</span>
                <span class="mt-1">发送一条消息开始对话</span>
            </div>
            <div v-else class="flex flex-col gap-3">
                <div v-for="(msg, i) in messages" :key="i" :class="[
                    'flex',
                    msg.isMe ? 'justify-end' : 'justify-start',
                ]">
                    <div :class="[
                        'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                        msg.isMe
                            ? 'bg-primary text-primary-content rounded-br-md'
                            : 'bg-base-300 text-base-content rounded-bl-md',
                    ]">
                        {{ msg.text }}
                    </div>
                </div>
            </div>
        </section>

        <!-- 输入区 -->
        <footer class="flex gap-2 p-4 border-t border-base-300 shrink-0 bg-base-100">
            <input v-model="inputText" type="text" placeholder="输入消息..." class="input input-bordered w-full input-sm"
                @keydown.enter.prevent="send" />
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
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { sendMessageStream } from '@/api/friends';

const props = defineProps({
    friend: {
        type: Object,
        default: null,
    },
});

const inputText = ref('');
const messages = ref([]);
const isProcessing = ref(false);

const send = async () => {
    if (isProcessing.value) return;
    isProcessing.value = true;

    const text = inputText.value.trim();
    if (!text) return;
    messages.value.push({ text, isMe: true });
    inputText.value = '';
    // TODO: 调用发送消息 API，并接收对方回复
    try {
        sendMessageStream({ friend_uuid: props.friend.uuid, message: text }, (data, isDone) => {
            if (isDone) {
                isProcessing.value = false;
            } else if (data.content) {
                console.log('接受消息 ==> ', data.content);
            }
        }, (error) => {
            isProcessing.value = false;
            console.log('流式发送消息失败 ==> ', error);
        });
    } catch (error) {
        isProcessing.value = false;
        console.log('发送消息失败 ==> ', error);
        ElMessage.error(error?.response?.data?.errors || '发送消息失败');
    }
};

onMounted(() => {
    console.log('FriendshipChatWindow mounted ==> ', props.friend);
});
</script>
