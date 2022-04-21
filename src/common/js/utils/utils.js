import store from '@/common/js/store';
import {closeSocket, connectSocket} from "@/common/js/api/socket";
import {getMyChatList, getUnreadCount, logOut} from "@/common/js/api/models";

export class Utils {
    constructor() {
        this.throttleBackTime = 0;
        this.throttleGapTime = 0;
        this.throttleEnterTime = 0;
        this.debounceTimer;
        this.debounceGapTime = 0;
    }

    /**
     * 节流函数
     * @param {Function} fn 要执行的方法
     * @param {Number} interval 等待时间，默认500ms
     */
    throttle(fn, interval) {
        this.throttleGapTime = interval || 500;
        (() => {
            this.throttleBackTime = new Date();
            if (this.throttleBackTime - this.throttleEnterTime > this.throttleGapTime) {
                fn.call(this, arguments);
                this.throttleEnterTime = this.throttleBackTime;
            }
        })();
    }

    // 重置节流函数（仅供特殊情况使用）
    resetThrottle() {
        this.throttleBackTime = 0;
        this.throttleGapTime = 0;
        this.throttleEnterTime = 0;
    }

    /**
     * 防抖函数
     * @param {Function} fn 要执行的方法
     * @param {Number} interval 等待时间，默认500ms
     */
    debounce(fn, interval) {
        this.debounceGapTime = interval || 500;
        (() => {
            clearTimeout(this.debounceTimer);
            let args = arguments;
            this.debounceTimer = setTimeout(() => {
                fn.call(this, args);
            }, this.debounceGapTime);
        })();
    }

    /**
     * 总页数
     * @param（总条数，每页总条数）
     */
    getTotalPages(total, pageSize) {
        if (!total) {
            return 0;
        }
        else {
            if (pageSize != 0 &&
                total % pageSize == 0) {
                return parseInt(total / pageSize);
            }
            if (pageSize != 0 &&
                total % pageSize != 0) {
                return parseInt(total / pageSize) + 1;
            }
        }
    }

    // 获取导航栏高度
    getNavigationHeight() {
        let windowWidth;
        uni.getSystemInfo({
            success: res => windowWidth = res.windowWidth,
        });
        const {height, top, right} = wx.getMenuButtonBoundingClientRect(); //获取胶囊按钮尺寸信息
        return height + top + windowWidth - right;
    }

    // 获取当前页面URL及参数
    getCurrentPage() {
        const routes = getCurrentPages(); //获取当前打开过的页面路由数组
        const curRoute = routes[routes.length - 1].route; //获取当前页面路由
        const curParam = routes[routes.length - 1].options; //获取路由参数
        const curFullUrl = routes[routes.length - 1].$page.fullPath;
        // 拼接参数
        let param = '';
        for (let key in curParam) {
            param += '&' + key + '=' + curParam[key];
        }
        return {
            curFullUrl: curFullUrl, //{String} 页面完整路径（含参数）
            curUrl: curRoute, //{String} 页面路径（不含参数）
            curParam: curParam, //{Object} 页面参数
        };
    }

    /**
     * @description: 判断对象的键是否为空
     * @param {*} obj 需要判断的对象
     * @param {*} arr 数组内为该对象可以为空的键
     */
    isObjectAnyKeyEmpty(obj, arr) {
        let isAnyKeyEmpty = false
        for (const key in obj) {
            if (arr && arr.indexOf(key) !== -1) {
                continue;
            }
            if (!obj[key] || obj[key] === {} || obj[key] === []) {
                isAnyKeyEmpty = true;
                break
            }
        }
        return isAnyKeyEmpty
    }

    // 连接socket
    async connectSocket() {
        return new Promise((resolve, reject) => {
            if (store.state.userInfo) {
                connectSocket(store.state.userInfo.userId).then(() => {
                    console.log('已连接socket');
                    store.commit('socketStatus', true);
                    getUnreadCount().then(res => {
                        if (res.success) {
                            const unread = res.data.reduce((pre, current) => pre + Number(current.count), 0);
                            store.commit('unreadMessageCount', unread);
                        }
                    }).catch(err => {});
                    uni.getStorage({
                        key: "chat",
                        success: res => {
                            store.commit('chatMessages', res.data);
                        }
                    });
                    uni.onSocketMessage(res => {
                        let chatMessages = store.state.chatMessages;
                        const data = JSON.parse(res.data);
                        if (data.errorCode === 120) {
                            // 新私信
                            store.commit('unreadMessageCount', store.state.unreadMessageCount + 1);
                            const newMessage = data.data.messageInfo;
                            const findIndex = chatMessages.findIndex(message => message.senderId === newMessage.friendId);
                            if (findIndex !== -1) {
                                //消息列表中存在的消息
                                const messageTemp = chatMessages[findIndex];
                                chatMessages.splice(findIndex, 1);
                                chatMessages.unshift({
                                    senderName: messageTemp.senderName, //用户名称
                                    senderId: messageTemp.senderId, //用户ID
                                    senderAvatar: messageTemp.senderAvatar, //用户头像地址
                                    messageId: newMessage.id, //消息ID
                                    content: newMessage.content, //消息内容
                                    isPhoto: !newMessage.isText, //是否为图片消息
                                    time: newMessage.createdTime, //消息发送时间
                                    isRead: newMessage.isRead, //消息是否已读
                                    unreadCount: messageTemp.unreadCount + 1 || 1, //当前对话消息未读数量
                                    isBlocked: messageTemp.isBlocked, //聊天对象是否在黑名单中
                                });
                            }
                            else {
                                //消息列表中不存在的消息
                                chatMessages.unshift({
                                    senderName: data.data.userInfo.username, //用户名称
                                    senderId: data.data.messageInfo.friendId, //用户ID
                                    senderAvatar: data.data.userInfo.avgPath, //用户头像地址
                                    messageId: data.data.messageInfo.id, //消息ID
                                    content: data.data.messageInfo.content, //消息内容
                                    isPhoto: !data.data.messageInfo.isText, //是否为图片消息
                                    time: data.data.messageInfo.createdTime, //消息发送时间
                                    isRead: data.data.messageInfo.isRead, //消息是否已读
                                    unreadCount: 1, //当前对话消息未读数量
                                    isBlocked: false, //聊天对象是否在黑名单中
                                });
                            }
                            store.commit('chatMessages', chatMessages);
                        }
                        else if (data.errorCode === 121) {
                            store.commit('unreadMessageCount', store.state.unreadMessageCount + 1);
                        }
                    });
                    resolve();
                }).catch(err => {
                    if (err !== '未登录') {
                        console.error(err);
                    }
                });
            }
            else {
                reject('未登录');
            }
        });
    }

    // 关闭socket
    async closeSocket() {
        uni.onSocketClose(res => {
            console.log('已关闭Socket');
            store.commit('socketStatus', false);
        });
        await closeSocket().then(res => {
            const chatMessages = store.state.chatMessages;
            store.commit('chatMessages', chatMessages.slice(0, 14));
            uni.setStorage({
                key: "chat",
                data: chatMessages.slice(0, 14),
                fail: err => {
                    console.error(err);
                }
            });
            uni.removeTabBarBadge({
                index: 2
            });
        }).catch(err => {
            if (err.errMsg === 'closeSocket:fail WebSocket is not connected') {
                return;
            }
            console.error(err);
        });
    }

    // 退出登录
    async logout() {
        await logOut();
        await uni.removeStorage({
            key: 'cookie'
        });
        await uni.removeStorage({
            key: 'userInfo'
        });
        await uni.removeStorage({
            key: 'shopkeeper'
        });
        await this.closeSocket();
        store.commit('userInfo', null);
        store.commit('shopkeeper', false);
        store.commit('chatMessages', []);
        store.commit('unreadMessageCount', 0);
        uni.removeTabBarBadge({
            index: 2
        });
    }
}

