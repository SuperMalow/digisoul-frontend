<template>
    <!-- 仅本页：用视口高度自约束，滚动条限定在左右两栏内部，不撑大整页 -->
    <div class="friendship-view-root flex w-full min-h-0 overflow-hidden">
        <!-- 左边好友列表：高度与主内容区一致，仅内部可滚动以支持流式加载 -->
        <div class="w-1/3 flex flex-col rounded-r-2xl bg-base-100 min-h-0 shrink-0 overflow-hidden">
            <div ref="friendListScrollRef" class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                <ul class="list bg-base-100 rounded-box shadow-md">
                    <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">好友列表</li>
                    <FriendshipCharacter v-for="friend, index in friends" :key="index" :friend="friend"
                        @selectFriend="handlerSelectFriend" />
                </ul>
                <!--  流式布局哨兵 -->
                <div ref="sentinelRef" class="h-2 mt-4 w-100"></div>
                <div v-if="isLoading" class="mt-4">
                    <div class="loading loading-spinner loading-lg"></div>
                </div>
                <div v-else class="mt-2 mb-4 text-center">
                    <div class="text-sm">没有更多好友了~</div>
                </div>
            </div>
        </div>
        <!-- 右边聊天窗口 -->
        <div class="w-2/3 rounded-l-2xl bg-base-200 flex flex-col min-h-0 shrink-0 overflow-hidden">
            <div class="flex-1 flex flex-col min-h-0 border border-base-300 rounded-lg overflow-hidden bg-base-100">
                <FriendshipChatWindow :friend="selectedFriend" class="flex-1 min-h-0" />
            </div>
        </div>

    </div>
</template>

<script setup>
import FriendshipCharacter from '@/component/Friendship/FriendshipCharacter.vue';
import FriendshipChatWindow from '@/views/Friendship/FriendshipChatWindow.vue';
import { ref, reactive, onMounted, nextTick, onUnmounted, watch } from 'vue';
import { getFriendsList } from '@/api/friends';

// 当前选中的好友
const selectedFriend = ref(null);
// 当前选中的好友 uuid
const selectedFriendUuid = ref(null);
// 选择好友
const handlerSelectFriend = (friend) => {
    selectedFriend.value = friend;
    selectedFriendUuid.value = friend.uuid;
}

const friends = ref([]);
const isLoading = ref(false);
const hasFriends = ref(true);
const sentinelRef = ref(null);
const friendListScrollRef = ref(null);

const friendPageInfo = reactive({
    page: 1,
    page_size: 20,
    total: 0,
    next: null,
})

// 重置好友列表
const reset = () => {
    friends.value = [];
    friendPageInfo.page = 1;
    friendPageInfo.page_size = 20;
    friendPageInfo.total = 0;
    friendPageInfo.next = null;
    hasFriends.value = true;
    isLoading.value = false;

    loadMoreFriends();
}

// 加载更多好友
const loadMoreFriends = async () => {
    if (isLoading.value || !hasFriends.value) return;
    isLoading.value = true;
    let newFriends = [];
    try {
        const response = await getFriendsList(friendPageInfo.page, friendPageInfo.page_size);
        if (response?.status === 200) {
            const data = response.data;
            console.log("newFriends: ", response);
            newFriends = data.results ?? [];
            friendPageInfo.total = data.count ?? 0;
            friendPageInfo.next = data.next ?? null;
        } else {
            console.log(response);
            ElMessage.error(response?.data?.errors || '获取好友列表失败');
        }
    } catch (error) {
        console.log('已加载所有数据: ' + error);
        hasFriends.value = false;
    } finally {
        isLoading.value = false;
        if (newFriends.length === 0 || (hasFriends.value > 0 && friends.value.length >= hasFriends.value)) {
            hasFriends.value = false;
        } else {
            friends.value.push(...newFriends);
            friendPageInfo.page += 1;
            await nextTick();
            if (checkSentinelInViewport()) {
                loadMoreFriends();
                // console.log("红色出现了")
            }
        }
    }
}

// 检查哨兵是否在列表滚动容器视口内
const checkSentinelInViewport = () => {
    if (!sentinelRef.value || !friendListScrollRef.value) return false;
    const rect = sentinelRef.value.getBoundingClientRect();
    const scrollRect = friendListScrollRef.value.getBoundingClientRect();
    return rect.top < scrollRect.bottom && rect.bottom > scrollRect.top;
};

// 删除好友
const removeFriend = (uuid) => {
    friends.value = friends.value.filter(friend => friend.uuid !== uuid);
}

let observer = null;
onMounted(async () => {
    await loadMoreFriends();
    await nextTick();
    const scrollRoot = friendListScrollRef.value;
    if (sentinelRef.value && scrollRoot) {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) loadMoreFriends();
                });
            },
            { root: scrollRoot, rootMargin: '2px', threshold: 0 }
        );
        observer.observe(sentinelRef.value);
    }
});

onUnmounted(() => {
    observer?.disconnect();
});
</script>

<style scoped>
/* 仅本页：固定高度为视口减去导航栏，避免整页出现滚动条，滚动仅在左右栏内部 */
.friendship-view-root {
    height: calc(100dvh - 4rem);
}
</style>