<template>
  <!-- 评论区容器 -->
  <view class="comment-list-box">
    <view
      class="comment-item"
      v-for="(item, index) in commentList"
      :key="index"
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
            @tap.stop="clickFirstComment(item.id, item.userInfo.username)"
          >
            <view class="comment-username">
              {{ item.userInfo.username }}
            </view>
            <view class="comment-text">{{ item.content }}</view>
            <view class="comment-date">{{
              item.createdTime | dateFilter("yy-mm-dd hh:mm")
            }}</view>
          </view>
          <view class="like-box">
            <likeButton @clickLike="likeComment(item.id)"></likeButton>
          </view>
        </view>
        <!-- 二级评论容器 -->
        <view class="second-comment-box" v-if="item.secondComment">
          <view class="avatar-box">
            <u-avatar :size="48"></u-avatar>
          </view>
          <view class="second-content-box">
            <view class="comment-username">
              {{ item.secondComment.scUserInfo.username }}
            </view>
            <view class="comment-text">
              {{ item.secondComment.content }}
            </view>
          </view>
          <view class="like-box">
            <likeButton
              @clickLike="likeComment(item.secondComment.id)"
            ></likeButton>
          </view>
        </view>
        <view
          class="more-comment"
          @tap.stop="clickSecondComment(item)"
          v-if="item.commentNumber > 1"
        >
          查看{{ item.commentNumber }}条回复
          <text class="fa fa-angle-right"></text>
        </view>
      </view>
    </view>
    <view class="bottom-button-area-placeholder"></view>
  </view>
</template>

<script>
export default {
  name: "commentList",
  props: {
    commentList: {
      type: Array,
    },
  },
  methods: {
    /**
     * @description: 点击主评论
     * @param {Number} commentId 主评论的id
     * @param {String} toUser 主评论用户
     */
    clickFirstComment(commentId, toUser) {
      this.$emit("clickFirstComment", commentId, toUser);
    },
    /**
     * @description: 点击二级评论
     * @param {Number} commentId 二级评论的id
     */
    clickSecondComment(commentId) {
      this.$emit("clickSecondComment", commentId);
    },
  },
};
</script>

<style lang="scss" scoped>
.comment-list-box {
  background-color: white;
  padding: 0 4vw;
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
          }
          .comment-text {
            margin-top: 10rpx;

            font-size: 32rpx;
          }
          .comment-date {
            margin-top: 10rpx;
            font-size: 24rpx;
            font-weight: 300;
            color: $uni-text-color-placeholder;
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
        display: inline-block;
        padding: 8rpx 20rpx;
        font-size: 28rpx;
        color: $uni-color-blue;
        margin-bottom: 15rpx;
        border-radius: 30rpx;
        background-color: $uni-color-blue-light;
        .fa {
          margin-left: 10rpx;
        }
      }
    }
  }
  .bottom-button-area-placeholder {
    height: 150rpx;
    width: 100%;
  }
}
</style>