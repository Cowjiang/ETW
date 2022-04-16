<template>
  <view>
    <navigationBar ref="navigationBar">
      <template v-slot:button>
        <view
          class="navigation-menu-button"
          :style="{width: `${navigationButtonWidth}px`}">
          <view
            class="navigation-menu-button-content"
            :style="{
              height: `${0.54 * navigationButtonHeight}px`,
              margin: `${0.23 * navigationButtonHeight}px 0`,
            }">
            <view class="navigation-back" @click="redirectToChatList">
              <i class="fas fa-angle-left"/>
            </view>
            <view class="navigation-menu" @click="handleMenuBtnClick">
              <i class="fas fa-bars"/>
            </view>
          </view>
        </view>
      </template>
    </navigationBar>
    <toast ref="toast" class="toast"/>
    <loading ref="uploading" fullscreen maskColor="rgba(255, 255, 255, 0.8)"/>

    <!-- 私信聊天页面容器 -->
    <view
      class="chat-container"
      :style="{height: `${windowHeight - navigationHeight}px`}">
      <!-- 聊天消息区域 -->
      <view
        class="message-area"
        :style="{
          height: `${windowHeight - navigationHeight - keyboardHeight}px`,
        }">
        <loading
          ref="loading"
          :parentClass="'message-area'"/>
        <view class="message-scroll-view">
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
                mode="aspectFill"
                @click="gotoUserPage(myInfo.userId)"/>
              <image
                v-if="!message.isMe"
                :src="friendInfo.avgPath"
                mode="aspectFill"
                @click="gotoUserPage(friendInfo.userId)"/>
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
                @click="previewImage(message.content)"/>
            </view>
          </view>
          <!-- 滚动区域底部 -->
          <view
            class="scroll-bottom"
            :style="{
              height: `calc(${keyboardHeight + 60}px)`,
              height: `calc(constant(safe-area-inset-bottom) + ${keyboardHeight + 60}px)`,
              height: `calc(env(safe-area-inset-bottom) + ${keyboardHeight + 60}px)`
            }"></view>
        </view>
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
            class="fas fa-image"
            aria-hidden="true"
            :style="{opacity: `${inputFocusStatus ? '0': '1'}`}"
            @click="chooseImage(0)"></i>
          <i
            class="fas fa-camera"
            aria-hidden="true"
            :style="{opacity: `${inputFocusStatus ? '0': '1'}`}"
            @click="chooseImage(1)"></i>
          <i
            class="fas fa-chevron-right"
            aria-hidden="true"
            :style="{opacity: `${inputFocusStatus ? '1': '0'}`}"></i>
        </view>
        <!-- 输入框容器 -->
        <view
          class="input-container"
          :style="{
            transform: `translateX(${inputFocusStatus ? '-90': '0'}rpx)`,
          }">
          <view
            class="input-inner-container"
            @click="showRawInput"
            :style="{width: `${inputFocusStatus ? 'calc(100vw - 210rpx)' : 'calc(100vw - 220rpx - 80rpx)'}`}">
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
        </view>
        <!-- 输入框右侧发送按钮容器 -->
        <view
          class="send-btn-container"
          @click="sendMessage"
          :style="{
            opacity: `${isSendReady ? '1': '0.5'}`,
          }">
          <i class="fas fa-paper-plane"/>
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
      :max-size="10485760"
      :max-count="1"
      :show-tips="true"
      :limitType="['png', 'jpg', 'jpeg']"
      @on-success="onUploadSuccess"
      @on-error="onUploadError"
      @on-oversize="onUploadOversize"/>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";
    import upload from "@/components/upload/upload";
    import {
        addFriend,
        addToBlockList,
        deleteChatHistory,
        getChatHistory,
        getUploadSignature,
        getUserRelationships,
        getUserSimpleInfo,
        removeFriend,
        removeFromBlockList,
        sendMessage
    } from "@/common/js/api/models.js";
    import store from "@/common/js/store";

    export default {
        components: {
            toast, navigationBar, upload, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                navigationButtonWidth: 0, //导航栏胶囊按钮宽度
                navigationButtonHeight: 0, //导航栏胶囊按钮高度
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
                messageTouchingId: '', //当前触摸消息记录的数据名
                action: '', //图片上传Url
                fileList: [], //发送图片的队列
                currentPage: -1, //当前消息记录的页码
                pageSize: 15, //每次请求获取聊天记录的单页数据总数
                existMore: true, //是否存在更多历史消息
                isReadyToShow: false, //是否加载消息记录完毕
                isBlocked: false, //是否屏蔽该用户（黑名单）
                isFocused: false, //是否已关注该用户
                scrollTop: 0, //页面滚动高度
            }
        },
        methods: {
            // 设置私聊会话基本信息
            async setChatBaseInfo() {
                this.friendInfo.userId = this.utils.getCurrentPage().curParam.senderId || null;
                if (!this.friendInfo.userId) {
                    this.redirectToChatList();
                    return;
                }
                await getUserSimpleInfo({
                    urlParam: {
                        userId: this.friendInfo.userId
                    }
                }).then(res => {
                    this.friendInfo.username = res.data.username;
                    this.friendInfo.avgPath = res.data.avgPath;
                    this.$refs.navigationBar.setNavigation({
                        titleText: this.friendInfo.username,
                        backgroundColor: '#ffffff',
                        customBackFunc: this.redirectToChatList,
                        hideBadge: true
                    });
                }).catch(error => {
                    console.error(error);
                    this.redirectToChatList();
                });
                this.myInfo.userId = this.$store.state.userInfo.userId;
                this.myInfo.username = this.$store.state.userInfo.username;
                this.myInfo.avgPath = this.$store.state.userInfo.avgPath;
            },
            /**
             * 获取聊天消息记录
             * @param {null|String} time 查询时间戳，为空时则查询第一页
             */
            getChatHistory(time = null) {
                const queryTime = time === null ? Date.now() : time;
                getChatHistory({
                    urlParam: `${this.friendInfo.userId}?pageSize=${this.pageSize}&time=${queryTime}`,
                }).then(res => {
                    if (time === null) {
                        let recordsTemp = [];
                        res.data.records.forEach(records => {
                            recordsTemp.unshift({
                                id: records.id,
                                content: records.content,
                                isPhoto: !records.isText,
                                isMe: records.senderId.toString() !== this.friendInfo.userId,
                                time: records.createdTime
                            });
                        });
                        this.messageRecords = [];
                        this.messageRecords = recordsTemp;
                        this.recordsLength = res.data.total;
                        if (this.recordsLength <= this.pageSize) {
                            this.existMore = false;
                        }
                        setTimeout(() => {
                            this.isReadyToShow = true;
                            this.$refs.loading.stopLoading();
                            setTimeout(() => {
                                uni.pageScrollTo({
                                    scrollTop: 999999999
                                });
                            }, 0);
                        }, 500);
                    }
                    else {
                        const firstMsgId = this.messageRecords[0].id; //获取更多记录前的第一条消息的id
                        if (res.data.records.length !== 0) {
                            res.data.records.forEach(records => {
                                if (records.id !== firstMsgId) {
                                    //防止连接处出现重复
                                    this.messageRecords.unshift({
                                        id: records.id,
                                        content: records.content,
                                        isPhoto: !records.isText,
                                        isMe: records.senderId.toString() !== this.friendInfo.userId,
                                        time: records.createdTime
                                    });
                                }
                            });
                        }
                        this.recordsLength = res.data.total;
                        setTimeout(() => {
                            uni.pageScrollTo({
                                selector: `#message${firstMsgId}`,
                                duration: 0
                            });
                        }, 0);
                        if (this.recordsLength <= this.pageSize) {
                            this.existMore = false;
                        }
                    }
                }).catch(err => {
                    console.error(err);
                    this.$refs.toast.show({
                        text: '网络异常',
                        type: 'error',
                        direction: 'top'
                    });
                });
            },
            /**
             * 监听接收到新消息
             * @param {Object} data Socket接收到的新消息
             */
            receiveNewMessage(data) {
                if (data.errorCode === 120) {
                    const newMessage = data.data.messageInfo;
                    if (newMessage.senderId.toString() === this.friendInfo.userId) {
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
                        setTimeout(() => {
                            uni.pageScrollTo({
                                scrollTop: 999999999
                            });
                        }, 0);
                        this.$forceUpdate();
                    }
                    else {
                        this.$store.commit('unreadMessageCount', this.$store.state.unreadMessageCount + 1);
                    }
                }
            },
            // 获取与好友的关系（是否关注、是否屏蔽）
            async getUserRelationships() {
                await getUserRelationships({
                    urlParam: {
                        userId: this.friendInfo.userId
                    }
                }).then(res => {
                    this.isBlocked = res.data.isBlocked;
                    this.isFocused = res.data.isFriend;
                }).catch(err => {
                    console.error(err);
                });
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
                    setTimeout(() => {
                        uni.pageScrollTo({
                            scrollTop: 999999999
                        });
                    }, 100);
                }
            },
            // 发送文字消息
            sendMessage() {
                this.utils.throttle(() => {
                    if (this.isSendReady === true) {
                        uni.showLoading({
                            title: '正在发送'
                        });
                        sendMessage({
                            urlParam: this.friendInfo.userId,
                            queryData: {
                                content: this.rawInputValue,
                                isText: true
                            }
                        }).then(res => {
                            uni.hideLoading();
                            this.messageRecords.push({
                                id: res.data.id,
                                isMe: true,
                                isPhoto: false,
                                content: this.rawInputValue,
                                time: new Date()
                            });
                            this.recordsLength += 1;
                            this.rawInputValue = '';
                        }).catch(err => {
                            console.error(err);
                            uni.hideLoading();
                            this.$refs.toast.show({
                                text: '发送失败',
                                type: 'error',
                                direction: 'top'
                            });
                        }).finally(() => {
                            uni.pageScrollTo({
                                scrollTop: 999999999
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
            beforeUpload(index, list) {
                return new Promise((resolve, reject) => {
                    uni.compressImage({
                        src: list[0].url,
                        quality: 80,
                        success: res => {
                            const imageTempPath = res.tempFilePath;
                            const fileSuffix = imageTempPath.substr(imageTempPath.lastIndexOf("."));
                            getUploadSignature({urlParam: 'chat-images'}).then(res => {
                                const signData = res.data;
                                this.action = signData.host;
                                const key = `${signData.dir}${signData.uuid}${fileSuffix}`; //文件路径
                                this.$refs.upload.formData = {
                                    key: key,
                                    policy: signData.policy,
                                    OSSAccessKeyId: signData.accessId,
                                    success_action_status: "200",
                                    signature: signData.signature,
                                };
                                this.tempFinalSrc = `${signData.host}/${key}`;
                                this.$refs.uploading.startLoading();
                                resolve();
                            }).catch(err => {
                                this.$refs.upload.clear();
                                reject(err);
                            });
                        }
                    });
                });
            },
            // 上传图片成功的钩子函数
            onUploadSuccess() {
                sendMessage({
                    urlParam: this.friendInfo.userId,
                    queryData: {
                        content: this.tempFinalSrc,
                        isText: false
                    }
                }).then(res => {
                    this.recordsLength += 1;
                    setTimeout(() => {
                        this.messageRecords.push({
                            id: res.data.id,
                            isMe: true,
                            isPhoto: true,
                            content: this.tempFinalSrc,
                            time: new Date()
                        });
                    }, 0);
                }).catch(error => {
                    console.error(error);
                    this.$refs.toast.show({
                        text: '发送失败',
                        type: 'error',
                        direction: 'top'
                    });
                }).finally(() => {
                    this.$refs.uploading.stopLoading();
                    this.$refs.upload.clear();
                    setTimeout(() => {
                        uni.pageScrollTo({
                            scrollTop: 999999999
                        });
                    }, 150);
                });
            },
            //头像上传失败回调事件
            onUploadError(e) {
                console.error(e);
                this.$refs.uploading.stopLoading();
                this.$refs.upload.clear();
                this.$refs.toast.show({
                    text: '发送失败',
                    type: 'error',
                    direction: 'top'
                });
            },
            //头像上传超出大小限制回调事件
            onUploadOversize() {
                this.$refs.uploading.stopLoading();
                this.$refs.upload.clear();
                this.$refs.toast.show({
                    text: '图片超出10MB限制',
                    type: 'warning',
                    direction: 'top'
                });
            },
            // scroll-view监听滚动事件
            handleScroll(e) {
                // console.log(e)
            },
            // 监听消息长按事件
            handleLongPress(e) {
                uni.vibrateShort();
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
                                        type: 'success',
                                        direction: 'top'
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
                uni.previewImage({
                    urls: [url]
                });
            },
            /**
             * 删除聊天消息
             * @param {Number} targetId 消息ID
             */
            deleteMessage(targetId) {
                uni.showLoading({
                    title: '正在删除'
                })
                deleteChatHistory({
                    urlParam: `?ids=${targetId}`
                }).then(() => {
                    uni.hideLoading();
                    this.recordsLength -= 1;
                    this.messageRecords.splice(this.messageRecords.findIndex(item => item.id === targetId), 1);
                    this.$refs.toast.show({
                        text: '已删除',
                        type: 'success',
                        direction: 'top'
                    });
                }).catch(err => {
                    uni.hideLoading();
                    console.error(err);
                    this.$refs.toast.show({
                        text: '删除失败',
                        type: 'error',
                        direction: 'top'
                    });
                })
            },
            // 导航栏菜单按钮点击事件
            handleMenuBtnClick() {
                uni.showActionSheet({
                    itemList: ['查看个人主页', `${this.isFocused ? '取消关注' : '关注'}`, `${this.isBlocked ? '移出黑名单' : '加入黑名单'}`],
                    success: res => {
                        if (res.tapIndex === 0) {
                            //查看个人主页
                            uni.navigateTo({
                                url: `/pagesByStore/userPage/userPage?userId=${this.friendInfo.userId}`
                            });
                        }
                        else if (res.tapIndex === 1) {
                            //关注操作
                            this.handleFocusBtnClick();
                        }
                        else if (res.tapIndex === 2) {
                            //黑名单操作
                            this.handleBlockBtnClick();
                        }
                    }
                });
            },
            // 黑名单按钮点击事件
            async handleBlockBtnClick() {
                this.isReadyToShow = false;
                this.rawInputValue = '';
                this.inputFocusStatus = false;
                this.keyboardHeight = 0;
                if (this.isBlocked) {
                    //已拉黑
                    await removeFromBlockList({
                        urlParam: {
                            userId: this.friendInfo.userId
                        }
                    }).then(() => {
                        this.isBlocked = false;
                    }).catch(err => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '移出黑名单失败',
                            type: 'error',
                            direction: 'top'
                        });
                    });
                }
                else {
                    //未拉黑
                    await addToBlockList({
                        urlParam: {
                            userId: this.friendInfo.userId
                        }
                    }).then(() => {
                        this.isBlocked = true;
                    }).catch(err => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '加入黑名单失败',
                            type: 'error',
                            direction: 'top'
                        });
                    });
                }
                setTimeout(() => {
                    this.rawInputValue = '';
                    this.inputFocusStatus = false;
                    this.isReadyToShow = true;
                    this.keyboardHeight = 0;
                }, 500);
            },
            // 关注按钮点击事件
            async handleFocusBtnClick() {
                this.isReadyToShow = false;
                this.rawInputValue = '';
                this.inputFocusStatus = false;
                this.keyboardHeight = 0;
                if (this.isFocused) {
                    //已关注
                    await removeFriend({
                        urlParam: {
                            userId: this.friendInfo.userId
                        }
                    }).then(() => {
                        this.isFocused = false;
                    }).catch(err => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '取消关注失败',
                            type: 'error',
                            direction: 'top'
                        });
                    });
                }
                else {
                    //未关注
                    await addFriend({
                        urlParam: {
                            userId: this.friendInfo.userId
                        }
                    }).then(() => {
                        this.isFocused = true;
                    }).catch(err => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '关注失败',
                            type: 'error',
                            direction: 'top'
                        });
                    });
                }
                setTimeout(() => {
                    this.rawInputValue = '';
                    this.inputFocusStatus = false;
                    this.isReadyToShow = true;
                    this.keyboardHeight = 0;
                }, 500);
            },
            // 重定向至聊天列表页
            redirectToChatList() {
                uni.navigateBack();
            },
            // 获取消息更新
            startCheckingUpdate() {
                if (this.messageRecords.length === 0) {
                    this.getChatHistory();
                }
                else {
                    this.$refs.loading.stopLoading();
                }
                if (!this.$store.state.userInfo) {
                    const currentPage = this.utils.getCurrentPage();
                    store.commit('currentPageUrl', currentPage.curFullUrl);
                    uni.redirectTo({
                        url: `/pages/login/wxLogin`
                    });
                }
            },
            /**
             * 跳转个人主页
             * @param {Number|String} userId 用户ID
             */
            gotoUserPage(userId) {
                uni.navigateTo({
                    url: `/pagesByStore/userPage/userPage?userId=${userId}`
                });
            }
        },
        computed: {
            // 计算时间差
            computeDatetime(oldTime, newTime) {
                return (oldTime, newTime) => {
                    return (new Date(newTime) - new Date(oldTime)) / 1000 / 60 >= 5; //返回两个时间差是否大于5分钟
                }
            }
        },
        watch: {
            // 消息原始输入框的值
            rawInputValue(nval) {
                this.isSendReady = nval.replace(/\s*/g, "") !== ''; //判断输入框中是否为空白内容
            },
            isReadyToShow(nval, oval) {
                if (!nval && oval) {
                    this.$refs.loading.startLoading();
                }
                else if (nval && !oval) {
                    this.$refs.loading.stopLoading();
                }
            },
            scrollTop(nval, oval) {
                if (nval !== oval && nval === 0) {
                    if (this.existMore) {
                        if (this.messageRecords.length === 0) {
                            this.getChatHistory();
                        }
                        else {
                            this.getChatHistory(this.messageRecords[0].time);
                        }
                    }
                }
            }
        },
        onPageScroll(e) {
            this.scrollTop = e.scrollTop;
        },
        onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            this.navigationButtonWidth = this.$refs.navigationBar.navigationButtonWidth;
            this.navigationButtonHeight = this.$refs.navigationBar.navigationBarHeight;
        },
        async onShow() {
            this.$refs.loading.startLoading({
                width: this.windowWidth,
                height: this.windowHeight - this.navigationHeight
            }); //开启loading动画
            await this.setChatBaseInfo(); //设置会话信息
            await this.getUserRelationships();
            this.startCheckingUpdate();
            uni.onSocketMessage(res => {
                const data = JSON.parse(res.data);
                if (data.errorCode === 120) {
                    //私信消息
                    this.receiveNewMessage(data); //监听到Socket新消息
                }
                else if (data.errorCode === 121) {
                    //通知消息
                }
            });
        },
        beforeDestroy() {
            this.getChatHistory();
        }
    }
</script>

<style lang="scss" scoped>
  @import 'chatDetail';
</style>