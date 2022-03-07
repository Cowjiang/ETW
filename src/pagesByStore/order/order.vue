<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"/>
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
          <view class="content--default content-left" v-if="!isTakeOut">
            <view class="store-info-container" @click="handleAddressClick">
              <view class="store-details">
                <view class="store-name">
                  {{ storeInfo.name }}
                </view>
                <view class="store-address">
                  <i class="fas fa-location-dot"/>
                  {{ storeInfo.addressDetails }}
                </view>
              </view>
              <view class="store-btn">
                <i class="fas fa-angle-right" aria-hidden="true"></i>
              </view>
            </view>
            <view class="contact-info-container">
              <view class="contact-name">
                <view class="contact-title--default">
                  <i class="fa fa-user" aria-hidden="true"></i>
                </view>
                <view
                  class="contact-placeholder--default name-placeholder"
                  :style="{ opacity: `${contactName === '' ? '1' : '0'}` }"
                  @click="handleContactNameFocus">
                  <text>请输入姓名</text>
                  <i class="fas fa-angle-right"/>
                </view>
                <view class="contact-value">
                  <input type="text" v-model="contactName" maxlength="10"/>
                </view>
              </view>
              <view class="contact-phone">
                <view class="contact-title--default">
                  <i class="fas fa-mobile-screen-button"/>
                </view>
                <view
                  class="contact-placeholder--default"
                  :style="{ opacity: `${contactPhone === '' ? '1' : '0'}` }"
                  @click="handleContactPhoneFocus">
                  <text>请输入手机号</text>
                  <i class="fas fa-angle-right"/>
                </view>
                <view class="contact-value">
                  <input type="number" v-model="contactPhone" maxlength="11"/>
                </view>
              </view>
            </view>
            <view class="time-container" @click="handleReservationTimeClick">
              <view class="contact-title--default">
                <i class="fas fa-clock"/>
              </view>
              <view class="contact-placeholder--default">
                {{ reservationTime === "" ? "请选择自取时间" : "自取时间" }}
                <i class="fas fa-angle-right"/>
              </view>
              <view class="contact-value" v-if="reservationTime !== ''">
                {{ reservationTime }}
              </view>
            </view>
          </view>
          <!-- 外卖配送的内容 -->
          <view class="content--default content-right" v-if="isTakeOut">
            <view class="my-address-container" @click="selectMyAddress">
              <view class="my-address">
                <view class="address-tips" v-if="Object.keys(takeOutInfo).length === 0">
                  选择收货地址
                </view>
                <view class="address-detail" v-if="Object.keys(takeOutInfo).length !== 0">
                  {{ takeOutInfo.addressDetail }}
                </view>
                <view class="contact-info" v-if="Object.keys(takeOutInfo).length !== 0">
                  {{ takeOutInfo.contactName | formatContactName }}
                  {{ takeOutInfo.contactPhone }}
                </view>
              </view>
              <view class="my-address-btn">
                <i class="fas fa-angle-right"/>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="order-details-container">
        <view class="store-title-container">
          <view class="store-title-avatar">
            <view class="avatar">
              <image
                :src="storeInfo.imageUrl"
                mode="aspectFill"
                style="width: 100%; height: 100%"
              />
            </view>
          </view>
          <view class="store-title-name">
            {{ storeInfo.name }}
          </view>
        </view>
        <view class="order-content-container">
          <view
            class="commodity-container"
            v-for="(commodity, index) in orderContent"
            :key="index"
          >
            <view class="commodity-image-container">
              <view class="commodity-image">
                <image
                  :src="commodity.imageUrl"
                  mode="aspectFill"
                  style="width: 100%; height: 100%"
                />
              </view>
            </view>
            <view class="commodity-info-container">
              <view class="commodity-name">
                {{ commodity.name }}
              </view>
              <view class="commodity-description">
                {{ commodity.description }}
              </view>
              <view class="commodity-tags"></view>
            </view>
            <view class="commodity-price-container">
              <view class="commodity-price">
                <view class="origin-price" v-if="commodity.discountPrice !== null">
                  {{ commodity.originPrice | formatPrice }}
                </view>
                <view class="discount-price">
                  {{ commodity.discountPrice === null ? commodity.originPrice : commodity.discountPrice | formatPrice }}
                </view>
              </view>
              <view class="commodity-amount">
                {{ commodity.amount | formatAmount }}
              </view>
            </view>
          </view>
          <view class="order-price-container">
            <view class="delivery-price">
              配送费
              <view class="price">
                {{ deliveryFee | formatPrice }}
              </view>
            </view>
            <view class="packaging-price">
              打包费
              <view class="price">
                {{ packagingFee | formatPrice }}
              </view>
            </view>
            <view class="coupon" @click="showCoupons = true">
              优惠券
              <view class="coupon-tag"> 券</view>
              <view class="select-coupon__default">
                {{
                  currentCouponIndex === 0 ? "暂无可用" : `满${couponsEnable[currentCouponIndex].withAmount / 100.0}减${couponsEnable[currentCouponIndex].usedAmount / 100.0}`
                }}
                <i class="fas fa-angle-right"/>
              </view>
            </view>
          </view>
          <view class="total-price-container">
            <view class="total-price-description">
              共 {{ commodityCount }} 件商品，合计
              <view class="total-price">
                {{ totalPrice | formatPrice }}
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="order-options-container">
        <view class="remark" @click="editRemarks">
          <view>备注</view>
          <view class="select-remark__default">
            <view class="content">{{ orderRemarks === "" ? "口味、餐具数量等" : orderRemarks }}</view>
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="payment-method">
          支付方式
          <view class="select-payment-method__default"> 在线支付</view>
        </view>
      </view>
      <view class="fixed-bar-container">
        <view class="discount-price">
          已优惠
          {{
            currentCouponId == 0 ? totalDiscount : (totalDiscount + couponsEnable[currentCouponIndex].usedAmount) | formatPrice
          }}
        </view>
        <view class="total-price">
          <text style="font-size: 30rpx">
            <text style="font-size: 42rpx">
              {{
                currentCouponId == 0 ? parseInt(orderPrice) : (parseInt(orderPrice) - couponsEnable[currentCouponIndex].usedAmount) | formatPrice
              }}
              <!-- <text style="font-size: 30rpx">
                {{ orderPrice.toString().split(".")[1] || "00" }}
              </text> -->
            </text>
          </text>
        </view>
        <view
          class="pay-btn"
          :class="allowPay ? '' : 'pay-btn__disabled'"
          @click="toPay">
          支付
        </view>
      </view>
    </view>
    <!-- 优惠券弹窗 -->
    <u-popup
      v-model="showCoupons"
      mode="bottom"
      border-radius="20"
      :closeable="true"
      length="60%"
    >
      <view class="coupon-popup">
        <scroll-view scroll-y width="100%">
          <view>
            <view>可用</view>
            <couponItem
              v-for="(item, index) in couponsEnable"
              :key="index"
              :item="item"
              :index="index"
              types="carts"
              theme="#ff6c00"
              color="#ffffff"
              solid="#ff6c00"
              @choseCoupon="choseCoupon"
            />
          </view>

          <view class="disable-coupons">
            <view>已失效</view>
            <couponItem
              v-for="(item, index) in couponsDisable"
              :key="index"
              :item="item"
              types="carts"
              theme="#ff6c00"
              color="#ffffff"
              solid="#ff6c00"
            />
          </view>
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script>
    import loading from "@/components/loading/loading";
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import storeInfoPopup from "@/components/store/storeInfoPopup/storeInfoPopup";
    import selectTimePopup from "@/components/selectPopup/selectTime/selectTime";
    import couponItem from "@/components/couponItem/couponItem.vue";
    import {toPayment, toWxLogin} from "@/common/js/utils/common";
    import {addOrder, getDefaultAddress, getUserCoupon} from "@/common/js/api/models.js";

    export default {
        components: {
            toast, navigationBar, loading, storeInfoPopup, selectTimePopup, couponItem
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                isTakeOut: false, //是否外送
                orderItems: [], //请求用的订单项参数
                storeInfo: {
                    storeId: NaN, // {Number} 店铺id，必需
                    name: "", // {String} 店铺名字，必需
                    addressDetails: "", // {String} 店铺地址详情，必需
                    phone: "", // {String} 店铺联系电话，必需
                    openingTime: "", // {String} 店铺营业时间，必需
                    longitude: NaN, // {Number|NaN} 店铺经度，必需
                    latitude: NaN, // {Number|NaN} 店铺纬度，必需
                    areaCode: "", // {String} 行政编码
                    imageUrl: "", // {String} 店铺Logo的Url
                }, //店铺信息
                contactName: "", //到店自取联系人姓名
                contactPhone: "", //到店自取联系人电话
                reservationTime: "", //到店自取预留的自取时间
                contactNameFocus: false, //到店自取联系人姓名输入框聚焦状态
                contactPhoneFocus: false, //到店自取联系人电话输入框聚焦状态
                showStoreInfoPopup: false, //是否显示店铺信息弹窗组件
                showSelectTimePopup: false, //是否显示时间选择弹窗组件
                reservationTimeLimit: "",
                orderRemarks: '', //用户备注
                takeOutInfo: {}, //外卖收货人信息
                orderContent: [], //订单商品内容
                deliveryFee: 0, // {Number} 配送费
                packagingFee: 0, // {Number} 打包费
                orderPrice: 0, //订单总金额
                couponsEnable: [], //优惠券可用列表
                couponsDisable: [], //优惠券不可用列表
                showCoupons: false, //是否显示优惠券
                currentCouponId: "", // 当前选中优惠券
                currentCouponIndex: 0, //当前优惠券序号
            };
        },
        methods: {
            // 切换自取/外送标签
            handleChangeTags(e) {
                this.utils.throttle(async () => {
                    if (e.currentTarget.dataset.name === "tagRight" && this.takeOutInfo.id === undefined) {
                        //获取用户当前默认地址
                        await getDefaultAddress().then(res => {
                            if (res.success && res.data.id != null) {
                                this.takeOutInfo = {
                                    id: res.data.id,
                                    contactName: res.data.contacts,
                                    contactPhone: res.data.phone,
                                    areaCode: res.data.areaCode,
                                    addressDetail: res.data.addressDetail,
                                    areaName: [res.data.province, res.data.city, res.data.area],
                                    isDefaultAddress: res.data.isDefault,
                                };
                            }
                            else {
                                this.takeOutInfo = {};
                            }
                        }).catch(err => {
                            this.takeOutInfo = {};
                        });
                    }
                    this.isTakeOut = e.currentTarget.dataset.name !== "tagLeft";
                }, 300);
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
                this.utils.throttle(() => {
                    this.reservationTimeLimit = `9:00-21:00`;
                    this.showSelectTimePopup = true;
                }, 500);
            },
            //预约到店时间确认事件
            handleReservationTimeConfirm(e) {
                this.showSelectTimePopup = false;
                this.reservationTime = e[0].label;
            },
            //外卖配送选择收货地址
            selectMyAddress() {
                this.utils.throttle(() => {
                    uni.showActionSheet({
                        itemList: ["从地址簿中选择", "新建地址"],
                        success: res => {
                            if (res.tapIndex === 0) {
                                //从地址簿中选择
                                uni.navigateTo({
                                    url: "/pagesByStore/addressBook/addressBook",
                                    events: {
                                        acceptDataFromOpenedPage: data => {
                                            if (data) {
                                                this.takeOutInfo = data.address;
                                            }
                                        },
                                    },
                                    success: res => {
                                        res.eventChannel.emit("selectAddress", {data: true});
                                    },
                                });
                            }
                            else {
                                //新建地址
                                uni.navigateTo({
                                    url: "/pagesByStore/addressBook/subpages/editAddress/editAddress",
                                    events: {
                                        acceptDataFromOpenedPage: data => {
                                            if (data) {
                                                this.takeOutInfo = {
                                                    id: data.address.id,
                                                    contactName: data.address.contacts,
                                                    contactPhone: data.address.phone,
                                                    addressDetail: data.address.addressDetail,
                                                    areaCode: data.address.areaCode,
                                                };
                                            }
                                        },
                                    },
                                    success: res => {
                                        res.eventChannel.emit("selectAddress", {data: true});
                                    },
                                });
                            }
                        },
                    });
                }, 1000);
            },
            //编辑订单备注
            editRemarks() {
                uni.navigateTo({
                    url: '/pagesByStore/order/subpages/orderRemarks/orderRemarks',
                    success: res => {
                        res.eventChannel.emit("acceptDataFromOpenerPage", {
                            orderRemarks: this.orderRemarks,
                        });
                    },
                    events: {
                        acceptDataFromOpenedPage: data => {
                            if (data) {
                                this.orderRemarks = data.orderRemarks;
                            }
                        },
                    },
                });
            },
            // 去支付并提交订单
            toPay() {
                // 构建订单数据
                let params = {};
                params.items = this.orderItems;
                params.isTakeOut = this.isTakeOut;
                if (this.isTakeOut) {
                    params.addressId = this.takeOutInfo.id;
                }
                else {
                    params.contacts = this.contactName;
                    params.phone = this.contactPhone;
                }
                if (this.currentCouponId !== 0) {
                    params.userCouponId = this.currentCouponId;
                }
                params.orderRemarks = this.orderRemarks;
                // 微信登录
                toWxLogin().then(code => {
                    params.code = code;
                    const that = this;
                    addOrder({
                        urlParam: {
                            storeId: that.storeInfo.storeId,
                        },
                        queryData: params,
                        headerData: {"Content-type": "application/json"},
                    }).then(res => {
                        const orderId = res.data.orderId;
                        toPayment(res.data).then(res => {
                            this.gotoOrderDetail(orderId);
                        }).catch(err => {
                            this.gotoOrderDetail(orderId);
                        });
                    }).catch(err => {
                        this.$refs.toast.show({
                            text: '下单失败',
                            type: 'error',
                            direction: 'top'
                        });
                    });
                });
            },
            // 选中优惠券
            choseCoupon(id, index) {
                this.currentCouponId = id;
                this.currentCouponIndex = index;
                this.showCoupons = false;
            },
            /**
             * 跳转订单详情页
             * @param {String} orderId 订单ID
             */
            gotoOrderDetail(orderId) {
                uni.redirectTo({
                    url: `/pagesByStore/order/subpages/orderDetail/orderDetail?id=${encodeURIComponent(JSON.stringify(orderId))}`
                });
            },
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
                totalPrice = totalPrice + this.deliveryFee;
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
            },
            // 是否允许支付
            allowPay() {
                return this.isTakeOut ? this.takeOutInfo.id != null : !(this.contactName === '' || this.contactPhone === '' || this.reservationTime === '');
            }
        },
        onLoad() {
            wx.getSystemInfo({
                success: (res) => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                },
            }); //获取窗口尺寸
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
            try {
                // 渲染订单列表
                const eventChannel = this.getOpenerEventChannel();
                eventChannel.on("acceptDataFromOpenerPage", (data) => {
                    // 填充店铺信息
                    const storeInfo = data.storeInfo;
                    this.storeInfo = {
                        storeId: storeInfo.id, // {Number} 店铺id，必需
                        name: storeInfo.name, // {String} 店铺名字，必需
                        addressDetails: storeInfo.addressDetails, // {String} 店铺地址详情，必需
                        phone: storeInfo.phone, // {String} 店铺联系电话
                        openingTime: '', // {String} 店铺营业时间
                        longitude: storeInfo.longitude, // {Number|NaN} 店铺经度，必需
                        latitude: storeInfo.latitude, // {Number|NaN} 店铺纬度，必需
                        areaCode: storeInfo.areaCode, // {String} 行政编码
                        imageUrl: storeInfo.imgUrl, // {String} 店铺Logo的Url
                    };
                    // 填充订单项
                    let packagingFee = 0;
                    let cartList = data.cartList;
                    let orderContent = [];
                    // 准备订单项
                    let orderItems = []; // 请求用的订单信息
                    for (let cartItem of cartList) {
                        let orderItem_q = {};
                        orderItem_q["dishesId"] = cartItem.commodityId;
                        orderItem_q["num"] = cartItem.amount;
                        let customItemMap = {};
                        // 填充自定义项
                        let customSelectedItems = [];
                        let customOptions = cartItem.customOptions.customOptions;
                        if (customOptions) {
                            if (customOptions.length > 0) {
                                customOptions.forEach(customOption => {
                                    customItemMap[customOption.customId] = [];
                                    customOption.customItems.forEach(customItem => {
                                        if (customItem.isSelected) {
                                            customSelectedItems.push(customItem.customItemTitle); // 展示用的定制项
                                            customItemMap[customOption.customId].push(customItem.customItemId); // 请求用的定制项
                                        }
                                    });
                                });
                                orderItem_q["customItemMap"] = customItemMap;
                            }
                        }
                        orderItems.push(orderItem_q); // 组合请求用的订单项
                        this.orderItems = orderItems;
                        // 填充订单信息
                        packagingFee += cartItem.packingCharges * cartItem.amount;
                        const orderItem = {
                            imageUrl: cartItem.imageUrl,
                            name: cartItem.name, // {String} 商品名称
                            description: customSelectedItems.join(";"), // {String} 商品规格/描述
                            originPrice: cartItem.price,
                            discountPrice: cartItem.discountPrice, // {Number|null} 商品单价优惠折扣后价格（若无则为null）
                            amount: cartItem.amount, // {Number} 商品数量
                        };
                        orderContent.push(orderItem);
                    }
                    // 填充优惠券喜喜
                    getUserCoupon({
                        queryData: {
                            storeId: storeInfo.id,
                            pageNumber: 1,
                            pageSize: -1,
                            stat: 0, //未使用
                        },
                    }).then(res => {
                        if (res.success) {
                            const coupons = res.data.records;
                            let couponsEnable = [];
                            let couponsDisable = [];
                            for (const coupon of coupons) {
                                if (
                                    coupon.withAmount <= this.totalPrice &&
                                    coupon.validEndTime > new Date().getTime() &&
                                    coupon.stat === 0
                                ) {
                                    couponsEnable.push(coupon);
                                }
                                else {
                                    couponsDisable.push(coupon);
                                }
                            }
                            this.couponsDisable = couponsDisable;
                            this.couponsEnable = couponsEnable;
                        }
                    });
                    this.orderContent = orderContent;
                    this.packagingFee = packagingFee;
                });
            } catch (e) {
                uni.navigateBack();
            }
        },
        onShow() {
            this.$refs.navigationBar.setNavigation({
                titleText: "确认订单",
                backgroundColor: "#f6f6f6",
            });
        },
        onHide() {
        },
        onUnload() {
        },
        beforeDestroy() {
        },
    };
</script>

<style lang="scss" scoped>
  @import 'order';
</style>
