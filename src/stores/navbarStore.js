import { defineStore } from 'pinia';

export const useNavbarStore = defineStore('navbar', {
    state: () => ({
        isOpenLoginModal: false,
    }),
    getters: {
    },
    actions: {
        openLoginModal() {
            this.isOpenLoginModal = true;
        },
        closeLoginModal() {
            this.isOpenLoginModal = false;
        }
    },
});