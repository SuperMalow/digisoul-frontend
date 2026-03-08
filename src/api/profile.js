import http from "./http";

/**
 * 更新用户简介
 * @param {Object} data - { username?, profile?, photo? } 支持 FormData 或普通对象
 */
const updateUserProfile = (data) => {
  const url = "user/profile/update/";
  return http.post(url, data);
};

export { updateUserProfile };
