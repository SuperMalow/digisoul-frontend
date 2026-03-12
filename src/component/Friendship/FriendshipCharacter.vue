<template>
    <li class="list-row transition-colors duration-150 cursor-pointer border border-transparent" :class="{
        'bg-base-200/70 border-base-200 shadow-sm': isSelected,
    }" @click="handleSelectFriend">
        <div><img class="size-10 rounded-box" :src="friend?.character?.photo" /></div>
        <div>
            <div>{{ friend?.character?.name }}</div>
            <div class="text-xs uppercase font-semibold opacity-60">{{ friend?.character?.uuid }}</div>
        </div>
        <!-- <p class="list-col-wrap text-xs line-clamp-2 break-all">
            {{ friend?.character?.profile }}
        </p> -->
        <!-- 操作 -->
        <div @click.stop class="dropdown dropdown-end ml-auto">
            <div class="btn btn-square btn-ghost size-5" title="更多操作">
                <div tabindex="0" role="button">
                    <EllipsisIcon class="w-2 h-2" />
                </div>
            </div>
            <ul tabindex="-1" class="dropdown-content bg-base-200/90 menu rounded-box z-1 w-22 shadow-sm">
                <li>
                    <router-link :to="`/user/space/${friend?.character?.author?.uuid}`" class="text-xs cursor-pointer">
                        进入空间
                    </router-link>
                </li>
                <li>
                    <button type="button" class="text-xs cursor-pointer text-error" @click.stop="handleDeleteFriend">
                        删除好友
                    </button>
                </li>
            </ul>
        </div>
    </li>
</template>

<script setup>
import EllipsisIcon from '@/component/Icon/EllipsisIcon.vue'

const emit = defineEmits(['selectFriend', 'deleteFriend']);

const props = defineProps({
    friend: {
        type: Object,
        required: true,
    },
    isSelected: {
        type: Boolean,
        default: false,
    },
});

// 选择好友
const handleSelectFriend = () => {
    emit('selectFriend', props.friend);
}

const handleDeleteFriend = () => {
    // 取消聚焦
    document.activeElement.blur();
    emit('deleteFriend', props.friend);
}
</script>