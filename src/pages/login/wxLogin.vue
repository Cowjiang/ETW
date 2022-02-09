<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading fullscreen ref="loading"/>

    <view class="wx-login-container">
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
      <view class="login-btn-container">
        <button class="wx-login-btn" @click="wxLogin(false)">
          微信一键登录
        </button>
        <view class="username-login" @click="usernameLogin">
          输入账号登录/注册
        </view>
      </view>
      <view class="bottom-container">
        <u-checkbox
          v-model="agreeCheckbox"
          shape="circle"
          :label-disabled="false"
          active-color="#f4756b"
          label-size="28"
          size="28">
          <span>
            我已阅读并同意
            <span style="color: #f4756b">食途用户协议、隐私协议</span>
          </span>
        </u-checkbox>
      </view>
    </view>
  </view>
</template>

<script>
    import {toast} from "@/components/toast/toast.vue";
    import {navigationBar} from "@/components/navigationBar/navigationBar.vue";
    import {loading} from "@/components/loading/loading.vue";
    import {wxLogin, wxRegister, wxUserProfile} from "@/common/js/api/models";

    export default {
        name: "wxLogin",
        components: {
            toast, navigationBar, loading
        },
        data() {
            return {
                agreeCheckbox: false, //用户已阅读并同意使用协议
            }
        },
        methods: {
            /**
             * 微信一键登录
             * @param {Boolean} isNewUser 是否为新用户第一次登录
             */
            wxLogin(isNewUser) {
                this.utils.throttle(() => {
                    if (this.agreeCheckbox) {
                        this.$refs.loading.startLoading();
                        uni.login({
                            provider: "weixin",
                            success: res => {
                                const code = res.code;
                                wxLogin({
                                    queryData: {
                                        code: code
                                    }
                                }).then(res => {
                                    //登陆成功
                                    if (isNewUser) {
                                        //新用户第一次登录
                                        wx.setStorage({
                                            key: "userInfo",
                                            data: res.data,
                                            success: () => {
                                                this.$refs.loading.stopLoading();
                                                this.getUserProfile();
                                            },
                                        });
                                    }
                                    else {
                                        //老用户
                                        this.$refs.loading.stopLoading();
                                        wx.setStorage({
                                            key: "userInfo",
                                            data: res.data,
                                            success: () => {
                                                const redirectPage = this.utils.getCurrentPage().curParam.redirectPath || null;
                                                uni.redirectTo({
                                                    url: `/${redirectPage === null ? "/pages/index/index" : redirectPage}`,
                                                });
                                            },
                                        });
                                    }
                                }).catch(err => {
                                    if (!err.data.success) {
                                        //账户未注册
                                        this.wxRegister();
                                    }
                                    else {
                                        console.error(err);
                                        this.$refs.loading.stopLoading();
                                        this.$refs.toast.show({
                                            text: '登陆失败',
                                            type: "error",
                                            direction: "top"
                                        });
                                    }
                                });
                            },
                        });
                    }
                    else {
                        this.$refs.toast.show({
                            text: "请阅读并同意用户协议",
                            type: "warning",
                            direction: "top"
                        });
                    }
                }, 2000);
            },
            // 为当前微信账号注册
            wxRegister() {
                uni.login({
                    provider: "weixin",
                    success: res => {
                        const code = res.code;
                        wxRegister({
                            queryData: {
                                code: code
                            }
                        }).then(res => {
                            console.log(res);
                            if (res.success) {
                                this.wxLogin(true);
                            }
                        }).catch(err => {
                            if (!err.data.success) {
                                //账户已存在
                                this.wxLogin(false);
                            }
                            else {
                                console.error(err);
                                this.$refs.loading.stopLoading();
                                this.$refs.toast.show({
                                    text: '注册失败',
                                    type: "error",
                                    direction: "top"
                                });
                            }
                        });
                    },
                });
            },
            // 获取用户个人资料
            getUserProfile() {
                uni.getUserProfile({
                    desc: "请授权获取用户信息",
                    lang: "zh_CN",
                    success: res => {
                        if (res.errMsg === "getUserProfile:ok") {
                            const encryptedData = res.encryptedData;
                            const iv = res.iv;
                            const signature = res.signature;
                            wxUserProfile({
                                queryData: {
                                    encryptedData: encryptedData,
                                    iv: iv,
                                    signature: signature
                                }
                            }).then(res => {
                                if (res.success) {
                                    //绑定微信用户信息成功
                                    this.getUserPhone();
                                }
                                else {
                                    console.error(res);
                                }
                            }).catch(err => {
                                console.error(err);
                            });
                        }
                        else {
                            console.error(res);
                        }
                    }
                });
            },
            // 获取用户手机号
            getUserPhone() {
                uni.navigateTo({
                    url: '/pages/login/wxRegisterPhone',
                    events: {
                        acceptDataFromOpenedPage: (data) => {
                            if (data.success) {
                                const redirectPage = this.utils.getCurrentPage().curParam.redirectPath || null;
                                uni.redirectTo({
                                    url: `/${redirectPage === null ? "/pages/index/index" : redirectPage}`,
                                });
                            }
                            else {
                                this.$refs.toast.show({
                                    text: data.res ?? '手机号绑定失败',
                                    type: 'warning',
                                    direction: 'top'
                                });
                            }
                        },
                    },
                });
            },
            // 输入用户名密码登录
            usernameLogin() {
                const currentPage = this.utils.getCurrentPage();
                uni.navigateTo({
                    url: `/pages/login/login?redirectPath=${currentPage.curUrl}`
                });
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '登录'
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import 'wxLogin';
</style>