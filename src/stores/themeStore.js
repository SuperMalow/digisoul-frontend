import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
    state: () => ({
        theme: 'dark', // 'light' | 'dark'
    }),
    getters: {
        isDarkMode: (state) => state.theme === 'dark',
    },
    actions: {
        setTheme(theme) {
            if (theme !== 'light' && theme !== 'dark') return;

            this.theme = theme;

            // 切换 daisyUI 主题
            if (typeof document !== 'undefined') {
                document.documentElement.setAttribute('data-theme', theme);
            }

            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('theme', theme);
            }
        },
        initTheme() {
            if (typeof window === 'undefined') {
                return;
            }

            const savedTheme = localStorage.getItem('theme');

            if (savedTheme === 'dark' || savedTheme === 'light') {
                this.setTheme(savedTheme);
                return;
            }

            // 没有手动选择时，尊重系统偏好
            const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        },
        toggleTheme() {
            this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
        },
    },
});

