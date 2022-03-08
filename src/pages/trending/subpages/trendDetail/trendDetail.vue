<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view class="trend-detail-container">

    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";

    export default {
        name: "trendDetail",
        components: {
            navigationBar, toast, loading
        },
        data() {
            return {
                trendDetail: [],
            }
        },
        methods: {
            getTrendDetail() {

            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '动态详情',
                backgroundColor: '#fff',
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import "trendDetail";
</style>