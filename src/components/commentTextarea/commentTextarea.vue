<template>
  <view>
    <!-- 底部按钮容器 -->
    <view class="bottom-comment-box">
      <view class="left-area">
        <view @tap.stop="clickBottomBox()" class="comment-input-view">
          <text class="fa fa-pencil"></text>
          写个评论吧
        </view>
      </view>
      <slot name="right-area"></slot>
    </view>
    <!-- 评论输入框 -->
    <view
      v-if="isShowCommentbox"
      class="textarea-box"
      :style="{ transform: `translateY(-${keyboardHeight}px)` }"
    >
      <textarea
        v-model="commentPostText"
        class="comment-textarea"
        :focus="isShowCommentbox"
        :auto-blur="true"
        :fixed="true"
        :adjust-position="false"
        :show-confirm-bar="false"
        :placeholder="commentTextareaPlaceholder"
        @keyboardheightchange="handleKeyboardHeightChange"
        @focus="focusTextarea"
        @blur="blurTextarea"
      />
      <view class="button-area">
        <view class="submit-button" @click="submitComment">发送</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "commentTextarea",
  data() {
    return {
      commentPostText: "",
      isShowCommentbox: false,
      commentTextareaPlaceholder: "写个评论吧",
      keyboardHeight: 0, //键盘高度
    };
  },
  methods: {
    submitComment() {
      this.$emit("submitComment");
    },
    clickBottomBox() {
      this.$emit("clickBottomBox");
    },
    isShowTextarea(bol) {
      if (typeof bol === "boolean") {
        this.isShowCommentbox = bol;
      }
    },
    /**
     * @description:输入框聚焦的回调
     */
    focusTextarea() {
      if (this.isShowCommentbox === true) {
      } else {
        this.isShowCommentbox = true;
      }
    },
    /**
     * @description:输入框失去焦点的回调
     */
    blurTextarea() {
      this.keyboardHeight = 0;
      this.isShowCommentbox = false;
      this.commentTextareaPlaceholder = `写个评论吧`;
    },
    /**
     * @description:键盘高度变化的回调
     */
    handleKeyboardHeightChange(e) {
      if (e.detail.height !== 0) {
        this.keyboardHeight = e.detail.height;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.bottom-comment-box {
  background-color: white;
  z-index: 100;
  position: fixed;
  bottom: 0;
  left: 0;
  height: 150rpx;
  border-top: 1rpx solid $uni-color-grey;
  display: flex;
  width: 100%;
  .left-area {
    width: 100%;
    height: 70rpx;
    flex: 2;
    margin: 25rpx 25rpx 0 25rpx;
    .comment-input-view {
      background-color: $uni-color-grey;
      color: $uni-text-color-placeholder;
      padding-left: 25rpx;
      height: 70rpx;
      line-height: 70rpx;
      border-radius: 30rpx;
      .fa {
        margin-right: 10rpx;
      }
    }
    .test-textarea {
      background-color: $uni-color-grey;
      color: $uni-text-color-placeholder;
      padding-left: 25rpx;
      height: 70rpx;
      border-radius: 30rpx;
      width: 100%;
    }
  }
}
.textarea-box {
  z-index: 102;
  border-top: 1rpx solid $uni-color-grey;
  border-radius: 30rpx;
  width: 100%;
  height: 250rpx;
  background-color: white;
  position: fixed;
  bottom: 0px;
  left: 0px;
  right: 0px;
  padding: 20rpx 60rpx 0 60rpx;
  .comment-textarea {
    box-sizing: border-box;
    padding: 30rpx;
    border-radius: 30rpx;
    height: 150rpx;
    width: 100%;
    background-color: $uni-color-grey;
  }
  .button-area {
    width: 100%;
    .submit-button {
      color: $uni-color-primary;
      float: right;
    }
  }
}
</style>
