<template>
    <view>
        <navigationBar ref="navigationBar" class="navigation-bar"/>
        <toast ref="toast" class="toast"/>

        <view class="chat-list-container">

        </view>
    </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';

    export default {
        components: {
            toast, navigationBar
        },
        data() {
            return {}
        },
        methods: {
            toChatDetail() {
                // uni.navigateTo({
                //     url: '../chatDetail/chatDetail',
                //     success: res => {
                //         res.eventChannel.emit('chatList', {
                //             data:
                //                 {
                //                     receiverId: 0
                //                 }
                //         })
                //     }
                // })
            }
        },
        computed: {},
        watch: {},
        mounted() {
            // this.$refs.navigationBar.setNavigationBackgroundColor('#f4756b');
            this.$refs.navigationBar.setNavigation({
                titleText: 'chat list',
                backgroundColor: '#ffffff'
            });
        },
        onLoad() {

        },
        onShow() {
            // getMyChatList({
            //     queryData: {
            //         pageNumber: 1,
            //         pageSize: 4
            //     },
            // }).then(res => {
            //     console.log(res.data)
            // })

            // getChatHistory({
            //     urlParam: 0
            // }).then(res => {
            //     console.log(res.data)
            // })
        },
        onHide() {

        }
    }
</script>

<style lang="scss" scoped>
</style>