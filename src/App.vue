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
import { watch } from "vue";

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

// 实时监听用户登录状态 进行手动关闭登录窗口
watch(() => useUserStore().isLogin, (newVal) => {
  console.log('当前用户登录状态 ===> ', newVal);
  if (newVal) {
    console.log('用户已登录，要关闭登录窗口喵~');
    useNavbarStore().closeLoginModal();
  }
}, { immediate: true });

onMounted(() => {
  handlerPullUserInfo();
});
</script>

<style scoped></style>
