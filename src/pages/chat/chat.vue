<template>
    <view>
        <view class="navigation-bar-container">
            <navigationBar ref="navigationBar" class="navigation-bar"></navigationBar>
        </view>
        <chatList ref="chatList" class="chat-list"></chatList>
        <chatDetail ref="chatDetail" class="chat-detail" v-if="isShowChatDetail"></chatDetail>
    </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';
    import {chatList} from '../../components/chatList/chatList.vue';
    import {chatDetail} from '../../components/chatDetail/chatDetail.vue';

    export default {
        components: {
            toast, navigationBar, chatList, chatDetail
        },
        data() {
            return {
                isShowChatDetail: false,
            }
        },
        methods: {

        },

        computed: {

        },
        watch: {

        },
        mounted() {
            this.$refs.navigationBar.setNavigationBackgroundColor('#f4756b');
        },
        onLoad() {

        },
        onShow() {

        },
        onHide() {

        }
    }
</script>

<style lang="scss" scoped>
    .toast {
        position: absolute;
        top: rpx(150);
        width: 100%;
    }
</style>