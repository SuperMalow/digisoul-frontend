<template>
    <div v-if="messages" class="w-full">
        <div v-if="messages.role === 'assistant'" class="chat chat-start me-auto">
            <div class="chat-image avatar">
                <div class="w-8 rounded-full">
                    <img :src="character.photo" :alt="character.name" />
                </div>
            </div>
            <div class="chat-header">
                <time class="text-xs opacity-40 ms-2">{{ handleCreateTime(messages.created_at) }}</time>
            </div>
            <div class="chat-bubble rounded-t-lg rounded-r-lg rounded-br-lg whitespace-pre-wrap break-all">{{
                messages.content }}
            </div>
        </div>
        <div v-else-if="messages.role === 'interrupted' && messages.is_interrupted"
            class="w-full flex justify-center my-2">
            <span
                class="badge badge-outline badge-sm px-3 py-2 text-xs text-base-content/70 border-base-300 bg-base-300 rounded-full">
                已打断对话
            </span>
        </div>
        <div v-else-if="messages.role === 'user'" class=" chat chat-end ms-auto my-2">
            <div
                class="chat-bubble chat-bubble-success rounded-t-lg rounded-l-lg rounded-bl-lg whitespace-pre-wrap break-all">
                <template v-if="messages.is_audio">
                    <button type="button"
                        class="inline-flex items-center gap-[0.45rem] border-none bg-transparent text-black cursor-pointer p-0 text-[0.86rem]"
                        @click="toggleAudioPlay">
                        <span class="ms-2">{{ isPlaying ? '正在播放' : '语音消息' }}</span>
                        <span class="opacity-80 text-xs">{{ formatDuration(displayDuration) }}</span>
                        <audio ref="audioRef" :src="messages.content" preload="metadata" @ended="handleAudioEnded"
                            @loadedmetadata="handleLoadedMetadata" @timeupdate="handleAudioTimeUpdate"
                            @play="handleAudioPlay" @pause="handleAudioPause"></audio>
                    </button>
                </template>
                <template v-else>
                    {{ messages.content }}
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
    messages: {
        type: Object,
        required: true,
    },
    character: {
        type: Object,
        required: true,
    },
});

const audioRef = ref(null);
const isPlaying = ref(false);
const loadedDuration = ref(0);
const remainingDuration = ref(0);

const getTotalDuration = () => {
    return props.messages?.audio_duration || loadedDuration.value || 0;
};

const displayDuration = computed(() => {
    return remainingDuration.value || getTotalDuration();
});

const syncRemainingDuration = () => {
    const totalDuration = getTotalDuration();
    if (!audioRef.value) {
        remainingDuration.value = totalDuration;
        return;
    }
    const currentTime = audioRef.value.currentTime || 0;
    remainingDuration.value = Math.max(0, totalDuration - currentTime);
};

const handleLoadedMetadata = () => {
    if (!audioRef.value) return;
    const duration = audioRef.value.duration;
    if (Number.isFinite(duration) && duration > 0) {
        loadedDuration.value = duration;
        syncRemainingDuration();
    }
};

const handleAudioTimeUpdate = () => {
    syncRemainingDuration();
};

const handleAudioPlay = () => {
    isPlaying.value = true;
    syncRemainingDuration();
};

const handleAudioPause = () => {
    isPlaying.value = false;
};

const handleAudioEnded = () => {
    isPlaying.value = false;
    if (audioRef.value) {
        audioRef.value.currentTime = 0;
    }
    remainingDuration.value = getTotalDuration();
};

const toggleAudioPlay = async () => {
    if (!audioRef.value?.src) return;
    if (audioRef.value.paused) {
        try {
            if (
                Number.isFinite(audioRef.value.duration) &&
                audioRef.value.duration > 0 &&
                audioRef.value.currentTime >= audioRef.value.duration
            ) {
                audioRef.value.currentTime = 0;
            }
            await audioRef.value.play();
        } catch (error) {
            console.log('语音播放失败 ==> ', error);
            isPlaying.value = false;
        }
        return;
    }

    audioRef.value.pause();
    isPlaying.value = false;
};

const formatDuration = (seconds) => {
    const safeSeconds = Math.max(1, Math.ceil(seconds || 0));
    return `${safeSeconds}"`;
};

watch(() => props.messages.content, () => {
    if (audioRef.value) {
        audioRef.value.pause();
        audioRef.value.currentTime = 0;
    }
    isPlaying.value = false;
    loadedDuration.value = 0;
    remainingDuration.value = props.messages?.audio_duration || 0;
});

// 处理时间
const handleCreateTime = (time) => {
    console.log('handleCreateTime =====> ', time);
    if (time === undefined || time === null) {
        return '';
    }
    const now = new Date();
    const messageTime = new Date(time);
    const diffTime = now.getTime() - messageTime.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    if (diffMinutes < 1) {
        return '刚刚';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`;
    } else if (diffMinutes < 60 * 3) {
        return `${Math.floor(diffMinutes / 60)}小时前`;
    } else if (diffMinutes < 60 * 24) {
        return messageTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } else {
        return messageTime.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
}

onMounted(() => {
    console.log('messages =====> ', props.messages);
    remainingDuration.value = props.messages?.audio_duration || 0;
});

onUnmounted(() => {
    if (audioRef.value) {
        audioRef.value.pause();
    }
});

</script>