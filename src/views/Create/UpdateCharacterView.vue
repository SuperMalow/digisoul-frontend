<template>
    <div class="min-h-[calc(100vh-4rem)] bg-base-200">
        <div class="max-w-lg mx-auto px-4 py-8">
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
                            <legend class="fieldset-legend">音色</legend>
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
                            <legend class="fieldset-legend">角色设计
                                <span class="text-xs text-base-content/40 font-normal ml-1">
                                    {{ (character.profile || '').length }}/5000
                                </span>
                            </legend>
                            <textarea class="textarea w-full" v-model="character.profile" placeholder="请介绍一下角色吧 ~"
                                rows="5" maxlength="5000"></textarea>
                        </fieldset>

                        <!-- 背景图片 -->
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">背景图片</legend>
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
                                :disabled="isSubmitting">
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
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import CameraIcon from "@/component/Icon/CameraIcon.vue";

import { updateCharacter, getCharacter, getCharacterSettings, updateCharacterSettings, getCharacterVoiceList } from "@/api/character";

import { useRouter } from "vue-router";
const router = useRouter();

const route = useRoute();
const uuid = route.params.uuid;

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";
const imageUrl = (path) => path ? BASE_URL + path.replace(/^\//, "") : "";

import Croppie from "croppie";
// import "croppie/dist/croppie.css";
import "croppie/croppie.css";

// 图片文件输入框
const avatarFileInputRef = ref(null);
const backgroundPhotoFileInputRef = ref(null);

// 图片文件
const avatarPhotoFile = ref(null);
const backgroundPhotoFile = ref(null);

// 图片裁剪modal
const avatarPhotoModalRef = ref(null);
const backgroundPhotoModalRef = ref(null);

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

// 音色列表
const voiceList = ref([]);

// 音色语言映射
const voiceLanguageMap = { zh: "中文", en: "英文", ja: "日文", ko: "韩文" };
const voiceLanguageLabel = (lang) => voiceLanguageMap[lang] || lang;

// 当前选中音色名称
const currentVoiceName = computed(() => {
    const found = voiceList.value.find(v => v.uuid === settings.value.voice_uuid);
    return found ? `${found.voice_name}（${voiceLanguageLabel(found.voice_language)}）` : "";
});

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
        router.push(`/`);
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
    avatarCroppie?.destroy();
    backgroundPhotoCroppie?.destroy();
    if (character.value.photo) URL.revokeObjectURL(character.value.photo);
    if (character.value.background_photo) URL.revokeObjectURL(character.value.background_photo);
});
</script>

<style scoped></style>