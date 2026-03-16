<template>
    <div class="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content flex flex-col min-h-dvh">
            <!-- logo -->
            <nav class="navbar w-full bg-base-100 shadow-sm shrink-0">
                <div class="navbar-start">
                    <label for="my-drawer-4" aria-label="open sidebar" class="btn btn-square btn-ghost">
                        <MenuIcon />
                    </label>
                    <div class="hidden sm:block px-4">
                        <span class="text-lg font-bold">DIGISOUL</span>
                    </div>
                </div>
                <!-- 搜索框：大屏居中，小屏隐藏 -->
                <form @submit.prevent="handlerSearch" class="navbar-center hidden md:flex md:w-1/2 max-w-180">
                    <div class="join w-full justify-center">
                        <input class="input join-item rounded-l-full w-4/5" placeholder="搜索你感兴趣的内容"
                            v-model="searchKeyword" />
                        <button class="btn join-item rounded-r-full gap-0" @click="handlerSearch">
                            <SearchIcon />
                            <span class="is-drawer-close:hidden">搜索</span>
                        </button>
                    </div>
                </form>
                <!-- 用户操作 -->
                <div class="navbar-end">
                    <!-- 创作按钮 -->
                    <!-- <button class="btn btn-sm text-base font-bold">
                        <CreateIcon />
                        <router-link :to="{ name: 'create' }">
                            创建
                        </router-link>
                    </button> -->
                    <!-- 切换日间/夜间模式 -->
                    <button class="btn btn-sm btn-ghost text-md btn-circle mx-2" @click="toggleDarkMode">
                        <SunModeIcon v-if="isDarkMode" />
                        <DarkModeIcon v-else />
                    </button>
                    <!-- 用户操作 -->
                    <button class="btn text-base" @click="loginModalRef.openLoginModal()" v-if="!isLogin">
                        登录
                    </button>
                    <UserMenu v-if="isLogin" />
                </div>
            </nav>

            <!-- 内容区域：占满剩余高度，避免整页出现滚动条 -->
            <div class="flex-1 min-h-0 overflow-hidden flex flex-col">
                <slot></slot>
            </div>
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
                            :class="{ 'bg-primary text-primary-content': currentRoute === 'home' }"
                            class="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="首页">
                            <HomepageIcon />
                            <span class="is-drawer-close:hidden">首页</span>
                        </router-link>
                    </li>
                    <!-- 侧边栏列表项 -->
                    <li>
                        <router-link :to="{ name: 'friendship' }"
                            :class="{ 'bg-primary text-primary-content': currentRoute === 'friendship' }"
                            class="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="好友">
                            <FriendshipIcon />
                            <span class="is-drawer-close:hidden">好友</span>
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
    <Modal ref="loginModalRef" />
</template>

<script setup>
import MenuIcon from '@/component/Icon/MenuIcon.vue';
import SearchIcon from '@/component/Icon/SearchIcon.vue';
import HomepageIcon from '@/component/Icon/HomepageIcon.vue';
import FriendshipIcon from '@/component/Icon/FriendshipIcon.vue';
import CreateIcon from '@/component/Icon/CreateIcon.vue';
import SunModeIcon from '@/component/Icon/SunModeIcon.vue';
import DarkModeIcon from '@/component/Icon/DarkModeIcon.vue';
import UserMenu from './UserMenu.vue';

import { useRouter } from 'vue-router';
const router = useRouter();

import { onMounted, computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/themeStore';
import { useRoute } from 'vue-router';

import Modal from '@/component/Account/AccountModal.vue';

import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const { isLogin } = storeToRefs(userStore);

const loginModalRef = ref(null);

const route = useRoute();

const themeStore = useThemeStore();
const { isDarkMode } = storeToRefs(themeStore);

const currentRoute = computed(() => route.name);

const toggleDarkMode = () => {
    themeStore.toggleTheme();
};

// 搜索词
const searchKeyword = ref('');

// 搜索
const handlerSearch = () => {
    router.push({ name: 'home', query: { q: searchKeyword.value.trim() } });
};

// 监听路由参数与搜索词直接的绑定
watch(() => route.query.q, (newVal) => {
    searchKeyword.value = newVal;
});

onMounted(() => {
    themeStore.initTheme();
});

</script>

<style scoped></style>