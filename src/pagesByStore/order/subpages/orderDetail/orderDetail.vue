<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"/>

    <view class="order-detail-container">
      <view class="card card-1">
        <view class="order-status-container">
          <view class="status">
            {{ orderDetail.stat | showOrderStatus }}
          </view>
          <view class="description">
            {{ orderDetail.stat | showStatusDescription }}
          </view>
          <view class="custom-btn" v-if="orderDetail.stat >= 0">
            <button class="btn" open-type="contact" v-if="showBtnText(orderDetail.stat) === '联系客服'">
              {{ showBtnText(orderDetail.stat) }}
            </button>
            <button class="btn" v-else @click="handleCustomBtnClick(orderDetail.stat)">
              {{ showBtnText(orderDetail.stat) }}
            </button>
          </view>
        </view>
      </view>
      <view class="card card-2">
        <view class="order-info-container">
          <view class="store-info">
            <view class="store-image" @click="gotoStore()">
              <image
                class="image"
                :src="orderDetail.storeSimpleInfo.imgUrl"
                mode="aspectFill"/>
            </view>
            <view class="store-name" @click="gotoStore()">
              {{ orderDetail.storeSimpleInfo.name }}
            </view>
            <view class="take-out">
              <view>
                {{ orderDetail.isTakeOut ? '外卖' : '自提' }}
              </view>
            </view>
          </view>
          <view class="commodity-info">
            <view
              class="commodity-container"
              v-for="commodity in orderDetail.orderItems"
              :key="commodity.dishesId">
              <view class="commodity-image-container">
                <view class="commodity-image">
                  <image
                    :src="commodity.imageUrl"
                    mode="aspectFill"/>
                </view>
              </view>
              <view class="commodity-info-container">
                <view class="commodity-name">
                  {{ commodity.name }}
                </view>
                <view class="commodity-description">
                  {{ commodity.customItems | showDescription }}
                </view>
                <view class="commodity-tags"></view>
              </view>
              <view class="commodity-price-container">
                <view class="commodity-price">
                  <view class="origin-price" v-if="commodity.discountPrice !== null">
                    {{ commodity.price | showPrice }}
                  </view>
                  <view class="discount-price">
                    {{ commodity.totalFee | showPrice }}
                  </view>
                </view>
                <view class="commodity-amount">
                  {{ commodity.num | showAmount }}
                </view>
              </view>
            </view>
            <view class="order-price-container">
              <view class="row" v-if="orderDetail.isTakeOut">
                <view class="title">
                  配送费
                </view>
                <view class="content">
                  {{ orderDetail.packagingFee | showPrice }}
                </view>
              </view>
              <view class="row">
                <view class="title">
                  打包费
                </view>
                <view class="content">
                  {{ orderDetail.packagingFee | showPrice }}
                </view>
              </view>
              <view class="row total-discount">
                <view class="title">
                  优惠合计
                </view>
                <view class="content">
                  -{{ orderDetail.discountPrice | showPrice }}
                </view>
              </view>
              <view class="total-price-container">
                <view class="total-price-description">
                  <view>
                    共 {{ orderDetail.totalCount }} 件商品，合计
                  </view>
                  <view class="price">
                    {{ orderDetail.totalPayment | showPrice }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="card card-3">
        <view class="order-info-container">
          <view class="row">
            <view class="title">
              取餐信息
            </view>
            <view class="content">
              {{ orderDetail.contacts | formatContactName }} {{ orderDetail.phone }}
            </view>
          </view>
          <view class="row">
            <view class="title">
              订单备注
            </view>
            <view class="content">
              {{ orderDetail.userNotes }}
            </view>
          </view>
          <view class="row">
            <view class="title">
              下单时间
            </view>
            <view class="content">
              {{ orderDetail.createdTime | showDateTime }}
            </view>
          </view>
          <view class="more-detail" v-show="showMoreDetail">
            <view class="row" v-if="orderDetail.paymentTime">
              <view class="title">
                支付时间
              </view>
              <view class="content">
                {{ orderDetail.paymentTime | showDateTime }}
              </view>
            </view>
            <view class="row" v-if="orderDetail.paymentTime">
              <view class="title">
                支付方式
              </view>
              <view class="content">
                在线支付
              </view>
            </view>
            <view class="row order-id">
              <view class="title">
                订单编号
              </view>
              <view class="content">
                <view class="id">
                  {{ orderDetail.id }}
                </view>
                <i class="fa fa-clone" aria-hidden="true" @click="copyOrderId"/>
              </view>
            </view>
          </view>
          <view class="show-more" @click="showMoreDetail = !showMoreDetail">
            <view class="text">
              {{ showMoreDetail ? '收起' : '展开' }}
            </view>
            <i
              class="fa"
              :class="showMoreDetail ? ' fa-angle-up' : ' fa-angle-down'"
              aria-hidden="true"/>
          </view>
        </view>
      </view>
      <view class="bottom-btn">
        <view class="more-action" @click="moreAction">
          更多操作
        </view>
        <button class="btn" open-type="contact">
          对此订单有疑问
        </button>
      </view>
    </view>
  </view>
</template>

<script>
    import {toast} from "@/components/toast/toast.vue";
    import {navigationBar} from "@/components/navigationBar/navigationBar.vue";
    import {loading} from "@/components/loading/loading.vue";
    import {applyToRefunds, getOrderDetail, getOrderWxPayInfo} from "@/common/js/api/models";
    import {dateFilter} from "@/common/js/utils/filters";
    import {toPayment} from "@/common/js/utils/common";

    export default {
        name: "orderDetail",
        components: {
            toast, navigationBar, loading
        },
        data() {
            return {
                orderId: '', //订单编号
                orderDetail: {}, //订单详情信息
                showMoreDetail: false, //是否显示更多订单详情信息
            }
        },
        methods: {
            // 获取订单详情信息
            async getOrderDetail() {
                await getOrderDetail({
                    urlParam: {
                        orderId: this.orderId
                    }
                }).then(res => {
                    if (res.success) {
                        this.orderDetail = res.data;
                        this.orderDetail.userNotes = '哈喽哈喽哈喽哈喽哈喽哈喽哈喽哈喽哈喽哈喽哈喽哈喽哈喽哈喽哈喽'
                        this.$nextTick(() => {
                            this.$refs.loading.stopLoading();
                        });
                    }
                }).catch(err => {
                    console.error(err);
                    this.$refs.toast.show({
                        text: '获取订单信息失败',
                        type: 'error',
                        direction: 'top'
                    });
                });
            },
            // 复制订单编号
            copyOrderId() {
                uni.setClipboardData({
                    data: this.orderDetail.id
                });
            },
            // 页面底部按钮触发事件
            moreAction() {
                let ActionSheetItems = []; //菜单项列表
                if (this.orderDetail.stat === 2 || this.orderDetail.stat === 3) {
                    ActionSheetItems = ['查看店铺', '我要退款'];
                }
                else {
                    ActionSheetItems = ['查看店铺'];
                }
                uni.showActionSheet({
                    itemList: ActionSheetItems,
                    success: res => {
                        switch (res.tapIndex) {
                            case 0:
                                this.gotoStore();
                                break;
                            case 1:
                                this.gotoRefund();
                                break;
                        }
                    }
                });
            },
            /**
             * 订单状态自定义按钮点击事件
             * @param statusCode {Number} 订单状态码
             */
            handleCustomBtnClick(statusCode) {
                switch (statusCode) {
                    case 1:
                        this.gotoPay();
                        break;
                    case 0:
                    case 2:
                    case 3:
                    case 6:
                        this.gotoStore();
                        break;
                }
            },
            // 跳转店铺菜单页面
            gotoStore() {
                wx.navigateTo({
                    url: "/pagesByStore/storeMenu/storeMenu",
                    success: res => {
                        res.eventChannel.emit("storeInfo", {
                            storeInfo: {
                                id: this.orderDetail.storeSimpleInfo.id
                            },
                        });
                    },
                });
            },
            // 跳转微信支付
            gotoPay() {
                getOrderWxPayInfo({
                    urlParam: {
                        orderId: this.orderId,
                    },
                }).then(res => {
                    if (res.success) {
                        toPayment(res.data).then(payRes => {
                            this.getOrderDetail();
                        });
                    }
                });
            },
            // 申请订单退款
            gotoRefund() {
                applyToRefunds({
                    urlParam: {
                        orderId: this.orderId,
                    },
                    queryData: {
                        reason: "我想退款",
                    },
                }).then(res => {
                    if (res.success) {
                        this.getOrderDetail();
                    }
                });
            },
            /**
             * 显示订单按钮文字
             * @param statusCode {Number} 订单状态码
             * @return {String} 订单按钮文字
             */
            showBtnText(statusCode) {
                switch (statusCode) {
                    case 0:
                    case 2:
                    case 3:
                    case 6:
                        return '再来一单';
                    case 1:
                        return '立即支付';
                    case 4:
                    case 5:
                    case 7:
                        return '联系店家';
                    default:
                        return '联系客服';
                }
            },
        },
        computed: {},
        filters: {
            /**
             * 显示订单状态
             * @param {Number} statusCode 订单状态码
             * @return {String} 订单状态
             */
            showOrderStatus(statusCode) {
                switch (statusCode) {
                    case 0:
                        return '订单已创建';
                    case 1:
                        return '等待支付';
                    case 2:
                        return '订单已付款';
                    case 3:
                        return '订单已完成';
                    case 4:
                        return '申请取消中';
                    case 5:
                        return '申请退款中';
                    case 9:
                        return '订单已取消';
                    case 10:
                        return '订单已退款';
                    default:
                        return '订单异常';
                }
            },
            /**
             * 显示订单状态说明
             * @param {Number} statusCode 订单状态码
             * @return {String} 订单状态说明
             */
            showStatusDescription(statusCode) {
                switch (statusCode) {
                    case 0:
                        return '商家正在确认中';
                    case 1:
                        return '请您尽快完成订单支付';
                    case 2:
                        return '商家正在加急为您准备商品';
                    case 3:
                        return '感谢您的光临';
                    case 4:
                        return '请等待商家进行处理';
                    case 5:
                        return '请等待商家确认退款申请';
                    case 9:
                        return '订单已取消';
                    case 10:
                        return '钱款将原路返回到您的钱包';
                    default:
                        return '';
                }
            },
            /**
             * 格式化价格显示
             * @param {Number} price 价格
             * @return {String} 格式化后的价格
             */
            showPrice(price) {
                if (typeof price !== "number") {
                    return `￥NaN`;
                }
                else {
                    return `￥${price / 100.0}`;
                }
            },
            /**
             * 格式化商品数量显示
             * @param {Number} amount 商品数量
             * @return {String} 格式化后的商品数量
             */
            showAmount(amount) {
                if (typeof amount !== "number") {
                    return `x NaN`;
                }
                else {
                    return `x ${amount}`;
                }
            },
            /**
             * 格式化商品描述显示
             * @param {Array|undefined} customItems 商品的自定义选项数组
             * @return {String} 格式化后的商品描述文字
             */
            showDescription(customItems) {
                let description = '';
                if (customItems) {
                    if (customItems.length && customItems.length > 0) {
                        customItems.forEach(item => {
                            description = `${description}${description === '' ? '' : '; '}${item.customItemTitle}`;
                        });
                    }
                }
                return description;
            },
            /**
             * 格式化时间显示
             * @param {String} timestamp 时间戳
             * @return {String} 格式化后的时间
             */
            showDateTime(timestamp) {
                return dateFilter(timestamp, "yy-mm-dd hh:mm:ss");
            },
            /**
             * 格式化联系人姓名
             * @param {String} contactName 联系人姓名（未格式化的）
             * @return {String} 格式化后的联系人姓名
             */
            formatContactName(contactName) {
                if (contactName) {
                    if (contactName.endsWith("{#先生}")) {
                        return `${contactName.replace("{#先生}", "")}（先生）`;
                    }
                    else if (contactName.endsWith("{#女士}")) {
                        return `${contactName.replace("{#女士}", "")}（女士）`;
                    }
                    else {
                        return contactName;
                    }
                }
                else return '';
            },
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '订单详情',
                backgroundColor: '#f6f6f6'
            });
        },
        async onLoad() {
            this.$refs.loading.startLoading();
            try {
                const eventChannel = this.getOpenerEventChannel();
                eventChannel.on("orderInfo", async data => {
                    this.orderId = data.orderId;
                    await this.getOrderDetail();
                });
            } catch (e) {
                uni.navigateBack();
            }
        }
    }
</script>

<style lang="scss" scoped>
  @import 'orderDetail';
</style>