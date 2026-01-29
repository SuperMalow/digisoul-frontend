<template>
    <div class="flex flex-col justify-between items-center h-full">
        <p class="text-base font-bold mb-4">扫码登录</p>
        <img src="/logo.jpg" alt="二维码" class="w-full h-full max-w-48 max-h-48 rounded-md shadow-md">
        <span class="text-sm text-gray-500 my-4">
            请使用<span class="text-green-300">&nbsp;微信&nbsp;</span>扫描二维码登录
        </span>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const qrCode = ref('');

onMounted(() => {
    qrCode.value = '/logo.jpg';
});
</script>

<style scoped></style>