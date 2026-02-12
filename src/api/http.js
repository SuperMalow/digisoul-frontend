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
        if (!originalRequest) return Promise.reject(error);
        console.log('error.response?.status => ', error.response?.status);
        console.log('originalRequest._retry => ', originalRequest._retry);
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('401 => ', error);
          originalRequest._retry = true; // 设置请求重试标志
          // 开始请求刷新 token 的 promise
          return new Promise((resolve, reject) => {
            // 将这次 401 请求添加到请求队列
            this.addRequest((token, error) => {
              if (error) {
                reject(error);
              } else {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                // 关键：必须真正把原请求重新发出去
                resolve(this.instance(originalRequest));
              }
            });
            console.log('this.isRefreshing => ', this.isRefreshing);
            // 如果当前没有在刷新 token，则开始刷新 token
            if (!this.isRefreshing) {
              console.log('开始通过 refresh_token 刷新 access_token');
              this.isRefreshing = true;
              this.post(REFRESH_TOKEN_URL, {}, { withCredentials: true }).then(response => {
                const { access } = response.data;
                console.log('refresh_token 刷新 access_token 成功 => ', access);
                user.setAccessToken(access);
                this.forEachRequestAddAccessToken(access);
              }).catch(error => {
                console.log('refresh_token 刷新 access_token 失败 => ', error);
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
        return Promise.reject(error);
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
    return this.instance.get(url, { params, ...config });
  }
  post(url, data = {}, config = {}) {
    return this.instance.post(url, data, config);
  }
  put(url, data = {}, config = {}) {
    return this.instance.put(url, data, config);
  }
  delete(url, params = {}, config = {}) {
    return this.instance.delete(url, { params, ...config });
  }
}

export default new Http();
