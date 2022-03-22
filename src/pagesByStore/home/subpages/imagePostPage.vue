<template>
  <view class="container">
    <!-- 头图上传 -->
    <view class="main-image-box">
      <uploadGroup :uploadUrl="uploadMianImageUrl"></uploadGroup>
    </view>
    <!-- 富文本编辑器 -->
    <richTextEditor ref="richEditor"></richTextEditor>
    <button @click="submit">获取表单内容</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      mianImgaeList: [],
      uploadMianImageUrl: "",
    };
  },
  methods: {
    submit() {
      this.$refs.richEditor.getEditorContent();
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  background-color: white;
  .main-image-section {
    padding: 24rpx 30rpx 8rpx 30rpx;
    font-size: 36rpx;
  }
  .main-image-box {
    padding: 24rpx 30rpx 24rpx 30rpx;
    border-bottom: 1rpx solid $uni-color-grey;
    display: flex;
  }
}
.slot-btn {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: $uni-color-grey;
  border-radius: 20rpx;
  margin: 8rpx;
}
.slot-btn__hover {
  background-color: rgb(235, 236, 238);
}
.upload-btn {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: $uni-color-grey;
  margin: 8rpx;
}
</style>