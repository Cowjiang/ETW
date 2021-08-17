<template>
  <view
    class="contanier"
    :style="{
      flexDirection: `${direction}`,
      fontSize: `${size}rpx`,
      lineHeight: `${size}rpx`,
    }"
  >
    <text :class="[`fa ${iconName} fa-fw`]" @click="clickIcon"></text>
    <text
      v-if="showedNumber"
      class="number"
      :style="{
        fontSize: `${size - 8}rpx`,
      }"
    >
      {{ showedNumber }}
    </text>
  </view>
</template>

<script>
export default {
  name: "iconButtonBox",
  props: {
    iconName: {
      type: String,
      default: "fa-heart-o",
    },
    direction: {
      type: String,
      default: "column",
    },
    size: {
      type: Number,
      default: 32,
    },
    showedNumber: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {};
  },
  methods: {
    clickIcon() {
      this.$emit("clickIcon");
    },
  },
};
</script>

<style lang="scss" scoped>
.contanier {
  display: flex;
  text-align: center;
  .fa {
    // margin: 0 16rpx;
    color: $uni-text-color-placeholder;
  }
  .number {
    color: #000;
  }
}
</style>