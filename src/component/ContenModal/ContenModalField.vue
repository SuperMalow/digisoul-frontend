<template>
    <div class="modal-field">
        <div class="flex justify-center">
            <!-- 左边为角色背景 -->
            <div class="w-1/2">
                <img :src="content.background_photo" alt="角色背景" class="w-full h-full object-cover" draggable="false" />
            </div>
            <!-- 右边为角色的简介信息 -->
            <div class="w-1/2 p-4 m-4">
                <div class="flex items-center gap-4">
                    <img :src="content.photo" alt="角色头像" class="w-10 h-10 object-cover rounded-full" />
                    <h3 class="text-xl font-bold text-center">{{ content.name }}</h3>
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
                <p class="mt-4 break-all">{{ content.profile }}</p>
                <div class="flex items-center gap-2 mt-4">
                    <!-- <span class="text-sm text-gray-500">作者：{{ content.author_username }}</span> -->
                    <span class="text-sm text-gray-500">创建于：{{ handleCreateTime(content.created_at) }}</span>
                </div>
                <hr class="my-4 border-gray-700">
                <!-- 评论 -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

const isFriend = ref(false);

let props = defineProps({
    content: {
        type: Object,
        required: true,
    },
});

// 处理时间
const handleCreateTime = (time) => {
    return new Date(time).toLocaleDateString();
}

onMounted(() => {
    console.log('content: ', props.content);
});

</script>

<style scoped></style>