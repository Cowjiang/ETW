<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view class="notice-list-container">
      <view class="no-result">
        <text>一条通知也没有哦 ~</text>
      </view>
    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";

    export default {
        name: "noticeList",
        components: {
            navigationBar, toast, loading
        },
        data() {
            return {}
        },
        methods: {},
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '通知消息',
                backgroundColor: '#ffffff'
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import 'noticeList';
</style>