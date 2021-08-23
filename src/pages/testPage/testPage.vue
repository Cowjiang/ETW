<template>
  <view>
    <button @click="toPage('/pagesByStore/store/subpages/storeApplyPage')">
      店铺申请
    </button>
    <button @click="toPage('/pagesByStore/store/subpages/storeInfoUpdatePage')">
      店铺信息编辑
    </button>
    <button @click="toPage('/pagesByStore/dish/dishPostPage')">添加菜品</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      testData: { test: "testdata" },
    };
  },
  methods: {
    toPage(url) {
      uni.navigateTo({
        url: url,
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          acceptDataFromOpenedPage: function (data) {},
        },
        success: (res) => {
          // 通过eventChannel向被打开页面传送数据
          // res.eventChannel.emit("acceptDataFromOpenerPage", this.testData);
        },
      });
    },
  },
};
</script>

<style>
</style>