<template>
  <view class="container">
    <!-- 动态容器 -->
    <view v-for="(item, index) in trendList" :key="index" class="trend-box">
      <!-- 用户信息容器 -->
      <view class="author-box">
        <!-- 头像 -->
        <u-avatar></u-avatar>
        <view class="author-name-box">
          <!-- 用户名 -->
          <view class="author-name">{{ item.userInfo.username }}</view>
          <view class="author-description">{{
            item.createdTime | dateFilter("yy-mm-dd hh:mm")
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
          {{ item.content }}
        </u-read-more>
      </view>
      <!-- 动态图片组 -->
      <trendsImageGroup :imageDataList="item.dynamicImages"></trendsImageGroup>
      <view class="bottom-button-area">
        <!-- 转发 -->
        <!-- <view>
          <text class="fa fa-share-square-o fa-lg"></text>{{ item.shareNumber }}
        </view> -->
        <!-- 收藏 -->
        <view>
          <text class="fa fa-star-o fa-lg"></text>{{ item.browseNumber }}
        </view>
        <!-- 点赞 -->
        <view @click="likeTrend(item.id)">
          <text class="fa fa-heart-o fa-lg"></text>{{ item.likeNumber }}
        </view>
        <!-- 评论 -->
        <view @click="toDetailPage(item)">
          <text class="fa fa-commenting-o fa-lg"></text>{{ item.commentNumber }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { like } from "@/common/js/api/models.js";
export default {
  name: "trendList",
  props: {
    trendList: Array,
  },
  data() {
    return {};
  },
  computed: {},
  methods: {
    likeTrend(id) {
      like({
        urlParam: id,
        queryData: { actionType: 1, targetType: "2" },
      }).then(() => {});
    },
    toDetailPage(trendData) {
      uni.navigateTo({
        url: "/pages/trending/subpages/trendDetailPage",
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          acceptDataFromOpenedPage: function (data) {},
        },
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit("acceptDataFromOpenerPage", trendData);
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  margin: 5vw 0 2.5vw 2.5vw;
  width: 95vw;
  background-color: #ffffff;
  border-radius: 30rpx 30rpx 0 0;
}
.trend-box {
  padding: 6vw 4vw;
  border-bottom: 1rpx solid $uni-color-grey;
  .author-box {
    display: flex;
    justify-content: flex-start;
    height: 13vw;
    width: 87vw;
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

.bottom-button-area {
  margin-top: 30rpx;
  display: flex;
  width: 100%;
  view {
    flex: 1;
    text-align: center;
    .fa {
      margin-right: 10rpx;
    }
  }
}
</style>
