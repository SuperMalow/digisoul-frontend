<template>
    <div @click="handleOpenContenModal">
        <div class="card card-compact bg-base-100 shadow-2xl rounded-2xl">
            <figure class="max-h-60">
                <img :src="joinUrl(MEDIA_BASE_URL, character?.background_photo)" alt="角色背景"
                    class="object-cover hover:scale-110 transition-all duration-300 relative" draggable="false" />
            </figure>
            <div class="card-body">
                <p class="card-text line-clamp-6 break-all">{{ character?.character_settings?.short_profile }}</p>
                <div class="grid w-full mt-1">
                    <div class="flex items-center gap-2" @click="handleGoToChat">
                        <img :src="joinUrl(MEDIA_BASE_URL, character?.photo)" alt="角色头像"
                            class="w-6 h-6 object-cover rounded-2xl cursor-pointer hover:scale-110 transition-all duration-300" />
                        <div class="text-sm font-bold line-clamp-1 break-all cursor-pointer">{{
                            character?.name }}</div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 打开内容modal -->
        <ContenModal :content="character" v-model:open="isContenModalOpen" @remove="handleRemove" :operator="canEdit" />
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ContenModal from '@/component/ContenModal/ContenModal.vue';
import { joinUrl, MEDIA_BASE_URL } from '@/utils/url';

import { useRouter } from 'vue-router';

const router = useRouter();

const isContenModalOpen = ref(false);

const handleOpenContenModal = () => {
    isContenModalOpen.value = true;
}

// 处理跳转聊天还是作者主页
const handleGoToChat = () => {
    if (props.character?.is_friend?.uuid) {
        router.push(`/friendship/?friend_uuid=${props.character?.is_friend?.uuid}`);
    } else {
        handleOpenContenModal();
    }
}

const props = defineProps({
    character: {
        type: Object,
        required: true,
    },
    canEdit: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(['remove']);

// 删除角色
const handleRemove = (uuid) => {
    emit('remove', uuid);
}

onMounted(() => {
    // console.log('Character mounted ===>', props.character);
})

</script>