<template>
  <view class="contanier">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
    <u-form :model="dishInfoForm" ref="uForm">
      <u-form-item label-position="top" label="菜品封面图片">
        <uploadGroup
          ref="dishInfoUpload"
          :maxImageCount="1"
          uploadImageDir="sotre/dish-info"
          uploadId="dishInfoUpload"
          @onImageUploaded="null"
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
      <u-form-item label-position="top" label="折扣">
        <u-input
          v-model="discountInputValue"
          placeholder="请选择折扣力度"
          type="select"
          @click="isShowPickerDiscount = true"
        />
        <u-picker
          v-model="isShowPickerDiscount"
          safe-area-inset-bottom="true"
          @confirm="confirmDiscount()"
        ></u-picker>
      </u-form-item>
      <u-form-item label-position="top" label="菜品类型">
        <u-input
          v-model="typeInputValue"
          placeholder="请选择菜品类型"
          type="select"
          @click="isShowPickerDishType = true"
        />
        <u-picker
          v-model="isShowPickerDishType"
          safe-area-inset-bottom="true"
          @confirm="confirmDishType()"
        ></u-picker>
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
export default {
  data() {
    return {
      dishInfoForm: {
        name: "", //菜品名称
        imageUrl: "", //封面图片
        description: "", //菜品描述
        summary: "", //菜品概要介绍
        price: "", //原价（单位：元）
        discount: "", //折扣
        typeId: "", //类型id
        packingCharges: "", //打包费（外卖）（单位：元）
      },
      discountInputValue: "",
      typeInputValue: "",
      isShowPickerDiscount: false,
      isShowPickerDishType: false,
      isShowLoading: false, //提交的加载
    };
  },
  onLoad() {
    this.$refs.navigationBar.setNavigation({
      backgroundColor: "white",
      titleText: "添加菜品",
    });
  },
  methods: {
    /**
     * @description: 选择折扣的回调
     * @param {*} e 选择的参数
     */
    confirmDiscount(e) {
      console.log(e);
      this.dishInfoForm.discount = e;
    },
    /**
     * @description: 选择菜品类型的回调
     * @param {*} e 选择的参数
     */
    confirmDishType(e) {
      console.log(e);
      this.dishInfoForm.typeId = e;
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