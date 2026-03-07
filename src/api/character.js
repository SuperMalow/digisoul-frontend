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

/**
 * 删除创作角色
 * @param {String} uuid - 角色 uuid
 */
const deleteCharacter = (uuid) => {
    return http.post(`character/delete/`, { uuid });
};

/**
 * 获取创作角色
 * @param {String} uuid - 角色 uuid
 */
const getCharacter = (uuid) => {
    return http.get(`character/get/?uuid=${uuid}`);
};

/**
 * 获取创作角色列表
 * @param {String} uuid - 用户 uuid
 */
const getCharacterList = (uuid, page = 1, page_size = 10) => {
    return http.get(`character/list/?uuid=${uuid}&page=${page}&page_size=${page_size}`);
};

/**
 * 获取创作角色列表 - 首页
 */
const getCharacterListIndex = (page = 1, page_size = 10, q = null) => {
    if (q) {
        return http.get(`character/list/index/?page=${page}&page_size=${page_size}&q=${q}`);
    }
    return http.get(`character/list/index/?page=${page}&page_size=${page_size}`);
};

export { createCharacter, updateCharacter, deleteCharacter, getCharacter, getCharacterList, getCharacterListIndex };
