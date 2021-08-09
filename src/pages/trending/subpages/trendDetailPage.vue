<template>
  <view
    class="container"
    :style="{
      marginTop: `${containerMarginTop}px`,
    }"
  >
    <navigationBar ref="navigationBar"></navigationBar>
    <!-- 动态容器 -->
    <view v-if="trendData" class="trend-box">
      <!-- 用户信息容器 -->
      <view class="author-box">
        <!-- 头像 -->
        <u-avatar></u-avatar>
        <view class="author-name-box">
          <!-- 用户名 -->
          <view class="author-name">{{ trendData.userInfo.username }}</view>
          <view class="author-description">{{
            trendData.createdTime | dateFilter("yy-mm-dd hh:mm")
          }}</view>
        </view>
        <!-- 右侧按钮组 -->
        <view class="right-button-area">
          <text class="fa fa-ellipsis-v fa-lg"></text>
        </view>
      </view>
      <!-- 动态文本 -->
      <view class="trend-text">
        <u-read-more color="#808080" close-text="展开" :toggle="true">
          {{ trendData.content }}
        </u-read-more>
      </view>
      <!-- 动态图片组 -->
      <trendsImageGroup
        :imageDataList="trendData.dynamicImages"
      ></trendsImageGroup>
    </view>
    <view class="comment-title-box"
      ><text class="fa fa-window-minimize fa-rotate-90"></text> 评论
    </view>
    <!-- 评论区容器 -->
    <commentList
      :commentList="commentList"
      @clickSecondComment="toSecondCommentPage($event)"
      @clickFirstComment="commentByFirstComment(arguments)"
    ></commentList>
    <!-- 底部按钮容器 -->
    <view class="bottom-button-area">
      <view class="left-area">
        <view @tap.stop="commentByTrend()" class="comment-input-view">
          <text class="fa fa-pencil"></text>
          写个评论吧
        </view>
      </view>
      <view class="right-area">
        <view>
          <text class="fa fa-star-o fa-lg"></text>
        </view>
        <view @click="likeTrend(trendData.id)">
          <text class="fa fa-heart-o fa-lg"></text>
        </view>
        <view>
          <text class="fa fa-share-square-o fa-lg"></text>
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
  postTrendComment,
  postTrendSecondComment,
  getTrendComment,
} from "@/common/js/api/models.js";
export default {
  data() {
    return {
      trendData: null,
      containerMarginTop: null,
      windowHeight: null,
      isShowCommentbox: false,
      KeyboardHeight: 0,
      commentList: [], //评论区列表
      commentPostText: "",
      commentPostType: 0, //[0,1]分别是：在当前动态评论，在评论中回复
      commentPostId: 0, // 回复其他评论的id
      commentToUser: "", //当前回复的人
      commentTextareaPlaceholder: "写个评论吧",
    };
  },
  onLoad() {
    this.containerMarginTop = this.$refs.navigationBar.getNavigationHeight();
    this.windowHeight = this.$refs.navigationBar.windowHeight;
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("acceptDataFromOpenerPage", (data) => {
      this.trendData = data;
      this.loadTrendComment();
    });
  },
  methods: {
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
     * @description: 给一级评论回复二级评论
     * @param {Number} commentId  一级评论的id
     * @param {String} toUser  一级评论的用户
     */
    commentByFirstComment(arg) {
      let commentId = arg[0];
      let toUser = arg[1];
      this.commentPostType = 1;
      this.commentPostId = commentId;
      this.commentTextareaPlaceholder = `回复@${toUser}`;
      this.isShowCommentbox = true;
    },
    /**
     * @description: 评论当前动态
     */
    commentByTrend() {
      this.commentPostType = 0;
      this.isShowCommentbox = true;
    },
    /**
     * @description:提交评论
     */ submitComment() {
      this.utils.debounce(() => {
        if (this.commentPostText.replace(/\s+/g, "") === "") {
          this.$refs.toast.show({
            text: "内容不能为空",
            type: "warning",
            direction: "top",
          });
        } else {
          switch (this.commentPostType) {
            case 0:
              postTrendComment({
                urlParam: this.trendData.id,
                queryData: {
                  content: this.commentPostText,
                },
              })
                .then((res) => {
                  if (res.success) {
                    this.commentPostText = "";
                    this.loadTrendComment();
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
            case 1:
              postTrendSecondComment({
                urlParam: {
                  trendId: this.trendData.id,
                  commentId: this.commentPostId,
                },
                queryData: {
                  content: this.commentPostText,
                },
              })
                .then((res) => {
                  if (res.success) {
                    this.commentPostText = "";
                    this.loadTrendComment();
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
            default:
              break;
          }
        }
      });
    },
    /**
     * @description:获取评论
     */
    loadTrendComment() {
      getTrendComment({
        urlParam: this.trendData.id,
      })
        .then((res) => {
          this.commentList = res.data.records;
        })
        .catch((err) => {
          this.$refs.toast.show({
            text: err.data,
            type: "error",
            direction: "top",
          });
        });
    },
    /**
     * @description:跳转到二级评论详细页
     */
    toSecondCommentPage(mainCommentData) {
      uni.navigateTo({
        url: "/pages/trending/subpages/trendDetailCommentPage",
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit("acceptDataFromOpenerPage", mainCommentData);
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
}
.trend-box {
  padding: 6vw 4vw;
  border-bottom: 1rpx solid $uni-color-grey;
  background-color: white;
  .author-box {
    display: flex;
    justify-content: flex-start;
    height: 13vw;
    width: 100%;
    .author-name-box {
      margin-left: 2vw;
      margin-right: auto;
      width: 55vw;
      .author-name {
        @include ellipsis(1);
        font-weight: bold;
        font-size: 30rpx;
        color: $uni-color-black;
      }
      .author-description {
        @include ellipsis(1);
        margin-top: 1vw;
        font-weight: lighter;
        font-size: 24rpx;
        color: $uni-text-color-placeholder;
      }
    }
    .right-button-area {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50rpx;
    }
  }
  .trend-text {
    margin: 20rpx 0;
  }
}
.comment-title-box {
  font-size: 36rpx;
  font-weight: 700;
  margin: 30rpx 0;
}
.comment-list-box {
  background-color: white;
  padding: 0 4vw;
  .comment-item {
    display: flex;
    margin-bottom: 15rpx;
    padding-bottom: 15rpx;
    border-bottom: 1rpx solid $uni-color-grey;
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
      .second-comment-box {
        margin-top: 15rpx;
        padding: 10rpx 0;
        display: flex;
        .avatar-box {
          padding-top: 10rpx;
          width: 48rpx;
          font-size: 28;
        }
        .second-content-box {
          margin-left: 10rpx;
          width: 100%;
          .comment-username {
            font-weight: 600;
            font-size: 28rpx;
          }
          .comment-text {
            font-size: 28rpx;
            margin-top: 10rpx;
            font-weight: 300;
          }
        }
        .like-box {
          font-size: 32rpx;
        }
      }
      .more-comment {
        padding-left: 58rpx;
        font-size: 28rpx;
        color: $uni-color-blue;
        margin-bottom: 15rpx;
      }
    }
  }
  .bottom-button-area-placeholder {
    height: 150rpx;
    width: 100%;
  }
}
.bottom-button-area {
  background-color: white;
  z-index: 100;
  position: fixed;
  bottom: 0;
  height: 150rpx;
  border-top: 1rpx solid $uni-color-grey;
  display: flex;
  width: 100%;
  .left-area {
    z-index: 101;
    width: 100%;
    height: 70rpx;
    flex: 2;
    margin: 25rpx 20rpx 0 20rpx;
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
  .right-area {
    z-index: 101;
    margin-top: 25rpx;
    height: 70rpx;
    flex: 1;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    view {
      text-align: center;
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