import http from "./http";

// 邮箱密码登录
const emailPasswordLogin = (data) => {
  const url = 'user/password/login/';
  return http.post(url, data);
};

// 用户登出
const userLogout = () => {
  const url = 'user/logout/';
  return http.post(url);
};

// 获取用户信息
const pullUserInfo = () => {
  const url = 'user/info/';
  return http.post(url);
};

export { emailPasswordLogin, userLogout, pullUserInfo };
