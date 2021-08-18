import {getUserToken, wsBaseUrl} from "@/common/js/api/models.js";

/**
 * 连接WebSocket
 * @param {number} uid 用户id
 */
export const connectSocket = uid => {
    return new Promise((resolve, reject) => {
        getUserToken({})
            .then(res => {
                uni.connectSocket({
                    url: `${wsBaseUrl}/${res.data}/${uid}`,
                    header: {
                        'content-type': 'application/json'
                    },
                    method: 'GET',
                    success: socketResponse => {
                        uni.onSocketOpen(res => {
                            resolve(socketResponse);
                        });
                    },
                    fail: err => {
                        reject(err);
                    }
                });
            })
            .catch(err => {
                reject(err);
            })
    });
}

// 关闭WebSocket连接
export const closeSocket = () => {
    return new Promise((resolve, reject) => {
        uni.closeSocket({
            success: socketResponse => {
                if (socketResponse.errMsg === 'closeSocket:ok') {
                    resolve(socketResponse);
                }
                else {
                    reject(socketResponse);
                }
            },
            fail: err => {
                reject(err);
            }
        });
    });
}