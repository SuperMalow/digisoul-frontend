<template>
    <div class="voice-btn-wrapper relative flex items-center justify-center" :class="{ 'is-recording': isRecording }">
        <template v-if="isRecording">
            <span class="voice-ripple voice-ripple-1"></span>
            <span class="voice-ripple voice-ripple-2"></span>
            <span class="voice-ripple voice-ripple-3"></span>
        </template>

        <button type="button"
            class="voice-btn-core btn btn-ghost btn-circle btn-sm relative z-10 shrink-0 transition-all duration-300 border border-base-300/90 bg-base-100/80"
            :class="{
                'scale-110': isRecording,
                'opacity-70': !isRecording
            }" @click="handleMicphoneInput">
            <div class="voice-icon-wrapper" :class="{ 'is-recording': isRecording }">
                <MicphoneIcon />
            </div>
        </button>
    </div>
</template>
<script setup>
import { ref, onBeforeUnmount } from 'vue';
import MicphoneIcon from '@/component/Icon/MicphoneIcon.vue';
import { MicVAD } from '@ricky0123/vad-web';
import { Mp3Encoder } from '@breezystack/lamejs';
import { sendAudioMessage } from '@/api/friends';
import { ElMessage } from 'element-plus';

const emit = defineEmits(['updateInputText', 'interrupted', 'sendMessage', 'sendMessageSuccess']);
// 具体的语音模型存放路径
const baseUrl = import.meta.env.VITE_VAD_BASE_URL || "http://localhost:5173/vad/";
const onnxWasmBaseUrl = import.meta.env.VITE_ONNX_WASM_BASE_URL || baseUrl;

// 记录当前麦克风输入状态
const isRecording = ref(false);

// 记录当前是否正在说话
const isSpeaking = ref(false);

let isInitializing = false;

// 处理麦克风输入
const handleMicphoneInput = async () => {
    if (isInitializing) return;
    if (isRecording.value) {
        await stopRecording();
        return;
    }
    await startRecording();
}

let vadInstance = null;

const checkMicrophoneAvailable = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(d => d.kind === 'audioinput');
};

const startRecording = async () => {
    isInitializing = true;
    try {
        if (!await checkMicrophoneAvailable()) {
            ElMessage.error("未检测到麦克风设备，请连接麦克风后重试");
            return;
        }

        if (!vadInstance) {
            vadInstance = await MicVAD.new({
                baseAssetPath: baseUrl,
                onnxWASMBasePath: onnxWasmBaseUrl,
                startOnLoad: false,
                onSpeechStart: () => {
                    emit('interrupted');
                    console.log("开始说话...");
                    isSpeaking.value = true;
                },
                onSpeechEnd: async (audio) => {
                    console.log("结束说话...");
                    isSpeaking.value = false;
                    const sampleCount = audio.length;
                    const pcm16 = float32ToInt16(audio);
                    await stopRecording();
                    sendToBackend(pcm16, sampleCount);
                },
                positiveSpeechThreshold: 0.3,
                negativeSpeechThreshold: 0.3,
                minSpeechFrames: 2,
                redemptionFrames: 10,
            });
        }
        await vadInstance.start();
        isRecording.value = true;
        console.log("正在录音...");
    } catch (e) {
        console.error("VAD 初始化失败:", e);
        if (vadInstance) {
            try { vadInstance.destroy(); } catch (_) { /* ignore */ }
            vadInstance = null;
        }
        isRecording.value = false;
        ElMessage.error("麦克风初始化失败，请检查麦克风权限");
    } finally {
        isInitializing = false;
    }
};

const stopRecording = async () => {
    try {
        if (vadInstance) {
            await vadInstance.pause();
        }
    } catch (e) {
        console.error("录音暂停失败:", e);
    } finally {
        isRecording.value = false;
        isSpeaking.value = false;
        console.log("录音停止。");
    }
};
// 将 Float32 转 PCM 16-bit
const float32ToInt16 = (float32Array) => {
    const buffer = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return buffer.buffer;
};

// 将pcm16 ArrayBuffer转换成mp3 Blob
const pcm16ToMp3Blob = (pcm16ArrayBuffer, sampleRate = 16000) => {
    const samples = new Int16Array(pcm16ArrayBuffer);
    const mp3Encoder = new Mp3Encoder(1, sampleRate, 128);
    const mp3Data = [];
    const blockSize = 1152;

    for (let i = 0; i < samples.length; i += blockSize) {
        const chunk = samples.subarray(i, i + blockSize);
        const mp3buf = mp3Encoder.encodeBuffer(chunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    const end = mp3Encoder.flush();
    if (end.length > 0) {
        mp3Data.push(end);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
};

const updateAudioMessage = (pcm16ArrayBuffer, sampleCount) => {
    const mp3Blob = pcm16ToMp3Blob(pcm16ArrayBuffer, 16000);
    const audioUrl = URL.createObjectURL(mp3Blob);
    const duration = sampleCount / 16000;
    emit('updateInputText', {
        audio_message: mp3Blob,
        audio_url: audioUrl,
        audio_duration: duration,
    });
    return mp3Blob;
}

const sendToBackend = async (pcm16ArrayBuffer, sampleCount) => {
    const blob = new Blob([pcm16ArrayBuffer], { type: 'audio/pcm' });
    const formData = new FormData();
    formData.append("audio", blob, 'voice.pcm');
    // 先添加一条语音消息
    const mp3Blob = updateAudioMessage(pcm16ArrayBuffer, sampleCount);

    try {
        const res = await sendAudioMessage(formData);
        if (res?.status === 200) {
            emit('sendMessage', null, res?.data?.text, mp3Blob);
            console.log("发送语音消息成功 ==> ", res);
            // 将消息的status设置为true
            emit('sendMessageSuccess')
        }
    } catch (e) {
        console.log('发送语音文件识别错误 ==> ', e);
    }
};

onBeforeUnmount(() => {
    if (!vadInstance) return;
    try {
        vadInstance.destroy();
    } finally {
        vadInstance = null;
    }
});

</script>
<style scoped>
.voice-btn-wrapper {
    width: 2rem;
    height: 2rem;
}

.voice-ripple {
    position: absolute;
    inset: -0.3rem;
    border-radius: 9999px;
    border: 2px solid hsl(var(--p) / 0.45);
    background: radial-gradient(circle, hsl(var(--p) / 0.24) 0%, hsl(var(--p) / 0.08) 45%, transparent 70%);
    animation: voice-ripple-wave 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
    pointer-events: none;
}

.voice-ripple-2 {
    animation-delay: 0.8s;
}

.voice-ripple-3 {
    animation-delay: 1.6s;
}

.voice-btn-core {
    overflow: visible;
}

.voice-btn-wrapper.is-recording .voice-btn-core {
    box-shadow: 0 0 0 0.35rem hsl(var(--p) / 0.2), 0 10px 18px hsl(var(--p) / 0.28);
    animation: voice-core-breath 1.6s ease-in-out infinite;
    border-color: hsl(var(--p) / 0.5);
    background: hsl(var(--b1) / 0.92);
}

.voice-icon-wrapper.is-recording {
    animation: voice-icon-pulse 1.2s ease-in-out infinite;
}

@keyframes voice-ripple-wave {
    0% {
        transform: scale(0.62);
        opacity: 0;
    }

    22% {
        opacity: 0.72;
    }

    100% {
        transform: scale(1.78);
        opacity: 0;
    }
}

@keyframes voice-core-breath {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.06);
    }
}

@keyframes voice-icon-pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.12);
    }
}
</style>
