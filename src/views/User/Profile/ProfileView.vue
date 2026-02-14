<template>
    <div class="min-h-[calc(100vh-4rem)] bg-base-200">
        <div class="max-w-lg mx-auto px-4 py-12">
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body p-4 sm:p-10">
                    <!-- 标题 -->
                    <h1 class="text-2xl font-semibold text-center mb-8 text-base-content/90">
                        编辑个人信息
                    </h1>

                    <!-- 头像区域 -->
                    <div class="flex flex-col items-center gap-4 mb-4">
                        <div class="relative group cursor-pointer" @click="triggerFileInput">
                            <div
                                class="w-28 h-28 rounded-full overflow-hidden ring-4 ring-base-200 ring-offset-2 ring-offset-base-100 shadow-lg transition-all duration-300 group-hover:ring-primary/40">
                                <img :src="avatarPreview || userStore.userPhoto" alt="头像"
                                    class="w-full h-full object-cover" />
                            </div>
                            <div
                                class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <span class="text-white text-sm font-medium">更换</span>
                            </div>
                        </div>
                        <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/jpg"
                            class="hidden" @change="handlePhotoSelect" />
                    </div>

                    <!-- 表单 -->
                    <form @submit.prevent="handleSubmit" class="space-y-4">
                        <div class="text-base-content/70 text-center text-bold text-lg">{{ userStore.email }}</div>

                        <!-- 用户名 -->
                        <fieldset class="fieldset ">
                            <legend class="fieldset-legend">用户名</legend>
                            <input type="text" class="input w-full" v-model="form.username"
                                placeholder="起一个独特的用户名吧 ~" />
                        </fieldset>

                        <!-- 个人简介 -->
                        <fieldset class="fieldset ">
                            <legend class="fieldset-legend">个人简介</legend>
                            <textarea class="textarea w-full" v-model="form.profile"
                                placeholder="写点什么介绍一下自己吧 ~"></textarea>
                            <p class="label">{{ form.profile.length }}/500</p>
                        </fieldset>

                        <!-- 提交 -->
                        <div class="pt-4">
                            <button type="submit" class="btn btn-primary w-full" :class="{ 'loading': isSubmitting }"
                                :disabled="isSubmitting">
                                {{ isSubmitting ? '' : '保存修改' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- modal -->
    <dialog ref="avatarModalRef" id="avatar-modal" class="modal">
        <div class="modal-box transition-none">
            <button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                @click="avatarModalRef.close()">X</button>
            <div ref="croppieRef" class="felx flex-col items-center justify-center my-2"></div>

            <div class="flex justify-end gap-2">
                <button class="btn btn-secondary" @click="avatarModalRef.close()">取消</button>
                <button class="btn btn-primary" @click="confirmCrop">确认裁剪</button>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/userStore";
import { updateUserProfile } from "@/api/profile";
import { ElMessage } from "element-plus";

import Croppie from "croppie";
// import "croppie/dist/croppie.css";
import "croppie/croppie.css";

const userStore = useUserStore();
const fileInputRef = ref(null);
const avatarPreview = ref("");
const photoFile = ref(null);
const isSubmitting = ref(false);
const avatarModalRef = ref(null);

const croppieRef = ref(null);
let croppie = null;

const form = ref({
    username: "",
    profile: "",
    photo: null,
});

const openModal = async (src) => {
    avatarModalRef.value.showModal();

    await nextTick(); // 等待 DOM 更新

    if (!croppie) {
        croppie = new Croppie(croppieRef.value, {
            viewport: {
                width: 200,
                height: 200,
                type: "circle",
            },
            boundary: {
                width: 300,
                height: 300,
            },
            enableOrientation: true,
            enforceBoundary: true,
        });
    }

    croppie.bind({
        url: src,
    })
};

const initForm = () => {
    form.value.username = userStore.username || "";
    form.value.profile = userStore.profile || "";
};

const triggerFileInput = () => {
    fileInputRef.value?.click();
};

const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        ElMessage.warning("请选择图片文件");
        return;
    }
    if (file.size > 4 * 1024 * 1024) {
        ElMessage.warning("图片大小不能超过 4MB");
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        openModal(reader.result);
    };
    reader.readAsDataURL(file);
};

// 确认裁剪：直接使用 blob，FormData 可直接 append，无需转换
const confirmCrop = async () => {
    const blob = await croppie.result({
        type: "blob",
        size: "viewport",
    });
    avatarPreview.value = URL.createObjectURL(blob);
    photoFile.value = blob;
    avatarModalRef.value.close();
};

const handleSubmit = async () => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    try {
        let payload;
        if (photoFile.value) {
            payload = new FormData();
            payload.append("username", form.value.username);
            payload.append("profile", form.value.profile);
            payload.append("photo", photoFile.value, "avatar.png");
        } else {
            console.log("payload not photo file");
            payload = {
                username: form.value.username,
                profile: form.value.profile,
            };
        }
        const res = await updateUserProfile(payload);
        if (res?.data?.result === "success") {
            userStore.updateUserProfile(res.data.user);
            if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value);
            photoFile.value = null;
            avatarPreview.value = "";
            ElMessage.success("保存成功");
        } else {
            ElMessage.error(res?.data?.errors || "保存失败");
        }
    } catch (err) {
        const raw = err?.response?.data?.errors || "保存失败，请重试";
        const msg = typeof raw === "object"
            ? Object.values(raw).flat().join(" ") || "保存失败，请重试"
            : raw;
        ElMessage.error(msg);
    } finally {
        isSubmitting.value = false;
    }
};

// 用户信息加载后或变化时初始化表单
watch(
    () => [userStore.username, userStore.profile],
    () => initForm(),
    { immediate: true }
);

onBeforeUnmount(() => {
    croppie?.destroy();
    if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value);
});
</script>

<style scoped></style>
