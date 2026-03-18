<template>
    <div v-if="friend" class="flex flex-col flex-1 min-h-0 overflow-hidden bg-base-100">
        <!-- 头部：聊天对象 -->
        <header
            class="flex items-center gap-3 px-4 py-3 shrink-0 border-b border-base-300/80 bg-gradient-to-b from-base-100 to-base-200/40 shadow-sm">
            <div class="avatar">
                <div class="w-10 rounded-full ring-2 ring-base-300/90 ring-offset-1 ring-offset-base-100">
                    <img :src="joinUrl(MEDIA_BASE_URL, friend.character?.photo)" :alt="friend.character?.name" />
                </div>
            </div>
            <div class="min-w-0">
                <span class="font-semibold text-base truncate block">{{ friend.character?.name }}</span>
                <span class="text-xs text-base-content/55">聊天中</span>
            </div>
            <!-- TTS 语音回复开关 -->
            <button type="button" class="ml-auto btn btn-ghost btn-circle btn-sm transition-colors"
                :class="isTtsEnabled ? 'text-primary' : 'text-base-content/40'" @click="isTtsEnabled = !isTtsEnabled"
                :title="isTtsEnabled ? '关闭语音回复' : '开启语音回复'">
                <!-- <svg v-if="isTtsEnabled" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg> -->
                <!-- 音量开启icon -->
                <VolumeIcon v-if="isTtsEnabled" />
                <!-- 音量关闭icon -->
                <VolumeIconClose v-else />
            </button>
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
                    :messages="message" :character="friend.character" :last_messages_id="last_user_message_id" />
            </div>
        </section>

        <!-- 输入区 -->
        <footer class="flex gap-2 p-4 border-t border-base-300 shrink-0 bg-base-100">
            <input v-model="inputText" type="text" placeholder="输入消息..." class="input input-bordered w-full input-sm"
                @keydown.enter.prevent="handleEnterKey" />
            <!-- 麦克风输入按钮 -->
            <MicPhoneInput @updateInputText="updateInputText" @interrupted="interruptedMessage" @sendMessage="send"
                @sendMessageSuccess="handlerSendMessageSuccess" />
            <!-- 发送按钮 -->
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
import { ref, onMounted, nextTick, onUnmounted, reactive, watch, computed, defineAsyncComponent } from 'vue';
import { ElMessage } from 'element-plus';
import { sendMessageStream, getMessageHistory } from '@/api/friends';
import Messages from '@/component/Friendship/Messages.vue';
import VolumeIcon from '@/component/Icon/VolumeIcon.vue';
import VolumeIconClose from '@/component/Icon/VolumeIconClose.vue';
import { joinUrl, MEDIA_BASE_URL } from '@/utils/url';

const MicPhoneInput = defineAsyncComponent(() => import('@/views/Friendship/MicPhoneInput.vue'));


// 最后一个用户消息的id
const last_user_message_id = computed(() => {
    // return messages.value.findLast(message => message.role === 'user')?.id || null;
    return messages.value.at(-1)?.id || null;
})

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
                    is_audio: message.tts_audio ? true : false,
                    audio_url: message.tts_audio ? message.tts_audio : null,
                    id: crypto.randomUUID(),
                    created_at: message.created_at,
                    status: true,
                });
                handlerPushfrontMessage({
                    role: 'user',
                    content: message.user_message,
                    is_audio: message.audio_message ? true : false,
                    audio_url: message.audio_message ? message.audio_message : null,
                    id: crypto.randomUUID(),
                    created_at: message.created_at,
                    status: true,
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

// 发送消息成功后，将status置为真
const handlerSendMessageSuccess = () => {
    const lastUserMessage = messages.value.at(-1) ?? null;
    if (lastUserMessage) {
        lastUserMessage.status = true;
        scrollToBottom();
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

// 修改用户发送消息为语音消息
const changeUserMessageToAudio = (audioPayload) => {
    if (!audioPayload?.audio_url) return;

    // 如果当前没有“占位语音消息”，则新增一条用户语音消息
    handlerPushbackMessage({
        role: 'user',
        content: audioPayload.audio_url,
        id: crypto.randomUUID(),
        is_audio: true,
        audio_url: audioPayload.audio_url,
        audio_duration: audioPayload.audio_duration,
        status: false,
    });
    scrollToBottom();
}

// 通过录音识别到文字进行更新
const updateInputText = (audioPayload) => {
    console.log('将录制的声音传递出来，并显示 => ', audioPayload);
    changeUserMessageToAudio(audioPayload);
}

// 输入框内容
const inputText = ref('');

// TTS 语音回复开关
const isTtsEnabled = ref(true);

// 打断说话
let procesId = 0;

// ─── 逐句渐进式 TTS 播放 ───
let currentAudio = null;
const playbackQueue = [];
let isAudioPlaying = false;

const buildAudioBlob = (chunks) => {
    const arrays = chunks.map(b64 => {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    });
    const totalLen = arrays.reduce((s, a) => s + a.length, 0);
    const merged = new Uint8Array(totalLen);
    let off = 0;
    for (const a of arrays) { merged.set(a, off); off += a.length; }
    return new Blob([merged], { type: 'audio/mp3' });
};

const playNextFromQueue = () => {
    if (playbackQueue.length === 0) {
        isAudioPlaying = false;
        currentAudio = null;
        return;
    }
    isAudioPlaying = true;
    const blob = playbackQueue.shift();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(e => console.warn('TTS 播放失败:', e));
    audio.onended = () => {
        URL.revokeObjectURL(url);
        playNextFromQueue();
    };
};

// 将音频块添加到队列中
const enqueueSentenceAudio = (chunks) => {
    if (!chunks.length) return;
    playbackQueue.push(buildAudioBlob(chunks));
    if (!isAudioPlaying) playNextFromQueue();
};

// 将语音添加到AI消息当中
const addAudioToAssistantMessage = (allAudioChunks) => {
    const blob = buildAudioBlob(allAudioChunks);
    const audioUrl = URL.createObjectURL(blob);
    const lastMessage = messages.value.at(-1);
    if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.is_audio = true;
        lastMessage.audio_url = audioUrl;
    }
    scrollToBottom();
}

const stopAllAudio = () => {
    if (currentAudio) {
        currentAudio.pause();
        URL.revokeObjectURL(currentAudio.src);
        currentAudio = null;
    }
    playbackQueue.length = 0;
    isAudioPlaying = false;
};

// 打断AI说话
const interruptedMessage = () => {
    ++procesId;
    stopAllAudio();
}

// 处理回车发送，避免中文输入法组字阶段误触发发送
const handleEnterKey = (event) => {
    // 中文输入法正在组字时，忽略回车
    if (event.isComposing) return;
    send(event);
};

// 发送消息
const send = async (event, audio_messages = null, audio_files = null) => {
    // console.log("存在 audio 文件 ===> ", audio_files)
    let text;
    if (audio_messages) {
        // 发送的语音消息
        text = audio_messages;
    } else {
        text = inputText.value.trim();
    }
    if (!text) return;

    const currentProcesId = ++procesId;

    inputText.value = '';

    handlerPushbackMessage({ role: 'interrupted', is_interrupted: false, id: crypto.randomUUID(), status: true });
    if (audio_messages) {
        // handlerPushbackMessage({ role: 'user', content: null, id: crypto.randomUUID(), is_audio: true });
    } else {
        handlerPushbackMessage({ role: 'user', content: text, id: crypto.randomUUID(), is_audio: false, status: false });
    }
    handlerPushbackMessage({ role: 'assistant', content: '', id: crypto.randomUUID(), status: true });

    const enableTts = isTtsEnabled.value;
    let sentenceChunks = [];
    let allAudioChunks = [];

    try {
        let bodyData;
        if (audio_files) {
            bodyData = new FormData();
            bodyData.append('friend_uuid', props.friend.uuid);
            bodyData.append('message', text);
            bodyData.append('audio_files', audio_files, 'audio.mp3');
            if (enableTts) bodyData.append('enable_tts', 'true');
        } else {
            bodyData = { friend_uuid: props.friend.uuid, message: text };
            if (enableTts) bodyData.enable_tts = 'true';
        }
        sendMessageStream(bodyData, (data, isDone) => {
            if (currentProcesId !== procesId) {
                handlerMarkInterrupted();
                return;
            }
            if (isDone) {
                if (sentenceChunks.length > 0) {
                    enqueueSentenceAudio(sentenceChunks);
                    sentenceChunks = [];
                }
                if (allAudioChunks.length > 0) {
                    addAudioToAssistantMessage(allAudioChunks)
                    allAudioChunks = [];
                }
                return;
            }
            if (data.content) {
                addContentToLastMessage(data.content);
                handlerSendMessageSuccess();
            }
            if (data.audio) {
                sentenceChunks.push(data.audio);
                allAudioChunks.push(data.audio);
            }
            if (data.audio_end) {
                enqueueSentenceAudio(sentenceChunks);
                sentenceChunks = [];
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
    messages.value.forEach((message) => {
        if (message?.audio_url) {
            URL.revokeObjectURL(message.audio_url);
        }
    });
    stopAllAudio();
    if (observer) observer.disconnect();
});
</script>