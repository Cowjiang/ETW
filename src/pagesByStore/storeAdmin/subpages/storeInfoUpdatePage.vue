<template>
  <view class="contanier">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
    <u-form :model="storeInfoForm" ref="uForm" :label-style="{ 'font-weight': 'bold' }">
      <u-form-item label-position="top" label="店铺照">
        <uploadGroup
          ref="storeInfoImageUpload"
          :maxImageCount="1"
          :file-list="fileList"
          uploadImageDir="sotre/store-info"
          uploadId="storeInfoImageUpload"
          @onImageUploaded="allImageUploaded(arguments)"
          @onRemoveImage="clearImage(arguments)"
          @onChooseComplete="isImageChoosen = true"
        ></uploadGroup>
      </u-form-item>
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
        <u-input v-model="locationValue" placeholder="请选择定位信息" :disabled="true" />
        <template #right>
          <view class="location-button" @click="toMapPage">获取定位</view>
        </template>
      </u-form-item>
      <u-form-item label-position="top" label="详细地址">
        <u-input v-model="storeInfoForm.addressDetails" maxlength="40" />
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
    import { putMyStoreInfo, postMyStoreInfoImage } from "@/common/js/api/models.js";
    import Vue from "vue";
    export default {
        data() {
            return {
                isShowPickerNextOpen: false, //是否显示下次营业时间选择器
                isShowPickerTakeOut: false, //是否显示下次外卖营业时间选择器
                isShowLoading: false, //提交的加载
                isImageChoosen: false, //是否选择了照片
                //店铺要上传的的表单信息
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
                    latitude: "", //纬度,
                    imgUrl: "",
                },
                //店铺的主要信息
                storeMainInfo: {
                    id: "",
                    likeNumber: "",
                    browseNumber: "",
                    score: "",
                    sales: "",
                    userId: "",
                },
                fileList: [], //上传组件的图片
                nextOpeningTimeInputValue: "", //下次外卖营业时间输入框的的值
                nextOpeningTimeTakeOutInputValue: "", //下次营业时间输入框的的值
                areaInputValue: "", //地区输入框的值，
                locationValue: "", //定位输入框的值
                pickerTimeParams: {
                    //时间选择器的配置对象
                    year: true,
                    month: true,
                    day: true,
                    hour: true,
                    minute: true,
                    timestamp: true,
                },
                primaryColor: "#f4756b",
            };
        },
        onLoad() {
            this.$refs.navigationBar.setNavigation({
                backgroundColor: "white",
                titleText: "编辑店铺信息",
            });
            const eventChannel = this.getOpenerEventChannel();
            eventChannel.on("acceptDataFromOpenerPage", (storeMainInfo, storeAllInfo) => {
                this.storeMainInfo = storeMainInfo;
                Object.assign(this.storeInfoForm, storeAllInfo);
                if (this.storeMainInfo.imgUrl) {
                    this.storeInfoForm.imgUrl = this.storeMainInfo.imgUrl;
                    this.fileList.push({ url: this.storeMainInfo.imgUrl });
                    this.isImageChoosen = true;
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
             * @description: 点击定位按钮
             */
            toMapPage() {
                uni.navigateTo({
                    url: "/pages/amap/amap",
                    events: {
                        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                        acceptDataFromOpenedPage: (data) => {
                            console.log(data.resultDetails);
                            const resultDetails = data.resultDetails;
                            if (resultDetails) {
                                this.locationValue = resultDetails.name;
                                this.storeInfoForm.areaCode = resultDetails.adcode;
                                this.storeInfoForm.longitude = resultDetails.location.longitude;
                                this.storeInfoForm.latitude = resultDetails.location.latitude;
                                this.storeInfoForm.addressDetails =
                                    (resultDetails.pname == resultDetails.cityname
                                        ? ""
                                        : resultDetails.pname) +
                                    resultDetails.cityname +
                                    resultDetails.adname +
                                    resultDetails.address;
                                if (this.storeInfoForm.phone === "") {
                                    this.storeInfoForm.phone = resultDetails.tel;
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
                    if (
                        !this.utils.isObjectAnyKeyEmpty(this.storeInfoForm, ["imgUrl"]) &&
                        this.isImageChoosen
                    ) {
                        this.$refs.storeInfoImageUpload.$refs.upload.upload();
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

            async allImageUploaded(args) {
                const uploadedImageList = args[0];
                try {
                    //这段还要吗 这是另外一个接口的
                    // await postMyStoreInfoImage({
                    //   urlParam: this.storeMainInfo.id,
                    //   queryData: {
                    //     imgUrl: uploadedImageList,
                    //   },
                    //   headerData: { "Content-type": "application/json" },
                    // });
                    //更改过图片
                    if (this.fileList.length === 0) {
                        this.storeInfoForm.imgUrl = uploadedImageList[0];
                    }
                    await putMyStoreInfo({
                        urlParam: this.storeMainInfo.id,
                        queryData: this.storeInfoForm,
                    });
                    this.$refs.toast.show({
                        text: "提交成功",
                        type: "success",
                    });
                    this.backPage();
                } catch (error) {
                    console.log(error.data.errorMsg);
                }
            },
            /**
             * @description: 清除当前店铺封面
             */
            clearImage(args) {
                this.isImageChoosen = false;
                let index = args[0];
                this.storeInfoForm.imgUrl = "";
                this.fileList.splice(index, 1);
            },
            /**
             * @description: 返回上一页
             */
            backPage() {
                const pages = getCurrentPages();
                //上一个页面
                let prePage = pages[pages.length - 2];
                //调用上一页拉取数据的方法
                prePage.$vm.getMyStoreData();
                uni.navigateBack();
            },
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