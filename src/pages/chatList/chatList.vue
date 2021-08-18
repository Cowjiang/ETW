<template>
    <view>
        <navigationBar ref="navigationBar" class="navigation-bar"/>
        <toast ref="toast"/>
        <!-- 可滑动区域 -->
        <scroll-view
            class="chat-list-container"
            :style="{height: `${windowHeight - navigationHeight}px`}"
            :scroll-y="true"
            :scroll-with-animation="true"
            :refresher-enabled="true"
            refresher-threshold="300"
            :refresher-triggered="refresherTriggered"
            @refresherrefresh="handleRefreshStart"
            @refresherrestore="handleRefreshEnd"
            @scrolltolower="handleScrollToBottom">
            <view class="list-scroll-view">
                <view class="top-list-container">
                    <!-- 顶部通知按钮区域 -->
                    <view
                        class="btn-container first-btn"
                        :data-name="`btn0`"
                        @touchstart="handleTouchStart"
                        @touchend="handleTouchEnd"
                        @touchcancel="handleTouchEnd"
                        @click="stopCheckingUpdate"
                        :style="{filter: `${messageTouchingId === 'btn0' ? 'brightness(90%)' : 'brightness(100%)'}`}">
                        <view class="btn-icon-container">
                            <view class="btn-icon"></view>
                            <view
                                class="btn-unread"
                                v-if="!btnMessageIsRead[0]"
                            ></view>
                        </view>
                        <view class="btn-title">赞</view>
                    </view>
                    <view
                        class="btn-container second-btn"
                        :data-name="`btn1`"
                        @touchstart="handleTouchStart"
                        @touchend="handleTouchEnd"
                        @touchcancel="handleTouchEnd"
                        :style="{filter: `${messageTouchingId === 'btn1' ? 'brightness(90%)' : 'brightness(100%)'}`}">
                        <view class="btn-icon-container">
                            <view class="btn-icon"></view>
                            <view
                                class="btn-unread"
                                v-if="!btnMessageIsRead[1]"
                            ></view>
                        </view>
                        <view class="btn-title">回复我的</view>
                    </view>
                    <view
                        class="btn-container third-btn"
                        :data-name="`btn2`"
                        @touchstart="handleTouchStart"
                        @touchend="handleTouchEnd"
                        @touchcancel="handleTouchEnd"
                        :style="{filter: `${messageTouchingId === 'btn2' ? 'brightness(90%)' : 'brightness(100%)'}`}">
                        <view class="btn-icon-container">
                            <view class="btn-icon"></view>
                            <view
                                class="btn-unread"
                                v-if="!btnMessageIsRead[2]"
                            ></view>
                        </view>
                        <view class="btn-title">关注</view>
                    </view>
                    <view
                        class="btn-container fourth-btn"
                        :data-name="`btn3`"
                        @touchstart="handleTouchStart"
                        @touchend="handleTouchEnd"
                        @touchcancel="handleTouchEnd"
                        :style="{filter: `${messageTouchingId === 'btn3' ? 'brightness(90%)' : 'brightness(100%)'}`}">
                        <view
                            class="btn-icon-container"
                            @touchstart="handleTouchStart"
                            @touchend="handleTouchEnd"
                            @touchcancel="handleTouchEnd">
                            <view class="btn-icon"></view>
                            <view
                                class="btn-unread"
                                v-if="!btnMessageIsRead[3]"
                            ></view>
                        </view>
                        <view class="btn-title">通知消息</view>
                    </view>
                </view>
                <!-- 聊天记录列表容器 -->
                <view class="main-list-container">
                    <view
                        class="message-container"
                        v-for="(message, index) in chatMessages"
                        :key="index"
                        :data-name="`message${index}`"
                        :style="{filter: `${messageTouchingId === 'message' + index ? 'brightness(90%)' : 'brightness(100%)'}`}"
                        @click="toChatDetail"
                        @longpress="handleLongPress"
                        @touchstart="handleTouchStart"
                        @touchend="handleTouchEnd"
                        @touchcancel="handleTouchEnd">
                        <view class="avatar-container">
                            <view class="avatar"></view>
                        </view>
                        <view class="content-container">
                            <view class="sender-name">
                                {{ message.senderName }}
                            </view>
                            <view class="message-content">
                                {{ message.isPhoto ? '[图片]' : message.content }}
                            </view>
                        </view>
                        <view class="time-container">
                            <view class="time">
                                {{ message.time | formatTime }}
                            </view>
                            <view
                                :class="message.isRead ? 'isread' : 'unread'"
                            >
                                {{ message.isRead ? '' : message.unreadCount | unreadCount }}
                            </view>
                        </view>
                    </view>
                    <view v-if="existMore && !loadingMore && chatMessages.length !== 0" class="load-more">
                        <text>下拉加载更多</text>
                    </view>
                    <view v-if="loadingMore && chatMessages.length !== 0" class="load-more">
                        <i class="fa fa-spinner fa-pulse fa-fw"></i>
                        <text>加载中</text>
                    </view>
                    <view v-if="!existMore && chatMessages.length !== 0" class="load-more">
                        <text>没有更多了哦 ~</text>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';
    import {getMyChatList} from "../../common/js/api/models.js";
    import {closeSocket, connectSocket} from "../../common/js/api/socket.js";

    export default {
        components: {
            toast, navigationBar
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                btnMessageIsRead: [true, true, false, true],
                pageSize: 15, //请求聊天记录每页数据的数量
                chatMessages: [], //聊天列表信息数组
                messageTouchingId: '', //当前触摸元素的id
                refresherTriggered: false, //scroll-view下拉刷新触发状态
                loadingMore: false, //正在加载更多消息
                existMore: true, //是否存在更多消息记录
            }
        },
        methods: {
            /**
             * 查询当前用户的聊天记录列表
             * @param {string|null} time 查询的时间戳，为空则查询第一页
             */
            getChatList(time = null) {
                let queryTime = time === null ? Date.now() : time;
                getMyChatList({
                    queryData: {
                        time: queryTime,
                        pageSize: this.pageSize
                    },
                })
                    .then(res => {
                        console.log(res.data)
                        if (time === null) {
                            let recordsTemp = [];
                            for (const records of res.data.records) {
                                recordsTemp.push({
                                    senderName: records.friendInfo.username, //用户名称
                                    senderId: records.friendId, //用户ID
                                    senderAvatar: records.friendInfo.avgPath, //用户头像地址
                                    messageId: records.id, //消息ID
                                    content: records.content, //消息内容
                                    isPhoto: !records.isText, //是否为图片消息
                                    time: records.createdTime, //消息发送时间
                                    isRead: records.isRead, //消息是否已读
                                    unreadCount: records.unread //当前对话消息未读数量
                                })
                            }
                            this.chatMessages = [];
                            this.chatMessages = recordsTemp;
                            this.existMore = recordsTemp.length > 14;
                            this.refresherTriggered = false;
                            this._freshing = false;
                        }
                        else {
                            for (const records of res.data.records) {
                                if (records.id !== this.chatMessages[this.chatMessages.length - 2].messageId) {
                                    this.chatMessages.push({
                                        senderName: records.friendInfo.username, //用户名称
                                        senderId: records.friendId, //用户ID
                                        senderAvatar: records.friendInfo.avgPath, //用户头像地址
                                        messageId: records.id, //消息ID
                                        content: records.content, //消息内容
                                        isPhoto: !records.isText, //是否为图片消息
                                        time: records.createdTime, //消息发送时间
                                        isRead: records.isRead, //消息是否已读
                                        unreadCount: records.unread //当前对话消息未读数量
                                    })
                                }
                                else {
                                    this.existMore = false;
                                    break;
                                }
                            }
                            this.loadingMore = false;
                        }
                        this.$forceUpdate();
                    })
                    .catch(err => {
                        console.log(err)
                        this.refresherTriggered = false;
                        this._freshing = false;
                        this.$forceUpdate();
                    })
            },
            /**
             * 监听接收到新消息
             * @param {Object} data 接收到的新消息
             */
            receiveNewMessage(data) {
                console.log(data);
                if (data.errorCode === 120) {
                    let data = data.data;
                    console.log(data)
                    let findIndex = this.chatMessages.findIndex(message => {
                        return message.senderId === data.friendId
                    });
                    if (findIndex !== -1) {
                        let messageTemp = this.chatMessages[findIndex];
                        this.chatMessages.splice(findIndex, 1);
                        this.chatMessages.unshift({
                            senderName: messageTemp.senderName, //用户名称
                            senderId: messageTemp.senderId, //用户ID
                            senderAvatar: messageTemp.senderAvatar, //用户头像地址
                            messageId: data.id, //消息ID
                            content: data.content, //消息内容
                            isPhoto: !data.isText, //是否为图片消息
                            time: data.createdTime, //消息发送时间
                            isRead: data.isRead, //消息是否已读
                            unreadCount: messageTemp.unreadCount + 1 //当前对话消息未读数量
                        });
                    }
                    else {
                        this.chatMessages.unshift({
                            senderName: '', //用户名称
                            senderId: data.friendId, //用户ID
                            senderAvatar: '', //用户头像地址
                            messageId: data.id, //消息ID
                            content: data.content, //消息内容
                            isPhoto: !data.isText, //是否为图片消息
                            time: data.createdTime, //消息发送时间
                            isRead: data.isRead, //消息是否已读
                            unreadCount: 1 //当前对话消息未读数量
                        });
                    }
                }
            },
            // 跳转聊天详情页
            toChatDetail(e) {
                let targetId = parseInt(e.target.dataset.name.replace('message', ''));
                let senderInfo = `senderId=${this.chatMessages[targetId].senderId}&senderName=${this.chatMessages[targetId].senderName}`;
                uni.redirectTo({
                    url: `/pages/chatDetail/chatDetail?${senderInfo}`,
                })
            },
            // 监听长按事件
            handleLongPress(e) {
                let targetId = parseInt(e.target.dataset.name.replace('message', ''));
                uni.showActionSheet({
                    itemList: ['删除', '加入黑名单'],
                    itemColor: '#f35b56',
                    success: res => {
                        if (res.tapIndex === 0) {

                        }
                        else {

                        }
                    }
                });
            },
            // 监听消息触摸开始事件
            handleTouchStart(e) {
                this.messageTouchingId = e.target.dataset.name;
                this.$forceUpdate();
            },
            // 监听消息触摸结束事件
            handleTouchEnd() {
                this.messageTouchingId = '';
                this.$forceUpdate();
            },
            // 监听下拉刷新事件触发
            handleRefreshStart() {
                if (this._freshing) return;
                this._freshing = true;
                setTimeout(() => {
                    this.getChatList();
                }, 300);
            },
            // 监听下拉刷新事件结束
            handleRefreshEnd() {
                this.refresherTriggered = 'restore';
            },
            // 监听scroll-view滚动到底部
            handleScrollToBottom() {
                this.utils.throttle(() => {
                    if (!this.loadingMore && this.existMore) {
                        this.loadingMore = true;
                        this.getChatList(this.chatMessages[this.chatMessages.length - 1].time);
                    }
                }, 1000);
            },
            // 开启Socket连接
            startCheckingUpdate() {
                this._freshing = false; //还原下拉刷新状态
                setTimeout(() => {
                    this.refresherTriggered = true; //开启下拉刷新
                }, 0);
                //开启Socket连接
                uni.getStorage({
                    key: 'uid',
                    success: res => {
                        connectSocket(res.data)
                            .then(res => {
                                uni.onSocketMessage(res => {
                                    this.receiveNewMessage(JSON.parse(res.data)); //监听到Socket新消息
                                });
                            })
                            .catch(err => {
                                console.log(err);
                            })
                    },
                    fail: err => {
                        console.log(err);
                        let currentPage = utils.getCurrentPage();
                        uni.redirectTo({
                            url: `/pages/login/login?redirectPath=${currentPage.curUrl}`
                        });
                    }
                });
            },
            // 关闭Socket连接
            stopCheckingUpdate() {
                uni.onSocketClose(res => {
                    console.log('已关闭')
                });
                closeSocket()
                    .then(res => {
                        this.$refs.toast.show({
                            text: '已断开socket',
                            type: 'success'
                        })
                    })
                    .catch(err => {
                        if (err.errMsg === 'closeSocket:fail WebSocket is not connected') {
                            return;
                        }
                        console.error(err)
                    })
            },
        },
        computed: {},
        filters: {
            /**
             * 格式化时间
             * @param {string} time 传入的时间字符串
             * @return {string} 格式化后的时间字符串
             */
            formatTime(time) {
                let messageDate = new Date(time);
                let nowDate = new Date();
                let messageTime = {
                    year: messageDate.getFullYear(),
                    month: messageDate.getMonth() + 1,
                    day: messageDate.getDate(),
                    hour: messageDate.getHours().toString().padStart(2, '0'),
                    min: messageDate.getMinutes().toString().padStart(2, '0'),
                    second: messageDate.getSeconds()
                }
                let nowTime = {
                    year: nowDate.getFullYear(),
                    month: nowDate.getMonth() + 1,
                    day: nowDate.getDate()
                }
                if (messageTime.year === nowTime.year && messageTime.month === nowTime.month && messageTime.day === nowTime.day) {
                    return `${messageTime.hour}:${messageTime.min}`;
                }
                else if (messageTime.year === nowTime.year) {
                    return `${messageTime.month}月${messageTime.day}日`;
                }
                else {
                    return `${messageTime.year}年${messageTime.month}月${messageTime.day}日`;
                }
            },
            /**
             * 格式化未读消息数
             * @param {number} count 未读消息数
             * @return {string|number} 返回格式化后的结果
             */
            unreadCount(count) {
                if (count > 99) {
                    return '99+';
                }
                else return count;
            }
        },
        watch: {},
        mounted() {
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                },
            }); //获取窗口尺寸
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
        },
        onLoad() {
        },
        onShow() {
            this.startCheckingUpdate();
            this.$refs.navigationBar.setNavigation({
                titleText: '消息',
                backgroundColor: '#f6f6f6'
            });
        },
        onHide() {
            this.stopCheckingUpdate();
        },
        onUnload() {
            this.stopCheckingUpdate();
        },
        beforeDestroy() {
            this.stopCheckingUpdate();
        }
    }
</script>

<style lang="scss" scoped>
    .chat-list-container {
        width: 100vw;
        height: 100vh;
        background-color: #f6f6f6;

        .list-scroll-view {
            width: 100vw;
            height: fit-content;

            .top-list-container {
                width: 100vw;
                height: fit-content;
                background-color: #fff;
                border-radius: rpx(30);
                margin-bottom: rpx(20);
                padding: rpx(40) rpx(20);
                display: flex;
                flex-direction: row;

                .btn-container {
                    flex: 1;
                    margin: 0 rpx(30);
                    text-align: center;

                    .btn-icon-container {
                        width: rpx(80);
                        height: rpx(80);
                        margin: 0 auto rpx(20);
                        pointer-events: none;

                        .btn-icon {
                            width: 100%;
                            height: 100%;
                            background-color: deepskyblue;
                            border-radius: rpx(150);
                        }

                        .btn-unread {
                            width: rpx(25);
                            height: rpx(25);
                            position: relative;
                            top: rpx(-80);
                            left: rpx(55);
                            background-color: #f35b56;
                            color: #fff;
                            text-align: center;
                            font-size: rpx(22);
                            line-height: rpx(40);
                            border-radius: rpx(150);
                        }
                    }

                    .btn-title {
                        font-size: rpx(26);
                        color: #333;
                    }
                }
            }

            .main-list-container {
                width: 100vw;
                height: fit-content;
                background-color: #fff;
                border-radius: rpx(30);

                .message-container:first-child {
                    border-top: none;
                    border-radius: rpx(30) rpx(30) 0 0;
                }

                .message-container:last-child {
                    border-radius: 0 0 rpx(30) rpx(30);
                }

                .message-container {
                    width: 100vw;
                    height: rpx(150);
                    background-color: #fff;
                    padding: 0 rpx(30);
                    display: flex;
                    flex-direction: row;
                    border-top: rpx(1) solid #f6f6f6;

                    .avatar-container {
                        width: rpx(120);
                        height: 100%;
                        margin-top: rpx(30);
                        pointer-events: none;

                        .avatar {
                            width: rpx(90);
                            height: rpx(90);
                            border-radius: rpx(150);
                            background-color: orange;
                        }
                    }

                    .content-container {
                        flex: 1;
                        overflow: hidden;
                        white-space: nowrap;
                        margin: auto 0;
                        pointer-events: none;

                        .sender-name {
                            font-size: rpx(32);
                            line-height: rpx(50);
                            color: #333;
                        }

                        .message-content {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            font-size: rpx(26);
                            line-height: rpx(50);
                            color: #999999;
                        }
                    }

                    .time-container {
                        width: fit-content;
                        height: fit-content;
                        margin-top: rpx(30);
                        margin-left: auto;
                        pointer-events: none;

                        .time {
                            font-size: rpx(24);
                            color: #999999;
                            margin-bottom: rpx(20);
                        }

                        .unread {
                            width: fit-content;
                            min-width: rpx(32);
                            height: rpx(32);
                            padding: 0 rpx(8);
                            background-color: #f35b56;
                            color: #fff;
                            text-align: center;
                            font-size: rpx(22);
                            line-height: rpx(32);
                            border-radius: rpx(150);
                            font-weight: bold;
                            float: right;
                        }

                        .isread {
                            min-width: rpx(40);
                            height: rpx(40);
                            float: right;
                        }
                    }
                }

                .load-more {
                    font-size: rpx(28);
                    height: fit-content;
                    text-align: center;
                    width: 100%;
                    color: $uni-text-color-placeholder;
                    background-color: #fff;
                    margin-top: rpx(50);
                    padding-bottom: rpx(100);

                    text {
                        margin-left: rpx(10);
                    }
                }
            }

            .no-more-chats {
                width: 100vw;
                height: rpx(100);
                font-size: rpx(24);
                color: #999999;
                line-height: rpx(100);
                text-align: center;
                background-color: #f6f6f6;
            }
        }
    }
</style>