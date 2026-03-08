<template>
    <div class="modal-field">
        <div class="flex justify-center">
            <!-- 左边为角色背景 -->
            <div class="w-1/2">
                <img :src="content?.background_photo" alt="角色背景" class="w-full h-full object-cover" draggable="false" />
            </div>
            <!-- 右边为角色的简介信息 -->
            <div class="w-1/2 p-4 m-4">
                <div class="flex items-center gap-4">
                    <img :src="content?.photo" alt="角色头像" class="w-10 h-10 object-cover rounded-full" />
                    <h3 class="text-xl font-bold text-center">{{ content?.name }}</h3>
                    <!-- 好友状态 -->
                    <div class="flex items-center gap-2 ml-auto">
                        <button v-if="!isFriend"
                            class="btn  btn-primary cursor-pointer rounded-full outline-none focus:ring-0"
                            @click="isFriend = true">添加好友</button>
                        <button v-else
                            class="btn  btn-error cursor-pointer rounded-full outline-none focus:ring-0 text-white"
                            @click="isFriend = false">删除好友</button>
                    </div>
                </div>
                <p class="mt-4 break-all">{{ content?.profile }}</p>
                <div class="flex items-center gap-2 mt-4">
                    <!-- <span class="text-sm text-gray-500">作者：{{ content.author_username }}</span> -->
                    <span class="text-sm text-base-content/50">创建于：{{ handleCreateTime(content?.created_at) }}</span>
                    <!-- 角色操作 -->
                    <div v-if="operator && content?.author_uuid === userStore.uuid"
                        class="dropdown dropdown-end ml-auto">
                        <div tabindex="0" role="button" class="btn btn-sm btn-circle m-1 btn-ghost">
                            <EllipsisIcon class="w-2 h-2" />
                        </div>
                        <ul tabindex="-1" class="dropdown-content bg-base-200/80 menu rounded-box z-1 w-26 shadow-sm">
                            <li>
                                <router-link :to="`/create/character/update/${content?.uuid}`"
                                    class="btn btn-sm text-primary btn-ghost cursor-pointer">
                                    编辑角色
                                </router-link>
                            </li>
                            <li>
                                <button class="btn btn-sm text-error btn-ghost  cursor-pointer"
                                    @click="deleteCharacterModalRef.showModal()">
                                    删除角色
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <hr class="my-4 border-base-content/20">
                <!-- 评论 -->
            </div>
        </div>
    </div>
    <!-- 二次确认删除 -->
    <dialog ref="deleteCharacterModalRef" id="delete-character-modal" class="modal transition-none">
        <form method="dialog" class="modal-box w-1/2 max-w-sm rounded-2xl">
            <button type="submit"
                class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2 outline-none focus:ring-0"
                aria-label="关闭">✕</button>
            <h3 class="text-lg font-bold">确认删除角色</h3>
            <p class="text-sm my-2">删除后将无法恢复</p>
            <div class="flex justify-end gap-2">
                <button type="submit" class="btn btn-sm">取消</button>
                <button type="button" class="btn btn-sm btn-error text-white" @click="deleteCharacter">删除</button>
            </div>
        </form>
    </dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import EllipsisIcon from '@/component/Icon/EllipsisIcon.vue';
import { ElMessage } from 'element-plus';
import { deleteCharacter as deleteCharacterApi } from '@/api/character';

const userStore = useUserStore();

// 二次确认删除角色
const deleteCharacterModalRef = ref(null);

// 删除角色请求
const deleteCharacter = async () => {
    try {
        const res = await deleteCharacterApi(props.content.uuid);
        console.log('handlerRemoveCharacter:', res)
        if (res?.status === 200) {
            deleteCharacterModalRef.value?.close();
            emit('remove', props.content.uuid);
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

// 该角色是否为当前用户好友
const isFriend = ref(false);

const props = defineProps({
    content: {
        type: Object,
        required: true,
    },
    operator: {
        type: Boolean,
        default: false,
    },
});

// 删除角色
const emit = defineEmits(['remove']);

// 处理时间
const handleCreateTime = (time) => {
    return new Date(time).toLocaleDateString();
}

onMounted(() => {
    console.log('content: ', props.content);
});

</script>

<style scoped></style>