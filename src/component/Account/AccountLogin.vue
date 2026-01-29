<template>
    <div class="flex flex-col items-between">
        <div class="mb-4">
            <div class="flex w-full justify-center">
                <div class="btn btn-ghost" :class="{ 'btn-active': loginType === 'email' }"
                    @click="loginType = 'email'">
                    邮箱登录</div>
                <div class="btn btn-ghost" :class="{ 'btn-active': loginType === 'code' }" @click="loginType = 'code'">
                    验证码登录</div>
            </div>
        </div>
        <form action="" class="text-center">
            <label class="input validator my-4 w-full">
                <EmailIcon />
                <input type="email" placeholder="请输入邮箱" :pattern="emailPattern" autocomplete="one-time-code" />
            </label>
            <label class="input validator my-4 w-full" v-if="loginType === 'email'">
                <PasswordIcon />
                <input type="password" placeholder="请输入密码" autocomplete="off" />
            </label>
            <div class="join w-full my-4" v-if="loginType === 'code'">
                <div class="w-full">
                    <label class="input validator join-item w-full">
                        <EmailIcon />
                        <input type="email" placeholder="请输入邮箱" :pattern="emailPattern" autocomplete="one-time-code" />
                    </label>
                </div>
                <button class="btn join-item border-none">获取验证码</button>
            </div>
            <button class="btn w-full my-4">登录</button>

        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import EmailIcon from '@/component/Icon/EmailIcon.vue';
import PasswordIcon from '@/component/Icon/PasswordIcon.vue';

const loginType = ref('email');

const emailPattern = ref('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}');


</script>

<style scoped></style>