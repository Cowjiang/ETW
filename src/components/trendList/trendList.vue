<template>
  <view class="container">
    <!-- 动态容器 -->
    <view v-for="(item, index) in trendList" :key="index" class="trend-box">
      <!-- 用户信息容器 -->
      <view class="author-box">
        <!-- 头像 -->
        <u-avatar size="80"></u-avatar>
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
        <u-read-more
          font-size="36rpx"
          text-indent="0"
          color="#808080"
          close-text="展开"
          :toggle="true"
        >
          {{ item.content }}
        </u-read-more>
      </view>
      <!-- 动态图片组 -->
      <trendsImageGroup :imageDataList="item.dynamicImages"></trendsImageGroup>
      <!-- 地址栏信息 -->
      <view v-if="item.areaInfo" class="location-area">
        <view class="location-box">
          <text class="fa fa-map-marker fa-fw"></text>
          {{ item.areaInfo.areaName }}
        </view>
      </view>
      <!-- 动态底部按钮 -->
      <view class="bottom-button-area">
        <view class="button-box">
          <iconButtonBox
            @clickIcon="likeTrend(item.id)"
            :showedNumber="item.likeNumber"
            direction="row"
            size="40"
          >
          </iconButtonBox>
        </view>
        <view class="button-box">
          <iconButtonBox iconName="fa-star-o" direction="row" size="40">
          </iconButtonBox>
        </view>
        <view class="button-right-box">
          <iconButtonBox
            @clickIcon="toDetailPage(item)"
            iconName="fa-commenting-o"
            :showedNumber="item.commentNumber"
            direction="row"
            size="40"
          >
          </iconButtonBox>
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
    padding: 0 20rpx;
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
.bottom-button-area {
  margin-top: 20rpx;
  padding: 0 10rpx;
  overflow: hidden;
  width: 100%;
  .button-box {
    float: left;
    margin-right: 46rpx;
  }
  .button-right-box {
    float: right;
  }
}
</style>
