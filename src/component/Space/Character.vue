<template>
    <div @click="isContenModalOpen = true">
        <div class="card card-compact bg-base-100 shadow-2xl rounded-2xl">
            <figure class="max-h-60">
                <img :src="character?.background_photo" alt="角色背景"
                    class="object-cover hover:scale-110 transition-all duration-300 relative" draggable="false" />
            </figure>
            <div class="card-body">
                <p class="card-text line-clamp-6 break-all">{{ character?.profile }}</p>
                <div class="grid w-full mt-1">
                    <div class="flex items-center gap-2">
                        <router-link :to="`/user/space/${character?.author?.uuid}`"
                            class="cursor-pointer hover:scale-110 transition-all duration-300">
                            <img :src="character?.photo" alt="角色头像" class="w-6 h-6 object-cover rounded-2xl" />
                        </router-link>
                        <div class="text-sm font-bold line-clamp-1 break-all">{{ character?.name }}</div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 打开内容modal -->
        <ContenModal :content="character" v-model:open="isContenModalOpen" @remove="handleRemove" :operator="canEdit" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import ContenModal from '@/component/ContenModal/ContenModal.vue';
import { deleteCharacter } from '@/api/character';
import { ElMessage } from 'element-plus';

const isContenModalOpen = ref(false);

const userStore = useUserStore();

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

const handlerRemoveCharacter = async () => {
    try {
        const res = await deleteCharacter(props.character.uuid);
        console.log('handlerRemoveCharacter:', res)
        if (res?.status === 200) {
            emit('remove', props.character.uuid);
            ElMessage.success('删除角色成功');
        }
        else {
            console.log(res)
            ElMessage.error(res?.data?.errors || '删除角色失败');
        }
    } catch (error) {
        console.log(error);
        ElMessage.error(error?.response?.data?.errors || '删除角色失败');
    }
}

// 删除角色
const handleRemove = (uuid) => {
    emit('remove', uuid);
}

</script>