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
        <form class="text-center" @submit.prevent="handleLogin">
            <label class="input validator my-4 w-full">
                <EmailIcon />
                <input type="email" placeholder="请输入邮箱" :pattern="emailPattern" autocomplete="off" v-model="email"
                    required />
            </label>
            <label class="input validator my-4 w-full" v-if="loginType === 'email'">
                <PasswordIcon />
                <input type="password" placeholder="请输入密码" autocomplete="off" v-model="password" required />
            </label>
            <div class="join w-full my-4" v-if="loginType === 'code'">
                <div class="w-full">
                    <label class="input validator join-item w-full">
                        <EmailIcon />
                        <input type="text" placeholder="请输入验证码" autocomplete="off" v-model="verifyCode" required />
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
import { emailPasswordLogin } from '@/api/account';
import { useUserStore } from '@/stores/userStore';
import { ElMessage } from 'element-plus';

const loginType = ref('email');
const email = ref('');
const password = ref('');
const verifyCode = ref('');
// HTML input 的 pattern 会被浏览器当作 RegExp 构造参数解析
// 这里把 '-' 和 '.' 相关转义写明确，避免出现 “Invalid character in character class”
const emailPattern = '^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$';

const userStore = useUserStore();
const emit = defineEmits(['closeLogin']);

const handleLogin = async () => {
    // 判空处理
    if (!email.value || !password.value && loginType.value === 'email') {
        ElMessage.error('请输入邮箱和密码');
        return;
    }
    try {
        const result = await emailPasswordLogin({
            email: email.value,
            password: password.value
        });
        console.log('登录结果 result ===> ', result);
        if (result?.status === 200) {
            console.log('登录成功 ===> ', result);
            userStore.setAccessToken(result?.data?.access);
            userStore.setUserInfo(result?.data?.user);
            // 登录成功 关闭登录窗口
            emit('closeLogin');
        }
    } catch (error) {
        console.log('登录功能异常 error ===> ', error);
        ElMessage.error('登录失败，请重试');
        // 登录失败 清空输入框 但是邮箱不清空
        password.value = '';
        verifyCode.value = '';
    }
};
</script>
<style scoped></style>