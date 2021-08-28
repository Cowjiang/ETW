<template>
  <view class="container">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
    <!-- 动态容器 -->
    <view v-if="trendData" class="trend-box">
      <!-- 用户信息容器 -->
      <view class="author-box">
        <!-- 头像 -->
        <u-avatar :src="trendData.userInfo.avgPath" size="80"></u-avatar>
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
        v-if="trendData.dynamicImages.length !== 0"
        :imageDataList="trendData.dynamicImages"
      ></trendsImageGroup>
      <view v-if="trendData.areaInfo" class="location-area">
        <view class="location-box">
          <text class="fa fa-map-marker fa-fw"></text>
          {{ trendData.areaInfo.areaName }}
        </view>
      </view>
    </view>
    <!-- 分隔栏 -->
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
    <view class="bottom-button-area-placeholder">
      <i
        v-show="commentList.length >= pageSize && !isEnd"
        class="fa fa-spinner fa-pulse"
      ></i>
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
      pageSize: 5, //每页多少条
      totalNumber: 0, //总共几条数据
      totalPages: 0, //总共多少页
      isEnd: false, //数据是否已经加载完
      upadtingCommentIndex: null, //需要更新的下标
      userInfo: {}, //本机用户信息
      isAddStaticComment: false, //是否静态添加过评论
    };
  },
  onLoad() {
    uni.getStorage({
      key: "userInfo",
      success: (res) => {
        this.userInfo = res.data;
      },
    });
    this.$refs.navigationBar.setNavigation({
      titleText: "动态详细",
      backgroundColor: "white",
    });
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("acceptDataFromOpenerPage", (data) => {
      this.trendData = data;
      this.loadTrendComment(true);
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
      const { currentPage, totalPages } = this;
      if (currentPage < totalPages) {
        this.isEnd = false;
        return "正在加载";
      } else if (currentPage >= totalPages) {
        this.isEnd = true;
        if (totalPages === 0) {
          return "";
        } else {
          return "—没有更多内容了—";
        }
      }
    },
  },
  methods: {
    /**
     * @description: 给一级评论回复二级评论
     * @param {Number} commentId  一级评论的id
     * @param {String} toUser  一级评论的用户
     * @param {Boolean} isHaveSecondComment  是否已经有二级评论
     * @param {Boolean} commentListIndex  一级评论下标
     */
    commentByFirstComment(args) {
      let [[commentId, toUser, isHaveSecondComment, commentListIndex]] = args;
      if (!isHaveSecondComment) {
        this.upadtingCommentIndex = commentListIndex;
      } else {
        this.upadtingCommentIndex = null;
      }
      this.commentPostType = 1;
      this.commentPostId = commentId;
      this.$refs.commentTextarea.commentTextareaPlaceholder = `回复@${toUser}`;
      this.$refs.commentTextarea.isShowTextarea(true);
    },
    /**
     * @description: 评论当前动态
     */
    commentByTrend() {
      this.upadtingCommentIndex = null;
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
                    let newCommentData = res.data;
                    let userInfo = this.userInfo;
                    newCommentData.userInfo = {
                      userId: userInfo.userId,
                      username: userInfo.username,
                      avgPath: userInfo.avgPath,
                    };
                    this.commentList.unshift(newCommentData);
                    this.isAddStaticComment = true;
                    this.$refs.commentTextarea.commentPostText = "";
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
                    if (this.upadtingCommentIndex !== null) {
                      let newSecondCommenttData = res.data;
                      let userInfo = this.userInfo;
                      newSecondCommenttData.scUserInfo = {
                        userId: userInfo.userId,
                        username: userInfo.username,
                        avgPath: userInfo.avgPath,
                      };
                      this.$set(
                        this.commentList[this.upadtingCommentIndex],
                        "secondComment",
                        newSecondCommenttData
                      );
                    }
                    this.$refs.commentTextarea.commentPostText = "";
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
                  throw err;
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
        this.currentPage = 1;
        getTrendComment({
          urlParam: this.trendData.id,
          queryData: {
            pageNumber: this.currentPage,
            pageSize: this.pageSize * this.currentPage,
          },
        })
          .then((res) => {
            if (res.success) {
              const data = res.data;
              // this.totalNumber = data.total; //获取总页数
              this.totalPages = data.pages;
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
        // 请求下一页内容
        console.log("加载");
        this.currentPage += 1;
        let currentPage, pageSize;
        if (this.isAddStaticComment) {
          currentPage = 1;
          pageSize = this.currentPage * this.pageSize;
        } else {
          currentPage = this.currentPage;
          pageSize = this.pageSize;
        }
        getTrendComment({
          urlParam: this.trendData.id,
          queryData: {
            pageNumber: currentPage,
            pageSize: pageSize,
          },
        })
          .then((res) => {
            console.log(
              "当前页",
              this.currentPage,
              "请求数",
              pageSize,
              "总页数",
              this.totalPages
            );
            if (res.success) {
              const data = res.data;
              if (this.isAddStaticComment) {
                this.isAddStaticComment = false;
                this.commentList = data.records;
              } else {
                this.totalPages = data.pages;
                this.commentList = this.commentList.concat(data.records);
              }
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
          console.log(res);
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit("acceptDataFromOpenerPage", mainCommentData);
        },
        fail: function (err) {
          console.log(err);
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
  padding: 32rpx;
}
.trend-box {
  padding-bottom: 32rpx;
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
    margin-top: 20rpx;
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