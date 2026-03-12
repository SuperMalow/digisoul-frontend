<template>
    <dialog ref="dialogRef" id="my_modal" class="modal" @close="handleClose">
        <div class="modal-box bg-base-100 w-11/12 max-w-6xl rounded-2xl p-0">
            <form method="dialog">
                <button type="submit"
                    class="btn btn-sm btn-circle btn-ghost absolute top-2 left-2 outline-none focus:outline-none focus:ring-0 focus:bg-transparent focus:border-none hidden"
                    aria-label="关闭">✕</button>
            </form>
            <ContenModalField :content="content" @remove="handleRemove" :operator="operator" />
        </div>
        <form method="dialog" class="modal-backdrop">
            <button type="submit" class="cursor-default opacity-0 w-full h-full min-h-screen"
                aria-label="关闭">关闭</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import ContenModalField from './ContenModalField.vue';

const props = defineProps({
    content: {
        type: Object,
        required: true,
    },
    open: {
        type: Boolean,
        default: false,
    },
    operator: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:open', 'remove']);
const dialogRef = ref(null);

// 用原生 showModal/close 控制，这样 ESC 和点击背景才能生效
watch(() => props.open, (isOpen) => {
    const dialog = dialogRef.value;
    if (!dialog) return;
    if (isOpen) dialog.showModal();
    else dialog.close();
}, { immediate: true });

// 任意方式关闭（ESC、点背景、点✕）都会触发，同步回父组件
const handleClose = () => {
    emit('update:open', false);
};

// 删除角色
const handleRemove = (uuid) => {
    emit('remove', uuid);
}

onMounted(() => {
    // console.log('content: ', props.content);
});

defineExpose({
    closeContenModal: handleClose,
});
</script>

<style scoped></style>