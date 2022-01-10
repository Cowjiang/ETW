<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <scroll-view scroll-y class="order-list-container" @scrolltolower="nextPage">
      <view class="order-details-container" :key="index" v-for="(order, index) in orders">
        <!-- 店铺信息 -->
        <view class="store-title-container">
          <view class="store-title-avatar">
            <view class="avatar">
              <image
                :src="order.storeSimpleInfo.imgUrl"
                mode="aspectFill"
                style="width: 100%; height: 100%"
              />
            </view>
          </view>

          <view class="store-title-name">
            <view>{{ order.storeSimpleInfo.name }}</view>
            <view style="color: #e45959">{{ order.stat | showStat }}</view>
          </view>
        </view>

        <view style="margin-top: 8rpx; padding: 12rpx 0; color: grey; font-size: 12px">
          {{ order.createdTime | dateFilter("yy-mm-dd hh:mm") }}
        </view>
        <!-- 订单信息 -->
        <view class="order-content-container">
          <view
            class="commodity-container"
            v-for="(commodity, index) in order.orderItems"
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
                  ￥ {{ commodity.price / 100.0 }}
                </view>
                <view class="discount-price">
                  ￥ {{ commodity.discountPrice / 100.0 }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 总价 -->
        <view class="total-price-container">
          <view class="total-price-description" style="margin-left: 0">
            {{ order.phone }} {{ order.contacts | formatContactName }}
          </view>
          <view class="total-price-description" style="transform: translateY(-40rpx);">
            合计：￥{{ order.totalPayment / 100.0 }}
          </view>
          <view class="total-price-description" style="transform: translateY(-20rpx);">
            <u-button size="mini" v-if="order.stat < 2">取消订单</u-button>
            <u-button
              size="mini"
              v-else
              @click="applyToRefunds(order.id)"
              :disabled="order.stat >= 5"
            >申请退款
            </u-button
            >
          </view>
        </view>
        <!-- 底部按钮组 -->
        <view class="bottom-button-group">
          <u-button
            shape="square"
            :disabled="order.stat >= 2"
            :type="order.stat >= 2 ? 'default' : 'primary'"
            color="#f4756b"
            @click="ToPay(order.id)"
          >去支付
          </u-button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script>
    import {applyToRefunds, getMyOrder, getOrderWxPayInfo,} from "@/common/js/api/models";
    import {toPayment} from "@/common/js/utils/common";

    export default {
        data() {
            return {
                orders: [],
                currentPage: 1,
            };
        },
        onShow() {
            this.$refs.navigationBar.setNavigation({
                titleText: "我的订单",
                backgroundColor: "#f6f6f6",
            });
        },
        onLoad() {
            this.loadData(1);
        },
        filters: {
            showStat(val) {
                switch (val) {
                    case 0:
                    case 1:
                        return "订单已生成";
                    case 2:
                        return "已付款";
                    case 3:
                        return "交易完成";
                    case 4:
                        return "用户申请关闭";
                    case 5:
                        return "申请退款";
                    case 9:
                        return "交易关闭";
                    case 10:
                        return "已退款";
                }
            },
            /**
             * 格式化联系人姓名
             * @param {String} contactName 联系人姓名（未格式化的）
             * @return {String} 格式化后的联系人姓名
             */
            formatContactName(contactName) {
                if (contactName.endsWith('{#先生}')) {
                    return `${contactName.replace('{#先生}', '')}(先生)`;
                }
                else if (contactName.endsWith('{#女士}')) {
                    return `${contactName.replace('{#女士}', '')}(女士)`;
                }
                else {
                    return contactName;
                }
            },
            /**
             * 提取并切割联系人姓名/性别
             * @param {String} contactName 联系人姓名（未格式化的）
             * @return {Array} 返回二维数组，格式：[联系人姓名, 性别代码（参考subpages/editAddress中说明）]
             */
            getContactGender(contactName) {
                if (contactName.endsWith('{#先生}')) {
                    return [contactName.replace('{#先生}', ''), 1];
                }
                else if (contactName.endsWith('{#女士}')) {
                    return [contactName.replace('{#女士}', ''), 2];
                }
                else {
                    return [contactName, 0];
                }
            },
            dateFilter(time, type) {
                let date;
                if (time instanceof Date) {
                    date = time;
                }
                else {
                    date = new Date(time);
                }
                let y = date.getFullYear();
                let m = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) * 1 : date.getMonth() + 1;
                let d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
                let h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                let minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                let second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
                switch (type) {
                    case "yy-mm-dd hh:mm:ss":
                        return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second;
                    case "yy-mm-dd type":
                        return y + "-" + m + "-" + d + " " + (h === 13 ? "下午" : "上午");
                    case "yy-mm-dd hh:mm":
                        return y + "-" + m + "-" + d + " " + h + ":" + minute;
                    case "yy/mm/dd hh:mm:ss":
                        return y + "/" + m + "/" + d + " " + h + ":" + minute + ":" + second;
                    case "yy-mm-dd":
                        return y + "-" + m + "-" + d;
                    case "yy.mm.dd":
                        return y + "." + m + "." + d;
                    case "yy.mm.dd hh:mm:ss":
                        return y + "." + m + "." + d + " " + h + ":" + minute + ":" + second;
                    case "mm-dd hh:mm":
                        return m + "-" + d + " " + h + ":" + minute;
                }
            }
        },
        methods: {
            ToPay(id) {
                getOrderWxPayInfo({
                    urlParam: {
                        orderId: id,
                    },
                }).then((res) => {
                    if (res.success) {
                        toPayment(res.data).then((payRes) => {
                            this.loadData();
                        });
                    }
                });
            },
            applyToRefunds(id) {
                applyToRefunds({
                    urlParam: {
                        orderId: id,
                    },
                    queryData: {
                        reason: "我想退款",
                    },
                }).then((res) => {
                    if (res.success) {
                        this.loadData();
                    }
                });
            },
            nextPage() {
                this.loadData(this.currentPage + 1);
                this.currentPage = this.currentPage + 1;
            },
            loadData(page = 1) {
                getMyOrder({
                    queryData: {
                        pageNumber: page,
                    },
                }).then((res) => {
                    if (res.success) {
                        let orders = res.data.records;
                        for (let order of orders) {
                            for (let orderItem of order.orderItems) {
                                let description = "";
                                if (orderItem.customItems !== undefined) {
                                    description = orderItem.customItems
                                        .map((data) => data.customItemTitle)
                                        .join(";");
                                }

                                orderItem.description = description;
                            }
                        }
                        if (page > 1) {
                            const tempOrders = this.orders;
                            orders = tempOrders.concat(orders);
                        }
                        this.orders = orders;
                    }
                });
            },
        },
    };
</script>
<style lang="scss">
  .order-list-container {
    width: 100vw;
    height: 100vh;
    background-color: #f6f6f6;
    padding-bottom: rpx(20);

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
        font-size: rpx(38);

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
          flex: 1;
          display: flex;
          justify-content: space-between;
          margin-left: rpx(20);
          // max-width: calc(100% - 62rpx);
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
      }

      .total-price-container {
        width: 100%;
        height: fit-content;
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

      .bottom-button-group {
        margin-top: rpx(20);
        font-weight: bold;
      }
    }
  }

  ::v-deep .u-btn--primary {
    background-color: #f4756b !important;
    border-color: #f4756b !important;
    border-radius: rpx(18) !important;
  }

  ::v-deep .u-btn--primary--disabled {
    background-color: #f7e4e2 !important;
    border-color: #f7e4e2 !important;
    border-radius: rpx(18) !important;
  }
</style>
