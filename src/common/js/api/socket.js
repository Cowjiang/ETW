import {getUserToken, httpBaseUrl, wsBaseUrl} from "@/common/js/api/models.js";

/**
 * 连接WebSocket
 * @param {String|Number} uid 用户id
 */
export const connectSocket = uid => {
    return new Promise((resolve, reject) => {
        let headerData = { "Content-type": "application/json" };
        if (uni.getStorageSync("cookie") !== undefined) {
            headerData["cookie"] = uni.getStorageSync("cookie");
        }
        uni.request({
            url: `${httpBaseUrl}/socket/connection`,
            method: 'GET',
            header: headerData,
            success: res => {
                if (res.data.errorCode === 3002) {
                    reject('未登录');
                }
                else {
                    uni.connectSocket({
                        url: `${wsBaseUrl}/${res.data.data}/${uid}`,
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
                }
            },
            fail: err => {
                reject(err);
            }
        });
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