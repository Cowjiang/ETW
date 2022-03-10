<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"/>
    <storeInfoPopup
      v-model="showStoreInfoPopup"
      :info="storeInfo"
      @close="showStoreInfoPopup = false"/>
    <view class="store-menu-container">
      <view
        class="store-image-container"
        :style="{ height: `${navigationHeight + 200}px` }">
        <image
          style="filter: blur(1px)"
          :src="storeInfo.imgUrl"
          mode="aspectFill"/>
      </view>
      <view class="store-info-container">
        <view class="store-title-container">
          <view class="avatar-container">
            <image class="avatar" :src="storeInfo.imgUrl" mode="aspectFill"/>
          </view>
          <view class="title-container">
            <view class="title" @click="handleStoreTitleClick">
              <view class="title-text">
                {{ storeInfo.name }}
              </view>
              <i class="fas fa-angle-right"/>
            </view>
            <view class="tags-container">
              <view>营业中</view>
              <view>人均{{ Math.ceil(storeInfo.perCost / 100) * 100 | formatPrice }}</view>
              <view>月销{{ storeInfo.sales }}</view>
              <view>好评率{{ storeInfo.likeRate | showLikeRate }}</view>
            </view>
          </view>
          <view class="favorite-container">
            <view class="favorite-btn" @click="handleChangeFavorite">
              <i class="far fa-star" v-show="!isFavourite"/>
              <i class="fas fa-star" v-show="isFavourite"/>
            </view>
          </view>
        </view>
        <view
          class="announcement-container"
          v-if="storeInfo.characteristic != null"
          @click="handleAnnouncementFold">
          <i class="fas fa-gift"/>
          <view
            class="announcement-text"
            :style="{ whiteSpace: `${announcementFolding ? 'nowrap' : 'normal'}` }">
            {{ storeInfo.characteristic }}
          </view>
          <view class="unfold-btn" @click.stop="" @click="handleAnnouncementFold">
            <i
              class="fas fa-angle-down"
              :style="{transform: `${announcementFolding ? 'rotate(0deg)' : 'rotate(180deg)'}`}"/>
          </view>
        </view>
        <view class="discount-container" @click="handleDiscountFold">
          <view
            class="discount-tags"
            :style="{ height: `${discountFolding ? '44rpx' : 'fit-content'}` }">
            <view
              class="tag"
              v-for="(tag, index) in discountTags"
              :key="index"
              :style="{
                backgroundColor: tag.backgroundColor,
                borderColor: tag.borderColor,
                color: tag.color,
              }"
              @click.stop=""
              @click="handleGetCoupon(tag.id)">
              {{ tag.content }}
            </view>
          </view>
          <view class="unfold-btn" @click.stop="" @click="handleDiscountFold">
            <view :style="{ opacity: `${discountFolding ? 1 : 0}` }"> 更多</view>
            <i
              class="fas fa-angle-down"
              :style="{ transform: `${discountFolding ? 'rotate(0deg)' : 'rotate(180deg)'}` }"/>
          </view>
        </view>
      </view>
      <view
        class="menu-container"
        :style="{ height: `${windowHeight - navigationHeight - 130}px` }">
        <!-- 菜单顶部选项卡 -->
        <view class="menu-top-tabs-container">
          <view class="u-tabs-container">
            <u-tabs
              class="u-tabs"
              :list="menuTabs"
              :is-scroll="false"
              :current="currentTab"
              active-color="#f4756b"
              :bar-height="8"
              @change="handleTabsChange"/>
          </view>
          <view
            class="search-btn-container"
            v-if="currentTab === 0"
            @click="handleOpenSearchPopup">
            <i class="fas fa-magnifying-glass"/>
            搜索
          </view>
        </view>
        <!-- 菜单内容 -->
        <view class="menu" v-if="currentTab === 0">
          <!-- 菜单类型滚动列表 -->
          <scroll-view class="type-container" :scroll-y="true">
            <view
              class="type-item-container__default"
              :class="[
                currentTypeId === type.id ? 'type-item-container__selected' : '',
                currentTypeId - 1 === type.id ? 'type-item-container__selected-before' : '',
                currentTypeId + 1 === type.id ? 'type-item-container__selected-after' : '',
              ]"
              v-for="type in menuList"
              :key="type.id"
              @click="handleTypeClick(type.id)">
              <view class="type-amount" v-if="!isNaN(type.amount) && type.amount !== 0">
                {{ type.amount <= 99 ? type.amount : "99+" }}
              </view>
              <view class="type-name">
                {{ type.typeName }}
              </view>
            </view>
            <view
              class="bottom-empty-box"
              :style="{borderTopRightRadius: `${currentTypeId === menuList.length ? '20rpx' : '0'}`}">
            </view>
          </scroll-view>
          <!-- 菜单商品滚动列表 -->
          <scroll-view
            class="commodity-container"
            :scroll-y="true"
            :scroll-into-view="scrollToTypeId"
            :scroll-with-animation="true">
            <view
              class="commodity-group-container"
              v-for="(type, typeIndex) in menuList"
              :key="type.id"
              :id="`type${type.id}`">
              <view class="group-name">
                {{ type.typeName }}
              </view>
              <view
                class="commodity"
                v-for="(commodity, commodityIndex) in type.dishes"
                :key="commodity.id"
                :data-typeId="type.id"
                @touchstart="handleTouchStart">
                <view
                  class="commodity-image-container"
                  @click="handleShowCommodityPopup(typeIndex, commodityIndex)">
                  <view class="commodity-image">
                    <image
                      :src="commodity.imageUrl"
                      mode="aspectFill"
                      style="width: 100%; height: 100%"/>
                  </view>
                </view>
                <view
                  class="commodity-info-container"
                  @click="handleShowCommodityPopup(typeIndex, commodityIndex)">
                  <view class="commodity-name">
                    {{ commodity.name }}
                  </view>
                  <view class="commodity-description">
                    {{ commodity.description }}
                  </view>
                  <view class="commodity-sale-info">
                    {{ commodity.sales != null ? `月销 ${commodity.sales}` : "" }}
                  </view>
                  <view class="price-container">
                    <view class="price">
                      <view class="current-price">
                        <text>
                          {{
                            parseInt(commodity.discountPrice === null ? commodity.price : commodity.discountPrice) | formatPrice
                          }}
                        </text>
                        <text>
                          {{
                            commodity.discountPrice === null
                              ? commodity.price.toString().split(".")[1] === undefined ? ""
                                : `.${commodity.price.toString().split(".")[1]}`
                              : commodity.discountPrice.toString().split(".")[1] === undefined ? ""
                                : `.${commodity.discountPrice.toString().split(".")[1]}`
                          }}
                        </text>
                      </view>
                      <view
                        class="origin-price"
                        v-if="commodity.discountPrice !== commodity.price">
                        {{ commodity.price | formatPrice }}
                      </view>
                    </view>
                    <view class="amount-btn-container" @click.stop="">
                      <i
                        class="fas fa-circle-minus"
                        :data-typeId="type.id"
                        :data-commodityId="commodity.id"
                        v-show="
                          commodity.amount !== 0 &&
                          !isNaN(commodity.amount) &&
                          commodity.amount !== undefined &&
                          !commodity.isCustom
                        "
                        @click="handleMinusCommodity"
                        @longpress="handleMinusCommodityLongPress"/>
                      <view
                        class="amount"
                        v-show="
                          commodity.amount !== 0 &&
                          !isNaN(commodity.amount) &&
                          commodity.amount !== undefined &&
                          !commodity.isCustom
                        ">
                        {{ commodity.amount || 0 }}
                      </view>
                      <i
                        class="fas fa-circle-plus"

                        :data-typeId="type.id"
                        :data-commodityId="commodity.id"
                        v-show="!commodity.isCustom"
                        @click="handleAddCommodity($event, true)"/>
                      <view
                        class="options-btn"
                        v-show="commodity.isCustom"
                        :data-typeId="type.id"
                        :data-commodityId="commodity.id"
                        @click="handleAddCommodity($event, true)">
                        选规格
                        <view
                          class="amount"
                          v-show="
                            commodity.amount !== 0 &&
                            !isNaN(commodity.amount) &&
                            commodity.isCustom
                          ">
                          {{ commodity.amount }}
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view class="bottom-empty-box"></view>
          </scroll-view>
        </view>
        <!-- 购物车弹出窗 -->
        <u-popup
          v-model="showCartPopup"
          mode="bottom"
          width="100%"
          height="50%"
          border-radius="30"
          z-index="3"
          safe-area-inset-bottom>
          <view class="shopping-cart-container">
            <view class="title-container">
              <view class="amount-container"> 共 {{ totalAmount }} 件商品</view>
              <view class="clear-btn-container" @click="handleClearCartList">
                <i class="far fa-trash-can"/>
                <text>清空购物车</text>
              </view>
            </view>
            <view class="content-container">
              <view class="empty-tips" v-if="totalAmount === 0">
                <text>空空如也 ~</text>
              </view>
              <view class="cart-items" v-if="totalAmount !== 0">
                <scroll-view
                  class="commodity-container"
                  :scroll-y="true"
                  :scroll-with-animation="true">
                  <view class="commodity" v-for="item in cartList" :key="item.id">
                    <view class="image-container">
                      <image
                        class="image"
                        :src="item.imageUrl"
                        mode="aspectFill"/>
                    </view>
                    <view class="info-container">
                      <view class="name">
                        {{ item.name }}
                      </view>
                      <view class="description">
                        {{
                          typeof item.customOptions === 'object' ? item.customOptions.customOptions : null | showCartCustomOptions
                        }}
                      </view>
                      <view class="price-container">
                        <view class="price">
                          {{ item.discountPrice ? item.discountPrice : item.price | formatPrice }}
                        </view>
                        <view class="amount-btn-container">
                          <i
                            class="fas fa-circle-minus"
                            :data-typeId="item.typeId"
                            :data-commodityId="item.commodityId"
                            :data-cartId="item.cartId"
                            @click="handleMinusCommodity"
                            @longpress="handleMinusCommodityLongPress"/>
                          <view class="amount">
                            {{ item.amount || 0 }}
                          </view>
                          <i
                            class="fas fa-circle-plus"
                            :data-typeId="item.typeId"
                            :data-commodityId="item.commodityId"
                            :data-cartId="item.cartId"
                            @click="handleAddCommodity"/>
                        </view>
                      </view>
                    </view>
                  </view>
                </scroll-view>
              </view>
            </view>
          </view>
        </u-popup>
        <!-- 搜索弹出窗 -->
        <u-popup
          class="search-popup"
          v-model="showSearchPopup"
          mode="bottom"
          width="100%"
          height="80%"
          border-radius="30"
          z-index="5"
          @close="handleCloseSearchPopup">
          <view class="search-container">
            <view class="input-container">
              <view class="input">
                <i class="fas fa-magnifying-glass"/>
                <input
                  type="text"
                  v-model="searchValue"
                  :focus="searchInputFocus"
                  :adjust-position="false"
                  placeholder="搜索商品名称"
                />
              </view>
              <view class="cancel-btn" @click="handleCloseSearchPopup"> 取消</view>
            </view>
            <view class="result-container">
              <scroll-view
                class="result-scroll-view"
                :scroll-y="true"
                :scroll-with-animation="true">
                <view
                  class="search-result-item"
                  v-for="(result, index) in searchResultList"
                  :key="index"
                  @click="handleShowCommodityPopup(result.typeIndex, result.commodityIndex)">
                  <view class="image-container">
                    <view class="image">
                      <image
                        :src="result.commodityImageUrl"
                        style="width: 100%; height: 100%"
                        mode="aspectFill"/>
                    </view>
                  </view>
                  <view class="info-container">
                    <text>{{ result.commodityName.split(searchValue)[0] }}</text>
                    <text class="search-key-text">{{ searchValue }}</text>
                    <text>{{ result.commodityName.split(searchValue)[1] }}</text>
                  </view>
                  <view class="price-container">
                    {{ result.commodityPrice | formatPrice }}
                  </view>
                </view>
              </scroll-view>
            </view>
          </view>
        </u-popup>
        <!-- 商品详情信息弹出窗 -->
        <u-popup
          class="commodity-detail-popup"
          v-model="showCommodityDetailPopup"
          mode="center"
          width="80%"
          border-radius="30"
          closeable
          z-index="5"
          @close="handleCloseCommodityPopup">
          <view
            class="commodity-detail-container"
            v-if="currentSelectedCommodity.commodityIndex !== undefined">
            <view class="image-container">
              <view class="image">
                <image
                  :src="menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].imageUrl"
                  mode="aspectFill"
                  style="width: 100%"/>
              </view>
            </view>
            <view class="info-container">
              <view class="title">
                {{
                  menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].name
                }}
              </view>
              <view class="description">
                {{
                  menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].description
                }}
              </view>
              <scroll-view class="custom-options-container" scroll-y="true">
                <view
                  class="option-container"
                  v-for="(option, optionIndex) in menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].customOptions"
                  :key="option.customId">
                  <view class="option-title">
                    {{ option.customName }}
                  </view>
                  <view class="option-items-container">
                    <view
                      v-for="(optionItem, optionItemIndex) in option.customItems"
                      :key="optionItem.customItemId"
                      class="option-item__default"
                      :class="optionItem.isSelected ? 'option-item__selected' : ''"
                      :data-typeIndex="currentSelectedCommodity.typeIndex"
                      :data-commodityIndex="currentSelectedCommodity.commodityIndex"
                      :data-optionIndex="optionIndex"
                      :data-optionItemIndex="optionItemIndex"
                      @click="handleCustomOptionClick">
                      {{ optionItem.customItemTitle }}
                    </view>
                  </view>
                </view>
              </scroll-view>
            </view>
            <view class="price-container">
              <view class="price">
                {{
                  menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].isCustom
                    ? menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].customOptionPrice
                    : parseInt(menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].discountPrice === null
                      ? menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].price
                      : menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].discountPrice) | formatPrice
                }}
              </view>
              <view class="amount-btn">
                <i
                  class="fas fa-circle-minus"
                  @click="handleMinusAmountTemp"/>
                <view class="amount">
                  {{ amountTemp }}
                </view>
                <i
                  class="fas fa-circle-plus"
                  @click="handleAddAmountTemp"/>
              </view>
            </view>
            <view class="add-to-cart-container">
              <view
                class="add-btn"
                :data-typeId="menuList[currentSelectedCommodity.typeIndex].id"
                :data-commodityId="menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].id"
                @click="handleAddToCartBtnClick">
                加入购物车
              </view>
            </view>
          </view>
        </u-popup>
        <!-- 底部购物车栏 -->
        <view class="cart-bar-container" v-show="currentTab === 0">
          <view
            class="cart-btn-container"
            @click="handleOpenCartPopup"
            :style="{
              transform: `${showCartPopup ? 'translateX(-100rpx)' : 'translateX(30rpx)'}`,
            }">
            <i class="fas fa-shopping-cart"/>
            <view class="total-amount" v-show="totalAmount !== 0">
              {{ totalAmount }}
            </view>
          </view>
          <view class="cart-bar">
            <view
              class="price-container"
              :style="{
                marginLeft: `${showCartPopup ? '40rpx' : '150rpx'}`,
                color: `${showCartPopup ? '#f4756b' : '#333'}`,
              }">
              <text>
                {{ parseInt(totalPrice) | formatPrice }}
              </text>
              <text>
                {{
                  totalPrice.toString().split(".")[1] === undefined ? "" : `.${totalPrice.toString().split(".")[1]}`
                }}
              </text>
              <text class="origin-price" v-show="totalOriginalPrice !== totalPrice">
                {{ totalOriginalPrice | formatPrice }}
              </text>
            </view>
            <view
              class="pay-container"
              :class="payable ? 'pay-container__default' : 'pay-container__reject'"
              @click="handlePayBtnClick">
              结算
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loading from "@/components/loading/loading";
    import storeInfoPopup from "@/components/store/storeInfoPopup/storeInfoPopup";
    import selectTimePopup from "@/components/selectPopup/selectTime/selectTime";
    import {getCouponByStoreId, getStoreInfo, getStoreMenu, userGetCoupon,} from "@/common/js/api/models";

    export default {
        components: {
            toast, navigationBar, loading, storeInfoPopup, selectTimePopup
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                storeInfo: {}, //店铺信息
                discountTags: [
                    {
                        id: 1,
                        content: "新客优惠",
                        backgroundColor: "#f4756b",
                        color: "#fff",
                        borderColor: "f4756b",
                    },
                ], //优惠券标签
                announcementFolding: true, //公告折叠状态
                discountFolding: true, //优惠券折叠状态
                isFavourite: false, //是否收藏店铺,
                showStoreInfoPopup: false, //是否显示店铺信息弹出窗
                menuTabs: [
                    {
                        name: "点餐",
                    },
                    {
                        name: "评价",
                    },
                    {
                        name: "商家",
                    },
                ], //菜单标签
                currentTab: 0, //当前标签序号
                menuList: [], //菜单内容
                currentTypeId: 1, //当前菜单显示的类型编号
                scrollToTypeId: "", //要滑动到的类型Id
                cartList: [], //购物车列表
                showCartPopup: false, //是否显示购物车弹出层
                searchResultList: [], //搜索结果列表
                showSearchPopup: false, //是否显示搜索弹出层
                searchValue: "", //搜索输入框的值
                searchInputFocus: false, //搜索输入框聚焦状态
                showCommodityDetailPopup: false,
                currentSelectedCommodity: {}, //当前选择的商品信息，用于商品详情弹出框的信息展示
                currentCustomOptions: {}, //当前已编辑的的商品定制选项信息
                amountTemp: 1, //商品详情弹出窗显示的商品数量
                payable: false, //支付按钮是否可点击
            };
        },
        methods: {
            // 切换公告折叠状态
            handleAnnouncementFold() {
                this.announcementFolding = !this.announcementFolding;
            },
            // 切换优惠券折叠状态
            handleDiscountFold() {
                this.discountFolding = !this.discountFolding;
            },
            // 切换收藏店铺状态
            handleChangeFavorite() {
                this.isFavourite = !this.isFavourite;
            },
            // 店铺名字点击事件
            handleStoreTitleClick() {
                this.showStoreInfoPopup = true;
            },
            // 切换菜单标签
            handleTabsChange(index) {
                this.currentTab = index;
            },
            // 打开搜索弹出层事件
            handleOpenSearchPopup() {
                this.searchResultList = [];
                this.searchValue = "";
                setTimeout(() => {
                    this.searchInputFocus = true;
                }, 0);
                this.showSearchPopup = true;
            },
            // 关闭搜索弹出层事件
            handleCloseSearchPopup() {
                this.searchResultList = [];
                this.searchValue = "";
                setTimeout(() => {
                    this.searchInputFocus = false;
                }, 0);
                this.showSearchPopup = false;
            },
            // 菜单中的类型点击事件
            handleTypeClick(id) {
                this.utils.throttle(() => {
                    this.currentTypeId = id;
                    this.scrollToTypeId = `type${id}`;
                }, 500);
            },
            // 菜单滑动触摸开始事件
            handleTouchStart(e) {
                const typeId = e.currentTarget.dataset.typeid;
                this.currentTypeId = parseInt(typeId);
            },
            /**
             * 用户领取优惠券
             * @param {Number|String} couponId 优惠券id
             */
            handleGetCoupon(couponId) {
                this.utils.throttle(() => {
                    userGetCoupon({
                        urlParam: {
                            storeId: this.storeInfo.id,
                            couponId,
                        },
                    }).then(res => {
                        if (res.success) {
                            this.$refs.toast.show({
                                text: '领取成功',
                                type: 'success',
                                direction: 'top'
                            });
                        }
                        else {
                            this.$refs.toast.show({
                                text: '领取失败',
                                type: 'error',
                                direction: 'top'
                            });
                        }
                    }).catch(error => {
                        console.error(error);
                        this.$refs.toast.show({
                            text: '领取失败',
                            type: 'error',
                            direction: 'top'
                        });
                    });
                }, 2500);
            },
            /**
             * 菜品添加按钮点击事件
             * @param {Object} e 默认事件
             * @param {Boolean} isFromMenu 是否从菜单调用，默认为false
             */
            handleAddCommodity(e, isFromMenu = false) {
                this.utils.throttle(() => {
                    const typeId = parseInt(e.currentTarget.dataset.typeid); //当前商品的类型Id
                    const commodityId = parseInt(e.currentTarget.dataset.commodityid); //当前商品Id
                    const cartId = e.currentTarget.dataset.cartid == null ? null : parseInt(e.currentTarget.dataset.cartid); //当前商品的购物车Id
                    const currentCustomOptions = JSON.parse(JSON.stringify(this.currentCustomOptions)); //当前填写的定制选项信息
                    if (!isFromMenu) {
                        //不是从菜单点击触发
                        let isExist = false; //购物车中是否已存在该商品
                        this.menuList.forEach((typeItem, typeIndex) => {
                            if (typeItem.id === typeId) {
                                !isNaN(typeItem.amount) ? typeItem.amount += 1 : typeItem.amount = 1;
                                //索引对应类型Id
                                typeItem.dishes.forEach((commodityItem, commodityIndex) => {
                                    if (commodityItem.id === commodityId) {
                                        //索引对应商品Id
                                        !isNaN(commodityItem.amount) ? commodityItem.amount += 1 : commodityItem.amount = 1;
                                        this.cartList.forEach((cartItem) => {
                                            if (cartItem.typeId === typeId && cartItem.commodityId === commodityId) {
                                                //购物车列表中已存在当前商品
                                                if (cartItem.customOptions) {
                                                    //购物车当前项有定制选项信息
                                                    if (JSON.stringify(cartItem.customOptions.customOptions) === JSON.stringify(currentCustomOptions.customOptions) || cartItem.cartId === cartId) {
                                                        //购物车当前项的定制选项信息与当前填写的定制选项信息匹配，或购物车当前项的Id与触发点击事件的购物车项Id相同
                                                        cartItem.amount += 1;
                                                        isExist = true;
                                                    }
                                                }
                                                else {
                                                    //购物车当前项没有定制选项信息
                                                    cartItem.amount += 1;
                                                    isExist = true;
                                                }
                                            }
                                        });
                                        if (!isExist) {
                                            //购物车列表中不存在当前商品
                                            let cartIdMax = Math.max.apply(
                                                Math,
                                                this.cartList.map(item => item.cartId)
                                            );
                                            cartIdMax = cartIdMax < 0 ? -1 : cartIdMax;
                                            let price, discountPrice, customOptions;
                                            if (
                                                currentCustomOptions !== {} &&
                                                currentCustomOptions.typeIndex === typeIndex &&
                                                currentCustomOptions.commodityIndex === commodityIndex
                                            ) {
                                                price = commodityItem.price + currentCustomOptions.customOptionPrice;
                                                discountPrice = commodityItem.discountPrice === null ? null : commodityItem.discountPrice + currentCustomOptions.customOptionPrice;
                                                customOptions = currentCustomOptions;
                                            }
                                            else {
                                                //当前商品不存在定制选项
                                                price = commodityItem.price;
                                                discountPrice = commodityItem.discountPrice;
                                                customOptions = [];
                                            }
                                            this.cartList.push({
                                                cartId: cartIdMax + 1, // {Number} 购物车id
                                                typeId: typeId, // {Number} 类型id
                                                commodityId: commodityId, // {Number} 商品id
                                                amount: 1, // {Number} 商品数量
                                                name: commodityItem.name, // {String} 商品名字
                                                imageUrl: commodityItem.imageUrl, // {String} 商品图片url
                                                description: commodityItem.description, // {String} 商品描述
                                                price: price, // {Number} 商品原价
                                                discountPrice: discountPrice, // {Number|NaN} 商品优惠价格
                                                packingCharges: commodityItem.packingCharges, // 打包费
                                                customOptions: customOptions  // {Object|Array} 商品定制选项信息
                                            }); //将商品加入购物车列表
                                            this.showCommodityDetailPopup = false;
                                        }
                                    }
                                });
                            }
                        });
                        this.$forceUpdate();
                    }
                    else {
                        //从菜单点击触发
                        this.menuList.forEach((typeItem, typeIndex) => {
                            if (typeItem.id === typeId) {
                                typeItem.dishes.forEach((communityItem, commodityIndex) => {
                                    if (communityItem.id === commodityId) {
                                        if (communityItem.customOptions.length) {
                                            this.handleShowCommodityPopup(typeIndex, commodityIndex);
                                        }
                                        else {
                                            this.handleAddCommodity(e);
                                        }
                                    }
                                });
                            }
                        });
                    }
                }, 300);
            },
            // 菜品减少按钮点击事件
            handleMinusCommodity(e) {
                this.utils.throttle(() => {
                    const typeId = parseInt(e.currentTarget.dataset.typeid); //当前商品的类型Id
                    const commodityId = parseInt(e.currentTarget.dataset.commodityid); //当前商品Id
                    const cartId = e.currentTarget.dataset.cartid == null ? null : parseInt(e.currentTarget.dataset.cartid); //当前商品的购物车Id
                    this.menuList.forEach(typeItem => {
                        if (typeItem.id === typeId) {
                            !isNaN(typeItem.amount) ? typeItem.amount -= 1 : typeItem.amount = 0;
                            typeItem.dishes.forEach((commodityItem) => {
                                if (commodityItem.id === commodityId) {
                                    if (commodityItem.amount !== 0) {
                                        //当前商品已选数量不为零
                                        !isNaN(commodityItem.amount) ? commodityItem.amount -= 1 : commodityItem.amount = 0;
                                        this.cartList.forEach((cartItem, cartItemIndex) => {
                                            if (cartItem.typeId === typeId && cartItem.commodityId === commodityId) {
                                                if (cartId !== null) {
                                                    //购物车id不为空
                                                    if (cartItem.cartId === cartId) {
                                                        //购物车id匹配
                                                        if (cartItem.amount === 1) {
                                                            //购物车中当前商品数量为1
                                                            this.cartList.splice(cartItemIndex, 1); //从购物车列表中移除
                                                        }
                                                        else {
                                                            cartItem.amount -= 1;
                                                        }
                                                    }
                                                }
                                                else {
                                                    //购物车id为空（从菜单调用操作）
                                                    if (cartItem.amount === 1) {
                                                        this.cartList.splice(cartItemIndex, 1);
                                                    }
                                                    else {
                                                        cartItem.amount -= 1;
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                    this.$forceUpdate();
                }, 300);
            },
            // 菜品减少按钮长按事件
            handleMinusCommodityLongPress(e) {
                const typeId = parseInt(e.currentTarget.dataset.typeid); //当前商品的类型Id
                const commodityId = parseInt(e.currentTarget.dataset.commodityid); //当前商品Id
                this.menuList.forEach(typeItem => {
                    if (typeItem.id === typeId) {
                        typeItem.dishes.forEach(commodity => {
                            if (commodity.id === commodityId) {
                                typeItem.amount -= commodity.amount;
                                commodity.amount = 0;
                            }
                        });
                    }
                });
                this.cartList.forEach((typeItem, typeIndex) => {
                    if (typeItem.typeId === typeId && typeItem.commodityId === commodityId) {
                        this.cartList.splice(typeIndex, 1); //从购物车列表中移除
                    }
                });
                this.$forceUpdate();
            },
            // 打开购物车弹出层事件
            handleOpenCartPopup() {
                this.showCartPopup = true;
            },
            // 清空购物车事件
            handleClearCartList() {
                this.cartList.forEach(cartItem => {
                    this.menuList.forEach(typeItem => {
                        if (typeItem.id === cartItem.typeId) {
                            typeItem.amount = 0;
                            typeItem.dishes.forEach(commodity => {
                                if (commodity.id === cartItem.commodityId) {
                                    commodity.amount = 0;
                                }
                            });
                        }
                    });
                });
                this.cartList = [];
                this.$forceUpdate();
            },
            /**
             * 商品详情弹出层显示事件
             * @param {Number} typeIndex 类型索引
             * @param {Number} commodityIndex 商品索引
             */
            handleShowCommodityPopup(typeIndex, commodityIndex) {
                this.utils.throttle(() => {
                    if (typeIndex != null && commodityIndex != null) {
                        this.currentSelectedCommodity = {
                            typeIndex: typeIndex,
                            commodityIndex: commodityIndex,
                        };
                        this.amountTemp = 1;
                        this.showCommodityDetailPopup = true;
                        this.menuList[typeIndex].dishes[commodityIndex].customOptionPrice = 0; //初始化当前菜品的定制选项总增值价格
                        if (this.menuList[typeIndex].dishes[commodityIndex].customOptions) {
                            this.currentCustomOptions = {};
                            this.menuList[typeIndex].dishes[commodityIndex].customOptions.forEach(customOption => {
                                if (customOption.isSingle) {
                                    //单选必选
                                    customOption.customItems.forEach((customItem, customItemIndex) => {
                                        if (customItemIndex === 0) {
                                            this.$set(customItem, "isSelected", true);
                                            this.$set(
                                                this.menuList[typeIndex].dishes[commodityIndex],
                                                "customOptionPrice",
                                                this.menuList[typeIndex].dishes[commodityIndex].customOptionPrice += customItem.customItemPrice
                                            ); //增加默认选中的定制选项价格
                                        }
                                        else {
                                            this.$set(customItem, "isSelected", false);
                                        }
                                    });
                                }
                                else {
                                    //多选可选
                                    customOption.customItems.forEach(customItem => {
                                        this.$set(customItem, "isSelected", false);
                                    });
                                }
                            });
                            this.currentCustomOptions = {
                                typeIndex: typeIndex,
                                commodityIndex: commodityIndex,
                                customOptions: this.menuList[typeIndex].dishes[commodityIndex].customOptions,
                                customOptionPrice: this.menuList[typeIndex].dishes[commodityIndex].customOptionPrice,
                            };
                        }
                    }
                }, 500);
            },
            // 商品详情弹出层关闭监听事件
            handleCloseCommodityPopup() {
                this.currentSelectedCommodity = {};
                this.currentCustomOptions = {};
                this.showCommodityDetailPopup = false;
                this.amountTemp = 1;
            },
            // 商品定制选项点击事件
            handleCustomOptionClick(e) {
                const {
                    typeindex: typeIndex,
                    commodityindex: commodityIndex,
                    optionindex: optionIndex,
                    optionitemindex: optionItemIndex,
                } = e.currentTarget.dataset;
                switch (
                    this.menuList[typeIndex].dishes[commodityIndex].customOptions[optionIndex]
                        .isSingle
                    ) {
                    case true:
                        //单选必选
                        this.menuList[typeIndex].dishes[commodityIndex].customOptions[
                            optionIndex
                            ].customItems.forEach((item, itemIndex) => {
                            if (item.isSelected) {
                                //当前选项已经处于选中状态
                                this.$set(
                                    this.menuList[typeIndex].dishes[commodityIndex],
                                    "customOptionPrice",
                                    this.menuList[typeIndex].dishes[commodityIndex].customOptionPrice -= item.customItemPrice
                                ); //减去定制选项的价格
                                this.$set(item, "isSelected", false);
                            }
                            if (itemIndex === optionItemIndex) {
                                //当前选项为目标选中的状态
                                this.$set(
                                    this.menuList[typeIndex].dishes[commodityIndex],
                                    "customOptionPrice",
                                    this.menuList[typeIndex].dishes[commodityIndex].customOptionPrice += item.customItemPrice
                                ); //增加定制选项的价格
                                this.$set(item, "isSelected", true);
                            }
                        });
                        break;
                    case false:
                        //多选可选
                        if (this.menuList[typeIndex].dishes[commodityIndex].customOptions[optionIndex].customItems[optionItemIndex].isSelected) {
                            //当前选项已经处于选中状态
                            this.$set(
                                this.menuList[typeIndex].dishes[commodityIndex],
                                "customOptionPrice",
                                this.menuList[typeIndex].dishes[commodityIndex].customOptionPrice -= this.menuList[typeIndex].dishes[commodityIndex].customOptions[optionIndex].customItems[optionItemIndex].customItemPrice
                            );
                            this.$set(this.menuList[typeIndex].dishes[commodityIndex].customOptions[optionIndex].customItems[optionItemIndex], "isSelected", false);
                        }
                        else {
                            //当前选项为目标选中的状态
                            this.$set(
                                this.menuList[typeIndex].dishes[commodityIndex],
                                "customOptionPrice",
                                this.menuList[typeIndex].dishes[commodityIndex].customOptionPrice += this.menuList[typeIndex].dishes[commodityIndex].customOptions[optionIndex].customItems[optionItemIndex].customItemPrice
                            );
                            this.$set(this.menuList[typeIndex].dishes[commodityIndex].customOptions[optionIndex].customItems[optionItemIndex], "isSelected", true);
                        }
                        break;
                }
                this.currentCustomOptions = {
                    typeIndex: typeIndex,
                    commodityIndex: commodityIndex,
                    customOptions: this.menuList[typeIndex].dishes[commodityIndex].customOptions,
                    customOptionPrice: this.menuList[typeIndex].dishes[commodityIndex].customOptionPrice,
                };
            },
            // 商品详情弹出框数量增加按钮点击事件
            handleAddAmountTemp() {
                this.utils.throttle(() => {
                    this.amountTemp += 1;
                }, 300);
            },
            // 商品详情弹出框数量减少按钮点击事件
            handleMinusAmountTemp() {
                this.utils.throttle(() => {
                    if (this.amountTemp > 1) {
                        this.amountTemp -= 1;
                    }
                }, 300);
            },
            // 商品详情弹出窗中的添加到购物车按钮点击事件
            handleAddToCartBtnClick(e) {
                this.utils.throttle(() => {
                    const typeId = parseInt(e.currentTarget.dataset.typeid); //当前商品的类型Id
                    const commodityId = parseInt(e.currentTarget.dataset.commodityid); //当前商品Id
                    const currentCustomOptions = JSON.parse(JSON.stringify(this.currentCustomOptions)); //当前填写的定制选项信息
                    const currentAmount = this.amountTemp; //当前选择的数量
                    let isExist = false; //购物车中是否已存在该商品
                    this.menuList.forEach((typeItem, typeIndex) => {
                        if (typeItem.id === typeId) {
                            !isNaN(typeItem.amount) ? typeItem.amount += currentAmount : typeItem.amount = currentAmount;
                            //索引对应类型Id
                            typeItem.dishes.forEach((commodityItem, commodityIndex) => {
                                if (commodityItem.id === commodityId) {
                                    //索引对应商品Id
                                    !isNaN(commodityItem.amount) ? commodityItem.amount += currentAmount : commodityItem.amount = currentAmount;
                                    this.cartList.forEach(cartItem => {
                                        if (cartItem.typeId === typeId && cartItem.commodityId === commodityId) {
                                            //购物车列表中已存在当前商品
                                            if (cartItem.customOptions) {
                                                //购物车当前项有定制选项信息
                                                if (JSON.stringify(cartItem.customOptions.customOptions) === JSON.stringify(currentCustomOptions.customOptions)) {
                                                    //购物车当前项的定制选项信息与当前填写的定制选项信息匹配，或购物车当前项的Id与触发点击事件的购物车项Id相同
                                                    cartItem.amount += currentAmount;
                                                    isExist = true;
                                                }
                                            }
                                            else {
                                                //购物车当前项没有定制选项信息
                                                cartItem.amount += currentAmount;
                                                isExist = true;
                                            }
                                        }
                                    });
                                    if (!isExist) {
                                        //购物车列表中不存在当前商品
                                        let cartIdMax = Math.max.apply(
                                            Math,
                                            this.cartList.map(item => item.cartId)
                                        );
                                        cartIdMax = cartIdMax < 0 ? -1 : cartIdMax;
                                        let price, discountPrice, customOptions;
                                        if (
                                            currentCustomOptions !== {} &&
                                            currentCustomOptions.typeIndex === typeIndex &&
                                            currentCustomOptions.commodityIndex === commodityIndex
                                        ) {
                                            price = currentCustomOptions.customOptionPrice;
                                            discountPrice = commodityItem.discountPrice === null ? null : currentCustomOptions.customOptionPrice;
                                            customOptions = currentCustomOptions;
                                        }
                                        else {
                                            //当前商品不存在定制选项
                                            price = commodityItem.price;
                                            discountPrice = commodityItem.discountPrice;
                                            customOptions = [];
                                        }
                                        this.cartList.push({
                                            cartId: cartIdMax + 1, // {Number} 购物车id
                                            typeId: typeId, // {Number} 类型id
                                            commodityId: commodityId, // {Number} 商品id
                                            amount: currentAmount, // {Number} 商品数量
                                            name: commodityItem.name, // {String} 商品名字
                                            imageUrl: commodityItem.imageUrl, // {String} 商品图片url
                                            description: commodityItem.description, // {String} 商品描述
                                            price: price, // {Number} 商品原价
                                            discountPrice: discountPrice, // {Number|NaN} 商品优惠价格
                                            packingCharges: commodityItem.packingCharges, // 打包费
                                            customOptions: customOptions  // {Object|Array} 商品定制选项信息
                                        }); //将商品加入购物车列表
                                    }
                                    this.showCommodityDetailPopup = false;
                                }
                            });
                        }
                    });
                    this.$forceUpdate();
                }, 1000);
            },
            /**
             * 查询搜索结果
             * @param {String} keyword 搜索的关键字
             * @return {Array} 结果数组
             */
            querySearchResult(keyword) {
                let result = [];
                this.menuList.forEach((typeItem, typeIndex) => {
                    typeItem.dishes.forEach((commodity, commodityIndex) => {
                        if (commodity.name.includes(keyword)) {
                            //商品名字包含搜索关键字
                            result.push({
                                typeId: typeItem.id,
                                commodityId: commodity.id,
                                typeIndex: typeIndex,
                                commodityIndex: commodityIndex,
                                commodityName: commodity.name,
                                commodityPrice: commodity.discountPrice === null ? commodity.price : commodity.discountPrice,
                                commodityImageUrl: commodity.imageUrl,
                            });
                        }
                    });
                });
                return result;
            },
            // 支付按钮点击事件
            handlePayBtnClick() {
                if (this.cartList.length > 0) {
                    uni.navigateTo({
                        url: "/pagesByStore/order/order",
                        success: res => {
                            res.eventChannel.emit("acceptDataFromOpenerPage", {
                                cartList: this.cartList,
                                storeInfo: this.storeInfo,
                            });
                        },
                    });
                }
            },
        },
        computed: {
            /**
             * 计算购物车总价（现价，包含优惠）
             * @return {Number} 计算的总价
             */
            totalPrice() {
                let totalPrice = 0;
                this.cartList.forEach(cartItem => {
                    totalPrice += (cartItem.discountPrice === null ? cartItem.price : cartItem.discountPrice) * cartItem.amount;
                });
                return parseInt(totalPrice) !== totalPrice ? totalPrice.toFixed(2) : totalPrice;
            },
            /**
             * 计算购物车总价（原价，不含优惠）
             * @return {Number} 计算的总价
             */
            totalOriginalPrice() {
                let totalOriginalPrice = 0;
                this.cartList.forEach(cartItem => {
                    totalOriginalPrice += cartItem.price * cartItem.amount;
                });
                return parseInt(totalOriginalPrice) !== totalOriginalPrice ? totalOriginalPrice.toFixed(2) : totalOriginalPrice;
            },
            /**
             * 计算购物车总数量
             * @return {Number} 计算的数量
             */
            totalAmount() {
                let totalAmount = 0;
                this.cartList.forEach((cartItem) => {
                    totalAmount += cartItem.amount;
                });
                return totalAmount;
            },
        },
        filters: {
            /**
             * 格式化价格显示
             * @param {Number} likeRate 好评率
             * @return {String} 格式化后的好评率
             */
            showLikeRate(likeRate) {
                return typeof likeRate !== "number" ? `0%` : `${likeRate * 100}%`;
            },
            /**
             * 格式化购物车中商品的定制选项信息
             * @param customOptions {Array | Null} 定制选项信息
             * @return {String} 格式化后的定制选项信息
             */
            showCartCustomOptions(customOptions) {
                if (customOptions) {
                    let result = [];
                    customOptions.forEach(option => {
                        option.customItems.forEach(item => {
                            if (item.isSelected) {
                                result.push(item.customItemTitle);
                            }
                        });
                    });
                    return result.join("；");
                }
                else {
                    return "";
                }
            },
        },
        watch: {
            // 搜索输入框监听事件
            searchValue(nval) {
                if (nval == null || nval === "") {
                    this.searchResultList = [];
                }
                else {
                    if (this.searchValue !== "" && this.searchValue != null) {
                        this.searchResultList = this.querySearchResult(nval);
                    }
                }
            },
            // 购物车列表监听事件
            cartList(nval) {
                this.payable = nval.length > 0;
                this.$forceUpdate();
            },
        },
        mounted() {
        },
        async onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            this.$refs.loading.startLoading();
            try {
                let storeInfo = {};
                const eventChannel = this.getOpenerEventChannel();
                eventChannel.on("storeInfo", data => {
                    storeInfo = data.storeInfo;
                    if (storeInfo.id) {
                        const getInfoPromise = new Promise((resolve, reject) => {
                            getStoreInfo({
                                urlParam: {
                                    storeId: storeInfo.id
                                }
                            }).then(res => {
                                if (res.success) {
                                    this.storeInfo = res.data;
                                    resolve();
                                }
                                else {
                                    reject(res);
                                }
                            }).catch(err => {
                                reject(err);
                            });
                        });
                        //获取优惠券信息
                        const getCouponPromise = new Promise((resolve, reject) => {
                            getCouponByStoreId({
                                urlParam: {
                                    storeId: storeInfo.id
                                },
                            }).then(res => {
                                let coupons = this.discountTags;
                                if (res.success) {
                                    res.data.forEach(coupon => {
                                        coupons.push({
                                            id: coupon.id,
                                            content: coupon.withAmount / 100.0 + "减" + coupon.usedAmount / 100.0,
                                            backgroundColor: "#fff",
                                            color: "#f4756b",
                                            borderColor: "#f4756b",
                                        });
                                    });
                                    this.discountTags = coupons;
                                    resolve();
                                }
                                else {
                                    reject(res);
                                }
                            }).catch(err => {
                                reject(err);
                            });
                        });
                        //获取店铺菜单
                        const getMenuPromise = new Promise((resolve, reject) => {
                            getStoreMenu({
                                urlParam: storeInfo.id,
                            }).then(res => {
                                if (res.success) {
                                    this.menuList = res.data;
                                    resolve();
                                }
                                else {
                                    reject(res);
                                }
                            }).catch(err => {
                                reject(err);
                            });
                        });
                        Promise.all([getInfoPromise, getCouponPromise, getMenuPromise]).then(res => {
                            this.$refs.loading.stopLoading();
                        }).catch(err => {
                            console.error(err);
                            this.$refs.toast.show({
                                text: '获取店铺菜单失败',
                                type: 'error',
                                direction: 'top'
                            });
                        });
                    }
                    else {
                        console.error(storeInfo);
                        this.$refs.toast.show({
                            text: '获取店铺菜单失败',
                            type: 'error',
                            direction: 'top'
                        });
                    }
                });
            } catch (err) {
                console.error(err);
                uni.navigateBack();
            }
        },
        onShow() {
            this.$refs.navigationBar.setNavigation({
                // titleText: '',
                // backgroundColor: ''
            });
        },
    };
</script>

<style lang="scss" scoped>
  @import 'storeMenu';
</style>