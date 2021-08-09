<template>
  <text
    class="fa fa-heart-o"
    :style="{ fontSize: `${size}rpx` }"
    @click="clickLike"
  ></text>
</template>

<script>
export default {
  name: "likeButton",
  props: {
    size: {
      type: Number,
      default: 32,
    },
  },
  data() {
    return {};
  },
  methods: {
    clickLike() {
      this.$emit("clickLike");
    },
  },
};
</script>

<style lang="scss" scoped>
.fa {
  color: $uni-text-color-placeholder;
}
</style>