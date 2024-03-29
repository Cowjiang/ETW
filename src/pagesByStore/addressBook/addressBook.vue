<template>
  <view
    id="page"
    :style="{
      backgroundColor: '#f6f6f6',
      height: `calc(100vh - ${navigationHeight}px)`
    }"
    @touchstart="handleScreenTouchStart"
    @touchend="handleScreenTouchEnd"
    @touchcancel="handleScreenTouchEnd">
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"></loading>
    <!-- 地址簿容器 -->
    <view class="address-book-container">
      <view class="address-records">
        <!-- 批量渲染地址记录 -->
        <view
          class="address"
          :class="addressTouchingId === `address${index}` ? 'address--touching' : ''"
          v-for="(address, index) in addressRecords"
          :key="index"
          :data-name="`address${index}`"
          @click="handleClick"
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
            v-if="!isSelectMode"
            :data-name="`address${index}`"
            @click.stop="handleEdit">
            <i class="fas fa-pen"/>
          </view>
        </view>
        <!-- 加载更多容器 -->
        <view class="load-more-container">
          <view v-show="existMore && !loadingMore" class="load-more">
            <text>{{ releaseToLoadMore ? '松开加载更多' : '下拉加载更多' }}</text>
          </view>
          <view
            v-show="loadingMore"
            class="load-more loading-more">
            <loading
              ref="loadingMore"
              maskColor="#f6f6f6"></loading>
          </view>
          <view
            v-show="!existMore && addressRecords.length !== 0"
            class="load-more">
            <text>没有更多了哦 ~</text>
          </view>
        </view>
        <view
          class="empty"
          :style="{minHeight: `calc(100vh - ${navigationHeight + 40}px)`}"
          v-if="!addressRecords.length">
          <view class="row">
            一个地址都没有噢
          </view>
          <view class="row">
            <view class="btn" @click="handleAddAddress">
              新增地址
            </view>
          </view>
        </view>
      </view>
      <!-- 底部按钮区域 -->
      <view
        class="new-address-btn"
        v-if="!isSelectMode && addressRecords.length"
        :style="{opacity: `${isShowBottomBtn && !loadingMore ? 1 : 0}`}"
        @click="handleAddAddress">
        <view class="btn-text">
          新增地址
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";
    import {deleteAddressBook, getAddressBook, setDefaultAddress} from "@/common/js/api/models.js";

    export default {
        components: {
            toast, navigationBar, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                isReadyToShow: false, //是否准备显示页面内容
                addressRecords: [], //我的地址数组
                addressTouchingId: '', //当前触摸地址记录的数据名
                pageSize: 15, //分页大小
                currentPage: 1, //当前页码
                loadingMore: false, //是否处于加载更多状态
                existMore: true, //是否存在更多地址记录
                scrolling: false, //页面是否正在滑动
                isShowBottomBtn: true, //是否显示底部按钮区域
                waitingLoadMore: false, //是否等待加载更多地址记录
                releaseToLoadMore: false, //是否显示“松开加载更多”提示
                screenTouching: false, //是否正在触摸屏幕
                isSelectMode: false, //是否为选择地址模式
            }
        },
        methods: {
            /**
             * 获取我的地址数据
             * @param {Number} pageNumber 分页查询页码，不传参数默认为查询第一页
             */
            getMyAddress(pageNumber = 1) {
                getAddressBook({
                    queryData: {
                        pageSize: this.pageSize,
                        pageNumber: pageNumber
                    }
                }).then(res => {
                    let addressTemp = [];
                    res.data.records.forEach(addressRecords => {
                        addressTemp.push({
                            id: addressRecords.id,
                            contactName: addressRecords.contacts,
                            contactPhone: addressRecords.phone,
                            areaCode: addressRecords.areaCode,
                            areaName: [addressRecords.province, addressRecords.city, addressRecords.area],
                            addressDetail: addressRecords.addressDetail,
                            isDefaultAddress: addressRecords.isDefault
                        });
                    });
                    if (pageNumber === 1) {
                        this.addressRecords = addressTemp;
                    }
                    else {
                        addressTemp.forEach(address => {
                            this.addressRecords.push(address);
                        });
                    }
                    if (res.data.pages <= this.currentPage) {
                        if (pageNumber !== 1) {
                            this.existMore = false;
                        }
                        this.currentPage = res.data.pages;
                        if (res.data.total <= this.pageSize) {
                            this.existMore = false;
                        }
                    }
                    else {
                        this.existMore = true;
                    }
                    setTimeout(() => {
                        this.loadingMore = false;
                        if (pageNumber !== 1) {

                        }
                        this.$refs.loading.stopLoading();
                    }, 0);
                }).catch(err => {
                    console.error(err);
                    this.loadingMore = false;
                    this.$refs.loading.stopLoading();
                })
            },
            // 地址点击事件
            handleClick(e) {
                if (this.isSelectMode) {
                    let addressIndex = Number(e.currentTarget.dataset.name.replace('address', ''));
                    let address = JSON.parse(JSON.stringify(this.addressRecords[addressIndex])); //强制深拷贝
                    try {
                        const eventChannel = this.getOpenerEventChannel();
                        eventChannel.emit("acceptDataFromOpenedPage", {
                            address: address
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
                    this.handleEdit(e);
                }
            },
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
                if (this.isSelectMode) {
                    //当前为选择地址模式
                    uni.setClipboardData({
                        data: `${this.$options.filters['formatContactName'](address.contactName)} ${address.contactPhone} ${this.$options.filters['formatAddressDetail'](address.addressDetail, address.areaName)}`
                    });
                }
                else {
                    //当前不为选择地址模式
                    let addressIndex = Number(e.currentTarget.dataset.name.replace('address', ''));
                    let address = JSON.parse(JSON.stringify(this.addressRecords[addressIndex])); //强制深拷贝
                    uni.showActionSheet({
                        itemList: ['复制', '设为默认地址', '删除地址'],
                        success: res => {
                            if (res.tapIndex === 0) {
                                //复制地址
                                uni.setClipboardData({
                                    data: `${this.$options.filters['formatContactName'](address.contactName)} ${address.contactPhone} ${this.$options.filters['formatAddressDetail'](address.addressDetail, address.areaName)}`
                                });
                            }
                            else if (res.tapIndex === 1) {
                                //设为默认地址
                                this.$refs.loading.startLoading();
                                setDefaultAddress({
                                    urlParam: address.id
                                }).then(() => {
                                    this.getMyAddress();
                                    //设置成默认地址成功
                                    setTimeout(() => {
                                        this.$refs.toast.show({
                                            text: '设置成功',
                                            type: 'success',
                                            direction: 'top'
                                        });
                                    }, 500);
                                }).catch(err => {
                                    //设置成默认地址失败
                                    this.$refs.loading.stopLoading();
                                    setTimeout(() => {
                                        this.$refs.toast.show({
                                            text: '设置失败',
                                            type: 'error',
                                            direction: 'top'
                                        });
                                    }, 500);
                                    console.error(err);
                                });
                            }
                            else if (res.tapIndex === 2) {
                                //删除地址
                                uni.showModal({
                                    title: '',
                                    content: '删除地址后将无法恢复，确定删除？',
                                    confirmColor: '#f4756b',
                                    success: res => {
                                        if (res.confirm) {
                                            //确定删除地址
                                            deleteAddressBook({
                                                urlParam: address.id
                                            }).then(() => {
                                                this.getMyAddress();
                                                //删除地址成功
                                                setTimeout(() => {
                                                    this.$refs.toast.show({
                                                        text: '删除成功',
                                                        type: 'success',
                                                        direction: 'top'
                                                    });
                                                }, 500);
                                            }).catch(err => {
                                                //删除地址失败
                                                this.$refs.loading.stopLoading();
                                                setTimeout(() => {
                                                    this.$refs.toast.show({
                                                        text: '删除失败',
                                                        type: 'error',
                                                        direction: 'top'
                                                    });
                                                }, 500);
                                                console.error(err);
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            },
            // 地址编辑按钮点击事件
            handleEdit(e) {
                if (e.currentTarget.dataset.name != null) {
                    const addressIndex = Number(e.currentTarget.dataset.name.replace('address', ''));
                    let address = JSON.parse(JSON.stringify(this.addressRecords[addressIndex])); //强制深拷贝
                    const contactNameTemp = this.$options.filters['getContactGender'](address.contactName);
                    address.contactName = contactNameTemp[0];
                    address.contactGender = contactNameTemp[1];
                    uni.navigateTo({
                        url: '/pagesByStore/addressBook/subpages/editAddress/editAddress',
                        success: res => {
                            res.eventChannel.emit('editAddress', {data: address})
                        }
                    });
                }
            },
            // 新增地址按钮点击事件
            handleAddAddress() {
                uni.navigateTo({
                    url: '/pagesByStore/addressBook/subpages/editAddress/editAddress'
                });
            },
            // 监听屏幕触摸开始事件
            handleScreenTouchStart() {
                this.screenTouching = true;
            },
            //监听屏幕触摸结束事件
            handleScreenTouchEnd() {
                this.screenTouching = false;
                this.releaseToLoadMore = false;
                if (this.scrolling && !this.releaseToLoadMore) {
                    this.isShowBottomBtn = true;
                }
            }
        },
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
        watch: {
            // 监听加载更多的状态变化
            loadingMore(nval, oval) {
                if (nval && !oval && this.addressRecords.length !== 0) {
                    this.$refs.loadingMore.startLoading({
                        width: this.windowWidth,
                        height: 54
                    });
                }
                if (!nval && oval) {
                    this.$refs.loadingMore.stopLoading();
                }
            },
            // 监听等待加载更多的状态
            waitingLoadMore(nval, oval) {
                if (nval && !oval) {
                    this.waitTimer = setInterval(() => {
                        if (this.isShowBottomBtn) {
                            this.loadingMore = true;
                            this.currentPage += 1;
                            this.getMyAddress(this.currentPage);
                            this.waitingLoadMore = false;
                            clearInterval(this.waitTimer);
                        }
                        setTimeout(() => {
                            this.waitingLoadMore = false;
                            clearInterval(this.waitTimer);
                        }, 2000);
                    }, 300);
                }
            }
        },
        // 页面滚动
        onPageScroll(e) {
            if (this.isShowBottomBtn) {
                this.isShowBottomBtn = false;
            }
            this.scrollTop = e.scrollTop;
            this.scrolling = true;
            let timer = setTimeout(() => {
                if (this.scrollTop === e.scrollTop && !this.screenTouching) {
                    this.scrollTop = e.scrollTop;
                    this.scrolling = false;
                    if (!this.releaseToLoadMore) {
                        this.isShowBottomBtn = true;
                    }
                    clearTimeout(timer);
                }
            }, 300);
        },
        // 页面滚动到底部
        onReachBottom() {
            this.releaseToLoadMore = true;
            if (this.existMore) {
                this.waitingLoadMore = true;
            }
        },
        onLoad(options) {
            try {
                const eventChannel = this.getOpenerEventChannel();
                eventChannel.on('selectAddress', data => {
                    this.isSelectMode = !!data.data;
                    this.$forceUpdate();
                });
            } catch (e) {
                this.isSelectMode = false;
                this.$forceUpdate();
            }
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            this.$refs.loading.startLoading();
        },
        onShow() {
            this.$refs.navigationBar.setNavigation({
                titleText: '我的地址',
                backgroundColor: '#f6f6f6'
            });
            this.$refs.loading.startLoading();
            this.getMyAddress();
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
  @import 'addressBook';
</style>