import http from "./http";

/**
 * 更新用户简介
 * @param {Object} data - { username?, profile?, photo? } 支持 FormData 或普通对象
 */
const updateUserProfile = (data) => {
  const url = "user/profile/update/";
  // FormData 时由 axios 自动设置 Content-Type（含 boundary），勿手动指定
  return http.post(url, data);
};

export { updateUserProfile };
