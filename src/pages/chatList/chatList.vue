<template>
    <view>
        <navigationBar ref="navigationBar" class="navigation-bar"/>
        <toast ref="toast" class="toast"/>

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
        >
            <view class="list-scroll-view">
                <view class="top-list-container">
                    <view
                        class="btn-container first-btn"
                        :data-name="`btn0`"
                        @touchstart="handleTouchStart"
                        @touchend="handleTouchEnd"
                        @touchcancel="handleTouchEnd"
                        @click="stopCheckingUpdate"
                        :style="{filter: `${messageTouchingId === 'btn0' ? 'brightness(90%)' : 'brightness(100%)'}`}"
                    >
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
                        :style="{filter: `${messageTouchingId === 'btn1' ? 'brightness(90%)' : 'brightness(100%)'}`}"
                    >
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
                        :style="{filter: `${messageTouchingId === 'btn2' ? 'brightness(90%)' : 'brightness(100%)'}`}"
                    >
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
                        :style="{filter: `${messageTouchingId === 'btn3' ? 'brightness(90%)' : 'brightness(100%)'}`}"
                    >
                        <view
                            class="btn-icon-container"
                            @touchstart="handleTouchStart"
                            @touchend="handleTouchEnd"
                            @touchcancel="handleTouchEnd"
                        >
                            <view class="btn-icon"></view>
                            <view
                                class="btn-unread"
                                v-if="!btnMessageIsRead[3]"
                            ></view>
                        </view>
                        <view class="btn-title">通知消息</view>
                    </view>
                </view>
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
                        @touchcancel="handleTouchEnd"
                    >
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
                </view>
                <view class="no-more-chats" v-if="chatMessages.length > 90">
                    仅显示最近 {{ pageSize }} 条聊天记录
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';
    import {getMyChatList} from "../../common/js/api/models.js";

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
                pageSize: 100,
                currentPage: -1,
                totalPage: NaN,
                chatMessages: [],
                messageTouchingId: '',
                checkUpdateTimer: null,
                refresherTriggered: false,

            }
        },
        methods: {
            getChatList(queryPage = NaN, isCheckUpdate = false) {
                getMyChatList({
                    queryData: {
                        pageNumber: isCheckUpdate ? 1 : queryPage || this.currentPage + 1,
                        pageSize: this.pageSize
                    },
                })
                    .then(res => {
                        console.log(res.data)
                        let recordsTemp = [];
                        for (const records of res.data.records) {
                            recordsTemp.unshift({
                                senderName: records.friendInfo.username,
                                senderId: records.friendId,
                                senderAvatar: records.friendInfo.avgPath,
                                messageId: records.id,
                                content: records.content,
                                isPhoto: !records.isText,
                                time: records.createdTime,
                                isRead: records.isRead,
                                unreadCount: records.unread
                            })
                        }
                        // if (this.chatMessages.sort().toString() !== recordsTemp.sort().toString()) {
                        //     this.chatMessages = recordsTemp;
                        //     console.log(this.chatMessages)
                        // }
                        this.chatMessages = recordsTemp;
                        this.refresherTriggered = false;
                        this._freshing = false;
                        this.$forceUpdate();
                    })
                    .catch(err => {
                        console.log(err)
                        this.refresherTriggered = false;
                        this._freshing = false;
                        this.$forceUpdate();
                    })
            },
            toChatDetail(e) {
                let targetId = parseInt(e.target.dataset.name.replace('message', ''));
                let senderInfo = `senderId=${this.chatMessages[targetId].senderId}&senderName=${this.chatMessages[targetId].senderName}`;
                uni.redirectTo({
                    url: `/pages/chatDetail/chatDetail?${senderInfo}`,
                })
            },
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
            handleRefreshStart() {
                if (this._freshing) return;
                this._freshing = true;
                setTimeout(() => {
                    this.getChatList();
                }, 300);
                this.stopCheckingUpdate();
                this.checkUpdateTimer = setInterval(() => {
                    this.getChatList();
                }, 3000);
            },
            handleRefreshEnd() {
                this.refresherTriggered = 'restore';
            },
            stopCheckingUpdate() {
                if (this.checkUpdateTimer !== null) {
                    clearInterval(this.checkUpdateTimer);
                    this.checkUpdateTimer = null;
                }
            },
        },
        computed: {},
        filters: {
            /**
             * 格式化时间
             * @param time [String] 传入的时间字符串
             * @return formattedTime 格式化后的时间
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
            this.$refs.navigationBar.setNavigation({
                titleText: '消息',
                backgroundColor: '#f6f6f6'
            });
            this.stopCheckingUpdate();
            this._freshing = false;
            setTimeout(() => {
                this.refresherTriggered = true;
            }, 1000);
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
                    border-bottom: rpx(1) solid #f6f6f6;

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