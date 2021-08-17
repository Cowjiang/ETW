<template>
  <view class="container">
    <!-- 导航栏 -->
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast" />
    <!-- 文本框 -->
    <u-field
      v-model="trendContent"
      label-width="0"
      :border-bottom="false"
      placeholder="最近有什么有意思的事情想和大家分享？"
      type="textarea"
    ></u-field>
    <!-- 图片上传 -->
    <uploadGroup ref="uploadGroup" @onImageUploaded="submitTrend"></uploadGroup>
    <!-- 菜单列表 -->
    <view class="menuList">
      <menuItem
        title="地点"
        iconName="map-marker"
        :isArrow="isArrowByMap"
        @clickItem="toMapPage"
      >
        <!-- 选中tag -->
        <u-tag
          slot="rightContent"
          v-if="isShowTag"
          :text="chosenTagName"
          bg-color="#f4756b"
          border-color="#f4756b"
          color="#f7fafd"
          shape="circle"
          :closeable="true"
          @close="closeChosenTag"
        />
      </menuItem>
    </view>
    <!-- 发布按钮 -->
    <view class="button-area">
      <button
        :disabled="isShowLoading"
        @click="clickSubmitButton"
        class="submit-button"
        :class="isShowLoading ? 'disabled-button' : ''"
      >
        <i v-show="isShowLoading" class="fa fa-spinner fa-spin"></i>
        发布动态
      </button>
    </view>
  </view>
</template>

<script>
import { postTrend } from "@/common/js/api/models.js";
export default {
  data() {
    return {
      //动态发布
      trendImageList: "",
      trendContent: "",
      isShowLoading: false,
      //菜单列表
      isArrowByMap: true,
      isShowTag: false,
      chosenTagName: "",
      locationData: null,
    };
  },
  watch: {
    isShowTag(n) {
      console.log(n);
    },
  },
  onLoad() {
    this.$refs.navigationBar.setNavigation({
      backgroundColor: "white",
      titleText: "发布动态",
    });
  },
  methods: {
    /**
     * @description: 点击发布按钮
     */
    clickSubmitButton() {
      this.utils.debounce(() => {
        if (this.trendContent.replace(/\s+/g, "") === "") {
          this.$refs.toast.show({
            text: "内容不能为空",
            type: "warning",
            direction: "top",
          });
        } else {
          this.isShowLoading = true;
          this.$refs.uploadGroup.$refs.upload.upload();
        }
      });
    },
    /**
     * @description: 提交动态请求
     */
    submitTrend() {
      let postQueryData = {
        content: this.trendContent,
        imageJson: this.trendImageList,
      };
      if (this.locationData) {
        postQueryData = {
          content: this.trendContent,
          imageJson: this.trendImageList,
          areaCode: this.locationData.adcode,
          latitude: this.locationData.latitude,
          longitude: this.locationData.longitude,
          areaName: this.locationData.locationName,
        };
      }
      postTrend({
        queryData: postQueryData,
      })
        .then((res) => {
          if (res.success) {
            this.$refs.toast.show({
              text: "动态发布成功",
              type: "success",
              direction: "top",
            });
            uni.navigateTo({
              url: "/pages/trending/trending",
            });
          } else {
            this.$refs.toast.show({
              text: "发生错误",
              type: "error",
              direction: "top",
            });
            this.isShowLoading = false;
          }
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
     * @description: 前往选择地图页面
     */
    toMapPage() {
      const _this = this;
      uni.navigateTo({
        url: "/pages/amap/amap",
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          acceptDataFromOpenedPage: function (data) {
            if (data) {
              _this.isShowTag = true;
              _this.locationData = data;
              _this.chosenTagName = data.locationName;
              _this.isArrowByMap = false;
            }
          },
        },
      });
    },
    // 取消选中标签
    closeChosenTag() {
      this.isShowTag = false;
      this.isArrowByMap = true;
      this.chosenTagName = "";
      this.locationData = null;
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background-color: #fff;
}
.container {
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
}
.menuList {
  margin-top: 24rpx;
}
.disabled-button {
  color: rgba(255, 255, 255, 0.842) !important;
  background-color: $uni-color-primary !important;
  opacity: 0.5 !important;
}
.submit-button {
  width: 100%;
  height: 90rpx;
  text-align: center;
  font-size: rpx(35);
  font-weight: bold;
  line-height: 90rpx;
  color: $uni-text-color-inverse;
  background-color: $uni-color-primary;
  border-radius: 14rpx;
  .fa {
    margin-right: 10rpx;
  }
}
.button-area {
  width: 100%;
  padding: 10vw;
  margin-top: auto;
}
</style>
