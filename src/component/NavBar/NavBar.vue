<template>
    <div class="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content">
            <!-- logo -->
            <nav class="navbar w-full bg-base-100 shadow-sm">
                <div class="navbar-start">
                    <label for="my-drawer-4" aria-label="open sidebar" class="btn btn-square btn-ghost">
                        <MenuIcon />
                    </label>
                    <div class="hidden sm:block px-4">
                        <span class="text-lg font-bold">Digisoul</span>
                    </div>
                </div>
                <!-- 搜索框：大屏居中，小屏隐藏 -->
                <div class="navbar-center hidden md:flex md:w-1/2 max-w-180">
                    <div class="join w-full justify-center">
                        <input class="input join-item rounded-l-full w-4/5" placeholder="搜索你感兴趣的内容" />
                        <button class="btn join-item rounded-r-full gap-0">
                            <SearchIcon />
                            <span class="is-drawer-close:hidden">搜索</span>
                        </button>
                    </div>
                </div>
                <!-- 用户操作 -->
                <div class="navbar-end">
                    <!-- 切换日间/夜间模式 -->
                    <button class="btn btn-ghost text-md btn-circle md:mx-2" @click="toggleDarkMode">
                        <SunModeIcon v-if="isDarkMode" />
                        <DarkModeIcon v-else />
                    </button>
                    <!-- 用户操作 -->
                    <button class="btn btn-ghost text-base">
                        <router-link :to="{ name: 'login' }">登录</router-link>
                    </button>
                </div>
            </nav>

            <!-- 内容区域 -->
            <slot></slot>
        </div>

        <!-- 侧边栏 -->
        <div class="drawer-side is-drawer-close:overflow-visible bg-base-100">
            <label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"></label>
            <div class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
                <!-- 侧边栏内容 -->
                <ul class="menu w-full grow">
                    <!-- 侧边栏列表项 -->
                    <li>
                        <router-link :to="{ name: 'home' }"
                            class="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="首页">
                            <HomepageIcon />
                            <span class="is-drawer-close:hidden">首页</span>
                        </router-link>
                    </li>
                    <!-- 侧边栏列表项 -->
                    <li>
                        <router-link :to="{ name: 'friendship' }"
                            class="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="交友">
                            <FriendshipIcon />
                            <span class="is-drawer-close:hidden">交友</span>
                        </router-link>
                    </li>
                    <li>
                        <router-link :to="{ name: 'create' }"
                            class="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="创作">
                            <CreateIcon />
                            <span class="is-drawer-close:hidden">创作</span>
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import MenuIcon from '@/component/Icon/MenuIcon.vue';
import SearchIcon from '@/component/Icon/SearchIcon.vue';
import HomepageIcon from '@/component/Icon/HomepageIcon.vue';
import FriendshipIcon from '@/component/Icon/FriendshipIcon.vue';
import CreateIcon from '@/component/Icon/CreateIcon.vue';
import SunModeIcon from '@/component/Icon/SunModeIcon.vue';
import DarkModeIcon from '@/component/Icon/DarkModeIcon.vue';

import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();
const { isDarkMode } = storeToRefs(themeStore);

const toggleDarkMode = () => {
    themeStore.toggleTheme();
};

onMounted(() => {
    themeStore.initTheme();
});

</script>

<style scoped></style>