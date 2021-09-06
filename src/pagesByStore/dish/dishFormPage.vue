<template>
  <view class="contanier">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
    <u-form :model="dishInfoForm" ref="uForm">
      <u-form-item label-position="top" label="菜品封面图片">
        <uploadGroup
          ref="dishInfoImageUpload"
          uploadImageDir="sotre/dish-info"
          uploadId="dishInfoImageUpload"
          :maxImageCount="1"
          :file-list="fileList"
          @onRemoveImage="clearImage(arguments)"
          @onImageUploaded="allImageUploaded(arguments)"
          @onChooseComplete="isImageChoosen = true"
        ></uploadGroup>
      </u-form-item>
      <u-form-item label-position="top" label="菜品名称">
        <u-input v-model="dishInfoForm.name" maxlength="10" />
      </u-form-item>
      <u-form-item label-position="top" label="菜品简短介绍">
        <u-input v-model="dishInfoForm.summary" maxlength="20" />
      </u-form-item>
      <u-form-item label-position="top" label="菜品描述">
        <u-input v-model="dishInfoForm.description" maxlength="200" />
      </u-form-item>
      <u-form-item label-position="top" label="原价（单位：元）">
        <u-input v-model="dishInfoForm.price" type="number" maxlength="4" />
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
        <u-input
          v-model="dishInfoForm.packingCharges"
          type="number"
          maxlength="2"
        />
      </u-form-item>
    </u-form>
    <button
      class="submit-button"
      :disabled="isShowLoading"
      @click="clickSubmitButton"
      :class="isShowLoading ? 'disabled-button' : ''"
    >
      <i v-show="isShowLoading" class="fa fa-spinner fa-spin fa-fw"></i>
      {{ isAdd ? "添加" : "编辑" }}
    </button>
  </view>
</template>

<script>
import { postDishInfo, putDishInfo } from "@/common/js/api/models.js";
export default {
  data() {
    return {
      isAdd: true, //当前是否为添加菜品
      isShowSelectDiscount: false,
      isShowSelectDishType: false,
      isShowLoading: false, //提交的加载
      isImageChoosen: false, //是否选择了照片
      dishInfoForm: {
        imageUrl: null, //封面图片
        name: "", //菜品名称
        description: "", //菜品描述
        summary: "", //菜品概要介绍
        price: "", //原价（单位：元）
        discount: 1, //折扣
        // packingCharges: "", //打包费（外卖）（单位：元）
        typeId: "", //菜品类型id
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
      fileList: [], //上传组件的图片
      primaryColor: "#f4756b",
      dishTypeInputValue: "",
    };
  },
  onLoad() {
    for (let i = 0; i < 10; i++) {
      this.discountlist[i] = { value: (i + 1) / 10, label: (i + 1) / 10 };
    }
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on(
      "acceptDataFromOpenerPage",
      (isAdd, storeMainInfo, dishTypeList, dishInfo) => {
        this.isAdd = isAdd;
        //编辑
        if (this.isAdd === false) {
          Object.assign(this.dishInfoForm, dishInfo);
          this.fileList.push({ url: this.dishInfoForm.imageUrl });
          this.isImageChoosen = true;
        }
        this.storeMainInfo = storeMainInfo;
        dishTypeList.forEach((element) => {
          //编辑
          if (this.isAdd === false && element.id === dishInfo.typeId) {
            this.dishTypeInputValue = element.typeName;
          }
          this.dishTypeList.push({
            label: element.typeName,
            value: element.id,
          });
        });
        this.$refs.navigationBar.setNavigation({
          backgroundColor: "white",
          titleText: `${this.isAdd ? "添加" : "编辑"}菜品`,
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
        console.log("当前表单数据", this.dishInfoForm);
        //添加
        if (this.isAdd) {
          if (
            !this.utils.isObjectAnyKeyEmpty(this.dishInfoForm, ["imageUrl"]) &&
            this.isImageChoosen
          ) {
            this.$refs.dishInfoImageUpload.$refs.upload.upload();
          } else {
            this.$refs.toast.show({
              text: "有信息还未填写",
              type: "warning",
            });
          }
          //编辑
        } else {
          if (
            !this.utils.isObjectAnyKeyEmpty(this.dishInfoForm, ["imageUrl"]) &&
            this.isImageChoosen
          ) {
            //更改过图片
            if (this.fileList.length === 0) {
              this.$refs.dishInfoImageUpload.$refs.upload.upload();
            } else {
              //未改过图片
              const dishId = this.dishInfoForm.id;
              delete this.dishInfoForm.id;
              putDishInfo({
                urlParam: {
                  storeId: this.storeMainInfo.id,
                  dishId: dishId,
                },
                queryData: this.dishInfoForm,
              }).then((res) => {
                if (res.success) {
                  this.$refs.toast.show({
                    text: "编辑成功",
                    type: "success",
                  });
                  this.backPage();
                } else {
                  this.$refs.toast.show({
                    text: "编辑失败",
                    type: "error",
                  });
                }
              });
            }
          } else {
            this.$refs.toast.show({
              text: "有信息还未填写",
              type: "warning",
            });
          }
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
      try {
        //添加
        if (this.isAdd === true) {
          await postDishInfo({
            urlParam: this.storeMainInfo.id,
            queryData: this.dishInfoForm,
          });
          //编辑
        } else {
          const dishId = this.dishInfoForm.id;
          delete this.dishInfoForm.id;
          await putDishInfo({
            urlParam: {
              storeId: this.storeMainInfo.id,
              dishId: dishId,
            },
            queryData: this.dishInfoForm,
          });
        }

        this.$refs.toast.show({
          text: "提交成功",
          type: "success",
        });
        this.backPage();
      } catch (error) {
        console.log(error.data.errorMsg);
        this.$refs.toast.show({
          text: "编辑失败",
          type: "error",
        });
      }
    },
    /**
     * @description: 清除当前菜品的图片
     */
    clearImage(args) {
      this.isImageChoosen = false;
      let index = args[0];
      this.dishInfoForm.imageUrl = null;
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
      prePage.$vm.getDishListData();
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
</style>
