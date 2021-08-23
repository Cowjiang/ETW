<template>
  <view>
    <button @click="toPage('/pagesByStore/store/subpages/storeApplyPage')">
      店铺申请
    </button>
    <button @click="toPage('/pagesByStore/store/subpages/storeInfoUpdatePage')">
      店铺信息编辑
    </button>
    <button @click="toPage('/pagesByStore/dish/dishPostPage')">添加菜品</button>
    <view class="bottom">
      <view>我的店铺id：{{ storeAllInfo.id }} </view>
      <view>我的店铺名：{{ storeAllInfo.name }} </view>
      <view
        >我的店铺下次营业时间：{{
          storeAllInfo.nextOpeningTime | dateFilter("yy-mm-dd hh:mm")
        }}
      </view>
      <view
        >我的店铺下次外卖营业时间：{{
          storeAllInfo.nextOpeningTimeTakeOut | dateFilter("yy-mm-dd hh:mm")
        }}
      </view>
    </view>
  </view>
</template>

<script>
import { getMyStoreInfo } from "@/common/js/api/models.js";
import Vue from "vue";
export default {
  data() {
    return {
      testData: { test: "testdata" },
      // storeInfoForm: {},
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
        //上面是可编辑的表单区域
        id: "",
        likeNumber: "",
        browseNumber: "",
        score: "",
        sales: "",
        userId: "",
      },
    };
  },
  onLoad() {
    getMyStoreInfo().then((res) => {
      if (res.success) {
        for (const key in res.data) {
          if (Object.hasOwnProperty.call(this.storeAllInfo, key)) {
            this.storeAllInfo[key] = res.data[key];
          }
        }
        let f = Vue.filter("dateFilter");
        console.log(f(this.storeAllInfo.nextOpeningTime, "yy-mm-dd hh:mm"));
      }
    });
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
          res.eventChannel.emit("acceptDataFromOpenerPage", this.storeAllInfo);
        },
      });
    },
  },
};
</script>

<style>
.bottom {
  margin-top: 240rpx;
}
</style>