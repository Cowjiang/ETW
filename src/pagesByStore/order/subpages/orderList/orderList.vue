<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"/>

    <view
      class="order-list-container"
      :style="{minHeight: `calc(100vh - ${navigationHeight}px)`}">
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
            <i class="fa fas fa-angle-right"/>
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
                  <!--                      {{ commodity.price | formatPrice }}-->
                  <!--                    </view>-->
                  <view class="discount-price">
                    {{ commodity.totalFee | formatPrice }}
                  </view>
                </view>
                <view class="commodity-amount">
                  {{ commodity.num | formatAmount }}
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
                    {{ order.totalPayment | formatPrice }}
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
      <view
        class="empty"
        :style="{minHeight: `calc(100vh - ${navigationHeight + 40}px)`}"
        v-if="!orderList.length">
        <view class="row">
          一个订单都没有噢
        </view>
        <view class="row">
          <view class="btn" @click="gotoStoreSearch">
            到处逛逛
          </view>
        </view>
      </view>
      <view class="safe-area" v-else></view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loading from "@/components/loading/loading";
    import {dateFilter} from "@/common/js/utils/filters";
    import {toPayment} from "@/common/js/utils/common";
    import {getMyOrder, getOrderWxPayInfo} from "@/common/js/api/models";

    export default {
        name: "orderList",
        components: {
            toast, navigationBar, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                orderList: [], //订单列表数据
                currentPage: 1, //当前分页页码
                existMore: true, //是否还有更多记录
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
                        if (res.data.records.length) {
                            //查询到订单记录
                            if (page === 1) {
                                this.orderList = res.data.records;
                            }
                            else {
                                this.orderList = [...this.orderList, ...res.data.records];
                            }
                            this.currentPage += 1;
                        }
                        else {
                            this.existMore = false;
                        }
                        this.$refs.loading.stopLoading();
                    }
                    else {
                        console.error(res);
                        this.$refs.toast.show({
                            text: '获取订单信息失败',
                            type: 'error',
                            direction: 'top'
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
            // 滚动列表至底部
            handleScrollToBottom() {
                if (this.existMore) {
                    this.getOrderList(this.currentPage + 1);
                }
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
            // 跳转店铺搜索页
            gotoStoreSearch() {
                uni.navigateTo({
                    url: "/pagesByStore/storeSearch/storeSearch"
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
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                }).catch(err => {
                    console.error(err);
                });
            },
        },
        filters: {
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
        onReachBottom() {
            this.handleScrollToBottom();
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '我的订单',
                backgroundColor: '#f6f6f6'
            });
        },
        onLoad() {
            this.$refs.loading.startLoading();
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
        },
        async onShow() {
            await this.getOrderList();
        }
    }
</script>

<style lang="scss" scoped>
  @import "orderList";
</style>