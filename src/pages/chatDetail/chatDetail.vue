<template>
    <view>
        <navigationBar ref="navigationBar" class="navigation-bar"/>
        <toast ref="toast" class="toast"/>
    </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';

    import {getUserInfoTemp} from "../../common/js/api/models.js";

    export default {
        components: {
            toast, navigationBar
        },
        data() {
            return {
                receiverId: '',
                receiverName: '',
            }
        },
        methods: {
            setChatBaseInfo() {
                getUserInfoTemp({
                    urlParam: this.receiverId
                }).then(res => {
                    console.log(res.data)
                    let userInfo = res.data;
                    this.receiverName = userInfo.realName;
                    this.$refs.navigationBar.setNavigation({
                        titleText: this.receiverName,
                        backgroundColor: '#ffffff'
                    });
                })
            }
        },

        computed: {},
        watch: {},
        mounted() {

        },
        onLoad() {
            this.getOpenerEventChannel().on('chatList', res => {
                this.receiverId = res.data.receiverId;
                if (this.receiverId !== '') {
                    this.setChatBaseInfo();
                }
            })
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