<template>
  <NavBar>
    <router-view />
  </NavBar>
</template>

<script setup>
import NavBar from './component/NavBar/NavBar.vue';

import { onMounted } from 'vue';

import { useUserStore } from './stores/userStore';

import { pullUserInfo } from '@/api/account';
import { useRoute } from 'vue-router';
import { useNavbarStore } from './stores/navbarStore';

const userStore = useUserStore();
const route = useRoute();
const navbarStore = useNavbarStore();

// 获取用户信息
const handlerPullUserInfo = async () => {
  try {
    const response = await pullUserInfo();
    if (response.status === 200) {
      userStore.setUserInfo(response.data.user);
    }
  } catch (error) {
    console.error(error);
  } finally {
    userStore.setHasPullUserInfo(true);
    // 如果获取用户信息失败，则打开登录窗口
    if (route.meta.isAuthorized && !userStore.isLogin) {
      navbarStore.openLoginModal();
    }
  }
};

onMounted(() => {
  handlerPullUserInfo();
});
</script>

<style scoped></style>
