<template>
  <scroll-view scroll-y class="contanier">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
    <u-form :model="applyForm" ref="uForm">
      <u-form-item label-position="top" label="真实姓名" maxlength="8">
        <u-input v-model="applyForm.realName" />
      </u-form-item>
      <u-form-item label-position="top" label="手机号码">
        <u-input v-model="applyForm.phone" type="number" maxlength="11" />
      </u-form-item>
      <u-form-item label-position="top" label="营业执照">
        <uploadGroup
          ref="businessLicenseUpload"
          :maxImageCount="1"
          uploadImageDir="sotre/business-license"
          uploadId="businessLicense"
          @onImageUploaded="submitForm(arguments)"
        ></uploadGroup>
      </u-form-item>
      <u-form-item label-position="top" label="法人身份证正面">
        <uploadGroup
          ref="idCardFrontUpload"
          :maxImageCount="1"
          uploadImageDir="sotre/idCard-front"
          uploadId="idCardFront"
          @onImageUploaded="submitForm(arguments)"
        ></uploadGroup>
      </u-form-item>
      <u-form-item label-position="top" label="法人身份证反面">
        <uploadGroup
          ref="idCardBackUpload"
          :maxImageCount="1"
          uploadImageDir="sotre/idCard-back"
          uploadId="idCardBack"
          @onImageUploaded="submitForm(arguments)"
        ></uploadGroup>
      </u-form-item>
      <u-form-item label-position="top" label="许可证">
        <uploadGroup
          ref="licenseUpload"
          :maxImageCount="1"
          uploadImageDir="sotre/license"
          uploadId="license"
          @onImageUploaded="submitForm(arguments)"
        ></uploadGroup>
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
  </scroll-view>
</template>

<script>
    import { Validator } from "@/common/js/validate/validate.js";
    import { postStoreArchives } from "@/common/js/api/models.js";

    export default {
        data() {
            return {
                applyForm: {
                    realName: "",
                    phone: "",
                    businessLicense: "",
                    idCardFront: "",
                    idCardBack: "",
                    license: "",
                },
                isShowLoading: false,
                uploadedImageNumber: 0,
            };
        },
        onLoad() {
            this.$refs.navigationBar.setNavigation({
                backgroundColor: "white",
                titleText: "店铺申请",
                customBackFunc() {
                    uni.navigateBack({
                        delta: 99,
                    });
                },
            });
            const eventChannel = this.getOpenerEventChannel();
            eventChannel.on("acceptDataFromOpenerPage", (data) => {
                console.log(data);
            });
        },
        methods: {
            /**
             * @description: 点击提交按钮
             */
            clickSubmitButton() {
                this.utils.debounce(() => {
                    const data = this.applyForm;
                    const rules = [
                        { key: "realName", required: true },
                        { key: "phone", required: true, regExp: ["phone"] },
                    ];
                    const validator = new Validator();
                    const validatedInfo = validator.validate(data, rules);
                    console.log("验证信息", validatedInfo);
                    const [realNameValidatedInfo, phoneValidatedInfo] = [
                        validatedInfo.realName,
                        validatedInfo.phone,
                    ];
                    if (realNameValidatedInfo.required && phoneValidatedInfo.required) {
                        if (phoneValidatedInfo.regExp.length === 0) {
                            this.isShowLoading = true;
                            this.$refs.businessLicenseUpload.$refs.upload.upload();
                            this.$refs.idCardFrontUpload.$refs.upload.upload();
                            this.$refs.idCardBackUpload.$refs.upload.upload();
                            this.$refs.licenseUpload.$refs.upload.upload();
                        } else {
                            this.$refs.toast.show({
                                text: "手机格式错误",
                                type: "warning",
                            });
                        }
                    } else {
                        if (!realNameValidatedInfo.required) {
                            this.$refs.toast.show({
                                text: "必须填写真实姓名",
                                type: "warning",
                            });
                        } else if (!phoneValidatedInfo.required) {
                            this.$refs.toast.show({
                                text: "必须填写手机",
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
            submitForm(args) {
                const applyForm = this.applyForm;
                let [imageList, uploadId] = args;
                applyForm[uploadId] = imageList[0];
                this.uploadedImageNumber += 1;
                if (this.uploadedImageNumber === 4) {
                    if (!this.utils.isObjectAnyKeyEmpty(applyForm)) {
                        postStoreArchives({
                            queryData: this.applyForm,
                        }).then((res) => {
                            if (res.success) {
                                this.$refs.toast.show({
                                    text: "提交成功,请等待审核",
                                    type: "success",
                                });
                                uni.navigateBack({
                                    delta: 999,
                                });
                            }
                        });
                    } else {
                        this.isShowLoading = false;
                        this.uploadedImageNumber = 0;
                        this.$refs.toast.show({
                            text: "有图片还未上传",
                            type: "warning",
                        });
                    }
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
  .contanier {
    height: 100vh;
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