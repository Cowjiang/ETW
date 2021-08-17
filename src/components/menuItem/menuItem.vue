<template>
  <!-- 不带标签item -->
  <view class="item-box" @click="clickItem">
    <view class="item-content">
      <!-- 左边标题内容 -->
      <view class="item-left">
        <text v-if="iconName" :class="[`fa fa-${iconName} fa-fw`]"></text>
        {{ title }}
      </view>
      <!-- 右边内容 -->
      <view class="item-right">
        <slot name="rightContent"></slot>
        <text v-if="isArrow" class="fa fa-angle-right fa-fw"></text>
      </view>
    </view>
    <!-- 换行slot -->
    <slot name="rowContent"></slot>
  </view>
</template>

<script>
export default {
  name: "menuItem",
  props: {
    title: String, //左侧标题
    iconName: String, //左侧图标名 为空则没有图标
    isArrow: {
      //是否展示右侧箭头
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {};
  },
  methods: {
    /**
     * @description: 点击菜单栏标签
     */
    clickItem() {
      this.$emit("clickItem");
    },
  },
};
</script>

<style lang="scss" scoped>
.item-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 25rpx 25rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f1f5;
  .item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    .item-left {
      font-size: 30rpx;
      text {
        text-align: center;
      }
    }
  }
}
</style>
