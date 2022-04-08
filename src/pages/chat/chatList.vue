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
      <view
        class="list-scroll-view"
        :style="{minHeight: `${windowHeight - navigationHeight}px`}">
        <!-- 顶部按钮列表容器 -->
        <view class="top-list-container" v-if="showTopBtnArea">
          <!-- 顶部通知按钮区域 -->
          <view
            class="btn-container first-btn"
            :data-name="`btn0`"
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
            @touchcancel="handleTouchEnd"
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
        <view
          class="main-list-container"
          :style="{minHeight: `${windowHeight - navigationHeight}px`}">
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
                <view
                  class="blacklist-user"
                  v-if="message.isBlocked">
                  黑名单
                </view>
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
                {{ message.isRead ? '' : message.unreadCount | formatUnreadCount }}
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
          <view
            class="empty"
            :style="{minHeight: `calc(100vh - ${navigationHeight + 40}px)`}"
            v-if="!chatMessages.length">
            <view class="row">
              一个聊天都没有噢
            </view>
            <view class="row">
              <view class="btn" @click="handleEmptyBtnClick">
                回到首页
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loading from "@/components/loading/loading";
    import {addToBlockList, deleteChatWithFriend, getMyChatList, removeFromBlockList} from "@/common/js/api/models.js";

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
                // chatMessages: [], //聊天列表信息数组
                messageTouchingId: '', //当前触摸元素的id
                refresherTriggered: false, //scroll-view下拉刷新触发状态
                loadingMore: false, //正在加载更多消息
                existMore: true, //是否存在更多消息记录
                showTopBtnArea: false, //是否显示顶部按钮区域
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
                }).then(res => {
                    if (time === null) {
                        let recordsTemp = [];
                        res.data.records.forEach(records => {
                            recordsTemp.push({
                                senderName: records.friendInfo.username, //用户名称
                                senderId: records.friendId, //用户ID
                                senderAvatar: records.friendInfo.avgPath, //用户头像地址
                                messageId: records.id, //消息ID
                                content: records.content, //消息内容
                                isPhoto: !records.isText, //是否为图片消息
                                time: records.createdTime, //消息发送时间
                                isRead: records.isRead, //消息是否已读
                                unreadCount: records.unread, //当前对话消息未读数量
                                isBlocked: records.isBlocked, //聊天对象是否在黑名单中
                            });
                        });
                        this.$store.commit('chatMessages', recordsTemp);
                        this.existMore = recordsTemp.length > 14;
                    }
                    else {
                        if (res.data.records.length !== 0) {
                            let chatMessagesTemp = this.$store.state.chatMessages;
                            res.data.records.forEach(records => {
                                chatMessagesTemp.push({
                                    senderName: records.friendInfo.username, //用户名称
                                    senderId: records.friendId, //用户ID
                                    senderAvatar: records.friendInfo.avgPath, //用户头像地址
                                    messageId: records.id, //消息ID
                                    content: records.content, //消息内容
                                    isPhoto: !records.isText, //是否为图片消息
                                    time: records.createdTime, //消息发送时间
                                    isRead: records.isRead, //消息是否已读
                                    unreadCount: records.unread, //当前对话消息未读数量
                                    isBlocked: records.isBlocked, //聊天对象是否在黑名单中
                                });
                                if (res.data.records.length < this.pageSize) {
                                    this.existMore = false;
                                }
                            });
                            this.$store.commit('chatMessages', chatMessagesTemp);
                        }
                        else {
                            this.existMore = false;
                        }
                        this.loadingMore = false;
                    }
                }).catch(err => {
                    console.error(err)
                    this.utils.throttle(() => {
                        this.$refs.toast.show({
                            text: '网络异常',
                            type: 'error',
                            direction: 'top'
                        });
                    }, 2500);
                    this.loadingMore = false;
                }).finally(() => {
                    this.$refs.loading.stopLoading();
                    this.refresherTriggered = false;
                    this._freshing = false;
                    this.$forceUpdate();
                });
            },
            // 跳转聊天详情页
            toChatDetail(e) {
                const targetId = parseInt(e.target.dataset.name.replace('message', ''));
                let chatMessagesTemp = this.chatMessages;
                chatMessagesTemp[targetId].isRead = true;
                this.$store.commit('chatMessages', chatMessagesTemp);
                uni.removeTabBarBadge({
                    index: 2
                });
                uni.navigateTo({
                    url: `/pages/chat/subpages/chatDetail/chatDetail?senderId=${this.chatMessages[targetId].senderId}`
                });
            },
            // 监听长按事件
            handleLongPress(e) {
                uni.vibrateShort();
                const targetId = parseInt(e.target.dataset.name.replace('message', ''));
                uni.showActionSheet({
                    itemList: ['删除', this.chatMessages[targetId].isBlocked ? '移出黑名单' : '加入黑名单'],
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
                                        }).then(() => {
                                            let chatMessagesTemp = this.chatMessages;
                                            chatMessagesTemp.forEach((v, k) => {
                                                if (v.senderId === chatMessagesTemp[targetId].senderId) {
                                                    chatMessagesTemp.splice(k, 1);
                                                }
                                            });
                                            this.$store.commit('chatMessages', chatMessagesTemp);
                                        }).catch(err => {
                                            console.error(err);
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
                            if (this.chatMessages[targetId].isBlocked) {
                                removeFromBlockList({
                                    urlParam: {
                                        userId: this.chatMessages[targetId].senderId
                                    }
                                }).then(() => {
                                    let chatMessagesTemp = this.chatMessages;
                                    chatMessagesTemp[targetId].isBlocked = false;
                                    this.$store.commit('chatMessages', chatMessagesTemp);
                                }).catch(err => {
                                    console.error(err);
                                    this.$refs.toast.show({
                                        text: '移除黑名单失败',
                                        type: 'error',
                                        direction: 'top'
                                    });
                                });
                            }
                            else {
                                addToBlockList({
                                    urlParam: {
                                        userId: this.chatMessages[targetId].senderId
                                    }
                                }).then(() => {
                                    let chatMessagesTemp = this.chatMessages;
                                    chatMessagesTemp[targetId].isBlocked = true;
                                    this.$store.commit('chatMessages', chatMessagesTemp);
                                }).catch(err => {
                                    console.error(err);
                                    this.$refs.toast.show({
                                        text: '加入黑名单失败',
                                        type: 'error',
                                        direction: 'top'
                                    });
                                });
                            }
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
                if (!this.refresherTriggered) {
                    this.refresherTriggered = true;
                }
                setTimeout(() => {
                    this.getChatList();
                }, 300);
            },
            // 监听下拉刷新事件结束
            handleRefreshEnd() {
                this._freshing = false;
                this.refresherTriggered = false;
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
            /**
             * 监听接收到新消息
             * @param {Object} data Socket接收到的新消息
             */
            receiveNewMessage(data) {
                if (data.errorCode === 120) {
                    const newMessage = data.data.messageInfo;
                    let chatMessages = this.$store.state.chatMessages;
                    const findIndex = chatMessages.findIndex(message => message.senderId === newMessage.friendId);
                    if (findIndex !== -1) {
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
                    this.$store.commit('chatMessages', chatMessages);
                    this.$forceUpdate();
                }
            },
            // 获取消息更新
            startCheckingUpdate() {
                if (this.chatMessages.length === 0) {
                    this.$refs.loading.startLoading();
                }
                this.getChatList();
            },
            // 消息列表为空的按钮点击事件
            handleEmptyBtnClick() {
                uni.switchTab({
                    url: '/pages/index/index',
                    fail: () => {
                        uni.redirectTo({
                            url: '/pages/index/index',
                            fail: err => {
                                console.error(err);
                            }
                        });
                    }
                });
            }
        },
        computed: {
            chatMessages: {
                get() {
                    return this.$store.state.chatMessages;
                }
            }
        },
        filters: {
            /**
             * 格式化未读消息数
             * @param {Number} count 未读消息数
             * @return {String|Number} 返回格式化后的结果
             */
            formatUnreadCount(count) {
                return count > 99 ? '99+' : count;
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
        onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
        },
        onShow() {
            this.startCheckingUpdate();
            this.$refs.navigationBar.setNavigation({
                titleText: '消息',
                backgroundColor: '#f6f6f6',
                isShowButton: false,
            });
            uni.onSocketMessage(res => {
                this.receiveNewMessage(JSON.parse(res.data)); //监听到Socket新消息
            });
            let totalCount = 0;
            this.chatMessages.map(chat => {
                totalCount += chat.isRead ? 0 : chat.unreadCount;
            });
            this.$store.commit('unreadMessageCount', totalCount);
        },
    }
</script>

<style lang="scss" scoped>
  @import 'chatList.scss';
</style>