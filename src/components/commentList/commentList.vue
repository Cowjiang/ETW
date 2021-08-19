<template>
  <!-- 评论区容器 -->
  <view class="comment-list-box">
    <view
      class="comment-item"
      v-for="(item, index) in commentList"
      :key="index"
    >
      <template v-if="!item.isDeleted">
        <!-- 评论者头像 -->
        <view class="left-avatar-box">
          <u-avatar
            :src="
              commentType === 'secondComment'
                ? item.scUserInfo.avgPath
                : item.userInfo.avgPath
            "
            :size="80"
          ></u-avatar>
        </view>
        <!-- 评论内容 -->
        <view class="right-content-box">
          <view class="main-content-box">
            <view
              class="main-info-box"
              @tap.stop="
                clickFirstComment(
                  commentType === 'secondComment'
                    ? item.scUserInfo.id
                    : item.id,
                  commentType === 'secondComment'
                    ? item.scUserInfo.username
                    : item.userInfo.username,
                  item.secondComment !== undefined ? true : false,
                  index
                )
              "
            >
              <view class="comment-username">
                {{
                  commentType === "secondComment"
                    ? item.scUserInfo.username
                    : item.userInfo.username
                }}
                <text class="reply-text" v-if="item.toUserInfo">
                  <text class="fa fa-caret-right"></text>
                  {{ `${item.toUserInfo.username}` }}
                </text>
              </view>
              <view class="comment-text">{{ item.content }}</view>
              <view class="comment-date">{{
                item.createdTime | dateFilter("yy-mm-dd hh:mm")
              }}</view>
            </view>
            <view class="like-box">
              <iconButtonBox
                :showedNumber="item.likeNumber"
                @clickIcon="clickFirstLike(item.id)"
              ></iconButtonBox>
            </view>
          </view>
          <!-- 二级评论容器 -->
          <view class="second-comment-box" v-if="item.secondComment">
            <view class="avatar-box">
              <u-avatar
                :src="item.secondComment.scUserInfo.avgPath"
                :size="60"
              ></u-avatar>
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
              <iconButtonBox
                :showedNumber="item.secondComment.likeNumber"
                @clickIcon="clickSecondLike(item.secondComment.id)"
              ></iconButtonBox>
            </view>
          </view>
          <view
            class="more-comment"
            @tap.stop="clickSecondComment(item)"
            v-if="item.commentNumber >= 1 || item.secondComment"
          >
            查看{{ item.commentNumber >= 1 ? item.commentNumber : "1" }}条回复
            <text class="fa fa-angle-right"></text>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script>
export default {
  name: "commentList",
  props: {
    commentList: {
      type: Array,
    },
    commentType: {
      type: String,
      default: "trend",
    },
  },
  methods: {
    /**
     * @description: 点击主评论
     * @param {Number} commentId 主评论的id
     * @param {String} toUser 主评论用户
     * @param {Boolean} isHaveSecondComment  是否已经有二级评论
     * @param {Boolean} commentListIndex  一级评论下标
     */
    clickFirstComment(...args) {
      this.$emit("clickFirstComment", args);
    },
    /**
     * @description: 点击二级评论
     * @param {Number} commentId 二级评论的id
     */
    clickSecondComment(commentId) {
      this.$emit("clickSecondComment", commentId);
    },
    /**
     * @description: 一级评论点赞
     * @param {Number} targetId 目标id
     */
    clickFirstLike(targetId, isLike) {
      this.$emit("clickFirstLike", targetId, isLike);
    },
    /**
     * @description: 二级评论点赞
     * @param {Number} targetId 目标id
     */
    clickSecondLike(targetId, isLike) {
      this.$emit("clickSecondLike", targetId, isLike);
    },
  },
};
</script>

<style lang="scss" scoped>
.comment-list-box {
  background-color: white;
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
          font-size: 32rpx;
          width: 100%;
          .comment-username {
            font-weight: 600;
          }
          .reply-text {
            margin-left: 15rpx;
            color: $uni-color-blue;
            font-weight: 400;
            .fa {
              margin-right: 15rpx;
            }
          }
          .comment-text {
            margin-top: 10rpx;
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
          width: 60rpx;
        }
        .second-content-box {
          font-size: 30rpx;
          margin-left: 10rpx;
          width: 100%;
          .comment-username {
            font-weight: 600;
          }
          .comment-text {
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
}
</style>