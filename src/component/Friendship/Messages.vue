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
        <div v-else class="chat chat-end ms-auto my-2">
            <!-- <div class="chat-header">
                <time class="text-xs opacity-50">{{ handleCreateTime(messages.created_at) }}</time>
            </div> -->
            <div
                class="chat-bubble chat-bubble-success rounded-t-lg rounded-l-lg rounded-bl-lg whitespace-pre-wrap break-all">
                {{
                    messages.content }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

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

// 处理时间
const handleCreateTime = (time) => {
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
});

</script>