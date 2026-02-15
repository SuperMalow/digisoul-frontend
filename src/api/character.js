import http from "./http";

/**
 * 新增创作角色
 * @param {Object} data - { name?, photo?, background_photo?, profile? } 支持 FormData 或普通对象
 */
const createCharacter = (data) => {
    const url = "character/create/";
    // FormData 时由 axios 自动设置 Content-Type（含 boundary），勿手动指定
    return http.post(url, data);
};

/**
 * 更新创作角色
 * @param {Object} data - { uuid?, name?, photo?, background_photo?, profile? } 支持 FormData 或普通对象
 */
const updateCharacter = (data) => {
    const url = "character/update/";
    // FormData 时由 axios 自动设置 Content-Type（含 boundary），勿手动指定
    return http.post(url, data);
};

export { createCharacter, updateCharacter };
