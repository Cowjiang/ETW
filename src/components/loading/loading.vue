<template>
    <view>
        <view class="loading-container">
            <view class="loading-box">

            </view>
        </view>
    </view>
</template>

<script>
    export default {
        name: "loading",
        data() {
            return {
                navigationHeight: 0, //导航栏高度
            };
        },
        methods: {

        },
        mounted() {
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
        },
    };
</script>

<style lang="scss" scoped>

</style>
