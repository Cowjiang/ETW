<template>
  <view class="contanier" :style="{ height: `${height}` }">
    <text :class="[`fa fa-${iconName} fa-fw`]"></text>
    <view>{{ text }}</view>
  </view>
</template>

<script>
export default {
  name: "noData",
  props: {
    height: {
      type: Number,
      default: 300,
    },
    text: {
      type: String,
      default: "写个评论吧",
    },
    iconName: {
      type: String,
      default: "comments",
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
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  color: $uni-text-color-placeholder;
  .fa {
    font-size: 42rpx;
  }
}
</style>