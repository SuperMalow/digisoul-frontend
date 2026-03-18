import http from "./http";
import streamApi from "./streamApi";
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
 * 获取角色扩展设置
 * @param {String} character_uuid - 角色 uuid
 */
const getCharacterSettings = (character_uuid) => {
    return http.get(`character/settings/get/?character_uuid=${character_uuid}`);
};

/**
 * 更新角色扩展设置
 * @param {Object} data - { uuid, is_public?, short_profile?, voice_uuid? }
 */
const updateCharacterSettings = (data) => {
    return http.post('character/settings/update/', data);
};

/**
 * 获取角色音色列表
 */
const getCharacterVoiceList = () => {
    return http.get(`character/voice/get/`);
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

/**
 * 角色性格优化 - 流式
 * @param {Object} data - { character_uuid, character_description }
 * @param {Function} onmessage - 消息回调
 * @param {Function} onerror - 错误回调
 */
const characterProfileOptimization = (data, onmessage, onerror) => {
    return streamApi(`tti/character/profile/optimization/`, { method: 'POST', body: data, onmessage, onerror });
};

/**
 * 生成图片提示词 - 流式
 * @param {Object} data - { character_uuid }
 * @param {Function} onmessage - 消息回调
 * @param {Function} onerror - 错误回调
 */
const generateImagePrompt = (data, onmessage, onerror) => {
    return streamApi(`tti/generate/image/prompt/`, { method: 'POST', body: data, onmessage, onerror });
};

/**
 * 提交图片生成任务
 * @param {String} prompt - 生图提示词
 */
const generateImageTask = (prompt) => {
    return http.post(`tti/generate/image/`, { prompt });
};

/**
 * 查询图片生成任务状态
 * @param {String} task_id - 任务ID
 */
const getGenerateImageTaskStatus = (task_id) => {
    return http.get(`tti/generate/image/task/?task_id=${task_id}`);
};

/**
 * 下载生成任务的图片文件（后端代理）
 * @param {String} task_id - 任务ID
 */
const getGenerateImageTaskFile = (task_id) => {
    return http.get(`tti/generate/image/task/file/?task_id=${task_id}`, {}, { responseType: 'blob' });
};

/**
 * 取消图片生成任务
 * @param {String} task_id - 任务ID
 */
const cancelGenerateImageTask = (task_id) => {
    return http.post(`tti/generate/image/task/cancel/`, { task_id });
};

export {
    createCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacter,
    getCharacterSettings,
    updateCharacterSettings,
    getCharacterVoiceList,
    getCharacterList,
    getCharacterListIndex,
    characterProfileOptimization,
    generateImagePrompt,
    generateImageTask,
    getGenerateImageTaskStatus,
    getGenerateImageTaskFile,
    cancelGenerateImageTask,
};
