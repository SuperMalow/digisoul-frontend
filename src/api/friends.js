import http from "./http";

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

export { createFriends, deleteFriends, getFriendsList };
