<template>
  <view class="container">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
    <!-- 一级评论容器 -->
    <view class="comment-item" v-if="firstCommentData">
      <!-- 评论者头像 -->
      <view class="left-avatar-box">
        <u-avatar
          :src="firstCommentData.userInfo.avgPath"
          :size="80"
        ></u-avatar>
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
            <iconButtonBox
              :showedNumber="firstCommentData.likeNumber"
              @clickIcon="likeComment([firstCommentData.id, true], 3)"
            ></iconButtonBox>
          </view>
        </view>
      </view>
    </view>
    <!-- 二级评论分隔栏 -->
    <view class="second-comment-title-box"
      ><text class="fa fa-window-minimize fa-rotate-90"></text> 回复
    </view>
    <!-- 二级评论列表 -->
    <commentList
      commentType="secondComment"
      :commentList="secondCommentList"
      @clickFirstLike="likeComment(arguments, 4)"
      @clickFirstComment="commentBySecondComment(arguments)"
    ></commentList>
    <!-- 没有评论的占位 -->
    <noData v-if="secondCommentList.length === 0"> </noData>
    <!-- 底部输入框占位 -->
    <view
      v-if="secondCommentList.length >= pageSize"
      class="bottom-button-area-placeholder"
    >
      <i v-show="!isEnd" class="fa fa-spinner fa-pulse"></i>
      {{ loadText }}
    </view>
    <!-- 底部输入框 -->
    <commentTextarea
      ref="commentTextarea"
      @clickBottomBox="commentByFirstComment"
      @submitComment="submitComment"
    >
    </commentTextarea>
  </view>
</template>

<script>
import {
  getTrendSecondComment,
  postTrendSecondComment,
  like,
} from "@/common/js/api/models.js";
export default {
  commentPostType: 0, //[0,1,2]分别是：在当前动态发布一级评论，在一级评论中发布二级评论，二级评论之间互相回复
  toSecondUsername: null, //被回复二级评论人的用户名
  toSecondUsername: null, //被回复二级评论人的id
  isLoading: false, //是否正在请求
  data() {
    return {
      firstCommentData: null,
      secondCommentList: null,
      currentPage: 1, //当前页
      pageSize: 5, //每页多少条
      totalNumber: 0, //总页数
      isEnd: false, //数据是否已经加载完
    };
  },
  onLoad() {
    uni.getStorage({
      key: "userInfo",
      success: (res) => {
        this.userInfo = res.data;
      },
    });
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("acceptDataFromOpenerPage", (data) => {
      this.firstCommentData = data;
      this.$refs.navigationBar.setNavigation({
        titleText: `${this.firstCommentData.userInfo.username}的回复`,
        backgroundColor: "white",
      });
      this.loadSecondComment(
        this.firstCommentData.dynamicId,
        this.firstCommentData.id,
        true
      );
    });
  },
  onReachBottom() {
    this.utils.debounce(() => {
      if (!this.isEnd) {
        this.loadSecondComment(
          this.firstCommentData.dynamicId,
          this.firstCommentData.id,
          false
        );
      }
    });
  },
  computed: {
    loadText() {
      const { currentPage, totalNumber, pageSize } = this;
      let totalPages = this.utils.getTotalPages(totalNumber, pageSize);
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
     * @description:获取二级评论
     * @param {Number} trendId  动态id
     * @param {Number} commentId  动态评论id
     * @param {Boolean} isRefresh  是否刷新
     */
    loadSecondComment(trendId, commentId, isRefresh) {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      if (isRefresh) {
        this.isEnd = false;
        this.currentPage = 1;
        getTrendSecondComment({
          urlParam: {
            trendId: trendId,
            commentId: commentId,
          },
          queryData: {
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
          },
        })
          .then((res) => {
            if (res.success) {
              this.totalNumber = res.data.total; //获取总页数
              this.secondCommentList = res.data.records;
              uni.pageScrollTo({
                scrollTop: 0,
                duration: 300,
              });
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
        this.currentPage += 1;
        getTrendSecondComment({
          urlParam: {
            trendId: trendId,
            commentId: commentId,
          },
          queryData: {
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
          },
        })
          .then((res) => {
            if (res.success) {
              this.secondCommentList = this.secondCommentList.concat(
                res.data.records
              );
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
     * @description:给当前页面下的一级评论回复二级评论
     */
    commentByFirstComment() {
      this.commentPostType = 1;
      this.$refs.commentTextarea.commentTextareaPlaceholder = `写个评论吧`;
      this.$refs.commentTextarea.isShowTextarea(true);
    },
    /**
     * @description:二级评论之间互相回复
     */
    commentBySecondComment(arg) {
      this.commentPostType = 2;
      [[this.toSecondUserId, this.toSecondUsername]] = arg;
      this.$refs.commentTextarea.commentTextareaPlaceholder = `回复@${this.toSecondUsername}`;
      this.$refs.commentTextarea.isShowTextarea(true);
    },
    /**
     * @description:提交评论
     * @param {Number} userId 二级评论的用户Id
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
            case 1:
              postTrendSecondComment({
                urlParam: {
                  trendId: this.firstCommentData.dynamicId,
                  commentId: this.firstCommentData.id,
                },
                queryData: {
                  content: this.$refs.commentTextarea.commentPostText,
                },
              })
                .then((res) => {
                  if (res.success) {
                    this.loadSecondComment(
                      this.firstCommentData.dynamicId,
                      this.firstCommentData.id,
                      true
                    );
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
            case 2:
              postTrendSecondComment({
                urlParam: {
                  trendId: this.firstCommentData.dynamicId,
                  commentId: this.firstCommentData.id,
                },
                queryData: {
                  content: this.$refs.commentTextarea.commentPostText,
                  toUserId: this.toSecondUserId,
                },
              })
                .then((res) => {
                  if (res.success) {
                    this.$refs.commentTextarea.commentPostText = "";
                    this.loadSecondComment(
                      this.firstCommentData.dynamicId,
                      this.firstCommentData.id,
                      true
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
                  throw err;
                });
            default:
              break;
          }
        }
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
          throw err;
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
            .fa {
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
.bottom-button-area-placeholder {
  color: $uni-text-color-placeholder;
  height: 220rpx;
  width: 100%;
  text-align: center;
  .fa {
    margin-right: 15rpx;
  }
}
</style>