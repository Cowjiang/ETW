<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading fullscreen ref="loading"/>

    <view class="wx-login-container">
      <view class="logo-container">
        <view class="image">
          <image
            src="https://com-etw-new.oss-cn-guangzhou.aliyuncs.com/dynamic/35/d01088f44119453c808e2343058628b4.jpg"
            mode="aspectFill"/>
        </view>
        <view class="name">
          <text>Aurora+</text>
        </view>
      </view>
      <view class="login-btn-container">
        <button class="wx-login-btn" @click="handleLoginBtnClick">
          微信一键登录
        </button>
        <view class="username-login" @click="usernameLogin">
          输入账号登录
        </view>
      </view>
      <view class="bottom-container">
        <u-checkbox
          v-model="agreeCheckbox"
          shape="circle"
          :label-disabled="false"
          active-color="#f4756b"
          label-size="28"
          size="36">
          <span>
            我已阅读并同意
            <span
              style="color: #f4756b"
              @click.stop="gotoPrivacy">用户协议及隐私协议</span>
          </span>
        </u-checkbox>
      </view>
    </view>
  </view>
</template>

<script>
    import loading from "@/components/loading/loading";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import {wxLogin, wxRegister, wxUserProfile} from "@/common/js/api/models";

    export default {
        name: "wxLogin",
        components: {
            toast, navigationBar, loading
        },
        data() {
            return {
                navigationHeight: 0, //导航栏高度
                agreeCheckbox: false, //用户已阅读并同意使用协议
                loginSucceeded: false, //是否已经登录了
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
                                }).then(async res => {
                                    //登陆成功
                                    this.loginSucceeded = true;
                                    if (isNewUser) {
                                        //新用户第一次登录
                                        await uni.setStorage({
                                            key: "userInfo",
                                            data: res.data,
                                            success: async () => {
                                                this.$store.commit('userInfo', res.data);
                                                await this.utils.connectSocket().then(() => {
                                                    this.$refs.loading.stopLoading();
                                                    this.getUserProfile();
                                                }).catch((err) => {
                                                    console.error(err)
                                                });
                                            },
                                        });
                                    }
                                    else {
                                        //老用户
                                        await uni.setStorage({
                                            key: "userInfo",
                                            data: res.data,
                                            success: async () => {
                                                this.$store.commit('userInfo', res.data);
                                                await this.utils.connectSocket().then(res => {
                                                    this.$refs.loading.stopLoading();
                                                    const redirectPage = this.$store.state.currentPageUrl ?? null;
                                                    uni.switchTab({
                                                        url: `${redirectPage === null ? "pages/trending/trending" : redirectPage}`,
                                                        fail: () => {
                                                            uni.redirectTo({
                                                                url: `${redirectPage === null ? "pages/trending/trending" : redirectPage}`,
                                                                fail: err => {
                                                                    console.error(err);
                                                                }
                                                            });
                                                        }
                                                    });
                                                })
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
                }, 0);
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
                        }).then(() => {
                            this.wxLogin(true);
                        }).catch(err => {
                            console.error(err)
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
                    }
                });
            },
            // 获取用户个人资料
            getUserProfile() {
                uni.showModal({
                    content: '请授权允许获取用户信息',
                    confirmText: '立即授权',
                    confirmColor: '#f4756b',
                    showCancel: false,
                    success: ({ confirm }) => {
                        if (confirm) {
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
                                        }).catch(err => {
                                            console.error(err);
                                        }).finally(() => {
                                            this.getUserPhone();
                                        });
                                    }
                                    else {
                                        console.error(res);
                                        this.getUserPhone();
                                    }
                                },
                                fail: error => {
                                    console.error(error);
                                    this.getUserPhone();
                                }
                            });
                        }
                    },
                    fail: error => {
                        console.error(error);
                        this.getUserPhone();
                    }
                });
            },
            // 获取用户手机号
            getUserPhone() {
                const redirectPage = this.$store.state.currentPageUrl ?? null;
                uni.navigateTo({
                    url: '/pages/login/wxRegisterPhone',
                    events: {
                        acceptDataFromOpenedPage: (data) => {
                            this.$refs.loading.startLoading();
                            if (!data.success) {
                                this.$refs.toast.show({
                                    text: data.res ?? '手机号绑定失败',
                                    type: 'warning',
                                    direction: 'top'
                                });
                            }
                            setTimeout(() => {
                                uni.switchTab({
                                    url: `${redirectPage === null ? "pages/trending/trending" : redirectPage}`,
                                    fail: () => {
                                        uni.redirectTo({
                                            url: `${redirectPage === null ? "pages/trending/trending" : redirectPage}`,
                                            fail: err => {
                                                console.error(err);
                                            }
                                        });
                                    }
                                });
                            }, 300);
                        },
                    },
                });
            },
            // 输入用户名密码登录
            usernameLogin() {
                this.utils.throttle(() => {
                    if (this.agreeCheckbox) {
                        const redirectPage = this.$store.state.currentPageUrl ?? null;
                        uni.navigateTo({
                            url: `/pages/login/login`,
                            events: {
                                acceptDataFromOpenedPage: (data) => {
                                    if (data.success) {
                                        this.$refs.loading.startLoading();
                                        setTimeout(() => {
                                            uni.switchTab({
                                                url: `${redirectPage === null ? "pages/trending/trending" : redirectPage}`,
                                                fail: () => {
                                                    uni.redirectTo({
                                                        url: `${redirectPage === null ? "pages/trending/trending" : redirectPage}`,
                                                        fail: err => {
                                                            console.error(err);
                                                        }
                                                    });
                                                }
                                            });
                                        }, 300);
                                    }
                                },
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
            // 切换登陆的用户类型（商家/顾客）
            changeUserType() {
                this.$refs.loading.startLoading();
                setTimeout(() => {
                    this.$store.commit('shopkeeper', !this.shopkeeper);
                    this.$refs.loading.stopLoading();
                }, 500);
            },
            // 登录按钮点击事件
            handleLoginBtnClick() {
                this.utils.throttle(() => {
                    if (this.loginSucceeded) {
                        const redirectPage = this.$store.state.currentPageUrl ?? null;
                        uni.switchTab({
                            url: `${redirectPage === null ? "pages/trending/trending" : redirectPage}`,
                            fail: () => {
                                uni.redirectTo({
                                    url: `${redirectPage === null ? "pages/trending/trending" : redirectPage}`,
                                    fail: err => {
                                        console.error(err);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        this.wxLogin(false);
                    }
                }, 2000);
            },
            gotoPrivacy() {
                uni.navigateTo({
                    url: '/pages/login/subpages/privacy'
                });
            }
        },
        computed: {
            // 是否为商家
            shopkeeper: {
                get() {
                    return this.$store.state.shopkeeper;
                }
            }
        },
        mounted() {
            this.navigationHeight = this.$store.state.navigationHeight;
            this.$refs.navigationBar.setNavigation({
                titleText: '登录 / 注册'
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import 'wxLogin';
</style>