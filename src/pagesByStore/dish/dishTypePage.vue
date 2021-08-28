<template>
  <view class="contanier">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>

    <button
      class="submit-button"
      :disabled="isShowLoading"
      @click="clickSubmitButton"
      :class="isShowLoading ? 'disabled-button' : ''"
    >
      <i v-show="isShowLoading" class="fa fa-spinner fa-spin fa-fw"></i>
      提交
    </button>
  </view>
</template>

<script>
export default {
  data() {
    return {

    };
  },
  onLoad() {
    this.$refs.navigationBar.setNavigation({
      backgroundColor: "white",
      titleText: "添加菜品",
    });
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("acceptDataFromOpenerPage", (storeAllInfo) => {
      for (const key in storeAllInfo) {
        if (Object.hasOwnProperty.call(this.dishInfoForm, key)) {
          this.dishInfoForm[key] = storeAllInfo[key];
        } else {
          this.storeMainInfo[key] = storeAllInfo[key];
        }
      }
    });
  },
  methods: {

  },
};
</script>

<style lang="scss" scoped>
.contanier {
  padding: 0 32rpx;
}
.disabled-button {
  color: white !important;
  background-color: $uni-color-primary !important;
  opacity: 0.5 !important;
}
.submit-button {
  width: 400rpx;
  height: 80rpx;
  line-height: 80rpx;
  margin: 36rpx auto;
  text-align: center;
  font-size: 36rpx;
  color: white;
  background-color: $uni-color-primary;
  border-radius: 14rpx;
}
</style>