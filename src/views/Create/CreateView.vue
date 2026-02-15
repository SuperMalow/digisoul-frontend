<template>
    <div class="min-h-[calc(100vh-4rem)] bg-base-200">
        <div class="max-w-lg mx-auto px-4 py-8">
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body p-4 sm:p-6">
                    <!-- 标题 -->
                    <h1 class="text-2xl font-semibold text-center mb-4 text-base-content/90">
                        创作角色
                    </h1>

                    <!-- 头像区域 -->
                    <div class="flex flex-col items-center gap-4 mb-3">
                        <div class="relative group cursor-pointer" @click="triggerFileInput">
                            <div
                                class="w-28 h-28 rounded-full overflow-hidden ring-4 ring-base-200 ring-offset-2 ring-offset-base-100 shadow-lg transition-all duration-300 group-hover:ring-primary/40 ">
                                <img v-if="avatarPreview" :src="avatarPreview" alt="角色头像"
                                    class="w-full h-full object-cover rounded-full" />
                                <div v-else
                                    class="w-full h-full bg-base-200 rounded-full flex justify-center items-center">
                                    <span class="text-sm text-base">请上传头像</span>
                                </div>
                            </div>
                            <div
                                class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                                <span v-if="avatarPreview" class="text-white text-sm font-medium">更换</span>
                                <span v-else class="text-white text-sm font-medium">
                                    <CameraIcon />
                                </span>
                            </div>
                        </div>
                        <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/jpg"
                            class="hidden" @change="handlePhotoSelect" />
                    </div>

                    <!-- 表单 -->
                    <form @submit.prevent="handleSubmit" class="space-y-4">
                        <!-- 名字 -->
                        <fieldset class="fieldset ">
                            <legend class="fieldset-legend">名字</legend>
                            <input type="text" class="input w-full" v-model="form.name" placeholder="为角色起一个名字吧 ~" />
                        </fieldset>

                        <!-- 介绍 -->
                        <fieldset class="fieldset ">
                            <legend class="fieldset-legend">介绍</legend>
                            <textarea class="textarea w-full" v-model="form.profile"
                                placeholder="请介绍一下角色吧 ~"></textarea>
                        </fieldset>

                        <!-- 背景图片 -->
                        <fieldset class="fieldset ">
                            <legend class="fieldset-legend">背景图片</legend>
                            <div class="relative group cursor-pointer" @click="triggerBackgroundPhotoFileInput">
                                <div
                                    class="w-full h-28 rounded-lg overflow-hidden ring-4 ring-base-200 ring-offset-2 ring-offset-base-100 shadow-lg transition-all duration-300 group-hover:ring-primary/40 ">
                                    <img v-if="backgroundPhotoPreview" :src="backgroundPhotoPreview" alt="背景图片"
                                        class="w-full h-full object-cover rounded-lg" />
                                    <div v-else
                                        class="w-full h-full bg-base-200 rounded-lg flex justify-center items-center gap-2">
                                        <span class="text-sm text-base">请上传背景图片</span>
                                    </div>
                                </div>
                                <div
                                    class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                    <span v-if="backgroundPhotoPreview" class="text-white text-sm font-medium">更换</span>
                                    <span v-else class="text-white text-sm font-medium">
                                        <CameraIcon />
                                    </span>
                                </div>
                            </div>
                            <input ref="backgroundPhotoFileInputRef" type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg" class="hidden"
                                @change="handleBackgroundPhotoSelect" />
                        </fieldset>

                        <!-- 提交 -->
                        <div class="pt-4">
                            <button type="submit" class="btn btn-primary w-full" :class="{ 'loading': isSubmitting }"
                                :disabled="isSubmitting">
                                {{ isSubmitting ? '' : '创建角色' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- 头像裁剪modal -->
    <dialog ref="avatarModalRef" id="avatar-modal" class="modal">
        <div class="modal-box transition-none">
            <button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                @click="avatarModalRef.close()">X</button>
            <div ref="croppieRef" class="felx flex-col items-center justify-center my-2"></div>

            <div class="flex justify-end gap-2">
                <button class="btn btn-neutral" @click="avatarModalRef.close()">取消</button>
                <button class="btn btn-base" @click="confirmCrop">确认裁剪</button>
            </div>
        </div>
    </dialog>

    <!-- 背景图片裁剪modal -->
    <dialog ref="backgroundPhotoModalRef" id="background-photo-modal" class="modal">
        <div class="modal-box transition-none max-w-2xl">
            <button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                @click="backgroundPhotoModalRef.close()">X</button>
            <div ref="backgroundPhotoCroppieRef" class="felx flex-col items-center justify-center my-2"></div>

            <div class="flex justify-end gap-2">
                <button class="btn btn-neutral" @click="backgroundPhotoModalRef.close()">取消</button>
                <button class="btn btn-base" @click="confirmBackgroundPhotoCrop">确认裁剪</button>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import { createCharacter, updateCharacter } from "@/api/character";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
const router = useRouter();

import CameraIcon from "@/component/Icon/CameraIcon.vue";

import Croppie from "croppie";
// import "croppie/dist/croppie.css";
import "croppie/croppie.css";

const fileInputRef = ref(null);
const backgroundPhotoFileInputRef = ref(null);

const avatarPreview = ref("");
const backgroundPhotoPreview = ref("");

const photoFile = ref(null);
const backgroundPhotoFile = ref(null);

const isSubmitting = ref(false);

const avatarModalRef = ref(null);
const backgroundPhotoModalRef = ref(null);

const croppieRef = ref(null);
const backgroundPhotoCroppieRef = ref(null);
let croppie = null;
let backgroundPhotoCroppie = null;

const form = ref({
    name: "",
    profile: "",
    photo: null,
    background_photo: null,
});

// 打开背景图片裁剪modal
const openBackgroundPhotoModal = async (src) => {
    backgroundPhotoModalRef.value.showModal();

    await nextTick(); // 等待 DOM 更新

    if (!backgroundPhotoCroppie) {
        backgroundPhotoCroppie = new Croppie(backgroundPhotoCroppieRef.value, {
            viewport: {
                width: 300,
                height: 400,
                type: "square",
            },
            boundary: {
                width: 500,
                height: 500,
            },
            enableOrientation: true,
            enforceBoundary: true,
        });
    }

    backgroundPhotoCroppie.bind({
        url: src,
    })
};

// 打开头像裁剪modal
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

const triggerFileInput = () => {
    fileInputRef.value?.click();
};

const triggerBackgroundPhotoFileInput = () => {
    backgroundPhotoFileInputRef.value?.click();
};

// 上传头像
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

// 上传背景
const handleBackgroundPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        ElMessage.warning("请选择图片文件");
        return;
    }
    if (file.size > 8 * 1024 * 1024) {
        ElMessage.warning("背景图片大小不能超过 8MB");
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        openBackgroundPhotoModal(reader.result);
    };
    reader.readAsDataURL(file);
};

// 裁剪头像
const confirmCrop = async () => {
    const blob = await croppie.result({
        type: "blob",
        size: "viewport",
    });
    avatarPreview.value = URL.createObjectURL(blob);
    photoFile.value = blob;
    avatarModalRef.value.close();
};

// 裁剪背景
const confirmBackgroundPhotoCrop = async () => {
    const blob = await backgroundPhotoCroppie.result({
        type: "blob",
        size: "viewport",
    });
    backgroundPhotoPreview.value = URL.createObjectURL(blob);
    backgroundPhotoFile.value = blob;
    backgroundPhotoModalRef.value.close();
};

const handleSubmit = async () => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    try {
        let payload = new FormData();
        if (photoFile.value) {
            payload.append("photo", photoFile.value, "avatar.png");
        }
        if (backgroundPhotoFile.value) {
            payload.append("background_photo", backgroundPhotoFile.value, "background_photo.png");
        }
        payload.append("name", form.value.name);
        payload.append("profile", form.value.profile);
        const res = await createCharacter(payload);
        if (res?.data?.result === "success") {
            if (photoFile.value) {
                if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value);
                photoFile.value = null;
                avatarPreview.value = "";
            }
            if (backgroundPhotoFile.value) {
                if (backgroundPhotoPreview.value) URL.revokeObjectURL(backgroundPhotoPreview.value);
                backgroundPhotoFile.value = null;
                backgroundPhotoPreview.value = "";
            }
            ElMessage.success("创建成功");
            // 到时候创建完成之后跳转到角色详情页，现在先跳转到首页
            router.push(`/`);
        } else {
            console.log(res);
            ElMessage.error(res?.data?.errors || "创建失败");
        }
    } catch (err) {
        const raw = err?.response?.data?.errors || "创建失败，请重试";
        const msg = typeof raw === "object"
            ? Object.values(raw).flat().join(" ") || "创建失败，请重试"
            : raw;
        ElMessage.error(msg);
    } finally {
        isSubmitting.value = false;
    }
};

onBeforeUnmount(() => {
    croppie?.destroy();
    backgroundPhotoCroppie?.destroy();
    if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value);
    if (backgroundPhotoPreview.value) URL.revokeObjectURL(backgroundPhotoPreview.value);
});
</script>

<style scoped></style>
