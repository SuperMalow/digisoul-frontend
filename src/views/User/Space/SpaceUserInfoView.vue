<template>
    <div class="flex justify-center mt-12 gap-8">
        <!-- 头像区域 -->
        <div>
            <div class="w-36 h-36 rounded-full">
                <img :src="handleImageUrl(userProfile?.photo)" alt="用户头像" class="w-36 h-36 rounded-full">
            </div>
        </div>
        <!-- 用户信息区域 -->
        <div class="flex flex-col justify-center w-36 h-36 gap-2">
            <div class="text-2xl font-bold line-clamp-1 break-all">{{ userProfile?.username }}</div>
            <div class="text-sm text-gray-500 mt-1">ID:{{ userProfile?.uuid }}</div>
            <div class="text-sm text-gray-500 h-20 mt-2 line-clamp-4 break-all">{{ userProfile?.profile }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getUserInfoByUuid } from '@/api/account';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

const route = useRoute();
const user_id = route.params.user_id;

const userProfile = ref(null);

// 处理图片URL格式
const handleImageUrl = (url) => {
    if (url) {
        return BASE_URL + url;
    }
    return null;
};

// 获取用户信息
const handlerGetUserInfoByUuid = async () => {
    try {
        const response = await getUserInfoByUuid(user_id);
        if (response.status === 200) {
            userProfile.value = response?.data?.user ?? null;
            console.log('SpaceUserInfoView 获取到的用户信息: ', userProfile.value);
        }
    } catch (error) {
        console.error(error);
    }
};

onMounted(async () => {
    console.log('user_id: ', user_id);
    await handlerGetUserInfoByUuid();
});
</script>