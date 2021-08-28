<template>
  <view>
    <button @click="toPage('/pagesByStore/store/subpages/MyStorePage')">
      我的店铺
    </button>
  </view>
</template>

<script>
import { getMyStoreInfo, getDishType } from "@/common/js/api/models.js";
export default {
  data() {
    return {
      testData: { test: "testdata" },
      storeMainInfo: {
        id: "",
        likeNumber: "",
        browseNumber: "",
        score: "",
        sales: "",
        userId: "",
      },
      storeAllInfo: {
        characteristic: "",
        name: "",
        nextOpeningTime: "",
        nextOpeningTimeTakeOut: "",
        perCost: "",
        addressDetails: "",
        phone: "",
        weChatAccount: "",
        areaCode: "",
        longitude: "",
        latitude: "",
      },
      dishTypeInfo: [],
    };
  },
  onLoad() {
    // this.getAllData();
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
          res.eventChannel.emit(
            "acceptDataFromOpenerPage",
            this.storeMainInfo,
            this.storeAllInfo
          );
        },
      });
    },
    async getAllData() {
      try {
        await getMyStoreInfo().then((res) => {
          if (res.success) {
            for (const key in res.data) {
              if (Object.hasOwnProperty.call(this.storeAllInfo, key)) {
                this.storeAllInfo[key] = res.data[key];
              } else {
                this.storeMainInfo[key] = res.data[key];
              }
            }
          }
        });
        await getDishType({ urlParam: this.storeMainInfo.id }).then((res) => {
          if (res.success) {
            console.log(res.data);
          }
        });
      } catch (error) {}
    },
  },
};
</script>

<style lang="scss" scoped>
.bottom {
  margin-top: 240rpx;
}

</style>