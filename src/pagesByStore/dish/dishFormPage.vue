<template>
  <view class="contanier">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
    <u-form :model="dishInfoForm" ref="uForm">
      <u-form-item label-position="top" label="菜品封面图片">
        <uploadGroup
          ref="dishInfoImageUpload"
          :maxImageCount="1"
          uploadImageDir="sotre/dish-info"
          uploadId="dishInfoImageUpload"
          @onImageUploaded="allImageUploaded(arguments)"
        ></uploadGroup>
      </u-form-item>
      <u-form-item label-position="top" label="菜品名称">
        <u-input v-model="dishInfoForm.name" maxlength="10" />
      </u-form-item>
      <u-form-item label-position="top" label="菜品描述">
        <u-input v-model="dishInfoForm.description" maxlength="30" />
      </u-form-item>
      <u-form-item label-position="top" label="菜品概要介绍">
        <u-input v-model="dishInfoForm.summary" maxlength="30" />
      </u-form-item>
      <u-form-item label-position="top" label="原价（单位：元）">
        <u-input v-model="dishInfoForm.price" maxlength="4" />
      </u-form-item>
      <u-form-item label-position="top" label="折扣（八折为0.8,原价为1）">
        <u-input
          v-model="dishInfoForm.discount"
          placeholder="请输入折扣力度"
          :disabled="true"
          type="select"
          @click="isShowSelectDiscount = true"
        />
        <u-select
          v-model="isShowSelectDiscount"
          safe-area-inset-bottom="true"
          :list="discountlist"
          :confirm-color="primaryColor"
          @confirm="confirmDiscount()"
        ></u-select>
      </u-form-item>
      <u-form-item label-position="top" label="菜品类型">
        <u-input
          v-model="dishTypeInputValue"
          placeholder="请选择菜品类型"
          :disabled="true"
          type="select"
          @click="isShowSelectDishType = true"
        />
        <u-select
          v-model="isShowSelectDishType"
          safe-area-inset-bottom="true"
          :list="dishTypeList"
          :confirm-color="primaryColor"
          @confirm="confirmDishType()"
        ></u-select>
      </u-form-item>
      <u-form-item label-position="top" label="打包费">
        <u-input v-model="dishInfoForm.packingCharges" maxlength="2" />
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
import { postDishInfo } from "@/common/js/api/models.js";
export default {
  data() {
    return {
      isShowSelectDiscount: false,
      isShowSelectDishType: false,
      isShowLoading: false, //提交的加载
      dishInfoForm: {
        imageUrl: 1, //封面图片
        name: "", //菜品名称
        description: "", //菜品描述
        summary: "", //菜品概要介绍
        price: "", //原价（单位：元）
        discount: 1, //折扣
        packingCharges: "", //打包费（外卖）（单位：元）
      },
      storeMainInfo: {
        id: "",
        likeNumber: "",
        browseNumber: "",
        score: "",
        sales: "",
        userId: "",
      },
      dishTypeList: [],
      discountlist: [],
      typeId: "", //菜品类型id
      primaryColor: "#f4756b",
      dishTypeInputValue: "",
    };
  },
  onLoad() {
    for (let i = 0; i < 10; i++) {
      this.discountlist[i] = { value: (i + 1) / 10, label: (i + 1) / 10 };
    }
    this.$refs.navigationBar.setNavigation({
      backgroundColor: "white",
      titleText: "添加菜品",
    });
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on(
      "acceptDataFromOpenerPage",
      (storeMainInfo, dishTypeList) => {
        this.storeMainInfo = storeMainInfo;
        dishTypeList.forEach((element) => {
          this.dishTypeList.push({
            label: element.typeName,
            value: element.id,
          });
        });
      }
    );
  },
  methods: {
    /**
     * @description: 选择折扣的回调
     * @param {*} e 选择的参数
     */
    confirmDiscount(e) {
      this.dishInfoForm.discount = e[0].value;
    },
    /**
     * @description: 选择菜品类型的回调
     * @param {*} e 选择的参数
     */
    confirmDishType(e) {
      this.dishTypeInputValue = e[0].label;
      this.dishInfoForm.typeId = e[0].value;
    },
    /**
     * @description: 点击提交按钮
     */
    clickSubmitButton() {
      this.utils.debounce(() => {
        if (!this.utils.isObjectSomeKeyEmpty(this.dishInfoForm)) {
          this.$refs.dishInfoImageUpload.$refs.upload.upload();
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
      this.dishInfoForm.imageUrl = uploadedImageList[0];
      let dishInfoForm = this.dishInfoForm;
      dishInfoForm.preferentialPrice = ""; //随时废弃
      try {
        await postDishInfo({
          urlParam: this.storeMainInfo.id,
          queryData: dishInfoForm,
        });
        this.$refs.toast.show({
          text: "提交成功",
          type: "succes",
        });
      } catch (error) {
        console.log(error.data.errorMsg);
      }
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
</style>