<template>
  <view>
    <!-- 背景占位 -->
    <view class="background-placeholder"></view>
    <!-- S 启动界面 -->
    <view
      class="splash-screen"
      :class="splashScreenAnimation"
      :style="{
        display: showSplashScreen,
        animationDuration: splashScreenDuration,
      }"
    >
      <!-- /启动界面背景图 -->
      <image
        src="../../static/images/background/background@splashScreen.png"
        class="bg-image"
      ></image>
      <!-- /LOGO容器 -->
      <view class="logo-container">
        <image
          src="../../static/images/logo-white.png"
          class="logo-image"
          mode="widthFix"
        ></image>
      </view>
    </view>
    <!-- E 启动界面 -->

    <!-- S 登录界面 -->
    <view class="login-screen">
      <!-- /登录界面背景图 -->
      <image
        src="../../static/images/background/background@loginScreen.png"
        class="bg-image"
        :class="loginScreenAnimation"
      ></image>

      <!-- /登录表单 -->
      <loginForm ref="loginForm"></loginForm>
      <!-- /注册表单 -->
      <registerForm ref="registerForm"></registerForm>
      <!-- /验证码表单 -->
      <captchaForm ref="captchaForm"></captchaForm>
    </view>
    <!-- E 登录界面 -->
  </view>
</template>

<script>
import loginForm from "./loginForm.vue";
import registerForm from "./registerForm.vue";
import captchaForm from "./captchaForm.vue";

export default {
  components: {
    loginForm,
    registerForm,
    captchaForm,
  },
  data() {
    return {
      username: "",
      password: "",
      emailCode: "",
      // windowWidth: 0,  //设备窗口宽度
      // windowHeight: 0,  //设备窗口高度
      splashScreenDuration: 0, //启动界面持续时间（值为0时为不显示启动界面）
      initialScreen: 0, //启动界面推出后的初始显示界面，[0: 登陆界面, 1: 注册界面, 2: 验证码界面（仅供调试）]
      splashScreenAnimation: "animate__animated animate__fadeIn", //启动界面动效
      showSplashScreen: "", //控制启动界面显示隐藏
      loginScreenAnimation: "", //登录界面动效
      username: "",
      password: "",
    };
  },
  onLoad() {},
  mounted() {
    /*
                wx.getSystemInfo({
                    success: res => {
                        [this.windowWidth, this.windowHeight] = [res.windowWidth, res.windowHeight];  //获取设备窗口尺寸
                    }
                });
     */
    setTimeout(() => {
      this.splashScreenExit();
    }, this.splashScreenDuration); //在启动界面持续时间结束后进入登录界面
  },
  methods: {
    /**
     * 启动界面退出
     */
    splashScreenExit() {
      this.splashScreenAnimation = "animate__animated animate__fadeOut";
      this.loginScreenAnimation = "animate__animated animate__fadeInUp";
      setTimeout(() => {
        this.showSplashScreen = "none"; //隐藏启动界面
      }, this.splashScreenDuration);
      switch (this.initialScreen) {
        case 0:
          setTimeout(() => {
            this.$refs["loginForm"].showLoginForm = "";
            this.$refs["loginForm"].loginFormAnimation =
              "animate__animated animate__fadeIn";
          }, 500);
          break;
        case 1:
          setTimeout(() => {
            this.$refs["registerForm"].showRegisterForm = "";
            this.$refs["registerForm"].registerFormAnimation =
              "animate__animated animate__fadeIn";
          }, 500);
          break;
        case 2:
          setTimeout(() => {
            this.$refs["captchaForm"].showCaptchaForm = "";
            this.$refs["captchaForm"].captchaFormAnimation =
              "animate__animated animate__fadeIn";
          }, 500);
          break;
      }
    },
    toRegisterScreen() {
      [
        this.$refs["loginForm"].username,
        this.$refs["loginForm"].password,
        this.username,
        this.password,
      ] = ["", "", "", ""];
      [
        this.$refs["registerForm"].email,
        this.$refs["registerForm"].phone,
        this.$refs["registerForm"].password,
      ] = ["", "", ""];
      this.$refs["registerForm"].emailInput = false;
      this.$refs["loginForm"].loginFormAnimation =
        "animate__animated animate__fadeOutLeft";
      this.$refs["registerForm"].registerFormAnimation =
        "animate__animated animate__fadeInRight";
      setTimeout(() => {
        this.$refs["registerForm"].showRegisterForm = "";
        setTimeout(() => {
          this.$refs["loginForm"].showLoginForm = "none";
        }, 300);
      }, 300);
    },
    toLoginScreen() {
      [
        this.$refs["loginForm"].username,
        this.$refs["loginForm"].password,
        this.username,
        this.password,
      ] = ["", "", "", ""];
      [
        this.$refs["registerForm"].email,
        this.$refs["registerForm"].phone,
        this.$refs["registerForm"].password,
      ] = ["", "", ""];
      this.$refs["registerForm"].registerFormAnimation =
        "animate__animated animate__fadeOutRight";
      this.$refs["loginForm"].loginFormAnimation =
        "animate__animated animate__fadeInLeft";
      setTimeout(() => {
        this.$refs["loginForm"].showLoginForm = "";
        setTimeout(() => {
          this.$refs["registerForm"].showRegisterForm = "none";
        }, 300);
      }, 300);
    },
    toCaptchaScreen() {
      this.$refs["registerForm"].registerFormAnimation =
        "animate__animated animate__fadeOutLeft";
      this.$refs["loginForm"].loginFormAnimation =
        "animate__animated animate__fadeOutLeft";
      this.$refs["captchaForm"].captchaFormAnimation =
        "animate__animated animate__fadeInRight";
      setTimeout(() => {
        this.$refs["captchaForm"].showCaptchaForm = "";
        setTimeout(() => {
          this.$refs["registerForm"].showRegisterForm = "none";
          this.$refs["captchaForm"].sendCaptcha();
        }, 300);
      }, 300);
    },
  },
  onReady() {},
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
  z-index: 9999;

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