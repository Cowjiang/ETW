<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar" />
    <toast ref="toast" class="toast" />

    <view
      class="chat-container"
      :style="{ height: `${windowHeight - navigationHeight}px` }"
    >
      <!-- 顶部功能按钮区域 -->
      <view class="top-btn-area" :style="{ top: `${navigationHeight}px` }">
        <view>关注TA</view>
        <view @click="stopCheckingUpdate">加入黑名单</view>
      </view>
      <!-- 聊天消息区域 -->
      <view
        class="message-area"
        :style="{
          height: `${windowHeight - navigationHeight - 60}px`,
          transform: `translateY(-${keyboardHeight}px)`,
        }"
      >
        <scroll-view
          class="message-scroll-view"
          ref="scrollView"
          :scroll-y="true"
          @scroll="handleScroll"
          :scroll-into-view="scrollToViewId"
          scroll-with-animation="true"
          refresher-enabled="true"
          refresher-threshold="300"
          :refresher-triggered="refresherTriggered"
          @refresherrefresh="handleRefreshStart"
          @refresherrestore="handleRefreshEnd"
        >
          <!-- 滚动区域顶部 -->
          <view id="scrollTopView"></view>
          <!-- 每条消息的容器 -->
          <view
            class="message-container"
            v-for="(message, index) in messageRecords"
            :key="message.id"
            :id="`message${message.id}`"
          >
            <!-- 消息发送时间容器 -->
            <view
              class="datetime-container"
              v-if="
                computeDatetime(
                  messageRecords[index - 1] === undefined
                    ? 0
                    : messageRecords[index - 1].time,
                  message.time
                )
              "
            >
              {{ message.time | formatTime }}
            </view>
            <!-- 用户头像容器 -->
            <view
              class="avatar-container"
              :class="
                message.isMe === false
                  ? 'avatar-container-left'
                  : 'avatar-container-right'
              "
            >
            </view>
            <!-- 消息内容 -->
            <view
              class="message-content"
              @longpress="handleLongPress"
              :data-name="`message${index}`"
              @touchstart="handleTouchStart"
              @touchend="handleTouchEnd"
              @touchcancel="handleTouchEnd"
              :class="
                message.isMe === false
                  ? 'message-content-left'
                  : 'message-content-right'
              "
              :style="{
                filter: `${
                  messageTouchingId === 'message' + index
                    ? 'brightness(90%)'
                    : 'brightness(100%)'
                }`,
              }"
            >
              <view v-if="!message.isPhoto">
                {{ message.content }}
              </view>
              <image
                v-if="message.isPhoto"
                :src="message.content"
                mode="widthFix"
                @longpress="handleLongPress"
                :data-name="`message${index}`"
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
        class="input-area"
        :style="{ transform: `translateY(-${keyboardHeight}px)` }"
      >
        <!-- 输入框左侧按钮容器 -->
        <view
          class="more-btn-container"
          :style="{
            transform: `translateX(${inputFocusStatus ? '-120' : '0'}rpx)`,
          }"
        >
          <i
            class="fa fa-picture-o"
            aria-hidden="true"
            :style="{ opacity: `${inputFocusStatus ? '0' : '1'}` }"
            @click="chooseImage(0)"
          ></i>
          <i
            class="fa fa-camera"
            aria-hidden="true"
            :style="{ opacity: `${inputFocusStatus ? '0' : '1'}` }"
            @click="chooseImage(1)"
          ></i>
          <i
            class="fa fa-chevron-right"
            aria-hidden="true"
            :style="{ opacity: `${inputFocusStatus ? '1' : '0'}` }"
          ></i>
        </view>
        <!-- 输入框容器 -->
        <view class="input-container">
          <view
            class="input-inner-container"
            @click="showRawInput"
            :style="{
              width: `${
                inputFocusStatus
                  ? 'calc(100vw - 200rpx)'
                  : 'calc(100vw - 220rpx - 80rpx)'
              }`,
            }"
          >
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
              :auto-blur="true"
            />
            <view class="show-input" v-if="!inputFocusStatus">{{
              rawInputValue
            }}</view>
          </view>
          <!-- 输入框右侧发送按钮容器 -->
          <view
            class="send-btn-container"
            @click="sendMessage"
            :style="{ opacity: `${isSendReady ? '1' : '0.5'}` }"
          >
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
import { toast } from "../../components/toast/toast.vue";
import { navigationBar } from "../../components/navigationBar/navigationBar.vue";
import { upload } from "../../components/upload/upload.vue";
// import {getUserInfoTemp} from "../../common/js/api/models.js";
import {
  deleteChatHistory,
  getChatHistory,
  getUploadSignature,
  sendMessage,
} from "../../common/js/api/models.js";

export default {
  components: {
    toast,
    navigationBar,
    upload,
  },
  data() {
    return {
      windowWidth: 0, //窗口宽度
      windowHeight: 0, //窗口高度
      navigationHeight: 0, //导航栏高度
      receiverInfo: {
        userId: "0",
        avgPath: "",
        realName: "",
        username: "粽子",
      }, //信息发送对象的信息
      rawInputValue: "", //消息输入框的数据
      inputFocusStatus: false, //输入框聚焦状态
      isSendReady: false, //输入框文字验证状态
      keyboardHeight: 0, //弹起键盘的高度
      messageRecords: [], //消息记录数组
      messageRecordsTemp: [], //消息记录缓冲数组
      recordsLength: NaN, //当前获取聊天消息记录的请求回报的消息总数
      scrollToViewId: "", //scroll-view的定位锚id
      messageTouchingId: "", //当前触摸消息记录的数据名
      action: "", //图片上传Url
      fileList: [], //发送图片的队列
      refresherTriggered: false, //scroll-view下拉刷新触发状态
      currentPage: -1, //当前消息记录的页码
      pageSize: 15, //每次请求获取聊天记录的单页数据总数
      checkUpdateTimer: null, //检查消息更新的计时器
    };
  },
  methods: {
    // 设置私聊会话基本信息
    setChatBaseInfo() {
      this.$refs.navigationBar.setNavigation({
        titleText: this.receiverInfo.username,
        backgroundColor: "#ffffff",
        customBackFunc: this.redirectToChatList,
      });
    },
    /**
     * 获取聊天消息记录
     * @param queryPage      [Number]   查询页码
     * @param isCheckUpdate  [Boolean]  当前调用是否为检查更新
     */
    getChatHistory(queryPage = NaN, isCheckUpdate = false) {
      getChatHistory({
        urlParam: `${this.receiverInfo.userId}?pageSize=${
          this.pageSize
        }&&pageNumber=${isCheckUpdate ? 1 : queryPage || this.currentPage + 1}`,
      })
        .then((res) => {
          if (isCheckUpdate) {
            if (res.data.total !== this.recordsLength) {
              this.recordsLength = res.data.total;
              this.messageRecordsTemp = [];
              this.getChatHistory((queryPage = 1));
            }
            return;
          }
          for (const messageRecordsTempElement of res.data.records) {
            this.messageRecordsTemp.unshift({
              id: messageRecordsTempElement.id,
              content: messageRecordsTempElement.content,
              isPhoto: !messageRecordsTempElement.isText,
              isMe:
                messageRecordsTempElement.senderId.toString() !==
                this.receiverInfo.userId,
              time: messageRecordsTempElement.createdTime,
            });
          }
          this.messageRecords = this.messageRecordsTemp;
          this.recordsLength = res.data.total;
          this.scrollToViewId = `message${this.messageRecords.length - 1}`;
          this.refresherTriggered = false;
          this._freshing = false;
          // console.log(this.messageRecords)
          this.$forceUpdate();
        })
        .catch((err) => {
          clearInterval(this.checkUpdateTimer);
          this.checkUpdateTimer = null;
          this.refresherTriggered = false;
          this._freshing = false;
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
      }
      this.$forceUpdate();
    },
    // 发送文字消息
    sendMessage() {
      setTimeout(() => {
        this.scrollToViewId = `message${this.messageRecords.length - 1}`;
        this.$forceUpdate();
      }, 0);
      if (this.isSendReady === true) {
        wx.showLoading({
          title: "正在发送",
        });
        sendMessage({
          urlParam: this.receiverInfo.userId,
          queryData: {
            content: this.rawInputValue,
            isText: true,
          },
        }).then((res) => {
          if (res.success) {
            wx.hideLoading();
            this.messageRecords.push({
              id: res.data.id,
              isMe: true,
              isPhoto: false,
              content: this.rawInputValue,
              time: new Date(),
            });
            this.recordsLength += 1;
            this.rawInputValue = "";
            this.inputFocusStatus = true;
          } else {
            wx.hideLoading();
            this.$refs.toast.show({
              text: "发送失败",
              type: "error",
              direction: "top",
            });
          }
        });
      } else {
        this.inputFocusStatus = true;
      }
    },
    // 选择图片  mode  [Number]  选择图片模式（0: 从相册选择图片, 1: 相机拍摄图片）
    chooseImage(mode) {
      switch (mode) {
        case 0:
          this.$refs.upload.changeSourceType(["album"]);
          this.$refs.upload.selectFile();
          break;
        case 1:
          this.$refs.upload.changeSourceType(["camera"]);
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
        getUploadSignature({ urlParam: dir })
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
            } else {
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
        title: "正在发送",
      });
      sendMessage({
        urlParam: this.receiverInfo.userId,
        queryData: {
          content: this.tempFinalSrc,
          isText: false,
        },
      })
        .then((res) => {
          if (res.success) {
            wx.hideLoading();
            this.scrollToViewId = `messageTopView`;
            setTimeout(() => {
              this.messageRecords.push({
                id: res.data.id,
                isMe: true,
                isPhoto: true,
                content: this.tempFinalSrc,
                time: new Date(),
              });
            }, 0);
            this.$refs.upload.clear();
          } else {
            wx.hideLoading();
            this.$refs.toast.show({
              text: "发送失败",
              type: "error",
              direction: "top",
            });
            this.recordsLength -= 1;
            this.$refs.upload.clear();
          }
        })
        .catch((error) => {
          console.log(error);
          this.recordsLength -= 1;
        });
    },
    // scroll-view监听滚动事件
    handleScroll(e) {
      // console.log(e)
    },
    // 监听消息长按事件
    handleLongPress(e) {
      this.utils.throttle(() => {
        if (e.target.dataset.name !== undefined) {
          let targetId = parseInt(e.target.dataset.name.replace("message", ""));
          uni.showActionSheet({
            itemList: ["复制", "删除", "举报该用户"],
            success: (res) => {
              if (res.tapIndex === 0) {
                uni.setClipboardData({
                  data: this.messageRecords[targetId].content,
                });
              } else if (res.tapIndex === 1) {
                this.deleteMessage(this.messageRecords[targetId].id);
              } else {
                this.$refs.toast.show({
                  text: "举报成功",
                  type: "success",
                });
              }
            },
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
      this.messageTouchingId = "";
      this.$forceUpdate();
    },
    // 全屏预览图片  url  [String]  图片Url
    previewImage(url) {
      wx.previewImage({
        urls: [url],
      });
    },
    // 删除聊天消息  targetId  [Number]  目标ID
    deleteMessage(targetId) {
      wx.showLoading({
        title: "正在删除",
      });
      deleteChatHistory({
        urlParam: "?ids=" + targetId,
      })
        .then((res) => {
          wx.hideLoading();
          if (res.success) {
            this.recordsLength -= 1;
            this.messageRecords.splice(
              this.messageRecords.findIndex((item) => item.id === targetId),
              1
            );
            this.$refs.toast.show({
              text: "已删除",
              type: "success",
              direction: "top",
            });
          } else {
            wx.hideLoading();
            this.$refs.toast.show({
              text: "删除失败",
              type: "error",
              direction: "top",
            });
            console.log(res);
          }
        })
        .catch((err) => {
          wx.hideLoading();
          console.log(err);
        });
    },
    // scroll-view下拉刷新开始事件
    handleRefreshStart() {
      if (this._freshing) return;
      this._freshing = true;
      setTimeout(() => {
        this.getChatHistory(this.currentPage + 1);
      }, 300);
      this.stopCheckingUpdate();
      this.checkUpdateTimer = setInterval(() => {
        this.getChatHistory(NaN, true);
      }, 3000);
      this.currentPage += 1;
    },
    // scroll-view下拉刷新结束事件
    handleRefreshEnd() {
      this.refresherTriggered = "restore";
    },
    // 停止检查聊天消息更新
    stopCheckingUpdate() {
      if (this.checkUpdateTimer !== null) {
        clearInterval(this.checkUpdateTimer);
        this.checkUpdateTimer = null;
      }
    },
    redirectToChatList() {
      uni.redirectTo({
        url: `/pages/chatList/chatList`,
      });
    },
  },
  computed: {
    // 计算时间差
    computeDatetime(oldTime, newTime) {
      return (oldTime, newTime) => {
        return (new Date(newTime) - new Date(oldTime)) / 1000 / 60 >= 5; //返回两个时间差是否大于5分钟
      };
    },
  },
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
        hour: messageDate.getHours().toString().padStart(2, "0"),
        min: messageDate.getMinutes().toString().padStart(2, "0"),
        second: messageDate.getSeconds(),
      };
      let nowTime = {
        year: nowDate.getFullYear(),
        month: nowDate.getMonth() + 1,
        day: nowDate.getDate(),
      };
      if (
        messageTime.year === nowTime.year &&
        messageTime.month === nowTime.month &&
        messageTime.day === nowTime.day
      ) {
        return `${messageTime.hour}:${messageTime.min}`;
      } else {
        return `${messageTime.year}-${messageTime.month}-${messageTime.day} ${messageTime.hour}:${messageTime.min}`;
      }
    },
  },
  watch: {
    rawInputValue(nval, oval) {
      this.isSendReady = nval.replace(/\s*/g, "") !== ""; //判断输入框中是否为空白内容
    },
    messageRecords(nval, oval) {
      this.scrollToViewId = `scrollBottomView`; //将scroll-view移动到底部
      // this.scrollToViewId = `message${nval.length - 1}`;
      this.$forceUpdate();
    },
  },
  mounted() {
    this.receiverInfo.username =
      this.utils.getCurrentPage().curParam.senderName || null;
    this.receiverInfo.userId =
      this.utils.getCurrentPage().curParam.senderId || null;
    if (
      this.receiverInfo.username === null ||
      this.receiverInfo.userId === null
    ) {
      this.redirectToChatList();
    } else this.setChatBaseInfo();
    wx.getSystemInfo({
      success: (res) => {
        this.windowWidth = res.windowWidth;
        this.windowHeight = res.windowHeight;
      },
    }); //获取窗口尺寸
    this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
  },
  onLoad() {
    // this.getOpenerEventChannel().on('chatList', res => {
    //     this.receiverId = res.data.receiverId;
    //     if (this.receiverId !== '') {
    //         this.setChatBaseInfo();
    //     }
    // })
  },
  onShow() {
    this.setChatBaseInfo();
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
  },
};
</script>

<style lang="scss" scoped>
.toast {
  position: absolute;
  top: rpx(150);
  width: 100%;
}

.chat-container {
  width: 100vw;
  height: 100vh;
  background-color: #fff;

  .top-btn-area {
    display: flex;
    width: 100%;
    height: rpx(100);
    position: fixed;
    background-color: #fff;
    z-index: 99;

    view {
      width: 100%;
      height: rpx(70);
      margin: rpx(15) rpx(40) rpx(30);
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
  }

  .message-area {
    width: 100%;
    height: 100%;
    background-color: #fff;
    transition-duration: 200ms;

    .message-scroll-view {
      position: relative;
      width: 100%;
      height: calc(100% - 120rpx);
      top: rpx(120);

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
        }

        .message-content {
          width: fit-content;
          max-width: calc(100vw - 280rpx);
          height: fit-content;
          min-height: rpx(60);
          padding: rpx(20);
          font-size: rpx(30);
        }

        .avatar-container-left {
          float: left;
          margin-left: rpx(40);
          background-color: orange;
        }

        .message-content-left {
          margin-left: rpx(140);
          border-radius: rpx(0) rpx(20) rpx(20) rpx(40);
          background-color: #f4f5f6;
        }

        .avatar-container-right {
          float: right;
          margin-right: rpx(40);
          background-color: deepskyblue;
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

  .input-area {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: rpx(120);
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
      bottom: rpx(20);
      right: 0;
      width: fit-content;
      margin: rpx(20) rpx(20) 0 0;
      height: rpx(80);
      float: right;
      transition-duration: 200ms;

      .input-inner-container {
        width: calc(100vw - 220rpx - 80rpx);
        height: 100%;
        float: left;
        padding: rpx(20) rpx(40);
        border-radius: rpx(100);
        background-color: $uni-color-grey;
        transition-duration: 200ms;
        transition-property: width, transform;

        .raw-input {
          font-size: rpx(32);
        }

        .show-input {
          font-size: rpx(32);
          height: 100%;
        }
      }

      .send-btn-container {
        opacity: 1;
        display: inline;
        height: rpx(70);
        width: rpx(70);
        margin-top: rpx(10);
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
        height: rpx(100);
        position: fixed;
        background-color: #fff;
        z-index: 99;

        view {
          width: 100%;
          height: rpx(70);
          margin: rpx(15) rpx(40) rpx(30);
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
      }

      .message-area {
        width: 100%;
        height: 100%;
        background-color: #fff;
        transition-duration: 200ms;

        .message-scroll-view {
          position: relative;
          width: 100%;
          height: calc(100% - 120rpx);
          top: rpx(120);

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
            }

            .message-content {
              width: fit-content;
              max-width: calc(100vw - 280rpx);
              height: fit-content;
              min-height: rpx(60);
              padding: rpx(20);
              font-size: rpx(30);

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
              background-color: orange;
            }

            .message-content-left {
              margin-left: rpx(140);
              border-radius: rpx(0) rpx(20) rpx(20) rpx(40);
              background-color: #f4f5f6;
            }

            .avatar-container-right {
              float: right;
              margin-right: rpx(40);
              background-color: deepskyblue;
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

      .input-area {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        height: rpx(120);
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
          bottom: rpx(20);
          right: 0;
          width: fit-content;
          margin: rpx(20) rpx(20) 0 0;
          height: rpx(80);
          float: right;
          transition-duration: 200ms;

          .input-inner-container {
            width: calc(100vw - 220rpx - 80rpx);
            height: 100%;
            float: left;
            padding: rpx(20) rpx(40);
            border-radius: rpx(100);
            background-color: $uni-color-grey;
            transition-duration: 200ms;
            transition-property: width, transform;

            .raw-input {
              font-size: rpx(32);
            }

            .show-input {
              font-size: rpx(32);
              height: 100%;
            }
          }

          .send-btn-container {
            opacity: 1;
            display: inline;
            height: rpx(70);
            width: rpx(70);
            margin-top: rpx(10);
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
  }
}
</style>