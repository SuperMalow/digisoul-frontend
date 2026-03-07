<template>
    <div class="flex flex-col items-center">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-8 mt-12 justify-items-center w-full px-7">
            <Character v-for="character in characters" :key="character.uuid" :character="character"
                @remove="removeCharacter" :canEdit="false" />
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

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { getCharacterListIndex } from '@/api/character';
import Character from '@/component/Space/Character.vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';

const route = useRoute();

const characters = ref([]);
const isLoading = ref(false);
const hasCharacters = ref(true);
const sentinelRef = ref(null);

const characterPageInfo = reactive({
    page: 1,
    page_size: 20,
    total: 0,
    next: null,
})

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
watch(() => route.query.q, (newVal) => {
    console.log('搜索词: ', newVal);
    reset();
});

// 加载更多角色
const loadMoreCharacters = async () => {
    if (isLoading.value || !hasCharacters.value) return;
    isLoading.value = true;
    let newCharacters = [];
    try {
        const response = await getCharacterListIndex(characterPageInfo.page, characterPageInfo.page_size, route.query.q || null);
        if (response?.status === 200) {
            const data = response.data;
            console.log('获取到的角色数据: ', data);
            newCharacters = data.results ?? [];
            characterPageInfo.total = data.count ?? 0;
            characterPageInfo.next = data.next ?? null;
        }
        else {
            console.log(response);
            ElMessage.error(response?.data?.errors || '获取角色列表失败');
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

// 检查哨兵是否在视窗内
const checkSentinelInViewport = () => {
    if (!sentinelRef.value) return false;

    const rect = sentinelRef.value.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
};

// 删除角色
const removeCharacter = (uuid) => {
    characters.value = characters.value.filter(character => character.uuid !== uuid);
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