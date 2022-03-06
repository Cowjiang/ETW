<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>

    <view
      class="my-user-profile-container"
      :style="{height: `${windowHeight - navigationHeight}px`}">
      <view class="profile-container">
        <view class="profile-row">
          <view class="row-title">
            头像
          </view>
          <view class="row-content">
            <image
              class="avatar"
              :src="userProfile.avgPath"
              mode="aspectFill"/>
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            用户名
          </view>
          <view class="row-content">
            {{ userProfile.username }}
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            性别
          </view>
          <view class="row-content">
            {{ userProfile.gender | formatGender }}
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            生日
          </view>
          <view class="row-content">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            手机号
          </view>
          <view class="row-content">

          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            绑定微信
          </view>
          <view class="row-content">
            已绑定
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            我的地址
          </view>
          <view
            class="row-content"
            @click="toAddressBook">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
      </view>
      <view class="logout-button-container">
        <view
          class="btn__default"
          @click="logout">
          退出登录
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import {logOut} from "@/common/js/api/models";

    export default {
        name: "myUserProfile",
        components: {
            toast, navigationBar
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                userProfile: {}, //个人资料信息
            }
        },
        methods: {
            // 跳转地址簿
            toAddressBook() {
                uni.navigateTo({
                    url: '/pages/addressBook/addressBook'
                });
            },
            // 退出登录
            async logout() {
                await logOut();
                await uni.removeStorage({
                    key: 'cookie'
                });
                await uni.removeStorage({
                    key: 'userInfo'
                });
                uni.navigateTo({
                    url: '/pages/index/index'
                });
            },
        },
        filters: {
            formatGender(gender) {
                return gender === 1 ? '男' : gender === 2 ? '女' : '';
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '个人资料',
                backgroundColor: '#f6f6f6'
            });
        },
        async onLoad() {
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                },
            }); //获取窗口尺寸
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
            await uni.getStorage({
                key: 'userInfo',
                success: res => {
                    this.userProfile = res.data;
                },
                fail: () => {
                    const currentPage = this.utils.getCurrentPage();
                    uni.redirectTo({
                        url: `/pages/login/wxLogin?redirectPath=${currentPage.curUrl}`
                    });
                }
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import 'myUserProfile';
</style>