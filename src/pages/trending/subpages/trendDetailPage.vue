<template>
  <view class="container">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
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
        <u-read-more
          text-indent="20rpx"
          color="#808080"
          close-text="展开"
          :toggle="true"
        >
          {{ trendData.content }}
        </u-read-more>
      </view>
      <!-- 动态图片组 -->
      <trendsImageGroup
        :imageDataList="trendData.dynamicImages"
      ></trendsImageGroup>
      <view v-if="trendData.areaInfo" class="location-area">
        <view class="location-box">
          <text class="fa fa-map-marker fa-fw"></text>
          {{ trendData.areaInfo.areaName }}
        </view>
      </view>
    </view>
    <view class="comment-title-box">
      <text class="fa fa-window-minimize fa-rotate-90"></text>
      评论
    </view>
    <!-- 一级评论容器 -->
    <commentList
      :commentList="commentList"
      @clickSecondComment="toSecondCommentPage($event)"
      @clickFirstComment="commentByFirstComment(arguments)"
      @clickFirstLike="likeComment(arguments, 3)"
      @clickSecondLike="likeComment(arguments, 4)"
    ></commentList>
    <!-- 没有评论的占位 -->
    <noData v-if="commentList.length === 0"> </noData>
    <!-- 底部输入框占位 -->
    <view
      v-if="commentList.length !== 0"
      class="bottom-button-area-placeholder"
    >
      <i v-show="!isEnd" class="fa fa-spinner fa-pulse"></i>
      {{ loadText }}
    </view>
    <!-- 底部输入框 -->
    <commentTextarea
      ref="commentTextarea"
      @clickBottomBox="commentByTrend"
      @submitComment="submitComment"
    >
      <template #right-area>
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
      </template>
    </commentTextarea>
  </view>
</template>

<script>
import {
  postTrendComment,
  postTrendSecondComment,
  getTrendComment,
  like,
} from "@/common/js/api/models.js";
export default {
  commentPostType: 0, //[0,1]分别是：在当前动态评论，在评论中回复
  commentPostId: 0, // 回复其他评论的id
  isLoading: false, //是否正在请求
  data() {
    return {
      trendData: null,
      commentList: null, //评论区列表
      currentPage: 1, //当前页
      pageSize: 8, //每页多少条
      totalNumber: 0, //总页数
      isEnd: false, //数据是否已经加载完
    };
  },
  onLoad() {
    this.$refs.navigationBar.setNavigation({
      titleText: "详细",
      backgroundColor: "white",
    });
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("acceptDataFromOpenerPage", (data) => {
      this.trendData = data;
    });
    this.loadTrendComment(true);
  },
  onReachBottom() {
    this.utils.debounce(() => {
      if (!this.isEnd) {
        this.loadTrendComment(false);
      }
    });
  },
  computed: {
    loadText() {
      const { currentPage, totalNumber, pageSize } = this;
      let totalPages = this.utils.getTotalPages(totalNumber, pageSize);
      if (currentPage < totalPages || totalPages === 0) {
        return "正在加载";
      } else {
        this.isEnd = true;
        if (totalNumber > 8) {
          return "—没有更多内容了—";
        } else {
          return "";
        }
      }
    },
  },
  methods: {
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
      this.$refs.commentTextarea.commentTextareaPlaceholder = `回复@${toUser}`;
      this.$refs.commentTextarea.isShowTextarea(true);
    },
    /**
     * @description: 评论当前动态
     */
    commentByTrend() {
      this.commentPostType = 0;
      this.$refs.commentTextarea.commentTextareaPlaceholder = `写个评论吧`;
      this.$refs.commentTextarea.isShowTextarea(true);
    },
    /**
     * @description:提交评论
     */
    submitComment() {
      this.utils.debounce(() => {
        if (
          this.$refs.commentTextarea.commentPostText.replace(/\s+/g, "") === ""
        ) {
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
                  content: this.$refs.commentTextarea.commentPostText,
                },
              })
                .then((res) => {
                  if (res.success) {
                    this.$refs.commentTextarea.commentPostText = "";
                    this.loadTrendComment(true);
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
                  content: this.$refs.commentTextarea.commentPostText,
                },
              })
                .then((res) => {
                  if (res.success) {
                    this.$refs.commentTextarea.commentPostText = "";
                    this.loadTrendComment(true);
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
     * @param {Boolean} isRefresh  是否刷新
     */
    loadTrendComment(isRefresh) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      if (isRefresh) {
        console.log("刷新");
        // this.currentPage = 1;
        this.isEnd = false;
        getTrendComment({
          urlParam: this.trendData.id,
          queryData: {
            pageNumber: 1,
            pageSize: this.pageSize * this.currentPage,
          },
        })
          .then((res) => {
            if (res.success) {
              const data = res.data;
              this.totalNumber = data.total; //获取总页数
              this.commentList = data.records;
            }
          })
          .catch((err) => {
            throw err;
          })
          .finally(() => {
            this.isLoading = false;
          });
      } else {
        console.log("加载");
        // 请求下一页内容
        this.currentPage += 1;
        getTrendComment({
          urlParam: this.trendData.id,
          queryData: {
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
          },
        })
          .then((res) => {
            if (res.success) {
              const data = res.data;
              this.commentList = this.commentList.concat(data.records);
            }
          })
          .catch((err) => {
            throw err;
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
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
    /**
     * @description: 点赞一级评论
     * @param {Number} targetId 目标id
     * @param {Number} actionType 点赞类型 1 点赞 2 取消点赞
     * @param {String} targetType 点赞对象类型： 1 作品 、 2 动态 、 3 动态评论 、 4 动态二级评论、5 作品评论、6 作品二级评论
     */
    likeComment(args, targetType) {
      const targetId = args[0];
      const isLike = args[1];
      like({
        urlParam: targetId,
        queryData: { actionType: "1", targetType: targetType },
      })
        .then((res) => {})
        .catch((err) => {
          this.$refs.toast.show({
            text: err,
            type: "error",
            direction: "top",
          });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  padding: 4vw;
}
.trend-box {
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
}
.location-area {
  width: 100%;
  padding: 0 10rpx;
  overflow: hidden;
  .location-box {
    float: right;
    border-radius: 30rpx;
    padding: 8rpx 16rpx;
    background-color: $uni-color-primary;
    color: white;
  }
}
.bottom-button-area-placeholder {
  color: $uni-text-color-placeholder;
  height: 170rpx;
  width: 100%;
  text-align: center;
  .fa {
    margin-right: 15rpx;
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
</style>