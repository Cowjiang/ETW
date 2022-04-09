<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>

    <view class="wx-authorize-container">
      <view class="logo-container">
        <view class="image">
          <image
            src="https://com-etw.oss-cn-guangzhou.aliyuncs.com/sotre/store-info/3/446e7f4376604ebd989acf9b6f012bd6.jpg"
            mode="aspectFill"/>
        </view>
        <view class="name">
          周边大侦探
        </view>
      </view>
      <view class="authorize-btn-container">
        <button class="authorize-btn" open-type="getPhoneNumber" @getphonenumber="getUserPhone">
          微信授权绑定手机号
        </button>
        <view class="authorize-tips">
          请授权允许获取手机号信息
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import {wxUserPhone} from "@/common/js/api/models";

    export default {
        name: "wxRegisterPhone",
        components: {
            toast, navigationBar
        },
        data() {
            return {}
        },
        methods: {
            // 获取用户手机号码
            getUserPhone(e) {
                if (e.detail.errMsg === "getPhoneNumber:fail user deny") {
                    //用户拒绝权限
                    this.$refs.toast.show({
                        text: '请授权获取手机号码',
                        type: 'warning',
                        direction: 'top'
                    });
                }
                else {
                    const encryptedData = e.detail.encryptedData;
                    const iv = e.detail.iv;
                    wxUserPhone({
                        queryData: {
                            encryptedData: encryptedData,
                            iv: iv
                        }
                    }).then(() => {
                        const eventChannel = this.getOpenerEventChannel();
                        eventChannel.emit("acceptDataFromOpenedPage", {
                            success: true
                        });
                        uni.navigateBack();
                    }).catch(err => {
                        console.error(err);
                        const eventChannel = this.getOpenerEventChannel();
                        eventChannel.emit("acceptDataFromOpenedPage", {
                            success: false,
                            res: err.data.errorMsg
                        });
                        uni.navigateBack();
                    });
                }
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '微信授权登录',
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import 'wxRegisterPhone';
</style>