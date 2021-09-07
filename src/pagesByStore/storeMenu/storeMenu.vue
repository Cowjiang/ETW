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
                        <view class="favorite-btn">
                            <i class="fa fa-star-o" aria-hidden="true"></i>
                        </view>
                    </view>
                </view>
                <view class="announcement-container">
                    <i class="fa fa-volume-down" aria-hidden="true"></i>
                    <view
                        class="announcement-text"
                        :style="{whiteSpace: `${announcementFolding ? 'nowrap' : 'normal'}`}">
                        {{ storeInfo.announcement }}
                    </view>
                    <view class="unfold-btn" @click="handleAnnouncementFold">
                        <i
                            class="fa fa-angle-down"
                            aria-hidden="true"
                            :style="{transform: `${announcementFolding ? 'rotate(0deg)' : 'rotate(180deg)'}`}"></i>
                    </view>
                </view>
                <view class="discount-container">
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
                    <view class="unfold-btn" @click="handleDiscountFold">
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
                    <view class="search-btn-container">
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
                            v-for="type in menuList"
                            :key="type.id"
                            :id="`type${type.id}`">
                            <view class="group-name">
                                {{ type.typeName }}
                            </view>
                            <view
                                class="commodity"
                                v-for="commodity in type.dishes"
                                :key="commodity.id"
                                :data-name="`type${type.id}`"
                                @touchstart="handleTouchStart">
                                <view class="commodity-image-container">
                                    <view class="commodity-image"></view>
                                </view>
                                <view class="commodity-info-container">
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
                                                        parseInt(commodity.discountPrice === null ? commodity.originPrice : commodity.discountPrice)
                                                    }}
                                                </text>
                                                <text>
                                                    {{
                                                        commodity.discountPrice === null ? (commodity.originPrice.toString().split('.')[1] === undefined ? '' : `.${commodity.originPrice.toString().split('.')[1]}`) : (commodity.discountPrice.toString().split('.')[1] === undefined ? '' : `.${commodity.discountPrice.toString().split('.')[1]}`)
                                                    }}
                                                </text>
                                            </view>
                                            <view class="origin-price" v-if="commodity.discountPrice !== null">
                                                {{ commodity.originPrice | showPrice }}
                                            </view>
                                        </view>
                                        <view class="amount-btn-container">
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
                                originPrice: 39,
                                discountPrice: 32.9,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
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
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 2,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 3,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 4,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 5,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 6,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 7,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 8,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 9,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            },
                            {
                                id: 10,
                                name: '雪山多肉青提',
                                imageUrl: '',
                                description: '优选新鲜阳光玫瑰青提，去皮手捣，现压生榨，超“冻”感',
                                originPrice: 32,
                                discountPrice: null,
                            }
                        ]
                    },
                ], //菜单内容
                currentTypeId: 1, //当前菜单显示的类型编号
                scrollToTypeId: '', //要滑动到的类型Id
                cartList: [], //购物车列表
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
            // 切换菜单标签
            handleTabsChange(index) {
                this.currentTab = index;
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
                                        originPrice: val.originPrice, // {Number} 商品原价
                                        discountPrice: val.discountPrice, // {Number|NaN} 商品优惠价格
                                    }); //将商品加入购物车列表
                                }
                                this.$forceUpdate();
                            }
                        });
                    }
                });
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
                                this.$forceUpdate();
                            }
                        });
                    }
                });
            }
        },
        computed: {
            /**
             * 计算购物车总价
             * @return {Number} 计算的总价
             */
            totalPrice() {
                let totalPrice = 0;
                this.cartList.forEach((v, k) => {
                    totalPrice += (v.discountPrice === null ? v.originPrice : v.discountPrice) * v.amount;
                });
                return totalPrice;
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
        watch: {},
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
        }
    }
</style>