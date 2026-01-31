import { defineStore } from 'pinia';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

export const useUserStore = defineStore('user', {
    state: () => ({
        uuid: '',
        username: '',
        email: '',
        photo: '',
        profile: '',
        accessToken: '',
        hasPullUserInfo: false,
    }),
    getters: {
        isLogin: (state) => state.accessToken !== '',
        isPullUserInfo: (state) => state.hasPullUserInfo,
        userPhoto: (state) => state.photo ? BASE_URL + state.photo : '',
        userName: (state) => state.username,
    },
    actions: {
        setAccessToken(accessToken) {
            this.accessToken = accessToken;
        },
        setUserInfo(data) {
            this.uuid = data.uuid;
            this.username = data.username;
            this.email = data.email;
            this.photo = data.photo;
            this.profile = data.profile;
        },
        setHasPullUserInfo(hasPullUserInfo) {
            this.hasPullUserInfo = hasPullUserInfo;
        },
        logout() {
            this.accessToken = '';
            this.uuid = '';
            this.username = '';
            this.email = '';
            this.photo = '';
            this.profile = '';
        }
    },
});