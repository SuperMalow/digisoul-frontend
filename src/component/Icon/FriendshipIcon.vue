<template>
    <!-- 交友图标：两个头像 + 中间小心形，表达“好友 / 社交” -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round"
        stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4">
        <!-- 左侧头像 -->
        <circle cx="7" cy="8" r="3" />
        <!-- 右侧头像 -->
        <circle cx="17" cy="8" r="3" />
        <!-- 左侧身体半圆 -->
        <path d="M3.5 16a4.5 4.5 0 0 1 7 0" />
        <!-- 右侧身体半圆 -->
        <path d="M13.5 16a4.5 4.5 0 0 1 7 0" />
        <!-- 中间心形，象征“好友关系” -->
        <path
            d="M9.5 18.5c0-0.9.7-1.5 1.5-1.5.5 0 1 .2 1.3.6.3-.4.8-.6 1.3-.6.8 0 1.5.6 1.5 1.5 0 .5-.2 1-.6 1.4l-2.2 2-2.2-2c-.4-.4-.6-.9-.6-1.4z" />
    </svg>
</template>

<script setup></script>