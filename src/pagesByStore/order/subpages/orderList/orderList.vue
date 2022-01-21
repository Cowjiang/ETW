<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"/>

    <view class="order-list-container">
      <scroll-view
        scroll-y
        @scrolltolower="handleScrollToBottom">
        <view
          class="card"
          v-for="order in orderList"
          :key="order.id"
          @click="gotoOrderDetail(order.id)">
          <view class="order-info-container">
            <view class="store-info" @click.stop="gotoStore(order.storeSimpleInfo.id)">
              <view class="store-image">
                <image
                  class="image"
                  :src="order.storeSimpleInfo.imgUrl"
                  mode="aspectFill"/>
              </view>
              <view class="store-name">
                {{ order.storeSimpleInfo.name }}
              </view>
              <i class="fa fa-angle-right" aria-hidden="true"/>
              <view class="order-status" @click.stop>
                <view>
                  {{ order.stat | showOrderStatus }}
                </view>
              </view>
            </view>
            <view class="commodity-info">
              <view
                class="commodity-container"
                v-for="commodity in order.orderItems"
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
                    <!--                    <view class="origin-price" v-if="commodity.discountPrice !== null">-->
                    <!--                      {{ commodity.price | showPrice }}-->
                    <!--                    </view>-->
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
                <view class="total-price-container">
                  <view class="total-price-description">
                    <view>
                      共 {{ order.totalCount }} 件商品，合计
                    </view>
                    <view class="price">
                      {{ order.totalPayment | showPrice }}
                    </view>
                  </view>
                </view>
                <view class="row">
                  <view class="content">
                    <view class="btn btn__light">
                      查看详情
                    </view>
                    <view
                      class="btn btn__solid"
                      v-if="order.stat === 1"
                      @click.stop="gotoPay(order.id)">
                      立刻支付
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
    import {toast} from "@/components/toast/toast";
    import {navigationBar} from "@/components/navigationBar/navigationBar";
    import {loading} from "@/components/loading/loading";
    import {getMyOrder, getOrderWxPayInfo} from "@/common/js/api/models";
    import {dateFilter} from "@/common/js/utils/filters";
    import {toPayment} from "@/common/js/utils/common";

    export default {
        name: "orderList",
        components: {
            toast, navigationBar, loading
        },
        data() {
            return {
                orderList: [], //订单列表数据
                currentPage: 1, //当前分页页码
            }
        },
        methods: {
            /**
             * 获取订单列表
             * @param {Number} page 页码
             */
            getOrderList(page = 1) {
                getMyOrder({
                    queryData: {
                        pageNumber: page,
                    },
                }).then(res => {
                    if (res.success) {
                        console.log(res.data.records)
                        if (page === 1) {
                            this.orderList = res.data.records;
                        }
                        else {
                            this.orderList = [...this.orderList, ...res.data.records];
                        }
                        this.$refs.loading.stopLoading();
                    }
                });
            },
            // 滚动列表至底部
            handleScrollToBottom() {
                this.getOrderList(this.currentPage + 1);
                this.currentPage += 1;
            },
            /**
             * 跳转订单详情页
             * @param {String} orderId 订单ID
             */
            gotoOrderDetail(orderId) {
                uni.navigateTo({
                    url: '/pagesByStore/order/subpages/orderDetail/orderDetail',
                    success: res => {
                        res.eventChannel.emit("orderInfo", {
                            orderId: orderId,
                        });
                    },
                });
            },
            // 跳转店铺菜单页面

            /**
             * 跳转店铺菜单页
             * @param {String|Number} storeId 店铺ID
             */
            gotoStore(storeId) {
                uni.navigateTo({
                    url: "/pagesByStore/storeMenu/storeMenu",
                    success: res => {
                        res.eventChannel.emit("storeInfo", {
                            storeInfo: {
                                id: storeId
                            },
                        });
                    }
                });
            },
            /**
             * 跳转微信支付
             * @param {String} orderId 订单ID
             */
            gotoPay(orderId) {
                getOrderWxPayInfo({
                    urlParam: {
                        orderId: orderId,
                    },
                }).then(res => {
                    if (res.success) {
                        toPayment(res.data).then(payRes => {
                            this.getOrderList();
                        });
                    }
                });
            },
        },
        filters: {
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
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '我的订单',
                backgroundColor: '#f6f6f6'
            });
        },
        async onLoad() {
            this.$refs.loading.startLoading();
            await this.getOrderList();
        }
    }
</script>

<style lang="scss" scoped>
  @import "orderList";
</style>