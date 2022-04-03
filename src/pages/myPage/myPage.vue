<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"/>

    <view
      class="my-page-container"
      :style="{paddingTop: `${navigationHeight}px`}">
      <!-- 用户信息容器 -->
      <view
        v-if="userId"
        class="user-info-container">

      </view>
      <!-- 未登录时显示的登录按钮区域 -->
      <view
        v-else
        class="user-login-container">
        <view class="login-tips">
          <text class="tips_title">Hi~ 欢迎来到周边大侦探</text>
          <text class="tips_desc">登录后体验更多功能</text>
        </view>
        <view class="login-btn" @click="getMyInfo">
          登录 / 注册
        </view>
      </view>
      <!-- 横排按钮容器 -->
      <view class="horizontal-btn-container">

      </view>
      <!-- 竖排按钮容器 -->
      <view class="vertical-btn-container">
        <view class="btn_row">
          <view class="btn_title">
            <i class="far fa-chart-bar"/>
            <text>我的动态</text>
          </view>
          <view class="btn_angle-icon">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="btn_row">
          <view class="btn_title">
            <i class="far fa-star"/>
            <text>我的收藏</text>
          </view>
          <view class="btn_angle-icon">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view
          class="btn_row"
          @click="goto('/pagesByStore/userPage/subpages/friendList/friendList?type=1')">
          <view class="btn_title">
            <i class="far fa-address-book"/>
            <text>我的好友</text>
          </view>
          <view class="btn_angle-icon">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view
          class="btn_row"
          @click="goto('/pagesByStore/myUserProfile/myUserProfile')">
          <view class="btn_title">
            <i class="far fa-address-card"/>
            <text>我的资料</text>
          </view>
          <view class="btn_angle-icon">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view
          class="btn_row"
          @click="goto('/pagesByStore/addressBook/addressBook')">
          <view class="btn_title">
            <i class="far fa-map"/>
            <text>我的地址</text>
          </view>
          <view class="btn_angle-icon">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view
          v-if="shopkeeper && userId"
          class="btn_row">
          <view class="btn_title">
            <i class="fas fa-store"/>
            <text>我的店铺</text>
          </view>
          <view class="btn_angle-icon">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="btn_row">
          <view class="btn_title">
            <i class="far fa-envelope"/>
            <text>联系客服</text>
          </view>
          <view class="btn_angle-icon">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="btn_row">
          <view class="btn_title">
            <i class="far fa-face-smile"></i>
            <text>关于我们</text>
          </view>
          <view class="btn_angle-icon">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loading from "@/components/loading/loading";
    import {getMyProfile} from "@/common/js/api/models";

    export default {
        name: "myPage",
        components: {
            toast, navigationBar, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                userId: null, //我的用户ID
                userDetailInfo: {}, //我的用户详细信息
            }
        },
        methods: {
            getMyInfo() {
                getMyProfile().then(res => {
                    if (res.success) {
                        this.userDetailInfo = res.data;
                    }
                    else throw new Error(res);
                }).catch(err => {
                    console.error(err);
                    this.$refs.toast.show({
                        text: '获取数据失败',
                        type: 'error',
                        direction: 'top'
                    });
                }).finally(() => {
                    this.$refs.loading.stopLoading();
                    uni.stopPullDownRefresh();
                });
            },
            /**
             * 跳转页面
             * @param {String} url 页面Url
             */
            goto(url) {
                uni.navigateTo({
                    url: url,
                    fail: error => {
                        console.error(error);
                    }
                });
            },
        },
        computed: {
            userInfo: {
                get() {
                    return this.$store.state.userInfo;
                }
            },
            shopkeeper: {
                get() {
                    return this.$store.state.shopkeeper;
                }
            }
        },
        onPullDownRefresh() {
            this.utils.throttle(() => {
                this.getMyInfo();
            }, 1000);
        },
        onShow() {
            if (this.$store.state.userInfo) {
                if ((this.userId = this.$store.state.userInfo.userId ?? null)) {
                    this.$refs.loading.startLoading();
                    this.getMyInfo();
                }
            }
        },
        onLoad() {
            this.$refs.navigationBar.setNavigation({
                titleText: '',
                isShowButton: false
            });
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
        },
        mounted() {

        }
    }
</script>

<style lang="scss" scoped>
  @import "myPage";
</style>