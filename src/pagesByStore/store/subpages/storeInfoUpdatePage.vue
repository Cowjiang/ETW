<template>
  <view class="contanier">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
    <u-form :model="storeInfoForm" ref="uForm">
      <!-- <u-form-item label-position="top" label="店铺照">
        <uploadGroup
          ref="storeInfo"
          :maxImageCount="6"
          uploadImageDir="sotre/store-info
          uploadId="storeInfo"
          @onImageUploaded="submitForm(arguments)"
        ></uploadGroup>
      </u-form-item> -->
      <u-form-item label-position="top" label="店铺名称">
        <u-input v-model="storeInfoForm.name" maxlength="15" />
      </u-form-item>
      <u-form-item label-position="top" label="店铺特色描述">
        <u-input v-model="storeInfoForm.characteristic" maxlength="30" />
      </u-form-item>
      <u-form-item label-position="top" label="人均消费（单位：元）">
        <u-input v-model="storeInfoForm.perCost" maxlength="4" />
      </u-form-item>
      <u-form-item label-position="top" label="下次营业时间">
        <u-input
          v-model="nextOpeningTimeInputValue"
          placeholder="请选择时间"
          type="select"
          @click="isShowPickerNextOpen = true"
        />
        <u-picker
          v-model="isShowPickerNextOpen"
          mode="time"
          safe-area-inset-bottom="true"
          start-year="2021"
          :confirm-color="primaryColor"
          :params="pickerTimeParams"
          @confirm="confirmNextOpenTime()"
        ></u-picker>
      </u-form-item>
      <u-form-item label-position="top" label="下次外卖营业时间">
        <u-input
          v-model="nextOpeningTimeTakeOutInputValue"
          placeholder="请选择时间"
          type="select"
          @click="isShowPickerTakeOut = true"
        />
        <u-picker
          v-model="isShowPickerTakeOut"
          mode="time"
          start-year="2021"
          safe-area-inset-bottom="true"
          :confirm-color="primaryColor"
          :params="pickerTimeParams"
          @confirm="confirmTakeOutTime()"
        ></u-picker>
      </u-form-item>
      <u-form-item label-position="top" label="定位">
        <u-input
          v-model="locationValue"
          placeholder="请选择定位信息"
          :disabled="true"
        />
        <template #right>
          <view class="location-button" @click="toMapPage"> 获取定位 </view>
        </template>
      </u-form-item>
      <u-form-item label-position="top" label="详细地址">
        <u-input v-model="storeInfoForm.addressDetails" maxlength="24" />
      </u-form-item>
      <u-form-item label-position="top" label="手机">
        <u-input v-model="storeInfoForm.phone" type="number" maxlength="11" />
      </u-form-item>
      <u-form-item label-position="top" label="微信">
        <u-input v-model="storeInfoForm.weChatAccount" maxlength="20" />
      </u-form-item>
    </u-form>
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
import { putStoreInfo } from "@/common/js/api/models.js";
import Vue from "vue";
export default {
  data() {
    return {
      storeInfoForm: {
        name: "", //店铺名称
        characteristic: "", //店铺特色描述
        nextOpeningTime: "", //下次营业时间 ,用于店铺放假
        nextOpeningTimeTakeOut: "", //下一次外卖营业时间
        perCost: "", //人均消费
        areaCode: "", //地区编码
        addressDetails: "", //详细地址
        phone: "", //手机联系方式
        weChatAccount: "", //微信联系方式
        longitude: "", //经度
        latitude: "", //纬度
      },
      storeMainForm: {
        id: "",
        likeNumber: "",
        browseNumber: "",
        score: "",
        sales: "",
        userId: "",
      },
      nextOpeningTimeInputValue: "", //下次外卖营业时间输入框的的值
      nextOpeningTimeTakeOutInputValue: "", //下次营业时间输入框的的值
      areaInputValue: "", //地区输入框的值，
      locationValue: "", //定位输入框的值
      isShowPickerNextOpen: false, //是否显示下次营业时间选择器
      isShowPickerTakeOut: false, //是否显示下次外卖营业时间选择器
      isShowPickerArea: false, //是否显示地区选择器
      pickerTimeParams: {
        year: true,
        month: true,
        day: true,
        hour: true,
        minute: true,
        timestamp: true,
      },
      isShowLoading: false, //提交的加载
      primaryColor: "#f4756b",
    };
  },
  onLoad() {
    this.$refs.navigationBar.setNavigation({
      backgroundColor: "white",
      titleText: "编辑店铺信息",
    });
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("acceptDataFromOpenerPage", (storeAllInfo) => {
      for (const key in storeAllInfo) {
        if (Object.hasOwnProperty.call(this.storeInfoForm, key)) {
          this.storeInfoForm[key] = storeAllInfo[key];
        } else {
          this.storeMainForm[key] = storeAllInfo[key];
        }
      }
      let f = Vue.filter("dateFilter");
      this.nextOpeningTimeInputValue = f(
        this.storeInfoForm.nextOpeningTime,
        "yy-mm-dd hh:mm"
      );
      this.nextOpeningTimeTakeOutInputValue = f(
        this.storeInfoForm.nextOpeningTimeTakeOut,
        "yy-mm-dd hh:mm"
      );
    });
  },
  methods: {
    /**
     * @description: 下次营业时间的回调
     * @param {*} e 选择的参数
     */
    confirmNextOpenTime(e) {
      console.log(e);
      this.storeInfoForm.nextOpeningTime = e.timestamp + "000";
      this.nextOpeningTimeInputValue = `${e.year}-${e.month}-${e.day} ${e.hour}:${e.minute}`;
    },
    /**
     * @description: 下次外卖时间的回调
     * @param {*} e 选择的参数
     */
    confirmTakeOutTime(e) {
      console.log(e);
      this.storeInfoForm.nextOpeningTimeTakeOut = e.timestamp + "000";
      this.nextOpeningTimeTakeOutInputValue = `${e.year}-${e.month}-${e.day} ${e.hour}:${e.minute}`;
    },
    /**
     * @description: 地区选择器的回调
     * @param {*} e 选择的参数
     */
    // confirmArea(e) {
    //   console.log(e);
    //   this.areaInputValue = `${e.province.label}-${
    //     e.city.label === "市辖区" ? "" : e.city.label + "-"
    //   }${e.area.label}`;
    // },
    /**
     * @description: 点击定位按钮
     */
    toMapPage() {
      uni.navigateTo({
        url: "/pages/amap/amap",
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          acceptDataFromOpenedPage: (data) => {
            if (data) {
              this.locationValue = data.locationName;
              this.storeInfoForm.areaCode = data.adcode;
              this.storeInfoForm.longitude = data.longitude;
              this.storeInfoForm.latitude = data.latitude;
              this.storeInfoForm.addressDetails = data.locationDetail;
              if (this.storeInfoForm.phone === "") {
                this.storeInfoForm.phone = data.locationPhone;
              }
            }
          },
        },
      });
    },
    /**
     * @description: 点击提交按钮
     */
    clickSubmitButton() {
      this.utils.debounce(() => {
        if (!this.utils.isObjectSomeKeyEmpty(this.storeInfoForm)) {
          putStoreInfo({
            urlParam: this.storeMainForm.id,
            queryData: this.storeInfoForm,
          })
            .then((res) => {
              if (res.success) {
                this.$refs.toast.show({
                  text: "提交成功,请等待审核",
                  type: "success",
                });
                uni.navigateBack();
              }
            })
            .catch((err) => {
              console.log("err", err);
            });
        } else {
          this.$refs.toast.show({
            text: "有信息还未填写",
            type: "warning",
          });
        }
      });
    },
    /**
     * @description: 请求接口
     * @param {Object} imageList 每个上传组件上传的图片
     * @param {String} uploadId 每个上传组件的标识
     */
    submitForm(args) {},
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
.location-button {
  padding: 0 14rpx;
  border-radius: 14rpx;
  color: white;
  text-align: center;
  background-color: $uni-color-primary;
}
</style>