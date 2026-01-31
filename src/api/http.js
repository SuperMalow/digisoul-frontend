import axios from "axios";
import { useUserStore } from '@/stores/userStore';

// 基础配置
// 需要在 .env.development 中配置 VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";
const TIMEOUT = 5000;
const REFRESH_TOKEN_URL = 'token/refresh/';

class Http {
  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
      withCredentials: true, // 允许携带 cookie
    });

    // 是否已经刷新token
    this.isRefreshing = false;
    // 刷新token前等待的请求队列
    this.refreshTokenQueue = [];

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 获取用户store
        const user = useUserStore();
        // 在请求头中添加 token
        if (user.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const user = useUserStore();
        const originalRequest = error.config;
        if (!originalRequest || this.isRefreshing) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          // 如果请求发现 token 过期，则开始刷新 token
          this.isRefreshing = true;
          // 开始请求刷新 token 的 promise
          return new Promise((resolve, reject) => {
            // 将这次 401 请求添加到请求队列
            this.addRequest((token, error) => {
              if (error) {
                reject(error);
              } else {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(originalRequest);
              }
            });

            // 如果当前没有在刷新 token，则开始刷新 token
            if (!this.isRefreshing) {
              this.isRefreshing = true;
              this.post(REFRESH_TOKEN_URL, {}, { withCredentials: true }).then(response => {
                const { access } = response.data;
                user.setAccessToken(access);
                this.forEachRequestAddAccessToken(access);
              }).catch(error => {
                user.logout();
                this.addErrorToRequest(error);
                reject(error);
              }).finally(() => {
                this.isRefreshing = false;
              });
            }
            // 如果已经刷新 token，说明这次 401 请求不是一开始获取登录信息的请求，则不处理
          })
        }
      }
    );
  }

  // 添加请求到队列
  addRequest(callback) {
    console.log('addRequest => ', callback);
    this.refreshTokenQueue.push(callback);
  }

  // 为请求队列每个请求添加请求错误
  addErrorToRequest(error) {
    console.log('addErrorToRequest => ', error);
    this.refreshTokenQueue.forEach(callback => callback(null, error));
    this.refreshTokenQueue = [];
  }

  // 遍历请求队列，并为每个请求添加 accessToken
  forEachRequestAddAccessToken(access_token) {
    console.log('forEachRequestAddAccessToken => ', access_token);
    this.refreshTokenQueue.forEach(callback => callback(access_token));
    this.refreshTokenQueue = [];
  }

  // 请求方法
  get(url, params = {}, config = {}) {
    return this.instance.get(url, { params });
  }
  post(url, data = {}, config = {}) {
    return this.instance.post(url, data);
  }
  put(url, data = {}, config = {}) {
    return this.instance.put(url, data);
  }
  delete(url, params = {}, config = {}) {
    return this.instance.delete(url, { params });
  }
}

export default new Http();
