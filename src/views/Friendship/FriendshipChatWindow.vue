<template>
    <div v-if="character" class="flex flex-col flex-1 min-h-0 overflow-hidden bg-base-100">
        <!-- 头部：聊天对象 -->
        <header class="flex items-center gap-3 px-4 py-3 border-b border-base-300 shrink-0">
            <div class="avatar">
                <div class="w-10 rounded-full ring-2 ring-base-300">
                    <img :src="character.photo" :alt="character.name" />
                </div>
            </div>
            <span class="font-semibold text-base truncate">{{ character.name }}</span>
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
import { ref } from 'vue';

const props = defineProps({
    character: {
        type: Object,
        default: null,
    },
});

const inputText = ref('');
const messages = ref([]);

const send = () => {
    const text = inputText.value.trim();
    if (!text) return;
    messages.value.push({ text, isMe: true });
    inputText.value = '';
    // TODO: 调用发送消息 API，并接收对方回复
};
</script>
