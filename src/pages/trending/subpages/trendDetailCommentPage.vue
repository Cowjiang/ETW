<template>
  <view
    class="container"
    :style="{
      marginTop: `${containerMarginTop}px`,
    }"
  >
    <navigationBar ref="navigationBar"></navigationBar>
    <!-- 一级评论容器 -->
    <view class="comment-item" v-if="firstCommentData">
      <!-- 评论者头像 -->
      <view class="left-avatar-box">
        <u-avatar :size="80"></u-avatar>
      </view>
      <!-- 评论内容 -->
      <view class="right-content-box">
        <view class="main-content-box">
          <view class="main-info-box">
            <view class="comment-username">
              {{ firstCommentData.userInfo.username }}
            </view>
            <text class="comment-date">
              {{ firstCommentData.createdTime | dateFilter("yy-mm-dd hh:mm") }}
            </text>
            <view class="comment-text">{{ firstCommentData.content }}</view>
          </view>
          <view class="like-box">
            <likeButton
              @clickLike="likeComment(firstCommentData.id)"
            ></likeButton>
          </view>
        </view>
      </view>
    </view>
    <view class="second-comment-title-box"
      ><text class="fa fa-window-minimize fa-rotate-90"></text> 回复
    </view>
    <!-- 二级评论列表 -->
    <view class="second-comment-list-box" v-if="secondCommentList">
      <view
        v-for="(item, index) in secondCommentList"
        :key="index"
        class="comment-item"
      >
        <!-- 评论者头像 -->
        <view class="left-avatar-box">
          <u-avatar :size="80"></u-avatar>
        </view>
        <!-- 评论内容 -->
        <view class="right-content-box">
          <view class="main-content-box">
            <view
              class="main-info-box"
              @tap.stop="commentBySecondComment(item.scUserInfo)"
            >
              <view class="comment-username">
                {{ item.scUserInfo.username }}
                <text class="reply-text" v-if="item.toUserInfo">
                  <text class="fa fa-caret-right"></text>
                  {{ `${item.toUserInfo.username}` }}
                </text>
              </view>
              <text class="comment-date">
                {{ item.createdTime | dateFilter("yy-mm-dd hh:mm") }}
              </text>
              <view class="comment-text">{{ item.content }}</view>
            </view>
            <view class="like-box">
              <likeButton @clickLike="likeComment(item.id)"></likeButton>
            </view>
          </view>
        </view>
      </view>
      <view class="bottom-button-area-placeholder"></view>
    </view>
    <!-- 底部按钮容器 -->
    <view class="bottom-button-area">
      <view class="left-area">
        <view @tap.stop="commentByFirstComment()" class="comment-input-view">
          <text class="fa fa-pencil"></text>
          写个评论吧
        </view>
      </view>
    </view>
    <!-- 评论输入框 -->
    <view
      v-if="isShowCommentbox"
      class="comment-box"
      :style="'bottom:' + KeyboardHeight + 'px;'"
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
        @focus="focusTextarea"
        @blur="blurTextarea"
      />
      <view class="button-area">
        <view class="submit-button" @click="submitComment">发送</view>
      </view>
    </view>
    <toast ref="toast"></toast>
  </view>
</template>

<script>
import {
  getTrendSecondComment,
  postTrendSecondComment,
} from "@/common/js/api/models.js";
export default {
  data() {
    return {
      containerMarginTop: 0,
      firstCommentData: null,
      secondCommentList: null,
      isShowCommentbox: false,
      commentTextareaPlaceholder: `写个评论吧`,
      KeyboardHeight: 0,
      commentPostText: "",
      commentPostType: 0, //[0,1,2]分别是：在当前动态发布一级评论，在一级评论中发布二级评论，二级评论之间互相回复
      toSecondUserInfo: null, //被回复二级评论人的信息
    };
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("acceptDataFromOpenerPage", (data) => {
      this.firstCommentData = data;
      this.$refs.navigationBar.setNavigation({
        titleText: `${this.firstCommentData.commentNumber}条回复`,
        backgroundColor: "white",
      });
      this.loadSecondComment(
        this.firstCommentData.dynamicId,
        this.firstCommentData.id
      );
    });
  },
  methods: {
    loadSecondComment(trendId, commentId) {
      getTrendSecondComment({
        urlParam: {
          trendId: trendId,
          commentId: commentId,
        },
      })
        .then((res) => {
          this.secondCommentList = res.data.records;
        })
        .catch((err) => {
          this.$refs.toast.show({
            text: err,
            type: "error",
            direction: "top",
          });
        });
    },
    /**
     * @description:输入框聚焦的回调
     */
    focusTextarea(e) {
      if (this.isShowCommentbox === true) {
        //键盘高度
        this.KeyboardHeight = e.detail.height;
      } else {
        this.isShowCommentbox = true;
      }
    },
    /**
     * @description:输入框失去焦点的回调
     */
    blurTextarea() {
      console.log("输入框失去焦点的回调");
      this.KeyboardHeight = 0;
      this.isShowCommentbox = false;
      this.commentTextareaPlaceholder = `写个评论吧`;
    },
    /**
     * @description:给当前页面下的一级评论回复二级评论
     */
    commentByFirstComment() {
      this.commentPostType = 1;
      this.isShowCommentbox = true;
    },
    /**
     * @description:二级评论之间互相回复
     */
    commentBySecondComment(secondUserInfo) {
      this.commentPostType = 2;
      this.toSecondUserInfo = secondUserInfo;
      this.commentTextareaPlaceholder = `回复@${this.toSecondUserInfo.username}`;
      this.isShowCommentbox = true;
    },
    /**
     * @description:提交评论
     * @param {Number} userId 二级评论的用户Id
     */
    submitComment() {
      this.utils.debounce(() => {
        console.log(this.commentPostType);
        if (this.commentPostText.replace(/\s+/g, "") === "") {
          this.$refs.toast.show({
            text: "内容不能为空",
            type: "warning",
            direction: "top",
          });
        } else {
          switch (this.commentPostType) {
            case 1:
              postTrendSecondComment({
                urlParam: {
                  trendId: this.firstCommentData.dynamicId,
                  commentId: this.firstCommentData.id,
                },
                queryData: {
                  content: this.commentPostText,
                },
              })
                .then((res) => {
                  if (res.success) {
                    this.commentPostText = "";
                    this.loadSecondComment(
                      this.firstCommentData.dynamicId,
                      this.firstCommentData.id
                    );
                    this.$refs.toast.show({
                      text: "评论成功",
                      type: "success",
                      direction: "top",
                    });
                  } else {
                    this.$refs.toast.show({
                      text: "评论发生错误",
                      type: "error",
                      direction: "top",
                    });
                  }
                })
                .catch((err) => {
                  this.$refs.toast.show({
                    text: err.data,
                    type: "error",
                    direction: "top",
                  });
                });
              break;
            case 2:
              postTrendSecondComment({
                urlParam: {
                  trendId: this.firstCommentData.dynamicId,
                  commentId: this.firstCommentData.id,
                },
                queryData: {
                  content: this.commentPostText,
                  toUserId: this.toSecondUserInfo.id,
                },
              })
                .then((res) => {
                  if (res.success) {
                    this.commentPostText = "";
                    this.loadSecondComment(
                      this.firstCommentData.dynamicId,
                      this.firstCommentData.id
                    );
                    this.$refs.toast.show({
                      text: "评论成功",
                      type: "success",
                      direction: "top",
                    });
                  } else {
                    this.$refs.toast.show({
                      text: "评论发生错误",
                      type: "error",
                      direction: "top",
                    });
                  }
                })
                .catch((err) => {
                  this.$refs.toast.show({
                    text: err.data,
                    type: "error",
                    direction: "top",
                  });
                });
            default:
              break;
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx 32rpx 0 32rpx;
}
.comment-item {
  display: flex;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  .left-avatar-box {
    width: 80rpx;
  }
  .right-content-box {
    margin-left: 15rpx;
    width: 100%;
    .main-content-box {
      display: flex;
      .main-info-box {
        width: 100%;
        .comment-username {
          font-weight: 600;
          font-size: 32rpx;
          .reply-text {
            margin-left: 15rpx;
            color: $uni-color-blue;
            font-weight: 400;
            .fa{
              margin-right: 15rpx;
            }
          }
        }
        .comment-date {
          font-size: 24rpx;
          font-weight: 300;
          color: $uni-text-color-placeholder;
        }
        .comment-text {
          font-size: 32rpx;
          margin-top: 10rpx;
        }
      }
      .like-box {
        font-size: 32rpx;
      }
    }
  }
}
.second-comment-title-box {
  font-size: 36rpx;
  font-weight: 700;
  margin: 30rpx 0;
}
.bottom-button-area-placeholder {
  height: 150rpx;
  width: 100%;
}
.bottom-button-area {
  background-color: white;
  z-index: 100;
  position: fixed;
  bottom: 0;
  left: 0;
  height: 150rpx;
  border-top: 1rpx solid $uni-color-grey;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  .left-area {
    z-index: 101;
    width: 80%;
    height: 70rpx;
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
.comment-box {
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