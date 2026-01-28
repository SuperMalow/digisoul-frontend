<template>
    <div class="flex justify-center items-center mt-20">
        <div class="text-center">
            <h1 class="text-4xl font-bold mx-2">糟糕，内容找不到啦！</h1>
            <button class="btn btn-ghost mt-4" @click="goHome">返回首页</button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    router.push('/');
};
</script>

<style scoped></style>