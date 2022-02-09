<template>
  <!-- 登录表单 -->
  <view
    class="login-form"
    :class="loginFormAnimation"
    :style="{ display: showLoginForm }">
    <text class="title">登 录</text>
    <!-- 输入框区域 -->
    <view class="input-area">
      <view class="username-container" :class="usernameContainerStyle">
        <view class="input-placeholder" :class="usernamePlaceholderStyle">
          电子邮箱 / 手机
        </view>
        <input
          type="text"
          class="username-input"
          v-model="username"
          :focus="usernameFocusState"
          @focus="inputFocus(1)"
          @blur="inputBlur"
          @input="usernameWatcher"
          @confirm="usernameConfirm"
          :confirm-type="`next`"/>
      </view>
      <view class="password-container" :class="passwordContainerStyle">
        <view class="input-placeholder" :class="passwordPlaceholderStyle">
          密码
        </view>
        <input
          type="password"
          class="password-input"
          v-model="password"
          :focus="passwordFocusState"
          @focus="inputFocus(2)"
          @blur="inputBlur"
          @input="passwordWatcher"
          @confirm="passwordConfirm"
          :confirm-type="`done`"/>
      </view>
    </view>
    <!-- 忘记密码 -->
    <view class="forget-password" @click="forgetPassword">
      <text>忘记密码 ?</text>
    </view>
    <!-- 下方按钮区域 -->
    <view class="button-area">
      <view class="login-button" @click="loginCheck">
        <text>登 录</text>
      </view>
      <view class="wechat-login-button" @click="wechatLogin">
        <text>微信登录</text>
      </view>
      <view class="no-account">
        <text>没有账号？</text>
        <text class="register-now" @click="registerNow">立即注册</text>
      </view>
    </view>

    <toast ref="toast"></toast>
    <mask :isShow="isShow" @click="isShow = false">
      <imageVerify></imageVerify>
    </mask>
  </view>
</template>

<script>
    import {loginTest} from "@/common/js/api/models.js";
    import {Validator} from "@/common/js/validate/validate.js";
    import {toast} from '@/components/toast/toast.vue';
    import {imageVerify} from '@/components/imageVerify/imageVerify.vue';


    export default {
        components: {
            toast, imageVerify
        },
        data() {
            return {
                showLoginForm: "none", //控制登录窗体显示隐藏
                loginFormAnimation: "", //登录窗体动效
                usernameContainerStyle: "", //用户名输入容器样式
                passwordContainerStyle: "", //密码输入容器样式
                usernamePlaceholderStyle: "", //用户名小标题样式
                passwordPlaceholderStyle: "", //密码小标题样式
                usernameFocusState: false, //用户名输入框焦点状态
                passwordFocusState: false, //密码输入框焦点状态
                username: "", //用户名输入框中的值
                password: "", //密码输入框中的值
                isShow: false, //是否显示图片拖拽验证码
            };
        },
        methods: {
            /**
             * 输入框聚焦事件
             * @param {Number} sel 触发目标，值为1是用户名输入框，值为2是密码输入框
             */
            inputFocus(sel) {
                switch (sel) {
                    case 1:
                        this.usernameContainerStyle = "container-focus";
                        this.passwordContainerStyle = "";
                        this.usernamePlaceholderStyle = "placeholder-focus";
                        if (this.password === "") {
                            this.passwordPlaceholderStyle = "";
                        }
                        break;
                    case 2:
                        this.passwordContainerStyle = "container-focus";
                        this.usernameContainerStyle = "";
                        this.passwordPlaceholderStyle = "placeholder-focus";
                        if (this.username === "") {
                            this.usernamePlaceholderStyle = "";
                        }
                        break;
                }
            },
            // 输入框失焦事件
            inputBlur() {
                this.usernameContainerStyle = "";
                this.passwordContainerStyle = "";
                if (this.username === "") {
                    this.usernamePlaceholderStyle = "";
                }
                if (this.password === "") {
                    this.passwordPlaceholderStyle = "";
                }
            },
            // 用户名输入框监听器（后续若不使用可以删除）
            usernameWatcher(e) {
                // this.username = e.detail.value.replace(/\s+/g, '')
            },
            // 密码输入框输入监听器（后续若不使用可以删除）
            passwordWatcher(e) {
                // this.password = e.detail.value.replace(/\s+/g, '');
            },
            // 用户名输入框确认事件
            usernameConfirm(e) {
                if (e.detail.value !== "") {
                    //使密码输入框重新获得焦点
                    this.passwordFocusState = false;
                    this.$nextTick(() => {
                        this.passwordFocusState = true;
                    });
                }
                else {
                    //使用户名输入框重新获得焦点
                    this.usernameFocusState = false;
                    this.$nextTick(() => {
                        this.usernameFocusState = true;
                    });
                }
            },
            // 密码输入框确认事件
            passwordConfirm(e) {
                if (e.detail.value === "") {
                    //使密码输入框重新获得焦点
                    this.passwordFocusState = false;
                    this.$nextTick(() => {
                        this.passwordFocusState = true;
                    });
                }
                else {
                    this.loginCheck(); //登录检查
                }
            },
            // 忘记密码按钮点击事件
            forgetPassword() {
                //Forget Password
                this.utils.throttle(() => {
                    this.$refs.toast.show({
                        text: "你怎么这么傻能忘记密码",
                        type: "error",
                    });
                });
            },
            // 登录检查，登录按钮点击事件
            loginCheck() {
                this.utils.throttle(() => {
                    this.$parent.username = this.username;
                    this.$parent.password = this.password;
                    let data = {
                        username: this.username,
                        password: this.password,
                    };
                    // 验证规则
                    let rules = [
                        {
                            key: "username",
                            regExp: ["email", "phone"],
                            required: true,
                        },
                        {
                            key: "password",
                            required: true,
                        },
                    ];
                    let validator = new Validator();
                    let validatedInfo = validator.validate(data, rules);
                    let [usernameValidatedInfo, passwordValidatedInfo] = [
                        validatedInfo.username,
                        validatedInfo.password,
                    ];
                    //判断是否经过邮箱/手机格式验证
                    if (usernameValidatedInfo.required && passwordValidatedInfo.required) {
                        if (usernameValidatedInfo.regExp.length < 2) {
                            loginTest({
                                queryData: {
                                    username: this.username,
                                    password: this.password,
                                },
                            })
                                .then(res => {
                                    if (res.success && res.data.id !== null) {
                                        wx.setStorage({
                                            key: "userInfo",
                                            data: res.data,
                                            success: () => {
                                                this.$refs.toast.show({
                                                    text: '登陆成功',
                                                    type: "success",
                                                });
                                                const redirectPage = this.utils.getCurrentPage().curParam.redirectPath || null;
                                                uni.redirectTo({
                                                    url: `/${redirectPage === null ? "/pages/index/index" : redirectPage}`,
                                                });
                                            },
                                        });
                                    }
                                    else {
                                        console.log(res)
                                        this.$refs.toast.show({
                                            text: '登陆失败',
                                            type: "error",
                                        });
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                    this.$refs.toast.show({
                                        text: '登陆失败',
                                        type: "error",
                                    });
                                });
                        }
                        else if (usernameValidatedInfo.regExp.length >= 2) {
                            this.$refs.toast.show({
                                text: "邮箱/手机格式错误",
                                type: "warning",
                            });
                        }
                    }
                    else {
                        if (!usernameValidatedInfo.required) {
                            this.$refs.toast.show({
                                text: "必须填写邮箱/手机",
                                type: "warning",
                            });
                        }
                        else if (!passwordValidatedInfo.required) {
                            this.$refs.toast.show({
                                text: "必须填写密码",
                                type: "warning",
                            });
                        }
                    }
                }, 2500);
            },
            // 立即注册按钮点击事件
            registerNow() {
                this.utils.throttle(() => {
                    [
                        this.usernameContainerStyle,
                        this.passwordContainerStyle,
                        this.usernamePlaceholderStyle,
                        this.passwordPlaceholderStyle,
                    ] = ["", "", "", ""]; //还原输入区域样式
                    this.$parent.$refs.navigationBar.setNavigation({
                        titleText: '注册',
                        customBackFunc: this.$parent.toLoginScreen,
                    });
                    this.$parent.toRegisterScreen();
                });
            },
            // 微信登陆按钮点击事件
            wechatLogin() {
                this.utils.throttle(() => {
                    uni.navigateBack();
                });
            },
            /**
             * 设置登陆界面动画效果
             * @param {null|String} animation 动画
             */
            setAnimation(animation) {
                if (animation !== null) {
                    this.loginFormAnimation = `animate__animated animate__${animation}`;
                }
            },
            // 清除输入信息
            clear() {
                this.username = '';
                this.password = '';
            },
        },
        watch: {
            showLoginForm(nval, oval) {
                if (nval === "") {
                    this.$parent.$refs.navigationBar.setNavigation({
                        titleText: '登录',
                    });
                }
            },
        },
        mounted() {
        },
        onLoad() {
        },
    };
</script>

<style lang="scss" scoped>
  .login-form {
    width: 100vw;
    position: absolute;
    margin-top: 11vh;
    padding: 54rpx;
    animation-duration: 600ms;

    .title {
      font-size: 64rpx;
      font-weight: bold;
      color: $uni-text-color;
    }

    .input-area {
      width: 100%;
      margin-top: 74rpx;

      .username-container {
        height: 110rpx;
        margin-bottom: 46rpx;
        border-bottom: 4rpx solid #ededed;
        transition-property: border-bottom-color;
        transition-duration: 0.2s;

        .input-placeholder {
          font-size: 34rpx;
          color: $uni-text-color-placeholder;
          transition-duration: 0.2s;
          transition-property: transform, font-size;
          transform: translateY(40rpx);
        }

        .username-input {
          height: 80rpx;
          font-size: 32rpx;
          color: $uni-text-color;
          transform: translateY(-10rpx);
        }

        .placeholder-focus {
          transform: translateY(0);
          font-size: 32rpx;
        }
      }

      .password-container {
        height: 110rpx;
        border-bottom: 4rpx solid #ededed;
        transition-property: border-bottom-color;
        transition-duration: 0.2s;

        .input-placeholder {
          font-size: 34rpx;
          color: $uni-text-color-placeholder;
          transition-duration: 0.2s;
          transition-property: transform, font-size;
          transform: translateY(40rpx);
        }

        .password-input {
          height: 80rpx;
          font-size: 32rpx;
          color: $uni-text-color;
          transform: translateY(-10rpx);
        }

        .placeholder-focus {
          transform: translateY(0);
          font-size: 32rpx;
        }
      }

      .container-focus {
        border-bottom-color: $uni-color-primary;
      }
    }

    .forget-password {
      padding: 30rpx 0;
      font-size: 30rpx;
      color: $uni-text-color-placeholder;
      text-align: right;
    }

    .button-area {
      width: 100%;
      padding: 30rpx 0;

      .login-button {
        width: 100%;
        height: 94rpx;
        text-align: center;
        font-size: 35rpx;
        font-weight: bold;
        line-height: 94rpx;
        color: $uni-text-color-inverse;
        background-color: $uni-color-primary;
        border-radius: 14rpx;
      }

      .no-account {
        width: 100%;
        height: 180rpx;
        text-align: center;
        font-size: 32rpx;
        line-height: 180rpx;
        color: #444444;

        .register-now {
          color: $uni-color-primary;
        }
      }

      .wechat-login-button {
        width: 100%;
        height: 94rpx;
        margin-top: 40rpx;
        text-align: center;
        font-size: 34rpx;
        font-weight: bold;
        line-height: 94rpx;
        color: $uni-text-color-inverse;
        background-color: #5f76ea;
        border-radius: 14rpx;
      }
    }
  }
</style>
