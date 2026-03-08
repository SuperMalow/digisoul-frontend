<template>
    <li class="list-row cursor-pointer" @click="handleSelectFriend">
        <div><img class="size-10 rounded-box" :src="character?.photo" /></div>
        <div>
            <div>{{ character?.name }}</div>
            <div class="text-xs uppercase font-semibold opacity-60">{{ character?.uuid }}</div>
        </div>
        <p class="list-col-wrap text-xs">
            {{ character?.profile }}
        </p>
        <!-- 操作 -->
        <button class="btn btn-square btn-ghost size-5" title="开始聊天">
            <div class="dropdown dropdown-end ml-auto">
                <div tabindex="0" role="button">
                    <EllipsisIcon class="w-2 h-2" />
                </div>
                <ul tabindex="-1" class="dropdown-content bg-base-200/90 menu rounded-box z-1 w-22 shadow-sm">
                    <li>
                        <router-link :to="`/user/space/${character?.author?.uuid}`" class="text-xs cursor-pointer">
                            进入空间
                        </router-link>
                    </li>
                    <li>
                        <a class="text-xs cursor-pointer text-error">
                            删除好友
                        </a>
                    </li>
                </ul>
            </div>
        </button>
    </li>
</template>

<script setup>
import EllipsisIcon from '@/component/Icon/EllipsisIcon.vue'

const emit = defineEmits(['selectFriend']);

const props = defineProps({
    character: {
        type: Object,
        required: true,
    },
});

// 选择好友
const handleSelectFriend = () => {
    console.log('handleSelectFriend:', props.character);
    emit('selectFriend', props.character);
}
</script>