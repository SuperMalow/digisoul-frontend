<template>
    <div class="flex flex-col items-center">
        <SpaceUserInfoView />
        <!-- 瀑布流：多列布局，卡片按列从上到下填充，无行高间隔 -->
        <div class="columns-2 sm:columns-3 lg:columns-4 [column-gap:2rem] mt-12 w-full px-7">
            <div v-for="character in characters" :key="character.uuid" class="break-inside-avoid mb-6">
                <Character :character="character" @remove="removeCharacter" :canEdit="true" />
            </div>
        </div>
        <!--  流式布局哨兵 -->
        <div ref="sentinelRef" class="h-2 mt-8 w-100"></div>
        <div v-if="isLoading" class="mt-4">
            <div class="loading loading-spinner loading-lg"></div>
        </div>
        <div v-else class="mt-2">
            <div class="text-sm">没有更多角色了~</div>
        </div>

    </div>
</template>

<!-- http://localhost:5173/user/space/123 -->
<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import SpaceUserInfoView from './SpaceUserInfoView.vue';
import Character from '@/component/Space/Character.vue';
import { getCharacterList } from '@/api/character';

const route = useRoute();
const user_id = ref(route.params.user_id);

const characters = ref([]);
const isLoading = ref(false);
const hasCharacters = ref(true);
const sentinelRef = ref(null);

// reset 函数
const reset = () => {
    characters.value = [];
    characterPageInfo.page = 1;
    characterPageInfo.page_size = 20;
    characterPageInfo.total = 0;
    characterPageInfo.next = null;
    hasCharacters.value = true;
    isLoading.value = false;

    loadMoreCharacters();
}

// 监听路由参数与搜索词直接的绑定
watch(() => route.params.user_id, (newVal) => {
    console.log('用户ID: ', newVal);
    user_id.value = newVal ?? null;
    reset();
});

// 删除角色
const removeCharacter = (uuid) => {
    characters.value = characters.value.filter(character => character.uuid !== uuid);
}

// 检查哨兵是否在视窗内
const checkSentinelInViewport = () => {
    if (!sentinelRef.value) return false;

    const rect = sentinelRef.value.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
};

// 获取元素的
const characterPageInfo = reactive({
    page: 1,
    page_size: 20,
    total: 0,
    next: null,
})

// 加载更多角色
const loadMoreCharacters = async () => {
    if (isLoading.value || !hasCharacters.value) return;
    isLoading.value = true;
    let newCharacters = [];
    try {
        const response = await getCharacterList(user_id.value, characterPageInfo.page, characterPageInfo.page_size);
        if (response?.status === 200) {
            const data = response.data;
            console.log('获取到的角色数据: ', data);
            newCharacters = data.results ?? [];
            characterPageInfo.total = data.count ?? 0;
            characterPageInfo.next = data.next ?? null;
        }
    } catch (error) {
        console.log('已加载所有数据: ' + error);
        hasCharacters.value = false;
    } finally {
        isLoading.value = false;
        if (newCharacters.length === 0 || (characterPageInfo.total > 0 && characters.value.length >= characterPageInfo.total)) {
            hasCharacters.value = false;
        } else {
            characters.value.push(...newCharacters);
            characterPageInfo.page += 1;
            await nextTick();
            if (checkSentinelInViewport()) {
                loadMoreCharacters();
                // console.log("红色出现了")
            }
        }
    }
}

let observer = null;
onMounted(async () => {
    await loadMoreCharacters();

    observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadMoreCharacters();
            }
        });
    }, { root: null, rootMargin: '2px', threshold: 0 });
    observer.observe(sentinelRef.value);
});

onUnmounted(() => {
    observer?.disconnect();
});
</script>

<style scoped></style>