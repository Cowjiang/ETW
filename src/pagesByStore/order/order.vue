<template>
    <view>
        <navigationBar ref="navigationBar" class="navigation-bar"/>
        <toast ref="toast"/>
        <loading ref="loading" fullscreen maskColor="#f6f6f6"></loading>
        <storeInfoPopup
            v-model="showStoreInfoPopup"
            :info="storeInfo"
            @close="showStoreInfoPopup = false">
        </storeInfoPopup>
        <selectTimePopup
            class="select-time-popup"
            v-model="showSelectTimePopup"
            :timeLimit="reservationTimeLimit"
            @cancel="showSelectTimePopup = false"
            @confirm="handleReservationTimeConfirm">
        </selectTimePopup>
        <view class="order-container">
            <view class="address-container">
                <view class="tag-container">
                    <!-- 到店自取的标签 -->
                    <view
                        class="tag--default"
                        :class="isTakeOut ? 'tag--unselect tag-left--unselect' : 'tag--selected tag-left--selected'"
                        data-name="tagLeft"
                        @click="handleChangeTags">
                        到店自取
                    </view>
                    <!-- 外卖配送的标签 -->
                    <view
                        class="tag--default tag--right"
                        :class="isTakeOut ? 'tag--selected tag-right--selected' : 'tag--unselect tag-right--unselect'"
                        data-name="tagRight"
                        @click="handleChangeTags">
                        外卖配送
                    </view>
                </view>
                <view class="content-container">
                    <!-- 到店自取的内容 -->
                    <view
                        class="content--default content-left"
                        v-if="!isTakeOut">
                        <view class="store-info-container" @click="handleAddressClick">
                            <view class="store-avatar">

                            </view>
                            <view class="store-details">
                                <view class="store-name">
                                    {{ storeInfo.name }}
                                </view>
                                <view class="store-address">
                                    <i class="fa fa-map-marker" aria-hidden="true"></i>
                                    {{ storeInfo.addressDetails }}
                                </view>
                            </view>
                            <view class="store-btn">
                                <i class="fa fa-angle-right" aria-hidden="true"></i>
                            </view>
                        </view>
                        <view class="contact-info-container">
                            <view class="contact-name">
                                <view class="contact-title--default">
                                    <i class="fa fa-user" aria-hidden="true"></i>
                                </view>
                                <view
                                    class="contact-placeholder--default name-placeholder"
                                    :style="{opacity: `${contactName === '' ? '1' : '0'}`}"
                                    @click="handleContactNameFocus">
                                    请输入姓名
                                    <i class="fa fa-angle-right" aria-hidden="true"></i>
                                </view>
                                <view
                                    class="contact-value">
                                    <input
                                        type="text"
                                        v-model="contactName"
                                        maxlength="10">
                                </view>
                            </view>
                            <view class="contact-phone">
                                <view class="contact-title--default">
                                    <i class="fa fa-mobile" aria-hidden="true"></i>
                                </view>
                                <view
                                    class="contact-placeholder--default"
                                    :style="{opacity: `${contactPhone === '' ? '1' : '0'}`}"
                                    @click="handleContactPhoneFocus">
                                    请输入手机号
                                    <i class="fa fa-angle-right" aria-hidden="true"></i>
                                </view>
                                <view
                                    class="contact-value">
                                    <input
                                        type="number"
                                        v-model="contactPhone"
                                        maxlength="11">
                                </view>
                            </view>
                        </view>
                        <view class="time-container" @click="handleReservationTimeClick">
                            <view class="contact-title--default">
                                <i class="fa fa-clock-o" aria-hidden="true"></i>
                            </view>
                            <view class="contact-placeholder--default">
                                {{ reservationTime === '' ? '请选择自取时间' : '自取时间' }}
                                <i class="fa fa-angle-right" aria-hidden="true"></i>
                            </view>
                            <view
                                class="contact-value"
                                v-if="reservationTime !== ''">
                                {{ reservationTime }}
                            </view>
                        </view>
                    </view>
                    <!-- 外卖配送的内容 -->
                    <view
                        class="content--default content-right"
                        v-if="isTakeOut">

                    </view>
                </view>
            </view>
            <view class="order-details-container">

            </view>
            <view class="order-options-container">

            </view>
        </view>
    </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';
    import {loading} from '../../components/loading/loading.vue';
    import {storeInfoPopup} from '../../components/storeInfoPopup/storeInfoPopup.vue'
    import {selectTimePopup} from '../../components/selectTimePopup/selectTimePopup.vue'

    export default {
        components: {
            toast, navigationBar, loading, storeInfoPopup, selectTimePopup
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                isTakeOut: false, //是否外送
                storeInfo: {
                    name: '必胜客（太平店）', // {String} 店铺名字，必需
                    addressDetails: '广东省广州市从化区太平镇乐东路385号（峰达电器城旁）', // {String} 店铺地址详情，必需
                    phone: '020-88900280', // {String} 店铺联系电话，必需
                    openingTime: '工作日9:00-21:00，节假日9:00-24:00',  // {String} 店铺营业时间，必需
                    longitude: 113.492195, // {Number|NaN} 店铺经度，必需
                    latitude: 23.452394, // {Number|NaN} 店铺纬度，必需
                    areaCode: '440103', // {String} 行政编码
                    imageUrl: '', // {String} 店铺Logo的Url
                },
                contactName: '',
                contactPhone: '',
                reservationTime: '', //10:30 - 11:00
                contactNameFocus: false,
                contactPhoneFocus: false,
                showStoreInfoPopup: false,
                showSelectTimePopup: false,
                reservationTimeLimit: '',
            }
        },
        methods: {
            handleChangeTags(e) {
                this.isTakeOut = e.currentTarget.dataset.name !== 'tagLeft';
            },
            handleAddressClick() {
                this.showStoreInfoPopup = true;
            },
            handleContactNameFocus() {
                this.contactNameFocus = true;
            },
            handleContactPhoneFocus() {
                this.contactPhoneFocus = true;
            },
            handleReservationTimeClick() {
                this.reservationTimeLimit = `9:00-21:00`;
                this.showSelectTimePopup = true;
            },
            handleReservationTimeConfirm(e) {
                this.showSelectTimePopup = false;
                this.reservationTime = e[0].label;

            }
        },
        computed: {},
        filters: {},
        watch: {},
        mounted() {
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
                titleText: '确认订单',
                backgroundColor: '#f6f6f6'
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
    /deep/ .select-time-popup {
        .u-drawer-content {
            border-radius: rpx(30) !important;
        }

        .u-select__body__picker-view__item {
            font-size: rpx(34);
        }

        .u-select__body {
            height: 25vh !important;
        }
    }

    .order-container {
        width: 100vw;
        height: 100vh;
        background-color: #f6f6f6;

        .address-container {
            width: 90%;
            height: fit-content;
            margin-left: 5%;
            display: flex;
            flex-direction: column;

            .tag-container {
                width: 100%;
                height: rpx(80);
                position: relative;
                top: rpx(40);
                display: flex;
                flex-direction: row;
                background-color: #fff;
                border-radius: rpx(30) rpx(30) 0;

                .tag--default {
                    text-align: center;
                    color: #333;
                    transition-property: color, background-color, font-size, font-weight;
                    transition-duration: 0ms;
                }

                .tag--unselect {
                    width: 100%;
                    height: rpx(80);
                    font-size: rpx(28);
                    line-height: rpx(80);
                    background-color: #ededed;
                }

                .tag--selected {
                    width: 100%;
                    height: rpx(100);
                    position: relative;
                    top: rpx(-20);
                    font-size: rpx(30);
                    line-height: rpx(100);
                    font-weight: bold;
                    color: #f4756b;
                    background-color: #fff;
                }

                .tag-left--selected {
                    border-radius: rpx(30) rpx(30) 0 0;
                }

                .tag-left--unselect {
                    border-radius: rpx(30) 0 rpx(30) 0;
                }

                .tag-right--selected {
                    border-radius: rpx(30) rpx(30) 0 0;
                }

                .tag-right--unselect {
                    border-radius: 0 rpx(30) 0 rpx(30);
                }
            }

            .content-container {
                width: 100%;
                height: fit-content;
                margin-top: rpx(40);
                background-color: #fff;
                border-radius: 0 0 rpx(30) rpx(30);

                .content--default {
                    padding: rpx(40);
                }

                .content-left {

                    .store-info-container {
                        width: 100%;
                        height: fit-content;
                        display: flex;
                        flex-direction: row;
                        border-bottom: rpx(2) solid #f3f3f3;

                        .store-avatar {
                            width: rpx(130);
                            height: rpx(130);
                            border-radius: rpx(20);
                            background-color: orange;
                            display: none;
                        }

                        .store-details {
                            width: calc(100% - 42rpx);
                            height: fit-content;
                            //margin-left: rpx(30);

                            .store-name {
                                font-size: rpx(36);
                                color: #333;
                            }

                            .store-address {
                                margin-top: rpx(10);
                                margin-bottom: rpx(36);
                                font-size: rpx(26);
                                color: #808080;
                                text-overflow: -o-ellipsis-lastline;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                display: -webkit-box;
                                line-clamp: 2;
                                -webkit-line-clamp: 2;
                                -webkit-box-orient: vertical;

                                .fa-map-marker {
                                    margin-right: rpx(12);
                                }
                            }
                        }

                        .store-btn {
                            width: rpx(36);
                            height: 100%;
                            position: relative;
                            left: rpx(6);
                            font-size: rpx(54);
                            line-height: rpx(130);
                            text-align: right;
                            align-items: center;
                            color: #aaa;
                        }
                    }

                    .contact-info-container {
                        width: 100%;
                        height: rpx(120);
                        border-bottom: rpx(2) solid #f3f3f3;
                        display: flex;
                        flex-direction: row;
                        padding: rpx(26) 0;
                        text-overflow: ellipsis;
                        overflow: hidden;

                        .contact-name {
                            width: 50%;
                            height: 100%;
                            border-right: rpx(2) solid #f3f3f3;
                            padding-right: rpx(18);
                            overflow: hidden;

                            .contact-value {
                                left: rpx(46) !important;
                                top: rpx(-56) !important;

                                input {
                                    width: calc(100% - 60rpx);
                                }
                            }
                        }

                        .contact-phone {
                            width: 50%;
                            height: 100%;
                            padding-left: rpx(18);
                            overflow: hidden;

                            .contact-value {
                                left: rpx(40) !important;
                                top: rpx(-56) !important;

                                input {
                                    width: calc(100% - 60rpx);
                                }
                            }
                        }

                        .contact-title--default {
                            font-size: rpx(32);
                            color: #808080;
                            display: inline;
                            line-height: rpx(66);

                            .fa {
                                position: relative;
                            }

                            .fa-user {
                                top: rpx(2);
                                font-size: rpx(38);
                            }

                            .fa-mobile {
                                top: rpx(4);
                                font-size: rpx(48);
                            }
                        }

                        .contact-placeholder--default {
                            display: inline;
                            position: relative;
                            top: rpx(-2);
                            left: rpx(20);
                            font-size: rpx(28);
                            color: #808080;
                            line-height: rpx(66);

                            .fa-angle-right {
                                position: relative;
                                top: rpx(2);
                                margin-left: rpx(10);
                                font-size: rpx(36);
                            }
                        }

                        .contact-value {
                            display: inline;
                            position: relative;
                            top: rpx(-2);
                            left: rpx(20);
                            font-size: rpx(30);
                            color: #111;
                            line-height: rpx(66);
                            //font-weight: bold;
                        }
                    }

                    .time-container {
                        width: 100%;
                        height: rpx(120);
                        border-bottom: rpx(2) solid #f3f3f3;
                        display: flex;
                        flex-direction: row;
                        padding: rpx(26) 0;
                        text-overflow: ellipsis;
                        overflow: hidden;

                        .contact-title--default {
                            font-size: rpx(32);
                            color: #808080;
                            display: inline;
                            line-height: rpx(66);

                            .fa {
                                font-size: rpx(38);
                            }
                        }

                        .contact-placeholder--default {
                            display: inline;
                            position: relative;
                            top: rpx(-2);
                            left: rpx(20);
                            font-size: rpx(28);
                            color: #808080;
                            line-height: rpx(66);

                            .fa-angle-right {
                                position: relative;
                                top: rpx(2);
                                margin-left: rpx(10);
                                font-size: rpx(36);
                            }
                        }

                        .contact-value {
                            display: inline;
                            position: relative;
                            top: rpx(-2);
                            left: rpx(40);
                            font-size: rpx(30);
                            line-height: rpx(66);

                            .fa-angle-right {
                                margin-left: rpx(20);
                                font-size: rpx(36);
                                color: #808080;
                            }
                        }
                    }
                }

                .content-right {

                }
            }
        }

        .order-details-container {
            width: 90%;
            height: rpx(600);
            margin: rpx(20) 0 0 5%;
            background-color: #fff;
            border-radius: rpx(30);
        }

        .order-options-container {
            width: 90%;
            height: rpx(200);
            margin: rpx(20) 0 0 5%;
            background-color: #fff;
            border-radius: rpx(30);
        }
    }
</style>