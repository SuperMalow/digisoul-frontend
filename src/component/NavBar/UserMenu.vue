<template>
    <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-10 rounded-full">
                <img :src="userStore.userPhoto" alt="用户头像" class="w-10 h-10 rounded-full">
            </div>
        </div>
        <ul tabindex="-1" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-4 w-52 p-2 shadow">
            <li>
                <router-link :to="{ name: 'profile' }" class="text-sm hover:cursor-pointer" @click="closeMenu">
                    <div class="avatar">
                        <div class="w-10 rounded-full">
                            <img :src="userStore.userPhoto" alt="用户头像" />
                        </div>
                    </div>
                    <span class="text-base font-bold truncate">{{ userStore.userName }}</span>
                </router-link>
            </li>
            <li>
                <router-link :to="{ name: 'space', params: { user_id: userStore.uuid } }"
                    class="text-sm hover:cursor-pointer mt-2" @click="closeMenu">
                    <UserSpaceIcon />个人空间
                </router-link>
            </li>
            <li>
                <router-link :to="{ name: 'profile' }" class="text-sm hover:cursor-pointer mt-2" @click="closeMenu">
                    <UserProfileIcon />编辑信息
                </router-link>
            </li>
            <li></li>
            <li>
                <a class="text-sm text-error hover:cursor-pointer mt-2" @click="handleLogout">
                    <UserLogoutIcon />退出登录
                </a>
            </li>
        </ul>
    </div>
</template>

<script setup>
import UserProfileIcon from '@/component/Icon/UserProfileIcon.vue';
import UserLogoutIcon from '@/component/Icon/UserLogoutIcon.vue';
import UserSpaceIcon from '@/component/Icon/UserSpaceIcon.vue';
import { useUserStore } from '@/stores/userStore';
import { ElMessage } from 'element-plus';

import { userLogout } from '@/api/account';

const userStore = useUserStore();

const closeMenu = () => {
    document.querySelector('.dropdown-content').classList.remove('show');
};

const handleLogout = async () => {
    try {
        const response = await userLogout();
        if (response.status === 200) {
            console.log(response);
            ElMessage.success('退出登录成功喵~');
        }
    } catch (error) {
        console.error(error);
    } finally {
        userStore.logout();
        closeMenu();
    }
};
</script>

<style scoped></style>