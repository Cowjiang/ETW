<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view class="user-page-container">
      <view class="user-info-container">
        <view class="cover-image-container">
          <image
            class="cover-image"
            :src="userInfo.coverUrl"
            mode="aspectFill"/>
        </view>
      </view>
      <view class="content-container">

      </view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loading from "@/components/loading/loading";
    import {getUserSimpleInfo, getUserTrendList} from "@/common/js/api/models";

    export default {
        name: "userPage",
        components: {
            toast, navigationBar, loading
        },
        data() {
            return {
                userId: '', //用户Id
                userInfo: {}, //用户的信息
            }
        },
        methods: {
            // 获取用户信息
            async getUserInfo() {
                if (!!this.userId) {
                    await getUserSimpleInfo({
                        urlParam: {
                            userId: this.userId,
                            extend: true
                        }
                    }).then(res => {
                        if (res.success) {
                            console.log(res);
                            this.userInfo = res.data;
                        }
                        else throw new Error(res);
                    }).catch(error => {
                        console.error(error);
                    });
                }
            },
            // 获取用户的动态列表
            async getUserTrendList() {
                if (!!this.userId) {
                    await getUserTrendList({
                        urlParam: {
                            userId: this.userId,
                        }
                    }).then(res => {
                        if (res.success) {
                            console.log(res);
                        }
                        else throw new Error(res);
                    }).catch(error => {
                        console.error(error);
                    });
                }
            }
        },
        async onLoad() {
            this.$refs.loading.startLoading();
            this.userId = this.utils.getCurrentPage().curParam.userId || null;
            if (!this.userId) {
                if (!(this.userId = uni.getStorageSync('userInfo').userId || null)) {
                    uni.getStorage({
                        key: 'userInfo',
                        success: res => {
                            this.userId = res.data.userId;
                        },
                        fail: () => {
                            const currentPage = this.utils.getCurrentPage();
                            this.$store.commit('currentPageUrl', currentPage.curFullUrl);
                            uni.redirectTo({
                                url: `/pages/login/wxLogin`
                            });
                        }
                    });
                }
            }
            await this.getUserInfo();
            await this.getUserTrendList();
            setTimeout(() => {
                this.$refs.loading.stopLoading();
            }, 300);
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '',
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import "userPage";
</style>