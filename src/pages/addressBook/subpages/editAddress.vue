<template>
    <view>
        <navigationBar ref="navigationBar" class="navigation-bar"/>
        <toast ref="toast"/>
        <loading ref="loading" fullscreen></loading>
        <selectArea
            ref="selectArea"
            maskCloseAble
            v-model="openPicker"
            :defaultAreaCode="addressAdCode"
            @confirm="pickerConfirm"></selectArea>
        <view class="address-container">
            <image
                src="../../../static/images/background/background@loginScreen.png"
                class="bg-image"
            ></image>
            <view class="title-container">
                <view class="title-text">
                    {{ isNewAddress ? '新增地址' : '编辑地址' }}
                </view>
                <view
                    class="delete-btn"
                    v-show="!isNewAddress"
                    @click="handleDeleteClick">
                    <i class="fa fa-trash-o" aria-hidden="true"></i>
                    删除
                </view>
            </view>
            <view class="address-container">
                <view class="address-form">
                    <view class="name-container">
                        <view class="name-left">
                            <view>联系人</view>
                            <view></view>
                        </view>
                        <view class="name-right">
                            <view class="name-input-container">
                                <input
                                    type="text"
                                    data-name="contactName"
                                    v-model="contactName">
                                <view
                                    class="name-placeholder"
                                    v-show="contactName === ''">收货人姓名
                                </view>
                            </view>
                            <view class="gender-container">
                                <view
                                    data-name="gentleman"
                                    class="gender-btn gender-btn--default"
                                    :class="contactGender === 1 ? 'gender-btn--selected' : ''"
                                    @click="handleGenderClick">先生
                                </view>
                                <view
                                    data-name="lady"
                                    class="gender-btn gender-btn--default"
                                    :class="contactGender === 2 ? 'gender-btn--selected' : ''"
                                    @click="handleGenderClick">女士
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="phone-container">
                        <view class="phone-left">
                            <view>电话</view>
                        </view>
                        <view class="phone-right">
                            <input
                                type="number"
                                data-name="contactPhone"
                                v-model="contactPhone"
                                maxlength="11">
                            <view
                                class="phone-placeholder"
                                v-show="contactPhone === ''">联系手机号
                            </view>
                        </view>
                    </view>
                    <view class="area-container">
                        <view class="area-left">
                            <view>地区</view>
                        </view>
                        <view class="area-right">
                            <view
                                class="input"
                                @click="handleAreaClick">
                                {{ addressArea[0] || '' }} {{ addressArea[1] || '' }} {{ addressArea[2] || '' }}
                            </view>
                            <view
                                class="area-placeholder"
                                :style="{opacity: `${addressArea === null ? 1 : 0 }`}">
                                选择地区
                            </view>
                            <view
                                class="picker-btn"
                                @click="handleAreaClick">
                                <i class="fa fa-angle-right" aria-hidden="true"></i>
                            </view>
                        </view>
                    </view>
                    <view class="detail-container">
                        <view class="detail-left">
                            <view>门牌号</view>
                        </view>
                        <view class="detail-right">
                            <input
                                type="text"
                                data-name="addressDetail"
                                v-model="addressDetail">
                            <view
                                class="detail-placeholder"
                                :style="{opacity: `${addressDetail === '' ? 1 :0}`}">
                                例：中山五路98号301室
                            </view>
                            <view
                                class="map-btn"
                                @click="handleMapBtnClick">
                                <i class="fa fa-map-marker" aria-hidden="true"></i>
                            </view>
                        </view>
                    </view>
                    <view class="set-default-container">
                        <u-checkbox
                            v-model="isDefaultAddress"
                            name="defaultAddress"
                            shape="circle"
                            active-color="#f4756b"
                            size="28"
                            label-size="28"
                        >设为默认地址
                        </u-checkbox>
                    </view>
                </view>
                <view
                    class="confirm-btn"
                    @click="handleConfirm">
                    保 存
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    import {toast} from '../../../components/toast/toast.vue';
    import {navigationBar} from '../../../components/navigationBar/navigationBar.vue';
    import {loading} from '../../../components/loading/loading.vue';
    import {selectArea} from '../../../components/selectArea/selectArea.vue';
    import {Validator} from "../../../common/js/validate/validate.js";

    export default {
        components: {
            toast, navigationBar, loading, selectArea
        },
        data() {
            return {
                isNewAddress: true, //是否为新增地址，为false时为编辑地址，用于改变标题内容
                openPicker: false, //selectArea组件的双向绑定值，为true时打开Picker
                contactName: '', //联系人姓名
                contactGender: 0, //联系人性别，[0: 未选择, 1: 先生, 2: 女士]
                contactPhone: '', //联系人手机号
                addressArea: null, //地区名称数组
                addressAdCode: ['44', '4401', '440103'], //行政编码数组，已绑定为selectArea组件的Picker初始值
                addressDetail: '', //门牌号（详细地址）
                isDefaultAddress: false, //是否设为默认地址
            }
        },
        methods: {
            // 地图按钮点击监听事件
            handleMapBtnClick() {
                //跳转到amap页面，并接收回传数据
                uni.navigateTo({
                    url: "/pages/amap/amap",
                    events: {
                        acceptDataFromOpenedPage: (data) => {
                            if (data) {
                                this.addressAdCode = [data.resultDetails.adcode.slice(0, 2), data.resultDetails.adcode.slice(0, 4), data.resultDetails.adcode];
                                this.addressDetail = `${data.resultDetails.address}${data.resultDetails.name}`;
                                let addressAreaTemp;
                                if ((addressAreaTemp = this.$refs.selectArea.queryAreaName(this.addressAdCode[2])) !== false) {
                                    //查询行政区域名称成功
                                    this.addressArea = addressAreaTemp;
                                }
                                else {
                                    //查询失败
                                    this.openPicker = true;
                                }
                            }
                        },
                    },
                });
            },
            // selectArea组件的Picker确认事件
            pickerConfirm(e) {
                this.addressArea = [e.province.label, e.city.label, e.area.label];
                this.addressAdCode = [e.province.value, e.city.value, e.area.value];
            },
            // 地区输入框点击事件
            handleAreaClick() {
                this.$refs.selectArea.init();
                this.openPicker = true;
            },
            // 联系人性别点击事件
            handleGenderClick(e) {
                switch (e.currentTarget.dataset.name) {
                    case 'gentleman':
                        this.contactGender = 1;
                        break;
                    case 'lady':
                        this.contactGender = 2;
                        break;
                }
            },
            // 删除按钮点击事件
            handleDeleteClick() {
                uni.showActionSheet({
                    alertText: '删除地址后将无法恢复',
                    itemList: ['确定删除'],
                    itemColor: '#f35b56',
                    success: res => {
                        if (res.tapIndex === 0) {
                            //确定删除地址
                            console.log('确定删除地址');
                        }
                    }
                });
            },
            // 保存按钮点击事件
            handleConfirm() {
                this.utils.throttle(() => {
                    if (this.checkInfo()) {
                        let contacts = `${this.contactName}${this.contactGender === 0 ? '' : (this.contactGender === 1 ? '{#先生}' : '{#女士}')}`;
                        let areaCode = this.addressAdCode[2];
                        let addressDetail = this.addressDetail;
                        // let addressDetail = `${this.addressArea[0]}${this.addressArea[1]}${this.addressArea[2]}${this.addressDetail}`;
                        let phone = this.contactPhone;
                        console.log(contacts, areaCode, addressDetail, phone);

                    }
                }, 2000);
            },
            /**
             * 检验地址表单内容是否符合要求
             * @return {Boolean} 是否验证通过
             */
            checkInfo() {
                if (this.contactName.replace(/\s*/g, "") !== "") {
                    let validatorRule = [{
                        key: "contactPhone",
                        regExp: ["phone"],
                        required: true,
                    }]; //手机号验证规则
                    let validator = new Validator();
                    let validatedInfo = validator.validate({contactPhone: this.contactPhone}, validatorRule).contactPhone;
                    if (validatedInfo.required) {
                        if (validatedInfo.regExp.length === 0) {
                            if (this.addressArea !== null) {
                                if (this.addressDetail !== '') {
                                    //验证通过
                                    return true;
                                }
                                else {
                                    //门牌号为空
                                    this.$refs.toast.show({
                                        text: '门牌号不能为空',
                                        type: 'warning'
                                    });
                                    return false;
                                }
                            }
                            else {
                                //地区为空
                                this.$refs.toast.show({
                                    text: '地区不能为空',
                                    type: 'warning'
                                });
                                return false;
                            }
                        }
                        else {
                            //联系电话格式错误
                            this.$refs.toast.show({
                                text: '手机号格式错误',
                                type: 'warning'
                            });
                            return false;
                        }
                    }
                    else {
                        //联系电话为空
                        this.$refs.toast.show({
                            text: '手机号不能为空',
                            type: 'warning'
                        });
                        return false;
                    }
                }
                else {
                    //联系人名称为空
                    this.$refs.toast.show({
                        text: '联系人不能为空',
                        type: 'warning'
                    });
                    this.contactName = '';
                    return false;
                }
            }
        },
        computed: {},
        filters: {},
        watch: {},
        mounted() {
            this.$refs.selectArea.init();
        },
        onLoad(options) {
            try {
                const eventChannel = this.getOpenerEventChannel();
                eventChannel.on('editAddress', data => {
                    this.isNewAddress = false;
                    this.contactName = data.data.contactName;
                    this.contactGender = data.data.contactGender;
                    this.contactPhone = data.data.contactPhone;
                    this.addressAdCode = data.data.areaCode;
                    this.addressDetail = data.data.addressDetail;
                    this.addressArea = [data.data.areaName[0], data.data.areaName[1], data.data.areaName[2]];
                    this.isDefaultAddress = data.data.isDefaultAddress;
                    this.$forceUpdate();
                });
            } catch (e) {
                this.isNewAddress = true;
            }
        },
        onShow() {
            this.$refs.navigationBar.setNavigation({
                // titleText: '编辑地址',
                backgroundColor: '#fff'
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
    .address-container {
        width: 100vw;
        height: 100vh;

        .bg-image {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        }

        .title-container {
            width: 100%;
            height: rpx(180);
            padding: rpx(50) rpx(50) rpx(30);

            .title-text {
                width: fit-content;
                height: fit-content;
                display: inline;
                font-size: rpx(54);
                font-weight: bold;
                color: $uni-text-color;
            }

            .delete-btn {
                float: right;
                margin-top: rpx(32);
                font-size: rpx(30);
                color: #555555;

                .fa {
                    margin-right: rpx(6);
                }
            }
        }

        .address-container {
            width: 100%;
            height: fit-content;
            padding: 0 rpx(50);

            .address-form {
                width: 100%;
                height: fit-content;

                .name-container {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    height: rpx(200);
                    border-bottom: rpx(1) solid #ededed;

                    .name-left {
                        display: flex;
                        flex-direction: column;
                        width: rpx(150);
                        color: $uni-text-color;

                        view {
                            flex: 1;
                            width: 100%;
                            height: 100%;
                            font-size: rpx(30);
                            font-weight: bold;
                            line-height: rpx(100);
                        }
                    }

                    .name-right {
                        display: flex;
                        flex-direction: column;
                        width: calc(100% - 150rpx);
                        height: 100%;

                        .name-input-container {
                            width: 100%;
                            height: 50%;
                            font-size: rpx(30);
                            line-height: rpx(100);
                            border-bottom: rpx(1) solid #efefef;

                            input {
                                width: 100%;
                                height: 100%;
                                color: $uni-text-color;
                            }

                            .name-placeholder {
                                width: 100%;
                                height: 100%;
                                position: relative;
                                top: -100%;
                                pointer-events: none;
                                color: #c0c0c0;
                            }
                        }

                        .gender-container {
                            display: flex;
                            flex-direction: row;
                            width: 100%;
                            height: 50%;

                            .gender-btn {
                                width: rpx(140);
                                height: rpx(60);
                                margin-top: rpx(20);
                                margin-right: rpx(20);
                                border-radius: rpx(14);
                                text-align: center;
                                line-height: rpx(58);
                                transition-property: border, color;
                                transition-duration: 300ms;
                            }

                            .gender-btn--default {
                                border: rpx(1) solid #e3e3e3;
                                color: #808080;
                            }

                            .gender-btn--selected {
                                border: rpx(1) solid #f4756b !important;
                                color: #f4756b !important;
                            }
                        }
                    }
                }

                .phone-container {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    height: rpx(100);
                    border-bottom: rpx(1) solid #efefef;

                    .phone-left {
                        width: rpx(150);
                        height: 100%;
                        color: $uni-text-color;

                        view {
                            width: 100%;
                            height: 100%;
                            font-size: rpx(30);
                            font-weight: bold;
                            line-height: rpx(100);
                        }
                    }

                    .phone-right {
                        width: calc(100% - 150rpx);
                        height: 100%;
                        font-size: rpx(30);
                        line-height: rpx(100);

                        input {
                            width: 100%;
                            height: 100%;
                            color: $uni-text-color;
                        }

                        .phone-placeholder {
                            width: 100%;
                            height: 100%;
                            position: relative;
                            top: -100%;
                            pointer-events: none;
                            color: #c0c0c0;
                        }
                    }
                }

                .area-container {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    height: rpx(100);
                    border-bottom: rpx(1) solid #efefef;

                    .area-left {
                        width: rpx(150);
                        height: 100%;
                        color: $uni-text-color;

                        view {
                            width: 100%;
                            height: 100%;
                            font-size: rpx(30);
                            font-weight: bold;
                            line-height: rpx(100);
                        }
                    }

                    .area-right {
                        width: calc(100% - 150rpx);
                        height: 100%;
                        font-size: rpx(30);
                        line-height: rpx(100);

                        .input {
                            width: calc(100% - 80rpx);
                            height: 100%;
                            color: $uni-text-color;
                        }

                        .area-placeholder {
                            width: calc(100% - 80rpx);
                            height: 100%;
                            position: relative;
                            top: -100%;
                            pointer-events: none;
                            color: #c0c0c0;
                        }

                        .picker-btn {
                            width: rpx(80);
                            height: 100%;
                            float: right;
                            position: relative;
                            top: -200%;
                            color: #555555;
                            text-align: center;
                            font-size: rpx(48);
                        }
                    }
                }

                .detail-container {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    height: rpx(100);
                    border-bottom: rpx(1) solid #efefef;

                    .detail-left {
                        width: rpx(150);
                        height: 100%;
                        color: $uni-text-color;

                        view {
                            width: 100%;
                            height: 100%;
                            font-size: rpx(30);
                            font-weight: bold;
                            line-height: rpx(100);
                        }
                    }

                    .detail-right {
                        width: calc(100% - 150rpx);
                        height: 100%;
                        font-size: rpx(30);
                        line-height: rpx(100);

                        input {
                            width: calc(100% - 80rpx);
                            height: 100%;
                            color: $uni-text-color;
                        }

                        .detail-placeholder {
                            width: calc(100% - 80rpx);
                            height: 100%;
                            position: relative;
                            top: -100%;
                            pointer-events: none;
                            color: #c0c0c0;
                        }

                        .map-btn {
                            width: rpx(80);
                            height: 100%;
                            float: right;
                            position: relative;
                            top: -200%;
                            color: #555555;
                            text-align: center;
                            font-size: rpx(42);
                        }
                    }
                }

                .set-default-container {
                    width: 100%;
                    height: rpx(120);
                    margin-top: rpx(30);
                }
            }

            .confirm-btn {
                width: 100%;
                height: rpx(94);
                text-align: center;
                font-size: rpx(35);
                font-weight: bold;
                line-height: rpx(94);
                color: $uni-text-color-inverse;
                background-color: $uni-color-primary;
                border-radius: rpx(14);
            }
        }
    }
</style>