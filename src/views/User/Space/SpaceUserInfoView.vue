<template>
    <div class="flex justify-center mt-12 gap-8">
        <!-- 头像区域 -->
        <div>
            <div class="w-36 h-36 rounded-full">
                <img :src="handleImageUrl(userProfile?.photo)" alt="用户头像" class="w-36 h-36 rounded-full">
            </div>
        </div>
        <!-- 用户信息区域 -->
        <div class="flex flex-col justify-center w-64 h-36 gap-2">
            <div class="text-2xl font-bold line-clamp-1 break-all">{{ userProfile?.username }}</div>
            <div class="text-sm text-gray-500 mt-1">ID: {{ userProfile?.uuid?.toUpperCase() }}</div>
            <div class="text-sm text-gray-500 h-20 mt-2 line-clamp-4 break-all">{{ userProfile?.profile }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getUserInfoByUuid } from '@/api/account';
import { joinUrl, MEDIA_BASE_URL } from '@/utils/url';

const route = useRoute();
const user_id = ref(route.params.user_id);

const userProfile = ref(null);

const reset = () => {
    userProfile.value = null;

    handlerGetUserInfoByUuid();
};

// 监听路由参数与搜索词直接的绑定
watch(() => route.params.user_id, (newVal) => {
    console.log('用户ID: ', newVal);
    user_id.value = newVal ?? null;
    reset();
});

// 处理图片URL格式
const handleImageUrl = (url) => {
    if (url) {
        return joinUrl(MEDIA_BASE_URL, url);
    }
    return null;
};

// 获取用户信息
const handlerGetUserInfoByUuid = async () => {
    try {
        const response = await getUserInfoByUuid(user_id.value);
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