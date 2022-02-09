<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading
      ref="loading"
      fullscreen
      maskColor="#f6f6f6"></loading>
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
        <!-- 顶部按钮列表容器 -->
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
              <view class="btn-unread" v-if="!btnMessageIsRead[2]"></view>
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
              <view class="btn-unread" v-if="!btnMessageIsRead[3]"></view>
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
              <view class="avatar">
                <image :src="message.senderAvatar" mode="widthFix"></image>
              </view>
            </view>
            <view class="content-container">
              <view class="sender-name">
                <view class="name">
                  {{ message.senderName }}
                </view>
                <!--                                <view class="blacklist-user">-->
                <!--                                    黑名单-->
                <!--                                </view>-->
              </view>
              <view class="message-content">
                {{ message.isPhoto ? '[图片]' : message.content }}
              </view>
            </view>
            <view class="time-container">
              <view class="time">
                {{ message.time | formatTime }}
              </view>
              <view :class="message.isRead ? 'isread' : 'unread'">
                {{ message.isRead ? '' : message.unreadCount | unreadCount }}
              </view>
            </view>
          </view>
          <view v-show="existMore && !loadingMore && chatMessages.length !== 0" class="load-more">
            <text>下拉加载更多</text>
          </view>
          <view v-show="loadingMore && chatMessages.length !== 0" class="load-more loading-more">
            <loading ref="loadingMore"></loading>
          </view>
          <view v-show="!existMore && chatMessages.length !== 0" class="load-more">
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
    import {loading} from '../../components/loading/loading.vue';
    import {deleteChatWithFriend, getMyChatList} from "../../common/js/api/models.js";
    import {closeSocket, connectSocket} from "../../common/js/api/socket.js";

    export default {
        components: {
            toast, navigationBar, loading
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
             * @param {null|String} time 查询的时间戳，为空则查询第一页
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
                            if (res.data.records.length !== 0) {
                                for (const records of res.data.records) {
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
                                    if (res.data.records.length < this.pageSize) {
                                        this.existMore = false;
                                    }
                                }
                            }
                            else {
                                this.existMore = false;
                            }
                            this.loadingMore = false;
                        }
                        if (this.$refs.loading.isLoading) {
                            this.$refs.loading.stopLoading();
                        }
                        this.$forceUpdate();
                    })
                    .catch(err => {
                        console.log(err)
                        this.refresherTriggered = false;
                        this._freshing = false;
                        this.utils.throttle(() => {
                            this.$refs.toast.show({
                                text: '网络异常',
                                type: 'error',
                                direction: 'top'
                            });
                        }, 2500);
                        if (this.$refs.loading.isLoading) {
                            this.$refs.loading.stopLoading();
                        }
                        this.loadingMore = false;
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
                    let newMessage = data.data;
                    let findIndex = this.chatMessages.findIndex(message => {
                        return message.senderId === newMessage.friendId
                    });
                    if (findIndex !== -1) {
                        let messageTemp = this.chatMessages[findIndex];
                        this.chatMessages.splice(findIndex, 1);
                        this.chatMessages.unshift({
                            senderName: messageTemp.senderName, //用户名称
                            senderId: messageTemp.senderId, //用户ID
                            senderAvatar: messageTemp.senderAvatar, //用户头像地址
                            messageId: newMessage.id, //消息ID
                            content: newMessage.content, //消息内容
                            isPhoto: !newMessage.isText, //是否为图片消息
                            time: newMessage.createdTime, //消息发送时间
                            isRead: newMessage.isRead, //消息是否已读
                            unreadCount: messageTemp.unreadCount + 1 || 1 //当前对话消息未读数量
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
                let senderInfo = `senderId=${this.chatMessages[targetId].senderId}&senderName=${this.chatMessages[targetId].senderName}&senderAvatar=${this.chatMessages[targetId].senderAvatar}`;
                this.chatMessages[targetId].isRead = true;
                uni.navigateTo({
                    url: `/pages/chatDetail/chatDetail?${senderInfo}`,
                });
            },
            // 监听长按事件
            handleLongPress(e) {
                wx.vibrateShort();
                let targetId = parseInt(e.target.dataset.name.replace('message', ''));
                uni.showActionSheet({
                    itemList: ['删除', '加入黑名单'],
                    success: res => {
                        if (res.tapIndex === 0) {
                            //用户点击删除记录
                            uni.showModal({
                                title: '',
                                content: '删除私信记录后将无法恢复，确定删除？',
                                success: res => {
                                    if (res.confirm) {
                                        deleteChatWithFriend({
                                            urlParam: this.chatMessages[targetId].senderId
                                        })
                                            .then(res => {
                                                if (res.success) {
                                                    this.chatMessages.forEach((v, k) => {
                                                        if (v.senderId === this.chatMessages[targetId].senderId) {
                                                            this.chatMessages.splice(k, 1);
                                                        }
                                                    });
                                                }
                                                else {
                                                    console.log(res);
                                                    this.$refs.toast.show({
                                                        text: '删除失败',
                                                        type: 'error',
                                                        direction: 'top'
                                                    });
                                                    this.getChatList();
                                                }
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                this.$refs.toast.show({
                                                    text: '删除失败',
                                                    type: 'error',
                                                    direction: 'top'
                                                });
                                                this.getChatList();
                                            });
                                    }
                                }
                            });
                        }
                        else {
                            //用户点击加入黑名单

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
                // this.$refs.loading.stopLoading();
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
                //从本地缓存加载聊天列表
                uni.getStorage({
                    key: 'chatList',
                    success: res => {
                        this.chatMessages = res.data;
                    },
                    fail: err => {
                        // console.log(err)
                    },
                    complete: res => {
                        if (this.chatMessages.length === 0) {
                            this.$refs.loading.startLoading();
                        }
                    }
                });
                this._freshing = false; //还原下拉刷新状态
                setTimeout(() => {
                    this.refresherTriggered = true; //开启下拉刷新
                }, 0);
                //开启Socket连接
                uni.getStorage({
                    key: 'userInfo',
                    success: res => {
                        connectSocket(res.data.userId)
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
                        let currentPage = this.utils.getCurrentPage();
                        uni.redirectTo({
                            url: `/pages/login/wxLogin?redirectPath=${currentPage.curUrl}`
                        });
                    }
                });
            },
            // 关闭Socket连接
            stopCheckingUpdate() {
                uni.onSocketClose(res => {
                    console.log('已关闭Socket');
                });
                closeSocket()
                    .then(res => {
                        //存放聊天列表到本地缓存
                        uni.setStorage({
                            key: "chatList",
                            data: this.chatMessages.slice(0, 14),
                            success: res => {
                            },
                            fail: err => {
                                console.error(err);
                            }
                        });
                    })
                    .catch(err => {
                        if (err.errMsg === 'closeSocket:fail WebSocket is not connected') {
                            return;
                        }
                        console.error(err);
                    })
            },
        },
        computed: {},
        filters: {
            /**
             * 格式化时间
             * @param {String} time 传入的时间字符串
             * @return {String} 格式化后的时间字符串
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
             * @param {Number} count 未读消息数
             * @return {String|Number} 返回格式化后的结果
             */
            unreadCount(count) {
                if (count > 99) {
                    return '99+';
                }
                else return count;
            }
        },
        watch: {
            loadingMore(nval, oval) {
                if (nval && !oval && this.chatMessages.length !== 0) {
                    this.$refs.loadingMore.startLoading({
                        width: this.windowWidth,
                        height: 54
                    });
                }
                if (!nval && oval) {
                    this.$refs.loadingMore.stopLoading();
                }
            }
        },
        mounted() {
        },
        onLoad() {
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                },
            }); //获取窗口尺寸
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
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
  @import 'chatList.scss';
</style>