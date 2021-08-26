<template>
    <view
        :style="{
            backgroundColor: '#f6f6f6',
            height: `calc(100vh - ${navigationHeight}px)`
        }">
        <navigationBar ref="navigationBar" class="navigation-bar"/>
        <toast ref="toast"/>
        <loading ref="loading" fullscreen></loading>
        <view class="address-book-container">
            <view class="address-records">
                <view
                    class="address"
                    :class="addressTouchingId === `address${index}` ? 'address--touching' : ''"
                    v-for="(address, index) in addressRecords"
                    :key="index"
                    :data-name="`address${index}`"
                    @touchstart="handleTouchStart"
                    @touchend="handleTouchEnd"
                    @touchcancel="handleTouchEnd"
                    @longpress="handleLongPress">
                    <view class="info">
                        <view class="contact-name">
                            {{ address.contactName | formatContactName }}
                            <text class="contact-phone">
                                {{ address.contactPhone }}
                            </text>
                        </view>
                        <view class="contact-address">
                            {{ address.addressDetail | formatAddressDetail(address.areaName) }}
                        </view>
                        <view
                            class="default-address"
                            v-show="address.isDefaultAddress">
                            默认地址
                        </view>
                    </view>
                    <view
                        class="btn"
                        :data-name="`address${index}`"
                        @click="handleEdit">
                        <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                    </view>
                </view>
                <view class="bottom-space"></view>
            </view>
            <view
                class="new-address-btn"
                @click="handleAddAddress">
                <view class="btn-text">
                    新增地址
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';
    import {loading} from '../../components/loading/loading.vue';
    // import {getBlockList, getMyChatList} from "../../common/js/api/models.js";

    export default {
        components: {
            toast, navigationBar, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                addressRecords: [
                    {
                        contactName: 'Cowjiang{#先生}',
                        contactPhone: '13711401096',
                        areaCode: '440104',
                        areaName: ['广东省', '广州市', '越秀区'],
                        addressDetail: '中山五路捷登都汇201优电风扇犯犯得上士大夫犯得上犯得上得上发射点发衣库',
                        isDefaultAddress: false,
                    },
                    {
                        contactName: '粽子',
                        contactPhone: '17728108553',
                        areaCode: '440103',
                        areaName: ['广东省', '广州市', '荔湾区'],
                        addressDetail: '康王北路康王阁301室',
                        isDefaultAddress: true,
                    },
                    {
                        contactName: '小庞',
                        contactPhone: '17728108553',
                        areaCode: '440103',
                        areaName: ['广东省', '广州市', '从化区'],
                        addressDetail: '广从南路548号广州软件学院',
                        isDefaultAddress: false,
                    },
                    {
                        contactName: '小庞',
                        contactPhone: '17728108553',
                        areaCode: '440103',
                        areaName: ['广东省', '广州市', '从化区'],
                        addressDetail: '广从南路548号广州软件学院',
                        isDefaultAddress: false,
                    },
                    {
                        contactName: '小庞',
                        contactPhone: '17728108553',
                        areaCode: '440103',
                        areaName: ['广东省', '广州市', '从化区'],
                        addressDetail: '广从南路548号广州软件学院',
                        isDefaultAddress: false,
                    },
                    {
                        contactName: '小庞',
                        contactPhone: '17728108553',
                        areaCode: '440103',
                        areaName: ['广东省', '广州市', '从化区'],
                        addressDetail: '广从南路548号广州软件学院',
                        isDefaultAddress: false,
                    },
                    {
                        contactName: '小庞',
                        contactPhone: '17728108553',
                        areaCode: '440103',
                        areaName: ['广东省', '广州市', '从化区'],
                        addressDetail: '广从南路548号广州软件学院',
                        isDefaultAddress: false,
                    },
                    {
                        contactName: '小庞',
                        contactPhone: '17728108553',
                        areaCode: '440103',
                        areaName: ['广东省', '广州市', '从化区'],
                        addressDetail: '广从南路548号广州软件学院',
                        isDefaultAddress: false,
                    },
                    {
                        contactName: '小庞',
                        contactPhone: '17728108553',
                        areaCode: '440103',
                        areaName: ['广东省', '广州市', '从化区'],
                        addressDetail: '广从南路548号广州软件学院',
                        isDefaultAddress: false,
                    },
                    {
                        contactName: '小庞',
                        contactPhone: '17728108553',
                        areaCode: '440103',
                        areaName: ['广东省', '广州市', '从化区'],
                        addressDetail: '广从南路548号广州软件学院',
                        isDefaultAddress: false,
                    },
                    {
                        contactName: '小庞',
                        contactPhone: '17728108553',
                        areaCode: '440103',
                        areaName: ['广东省', '广州市', '从化区'],
                        addressDetail: '广从南路548号广州软件学院',
                        isDefaultAddress: false,
                    },
                ],
                addressTouchingId: '', //当前触摸地址记录的数据名
            }
        },
        methods: {
            // 监听地址触摸开始事件
            handleTouchStart(e) {
                this.addressTouchingId = e.currentTarget.dataset.name;
                this.$forceUpdate();
            },
            // 监听地址触摸结束事件
            handleTouchEnd() {
                this.addressTouchingId = '';
                this.$forceUpdate();
            },
            // 监听地址长按事件
            handleLongPress(e) {
                wx.vibrateShort();
                let addressIndex = Number(e.currentTarget.dataset.name.replace('address', ''));
                let address = JSON.parse(JSON.stringify(this.addressRecords[addressIndex])); //强制深拷贝
                uni.showActionSheet({
                    itemList: ['复制', '设为默认地址', '删除地址'],
                    // itemColor: '#f35b56',
                    success: res => {
                        if (res.tapIndex === 0) {
                            //复制地址
                            uni.setClipboardData({
                                data: `${this.$options.filters['formatContactName'](address.contactName)} ${address.contactPhone} ${this.$options.filters['formatAddressDetail'](address.addressDetail, address.areaName)}`
                            });
                        }
                        else if (res.tapIndex === 1) {
                            //设为默认地址
                        }
                        else if (res.tapIndex === 2) {
                            //删除地址
                            uni.showModal({
                                title: '',
                                content: '删除地址后将无法恢复，确定删除？',
                                success: res => {
                                    if (res.confirm) {
                                        //确定删除地址
                                        console.log('确定删除地址');
                                    }
                                }
                            });
                        }
                    }
                });
            },
            // 地址编辑按钮点击事件
            handleEdit(e) {
                wx.vibrateShort();
                if (e.currentTarget.dataset.name != null) {
                    let addressIndex = Number(e.currentTarget.dataset.name.replace('address', ''));
                    let address = JSON.parse(JSON.stringify(this.addressRecords[addressIndex])); //强制深拷贝
                    let contactNameTemp = this.$options.filters['getContactGender'](address.contactName);
                    address.contactName = contactNameTemp[0];
                    address.contactGender = contactNameTemp[1];
                    uni.navigateTo({
                        url: '/pages/addressBook/subpages/editAddress',
                        success: res => {
                            res.eventChannel.emit('editAddress', {data: address})
                        }
                    });
                }
            },
            // 新增地址按钮点击事件
            handleAddAddress() {
                uni.navigateTo({
                    url: '/pages/addressBook/subpages/editAddress',
                });
            }
        },
        computed: {},
        filters: {
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
            /**
             * 格式化详细地址（门牌号）
             * @param {String} addressDetail 详细地址（门牌号）
             * @param {Array} areaName 行政区域名称数组，长度为3，（格式参考subpages/editAddress中说明）
             * @return {string} 格式化后的详细地址（门牌号），包含行政区域名称
             */
            formatAddressDetail(addressDetail, areaName) {
                if (areaName.length === 3) {
                    return `${areaName[0]}${areaName[1]}${areaName[2]}${addressDetail}`;
                }
            }
        },
        watch: {},
        onPageScroll(e) {
            // console.log(e)
        },
        onReachBottom() {
            console.log('ReachBottom')
        },
        mounted() {
            // this.mapLocation();
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
                titleText: '我的地址',
                backgroundColor: '#f6f6f6'
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
    .address-book-container {
        width: 100vw;
        height: fit-content;
        background-color: #f6f6f6;

        .address-records {
            width: 100vw;
            height: fit-content;
            padding-top: rpx(8);

            .address {
                width: 100vw;
                height: fit-content;
                display: flex;
                flex-direction: row;
                padding: rpx(20) rpx(50);
                margin-bottom: rpx(20);
                background-color: #fff;
                border-radius: rpx(30);

                .info {
                    width: calc(100% - 70rpx);
                    height: 100%;

                    .contact-name {
                        font-size: rpx(30);
                        color: #333;

                        .contact-phone {
                            margin-left: rpx(20);
                            font-size: rpx(26);
                            color: #888;
                        }
                    }

                    .contact-address {
                        margin-top: rpx(14);
                        font-size: rpx(24);
                        color: #555;
                        line-height: rpx(40);
                    }

                    .default-address {
                        width: fit-content;
                        height: rpx(36);
                        padding: 0 rpx(14);
                        margin-top: rpx(14);
                        margin-bottom: rpx(6);
                        font-size: rpx(22);
                        line-height: rpx(36);
                        color: #fff;
                        background-color: #f4756b;
                        border-radius: rpx(30);
                    }
                }

                .btn {
                    width: rpx(70);
                    height: initial;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    font-size: rpx(36);
                    color: #f4756b;
                }
            }

            .address--touching {
                filter: brightness(90%);
            }

            .bottom-space {
                width: 100vw;
                height: rpx(150);
            }
        }

        .new-address-btn {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100vw;
            height: rpx(120);
            box-shadow: 0 0 rpx(16) rpx(-10) #888888;
            background-color: #fff;
            border-radius: rpx(30) rpx(30) 0;

            .btn-text {
                width: 50%;
                height: 70%;
                margin: rpx(18) auto;
                border-radius: rpx(50);
                text-align: center;
                font-size: rpx(30);
                line-height: rpx(84);
                color: #fff;
                background-color: #f4756b;
            }
        }
    }
</style>