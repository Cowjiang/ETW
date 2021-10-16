<template>
    <view>
        <navigationBar ref="navigationBar"/>
        <toast ref="toast" class="toast"/>
        <!-- 私信聊天页面容器 -->
        <view
            class="chat-container"
            :style="{height: `${windowHeight - navigationHeight}px`}">
            <!-- 顶部功能按钮区域 -->
            <view
                class="top-btn-area"
                :style="{top: `${navigationHeight}px`}"
                v-if="!isBlocked && isReadyToShow">
                <view>关注TA</view>
                <view @click="handleBlockBtnClick">加入黑名单</view>
            </view>
            <view
                class="top-btn-area"
                :style="{height: `80rpx`}"
                v-if="isBlocked && isReadyToShow">
                <view class="delete-blacklist" @click="handleBlockBtnClick">
                    你已屏蔽该用户，点此移出黑名单
                </view>
            </view>
            <!-- 聊天消息区域 -->
            <view
                class="message-area"
                :style="{
                    height: `${windowHeight - navigationHeight - 60}px`,
                    transform: `translateY(-${keyboardHeight}px)`
                }">
                <loading
                    ref="loading"
                    :parentClass="'message-area'"/>
                <scroll-view
                    class="message-scroll-view"
                    :style="{
                        top: `${isBlocked ? '80rpx' : '100rpx'}`,
                        height: `${isBlocked ? 'calc(100% - 80rpx)' : 'calc(100% - 100rpx)'}`,
                        height: `${isBlocked ? 'calc(100% - 80rpx - constant(safe-area-inset-bottom))' : 'calc(100% - 100rpx - constant(safe-area-inset-bottom))'}`,
                        height: `${isBlocked ? 'calc(100% - 80rpx - env(safe-area-inset-bottom))' : 'calc(100% - 100rpx - env(safe-area-inset-bottom))'}`
                    }"
                    ref="scrollView"
                    :scroll-y="true"
                    @scroll="handleScroll"
                    :scroll-into-view="scrollToViewId"
                    scroll-with-animation="true"
                    refresher-enabled="true"
                    refresher-threshold="300"
                    :refresher-triggered="refresherTriggered"
                    @refresherrefresh="handleRefreshStart"
                    @refresherrestore="handleRefreshEnd">
                    <!-- 滚动区域顶部 -->
                    <view id="scrollTopView"></view>
                    <!-- 每条消息的容器 -->
                    <view
                        class="message-container"
                        v-for="(message, index) in messageRecords"
                        :key="message.id"
                        :id="`message${message.id}`">
                        <!-- 消息发送时间容器 -->
                        <view
                            class="datetime-container"
                            v-if="computeDatetime(messageRecords[index - 1] === undefined ? 0 : messageRecords[index - 1].time, message.time)">
                            {{ message.time | formatTime }}
                        </view>
                        <!-- 用户头像容器 -->
                        <view
                            class="avatar-container"
                            :class="message.isMe === false ? 'avatar-container-left' : 'avatar-container-right'">
                            <image
                                v-if="message.isMe"
                                :src="myInfo.avgPath"
                                mode="widthFix"
                            ></image>
                            <image
                                v-if="!message.isMe"
                                :src="friendInfo.avgPath"
                                mode="widthFix"
                            ></image>
                        </view>
                        <!-- 消息内容 -->
                        <view
                            class="message-content"
                            :data-name="`message${index}`"
                            @touchstart="handleTouchStart"
                            @touchend="handleTouchEnd"
                            @touchcancel="handleTouchEnd"
                            @longpress="handleLongPress"
                            :class="message.isMe === false ? 'message-content-left' : 'message-content-right'"
                            :style="{filter: `${messageTouchingId === 'message' + index ? 'brightness(90%)' : 'brightness(100%)'}`}">
                            <view v-if="!message.isPhoto">
                                {{ message.content }}
                            </view>
                            <image
                                v-if="message.isPhoto"
                                :src="message.content"
                                :data-name="`message${index}`"
                                mode="widthFix"
                                @longpress="handleLongPress"
                                @click="previewImage(message.content)"
                            ></image>
                        </view>
                    </view>
                    <!-- 滚动区域底部 -->
                    <view id="scrollBottomView"></view>
                </scroll-view>
            </view>
            <!-- 底部输入区域 -->
            <view
                class="block-mask"
                v-if="isBlocked">
                你已屏蔽该用户
            </view>
            <view
                class="input-area"
                :style="{transform: `translateY(-${keyboardHeight}px)`}">
                <!-- 输入框左侧按钮容器 -->
                <view
                    class="more-btn-container"
                    :style="{
                        transform: `translateX(${inputFocusStatus ? '-120': '0'}rpx)`,
                        opacity: `${isBlocked ? 0.7 : 1}`
                    }">
                    <i
                        class="fa fa-picture-o"
                        aria-hidden="true"
                        :style="{opacity: `${inputFocusStatus ? '0': '1'}`}"
                        @click="chooseImage(0)"></i>
                    <i
                        class="fa fa-camera"
                        aria-hidden="true"
                        :style="{opacity: `${inputFocusStatus ? '0': '1'}`}"
                        @click="chooseImage(1)"></i>
                    <i
                        class="fa fa-chevron-right"
                        aria-hidden="true"
                        :style="{opacity: `${inputFocusStatus ? '1': '0'}`}"></i>
                </view>
                <!-- 输入框容器 -->
                <view class="input-container">
                    <view
                        class="input-inner-container"
                        @click="showRawInput"
                        :style="{width: `${inputFocusStatus ? 'calc(100vw - 200rpx)' : 'calc(100vw - 220rpx - 80rpx)'}`}">
                        <input
                            type="text"
                            class="raw-input"
                            v-model="rawInputValue"
                            :focus="inputFocusStatus"
                            :adjust-position="false"
                            v-if="inputFocusStatus"
                            @focus="handleInputFocus"
                            @blur="handleInputBlur"
                            @confirm="sendMessage"
                            :confirm-hold="true"
                            :confirm-type="`发送`"
                            @keyboardheightchange="handleKeyboardHeightChange"
                            :auto-blur="true">
                        <view
                            class="show-input"
                            v-if="!inputFocusStatus">
                            {{ rawInputValue }}
                        </view>
                    </view>
                    <!-- 输入框右侧发送按钮容器 -->
                    <view
                        class="send-btn-container"
                        @click="sendMessage"
                        :style="{opacity: `${isSendReady ? '1': '0.5'}`}">
                        <i class="fa fa-paper-plane" aria-hidden="true"></i>
                    </view>
                </view>
            </view>
        </view>
        <!-- 图片上传组件 -->
        <upload
            class="upload"
            ref="upload"
            :action="action"
            :file-list="fileList"
            :before-upload="beforeUpload"
            :max-size="5242880"
            :max-count="1"
            @on-success="onUploadSuccess"
        ></upload>
    </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';
    import {upload} from '../../components/upload/upload.vue';
    import {loading} from '../../components/loading/loading.vue';
    import {deleteChatHistory, getChatHistory, getUploadSignature, sendMessage} from "../../common/js/api/models.js";
    import {closeSocket, connectSocket} from "../../common/js/api/socket.js";

    export default {
        components: {
            toast, navigationBar, upload, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                myInfo: {
                    userId: '',
                    avgPath: '',
                    username: '',
                }, //自己的个人信息
                friendInfo: {
                    userId: '',
                    avgPath: '',
                    username: '',
                }, //信息发送对象的信息
                rawInputValue: '', //消息输入框的数据
                inputFocusStatus: false, //输入框聚焦状态
                isSendReady: false, //输入框文字验证状态
                keyboardHeight: 0, //弹起键盘的高度
                messageRecords: [], //消息记录数组
                messageRecordsTemp: [], //消息记录缓冲数组
                recordsLength: NaN, //当前获取聊天消息记录的请求回报的消息总数
                scrollToViewId: '', //scroll-view的定位锚id
                messageTouchingId: '', //当前触摸消息记录的数据名
                action: '', //图片上传Url
                fileList: [], //发送图片的队列
                refresherTriggered: false, //scroll-view下拉刷新触发状态
                currentPage: -1, //当前消息记录的页码
                pageSize: 15, //每次请求获取聊天记录的单页数据总数
                existMore: true, //是否存在更多历史消息
                isReadyToShow: false, //是否加载消息记录完毕
                isBlocked: false, //是否屏蔽该用户（黑名单）
            }
        },
        methods: {
            // 设置私聊会话基本信息
            setChatBaseInfo() {
                this.friendInfo.username = this.utils.getCurrentPage().curParam.senderName || null;
                this.friendInfo.userId = this.utils.getCurrentPage().curParam.senderId || null;
                this.friendInfo.avgPath = this.utils.getCurrentPage().curParam.senderAvatar || null;
                if (this.friendInfo.username === null || this.friendInfo.userId === null) {
                    this.redirectToChatList();
                    return;
                }
                uni.getStorage({
                    key: 'userInfo',
                    success: res => {
                        this.myInfo.userId = res.data.userId;
                        this.myInfo.username = res.data.username;
                        this.myInfo.avgPath = res.data.avgPath;
                    }
                });
                this.$refs.navigationBar.setNavigation({
                    titleText: this.friendInfo.username,
                    backgroundColor: '#ffffff',
                    customBackFunc: this.redirectToChatList
                });
            },
            /**
             * 获取聊天消息记录
             * @param {null|String} time 查询时间戳，为空时则查询第一页
             */
            getChatHistory(time = null) {
                let queryTime = time === null ? Date.now() : time;
                getChatHistory({
                    urlParam: `${this.friendInfo.userId}?pageSize=${this.pageSize}&time=${queryTime}`,
                })
                    .then(res => {
                        console.log(res.data)
                        if (time === null) {
                            let recordsTemp = [];
                            for (const records of res.data.records) {
                                recordsTemp.unshift({
                                    id: records.id,
                                    content: records.content,
                                    isPhoto: !records.isText,
                                    isMe: records.senderId.toString() !== this.friendInfo.userId,
                                    time: records.createdTime
                                });
                            }
                            this.messageRecords = [];
                            this.messageRecords = recordsTemp;
                            this.scrollToViewId = `message${this.messageRecords.length - 1}`;
                            this.recordsLength = res.data.total;
                            if (this.recordsLength <= this.pageSize) {
                                this.existMore = false;
                            }
                            setTimeout(() => {
                                this.isReadyToShow = true;
                                this.$refs.loading.stopLoading();
                            }, 500);
                        }
                        else {
                            if (res.data.records.length !== 0) {
                                for (const records of res.data.records) {
                                    this.messageRecords.unshift({
                                        id: records.id,
                                        content: records.content,
                                        isPhoto: !records.isText,
                                        isMe: records.senderId.toString() !== this.friendInfo.userId,
                                        time: records.createdTime
                                    });
                                }
                            }
                            this.recordsLength = res.data.total;
                            if (this.recordsLength <= this.pageSize) {
                                this.existMore = false;
                            }
                        }
                        this.refresherTriggered = false;
                        this._freshing = false;
                    })
                    .catch(err => {
                        this.refresherTriggered = false;
                        this._freshing = false;
                        this.$refs.toast.show({
                            text: '网络异常',
                            type: 'error',
                            direction: 'top'
                        });
                    })
            },
            /**
             * 监听接收到新消息
             * @param {Object} data Socket接收到的新消息
             */
            receiveNewMessage(data) {
                console.log(data);
                if (data.errorCode === 120) {
                    let newMessage = data.data;
                    if (newMessage.senderId.toString() === this.friendInfo.userId) {
                        this.scrollToViewId = `messageTopView`;
                        setTimeout(() => {
                            this.messageRecords.push({
                                id: newMessage.id,
                                content: newMessage.content,
                                isPhoto: !newMessage.isText,
                                isMe: false,
                                time: newMessage.createdTime
                            });
                        }, 0);
                        this.recordsLength += 1;
                        if (this.recordsLength <= this.pageSize) {
                            this.existMore = false;
                        }
                        this.$forceUpdate();
                    }
                }
            },
            // 显示消息输入框
            showRawInput() {
                this.inputFocusStatus = true;
            },
            // 监听输入框聚焦事件
            handleInputFocus() {
                // this.inputFocusStatus = true;
            },
            // 监听输入框失焦事件
            handleInputBlur() {
                this.inputFocusStatus = false;
                this.keyboardHeight = 0;
            },
            // 监听键盘弹起高度改变事件
            handleKeyboardHeightChange(e) {
                if (e.detail.height !== 0) {
                    this.keyboardHeight = e.detail.height;
                }
                this.$forceUpdate();
            },
            // 发送文字消息
            sendMessage() {
                this.utils.throttle(() => {
                    setTimeout(() => {
                        this.scrollToViewId = `message${this.messageRecords.length - 1}`;
                        this.$forceUpdate();
                    }, 0);
                    if (this.isSendReady === true) {
                        wx.showLoading({
                            title: '正在发送'
                        });
                        sendMessage({
                            urlParam: this.friendInfo.userId,
                            queryData: {
                                content: this.rawInputValue,
                                isText: true
                            }
                        })
                            .then(res => {
                                if (res.success) {
                                    wx.hideLoading();
                                    this.messageRecords.push({
                                        id: res.data.id,
                                        isMe: true,
                                        isPhoto: false,
                                        content: this.rawInputValue,
                                        time: new Date()
                                    });
                                    this.recordsLength += 1;
                                    this.rawInputValue = '';
                                    // this.inputFocusStatus = true;
                                }
                                else {
                                    wx.hideLoading();
                                    this.$refs.toast.show({
                                        text: '发送失败',
                                        type: 'error',
                                        direction: 'top'
                                    });
                                }
                            })
                            .catch(err => {
                                console.log(err);
                                wx.hideLoading();
                                this.$refs.toast.show({
                                    text: '发送失败',
                                    type: 'error',
                                    direction: 'top'
                                });
                            });
                    }
                    else {
                        this.inputFocusStatus = true;
                    }
                }, 1000);
            },
            /**
             * 选择图片
             * @param {Number} mode 选择图片模式，0: 从相册选择图片, 1: 相机拍摄图片
             */
            chooseImage(mode) {
                switch (mode) {
                    case 0:
                        this.$refs.upload.changeSourceType(['album']);
                        this.$refs.upload.selectFile();
                        break;
                    case 1:
                        this.$refs.upload.changeSourceType(['camera']);
                        this.$refs.upload.selectFile();
                        break;
                }
            },
            // 上传图片前的钩子函数
            beforeUpload() {
                let imageTempPath = this.$refs.upload.lists[0].url;
                this.recordsLength += 1;
                return new Promise((resolve, reject) => {
                    let dir = "chat-images";
                    let fileSuffix = imageTempPath.substr(imageTempPath.lastIndexOf("."));
                    getUploadSignature({urlParam: dir})
                        .then((res) => {
                            let signData = res.data;
                            this.action = signData.host;
                            let key = signData.dir + signData.uuid + fileSuffix; //文件路径
                            if (res.success) {
                                this.$refs.upload.formData = {
                                    key: key,
                                    policy: signData.policy,
                                    OSSAccessKeyId: signData.accessId,
                                    success_action_status: "200",
                                    signature: signData.signature,
                                };
                                this.tempFinalSrc = signData.host + "/" + key;
                                resolve();
                            }
                            else {
                                this.recordsLength -= 1;
                                this.$refs.upload.clear();
                                reject();
                            }
                        })
                        .catch((err) => {
                            this.recordsLength -= 1;
                            this.$refs.upload.clear();
                            console.log(err);
                        });
                });
            },
            // 上传图片成功的钩子函数
            onUploadSuccess() {
                wx.showLoading({
                    title: '正在发送'
                });
                sendMessage({
                    urlParam: this.friendInfo.userId,
                    queryData: {
                        content: this.tempFinalSrc,
                        isText: false
                    }
                })
                    .then(res => {
                        if (res.success) {
                            wx.hideLoading();
                            this.scrollToViewId = `messageTopView`;
                            setTimeout(() => {
                                this.messageRecords.push({
                                    id: res.data.id,
                                    isMe: true,
                                    isPhoto: true,
                                    content: this.tempFinalSrc,
                                    time: new Date()
                                });
                            }, 0);
                            this.$refs.upload.clear();
                        }
                        else {
                            wx.hideLoading();
                            this.$refs.toast.show({
                                text: '发送失败',
                                type: 'error',
                                direction: 'top'
                            });
                            this.recordsLength -= 1;
                            this.$refs.upload.clear();
                        }
                    })
                    .catch(error => {
                        console.log(error)
                        this.recordsLength -= 1;
                    })
            },
            // scroll-view监听滚动事件
            handleScroll(e) {
                // console.log(e)
            },
            // 监听消息长按事件
            handleLongPress(e) {
                wx.vibrateShort();
                this.utils.throttle(() => {
                    if (e.target.dataset.name !== undefined) {
                        let targetId = parseInt(e.target.dataset.name.replace('message', ''));
                        uni.showActionSheet({
                            itemList: ['复制', '删除', '举报该用户'],
                            success: res => {
                                if (res.tapIndex === 0) {
                                    uni.setClipboardData({
                                        data: this.messageRecords[targetId].content
                                    });
                                }
                                else if (res.tapIndex === 1) {
                                    this.deleteMessage(this.messageRecords[targetId].id);
                                }
                                else {
                                    this.$refs.toast.show({
                                        text: '举报成功',
                                        type: 'success'
                                    });
                                }
                            }
                        });
                    }
                }, 100);
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
            /**
             * 全屏预览图片
             * @param {String} url 图片Url
             */
            previewImage(url) {
                wx.previewImage({
                    urls: [url]
                })
            },
            /**
             * 删除聊天消息
             * @param {Number} targetId 消息ID
             */
            deleteMessage(targetId) {
                wx.showLoading({
                    title: '正在删除'
                })
                deleteChatHistory({
                    urlParam: "?ids=" + targetId
                })
                    .then(res => {
                        wx.hideLoading();
                        if (res.success) {
                            this.recordsLength -= 1;
                            this.messageRecords.splice(this.messageRecords.findIndex(item => item.id === targetId), 1);
                            this.$refs.toast.show({
                                text: '已删除',
                                type: 'success',
                                direction: 'top'
                            });
                        }
                        else {
                            wx.hideLoading();
                            this.$refs.toast.show({
                                text: '删除失败',
                                type: 'error',
                                direction: 'top'
                            });
                            console.log(res)
                        }
                    })
                    .catch(err => {
                        wx.hideLoading();this.$refs.toast.show({
                            text: '删除失败',
                            type: 'error',
                            direction: 'top'
                        });
                        console.log(err);
                    })
            },
            // scroll-view下拉刷新开始事件
            handleRefreshStart() {
                if (this.existMore) {
                    if (this._freshing) return;
                    this._freshing = true;
                    setTimeout(() => {
                        if (this.messageRecords.length === 0) {
                            this.getChatHistory();
                        }
                        else {
                            this.getChatHistory(this.messageRecords[0].time);
                        }
                    }, 300);
                }
                else {
                    this.refresherTriggered = false;
                    this._freshing = false;
                    this.$forceUpdate();
                }
            },
            // scroll-view下拉刷新结束事件
            handleRefreshEnd() {
                this.refresherTriggered = 'restore';
            },
            // 黑名单按钮点击事件
            handleBlockBtnClick() {
                this.isReadyToShow = false;
                this.rawInputValue = '';
                this.inputFocusStatus = false;
                this.keyboardHeight = 0;
                setTimeout(() => {
                    this.isBlocked = !this.isBlocked;
                    this.isReadyToShow = true;
                    this.rawInputValue = '';
                    this.inputFocusStatus = false;
                    this.isReadyToShow = true;
                    this.keyboardHeight = 0;
                }, 1000);
                this.$forceUpdate();
            },
            // 重定向至聊天列表页
            redirectToChatList() {
                // uni.redirectTo({
                //     url: `/pages/chatList/chatList`
                // });
                uni.navigateBack();
            },
            // 开启Socket连接
            startCheckingUpdate() {
                if (this.messageRecords.length === 0) {
                    this._freshing = false; //还原下拉刷新状态
                    setTimeout(() => {
                        this.refresherTriggered = true; //开启下拉刷新
                    }, 0);
                }
                else {
                    this.$refs.loading.stopLoading();
                }
                //开启Socket连接
                uni.getStorage({
                    key: 'userInfo',
                    success: res => {
                        connectSocket(res.data.userId)
                            .then(res => {
                                console.log(res);
                                // this.$refs.toast.show({
                                //     text: '网络异常',
                                //     type: 'error',
                                //     direction: 'top'
                                // });
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
                    console.log('已关闭Socket');
                });
                closeSocket()
                    .then(res => {
                    })
                    .catch(err => {
                        if (err.errMsg === 'closeSocket:fail WebSocket is not connected') {
                            return;
                        }
                        console.error(err);
                    })
            },
        },
        computed: {
            // 计算时间差
            computeDatetime(oldTime, newTime) {
                return (oldTime, newTime) => {
                    return (new Date(newTime) - new Date(oldTime)) / 1000 / 60 >= 5; //返回两个时间差是否大于5分钟
                }
            }
        },
        filters: {
            /**
             * 格式化时间
             * @param {String} time 时间字符串
             * @return {String} 格式化后的时间
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
                else {
                    return `${messageTime.year}-${messageTime.month}-${messageTime.day} ${messageTime.hour}:${messageTime.min}`;
                }
            }
        },
        watch: {
            // 消息原始输入框的值
            rawInputValue(nval, oval) {
                this.isSendReady = nval.replace(/\s*/g, "") !== ''; //判断输入框中是否为空白内容
            },
            // 消息记录数组
            messageRecords(nval, oval) {
                this.scrollToViewId = `scrollBottomView`; //将scroll-view移动到底部
                // this.scrollToViewId = `message${nval.length - 1}`;
                this.$forceUpdate();
            },
            isReadyToShow(nval, oval) {
                if (!nval && oval) {
                    this.$refs.loading.startLoading();
                }
                else if (nval && !oval) {
                    this.$refs.loading.stopLoading();
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
            this.setChatBaseInfo(); //设置会话信息
            this.stopCheckingUpdate(); //关闭Socket连接
            this.$refs.loading.startLoading({
                width: this.windowWidth,
                height: this.windowHeight - this.navigationHeight - 60
            }); //开启loading动画
            this.startCheckingUpdate(); //重新开启Socket连接
        },
        onHide() {
            this.stopCheckingUpdate(); //关闭Socket连接
        },
        onUnload() {
            this.stopCheckingUpdate(); //关闭Socket连接
        },
        beforeDestroy() {
            this.stopCheckingUpdate(); //关闭Socket连接
        }
    }
</script>

<style lang="scss" scoped>
    .toast {
        position: absolute;
        top: rpx(150);
        width: 100%;
    }

    .upload {
        position: fixed;
        width: 0;
        height: 0;
        opacity: 0;
        overflow: hidden;
        z-index: -999;
        pointer-events: none;
    }

    .chat-container {
        width: 100vw;
        height: 100vh;
        background-color: #fff;

        .top-btn-area {
            display: flex;
            width: 100%;
            height: fit-content;
            position: fixed;
            z-index: 99;
            background-color: #fff;

            view {
                width: 100%;
                height: rpx(70);
                margin: rpx(15) rpx(40);
                text-align: center;
                font-size: rpx(28);
                line-height: rpx(70);
                border-radius: rpx(100);
                background-color: $uni-color-grey;
            }

            view:nth-child(1) {
                margin-right: rpx(10);
            }

            view:nth-child(2) {
                margin-left: rpx(10);
            }

            .delete-blacklist {
                margin-left: rpx(60) !important;
                margin-right: rpx(60) !important;
                //background-color: #f4756b;
                background-color: #fff;
                font-size: rpx(28);
                line-height: rpx(50);
                color: #f4756b;
            }
        }

        .message-area {
            width: 100%;
            height: 100%;
            background-color: #fff;
            transition-duration: 200ms;

            .message-scroll-view {
                position: relative;
                width: 100%;

                .message-container {
                    width: 100%;
                    height: fit-content;
                    margin-bottom: rpx(40);

                    .datetime-container {
                        width: 100vw;
                        margin: rpx(60) 0 rpx(30);
                        font-size: rpx(24);
                        text-align: center;
                        color: $uni-color-gray;
                    }

                    .datetime-container:nth-child(1) {
                        margin-top: 0;
                    }

                    .avatar-container {
                        width: rpx(80);
                        height: rpx(80);
                        border-radius: 50%;
                        overflow: hidden;

                        image {
                            width: 100%;
                        }
                    }

                    .message-content {
                        width: fit-content;
                        max-width: calc(100vw - 280rpx);
                        height: fit-content;
                        min-height: rpx(60);
                        padding: rpx(20);
                        font-size: rpx(30);
                        word-break: break-all;

                        view {
                            pointer-events: none;
                        }

                        image {
                            max-width: 35vw;
                        }
                    }

                    .avatar-container-left {
                        float: left;
                        margin-left: rpx(40);
                        //background-color: orange;
                    }

                    .message-content-left {
                        margin-left: rpx(140);
                        border-radius: rpx(0) rpx(20) rpx(20) rpx(40);
                        background-color: #f4f5f6;
                    }

                    .avatar-container-right {
                        float: right;
                        margin-right: rpx(40);
                        //background-color: deepskyblue;
                    }

                    .message-content-right {
                        margin-left: auto;
                        margin-right: rpx(140);
                        border-radius: rpx(20) rpx(0) rpx(40) rpx(20);
                        background-color: #f4756b;
                        color: #fff;
                    }
                }

                .message-container:nth-child(1) {
                    margin-top: rpx(30);
                }
            }
        }

        .block-mask {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
            height: fit-content;
            min-height: rpx(120);
            padding-left: rpx(85);
            padding-bottom: 0;
            padding-bottom: constant(safe-area-inset-bottom);
            padding-bottom: env(safe-area-inset-bottom);
            z-index: 2;
            font-size: rpx(30);
            text-align: center;
            line-height: rpx(120);
            color: #f4756b;
            //background-color: rgba(255, 255, 255, 0.7);
        }

        .input-area {
            position: fixed;
            left: 0;
            bottom: 0;
            padding-bottom: 0;
            padding-bottom: constant(safe-area-inset-bottom);
            padding-bottom: env(safe-area-inset-bottom);
            width: 100%;
            height: fit-content;
            min-height: rpx(120);
            background-color: #fff;

            .more-btn-container {
                display: inline;
                padding: rpx(20) 0 rpx(20) rpx(40);
                width: fit-content;
                height: 100%;
                float: left;
                font-size: rpx(36);
                line-height: rpx(80);
                color: #666666;
                transition-duration: 200ms;

                .fa:nth-child(1) {
                    letter-spacing: rpx(40);
                }
            }

            .input-container {
                display: inline;
                position: fixed;
                right: 0;
                bottom: rpx(20);
                padding-bottom: 0;
                padding-bottom: constant(safe-area-inset-bottom);
                padding-bottom: env(safe-area-inset-bottom);
                width: fit-content;
                margin: rpx(20) rpx(20) 0 0;
                height: fit-content;
                min-height: rpx(80);
                float: right;
                transition-duration: 200ms;

                .input-inner-container {
                    width: calc(100vw - 220rpx - 80rpx);
                    height: fit-content;
                    float: left;
                    padding: rpx(20) rpx(40);
                    border-radius: rpx(50);
                    background-color: $uni-color-grey;
                    transition-duration: 200ms;
                    transition-property: width, transform;
                    overflow: hidden;

                    .raw-input {
                        font-size: rpx(32);
                        height: rpx(40);
                    }

                    .show-input {
                        font-size: rpx(32);
                        height: rpx(40);
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }

                .send-btn-container {
                    opacity: 1;
                    display: inline;
                    height: rpx(70);
                    width: rpx(70);
                    margin-top: rpx(4);
                    margin-left: rpx(20);
                    font-size: rpx(40);
                    line-height: rpx(70);
                    text-align: center;
                    color: #fff;
                    background-color: #f4756b;
                    border-radius: 50%;
                    float: right;
                    transition-property: opacity;
                    transition-duration: 200ms;
                }
            }
        }
    }
</style>