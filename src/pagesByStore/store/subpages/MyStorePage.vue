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
          提交
        </button>
      </view>
    </u-popup>
    <!-- 分隔栏 -->
    <view class="section-title-box">
      <view class="left-box">
        <text class="fa fa-window-minimize fa-rotate-90"></text>
        菜品类型
      </view>
      <view class="right-box">
        <view class="btn" @click="isShowDishTypePop = true">
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
      <view
        class="dish-type-item-box"
        v-for="(item, index) in dishTypeList"
        :key="index"
      >
        <view class="delete-icon" @tap.stop="deleteItem(index)"> X </view>
        <view class="id-box">id：{{ item.id }}</view>
        <view class="name-box">{{ item.typeName }}</view>
        <view class="button-box">
          <view class="button"> 编辑 </view>
        </view>
      </view>
    </scroll-view>
    <noData
      v-else
      text="还未添加菜品类型"
      iconName="tags"
      height="180"
    ></noData>
    <!-- 分隔栏 -->
    <view class="section-title-box">
      <view class="left-box">
        <text class="fa fa-window-minimize fa-rotate-90"></text>
        菜单
      </view>
      <view class="right-box">
        <view class="btn" @click="toDishFormPage()">
          <text class="fa fa-plus"></text>
        </view>
      </view>
    </view>
    <!-- 菜单列表 -->
    <view class="dish-list-box" v-if="dishList.length > 0">
      <u-collapse :accordion="false" :item-style="itemStyle" :arrow="false">
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
            <view class="delete-icon" @tap.stop="deleteItem(index)"> X </view>
            <view class="image-box">
              <image :src="item2.imageUrl" mode="widthFix" />
            </view>
          </view>
        </u-collapse-item>
      </u-collapse>
    </view>
    <noData v-else text="还未添加菜品" iconName="navicon"></noData>

    <button @click="toPage('/pagesByStore/store/subpages/storeApplyPage')">
      店铺申请
    </button>
    <button @click="toPage('/pagesByStore/store/subpages/storeInfoUpdatePage')">
      店铺信息编辑
    </button>
    <button @click="toPage('/pagesByStore/dish/dishFormPage')">添加菜品</button>
    <button @click="toPage('/pagesByStore/dish/dishTypePage')">菜品类型</button>

    <view class="bottom">
      <view>我的店铺id：{{ storeMainInfo.id }} </view>
      <view>我的店铺名：{{ storeAllInfo.name }} </view>
      <view
        >我的店铺下次营业时间：{{
          storeAllInfo.nextOpeningTime | dateFilter("yy-mm-dd hh:mm")
        }}
      </view>
      <view
        >我的店铺下次外卖营业时间：{{
          storeAllInfo.nextOpeningTimeTakeOut | dateFilter("yy-mm-dd hh:mm")
        }}
      </view>
    </view>
  </view>
</template>

<script>
import {
  getMyStoreInfo,
  getDishType,
  getDishList,
  postDishType,
} from "@/common/js/api/models.js";
export default {
  data() {
    return {
      isShowDishTypePop: false, //是否弹出菜品类型表单
      isShowLoading: false, //是否正在请求
      dishTypeInputValue: "", //菜品类型的表单值
      storeMainInfo: {
        id: "",
        likeNumber: "",
        browseNumber: "",
        score: "",
        sales: "",
        userId: "",
      },
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
      dishTypeList: [],
      dishList: [],
      itemStyle: {
        borderTop: "1rpx solid #ededed",
        paddingLeft:"12rpx"
      },
    };
  },
  created() {
    this.getAllData();
  },
  onLoad() {
    this.$refs.navigationBar.setNavigation({
      backgroundColor: "white",
      titleText: "我的店铺",
    });
  },
  methods: {
    toDishFormPage() {
      uni.navigateTo({
        url: "/pagesByStore/dish/dishFormPage",
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          acceptDataFromOpenedPage: function (data) {},
        },
        success: (res) => {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit(
            "acceptDataFromOpenerPage",
            this.storeMainInfo,
            this.dishTypeList
          );
        },
      });
    },
    clickSubmitButton() {
      this.isShowLoading = true;
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
    },
    async getAllData() {
      try {
        await getMyStoreInfo().then((res) => {
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
        await getDishType({ urlParam: this.storeMainInfo.id }).then((res) => {
          if (res.success) {
            this.dishTypeList = res.data;
          }
        });
        await getDishList({ urlParam: this.storeMainInfo.id }).then((res) => {
          if (res.success) {
            this.dishList = res.data;
          }
        });
      } catch (error) {}
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
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
  font-size: 36rpx;
  height: 48rpx;
  font-weight: 500;
  margin: 30rpx 0;
  .left-box {
  }
  .right-box {
    .btn {
      background-color: $uni-color-primary;
      color: white;
      text-align: center;
      font-size: 28rpx;
      width: 48rpx;
      height: 48rpx;
      line-height: 48rpx;
      border-radius: 50%;
    }
  }
}
.dish-type-list-box {
  white-space: nowrap;
  width: 100%;
  height: 180rpx;
  .dish-type-item-box {
    display: inline-block;
    overflow: hidden;
    position: relative;
    width: 280rpx;
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
</style>