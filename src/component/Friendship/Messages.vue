<template>
    <div v-if="messages" class="w-full">
        <div v-if="messages.role === 'assistant'" class="chat chat-start me-auto">
            <div class="chat-image avatar">
                <div class="w-8 rounded-full">
                    <img :src="character.photo" :alt="character.name" />
                </div>
            </div>
            <div class="chat-bubble rounded-t-lg rounded-r-lg rounded-br-lg whitespace-pre-wrap">{{ messages.content }}
            </div>
        </div>
        <div v-else class="chat chat-end ms-auto my-2">
            <div class="chat-bubble chat-bubble-success rounded-t-lg rounded-l-lg rounded-bl-lg whitespace-pre-wrap">{{
                messages.content }}
            </div>
        </div>
    </div>
</template>

<script setup>

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

</script>