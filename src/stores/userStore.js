import { defineStore } from 'pinia';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

export const useUserStore = defineStore('user', {
    state: () => ({
        uuid: null,
        username: null,
        email: null,
        photo: null,
        profile: null,
        accessToken: null,
        hasPullUserInfo: false,
    }),
    getters: {
        isLogin: (state) => state.accessToken !== null,
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
        /** 部分更新用户信息（用于 profile 更新后的合并） */
        updateUserProfile(data) {
            if (data.username !== undefined) this.username = data.username;
            if (data.profile !== undefined) this.profile = data.profile;
            if (data.photo !== undefined) this.photo = data.photo;
        },
        logout() {
            this.accessToken = null;
            this.uuid = null;
            this.username = null;
            this.email = null;
            this.photo = null;
            this.profile = null;
        }
    },
});