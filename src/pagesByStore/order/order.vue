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
                        <view class="my-address-container" @click="selectMyAddress">
                            <view class="my-address">
                                <view class="address-tips" v-if="Object.keys(takeOutInfo).length === 0">
                                    选择收货地址
                                </view>
                                <view class="address-detail" v-if="Object.keys(takeOutInfo).length !== 0">
                                    {{ takeOutInfo.addressDetail }}
                                </view>
                                <view class="contact-info" v-if="Object.keys(takeOutInfo).length !== 0">
                                    {{ takeOutInfo.contactName | formatContactName }} {{ takeOutInfo.contactPhone }}
                                </view>
                            </view>
                            <view class="my-address-btn">
                                <i class="fa fa-angle-right" aria-hidden="true"></i>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="order-details-container">
                <view class="store-title-container">
                    <view class="store-title-avatar">
                        <view class="avatar"></view>
                    </view>
                    <view class="store-title-name">
                        {{ storeInfo.name }}
                    </view>
                </view>
                <view class="order-content-container">
                    <view
                        class="commodity-container"
                        v-for="(commodity, index) in orderContent"
                        :key="index">
                        <view class="commodity-image-container">
                            <view class="commodity-image"></view>
                        </view>
                        <view class="commodity-info-container">
                            <view class="commodity-name">
                                {{ commodity.name }}
                            </view>
                            <view class="commodity-description">
                                {{ commodity.description }}
                            </view>
                            <view class="commodity-tags">

                            </view>
                        </view>
                        <view class="commodity-price-container">
                            <view class="commodity-price">
                                <view class="origin-price" v-if="commodity.discountPrice !== null">
                                    {{ commodity.originPrice | showPrice }}
                                </view>
                                <view class="discount-price">
                                    {{
                                        commodity.discountPrice === null ? commodity.originPrice : commodity.discountPrice | showPrice
                                    }}
                                </view>
                            </view>
                            <view class="commodity-amount">
                                {{ commodity.amount | showAmount }}
                            </view>
                        </view>
                    </view>
                    <view class="order-price-container">
                        <view class="delivery-price">
                            配送费
                            <view class="price">
                                {{ deliveryFee | showPrice }}
                            </view>
                        </view>
                        <view class="packaging-price">
                            打包费
                            <view class="price">
                                {{ packagingFee | showPrice }}
                            </view>
                        </view>
                        <view class="coupon">
                            优惠券
                            <view class="coupon-tag">
                                券
                            </view>
                            <view class="select-coupon__default">
                                暂无可用
                                <i class="fa fa-angle-right" aria-hidden="true"></i>
                            </view>
                        </view>
                    </view>
                    <view class="total-price-container">
                        <view class="total-price-description">
                            共 {{ commodityCount }} 件商品，合计
                            <view class="total-price">
                                {{ totalPrice | showPrice }}
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="order-options-container">
                <view class="remark">
                    备注
                    <view class="select-remark__default">
                        口味、餐具数量等
                        <i class="fa fa-angle-right" aria-hidden="true"></i>
                    </view>
                </view>
                <view class="payment-method">
                    支付方式
                    <view class="select-payment-method__default">
                        在线支付
                    </view>
                </view>
            </view>
            <view class="fixed-bar-container">
                <view class="discount-price">
                    已优惠
                    {{ totalDiscount | showPrice }}
                </view>
                <view class="total-price">
                    <text style="font-size: 30rpx">
                        ￥
                        <text style="font-size: 42rpx">
                            {{ parseInt(orderPrice) }}.
                            <text style="font-size: 30rpx">
                                {{ orderPrice.toString().split('.')[1] || '00' }}
                            </text>
                        </text>
                    </text>
                </view>
                <view class="pay-btn">
                    支付
                </view>
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
                }, //店铺信息
                contactName: '', //到店自取联系人姓名
                contactPhone: '', //到店自取联系人电话
                reservationTime: '', //到店自取预留的自取时间
                contactNameFocus: false, //到店自取联系人姓名输入框聚焦状态
                contactPhoneFocus: false, //到店自取联系人电话输入框聚焦状态
                showStoreInfoPopup: false, //是否显示店铺信息弹窗组件
                showSelectTimePopup: false, //是否显示时间选择弹窗组件
                reservationTimeLimit: '',
                takeOutInfo: {}, //外卖收货人信息
                orderContent: [
                    {
                        id: 1,
                        imageUrl: '', // {String} 商品图片Url
                        name: '超值浓情烤翅[2只]', // {String} 商品名称
                        description: '', // {String} 商品规格/描述
                        originPrice: 15, // {Number} 商品单价原价
                        discountPrice: 12.99, // {Number|null} 商品单价优惠折扣后价格（若无则为null）
                        amount: 1, // {Number} 商品数量
                        tags: [], // {Array} 商品小标签
                    },
                    {
                        id: 15,
                        imageUrl: '',
                        name: '榴莲菠菠块块果肉比萨[手拍][普装]',
                        description: '加倍芝士',
                        originPrice: 59,
                        discountPrice: null,
                        amount: 2,
                        tags: [],
                    },
                    {
                        id: 22,
                        imageUrl: '',
                        name: '雪山多肉青提',
                        description: '冰沙；中杯；五分糖；加奶盖；榴莲菠菠块块果肉比萨',
                        originPrice: 32,
                        discountPrice: null,
                        amount: 1,
                        tags: [],
                    }
                ], //订单商品内容
                deliveryFee: 5, // {Number} 配送费
                packagingFee: 0, // {Number} 打包费
                orderPrice: 0, //订单总金额
            }
        },
        methods: {
            // 切换自取/外送标签
            handleChangeTags(e) {
                this.contactName = '';
                this.contactPhone = '';
                this.reservationTime = '';
                this.takeOutInfo = {};
                this.isTakeOut = e.currentTarget.dataset.name !== 'tagLeft';
            },
            //店铺地址点击事件
            handleAddressClick() {
                this.showStoreInfoPopup = true;
            },
            //到店自取联系人姓名聚焦事件
            handleContactNameFocus() {
                this.contactNameFocus = true;
            },
            //到店自取联系人电话聚焦事件
            handleContactPhoneFocus() {
                this.contactPhoneFocus = true;
            },
            //预约到店时间点击事件
            handleReservationTimeClick() {
                this.reservationTimeLimit = `9:00-21:00`;
                this.showSelectTimePopup = true;
            },
            //预约到店时间确认事件
            handleReservationTimeConfirm(e) {
                this.showSelectTimePopup = false;
                this.reservationTime = e[0].label;
            },
            //外卖配送选择收货地址
            selectMyAddress() {
                uni.showActionSheet({
                    itemList: ['从地址簿中选择', '新建地址'],
                    success: res => {
                        if (res.tapIndex === 0) {
                            uni.navigateTo({
                                url: "/pages/addressBook/addressBook",
                                events: {
                                    acceptDataFromOpenedPage: data => {
                                        if (data) {
                                            this.takeOutInfo = data.address;
                                        }
                                    },
                                },
                                success(res) {
                                    res.eventChannel.emit('selectAddress', {data: true})
                                }
                            });
                        }
                        else {
                            uni.navigateTo({
                                url: "/pages/addressBook/subpages/editAddress",
                                events: {
                                    acceptDataFromOpenedPage: data => {
                                        if (data) {
                                            this.tackOutInfo = {
                                                id: data.address.id,
                                                contactName: data.address.contacts,
                                                contactPhone: data.address.phone,
                                                addressDetail: data.address.addressDetail,
                                                areaCode: data.address.areaCode
                                            };
                                        }
                                    },
                                },
                                success(res) {
                                    res.eventChannel.emit('selectAddress', {data: true})
                                }
                            });
                        }
                    }
                });
            }
        },
        computed: {
            /**
             * 商品总数
             * @return {Number} 计算的商品总数
             */
            commodityCount() {
                let totalCount = 0;
                this.orderContent.forEach((v, k) => {
                    totalCount += v.amount;
                });
                return totalCount;
            },
            /**
             * 订单总价
             * @return {Number} 计算的订单总价
             */
            totalPrice() {
                let totalPrice = 0;
                this.orderContent.forEach((v, k) => {
                    totalPrice += (v.discountPrice === null ? v.originPrice : v.discountPrice) * v.amount;
                });
                totalPrice = totalPrice + this.deliveryFee + this.deliveryFee;
                this.orderPrice = totalPrice;
                return totalPrice;
            },
            /**
             * 订单总优惠价格
             * @return {Number} 计算后的订单总优惠价
             */
            totalDiscount() {
                let totalDiscount = 0;
                this.orderContent.forEach((v, k) => {
                    if (v.discountPrice !== null) {
                        totalDiscount = totalDiscount + (v.originPrice - v.discountPrice);
                    }
                });
                return totalDiscount;
            }
        },
        filters: {
            /**
             * 格式化价格显示
             * @param {Number} price 价格
             * @return {String} 格式化后的价格
             */
            showPrice(price) {
                if (typeof price !== 'number') {
                    return `￥NaN`;
                }
                else {
                    return `￥${price}`;
                }
            },
            /**
             * 格式化商品数量显示
             * @param {Number} amount 商品数量
             * @return {String} 格式化后的商品数量
             */
            showAmount(amount) {
                if (typeof amount !== 'number') {
                    return `x NaN`;
                }
                else {
                    return `x ${amount}`;
                }
            },
            /**
             * 格式化联系人姓名
             * @param {String} contactName 联系人姓名（未格式化的）
             * @return {String} 格式化后的联系人姓名
             */
            formatContactName(contactName) {
                if (contactName.endsWith('{#先生}')) {
                    return `${contactName.replace('{#先生}', '')}（先生）`;
                }
                else if (contactName.endsWith('{#女士}')) {
                    return `${contactName.replace('{#女士}', '')}（女士）`;
                }
                else {
                    return contactName;
                }
            },
        },
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
        height: fit-content;
        padding-bottom: rpx(220);
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
                    padding-bottom: rpx(28);

                    .store-info-container {
                        width: 100%;
                        height: fit-content;
                        display: flex;
                        flex-direction: row;
                        border-bottom: rpx(2) solid #f3f3f3;

                        .store-details {
                            width: calc(100% - 42rpx);
                            height: fit-content;

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
                        height: fit-content;
                        //border-bottom: rpx(2) solid #f3f3f3;
                        display: flex;
                        flex-direction: row;
                        padding: rpx(26) 0 rpx(0);
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

                    .my-address-container {
                        width: 100%;
                        height: fit-content;
                        display: flex;
                        flex-direction: row;

                        .my-address {
                            width: calc(100% - 42rpx);
                            height: fit-content;

                            .address-tips {
                                line-height: rpx(80);
                                font-size: rpx(36);
                                color: #333;
                            }

                            .address-detail {
                                font-size: rpx(36);
                                color: #333;
                            }

                            .contact-info {
                                margin-top: rpx(10);
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

                        .my-address-btn {
                            width: rpx(36);
                            height: 100%;
                            position: relative;
                            left: rpx(6);
                            margin: auto;
                            font-size: rpx(54);
                            //line-height: rpx(130);
                            text-align: right;
                            align-items: center;
                            color: #aaa;
                        }
                    }
                }
            }
        }

        .order-details-container {
            width: 90%;
            height: fit-content;
            margin: rpx(20) 0 0 5%;
            padding: rpx(40);
            display: flex;
            flex-direction: column;
            background-color: #fff;
            border-radius: rpx(30);

            .store-title-container {
                display: flex;
                flex-direction: row;
                width: 100%;
                height: fit-content;

                .store-title-avatar {
                    width: rpx(42);
                    height: rpx(42);
                    border-radius: rpx(50);
                    overflow: hidden;

                    .avatar {
                        width: 100%;
                        height: 100%;
                        background: #f1f1f1;
                    }
                }

                .store-title-name {
                    margin-left: rpx(20);
                    max-width: calc(100% - 62rpx);
                    height: 100%;
                    line-height: rpx(42);
                    font-size: rpx(28);
                    color: #555;
                }
            }

            .order-content-container {
                width: 100%;
                height: fit-content;
                display: flex;
                flex-direction: column;
                margin-top: rpx(50);

                .commodity-container {
                    width: 100%;
                    height: fit-content;
                    margin-bottom: rpx(50);
                    display: flex;
                    flex-direction: row;

                    .commodity-image-container {
                        width: 15vw;
                        height: 15vw;
                        flex-shrink: 0;
                        border-radius: rpx(16);
                        overflow: hidden;

                        .commodity-image {
                            width: 100%;
                            height: 100%;
                            background-color: #f1f1f1;
                        }
                    }

                    .commodity-info-container {
                        //width: calc(100% -  30vw);
                        height: fit-content;
                        padding: 0 rpx(20);
                        white-space: nowrap;
                        overflow: hidden;

                        .commodity-name {
                            font-size: rpx(28);
                            color: #555;
                            text-overflow: ellipsis;
                            overflow: hidden;
                        }

                        .commodity-description {
                            width: fit-content;
                            height: fit-content;
                            margin-top: rpx(18);
                            font-size: rpx(24);
                            color: #aaa;
                            white-space: initial;
                            overflow: initial;
                        }
                    }

                    .commodity-price-container {
                        width: fit-content;
                        height: fit-content;
                        flex-shrink: 0;
                        margin-left: auto;
                        padding-left: rpx(30);
                        display: flex;
                        flex-direction: column;
                        text-align: right;

                        .commodity-price {
                            display: flex;
                            flex-direction: row;
                            line-height: rpx(36);

                            .origin-price {
                                margin-right: rpx(10);
                                font-size: rpx(26);
                                text-decoration: line-through;
                                color: #aaa;
                            }

                            .discount-price {
                                font-size: rpx(30);
                                color: #333;
                            }
                        }

                        .commodity-amount {
                            margin-top: rpx(20);
                            font-size: rpx(24);
                            color: #aaa;
                        }
                    }
                }

                .order-price-container {
                    width: 100%;
                    height: fit-content;
                    display: flex;
                    flex-direction: column;
                    font-size: rpx(28);
                    color: #555;

                    .delivery-price {
                        display: flex;
                        flex-direction: row;
                    }

                    .packaging-price {
                        display: flex;
                        flex-direction: row;
                        margin-top: rpx(40);
                    }

                    .price {
                        margin-left: auto;
                        font-size: rpx(30);
                        color: #333;
                    }

                    .coupon {
                        display: flex;
                        flex-direction: row;
                        margin-top: rpx(40);

                        .coupon-tag {
                            width: rpx(30);
                            height: rpx(30);
                            line-height: rpx(30);
                            font-size: rpx(20);
                            margin-top: rpx(6);
                            margin-left: rpx(10);
                            text-align: center;
                            background-color: #f4756b;
                            color: #fff;
                            border-radius: rpx(10);
                        }

                        .select-coupon__default {
                            margin-left: auto;
                            color: #bbb;
                            font-size: rpx(28);

                            .fa {
                                margin-left: rpx(20);
                                font-size: rpx(36);
                                color: #aaa;
                            }
                        }
                    }
                }

                .total-price-container {
                    width: 100%;
                    height: fit-content;
                    margin-top: rpx(60);
                    font-size: rpx(26);
                    text-align: right;
                    color: #555;

                    .total-price-description {
                        display: flex;
                        flex-direction: row;
                        width: fit-content;
                        margin-left: auto;
                        line-height: rpx(40);
                    }

                    .total-price {
                        width: fit-content;
                        margin-left: rpx(10);
                        font-size: rpx(36);
                        color: #333;
                    }
                }
            }
        }

        .order-options-container {
            width: 90%;
            height: rpx(200);
            margin: rpx(20) 0 0 5%;
            padding: rpx(40);
            display: flex;
            flex-direction: column;
            background-color: #fff;
            border-radius: rpx(30);
            font-size: rpx(28);
            color: #555;

            .remark {
                display: flex;
                flex-direction: row;

                .select-remark__default {
                    margin-left: auto;
                    color: #bbb;
                    font-size: rpx(28);

                    .fa {
                        margin-left: rpx(20);
                        font-size: rpx(36);
                        color: #aaa;
                    }
                }
            }

            .payment-method {
                display: flex;
                flex-direction: row;
                margin-top: rpx(40);

                .select-payment-method__default {
                    margin-left: auto;
                    color: #bbb;
                    font-size: rpx(28);
                }
            }
        }

        .fixed-bar-container {
            width: 100vw;
            height: rpx(110);
            position: fixed;
            bottom: 0;
            padding: rpx(16) rpx(40);
            display: flex;
            flex-direction: row;
            background-color: #fff;
            box-shadow: 0 0 rpx(16) rpx(-10) #888888;

            .discount-price {
                font-size: rpx(26);
                line-height: rpx(120);
                position: fixed;
                right: rpx(250);
                color: #999;
            }

            .total-price {
                position: fixed;
                right: rpx(250);
                font-size: rpx(36);
                color: #f4756b;
                font-weight: bold;
                line-height: rpx(46);
            }

            .pay-btn {
                width: rpx(180);
                height: rpx(78);
                margin-left: auto;
                font-size: rpx(32);
                color: #fff;
                text-align: center;
                line-height: rpx(78);
                background-color: #f4756b;
                border-radius: rpx(50);
            }
        }
    }
</style>