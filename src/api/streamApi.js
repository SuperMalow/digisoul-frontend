/*
 * 功能：在每个请求头里自动添加`access token`。
 * 然后拦截请求结果，如果返回结果是身份认证失败（401），
 * 则说明`access_token`过期了，那么调用api刷新token`，
 * 如果刷新成功，则重新发送原请求。
*/

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useUserStore } from '@/stores/userStore';
import http from "./http.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";
const REFRESH_TOKEN_URL = BASE_URL + 'token/refresh/';

/**
 * 通用的流式请求工具
 * @param {string} url 请求地址
 * @param {object} options 配置项 (method, body, onmessage, onerror等)
 */
export default async function streamApi(url, options = {}) {
    const userStore = useUserStore();

    const startFetch = async () => {
        const isFormData = options.body instanceof FormData;
        const headers = {
            'Authorization': `Bearer ${userStore.accessToken}`,
            ...options.headers,
        };
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        return await fetchEventSource(BASE_URL + url, {
            method: options.method || 'POST',
            headers,
            body: isFormData ? options.body : JSON.stringify(options.body || {}),

            openWhenHidden: true,  // 允许后台运行，防止浏览器因隐藏页面而强制关闭它
            async onopen(response) {
                // 1. 处理 401 Token 过期
                if (response.status === 401) {
                    try {
                        // 触发 api.js 中的 Axios 拦截器进行静默刷新
                        await http.post(REFRESH_TOKEN_URL, {});
                        // 抛出特定错误触发下面的 onerror 重试逻辑
                        throw new Error("TOKEN_REFRESHED");
                    } catch (err) {
                        // 如果刷新失败（refresh_token也过期），直接报错由上层处理
                        throw err;
                    }
                }

                if (!response.ok || !response.headers.get('content-type')?.includes('text/event-stream')) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || `请求失败: ${response.status}`);
                }
            },

            // 需要传递的值
            onmessage(msg) {
                if (msg.data === '[DONE]') {
                    if (options.onmessage) options.onmessage('', true);
                    return
                }
                try {
                    const json = JSON.parse(msg.data);
                    if (options.onmessage) options.onmessage(json, false);
                } catch (e) {
                    console.error("流解析失败:", e);
                }
            },
            // 需要传递错误处理
            onerror(err) {
                // 主动取消请求时，直接结束流，不走错误提示
                if (err?.name === 'AbortError') {
                    return;
                }
                // 2. 捕获重试信号并递归
                if (err.message === "TOKEN_REFRESHED") {
                    return startFetch();
                }

                // 其他错误则按用户定义的 onerror 处理
                if (options.onerror) {
                    options.onerror(err);
                }
                throw err; // 停止自动重试
            },

            onclose: options.onclose,
        });
    };

    return await startFetch();
}