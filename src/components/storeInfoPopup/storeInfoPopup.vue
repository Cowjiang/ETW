<template>
    <view>
        <u-popup
            class="popup"
            v-model="value"
            mode="bottom"
            border-radius="30"
            :closeable="showCloseBtn"
            @open="handleOpen"
            @close="handleClose">
            <view class="store-info-container">
                <view class="image-container">
                    <view class="image">
                        LOGO
                    </view>
                </view>
                <view class="name-container">
                    <view class="name">
                        {{ info.name }}
                    </view>
                </view>
                <view class="info-container">
                    <view class="opening-time-container">
                        <view class="info-title">
                            <i class="fa fa-clock-o" aria-hidden="true"></i>
                            营业时间：
                        </view>
                        <view class="info-detail">
                            {{ info.openingTime }}
                        </view>
                    </view>
                    <view
                        class="tel-container"
                        @click="handleCallBtn">
                        <view class="info-title">
                            <i class="fa fa-phone" aria-hidden="true"></i>
                            联系电话：
                        </view>
                        <view class="info-detail">
                            {{ info.phone }}
                        </view>
                    </view>
                    <view
                        class="address-container"
                        @click="handleAddressClick">
                        <view class="info-title">
                            <i class="fa fa-map-marker" aria-hidden="true"></i>
                            店铺地址：
                        </view>
                        <view class="info-detail">
                            {{ info.addressDetails }}
                        </view>
                    </view>
                </view>
                <view class="btn-container">
                    <view class="btn-left">
                        <view
                            class="btn"
                            @click="handleCallBtn">
                            联系店家
                        </view>
                    </view>
                    <view class="btn-right">
                        <view
                            class="btn"
                            @click="handleMapBtn">
                            查看地图
                        </view>
                    </view>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script>
    /**
     * @description 店铺信息Popup组件
     * @property {Boolean} value 是否显示Popup弹窗，默认为false
     * @property {Object} info 店铺信息，必须包含name、addressDetails、phone、longitude、latitude，具体参考props中的描述
     * @property {Boolean} showCloseBtn 是否显示关闭按钮，默认为true
     * @example <storeInformation v-model="show" :info="storeInfo" @close="handleClose"></storeInformation>
     * @event open popup被打开
     * @event close popup被关闭
     */
    export default {
        name: "storeInfoPopup",
        props: {
            value: {
                type: Boolean,
                default: false
            },
            info: {
                type: Object,
                default: {
                    name: '', // {String} 店铺名字，必需
                    description: '', // {String} 店铺描述
                    imageUrl: '', // {String} 店铺Logo的Url
                    openingTime: '', // {String} 店铺营业时间，必需
                    perCost: '', // {String} 人均消费
                    areaCode: '', // {String} 行政编码
                    addressDetails: '', // {String} 店铺地址详情，必需
                    phone: '', // {String} 店铺联系电话，必需
                    weChatAccount: '', // {String} 店铺微信帐号
                    longitude: NaN, // {Number|NaN} 店铺经度，必需
                    latitude: NaN, // {Number|NaN} 店铺纬度，必需
                }
            },
            showCloseBtn: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {}
        },
        methods: {
            // popup打开事件
            handleOpen() {
                this.$emit("open");
            },
            // popup关闭事件
            handleClose() {
                this.$emit("close");
            },
            // 店铺地址点击事件
            handleAddressClick() {
                uni.setClipboardData({
                    data: this.info.addressDetails
                });
            },
            // 联系电话点击事件
            handleCallBtn() {
                if (this.info.phone !== '') {
                    uni.showActionSheet({
                        itemList: ['复制电话号码', `呼叫 ${this.info.phone}`],
                        success: res => {
                            if (res.tapIndex === 0) {
                                uni.setClipboardData({
                                    data: this.info.phone
                                });
                            }
                            else {
                                wx.makePhoneCall({
                                    phoneNumber: this.info.phone,
                                    success: res => {
                                    },
                                    fail: err => {
                                    }
                                });
                            }
                        }
                    });
                }
            },
            // 查看地图按钮点击事件
            handleMapBtn() {
                if (this.info.longitude !== NaN && this.info.latitude !== NaN) {
                    wx.openLocation({
                        latitude: this.info.latitude,
                        longitude: this.info.longitude,
                        scale: 18,
                        name: this.info.name,
                        address: this.info.addressDetails,
                        fail: err => {
                            console.error(err);
                        }
                    });
                }
            },
        },
        mounted() {
        },
        onload() {
        },
        created() {
        },
        onshow() {
        }
    }
</script>

<style lang="scss" scoped>
    .popup {
        .store-info-container {
            width: 100%;
            height: 100%;
            padding: rpx(40);
            display: flex;
            flex-direction: column;

            .image-container {
                width: 100%;
                height: fit-content;
                padding: rpx(60) 0 rpx(40);

                .image {
                    margin: 0 auto;
                    width: 20vw;
                    height: 20vw;
                    background-color: #e9e9e9;
                    border-radius: rpx(30);
                    text-align: center;
                    line-height: 20vw;
                    font-size: rpx(42);
                    font-weight: bold;
                    color: white;
                }
            }

            .name-container {
                width: 100%;
                height: fit-content;

                .name {
                    text-align: center;
                    font-size: rpx(38);
                    font-weight: bold;
                    color: #555;
                }
            }

            .info-container {
                width: 100%;
                height: fit-content;
                display: flex;
                flex-direction: column;
                margin-top: rpx(20);
                padding: rpx(40);
                font-size: rpx(26);
                color: #808080;

                .opening-time-container {
                    width: 100%;
                    height: fit-content;
                    display: flex;
                    flex-direction: row;
                    margin-bottom: rpx(36);
                }

                .tel-container {
                    width: 100%;
                    height: fit-content;
                    display: flex;
                    flex-direction: row;
                    margin-bottom: rpx(36);
                }

                .address-container {
                    width: 100%;
                    height: fit-content;
                    display: flex;
                    flex-direction: row;
                    margin-bottom: rpx(36);
                }

                .info-title {
                    white-space: nowrap;

                    .fa {
                        margin-right: rpx(10);
                    }
                }

                .info-detail {
                    word-break: break-all;
                }
            }

            .btn-container {
                width: 100%;
                height: fit-content;
                display: flex;
                flex-direction: row;
                margin-bottom: rpx(50);

                .btn {
                    width: calc(100% - 90rpx);
                    height: rpx(80);
                    border-radius: rpx(50);
                    text-align: center;
                    line-height: rpx(80);
                    font-size: rpx(30);
                }

                .btn-left {
                    width: 50%;
                    height: fit-content;

                    .btn {
                        border: rpx(2) solid #f4756b;
                        color: #f4756b;
                        margin-left: auto;
                        margin-right: rpx(30);
                    }
                }

                .btn-right {
                    width: 50%;
                    height: fit-content;

                    .btn {
                        background-color: #f4756b;
                        color: #fff;
                        margin-left: rpx(30);
                    }
                }
            }
        }
    }
</style>