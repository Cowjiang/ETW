<template>
    <view>
        <navigationBar ref="navigationBar" class="navigation-bar"/>
        <toast ref="toast"/>
        <loading ref="loading" fullscreen maskColor="#f6f6f6"></loading>

        <view class="store-menu-container">
            <view
                class="store-image-container"
                :style="{height: `${navigationHeight + 200}px`}">
                <image src="../../static/images/test.jpg" mode="aspectFill"></image>
            </view>
            <view
                class="store-info-container">
                <view class="store-title-container">
                    <view class="avatar-container">
                        <image class="avatar" src="../../static/images/testLogo.jpg" mode="widthFix"></image>
                    </view>
                    <view class="title-container">
                        <view class="title">
                            <view class="title-text">
                                {{ storeInfo.name }}
                            </view>
                            <i class="fa fa-angle-right" aria-hidden="true"></i>
                        </view>
                        <view class="tags-container">
                            <view>营业中</view>
                            <view>好评率84%</view>
                            <view>月销1447</view>
                        </view>
                    </view>
                    <view class="favorite-container">
                        <view class="favorite-btn" @click="handleChangeFavorite">
                            <i class="fa fa-star-o" aria-hidden="true" v-show="!isFavourite"></i>
                            <i class="fa fa-star" aria-hidden="true" v-show="isFavourite"></i>
                        </view>
                    </view>
                </view>
                <view class="announcement-container" @click="handleAnnouncementFold">
                    <i class="fa fa-volume-down" aria-hidden="true"></i>
                    <view
                        class="announcement-text"
                        :style="{whiteSpace: `${announcementFolding ? 'nowrap' : 'normal'}`}">
                        {{ storeInfo.announcement }}
                    </view>
                    <view class="unfold-btn" @click.stop="" @click="handleAnnouncementFold">
                        <i
                            class="fa fa-angle-down"
                            aria-hidden="true"
                            :style="{transform: `${announcementFolding ? 'rotate(0deg)' : 'rotate(180deg)'}`}"></i>
                    </view>
                </view>
                <view class="discount-container" @click="handleDiscountFold">
                    <view
                        class="discount-tags"
                        :style="{height: `${discountFolding ? 'rpx(40)' : 'fit-content'}`}">
                        <view
                            class="tag"
                            v-for="(tag, index) in discountTags"
                            :key="index"
                            :style="{
                                backgroundColor: tag.backgroundColor,
                                borderColor: tag.borderColor,
                                color: tag.color
                            }">
                            {{ tag.content }}
                        </view>
                    </view>
                    <view class="unfold-btn" @click.stop="" @click="handleDiscountFold">
                        <view :style="{opacity: `${discountFolding ? 1 : 0}`}">
                            更多
                        </view>
                        <i
                            class="fa fa-angle-down"
                            aria-hidden="true"
                            :style="{transform: `${discountFolding ? 'rotate(0deg)' : 'rotate(180deg)'}`}"></i>
                    </view>
                </view>
            </view>
            <view
                class="menu-container"
                :style="{height: `${windowHeight - navigationHeight - 130}px`}">
                <view class="menu-top-tabs-container">
                    <view class="u-tabs-container">
                        <u-tabs
                            class="u-tabs"
                            :list="menuTabs"
                            :is-scroll="false"
                            :current="currentTab"
                            active-color="#f4756b"
                            :bar-height="8"
                            @change="handleTabsChange"
                        ></u-tabs>
                    </view>
                    <view class="search-btn-container" @click="handleOpenSearchPopup">
                        <i class="fa fa-search" aria-hidden="true"></i>
                        搜索
                    </view>
                </view>
                <view class="menu" v-if="currentTab === 0">
                    <scroll-view
                        class="type-container"
                        :scroll-y="true">
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
                            <view>
                                {{ type.typeName }}
                            </view>
                        </view>
                        <view
                            class="bottom-empty-box"
                            :style="{borderTopRightRadius: `${currentTypeId === menuList.length ? '20rpx' : '0'}`}">
                        </view>
                    </scroll-view>
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
                                :data-name="`type${type.id}`"
                                @touchstart="handleTouchStart">
                                <view
                                    class="commodity-image-container"
                                    @click="handleShowCommodityPopup(typeIndex, commodityIndex)">
                                    <view class="commodity-image"></view>
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
                                        月销 99
                                    </view>
                                    <view class="price-container">
                                        <view class="price">
                                            <view class="current-price">
                                                ￥
                                                <text>
                                                    {{
                                                        parseInt(commodity.discountPrice === null ? commodity.originalPrice : commodity.discountPrice)
                                                    }}
                                                </text>
                                                <text>
                                                    {{
                                                        commodity.discountPrice === null ? (commodity.originalPrice.toString().split('.')[1] === undefined ? '' : `.${commodity.originalPrice.toString().split('.')[1]}`) : (commodity.discountPrice.toString().split('.')[1] === undefined ? '' : `.${commodity.discountPrice.toString().split('.')[1]}`)
                                                    }}
                                                </text>
                                            </view>
                                            <view class="origin-price" v-if="commodity.discountPrice !== null">
                                                {{ commodity.originalPrice | showPrice }}
                                            </view>
                                        </view>
                                        <view class="amount-btn-container" @click.stop="">
                                            <i
                                                class="fa fa-minus-circle"
                                                aria-hidden="true"
                                                :data-name="`${type.id}&${commodity.id}`"
                                                v-show="commodity.amount !== 0 && !isNaN(commodity.amount) && commodity.amount !== undefined"
                                                @click="handleMinusCommodity"></i>
                                            <view
                                                class="amount"
                                                v-show="commodity.amount !== 0 && !isNaN(commodity.amount) && commodity.amount !== undefined">
                                                {{ commodity.amount || 0 }}
                                            </view>
                                            <i
                                                class="fa fa-plus-circle"
                                                aria-hidden="true"
                                                :data-name="`${type.id}&${commodity.id}`"
                                                @click="handleAddCommodity"></i>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </view>
                        <view class="bottom-empty-box"></view>
                    </scroll-view>
                </view>
                <u-popup
                    v-model="showCartPopup"
                    mode="bottom"
                    width="100%"
                    height="40%"
                    border-radius="30"
                    z-index="3">
                    <view class="shopping-cart-container">
                        <view class="title-container">
                            <view class="amount-container">
                                共 {{ totalAmount }} 件商品
                            </view>
                            <view class="clear-btn-container" @click="handleClearCartList">
                                <i class="fa fa-trash-o" aria-hidden="true"></i>
                                清空购物车
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
                                    <view
                                        class="commodity"
                                        v-for="item in cartList"
                                        :key="item.id">
                                        <view class="image-container">
                                            <view class="image"></view>
                                        </view>
                                        <view class="info-container">
                                            <view class="name">
                                                {{ item.name }}
                                            </view>
                                            <view class="description">
                                                <!-- 用于展示规格 -->
                                            </view>
                                            <view class="price">
                                                {{
                                                    item.discountPrice === null ? item.originalPrice : item.discountPrice | showPrice
                                                }}
                                            </view>
                                        </view>
                                        <view class="amount-container">
                                            <view class="amount-btn-container">
                                                <i
                                                    class="fa fa-minus-circle"
                                                    aria-hidden="true"
                                                    :data-name="`${item.typeId}&${item.commodityId}`"
                                                    @click="handleMinusCommodity"></i>
                                                <view class="amount">
                                                    {{ item.amount || 0 }}
                                                </view>
                                                <i
                                                    class="fa fa-plus-circle"
                                                    aria-hidden="true"
                                                    :data-name="`${item.typeId}&${item.commodityId}`"
                                                    @click="handleAddCommodity"></i>
                                            </view>
                                        </view>
                                    </view>
                                </scroll-view>
                            </view>
                        </view>
                    </view>
                </u-popup>
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
                                <i class="fa fa-search" aria-hidden="true"></i>
                                <input
                                    type="text"
                                    v-model="searchValue"
                                    :focus="searchInputFocus"
                                    placeholder="搜索商品名称">
                            </view>
                            <view
                                class="cancel-btn"
                                @click="handleCloseSearchPopup">
                                取消
                            </view>
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
                                        <view class="image"></view>
                                    </view>
                                    <view class="info-container">
                                        <text>{{ result.commodityName.split(searchValue)[0] }}</text>
                                        <text class="search-key-text">{{ searchValue }}</text>
                                        <text>{{ result.commodityName.split(searchValue)[1] }}</text>
                                    </view>
                                    <view class="price-container">
                                        {{ result.commodityPrice | showPrice }}
                                    </view>
                                </view>
                            </scroll-view>
                        </view>
                    </view>
                </u-popup>
                <u-popup
                    class="commodity-detail-popup"
                    v-model="showCommodityDetailPopup"
                    mode="center"
                    width="80%"
                    border-radius="30"
                    closeable
                    z-index="5"
                    @close="handleCloseCommodityPopup">
                    <view class="commodity-detail-container" v-if="currentSelectedCommodity.commodityIndex!==undefined">
                        <view class="image-container">
                            <view class="image"></view>
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
                        </view>
                        <view class="price-container">
                            <view class="price">
                                {{
                                    menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].discountPrice == null
                                        ? menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].originalPrice
                                        : menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].discountPrice
                                        | showPrice
                                }}
                            </view>
                            <view class="amount-btn">
                                <i
                                    class="fa fa-minus-circle"
                                    aria-hidden="true"
                                    v-show="menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].amount !== 0
                                        && !isNaN(menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].amount)
                                        && menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].amount !== undefined"
                                    :data-name="`${menuList[currentSelectedCommodity.typeIndex].id}&${menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].id}`"
                                    @click="handleMinusCommodity"></i>
                                <view
                                    class="amount"
                                    v-show="menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].amount !== 0
                                        && !isNaN(menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].amount)
                                        && menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].amount !== undefined">
                                    {{
                                        menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].amount
                                    }}
                                </view>
                                <i
                                    class="fa fa-plus-circle"
                                    aria-hidden="true"
                                    :data-name="`${menuList[currentSelectedCommodity.typeIndex].id}&${menuList[currentSelectedCommodity.typeIndex].dishes[currentSelectedCommodity.commodityIndex].id}`"
                                    @click="handleAddCommodity"></i>
                            </view>
                        </view>
                    </view>
                </u-popup>
                <view class="cart-bar-container" v-show="currentTab === 0">
                    <view
                        class="cart-btn-container"
                        @click="handleOpenCartPopup"
                        :style="{transform: `${showCartPopup ? 'translateX(-100rpx)' : 'translateX(30rpx)'}`}">
                        <i class="fa fa-shopping-cart" aria-hidden="true"></i>
                        <view class="total-amount" v-show="totalAmount !== 0">
                            {{ totalAmount }}
                        </view>
                    </view>
                    <view class="cart-bar">
                        <view
                            class="price-container"
                            :style="{marginLeft: `${showCartPopup ? '40rpx' : '150rpx'}`, color: `${ showCartPopup ? '#f4756b' : '#333'}`}">
                            ￥
                            <text>
                                {{ parseInt(totalPrice) }}
                            </text>
                            <text>
                                {{
                                    totalPrice.toString().split('.')[1] === undefined ? '' : `.${totalPrice.toString().split('.')[1]}`
                                }}
                            </text>
                            <text
                                class="origin-price"
                                v-show="totalOriginalPrice !== totalPrice">
                                ￥{{ totalOriginalPrice }}
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
                storeInfo: {
                    storeId: 0, // {Number} 店铺id，必需
                    name: '必胜客（太平店）', // {String} 店铺名字，必需
                    addressDetails: '广东省广州市从化区太平镇乐东路385号（峰达电器城旁）', // {String} 店铺地址详情，必需
                    phone: '020-88900280', // {String} 店铺联系电话，必需
                    openingTime: '工作日9:00-21:00，节假日9:00-24:00',  // {String} 店铺营业时间，必需
                    longitude: 113.492195, // {Number|NaN} 店铺经度，必需
                    latitude: 23.452394, // {Number|NaN} 店铺纬度，必需
                    areaCode: '440103', // {String} 行政编码
                    imageUrl: '', // {String} 店铺Logo的Url
                    announcement: '必胜客快餐，全国门店十万家，总有你喜欢的！广东省广州市从化区太平镇乐东路385号' // {String} 店铺公告
                }, //店铺信息
                discountTags: [
                    {
                        id: 1,
                        content: '新客优惠',
                        backgroundColor: '#f4756b',
                        color: '#fff',
                        borderColor: 'f4756b'
                    },
                    {
                        id: 2,
                        content: '20减12',
                        backgroundColor: '#fff',
                        color: '#f4756b',
                        borderColor: 'f4756b'
                    },
                    {
                        id: 3,
                        content: '30减18',
                        backgroundColor: '#fff',
                        color: '#f4756b',
                        borderColor: 'f4756b'
                    },
                    {
                        id: 4,
                        content: '50减25',
                        backgroundColor: '#fff',
                        color: '#f4756b',
                        borderColor: 'f4756b'
                    },
                    {
                        id: 5,
                        content: '75减40',
                        backgroundColor: '#fff',
                        color: '#f4756b',
                        borderColor: 'f4756b'
                    },
                    {
                        id: 6,
                        content: '0元配送',
                        backgroundColor: '#fff',
                        color: '#f4756b',
                        borderColor: 'f4756b'
                    },
                ], //优惠券标签
                announcementFolding: true, //公告折叠状态
                discountFolding: true, //优惠券折叠状态
                isFavourite: false, //是否收藏店铺
                menuTabs: [
                    {
                        name: '点餐'
                    }, {
                        name: '评价'
                    }, {
                        name: '商家',
                    }
                ], //菜单标签
                currentTab: 0, //当前标签序号
                menuList: [
                    {
                        id: 1,
                        typeName: '当季限定',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感巴拉巴拉巴拉巴拉',
                                originalPrice: 39,
                                discountPrice: 32.9,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 2,
                        typeName: '人气必点',
                        dishes: [
                            {
                                id: 1,
                                name: '多肉雪山青提',
                                imageUrl: '',
                                description: '超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 3,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 4,
                        typeName: '茗茶/波波家族啊啊啊啊啊',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 5,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 6,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 7,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 8,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 9,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 10,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 11,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 12,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 13,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 14,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                    {
                        id: 15,
                        typeName: '水果家族',
                        dishes: [
                            {
                                id: 1,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originalPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                ], //菜单内容
                currentTypeId: 1, //当前菜单显示的类型编号
                scrollToTypeId: '', //要滑动到的类型Id
                cartList: [], //购物车列表
                showCartPopup: false, //是否显示购物车弹出层
                searchResultList: [], //搜索结果列表
                showSearchPopup: false, //是否显示搜索弹出层
                searchValue: '', //搜索输入框的值
                searchInputFocus: false, //搜索输入框聚焦状态
                showCommodityDetailPopup: false,
                currentSelectedCommodity: {}, //当前选择的商品信息，用于商品详情弹出框的信息展示
                payable: false, //支付按钮是否可点击
            }
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
            // 切换菜单标签
            handleTabsChange(index) {
                this.currentTab = index;
            },
            // 打开搜索弹出层事件
            handleOpenSearchPopup() {
                this.searchResultList = [];
                this.searchValue = '';
                setTimeout(() => {
                    this.searchInputFocus = true;
                }, 0);
                this.showSearchPopup = true;
            },
            // 关闭搜索弹出层事件
            handleCloseSearchPopup() {
                this.searchResultList = [];
                this.searchValue = '';
                setTimeout(() => {
                    this.searchInputFocus = false;
                }, 0);
                this.showSearchPopup = false;
            },
            // 菜单中的类型点击事件
            handleTypeClick(id) {
                this.currentTypeId = id;
                this.scrollToTypeId = `type${id}`;
            },
            // 菜单滑动触摸开始事件
            handleTouchStart(e) {
                let typeId = e.currentTarget.dataset.name.replace('type', '');
                this.currentTypeId = parseInt(typeId);
            },
            // 菜品添加按钮点击事件
            handleAddCommodity(e) {
                let typeId = parseInt(e.currentTarget.dataset.name.split('&')[0]); //当前商品的类型Id
                let commodityId = parseInt(e.currentTarget.dataset.name.split('&')[1]); //当前商品Id
                let isExist = false; //购物车中是否已存在该商品
                this.menuList.forEach((v, k) => {
                    if (v.id === typeId) {
                        //索引对应类型Id
                        this.menuList[k].dishes.forEach((val, key) => {
                            if (val.id === commodityId) {
                                //索引对应商品Id
                                !isNaN(val.amount) ? val.amount += 1 : val.amount = 1;
                                this.cartList.forEach((v, k) => {
                                    if (v.typeId === typeId && v.commodityId === commodityId) {
                                        //购物车列表中已存在当前商品
                                        v.amount += 1;
                                        isExist = true;
                                        return;
                                    }
                                });
                                if (!isExist) {
                                    //购物车列表中不存在当前商品
                                    this.cartList.push({
                                        typeId: typeId, // {Number} 类型id
                                        commodityId: commodityId, // {Number} 商品id
                                        amount: 1, // {Number} 商品数量
                                        name: val.name, // {String} 商品名字
                                        imageUrl: val.imageUrl, // {String} 商品图片url
                                        description: val.description, // {String} 商品描述
                                        originalPrice: val.originalPrice, // {Number} 商品原价
                                        discountPrice: val.discountPrice, // {Number|NaN} 商品优惠价格
                                    }); //将商品加入购物车列表
                                }
                            }
                        });
                    }
                });
                this.$forceUpdate();
            },
            // 菜品减少按钮点击事件
            handleMinusCommodity(e) {
                let typeId = parseInt(e.currentTarget.dataset.name.split('&')[0]);
                let commodityId = parseInt(e.currentTarget.dataset.name.split('&')[1]);
                this.menuList.forEach((v, k) => {
                    if (v.id === typeId) {
                        this.menuList[k].dishes.forEach((val, key) => {
                            if (val.id === commodityId) {
                                if (this.menuList[k].dishes[key].amount !== 0) {
                                    //当前商品已选数量不为零
                                    !isNaN(val.amount) ? val.amount -= 1 : val.amount = 0;
                                    this.cartList.forEach((v, k) => {
                                        if (v.typeId === typeId && v.commodityId === commodityId) {
                                            if (v.amount === 1) {
                                                //购物车中当前商品数量为1
                                                this.cartList.splice(k, 1); //从购物车列表中移除
                                            }
                                            else {
                                                v.amount -= 1;
                                            }
                                            return;
                                        }
                                    });
                                }
                            }
                        });
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
                this.cartList.forEach((v, k) => {
                    this.menuList.forEach((type, typeIndex) => {
                        if (type.id == v.typeId) {
                            type.dishes.forEach((dish, dishIndex) => {
                                if (dish.id == v.commodityId) {
                                    dish.amount = 0;
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
             * @param typeIndex {Number} 类型索引
             * @param commodityIndex {Number} 商品索引
             */
            handleShowCommodityPopup(typeIndex, commodityIndex) {
                if (typeIndex != null && commodityIndex != null) {
                    this.currentSelectedCommodity = {
                        typeIndex: typeIndex,
                        commodityIndex: commodityIndex
                    };
                    this.showCommodityDetailPopup = true;
                }
            },
            // 商品详情弹出层关闭事件
            handleCloseCommodityPopup() {
                this.currentSelectedCommodity = {};
                this.showCommodityDetailPopup = false;
            },
            /**
             * 查询搜索结果
             * @param keyword {String} 搜索的关键字
             * @return {Array} 结果数组
             */
            querySearchResult(keyword) {
                let result = [];
                this.menuList.forEach((type, typeIndex) => {
                    type.dishes.forEach((commodity, commodityIndex) => {
                        if (commodity.name.includes(keyword)) {
                            //商品名字包含搜索关键字
                            result.push({
                                typeId: type.id,
                                commodityId: commodity.id,
                                typeIndex: typeIndex,
                                commodityIndex: commodityIndex,
                                commodityName: commodity.name,
                                commodityPrice: commodity.discountPrice === null ? commodity.originalPrice : commodity.discountPrice,
                                commodityImageUrl: commodity.imageUrl
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
                        url: '/pagesByStore/order/order'
                    });
                }
            }
        },
        computed: {
            /**
             * 计算购物车总价（现价，包含优惠）
             * @return {Number} 计算的总价
             */
            totalPrice() {
                let totalPrice = 0;
                this.cartList.forEach((v, k) => {
                    totalPrice += (v.discountPrice === null ? v.originalPrice : v.discountPrice) * v.amount;
                });
                if (parseInt(totalPrice) !== totalPrice) {
                    return totalPrice.toFixed(2);
                }
                else {
                    return totalPrice;
                }
            },
            /**
             * 计算购物车总价（原价，不含优惠）
             * @return {Number} 计算的总价
             */
            totalOriginalPrice() {
                let totalOriginalPrice = 0;
                this.cartList.forEach((v, k) => {
                    totalOriginalPrice += v.originalPrice * v.amount;
                });
                if (parseInt(totalOriginalPrice) !== totalOriginalPrice) {
                    return totalOriginalPrice.toFixed(2);
                }
                else {
                    return totalOriginalPrice;
                }
            },
            /**
             * 计算购物车总数量
             * @return {Number} 计算的数量
             */
            totalAmount() {
                let totalAmount = 0;
                this.cartList.forEach((v, k) => {
                    totalAmount += v.amount;
                });
                return totalAmount;
            },
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
        },
        watch: {
            // 搜索输入框监听事件
            searchValue(nval, oval) {
                if (oval == null || oval === '' && nval !== '' && nval != null) {
                    this.searchResultList = this.querySearchResult(nval);
                }
                else {
                    this.utils.debounce(() => {
                        if (nval !== '' && nval != null) {
                            this.searchResultList = this.querySearchResult(nval);
                        }
                        else {
                            this.searchResultList = [];
                        }
                    }, 500);
                }
            },
            // 购物车列表监听事件
            cartList(nval) {
                this.payable = nval.length > 0;
                this.$forceUpdate();
            }
        },
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
                // titleText: '确认订单',
                // backgroundColor: '#f6f6f6'
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
    .store-menu-container {
        width: 100vw;
        height: 100vh;
        background-color: #f6f6f6;
        display: flex;
        flex-direction: column;

        .store-image-container {
            width: 100vw;
            height: fit-content;
            position: absolute;
            top: 0;
            left: 0;
            background-color: #f6f6f6;
            overflow: hidden;

            image {
                width: 100%;
                height: 100%;
            }
        }

        .store-info-container {
            width: calc(100% - 60rpx);
            height: fit-content;
            padding: rpx(40);
            margin-left: rpx(30);
            position: relative;
            top: rpx(250);
            z-index: 2;
            background-color: #fff;
            border-radius: rpx(30);
            box-shadow: rgba(50, 50, 50, 0.1) -4px 9px 10px -6px;
            transition-property: height;
            transition-duration: 300ms;

            .store-title-container {
                width: 100%;
                height: fit-content;
                display: flex;
                flex-direction: row;

                .avatar-container {
                    width: rpx(90);
                    height: rpx(90);
                    border-radius: rpx(30);
                    overflow: hidden;
                    flex-shrink: 0;

                    .avatar {
                        width: 100%;
                        height: 100%;
                        background-color: #f1f1f1;
                    }
                }

                .title-container {
                    width: calc(100% - 170rpx);
                    height: fit-content;
                    display: flex;
                    flex-direction: column;
                    padding: 0 rpx(20);
                    color: #333;

                    .title {
                        width: 100%;
                        height: fit-content;
                        display: flex;
                        flex-direction: row;
                        font-size: rpx(36);
                        line-height: rpx(48);
                        white-space: nowrap;
                        overflow: hidden;

                        .title-text {
                            width: fit-content;
                            max-width: calc(100% - 50rpx);
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        .fa {
                            flex-shrink: 0;
                            margin-left: rpx(10);
                            font-size: rpx(44);
                            line-height: rpx(48);
                            color: #888;
                        }
                    }

                    .tags-container {
                        width: 100%;
                        height: fit-content;
                        display: flex;
                        flex-direction: row;
                        margin-top: rpx(10);
                        font-size: rpx(24);
                        color: #555;
                        overflow: hidden;

                        view {
                            width: fit-content;
                            padding: 0 rpx(6);
                            white-space: nowrap;
                            overflow: hidden;
                            flex-shrink: 0;
                        }

                        view:first-child {
                            padding-left: 0;
                        }

                        view:last-child {
                            padding-right: 0
                        }
                    }
                }

                .favorite-container {
                    width: rpx(80);
                    height: fit-content;

                    .favorite-btn {
                        font-size: rpx(38);
                        text-align: right;
                        line-height: rpx(48);
                        padding-right: rpx(10);

                        .fa-star {
                            color: #f4756b;
                        }
                    }
                }
            }

            .announcement-container {
                width: 100%;
                height: fit-content;
                display: flex;
                flex-direction: row;
                margin-top: rpx(14);
                font-size: rpx(24);
                color: #888;

                .fa-volume-down {
                    width: rpx(34);
                    height: fit-content;
                    flex-shrink: 0;
                    font-size: rpx(34);
                    line-height: rpx(40);
                }

                .announcement-text {
                    width: 100%;
                    max-width: calc(100% - 84rpx);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    //white-space: normal;
                    line-height: rpx(40);
                }

                .unfold-btn {
                    width: rpx(40);
                    height: fit-content;
                    flex-shrink: 0;
                    font-size: rpx(34);
                    text-align: right;
                    line-height: rpx(40);

                    .fa {
                        transition-property: transform;
                        transition-duration: 300ms;
                    }
                }
            }

            .discount-container {
                width: 100%;
                height: fit-content;
                display: flex;
                flex-direction: row;
                font-size: rpx(24);
                color: #888;
                margin-top: rpx(20);
                padding-right: rpx(10);

                .discount-tags {
                    width: calc(100%);
                    height: rpx(40);
                    max-width: calc(100% - 100rpx);
                    //height: fit-content;
                    display: flex;
                    flex-direction: row;
                    overflow: hidden;
                    flex-wrap: wrap;
                    transition-property: height;
                    transition-duration: 300ms;

                    .tag {
                        width: fit-content;
                        height: rpx(36);
                        margin-right: rpx(10);
                        margin-bottom: rpx(8);
                        padding: 0 rpx(8);
                        flex-shrink: 0;
                        font-size: rpx(22);
                        line-height: rpx(30);
                        background-color: #f4756b;
                        color: #fff;
                        //color: #f4756b;
                        border-radius: rpx(8);
                        border: rpx(2) solid #f4756b;
                    }
                }

                .unfold-btn {
                    width: rpx(100);
                    height: fit-content;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: row;

                    view {
                        width: 100%;
                        font-size: rpx(24);
                        line-height: rpx(36);
                        text-align: right;
                        transition-property: opacity;
                        transition-duration: 300ms;
                    }

                    .fa {
                        width: fit-content;
                        flex-shrink: 0;
                        margin-left: rpx(10);
                        font-size: rpx(34);
                        line-height: rpx(36);
                        text-align: right;
                        transition-property: transform;
                        transition-duration: 300ms;
                    }
                }
            }
        }

        .menu-container {
            width: 100%;
            height: rpx(1000);
            //margin-top: rpx(20);
            //padding: rpx(30);
            //position: absolute;
            //top: rpx(350);
            position: relative;
            top: rpx(170);
            background-color: #fff;
            border-radius: rpx(30);
            box-shadow: rgba(17, 17, 26, 0.05) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px;

            .menu-top-tabs-container {
                width: 100%;
                height: fit-content;
                margin-top: rpx(90);
                margin-bottom: rpx(30);
                display: flex;
                flex-direction: row;

                .u-tabs-container {
                    width: 55vw;
                    flex-shrink: 0;

                    .u-tabs {

                    }
                }

                .search-btn-container {
                    width: 100%;
                    height: fit-content;
                    font-size: rpx(28);
                    color: #666;
                    text-align: right;
                    line-height: rpx(80);
                    padding-right: rpx(40);

                    .fa {
                        margin-right: rpx(10);
                        color: #777;
                    }
                }
            }

            .menu {
                width: 100%;
                height: calc(100% - 200rpx);
                display: flex;
                flex-direction: row;

                .type-container {
                    width: rpx(180);
                    height: 100%;
                    flex-shrink: 0;
                    background-color: #fff;
                    border-radius: rpx(20) rpx(20) 0 0;

                    .type-item-container__default {
                        width: 100%;
                        height: fit-content;
                        min-height: rpx(100);
                        padding: rpx(30) rpx(20);
                        font-size: rpx(26);
                        color: #888;
                        background-color: #f6f6f6;
                        border-left: rpx(6) solid #f6f6f6;
                        transition-property: color, background-color, border-left, border-radius;
                        transition-duration: 300ms;

                        view {
                            width: fit-content;
                            height: fit-content;
                            text-overflow: -o-ellipsis-lastline;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: -webkit-box;
                            line-clamp: 2;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                        }
                    }

                    .type-item-container__default:first-child {
                        border-top-right-radius: rpx(20);
                    }

                    .type-item-container__selected {
                        color: #555;
                        background-color: #fff;
                        border-left: rpx(6) solid #f4756b;
                    }

                    .type-item-container__selected-before {
                        border-radius: 0 0 rpx(20) 0;
                    }

                    .type-item-container__selected-after {
                        border-radius: 0 rpx(20) 0 0;
                    }

                    .bottom-empty-box {
                        width: 100%;
                        height: rpx(300);
                        background-color: #f6f6f6;
                        border-top-right-radius: rpx(20);
                    }
                }

                .commodity-container {
                    width: 100%;
                    height: 100%;

                    .commodity-group-container {
                        width: 100%;
                        height: fit-content;
                        margin-bottom: rpx(20);

                        .group-name {
                            width: 100%;
                            height: fit-content;
                            padding: rpx(20) rpx(20) rpx(10);
                            color: #888;
                            background-color: #fff;
                        }

                        .commodity {
                            width: 100%;
                            height: fit-content;
                            padding: rpx(20);
                            display: flex;
                            flex-direction: row;

                            .commodity-image-container {
                                width: rpx(180);
                                height: rpx(180);
                                flex-shrink: 0;
                                border-radius: rpx(20);
                                overflow: hidden;

                                .commodity-image {
                                    width: 100%;
                                    height: 100%;
                                    background-color: #f1f1f1;
                                }
                            }

                            .commodity-info-container {
                                width: 100%;
                                height: fit-content;
                                display: flex;
                                flex-direction: column;
                                padding-left: rpx(20);

                                .commodity-name {
                                    font-size: rpx(30);
                                    color: #333;
                                    margin-bottom: rpx(10);
                                }

                                .commodity-description {
                                    font-size: rpx(24);
                                    line-height: rpx(36);
                                    color: #888;
                                    text-overflow: -o-ellipsis-lastline;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    display: -webkit-box;
                                    line-clamp: 1;
                                    -webkit-line-clamp: 1;
                                    -webkit-box-orient: vertical;
                                }

                                .commodity-sale-info {
                                    width: fit-content;
                                    height: fit-content;
                                    margin: rpx(16) 0 rpx(16) 0;
                                    padding: rpx(2) rpx(10);
                                    font-size: rpx(20);
                                    color: #888;
                                    background-color: #f6f6f6;
                                    border-radius: rpx(4);
                                }

                                .price-container {
                                    width: 100%;
                                    height: fit-content;
                                    display: flex;
                                    flex-direction: row;

                                    .price {
                                        display: flex;
                                        flex-direction: row;

                                        .current-price {
                                            font-size: rpx(24);
                                            color: #f4756b;
                                            font-weight: bold;

                                            text:first-child {
                                                font-size: rpx(34);
                                            }

                                            text:last-child {
                                                font-size: rpx(24);
                                            }
                                        }

                                        .origin-price {
                                            padding-left: rpx(10);
                                            font-size: rpx(20);
                                            line-height: rpx(58);
                                            color: #888;
                                            text-decoration: line-through;
                                        }
                                    }

                                    .amount-btn-container {
                                        width: fit-content;
                                        height: fit-content;
                                        flex-shrink: 0;
                                        margin-top: rpx(4);
                                        margin-right: rpx(10);
                                        margin-left: auto;
                                        display: flex;
                                        flex-direction: row;

                                        .amount {
                                            margin: 0 rpx(16);
                                            font-size: rpx(30);
                                            line-height: rpx(44);
                                        }

                                        .fa-minus-circle {
                                            font-size: rpx(44);
                                            color: #ddd;
                                        }

                                        .fa-plus-circle {
                                            font-size: rpx(44);
                                            color: #f4756b;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    .bottom-empty-box {
                        width: 100%;
                        height: rpx(250);
                    }
                }
            }

            .shopping-cart-container {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background-color: #fff;
                padding: 0 rpx(40);
                padding-bottom: rpx(90);

                .title-container {
                    width: 100%;
                    height: rpx(80);
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: row;
                    border-bottom: rpx(2) solid #f1f1f1;
                    font-size: rpx(24);
                    color: #888;
                    line-height: rpx(80);

                    .amount-container {
                        width: fit-content;
                        height: 100%;
                        flex-shrink: 0;
                    }

                    .clear-btn-container {
                        width: fit-content;
                        height: 100%;
                        margin-left: auto;

                        .fa {
                            margin-right: rpx(10);
                            font-size: rpx(30);
                            color: #999;
                        }
                    }
                }

                .content-container {
                    width: 100%;
                    height: calc(100% - 80rpx);

                    .empty-tips {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        font-size: rpx(30);
                        color: #888;
                        text-align: center;

                        text {
                            margin: auto;
                        }
                    }

                    .cart-items {
                        width: 100%;
                        height: 100%;
                        padding-top: rpx(20);

                        .commodity-container {
                            width: 100%;
                            height: 100%;

                            ::-webkit-scrollbar {
                                width: 0;
                                height: 0;
                                color: transparent;
                            }

                            .commodity {
                                width: 100%;
                                height: fit-content;
                                display: flex;
                                flex-direction: row;

                                .image-container {
                                    width: rpx(132);
                                    height: rpx(132);
                                    margin: rpx(20) 0;
                                    flex-shrink: 0;
                                    overflow: hidden;
                                    border-radius: rpx(20);

                                    .image {
                                        width: 100%;
                                        height: 100%;
                                        background-color: #f1f1f1;
                                    }
                                }

                                .info-container {
                                    width: 100%;
                                    height: fit-content;
                                    display: flex;
                                    flex-direction: column;
                                    margin: rpx(20) 0 0 rpx(30);
                                    padding-bottom: rpx(20);
                                    border-bottom: rpx(2) solid #f1f1f1;

                                    .name {
                                        width: 100%;
                                        height: rpx(44);
                                        font-size: rpx(30);
                                        color: #333;
                                        line-height: rpx(44);
                                    }

                                    .description {
                                        width: 100%;
                                        height: rpx(44);
                                        font-size: rpx(22);
                                        color: #888;
                                        line-height: rpx(38);
                                    }

                                    .price {
                                        width: 100%;
                                        height: rpx(50);
                                        font-size: rpx(30);
                                        font-weight: bold;
                                        color: #f4756b;
                                        line-height: rpx(58);
                                    }
                                }

                                .amount-container {
                                    width: rpx(150);
                                    height: rpx(160);
                                    margin: rpx(20) 0 0 auto;
                                    padding-bottom: rpx(20);
                                    flex-shrink: 0;
                                    display: flex;
                                    flex-direction: column;
                                    border-bottom: rpx(2) solid #f1f1f1;

                                    .amount-btn-container {
                                        width: fit-content;
                                        height: fit-content;
                                        flex-shrink: 0;
                                        margin-top: auto;
                                        margin-right: rpx(10);
                                        margin-left: auto;
                                        display: flex;
                                        flex-direction: row;

                                        .amount {
                                            margin: 0 rpx(16);
                                            font-size: rpx(30);
                                            line-height: rpx(44);
                                        }

                                        .fa-minus-circle {
                                            font-size: rpx(44);
                                            color: #ddd;
                                        }

                                        .fa-plus-circle {
                                            font-size: rpx(44);
                                            color: #f4756b;
                                        }
                                    }
                                }
                            }

                            .commodity:last-child {
                                .info-container {
                                    border-bottom: 0;
                                }

                                .amount-container {
                                    border-bottom: 0;
                                }
                            }
                        }
                    }
                }
            }

            .search-popup {
                /deep/ .u-drawer {
                    z-index: 5 !important;
                }

                /deep/ .u-drawer__scroll-view {
                    ::-webkit-scrollbar {
                        width: 0;
                        height: 0;
                        color: transparent;
                    }
                }

                .search-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    padding: rpx(40);

                    .input-container {
                        width: 100%;
                        height: rpx(70);
                        display: flex;
                        flex-direction: row;
                        margin-bottom: rpx(40);

                        .input {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            flex-direction: row;
                            padding: 0 rpx(20);
                            background-color: #f1f1f1;
                            border-radius: rpx(50);
                            overflow: hidden;

                            .fa {
                                margin-right: rpx(20);
                                font-size: rpx(36);
                                line-height: rpx(70);
                                color: #aaa;
                                font-weight: lighter;
                            }

                            input {
                                width: 100%;
                                height: rpx(70);
                                font-size: rpx(28);
                                line-height: rpx(70);
                                color: #333;
                            }
                        }

                        .cancel-btn {
                            width: fit-content;
                            height: 100%;
                            flex-shrink: 0;
                            padding-left: rpx(40);
                            font-size: rpx(28);
                            color: #888;
                            line-height: rpx(70);
                        }
                    }

                    .result-container {
                        width: 100%;
                        height: 100%;

                        .result-scroll-view {
                            width: 100%;
                            height: 100%;

                            ::-webkit-scrollbar {
                                width: 0;
                                height: 0;
                                color: transparent;
                            }

                            .search-result-item {
                                width: 100%;
                                height: fit-content;
                                display: flex;
                                flex-direction: row;
                                margin-bottom: rpx(40);

                                .image-container {
                                    width: rpx(100);
                                    height: rpx(100);
                                    flex-shrink: 0;
                                    border-radius: rpx(20);
                                    overflow: hidden;

                                    .image {
                                        width: 100%;
                                        height: 100%;
                                        background-color: #f1f1f1;
                                    }
                                }

                                .info-container {
                                    width: 100%;
                                    height: 100%;
                                    margin-left: rpx(30);
                                    font-size: rpx(28);
                                    line-height: rpx(100);
                                    color: #333;

                                    .search-key-text {
                                        color: #f4756b;
                                    }
                                }

                                .price-container {
                                    width: rpx(130);
                                    height: 100%;
                                    margin-left: auto;
                                    flex-shrink: 0;
                                    font-size: rpx(28);
                                    text-align: right;
                                    color: #333;
                                    line-height: rpx(100);
                                }
                            }
                        }
                    }
                }
            }

            .commodity-detail-popup {
                /deep/ .u-drawer {
                    z-index: 5 !important;
                }

                /deep/ .u-drawer__scroll-view {
                    ::-webkit-scrollbar {
                        width: 0;
                        height: 0;
                        color: transparent;
                    }
                }

                .commodity-detail-container {
                    width: 100%;
                    height: fit-content;
                    display: flex;
                    flex-direction: column;

                    .image-container {
                        width: 100%;
                        height: 45vw;
                        overflow: hidden;

                        .image {
                            width: 100%;
                            height: 100%;
                            background-color: #f1f1f1;
                        }
                    }

                    .info-container {
                        width: 100%;
                        height: fit-content;
                        display: flex;
                        flex-direction: column;
                        padding: rpx(40);

                        .title {
                            width: 100%;
                            height: fit-content;
                            font-size: rpx(32);
                            color: #333;
                        }

                        .tags {

                            view {
                                width: fit-content;
                                height: fit-content;
                                margin: rpx(16) 0 rpx(16) 0;
                                padding: rpx(2) rpx(10);
                                font-size: rpx(20);
                                color: #888;
                                background-color: #f6f6f6;
                                border-radius: rpx(4);
                            }
                        }

                        .description {
                            width: fit-content;
                            height: fit-content;
                            margin-top: rpx(20);
                            font-size: rpx(22);
                            color: #888;
                            word-break: break-all;
                        }
                    }

                    .price-container {
                        width: 100%;
                        height: fit-content;
                        display: flex;
                        flex-direction: row;
                        padding: 0 rpx(40) rpx(40) rpx(40);

                        .price {
                            font-size: rpx(32);
                            font-weight: bold;
                            color: #f4756b;
                        }

                        .amount-btn {
                            width: fit-content;
                            height: fit-content;
                            flex-shrink: 0;
                            margin-left: auto;
                            display: flex;
                            flex-direction: row;

                            .amount {
                                margin: 0 rpx(16);
                                font-size: rpx(30);
                                line-height: rpx(44);
                            }

                            .fa-minus-circle {
                                font-size: rpx(44);
                                color: #ddd;
                            }

                            .fa-plus-circle {
                                font-size: rpx(44);
                                color: #f4756b;
                            }
                        }
                    }
                }
            }

            .cart-bar-container {
                width: 100vw;
                height: rpx(90);
                position: fixed;
                bottom: 0;
                left: 0;
                z-index: 4;
                background-color: rgba(250, 250, 250, 0.9);
                box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;

                .cart-btn-container {
                    width: rpx(100);
                    height: rpx(100);
                    border-radius: rpx(50);
                    position: fixed;
                    left: 0;
                    bottom: rpx(14);
                    transform: translateX(rpx(30));
                    transition-duration: 300ms;
                    background-color: #fff;
                    text-align: center;
                    box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;

                    .fa {
                        color: #f4756b;
                        font-size: rpx(48);
                        line-height: rpx(100);
                    }

                    .total-amount {
                        width: rpx(34);
                        height: rpx(34);
                        position: fixed;
                        bottom: rpx(74);
                        left: rpx(66);
                        border-radius: rpx(50);
                        overflow: hidden;
                        background-color: #f4756b;
                        color: #fff;
                        font-size: rpx(24);
                        text-align: center;
                        line-height: rpx(34);
                    }
                }

                .cart-bar {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: row;
                    overflow: hidden;
                    box-shadow: rgba(100, 100, 100, 0.1) 0px 5px 15px 0px;

                    .price-container {
                        width: fit-content;
                        height: 100%;
                        margin-left: rpx(150);
                        font-size: rpx(30);
                        line-height: rpx(90);
                        font-weight: bold;
                        color: #333;
                        letter-spacing: rpx(2);
                        transition-property: margin-left, color;
                        transition-duration: 300ms;

                        text:first-child {
                            font-size: rpx(40);
                            margin-left: rpx(2);
                        }

                        text:nth-child(2) {
                            font-size: rpx(30);
                        }

                        .origin-price {
                            margin-left: rpx(20);
                            font-size: rpx(22);
                            font-weight: normal;
                            color: #888;
                            text-decoration: line-through;
                        }
                    }

                    .pay-container {
                        width: rpx(180);
                        height: 100%;
                        margin-left: auto;
                        font-size: rpx(30);
                        text-align: center;
                        line-height: rpx(90);
                        background-color: #f4756b;
                        color: #fff;
                        transition-property: opacity;
                        transition-duration: 300ms;
                    }

                    .pay-container__default {
                        opacity: 1;
                    }

                    .pay-container__reject {
                        opacity: 0.7;
                    }
                }
            }
        }
    }
</style>