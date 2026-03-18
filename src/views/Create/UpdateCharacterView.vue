<template>
    <div class="min-h-[calc(100vh-4rem)] bg-base-200">
        <div class="max-w-2xl mx-auto px-4 py-8">
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body p-4 sm:p-6">
                    <!-- 返回上个操作 -->
                    <button @click="router.back()" class="absolute top-2 left-2 btn btn-sm btn-ghost">
                        返回
                    </button>

                    <!-- 标题 -->
                    <h1 class="text-2xl font-semibold text-center mb-4 text-base-content/90">
                        编辑角色
                    </h1>

                    <!-- 头像区域 -->
                    <div class="flex flex-col items-center gap-4 mb-3">
                        <div class="relative group cursor-pointer" @click="triggerAvatarPhotoFileInput">
                            <div
                                class="w-28 h-28 rounded-full overflow-hidden ring-4 ring-base-200 ring-offset-2 ring-offset-base-100 shadow-lg transition-all duration-300 group-hover:ring-primary/40 ">
                                <img v-if="character.photo" :src="character.photo" alt="角色头像"
                                    class="w-full h-full object-cover rounded-full" />
                                <div v-else
                                    class="w-full h-full bg-base-200 rounded-full flex justify-center items-center">
                                    <span class="text-sm text-base">请上传头像</span>
                                </div>
                            </div>
                            <div
                                class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                                <span v-if="character.photo" class="text-white text-sm font-medium">更换</span>
                                <span v-else class="text-white text-sm font-medium">
                                    <CameraIcon />
                                </span>
                            </div>
                        </div>
                        <input ref="avatarFileInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/jpg"
                            class="hidden" @change="handleAvatarPhotoSelect" />
                    </div>

                    <!-- 表单 -->
                    <form @submit.prevent="handleSubmit" class="space-y-4">
                        <!-- 名字 -->
                        <fieldset class="fieldset ">
                            <legend class="fieldset-legend">名字</legend>
                            <input type="text" class="input w-full" v-model="character.name"
                                placeholder="为角色起一个名字吧 ~" />
                        </fieldset>

                        <!-- 音色选择 -->
                        <fieldset v-if="settingsLoaded && voiceList.length" class="fieldset">
                            <legend class="fieldset-legend">
                                <span>音色</span>
                                <VolumeIcon class="cursor-pointer text-primary opacity-85 ml-1"
                                    @click="testCurrentVoice" />
                            </legend>
                            <select class="select w-full" v-model="settings.voice_uuid">
                                <option value="" disabled>请选择音色</option>
                                <option v-for="voice in voiceList" :key="voice.uuid" :value="voice.uuid">
                                    {{ voice.voice_name }}（{{ voiceLanguageLabel(voice.voice_language) }}）
                                </option>
                            </select>
                        </fieldset>

                        <!-- 性别 -->
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">性别</legend>
                            <div class="flex gap-6">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="gender" value="male" v-model="character.gender"
                                        class="radio radio-primary radio-sm" />
                                    <span class="text-sm">男</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="gender" value="female" v-model="character.gender"
                                        class="radio radio-primary radio-sm" />
                                    <span class="text-sm">女</span>
                                </label>
                            </div>
                        </fieldset>

                        <!-- 公开状态 -->
                        <fieldset v-if="settingsLoaded" class="fieldset">
                            <legend class="fieldset-legend">公开状态</legend>
                            <div class="flex items-center gap-3">
                                <input type="checkbox" class="toggle toggle-primary toggle-sm"
                                    v-model="settings.is_public" />
                                <span class="text-sm text-base-content/70">
                                    {{ settings.is_public ? '公开（所有人可见）' : '私密（仅自己可见）' }}
                                </span>
                            </div>
                        </fieldset>

                        <!-- 角色介绍 -->
                        <fieldset v-if="settingsLoaded" class="fieldset">
                            <legend class="fieldset-legend">
                                角色介绍
                                <span class="text-xs text-base-content/40 font-normal ml-1">
                                    {{ (settings.short_profile || '').length }}/100
                                </span>
                            </legend>
                            <input type="text" class="input w-full" v-model="settings.short_profile"
                                placeholder="一句话介绍角色 ~" maxlength="100" />
                        </fieldset>

                        <!-- 角色设计 -->
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend w-full flex items-center justify-between gap-2">
                                <span>角色设计</span>
                                <div class="tooltip" data-tip="可以简单描述角色性格，让 AI 更好的理解角色">
                                    <button type="button" class="btn btn-xs btn-outline btn-primary"
                                        :class="{ 'loading': isOptimizingProfile }"
                                        :disabled="isSubmitting || isOptimizingProfile || !(character.profile || '').trim()"
                                        @click="handleOptimizeProfile">
                                        {{ isOptimizingProfile ? '' : 'AI 润色' }}
                                    </button>
                                </div>
                            </legend>
                            <textarea id="textarea-profile" class="textarea w-full" v-model="character.profile"
                                placeholder="请介绍一下角色吧 ~" rows="5" maxlength="5000"></textarea>
                            <span class="text-xs text-base-content/40 font-normal text-right">
                                {{ (character.profile || '').length }}/5000
                            </span>
                        </fieldset>

                        <!-- 背景图片 -->
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend w-full flex items-center justify-between gap-2">
                                <span>背景图片</span>
                                <div class="tooltip" data-tip="点击生成背景图片">
                                    <button type="button" class="btn btn-xs btn-outline btn-primary"
                                        :class="{ 'loading': isGeneratingBackgroundPhoto }"
                                        :disabled="isSubmitting || isGeneratingBackgroundPhoto || !(character.profile || '').trim()"
                                        @click="handleGenerateBackgroundPhoto">
                                        {{ isGeneratingBackgroundPhoto ? '' : 'AI 生成' }}
                                    </button>
                                </div>
                            </legend>
                            <div class="relative group cursor-pointer" @click="triggerBackgroundPhotoFileInput">
                                <div
                                    class="w-full h-28 rounded-lg overflow-hidden ring-4 ring-base-200 ring-offset-2 ring-offset-base-100 shadow-lg transition-all duration-300 group-hover:ring-primary/40 ">
                                    <!-- 背景图片应该显示完整，不要裁剪 object-contain -->
                                    <img v-if="character.background_photo" :src="character.background_photo" alt="背景图片"
                                        class="w-full h-full object-contain rounded-lg" />
                                    <div v-else
                                        class="w-full h-full bg-base-200 rounded-lg flex justify-center items-center gap-2">
                                        <span class="text-sm text-base">请上传背景图片</span>
                                    </div>
                                </div>
                                <div
                                    class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                    <span v-if="character.background_photo"
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

                        <!-- 提交 -->
                        <div class="pt-4">
                            <button type="submit" class="btn btn-primary w-full" :class="{ 'loading': isSubmitting }"
                                :disabled="isSubmitting || isOptimizingProfile || isGeneratingBackgroundPhoto || isSubmittingImageTask || isPollingImageTask">
                                {{ isSubmitting ? '' : '更新角色' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- 裁剪头像 modal -->
    <dialog ref="avatarPhotoModalRef" id="avatar-photo-modal" class="modal">
        <div class="modal-box transition-none">
            <button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                @click="avatarPhotoModalRef.close()">X</button>
            <div ref="avatarCroppieRef" class="felx flex-col items-center justify-center my-2"></div>
            <div class="flex justify-end gap-2">
                <button class="btn btn-neutral" @click="avatarPhotoModalRef.close()">取消</button>
                <button class="btn btn-base" @click="confirmAvatarPhotoCrop">确认裁剪</button>
            </div>
        </div>
    </dialog>

    <!-- 裁剪背景图片 modal -->
    <dialog ref="backgroundPhotoModalRef" id="background-photo-modal" class="modal">
        <div class="modal-box transition-none">
            <button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                @click="backgroundPhotoModalRef.close()">X</button>
            <div ref="backgroundPhotoCroppieRef" class="felx flex-col items-center justify-center my-2"></div>
            <div class="flex justify-end gap-2">
                <button class="btn btn-neutral" @click="backgroundPhotoModalRef.close()">取消</button>
                <button class="btn btn-base" @click="confirmBackgroundPhotoCrop">确认裁剪</button>
            </div>
        </div>
    </dialog>

    <!-- AI 生成背景图 -->
    <dialog ref="generateBackgroundModalRef" id="generate-background-modal" class="modal" @close="stopGenerateFlow">
        <div class="modal-box max-w-3xl">
            <button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                @click="closeGenerateBackgroundModal">x</button>
            <h3 class="font-bold text-lg mb-4">AI 生成背景图</h3>

            <fieldset class="fieldset mb-3">
                <legend class="fieldset-legend">提示词（可编辑）</legend>
                <textarea id="textarea-generated-image-prompt" class="textarea w-full min-h-36"
                    v-model="generatedImagePrompt" placeholder="正在生成提示词..." />
            </fieldset>

            <div class="flex flex-wrap gap-2 mb-4">
                <button type="button" class="btn btn-sm btn-outline" :class="{ 'loading': isGeneratingBackgroundPhoto }"
                    :disabled="isGeneratingBackgroundPhoto || isSubmittingImageTask"
                    @click="startGenerateImagePrompt()">
                    {{ isGeneratingBackgroundPhoto ? "" : "重新生成提示词" }}
                </button>
                <button type="button" class="btn btn-sm btn-primary"
                    :class="{ 'loading': isSubmittingImageTask || isPollingImageTask }"
                    :disabled="!generatedImagePrompt.trim() || isSubmittingImageTask || isPollingImageTask"
                    @click="submitGenerateImageTask()">
                    {{ (isSubmittingImageTask || isPollingImageTask) ? "" : "开始生成图片" }}
                </button>
            </div>

            <div v-if="imageTaskStatus" class="text-sm text-base-content/70 mb-2">
                当前状态：{{ imageTaskStatus }}
            </div>

            <div class="tooltip mx-auto flex justify-center items-center" data-tip="通过鼠标右键可以图片保存到本地">
                <div v-if="generatedImageUrl" class="space-y-2">
                    <div
                        class="w-full h-72 sm:h-80 rounded-lg border border-base-300 bg-base-200/40 overflow-hidden flex items-center justify-center">
                        <img :src="generatedImageUrl" alt="AI 生成背景图" class="max-w-full max-h-full object-contain" />
                    </div>
                </div>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import CameraIcon from "@/component/Icon/CameraIcon.vue";
import VolumeIcon from "@/component/Icon/VolumeIcon.vue";

import {
    updateCharacter,
    getCharacter,
    getCharacterSettings,
    updateCharacterSettings,
    getCharacterVoiceList,
    characterProfileOptimization,
    generateImagePrompt,
    generateImageTask,
    getGenerateImageTaskStatus,
} from "@/api/character";

import { useRouter } from "vue-router";
const router = useRouter();

const route = useRoute();
const uuid = route.params.uuid;

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";
const imageUrl = (path) => path ? BASE_URL + path.replace(/^\//, "") : "";
const audioUrl = (path) => path ? BASE_URL + path.replace(/^\//, "") : "";

import Croppie from "croppie";
// import "croppie/dist/croppie.css";
import "croppie/croppie.css";

// 当前试听音频
let currentAudio = null;

// 图片文件输入框
const avatarFileInputRef = ref(null);
const backgroundPhotoFileInputRef = ref(null);

// 图片文件
const avatarPhotoFile = ref(null);
const backgroundPhotoFile = ref(null);

// 图片裁剪modal
const avatarPhotoModalRef = ref(null);
const backgroundPhotoModalRef = ref(null);
const generateBackgroundModalRef = ref(null);

// 图片裁剪 ref
const avatarCroppieRef = ref(null);
const backgroundPhotoCroppieRef = ref(null);

// 图片裁剪对象
let avatarCroppie = null;
let backgroundPhotoCroppie = null;

// 角色信息
const character = ref({
    name: "",
    gender: "male",
    profile: "",
    photo: "",
    background_photo: "",
});

// 角色设置信息
const settings = ref({
    uuid: "",
    is_public: true,
    short_profile: "",
    voice_uuid: "",
});
const settingsLoaded = ref(false);
const isOptimizingProfile = ref(false);
const isGeneratingBackgroundPhoto = ref(false);
const isSubmittingImageTask = ref(false);
const isPollingImageTask = ref(false);
const imageTaskStatus = ref("");
const generatedImagePrompt = ref("");
const generatedImageUrl = ref("");
const generatedImageTaskId = ref("");
const isGenerateModalOpen = ref(false);
const currentGenerateFlowId = ref(0);
const generatePromptAbortController = ref(null);

// 音色列表
const voiceList = ref([]);

// 音色语言映射
const voiceLanguageMap = { zh: "中文", en: "英文", ja: "日文", ko: "韩文" };
const voiceLanguageLabel = (lang) => voiceLanguageMap[lang] || lang;

// 切换音色时，自动暂停当前试听音频
watch(
    () => settings.value.voice_uuid,
    () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
    },
);

// 试听当前音色
const testCurrentVoice = () => {
    if (!settings.value.voice_uuid) {
        ElMessage.warning("请先选择一个音色");
        return;
    }
    const voice = voiceList.value.find(v => v.uuid === settings.value.voice_uuid);
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

// 更新信息
const handleSubmit = async () => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    try {
        // 更新角色基本信息
        let payload = new FormData();
        if (avatarPhotoFile.value) {
            payload.append("photo", avatarPhotoFile.value, "avatar.png");
        }
        if (backgroundPhotoFile.value) {
            payload.append("background_photo", backgroundPhotoFile.value, "background_photo.png");
        }
        payload.append("uuid", uuid);
        payload.append("name", character.value.name);
        payload.append("gender", character.value.gender);
        payload.append("profile", character.value.profile);
        const res = await updateCharacter(payload);
        if (res?.data?.result !== "success") {
            ElMessage.error(res?.data?.errors || "更新角色信息失败");
            return;
        }
        if (avatarPhotoFile.value) {
            if (character.value.photo) URL.revokeObjectURL(character.value.photo);
            avatarPhotoFile.value = null;
            character.value.photo = "";
        }
        if (backgroundPhotoFile.value) {
            if (character.value.background_photo) URL.revokeObjectURL(character.value.background_photo);
            backgroundPhotoFile.value = null;
            character.value.background_photo = "";
        }

        // 更新角色设置
        if (settingsLoaded.value && settings.value.uuid) {
            const settingsPayload = {
                uuid: settings.value.uuid,
                is_public: settings.value.is_public,
                short_profile: settings.value.short_profile,
            };
            if (settings.value.voice_uuid) {
                settingsPayload.voice_uuid = settings.value.voice_uuid;
            }
            const settingsRes = await updateCharacterSettings(settingsPayload);
            if (settingsRes?.data?.result !== "success") {
                ElMessage.error(settingsRes?.data?.errors || "更新角色设置失败");
                return;
            }
        }

        ElMessage.success("更新角色信息成功");
        // router.push(`/`);
    } catch (err) {
        const raw = err?.response?.data?.errors || "更新角色信息失败";
        const msg = typeof raw === "object"
            ? Object.values(raw).flat().join(" ") || "更新角色信息失败"
            : raw;
        ElMessage.error(msg);
        console.error(err);
    } finally {
        isSubmitting.value = false;
    }
}

// 打开头像裁剪 modal
const openAvatarPhotoModal = async (src) => {
    avatarPhotoModalRef.value.showModal();
    await nextTick();
    if (!avatarCroppie) {
        avatarCroppie = new Croppie(avatarCroppieRef.value, {
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
    avatarCroppie.bind({
        url: src,
    });
};

// 打开背景图片裁剪 modal
const openBackgroundPhotoModal = async (src) => {
    backgroundPhotoModalRef.value.showModal();
    await nextTick();
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
    });
};

// 确认裁剪头像
const confirmAvatarPhotoCrop = async () => {
    const base = await avatarCroppie.result({
        type: "blob",
        size: "viewport",
    });
    avatarPhotoFile.value = base;
    character.value.photo = URL.createObjectURL(base);
    avatarPhotoModalRef.value.close();
};

// 确认裁剪背景图片
const confirmBackgroundPhotoCrop = async () => {
    const base = await backgroundPhotoCroppie.result({
        type: "blob",
        size: "viewport",
    });
    backgroundPhotoFile.value = base;
    character.value.background_photo = URL.createObjectURL(base);
    backgroundPhotoModalRef.value.close();
};

// 触发点击头像文件输入框
const triggerAvatarPhotoFileInput = () => {
    avatarFileInputRef.value?.click();
};

// 触发点击背景图片文件输入框
const triggerBackgroundPhotoFileInput = () => {
    backgroundPhotoFileInputRef.value?.click();
};

// 上传头像
const handleAvatarPhotoSelect = (e) => {
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
        openAvatarPhotoModal(reader.result);
    };
    reader.readAsDataURL(file);
};

// 上传背景图片
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

const isSubmitting = ref(false);

const toErrorMessage = (raw, fallback = "请求失败，请重试") => {
    if (!raw) return fallback;
    if (typeof raw === "object") {
        return Object.values(raw).flat().join(" ") || fallback;
    }
    return String(raw);
};

// 添加在角色设计输入框内，进行滚动到底部函数设计
const scrollToBottomProfile = () => {
    const textarea = document.querySelector("#textarea-profile");
    if (textarea) {
        textarea.scrollTop = textarea.scrollHeight;
    }
};

const handleOptimizeProfile = async () => {
    if (!uuid) {
        ElMessage.error("角色不存在或无权限访问");
        return;
    }
    if (isSubmitting.value || isOptimizingProfile.value) return;
    const description = (character.value.profile || "").trim();
    if (!description) {
        ElMessage.warning("请先输入角色设计内容");
        return;
    }
    isOptimizingProfile.value = true;
    try {
        let optimizedProfile = "";
        let streamError = null;
        await characterProfileOptimization(
            {
                character_uuid: uuid,
                character_description: description,
            },
            (data, isDone) => {
                if (isDone) return;
                if (data?.content) {
                    optimizedProfile += data.content;
                    character.value.profile = optimizedProfile;
                    scrollToBottomProfile();
                }
            },
            (error) => {
                streamError = error;
            },
        );
        if (streamError) {
            throw streamError;
        }
        if (optimizedProfile.trim()) {
            ElMessage.success("性格优化完成");
            // 提交一次更新
            handleSubmit();
            ElMessage.success("已成功更新角色")
        } else {
            ElMessage.warning("优化结果为空，请稍后重试");
        }
    } catch (err) {
        ElMessage.error(toErrorMessage(err?.response?.data?.errors || err?.message, "性格优化失败"));
    } finally {
        isOptimizingProfile.value = false;
    }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isFlowActive = (flowId) => isGenerateModalOpen.value && flowId === currentGenerateFlowId.value;

const stopGenerateFlow = () => {
    currentGenerateFlowId.value += 1;
    isGenerateModalOpen.value = false;
    generatePromptAbortController.value?.abort();
    generatePromptAbortController.value = null;
    isGeneratingBackgroundPhoto.value = false;
    isSubmittingImageTask.value = false;
    isPollingImageTask.value = false;
    generatedImageTaskId.value = "";
    imageTaskStatus.value = "已停止";
};

const closeGenerateBackgroundModal = () => {
    stopGenerateFlow();
    generateBackgroundModalRef.value?.close();
};

const handleGenerateBackgroundPhoto = async () => {
    if (!uuid) {
        ElMessage.error("角色不存在或无权限访问");
        return;
    }
    if (!(character.value.profile || "").trim()) {
        ElMessage.warning("请先完善角色设计，再生成背景图");
        return;
    }
    generatedImageUrl.value = "";
    generatedImageTaskId.value = "";
    imageTaskStatus.value = "";
    currentGenerateFlowId.value += 1;
    isGenerateModalOpen.value = true;
    generateBackgroundModalRef.value?.showModal();
    await startGenerateImagePrompt(currentGenerateFlowId.value);
};

const startGenerateImagePrompt = async (flowId = currentGenerateFlowId.value) => {
    if (!uuid) return;
    if (!isFlowActive(flowId)) return;
    isGeneratingBackgroundPhoto.value = true;
    generatedImagePrompt.value = "";
    generatedImageUrl.value = "";
    generatedImageTaskId.value = "";
    imageTaskStatus.value = "正在生成提示词...";
    generatePromptAbortController.value?.abort();
    const controller = new AbortController();
    generatePromptAbortController.value = controller;
    try {
        let streamError = null;
        await generateImagePrompt(
            { character_uuid: uuid },
            (data, isDone) => {
                if (!isFlowActive(flowId)) return;
                if (isDone) return;
                if (data?.content) {
                    generatedImagePrompt.value += data.content;
                    scrollToBottom();
                }
            },
            (error) => {
                streamError = error;
            },
            { signal: controller.signal },
        );
        if (!isFlowActive(flowId)) return;
        if (streamError) {
            throw streamError;
        }
        imageTaskStatus.value = "提示词生成完成";
        if (!generatedImagePrompt.value.trim()) {
            ElMessage.warning("提示词为空，请重试");
        }
    } catch (err) {
        if (err?.name === "AbortError" || !isFlowActive(flowId)) {
            return;
        }
        imageTaskStatus.value = "提示词生成失败";
        ElMessage.error(toErrorMessage(err?.response?.data?.errors || err?.message, "生成提示词失败"));
    } finally {
        if (isFlowActive(flowId)) {
            isGeneratingBackgroundPhoto.value = false;
        }
    }
};

// 随着生成的文字滚动到最底部
const scrollToBottom = () => {
    const textarea = document.querySelector("#textarea-generated-image-prompt");
    if (textarea) {
        textarea.scrollTop = textarea.scrollHeight;
    }
};

const submitGenerateImageTask = async (flowId = currentGenerateFlowId.value) => {
    if (!isFlowActive(flowId)) return;
    // 重新清空已生成的图片
    generatedImageUrl.value = "";
    const prompt = (generatedImagePrompt.value || "").trim();
    if (!prompt) {
        ElMessage.warning("请先生成或填写提示词");
        return;
    }
    isSubmittingImageTask.value = true;
    try {
        const res = await generateImageTask(prompt);
        if (res?.data?.result !== "success") {
            throw new Error(toErrorMessage(res?.data?.errors, "提交生成任务失败"));
        }
        const taskId = res?.data?.task_id;
        if (!taskId) {
            throw new Error("提交任务失败：未返回 task_id");
        }
        if (!isFlowActive(flowId)) return;
        generatedImageTaskId.value = taskId;
        ElMessage.success("任务已提交，正在生成图片");
        await pollGenerateImageTask(taskId, flowId);
    } catch (err) {
        if (!isFlowActive(flowId)) return;
        imageTaskStatus.value = "提交任务失败";
        ElMessage.error(toErrorMessage(err?.response?.data?.errors || err?.message, "提交生成任务失败"));
    } finally {
        if (isFlowActive(flowId)) {
            isSubmittingImageTask.value = false;
        }
    }
};

const pollGenerateImageTask = async (taskId, flowId = currentGenerateFlowId.value) => {
    isPollingImageTask.value = true;
    const maxAttempts = 60;
    try {
        for (let i = 0; i < maxAttempts; i++) {
            if (!isFlowActive(flowId)) return;
            const res = await getGenerateImageTaskStatus(taskId);
            if (!isFlowActive(flowId)) return;
            if (res?.data?.result === "error") {
                throw new Error(toErrorMessage(res?.data?.errors, "图片生成失败"));
            }
            const currentStatus = res?.data?.status || "UNKNOWN";
            imageTaskStatus.value = currentStatus;

            if (currentStatus === "SUCCESS") {
                const imageUrl = res?.data?.image_url;
                if (!imageUrl) {
                    throw new Error("图片生成成功但未返回图片地址");
                }
                generatedImageUrl.value = imageUrl;
                imageTaskStatus.value = "生成完成";
                ElMessage.success("背景图生成成功");
                return;
            }
            if (currentStatus === "FAILURE") {
                throw new Error(toErrorMessage(res?.data?.errors, "图片生成失败"));
            }
            await sleep(4000);
        }
        if (!isFlowActive(flowId)) return;
        throw new Error("图片生成超时，请稍后重试");
    } finally {
        if (isFlowActive(flowId)) {
            isPollingImageTask.value = false;
        }
    }
};

const getCharacterInfo = async () => {
    try {
        const res = await getCharacter(uuid);
        if (res?.data?.result === "success") {
            character.value = res.data.character;
            for (const key in character.value) {
                if (key === "photo" || key === "background_photo") {
                    if (character.value[key]) {
                        character.value[key] = imageUrl(character.value[key]);
                    }
                }
            }
        } else {
            ElMessage.error(res?.data?.errors || "获取角色信息失败");
        }
    } catch (err) {
        const raw = err?.response?.data?.errors || "获取角色信息失败";
        const msg = typeof raw === "object"
            ? Object.values(raw).flat().join(" ") || "获取角色信息失败"
            : raw;
        ElMessage.error(msg);
        console.error(err);
    }
};

const getCharacterSettingsInfo = async () => {
    try {
        const res = await getCharacterSettings(uuid);
        if (res?.data?.result === "success") {
            const list = res.data.character_settings;
            if (list && list.length > 0) {
                const s = list[0];
                settings.value.uuid = s.uuid;
                settings.value.is_public = s.is_public;
                settings.value.short_profile = s.short_profile || "";
                settings.value.voice_uuid = s.voice?.uuid || "";
                settingsLoaded.value = true;
            }
        }
    } catch (err) {
        console.error("获取角色设置失败", err);
    }
};

const getVoiceList = async () => {
    try {
        const res = await getCharacterVoiceList();
        if (res?.data?.result === "success") {
            voiceList.value = res.data.character_voices || [];
        }
    } catch (err) {
        console.error("获取音色列表失败", err);
    }
};

onMounted(() => {
    if (uuid) {
        getCharacterInfo();
        getCharacterSettingsInfo();
        getVoiceList();
    } else {
        ElMessage.error("角色不存在或无权限访问");
    }
});

onBeforeUnmount(() => {
    stopGenerateFlow();
    avatarCroppie?.destroy();
    backgroundPhotoCroppie?.destroy();
    if (character.value.photo) URL.revokeObjectURL(character.value.photo);
    if (character.value.background_photo) URL.revokeObjectURL(character.value.background_photo);
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
});
</script>

<style scoped></style>