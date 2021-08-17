<template>
  <view class="contanier">
    <text class="fa fa-comments fa-fw"></text>
    <view>{{ text }}</view>
  </view>
</template>

<script>
export default {
  name: "noData",
  props: {
    text: {
      type: String,
      default: "写个评论吧",
    },
  },
};
</script>

<style lang="scss" scoped>
.contanier {
  width: 100%;
  height: 300rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 32rpx;
  color: $uni-text-color-placeholder;
  .fa{
      font-size: 42rpx;
  }
}
</style>