import http from "./http";

/**
 * 新增好友
 * @param {Number} page - 页码
 * @param {Number} page_size - 每页条数
 */

/**
 * 获取好友列表
 * @param {Number} page - 页码
 * @param {Number} page_size - 每页条数
 */
const getFriendsList = (page = 1, page_size = 20) => {
    return http.get(`friends/list/?page=${page}&page_size=${page_size}`);
};

export { getFriendsList };
