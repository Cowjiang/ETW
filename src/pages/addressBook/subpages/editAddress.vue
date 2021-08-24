<template>
    <view>
        <navigationBar ref="navigationBar" class="navigation-bar"/>
        <toast ref="toast"/>
        <loading ref="loading" fullscreen></loading>
        <view class="address-container">
            <selectArea ref="selectArea" v-model="show" @cancel="pickerConfirm" @confirm="pickerConfirm"></selectArea>
        </view>
    </view>
</template>

<script>
    import {toast} from '../../../components/toast/toast.vue';
    import {navigationBar} from '../../../components/navigationBar/navigationBar.vue';
    import {loading} from '../../../components/loading/loading.vue';
    import {getArea} from "../../../common/js/api/models.js";
    import {selectArea} from '../../../components/selectArea/selectArea.vue';

    export default {
        components: {
            toast, navigationBar, loading, selectArea
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                show: true,
            }
        },
        methods: {
            mapLocation() {
                uni.navigateTo({
                    url: "/pages/amap/amap",
                    events: {
                        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
                        acceptDataFromOpenedPage: (data) => {
                            if (data) {
                                console.log(data)
                            }
                        },
                    },
                });
            },
            pickerConfirm(e) {
                console.log(e)
            }
        },
        computed: {},
        filters: {},
        watch: {},
        mounted() {
            // this.mapLocation();
            // getArea({
            //     urlParam: {
            //         provinceId: 44,
            //         cityId: 1
            //     }
            // })
            //     .then(res => {
            //         console.log(res)
            //     })
            //     .catch(err => {
            //         console.log(err)
            //     });
            this.$refs.selectArea.init();
        },
        onLoad() {
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                },
            }); //获取窗口尺寸
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
        },
        onShow() {
            this.$refs.navigationBar.setNavigation({
                titleText: '编辑地址',
                backgroundColor: '#ffffff'
            });
        },
        onHide() {

        },
        onUnload() {

        },
        beforeDestroy() {

        }
    }
</script>

<style lang="scss" scoped>
    .chat-list-container {
        width: 100vw;
        height: 100vh;
        background-color: #f6f6f6;

        .list-scroll-view {
            width: 100vw;
            height: fit-content;

            .top-list-container {
                width: 100vw;
                height: fit-content;
                background-color: #fff;
                border-radius: rpx(30);
                margin-bottom: rpx(20);
                padding: rpx(40) rpx(20);
                display: flex;
                flex-direction: row;

                .btn-container {
                    flex: 1;
                    margin: 0 rpx(30);
                    text-align: center;

                    .btn-icon-container {
                        width: rpx(80);
                        height: rpx(80);
                        margin: 0 auto rpx(20);
                        pointer-events: none;

                        .btn-icon {
                            width: 100%;
                            height: 100%;
                            background-color: deepskyblue;
                            border-radius: rpx(150);
                        }

                        .btn-unread {
                            width: rpx(25);
                            height: rpx(25);
                            position: relative;
                            top: rpx(-80);
                            left: rpx(55);
                            background-color: #f35b56;
                            color: #fff;
                            text-align: center;
                            font-size: rpx(22);
                            line-height: rpx(40);
                            border-radius: rpx(150);
                        }
                    }

                    .btn-title {
                        font-size: rpx(26);
                        color: #333;
                    }
                }
            }

            .main-list-container {
                width: 100vw;
                height: fit-content;
                background-color: #fff;
                border-radius: rpx(30);

                .message-container:first-child {
                    border-top: none;
                    border-radius: rpx(30) rpx(30) 0 0;
                }

                .message-container:last-child {
                    border-radius: 0 0 rpx(30) rpx(30);
                }

                .message-container {
                    width: 100vw;
                    height: rpx(150);
                    background-color: #fff;
                    padding: 0 rpx(30);
                    display: flex;
                    flex-direction: row;
                    border-top: rpx(1) solid #f6f6f6;

                    .avatar-container {
                        width: rpx(120);
                        height: 100%;
                        margin-top: rpx(30);
                        pointer-events: none;

                        .avatar {
                            width: rpx(90);
                            height: rpx(90);
                            border-radius: rpx(150);
                            //background-color: orange;
                            overflow: hidden;

                            image {
                                width: 100%;
                            }
                        }
                    }

                    .content-container {
                        flex: 1;
                        overflow: hidden;
                        white-space: nowrap;
                        margin: auto 0;
                        pointer-events: none;

                        .sender-name {
                            display: flex;
                            flex-direction: row;

                            .name {
                                font-size: rpx(32);
                                line-height: rpx(50);
                                color: #333;
                                text-overflow: ellipsis;
                                overflow: hidden;
                                max-width: calc(100% - 110rpx);
                            }

                            .blacklist-user {
                                position: relative;
                                top: rpx(12);
                                width: fit-content;
                                height: rpx(28);
                                margin-left: rpx(15);
                                padding: 0 rpx(10);
                                font-size: rpx(20);
                                line-height: rpx(28);
                                color: #fff;
                                border-radius: rpx(30);
                                background-color: #f4756b;
                            }
                        }

                        .message-content {
                            overflow: hidden;
                            font-size: rpx(26);
                            line-height: rpx(50);
                            color: #999999;
                        }
                    }

                    .time-container {
                        width: fit-content;
                        height: fit-content;
                        margin-top: rpx(30);
                        margin-left: auto;
                        pointer-events: none;

                        .time {
                            font-size: rpx(24);
                            color: #999999;
                            margin-bottom: rpx(20);
                        }

                        .unread {
                            width: fit-content;
                            min-width: rpx(32);
                            height: rpx(32);
                            padding: 0 rpx(8);
                            background-color: #f35b56;
                            color: #fff;
                            text-align: center;
                            font-size: rpx(22);
                            line-height: rpx(32);
                            border-radius: rpx(150);
                            font-weight: bold;
                            float: right;
                        }

                        .isread {
                            min-width: rpx(40);
                            height: rpx(40);
                            float: right;
                        }
                    }
                }

                .load-more {
                    font-size: rpx(28);
                    height: fit-content;
                    text-align: center;
                    width: 100%;
                    color: $uni-text-color-placeholder;
                    background-color: #fff;
                    margin-top: rpx(30);
                    padding-bottom: rpx(70);

                    text {
                        margin-left: rpx(10);
                    }
                }

                .loading-more {
                    height: rpx(150);
                    padding-bottom: 0;
                    margin-top: 0;
                }
            }

            .no-more-chats {
                width: 100vw;
                height: rpx(100);
                font-size: rpx(24);
                color: #999999;
                line-height: rpx(100);
                text-align: center;
                background-color: #f6f6f6;
            }
        }
    }
</style>