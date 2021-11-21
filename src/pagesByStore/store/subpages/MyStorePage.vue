<template>
  <view class="container">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
    <!-- 添加菜单类型弹出层 -->
    <u-popup
      v-model="isShowDishTypePop"
      mode="bottom"
      border-radius="14"
      height="460"
      :safeAreaInsetBottom="true"
      @close="dishTypeInputValue = ''"
    >
      <view class="popup-box">
        <u-form-item label-position="top" label="菜品类型">
          <u-input v-model="dishTypeInputValue" maxlength="10" />
        </u-form-item>
        <button
          class="submit-button"
          :disabled="isShowLoading"
          @click="clickSubmitButton"
          :class="isShowLoading ? 'disabled-button' : ''"
        >
          <i v-show="isShowLoading" class="fa fa-spinner fa-spin fa-fw"></i>
          {{ isDishTypeAdd ? "添加" : "编辑" }}
        </button>
      </view>
    </u-popup>
    <!-- 店铺信息 -->
    <view class="store-container">
      <!-- 分隔栏 -->
      <view class="section-title-box">
        <view class="left-box">店铺信息</view>
        <view class="right-box">
          <view class="btn-edit" @click="editStore">编辑</view>
        </view>
      </view>
      <view class="content-box">
        <view>店铺名：{{ storeAllInfo.name }}</view>
        <view>地址：{{ storeAllInfo.addressDetails }}</view>
      </view>
    </view>
    <!-- 菜品类型 -->
    <view class="dish-type-container">
      <!-- 分隔栏 -->
      <view class="section-title-box">
        <view class="left-box">菜品类型</view>
        <view class="right-box">
          <view class="btn" @click="addDishType">
            <text class="fa fa-plus"></text>
          </view>
        </view>
      </view>
      <!-- 菜品类型 -->
      <scroll-view
        v-if="dishTypeList.length > 0"
        class="dish-type-list-box"
        scroll-x="true"
        scroll-left="0"
      >
        <view class="dish-type-item-box" v-for="(item, index) in dishTypeList" :key="index">
          <view class="delete-icon" @tap.stop="deleteType(item.id)">X</view>
          <view class="id-box">id：{{ item.id }}</view>
          <view class="name-box">{{ item.typeName }}</view>
          <view class="button-box">
            <view class="button" @click="editDishType(item)">编辑</view>
          </view>
        </view>
      </scroll-view>
      <noData v-else text="还未添加菜品类型" iconName="tags" height="180"></noData>
    </view>
    <!-- 菜品 -->
    <view class="dish-container">
      <view class="section-title-box">
        <view class="left-box">所有菜品</view>
        <view class="right-box">
          <view class="btn" @click="addDish()">
            <text class="fa fa-plus"></text>
          </view>
        </view>
      </view>
      <!-- 菜品列表 -->
      <view class="dish-list-box" v-if="dishList.length > 0">
        <u-collapse ref="uCollapse" :accordion="false" :item-style="itemStyle" :arrow="false">
          <u-collapse-item
            v-for="(item1, index1) in dishList"
            :title="item1.typeName"
            :key="index1"
          >
            <view
              class="dish-item-box"
              v-for="(item2, index2) in dishList[index1].dishes"
              :key="index2"
            >
              <view class="delete-icon" @tap.stop="deleteDish(item2.id)">X</view>
              <view class="image-box">
                <image :src="item2.imageUrl" mode="aspectFill" />
              </view>
              <view class="first-row">
                <view class="left">{{ item2.name }}</view>
                <view class="right">销量：{{ item2.sales }}</view>
              </view>
              <view class="second-row">{{ item2.summary }}</view>
              <view class="thrid-row">
                <view class="left">
                  ￥{{ item2.price }}
                  <text
                    class="discount"
                    v-if="item2.discount < 1"
                  >{{ item2.discount | discountFilter }}</text>
                </view>
                <view class="right" @click="editDish(item2, item1.id)">编辑</view>
              </view>
            </view>
          </u-collapse-item>
        </u-collapse>
      </view>
      <noData v-else text="还未添加菜品" iconName="navicon"></noData>
    </view>
  </view>
</template>

<script>
import {
  getMyStoreInfo,
  getDishType,
  putDishType,
  postDishType,
  deleteDishType,
  getDishList,
  deleteDishInfo,
} from "@/common/js/api/models.js";
export default {
  data () {
    return {
      isShowDishTypePop: false, //是否弹出菜品类型表单
      isDishTypeAdd: false, //是为添加菜品类型，否为编辑菜品类型
      isShowLoading: false, //是否正在请求
      dishTypeInputValue: "", //菜品类型的表单值
      editDishTypeId: null,// 当前编辑的菜品类型id
      //店铺主要信息
      storeMainInfo: {
        id: "",
        likeNumber: "",
        browseNumber: "",
        score: "",
        sales: "",
        userId: "",
      },
      //店铺全部信息
      storeAllInfo: {
        characteristic: "",
        name: "",
        nextOpeningTime: "",
        nextOpeningTimeTakeOut: "",
        perCost: "",
        addressDetails: "",
        phone: "",
        weChatAccount: "",
        areaCode: "",
        longitude: "",
        latitude: "",
      },
      //菜品类型列表
      dishTypeList: [],
      //菜品列表
      dishList: [],
      //折叠层样式
      itemStyle: {
        borderBottom: "1rpx solid #ededed",
        paddingLeft: "12rpx",
        width: "100%",
      },
    };
  },
  created () {
    this.getAllData();
  },
  onLoad () {
    this.$refs.navigationBar.setNavigation({
      backgroundColor: "#f6f6f6",
      titleText: "我的店铺",
    });
  },
  methods: {
    /**
     * @description: 获取店铺数据
     */
    getMyStoreData () {
      return getMyStoreInfo().then((res) => {
        if (res.success) {
          for (const key in res.data) {
            if (Object.hasOwnProperty.call(this.storeAllInfo, key)) {
              this.storeAllInfo[key] = res.data[key];
            } else {
              this.storeMainInfo[key] = res.data[key];
            }
          }
        }
      });
    },
    /**
     * @description: 获取菜品类型数据
     */
    getDishTypeData () {
      return getDishType({ urlParam: this.storeMainInfo.id }).then((res) => {
        if (res.success) {
          this.dishTypeList = res.data;
        }
      });
    },
    /**
     * @description: 获取菜品数据
     */
    getDishListData () {
      return getDishList({ urlParam: this.storeMainInfo.id }).then((res) => {
        if (res.success) {
          this.dishList = res.data;
          this.$nextTick(() => {
            this.$refs.uCollapse.init();
          });
        }
      });
    },
    /**
     * @description: 获取所有初始数据
     */
    async getAllData () {
      try {
        await this.getMyStoreData();
        await this.getDishTypeData();
        await this.getDishListData();
      } catch (error) {
        console.log(error);
      }
    },
    /*********************店铺的方法***********************/
    /**
     * @description: 编辑店铺信息
     */
    editStore () {
      uni.navigateTo({
        url: "/pagesByStore/store/subpages/storeInfoUpdatePage",
        events: {
          acceptDataFromOpenedPage: function (data) { },
        },
        success: (res) => {
          res.eventChannel.emit(
            "acceptDataFromOpenerPage",
            this.storeMainInfo,
            this.storeAllInfo
          );
        },
      });
    },
    /*********************菜品类型的方法***********************/
    /**
     * @description: 添加菜品类型
     */
    addDishType () {
      this.isDishTypeAdd = true;
      this.isShowDishTypePop = true;
    },
    /**
     * @description: 编辑菜品类型
     * @param {*} typeInfo 选中的菜品类型
     */
    editDishType (typeInfo) {
      this.isDishTypeAdd = false;
      this.isShowDishTypePop = true;
      this.dishTypeInputValue = typeInfo.typeName;
      this.editDishTypeId = typeInfo.id
    },
    /**
     * @description: 提交菜品类型的按钮
     */
    clickSubmitButton () {
      this.isShowLoading = true;
      if (this.isDishTypeAdd) {
        postDishType({
          urlParam: this.storeMainInfo.id,
          queryData: { name: this.dishTypeInputValue },
        }).then((res) => {
          if (res.success) {
            this.dishTypeInputValue = "";
            this.isShowLoading = false;
            this.isShowDishTypePop = false;
            getDishType({ urlParam: this.storeMainInfo.id }).then((res) => {
              if (res.success) {
                this.dishTypeList = res.data;
              }
            });
            this.$refs.toast.show({
              text: "提交成功",
              type: "success",
            });
          } else {
            this.isShowLoading = false;
            this.$refs.toast.show({
              text: "发生错误",
              type: "error",
            });
          }
        });
      } else {
        putDishType({
          urlParam: { storeId: this.storeMainInfo.id, dishTypeId: this.editDishTypeId },
          queryData: { name: this.dishTypeInputValue },
        }).then((res) => {
          if (res.success) {
            this.dishTypeInputValue = "";
            this.isShowLoading = false;
            this.isShowDishTypePop = false;
            getDishType({ urlParam: this.storeMainInfo.id }).then((res) => {
              if (res.success) {
                this.dishTypeList = res.data;
              }
            });
            this.$refs.toast.show({
              text: "提交成功",
              type: "success",
            });
          } else {
            this.isShowLoading = false;
            this.$refs.toast.show({
              text: "发生错误",
              type: "error",
            });
          }
        });
      }

    },
    /**
     * @description: 删除菜品类型
     * @param {*} typeId 选中的菜品类型id
     */
    deleteType (typeId) {
      uni.showModal({
        title: "提示",
        content:
          "删除菜品类型会把该菜品类型下的所有菜品都删除，确定继续删除吗？",
        showCancel: true,
        success: ({ confirm, cancel }) => {
          if (confirm) {
            deleteDishType({
              urlParam: { storeId: this.storeMainInfo.id, typeId: typeId },
            }).then((res) => {
              if (res.success) {
                this.$refs.toast.show({
                  text: "删除成功",
                  type: "success",
                });
                this.getDishTypeData();
              } else {
                this.$refs.toast.show({
                  text: "删除发生错误",
                  type: "error",
                });
              }
            });
          }
        },
      });
    },
    /*********************菜品的方法***********************/
    /**
     * @description: 前往菜品表单
     */
    addDish () {
      uni.navigateTo({
        url: "/pagesByStore/dish/dishFormPage",
        events: {
          acceptDataFromOpenedPage: function (data) { },
        },
        success: (res) => {
          res.eventChannel.emit(
            "acceptDataFromOpenerPage",
            true,
            this.storeMainInfo,
            this.dishTypeList
          );
        },
      });
    },
    /**
     * @description: 编辑菜品
     * @param {*} dishInfo 选中的菜品信息
     * @param {*} dishTypeId 选中的菜品类型id
     */
    editDish (dishInfo, dishTypeId) {
      delete dishInfo.sales;
      dishInfo.typeId = dishTypeId;
      uni.navigateTo({
        url: "/pagesByStore/dish/dishFormPage",
        events: {
          acceptDataFromOpenedPage: function (data) { },
        },
        success: (res) => {
          res.eventChannel.emit(
            "acceptDataFromOpenerPage",
            false,
            this.storeMainInfo,
            this.dishTypeList,
            dishInfo
          );
        },
      });
    },
    /**
     * @description: 删除菜品
     * @param {*} typeId 选中的菜品id
     */
    deleteDish (dishId) {
      uni.showModal({
        title: "提示",
        content: "确定删除此菜品吗",
        showCancel: true,
        success: ({ confirm, cancel }) => {
          if (confirm) {
            deleteDishInfo({
              urlParam: { storeId: this.storeMainInfo.id, dishId: dishId },
            }).then((res) => {
              if (res.success) {
                this.$refs.toast.show({
                  text: "删除成功",
                  type: "success",
                });
                this.getDishListData();
              } else {
                this.$refs.toast.show({
                  text: "删除发生错误",
                  type: "error",
                });
              }
            });
          }
        },
      });
    },
  },
};
</script>

<style>
page {
  background-color: #f6f6f6;
  height: 100vh;
}
</style>
<style lang="scss" scoped>
.container {
  margin: 40rpx;
  .popup-box {
    padding: 64rpx;
  }
}
.disabled-button {
  color: white !important;
  background-color: $uni-color-primary !important;
  opacity: 0.5 !important;
}
.submit-button {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 36rpx;
  color: white;
  background-color: $uni-color-primary;
  border-radius: 14rpx;
}

.section-title-box {
  display: flex;
  justify-content: space-between;
  font-size: 30rpx;
  height: 48rpx;
  font-weight: 500;
  margin-bottom: 30rpx;
  .left-box {
  }
  .right-box {
    .btn {
      background-color: $uni-color-primary;
      color: white;
      text-align: center;
      font-size: 28rpx;
      width: 42rpx;
      height: 42rpx;
      line-height: 42rpx;
      border-radius: 50%;
    }
    .btn-edit {
      color: $uni-color-blue;
    }
  }
}
.store-container {
  padding: 40rpx;
  border-radius: 30rpx;
  margin-bottom: 30rpx;
  background-color: white;
}
.dish-type-container {
  padding: 40rpx;
  border-radius: 30rpx;
  margin-bottom: 30rpx;
  background-color: white;
  .dish-type-list-box {
    white-space: nowrap;
    width: 100%;
    height: 180rpx;
    .dish-type-item-box {
      display: inline-block;
      overflow: hidden;
      position: relative;
      width: 240rpx;
      height: 160rpx;
      padding: 20rpx 20rpx;
      margin-right: 20rpx;
      border-radius: 12rpx;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      .delete-icon {
        position: absolute;
        top: 0rpx;
        right: 0rpx;
        z-index: 10;
        color: white;
        background-color: $uni-color-primary;
        border-radius: 50%;
        font-size: 22rpx;
        width: 36rpx;
        height: 36rpx;
        line-height: 36rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .name-box {
        @include ellipsis(1);
        font-size: 32rpx;
      }
      .id-box {
        @include ellipsis(1);
        font-size: 24rpx;
        color: $uni-text-color-placeholder;
      }
      .button-box {
        overflow: hidden;
        .button {
          float: right;
          font-size: 28rpx;
          height: 44rpx;
          line-height: 44rpx;
          text-align: center;
          border-radius: 12rpx;
          color: $uni-color-blue;
        }
      }
    }
  }
}
.dish-container {
  padding: 40rpx;
  border-radius: 30rpx;
  background-color: white;
  .dish-list-box {
    .dish-item-box {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      width: 560rpx;
      margin: 24rpx auto;
      border-radius: 16rpx;
      overflow: hidden;
      position: relative;
      color: black;
      .delete-icon {
        position: absolute;
        top: 10rpx;
        right: 10rpx;
        z-index: 10;
        color: white;
        background-color: $uni-color-primary;
        border-radius: 50%;
        font-size: 22rpx;
        width: 36rpx;
        height: 36rpx;
        line-height: 36rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .image-box {
        width: 560rpx;
        height: 300rpx;
        image {
          width: 560rpx;
          height: 300rpx;
          border-radius: 16rpx 16rpx 0 0;
        }
      }
      .first-row {
        width: 560rpx;
        margin: 16rpx 0;
        padding: 0 20rpx;
        font-weight: 560;
        font-size: 32rpx;
        overflow: hidden;
        @include ellipsis(1);
        .left {
          display: inline;
        }
        .right {
          display: inline;
          float: right;
          font-weight: 400;
          font-size: 26rpx;
          color: $uni-text-color-placeholder;
        }
      }
      .second-row {
        width: 560rpx;
        padding: 0 20rpx;
        margin-bottom: 16rpx;
        font-size: 28rpx;
        @include ellipsis(1);
      }
      .thrid-row {
        width: 560rpx;
        padding: 0 20rpx;
        margin-bottom: 28rpx;
        font-weight: 400;
        font-size: 38rpx;
        overflow: hidden;
        .left {
          float: left;
          .discount {
            margin-left: 12rpx;
            font-size: 28rpx;
            color: $uni-text-color-placeholder;
          }
        }
        .right {
          float: right;
          font-size: 28rpx;
          height: 44rpx;
          line-height: 44rpx;
          text-align: center;
          border-radius: 12rpx;
          color: $uni-color-blue;
        }
      }
    }
  }
}
</style>
