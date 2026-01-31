import http from "./http";

// 邮箱密码登录
const emailPasswordLogin = (data) => {
  const url = 'user/password/login/';
  return http.post(url, data);
};

export { emailPasswordLogin };
