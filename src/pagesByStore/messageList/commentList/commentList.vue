<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view class="comment-list-container">

    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";

    export default {
        name: "commentList",
        components: {
            navigationBar, toast, loading
        },
        data() {
            return {}
        },
        methods: {},
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '回复我的',
                backgroundColor: '#ffffff'
            });
            this.$refs.toast.show({
                text: '开发中',
                type: 'warning',
                direction: 'top'
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import 'commentList';
</style>