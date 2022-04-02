<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"/>

    <view class="my-page-container">

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
        },
        computed: {
            userInfo: {
                get() {
                    return this.$store.state.userInfo;
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
            this.$refs.loading.startLoading();
            this.userId = this.$store.state.userInfo.userId ?? null;
            if (this.userId) {
                this.getMyInfo();
            }
        },
        onPullDownRefresh() {
            this.utils.throttle(() => {
                this.getMyInfo();
            }, 1000);
        },
        mounted() {

        }
    }
</script>

<style lang="scss" scoped>
  @import "myPage";
</style>