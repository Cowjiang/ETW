import store from '@/common/js/store';
import {httpBaseUrl, wsBaseUrl} from "@/common/js/api/models.js";

/**
 * 连接WebSocket
 * @param {String|Number} uid 用户id
 */
export const connectSocket = uid => {
    if (!store.state.connectingSocket) {
        return new Promise(async (resolve, reject) => {
            console.log('开始连接socket');
            store.commit('connectingSocket', true);
            let headerData = {"Content-type": "application/json"};
            if (uni.getStorageSync("cookie") !== undefined) {
                headerData["cookie"] = uni.getStorageSync("cookie");
            }
            await uni.request({
                url: `${httpBaseUrl}/socket/connection`,
                method: 'GET',
                header: headerData,
                success: async res => {
                    if (res.data.errorCode === 3002) {
                        store.commit('userInfo', null);
                        reject('未登录');
                    }
                    else {
                        await uni.connectSocket({
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
    else {
        return new Promise((resolve, reject) => {
            reject('正在连接');
        });
    }
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