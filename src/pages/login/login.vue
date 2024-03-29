<template>
  <view>
    <!-- 导航栏 -->
    <navigationBar ref="navigationBar"></navigationBar>
    <!-- 背景占位 -->
    <view class="background-placeholder"></view>
    <!-- 启动界面 -->
    <view
      v-if="splashScreenDuration !== 0"
      class="splash-screen"
      :class="splashScreenAnimation"
      :style="{
        display: showSplashScreen,
        animationDuration: splashScreenDuration,
      }">
      <!-- 启动界面背景图 -->
      <image
        src="https://shitukj.cn/service/backup/image-1.png"
        class="bg-image"/>
      <!-- LOGO容器 -->
      <view class="logo-container">
        <image
          src="@/static/images/logo-white.png"
          class="logo-image"
          mode="widthFix"></image>
      </view>
    </view>
    <!-- 登录界面 -->
    <view class="login-screen">
      <!-- 登录界面背景图 -->
      <image
        src="@/static/images/background/background@loginScreen.png"
        class="bg-image"
        :class="loginScreenAnimation"></image>
      <!-- 登录表单 -->
      <loginForm ref="loginForm" @loginSuccess="onLoginSuccess"></loginForm>
      <!-- 注册表单 -->
      <registerForm ref="registerForm"></registerForm>
      <!-- 验证码表单 -->
      <captchaForm ref="captchaForm"></captchaForm>
    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loginForm from "@/pages/login/subpages/loginForm";
    import registerForm from "@/pages/login/subpages/registerForm";
    import captchaForm from "@/pages/login/subpages/captchaForm";

    export default {
        components: {
            loginForm, registerForm, captchaForm, navigationBar,
        },
        data() {
            return {
                splashScreenDuration: 0, //启动界面持续时间（值为0时为不显示启动界面）
                initialScreen: 0, //启动界面推出后的初始显示界面，[0: 登陆界面, 1: 注册界面, 2: 验证码界面（仅供调试）]
                splashScreenAnimation: "animate__animated animate__fadeIn", //启动界面动效
                showSplashScreen: "", //控制启动界面显示隐藏
                loginScreenAnimation: "", //登录界面动效
                username: "",
                password: "",
            };
        },
        methods: {
            // 启动界面退出
            splashScreenExit() {
                if (this.splashScreenDuration !== 0) {
                    this.splashScreenAnimation = "animate__animated animate__fadeOut";
                    this.loginScreenAnimation = "animate__animated animate__fadeInUp";
                    setTimeout(() => {
                        this.showSplashScreen = "none"; //隐藏启动界面
                    }, this.splashScreenDuration);
                }
                switch (this.initialScreen) {
                    case 0:
                        setTimeout(() => {
                            this.$refs["loginForm"].showLoginForm = "";
                            this.$refs["loginForm"].loginFormAnimation = "animate__animated animate__fadeIn";
                        }, 0);
                        break;
                    case 1:
                        setTimeout(() => {
                            this.$refs["registerForm"].showRegisterForm = "";
                            this.$refs["registerForm"].registerFormAnimation = "animate__animated animate__fadeIn";
                        }, 0);
                        break;
                    case 2:
                        setTimeout(() => {
                            this.$refs["captchaForm"].showCaptchaForm = "";
                            this.$refs["captchaForm"].captchaFormAnimation = "animate__animated animate__fadeIn";
                        }, 0);
                        break;
                }
            },
            // 显示登陆界面
            toLoginScreen() {
                this.$refs["registerForm"].clear();
                this.$refs["captchaForm"].clear();
                this.$refs["registerForm"].setAnimation('fadeOutRight');
                this.$refs["captchaForm"].setAnimation('fadeOutRight');
                this.$refs["loginForm"].setAnimation('fadeInLeft');
                setTimeout(() => {
                    this.$refs["loginForm"].showLoginForm = "";
                    this.$refs["captchaForm"].showCaptchaForm = "none";
                    setTimeout(() => {
                        this.$refs["registerForm"].showRegisterForm = "none";
                    }, 300);
                }, 300);
            },
            // 显示注册界面
            toRegisterScreen() {
                this.$refs["loginForm"].clear();
                this.$refs["captchaForm"].clear();
                this.$refs["loginForm"].setAnimation('fadeOutLeft');
                this.$refs["captchaForm"].setAnimation('fadeOutLeft');
                this.$refs["registerForm"].setAnimation('fadeInRight');
                setTimeout(() => {
                    this.$refs["registerForm"].showRegisterForm = "";
                    this.$refs["captchaForm"].showCaptchaForm = "none";
                    setTimeout(() => {
                        this.$refs["loginForm"].showLoginForm = "none";
                    }, 300);
                }, 300);
            },
            // 显示验证码界面
            toCaptchaScreen() {
                this.$refs["registerForm"].setAnimation('fadeOutLeft');
                this.$refs["loginForm"].setAnimation('fadeOutLeft');
                this.$refs["captchaForm"].setAnimation('fadeInRight');
                setTimeout(() => {
                    this.$refs["captchaForm"].showCaptchaForm = "";
                    setTimeout(() => {
                        this.$refs["registerForm"].showRegisterForm = "none";
                        this.$refs["captchaForm"].sendCaptcha();
                    }, 300);
                }, 300);
            },
            onLoginSuccess() {
                const eventChannel = this.getOpenerEventChannel();
                eventChannel.emit("acceptDataFromOpenedPage", {
                    success: true
                });
                uni.navigateBack();
            }
        },
        onLoad() {
        },
        mounted() {
            setTimeout(() => {
                this.splashScreenExit();
            }, this.splashScreenDuration); //在启动界面持续时间结束后进入登录界面
        },
        created() {
            if (this.splashScreenDuration === 0) {
                this.showSplashScreen = 'none';
            }
        }
    };
</script>

<style lang="scss" scoped>
  .background-placeholder {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    background-color: white;
  }

  .splash-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 99999;

    .bg-image {
      width: 100vw;
      height: 100vh;
    }

    .logo-container {
      position: absolute;
      top: 45vh;
      width: 100%;
      text-align: center;

      .logo-image {
        width: 60%;
      }
    }
  }

  .login-screen {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;

    .bg-image {
      position: absolute;
      width: 100vw;
      height: 100vh;
    }
  }
</style>