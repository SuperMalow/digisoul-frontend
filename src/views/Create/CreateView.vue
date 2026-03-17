<template>
    <div class="min-h-[calc(100vh-4rem)] bg-base-200">
        <div class="max-w-3xl mx-auto px-4 py-8 lg:py-10">
            <div class="card bg-base-100/95 border border-base-content/10 shadow-[0_18px_50px_rgba(10,12,18,0.22)]">
                <div class="card-body p-5 sm:p-7">
                    <form @submit.prevent="handleSubmit" class="space-y-5">
                        <h1 class="text-2xl font-semibold text-center text-base-content/90 tracking-wide">创作角色</h1>

                        <!-- 顶部圆形头像 -->
                        <div class="flex justify-center">
                            <div class="relative group cursor-pointer" @click="triggerFileInput">
                                <div
                                    class="w-28 h-28 rounded-full overflow-hidden ring-4 ring-base-200 ring-offset-2 ring-offset-base-100 shadow-lg transition-all duration-300 group-hover:ring-primary/40">
                                    <img v-if="avatarPreview" :src="avatarPreview" alt="角色头像"
                                        class="w-full h-full object-cover rounded-full" />
                                    <div v-else
                                        class="w-full h-full bg-base-200 rounded-full flex justify-center items-center">
                                        <span class="text-sm text-base">请上传头像</span>
                                    </div>
                                </div>
                                <div
                                    class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <span v-if="avatarPreview" class="text-white text-sm font-medium">更换</span>
                                    <span v-else class="text-white text-sm font-medium">
                                        <CameraIcon />
                                    </span>
                                </div>
                            </div>
                            <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/jpg"
                                class="hidden" @change="handlePhotoSelect" />
                        </div>

                        <!-- 两行双列小区域 -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <fieldset class="fieldset">
                                <legend class="fieldset-legend">名字</legend>
                                <input type="text" class="input w-full" v-model="form.name" placeholder="为角色起一个名字吧~" />
                            </fieldset>

                            <fieldset class="fieldset">
                                <legend class="fieldset-legend">性别</legend>
                                <select class="select w-full" v-model="form.gender">
                                    <option value="male">男</option>
                                    <option value="female">女</option>
                                </select>
                            </fieldset>

                            <fieldset class="fieldset">
                                <legend class="fieldset-legend ">
                                    <span>默认音色</span>
                                    <!-- 试听当前音色语音 -->
                                    <VolumeIcon class="cursor-pointer text-primary opacity-85"
                                        @click="testCurrentVoice" />
                                </legend>

                                <select class="select w-full" v-model="form.settings_voice_uuid"
                                    :disabled="isVoiceLoading">
                                    <option disabled value="">{{ isVoiceLoading ? "正在加载音色..." : "请选择音色" }}</option>
                                    <option v-for="voice in voiceOptions" :key="voice.uuid" :value="voice.uuid">
                                        {{ voice.voice_name || "未命名音色" }}（{{ voiceLanguageLabel(voice.voice_language) }}）
                                    </option>
                                </select>
                            </fieldset>

                            <fieldset class="fieldset">
                                <legend class="fieldset-legend">角色介绍</legend>
                                <input type="text" class="input w-full" v-model="form.settings_short_profile"
                                    placeholder="请使用一句话介绍你的角色吧～" />
                            </fieldset>
                        </div>

                        <!-- 中部大区域 -->
                        <div class="rounded-2xl border border-base-content/10 bg-base-100/60 p-2 sm:p-5 space-y-4">
                            <fieldset class="fieldset">
                                <legend class="fieldset-legend">角色设计</legend>
                                <textarea class="textarea w-full min-h-28" v-model="form.profile"
                                    placeholder="请设计你的角色吧 ~" rows="6"></textarea>
                            </fieldset>

                            <fieldset class="fieldset">
                                <legend class="fieldset-legend">背景图片</legend>
                                <div class="relative group cursor-pointer" @click="triggerBackgroundPhotoFileInput">
                                    <div
                                        class="w-full h-32 rounded-xl overflow-hidden ring-2 ring-base-200 shadow-lg transition-all duration-300 group-hover:ring-primary/40">
                                        <img v-if="backgroundPhotoPreview" :src="backgroundPhotoPreview" alt="背景图片"
                                            class="w-full h-full object-cover rounded-xl" />
                                        <div v-else
                                            class="w-full h-full bg-base-200 rounded-xl flex justify-center items-center gap-2">
                                            <span class="text-sm text-base">请上传背景图片</span>
                                        </div>
                                    </div>
                                    <div
                                        class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <span v-if="backgroundPhotoPreview"
                                            class="text-white text-sm font-medium">更换</span>
                                        <span v-else class="text-white text-sm font-medium">
                                            <CameraIcon />
                                        </span>
                                    </div>
                                </div>
                                <input ref="backgroundPhotoFileInputRef" type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg" class="hidden"
                                    @change="handleBackgroundPhotoSelect" />
                            </fieldset>
                        </div>

                        <!-- 底部居中按钮 -->
                        <div class="pt-2 flex justify-center">
                            <button type="submit" class="btn btn-primary min-w-[220px] w-full max-w-[320px]"
                                :class="{ 'loading': isSubmitting }" :disabled="isSubmitting">
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
import { ref, nextTick, onMounted, onBeforeUnmount } from "vue";
import { createCharacter, getCharacterVoiceList } from "@/api/character";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import VolumeIcon from "@/component/Icon/VolumeIcon.vue";

const router = useRouter();

import CameraIcon from "@/component/Icon/CameraIcon.vue";

import Croppie from "croppie";
// import "croppie/dist/croppie.css";
import "croppie/croppie.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";
const audioUrl = (path) => (path ? BASE_URL + path.replace(/^\//, "") : "");

const fileInputRef = ref(null);
const backgroundPhotoFileInputRef = ref(null);

const avatarPreview = ref("");
const backgroundPhotoPreview = ref("");

const photoFile = ref(null);
const backgroundPhotoFile = ref(null);

const isSubmitting = ref(false);
const isVoiceLoading = ref(false);
const voiceOptions = ref([]);

// 音色语言映射
const voiceLanguageMap = { zh: "中文", en: "英文", ja: "日文", ko: "韩文" };
const voiceLanguageLabel = (lang) => voiceLanguageMap[lang] || lang;

const avatarModalRef = ref(null);
const backgroundPhotoModalRef = ref(null);

const croppieRef = ref(null);
const backgroundPhotoCroppieRef = ref(null);
let croppie = null;
let backgroundPhotoCroppie = null;
let currentAudio = null;

const form = ref({
    name: "",
    gender: "female",
    profile: "",
    photo: null,
    background_photo: null,
    settings_is_public: true,
    settings_short_profile: "",
    settings_voice_uuid: "",
});

const loadVoiceOptions = async () => {
    isVoiceLoading.value = true;
    try {
        const res = await getCharacterVoiceList();
        if (res?.data?.result === "success") {
            voiceOptions.value = res.data.character_voices || [];
            if (!form.value.settings_voice_uuid && voiceOptions.value.length > 0) {
                form.value.settings_voice_uuid = voiceOptions.value[0].uuid;
            }
        } else {
            ElMessage.error(res?.data?.errors || "获取音色列表失败");
        }
    } catch (err) {
        const raw = err?.response?.data?.errors || "获取音色列表失败";
        const msg = typeof raw === "object"
            ? Object.values(raw).flat().join(" ") || "获取音色列表失败"
            : raw;
        ElMessage.error(msg);
    } finally {
        isVoiceLoading.value = false;
    }
};

// 试听当前音色语音
const testCurrentVoice = () => {
    if (isVoiceLoading.value) {
        ElMessage.warning("音色列表正在加载中，请稍后");
        return;
    }
    if (!form.value.settings_voice_uuid) {
        ElMessage.warning("请先选择一个音色");
        return;
    }
    const voice = voiceOptions.value.find(
        (item) => item.uuid === form.value.settings_voice_uuid,
    );
    if (!voice) {
        ElMessage.error("未找到对应音色，请重新选择");
        return;
    }
    if (!voice.preview_voice) {
        ElMessage.warning("当前音色没有配置试听语音");
        return;
    }

    const url = audioUrl(voice.preview_voice);

    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        currentAudio = new Audio(url);
        currentAudio.play().catch(() => {
            ElMessage.error("播放试听语音失败，请稍后重试");
        });
    } catch (e) {
        console.error(e);
        ElMessage.error("播放试听语音失败，请稍后重试");
    }
};

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
        payload.append("gender", form.value.gender);
        payload.append("profile", form.value.profile);
        payload.append("settings_is_public", String(form.value.settings_is_public));
        payload.append("settings_short_profile", form.value.settings_short_profile || "");
        payload.append("settings_voice_uuid", form.value.settings_voice_uuid || "");
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

onMounted(() => {
    loadVoiceOptions();
});

onBeforeUnmount(() => {
    croppie?.destroy();
    backgroundPhotoCroppie?.destroy();
    if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value);
    if (backgroundPhotoPreview.value) URL.revokeObjectURL(backgroundPhotoPreview.value);
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
});
</script>

<style scoped></style>
