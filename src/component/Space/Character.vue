<template>
    <div>
        <div class="card card-compact bg-base-100 shadow-2xl rounded-2xl">
            <figure>
                <img :src="character?.background_photo" alt="角色背景"
                    class="object-cover hover:scale-110 transition-all duration-300 relative" />
                <div v-if="character?.author_uuid === userStore.uuid"
                    class="absolute top-0 flex justify-center gap-2 w-full bg-black/20 rounded-t-2xl">
                    <router-link :to="`/create/character/update/${character.uuid}`"
                        class="btn btn-circle btn-ghost bg-transparent cursor-pointer">
                        <EditIcon class="text-white" />
                    </router-link>
                    <button class="btn btn-circle btn-ghost bg-transparent cursor-pointer"
                        @click="handlerRemoveCharacter">
                        <RemoveIcon class="text-white" />
                    </button>
                </div>
            </figure>
            <div class="card-body">
                <p class="card-text line-clamp-2 break-all">{{ character?.profile }}</p>
                <div class="grid w-full mt-1">
                    <div class="flex items-center gap-2">
                        <router-link :to="`/user/space/${character.author_uuid}`"
                            class="cursor-pointer hover:scale-110 transition-all duration-300">
                            <img :src="character?.photo" alt="角色头像" class="w-6 h-6 object-cover rounded-2xl" />
                        </router-link>
                        <div class="text-sm font-bold line-clamp-1 break-all">{{ character?.name }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import RemoveIcon from '@/component/Icon/RemoveIcon.vue';
import EditIcon from '@/component/Icon/EditIcon.vue';
import { deleteCharacter } from '@/api/character';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();

const props = defineProps({
    character: {
        type: Object,
        required: true,
    },
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

</script>