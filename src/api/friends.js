import http from "./http";
import streamApi from "./streamApi";

/**
 * 新增好友
 * @param {Number} page - 页码
 * @param {Number} page_size - 每页条数
 */
const createFriends = (character_uuid) => {
    return http.post(`friends/create/`, { character_uuid });
};

/**
 * 删除好友
 * @param {String} uuid - 好友 uuid
 */
const deleteFriends = (friend_uuid) => {
    return http.post(`friends/delete/`, { friend_uuid });
};

/**
 * 获取好友列表
 * @param {Number} page - 页码
 * @param {Number} page_size - 每页条数
 */
const getFriendsList = (page = 1, page_size = 20) => {
    return http.get(`friends/list/?page=${page}&page_size=${page_size}`);
};

/**
 * 发送聊天消息
 * @param {String} friend_uuid - 好友 uuid
 * @param {String} message - 消息
 */
const sendMessage = (friend_uuid, message) => {
    return http.post(`friends/message/chat/`, { friend_uuid: friend_uuid, message: message });
};

/**
 * 发送聊天消息 - 流式
 * @param {String} friend_uuid - 好友 uuid
 * @param {String} message - 消息
 */
const sendMessageStream = (data, onmessage, onerror) => {
    return streamApi(`friends/message/chat/`, { method: 'POST', body: data, onmessage, onerror });
};

export { createFriends, deleteFriends, getFriendsList, sendMessage, sendMessageStream };
