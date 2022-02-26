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
        src="@/static/images/background/background@loginScreen.png"
        class="bg-image"/>
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
                  v-show="contactName === ''">
                  收货人姓名
                </view>
              </view>
              <view class="gender-container">
                <view
                  data-name="gentleman"
                  class="gender-btn gender-btn--default"
                  :class="contactGender === 1 ? 'gender-btn--selected' : ''"
                  @click="handleGenderClick">
                  先生
                </view>
                <view
                  data-name="lady"
                  class="gender-btn gender-btn--default"
                  :class="contactGender === 2 ? 'gender-btn--selected' : ''"
                  @click="handleGenderClick">
                  女士
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
                v-show="contactPhone === ''">
                联系手机号
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
              label-size="28">
              设为默认地址
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
    import loading from "@/components/loading/loading";
    import selectArea from "@/components/selectPopup/selectArea/selectArea";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import {Validator} from "@/common/js/validate/validate.js";
    import {addAddressBook, deleteAddressBook, updateAddressBook} from "@/common/js/api/models.js";

    export default {
        components: {
            toast, navigationBar, loading, selectArea
        },
        data() {
            return {
                isNewAddress: true, //是否为新增地址，为false时为编辑地址，用于改变标题内容
                openPicker: false, //selectArea组件的双向绑定值，为true时打开Picker
                addressId: null, //编辑地址时，当前地址的id
                contactName: '', //联系人姓名
                contactGender: 0, //联系人性别，[0: 未选择, 1: 先生, 2: 女士]
                contactPhone: '', //联系人手机号
                addressArea: null, //地区名称数组
                addressAdCode: ['44', '4401', '440103'], //行政编码数组，已绑定为selectArea组件的Picker初始值
                addressDetail: '', //门牌号（详细地址）
                isDefaultAddress: false, //是否设为默认地址
                isSelectMode: false, //是否为选择地址模式（用于下单页）
            }
        },
        methods: {
            // 地图按钮点击监听事件
            handleMapBtnClick() {
                //跳转到amap页面，并接收回传数据
                uni.navigateTo({
                    url: "/pages/amap/amap",
                    events: {
                        acceptDataFromOpenedPage: data => {
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
                            deleteAddressBook({
                                urlParam: this.addressId
                            }).then(res => {
                                if (res.success) {
                                    this.$refs.loading.stopLoading();
                                    this.navigateToAddressBook();
                                }
                                else {
                                    this.$refs.loading.stopLoading();
                                    this.$refs.toast.show({
                                        text: '删除失败',
                                        type: 'error'
                                    });
                                }
                            }).catch(err => {
                                this.$refs.loading.stopLoading();
                                this.$refs.toast.show({
                                    text: '删除失败',
                                    type: 'error'
                                });
                                console.error(err);
                            });
                        }
                    }
                });
            },
            // 保存按钮点击事件
            handleConfirm() {
                this.utils.throttle(() => {
                    if (this.checkInfo()) {
                        let newAddress = {
                            contacts: `${this.contactName}${this.contactGender === 0 ? '' : (this.contactGender === 1 ? '{#先生}' : '{#女士}')}`,
                            areaCode: this.addressAdCode[2],
                            addressDetail: this.addressDetail,
                            phone: this.contactPhone,
                            isDefault: this.isDefaultAddress
                        }
                        this.isNewAddress ? this.postAddresses(1, newAddress) : this.postAddresses(2, newAddress);
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
            },
            /**
             * 提交地址修改
             * @param {Number} mode 编辑模式，[1: 新增地址, 2: 修改地址]
             * @param {Object} newAddress 地址信息
             */
            postAddresses(mode, newAddress) {
                return new Promise((resolve, reject) => {
                    console.log(mode, newAddress)
                    if (mode === 1) {
                        //新增地址
                        //当前不为选择地址模式
                        addAddressBook({
                            queryData: {
                                contacts: newAddress.contacts,
                                phone: newAddress.phone,
                                areaCode: newAddress.areaCode,
                                addressDetail: newAddress.addressDetail,
                                isDefault: newAddress.isDefault
                            }
                        }).then(res => {
                            if (res.success) {
                                if (this.isSelectMode) {
                                    //当前为选择地址模式
                                    try {
                                        newAddress.id = res.data;
                                        const eventChannel = this.getOpenerEventChannel();
                                        eventChannel.emit("acceptDataFromOpenedPage", {
                                            address: newAddress
                                        });
                                        uni.navigateBack();
                                    } catch (e) {
                                        this.$refs.toast.show({
                                            text: '网络异常',
                                            type: 'error',
                                            direction: 'top'
                                        });
                                    }
                                }
                                else {
                                    //当前不为选择地址模式
                                    this.navigateToAddressBook();
                                }
                            }
                            else {
                                this.$refs.toast.show({
                                    text: '保存失败',
                                    type: 'error',
                                });
                                console.log(res);
                            }
                        }).catch(err => {
                            this.$refs.toast.show({
                                text: '保存失败',
                                type: 'error',
                            });
                            console.error(err);
                        });
                    }
                    else {
                        //修改地址
                        updateAddressBook({
                            urlParam: this.addressId,
                            queryData: {
                                contacts: newAddress.contacts,
                                phone: newAddress.phone,
                                areaCode: newAddress.areaCode,
                                addressDetail: newAddress.addressDetail,
                                isDefault: newAddress.isDefault
                            }
                        }).then(res => {
                            if (res.success) {
                                this.navigateToAddressBook();
                            }
                            else {
                                this.$refs.toast.show({
                                    text: '保存失败',
                                    type: 'error',
                                });
                                console.log(res);
                            }
                        }).catch(err => {
                            this.$refs.toast.show({
                                text: '保存失败',
                                type: 'error',
                            });
                            console.error(err);
                        });
                    }
                });
            },
            // 页面跳转方法，返回上一页或重定向至地址簿页面
            navigateToAddressBook() {
                uni.navigateBack({
                    fail: () => {
                        uni.redirectTo({
                            url: '/pages/addressBook/addressBook'
                        });
                    }
                });
            }
        },
        mounted() {
            this.$refs.selectArea.init();
        },
        onLoad(options) {
            try {
                const eventChannel = this.getOpenerEventChannel();
                eventChannel.on('editAddress', data => {
                    this.isNewAddress = false;
                    this.addressId = data.data.id;
                    this.contactName = data.data.contactName;
                    this.contactGender = data.data.contactGender;
                    this.contactPhone = data.data.contactPhone;
                    this.addressAdCode = [data.data.areaCode.slice(0, 2), data.data.areaCode.slice(0, 4), data.data.areaCode];
                    this.addressDetail = data.data.addressDetail;
                    this.addressArea = [data.data.areaName[0], data.data.areaName[1], data.data.areaName[2]];
                    this.isDefaultAddress = data.data.isDefaultAddress;
                    this.$forceUpdate();
                });
                try {
                    const eventChannel = this.getOpenerEventChannel();
                    eventChannel.on('selectAddress', data => {
                        this.isSelectMode = !!data.data;
                        this.$forceUpdate();
                    });
                } catch (e) {
                    this.isSelectMode = false;
                }
            } catch (e) {
                this.isNewAddress = true;
            }
        },
        onShow() {
            this.$refs.navigationBar.setNavigation({
                backgroundColor: '#fff',
                customBackFunc: this.navigateToAddressBook
            });
        },
    }
</script>

<style lang="scss" scoped>
  @import 'editAddress';
</style>