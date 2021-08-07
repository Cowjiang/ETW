<template>
  <view>
    <view class="verifyContainer" @touchend="onEnd" @tap.stop="">
      <view class="verifyTitleContainer">拖动下方滑块完成拼图</view>
      <view class="verifyImageContainer">
        <image :src="imgUrl" class="verifyImage"></image>
      </view>
      <view class="movableAreaContainer">
        <view
          class="imageGapShadow"
          :style="{ top: top + 'rpx', left: left + 'rpx' }"
        ></view>
        <movable-area :animation="true">
          <movable-view
            :x="movableViewX"
            direction="horizontal"
            @change="onMove"
          >
            <text class="fa fa-lg fa-arrow-right"></text>
            <view class="imageGap" :style="{ top: top + 'rpx' }"
              ><image
                :src="imgUrl"
                :style="{ top: -imageGapTop + 'rpx', left: -left + 'rpx' }"
              ></image
            ></view>
          </movable-view>
          <view class="slideway"></view>
        </movable-area>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "tfgg-verify",
  data() {
    return {
      imgUrl: "../../static/images/imgVerifyTest/2.jpg",
      movableViewX: 0, //初始距离
      movedX: 0, //已移动的距离
      left: "", //拼图的最终X轴距离
      top: "", //拼图的top距离
      imageGapTop: "", //拼图内容的top距离
      isShow: false,
    };
  },
  mounted() {
    this.shuaxinVerify();
  },
  methods: {
    //将px转换rpx
    px2rpx(px) {
      let rpx;
      uni.getSystemInfo({
        success: function (res) {
          rpx = px * (750 / res.windowWidth);
        },
      });
      return rpx;
    },
    //刷新验证
    shuaxinVerify() {
      this.left = 604 - 100; //生成随机X轴最终距离
      this.top = -150; //生成随机Y轴初始距离
      this.imageGapTop = 343 + 40 - 17 + this.top; //生成随机Y轴初始距离
    },
    /* 滑动中 */
    onMove(e) {
      this.movedX = e.detail.x;
    },
    /* 滑动结束 */
    onEnd() {
      this.movedX = this.px2rpx(this.movedX);
      console.log(this.movedX);
      if (Math.abs(this.movedX - this.left) <= 5) {
        uni.showToast({
          title: "验证成功",
        });
        this.$emit("result", true);
        this.hide();
      } else {
        uni.showToast({
          title: "验证失败",
        });
        this.shuaxinVerify();
        this.reset();
      }
    },
    /* 重置 */
    reset() {
      console.log("重置");
      this.movableViewX = 1;
      this.movedX = 1;
      setTimeout(() => {
        this.movableViewX = 0;
        this.movedX = 0;
      }, 300);
    },
    show() {
      this.isShow = true;
    },
    hide() {
      this.isShow = false;
    },
  },
};
</script>

<style lang="scss" scoped>
$verifyImageWidth: 604rpx;
$verifyimageheight: 343rpx;
$imageGapWH: 100rpx;
$movableAreaContainerHeight: 55rpx;
.verifyContainer {
  padding: 20rpx;
  width: $verifyImageWidth + 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 0 5rpx #000;
}
.verifyTitleContainer {
  font-size: 36rpx;
  font-weight: 400;
  margin-bottom: 25rpx;
}
.verifyImageContainer {
  position: relative;
}
.verifyImage {
  width: $verifyImageWidth;
  height: $verifyimageheight;
  display: block;
}
.movableAreaContainer {
  position: relative;
  height: $movableAreaContainerHeight;
  width: $verifyImageWidth;
  margin: 25rpx auto;
}

.movableAreaContainer movable-area {
  height: $movableAreaContainerHeight;
  width: 100%;
  display: flex;
  align-items: center;
}
.movableAreaContainer movable-area movable-view {
  width: $imageGapWH;
  height: $movableAreaContainerHeight;
  border-radius: 40rpx;
  background-color: $uni-color-primary;
  color: #fff;
  box-shadow: 0px 0px 10px 1px rgb(252, 175, 170);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 101;
}
.imageGapShadow {
  position: absolute;
  width: $imageGapWH;
  height: $imageGapWH;
  background-color: rgba(0, 0, 0, 0.5);
}
.imageGap {
  position: absolute;
  left: 0;
  width: $imageGapWH;
  height: $imageGapWH;
  box-shadow: 0 0 5rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 101;
}
.imageGap image {
  max-width: none;
  position: absolute;
  top: 0;
  left: 0;
  width: $verifyImageWidth;
  height: $verifyimageheight;
}
.slideway {
  position: absolute;
  width: 100%;
  height: 30rpx;
  background: rgb(224, 224, 224);
  border-radius: 60rpx;
  right: 0;
  z-index: 100;
}
</style>