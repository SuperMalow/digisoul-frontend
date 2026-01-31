<template>
    <dialog id="my_modal" class="modal" :open="toggleModel">
        <div class="modal-box bg-base-100 w-1/2 max-w-3xl">
            <form method="dialog">
                <h3 class="text-xl font-bold text-center">
                    登录后免费体验
                    <span class="text-rotate">
                        <span>
                            <span class="bg-red-400 text-red-800 rounded-md">别样</span>
                            <span class="bg-teal-400 text-teal-800 rounded-md">别样</span>
                            <span class="bg-blue-400 text-blue-800 rounded-md">别样</span>
                            <span class="bg-green-400 text-green-800 rounded-md">别样</span>
                            <span class="bg-yellow-400 text-yellow-800 rounded-md">别样</span>
                            <span class="bg-purple-400 text-purple-800 rounded-md">别样</span>
                            <span class="bg-pink-400 text-pink-800 rounded-md">别样</span>
                        </span>
                    </span>
                    生活
                </h3>
                <button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                    @click="toggleModel = false">X</button>
            </form>
            <div class="modal-body my-6 h-2/3">
                <div class="flex w-full flex-row">
                    <div class="flex-1 hidden lg:block">
                        <ScanCodeLogin />
                    </div>
                    <div class="divider lg:divider-horizontal">
                        <span class="text-base font-bold hidden lg:block">OR</span>
                    </div>
                    <div class="flex-1 ">
                        <AccountLogin @closeLogin="toggleModel = false" />
                    </div>
                </div>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import ScanCodeLogin from './ScanCodeLogin.vue';
import AccountLogin from './AccountLogin.vue';

const toggleModel = defineModel('toggleModel', {
    type: Boolean,
    default: false,
});


</script>

<style scoped></style>