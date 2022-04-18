<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"/>

    <view
      class="order-list-container"
      :style="{minHeight: `calc(100vh - ${navigationHeight}px)`}">
      <view class="tabs">
        <u-tabs
          ref="uTabs"
          class="u-tabs"
          :list="[{name: '全部订单'}, {name: '待付款'}, {name: '准备中'}, {name: '退款/售后'}]"
          :is-scroll="false"
          :height="80"
          font-size="30"
          bold
          bg-color="transparent"
          :current="currentShowType"
          active-color="#f4756b"
          inactive-color="#9e9e9e"
          :bar-height="8"
          :active-item-style="{
              fontWeight: 'bold',
              fontSize: '32rpx',
              color: '#111'
            }"
          @change="handleTabsChange"/>
      </view>
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
        :style="{minHeight: `calc(100vh - ${navigationHeight + 40}px - 100rpx)`}"
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
                currentShowType: null, //当前显示的订单类型
                orderList: [], //订单列表数据
                currentPage: 0, //当前分页页码
                existMore: true, //是否还有更多记录
            }
        },
        methods: {
            /**
             * 获取订单列表
             * @param {Number} page 页码
             * @param {Number} stat 订单状态：[0:全部，1:待支付，2:准备中，3:退款/售后]
             */
            getOrderList(page = 1, stat = 0) {
                getMyOrder({
                    queryData: {
                        pageNumber: page,
                        pageSize: 3,
                        stat: stat === 0 ? null : stat === 3 ? 4 : stat
                    },
                    headerData: {
                        "Content-type": "application/json"
                    }
                }).then(res => {
                    if (res.data.records.length) {
                        //查询到订单记录
                        this.orderList = page === 1 ? res.data.records : [...this.orderList, ...res.data.records];
                        this.currentPage += 1;
                    }
                    else {
                        this.existMore = false;
                    }
                }).catch(err => {
                    console.error(err);
                    this.$refs.toast.show({
                        text: '获取订单信息失败',
                        type: 'error',
                        direction: 'top'
                    });
                }).finally(() => {
                    this.$refs.loading.stopLoading();
                });
            },
            // 滚动列表至底部
            handleScrollToBottom() {
                if (this.existMore) {
                    this.getOrderList(this.currentPage + 1, this.currentShowType);
                }
            },
            /**
             * 切换菜单标签
             * @param {Number} index 切换的序号
             */
            handleTabsChange(index) {
                this.utils.throttle(() => {
                    this.currentShowType = index;
                    this.$refs.loading.startLoading();
                    this.orderList = [];
                    this.currentPage = 0;
                    this.existMore = true;
                    this.getOrderList(1, index);
                    uni.pageScrollTo({
                        scrollTop: 0,
                        duration: 500
                    });
                }, 500);
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
                    }
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
                uni.switchTab({
                    url: '/pages/storeSearch/storeSearch',
                    fail: () => {
                        uni.navigateTo({
                            url: '/pages/storeSearch/storeSearch'
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
                    toPayment(res.data).then(() => {
                        this.getOrderList();
                    }).catch(err => {
                        console.log(err);
                    });
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
                        customItems.map(item => {
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
                const statusList = {
                    0: '订单已创建',
                    1: '等待支付',
                    2: '订单已付款',
                    3: '订单已完成',
                    4: '申请取消中',
                    5: '申请退款中',
                    9: '订单已取消',
                    10: '订单已退款'
                };
                return statusList[statusCode] ?? '订单异常';
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
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            this.$refs.loading.startLoading();
            this.currentShowType = Number(this.utils.getCurrentPage().curParam.type ?? 0);
            this.getOrderList(1, this.currentShowType);
        }
    }
</script>

<style lang="scss" scoped>
  @import "orderList";
</style>