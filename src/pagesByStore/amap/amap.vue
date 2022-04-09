<template>
  <view class="select-position">
    <toast ref="toast" class="toast"/>
    <loading ref="loading" fullscreen/>

    <!-- 顶部半透明蒙版 -->
    <view class="top-mask">
      <view class="cancel-btn" @click="handleCancel"> 取消</view>
    </view>
    <!-- 地图主体 -->
    <map
      id="mapContext"
      ref="mapContext"
      :latitude="latitude"
      :longitude="longitude"
      :scale="16"
      :max-scale="18"
      :show-location="true"
      :markers="markers"
      :include-points="markers"
      @tap="tapSelect"
      :style="{
        transform: `${isScrollChange ? 'translateY(-' + windowHeight * 0.11 + 'px)' : 0}`,
        pointerEvents: `${pointerEvents}`,
      }">
    </map>
    <!-- 定位到当前位置按钮 -->
    <view
      class="positioning-btn"
      @click="getCurrentPosition"
      v-if="!isScrollChange"
      :style="{
        transform: `${isScrollChange ? 'translateY(-' + windowHeight * 0.28 + 'px)' : 0}`,
        color: `${onLoadReady ? '#333' : '#f35b56'}`,
      }">
      <i class="fa fa-location-arrow" aria-hidden="true"></i>
    </view>
    <!-- 地点结果列表容器 -->
    <view
      class="result-container"
      :style="{
        height: `${isScrollChange ? windowHeight * 0.75 + 'px' : 100 + '%'}`,
        transform: `${isScrollChange ? 'translateY(30vh)' : 'translateY(55vh)'}`,
        overflowY: `${isScrollChange ? 'scroll' : ''}`,
        pointerEvents: `${onLoadReady ? 'all' : 'none'}`,
      }"
      @touchmove="isShowConfirmBtn = false">
      <!-- 附近地点推荐列表容器 -->
      <view class="address-tips-container">
        <!-- 加载动画组件 -->
        <view
          v-show="loadingAddressTips"
          class="no-result">
          <loading
            ref="loadingPOI"
            parent-class="no-result"/>
        </view>
        <!-- 重新获取定位 -->
        <view
          v-show="getLocationFailed"
          class="no-result"
          @click="reGetLocation"
          :style="{
            fontSize: '42rpx',
            fontWeight: 'bold',
          }">
          重新获取位置信息
        </view>
        <!-- 附近地点 -->
        <view
          class="item"
          v-if="add.id.length !== 0 && onLoadReady"
          v-show="!loadingAddressTips && !getLocationFailed"
          v-for="(add, index) in addressTips"
          :key="add.id"
          @click="selectTips(index)">
          <view
            class="name"
            :style="{ color: `${add.selected ? '#f4756b' : '#333'}` }">
            {{ add.name }}
          </view>
          <view
            class="address"
            :style="{ color: `${add.selected ? '#f4756b' : '#ccc'}` }">
            {{
              distance(
                currentLatitude,
                currentLongitude,
                add.location,
                add.latitude,
                add.longitude
              )
            }}
            | {{ add.district || '' }}{{ add.address || '' }}
          </view>
        </view>
        <!-- 没有结果 -->
        <view
          v-if="addressTips.length === 0 || !onLoadReady"
          v-show="!loadingAddressTips && !getLocationFailed"
          class="no-result"
          @click="reGetAuthorization"
          :style="{
            fontSize: `${userAuthorization === 1 ? '32rpx' : '42rpx'}`,
            fontWeight: `${userAuthorization === 1 ? 'normal' : 'bold'}`,
          }">
          {{ userAuthorization === 1 ? "无搜索结果" : "点此授权获取位置信息" }}
        </view>
      </view>
    </view>
    <!-- 搜索蒙版 -->
    <view
      class="search-mask"
      :style="{
        transform: `${isScrollChange ? 'translateY(30vh)' : 'translateY(55vh)'}`,
      }">
    </view>
    <!-- 搜索容器 -->
    <view
      class="search-container"
      @click="showSearch"
      :style="{
        transform: `${isScrollChange ? 'translateY(-' + windowHeight * 0.275 + 'px)' : '-40rpx'}`,
        textAlign: `${searchRawInputFocus ? 'left' : 'center'}`,
        pointerEvents: `${pointerEvents}`,
      }">
      <i
        class="fa fa-search"
        aria-hidden="true"
        :style="{ textIndent: `${searchRawInputFocus ? '30rpx' : '0'}` }"></i>
      <text v-if="!searchRawInputFocus">{{ searchShowInput }}</text>
      <input
        type="text"
        v-model="searchRawInput"
        :focus="searchRawInputFocus"
        @blur="bindInputBlur"
        v-if="searchRawInputFocus"
        @confirm="doSearch"
        :confirm-type="`搜索`"/>
    </view>
    <!-- 确认按钮容器 -->
    <view
      class="confirm-container"
      v-show="isShowConfirmBtn"
      :style="{ pointerEvents: `${onLoadReady ? 'all' : 'none'}` }">
      <view class="confirm-mask"></view>
      <view class="confirm-btn" @click="handleConfirm">确定</view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";

    export default {
        components: {
            toast, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                mapContext: null, //地图对象
                onLoadReady: false, //定位获取完毕状态
                userAuthorization: -1, //用户授权定位权限状态，[-1: 未授权, 0: 拒绝, 1: 已授权]
                checkUserAuthorizationTimer: null, //检查用户授权状态的计时器
                getLocationTimer: null, //获取定位的计时器（用于计算超时）
                getLocationFailed: false, //获取定位失败
                currentLatitude: 0, //用户当前纬度
                currentLongitude: 0, //用户当前经度
                latitude: 39.909187, //初始化纬度
                longitude: 116.397451, //初始化精度
                currentCity: '', //当前城市
                addressTips: [], //附近推荐POI
                addressTipsDetail: [], //附近推荐POI的详细信息
                currentAddressTips: [], //用户当前位置附近推荐POI
                loadingAddressTips: true, //正在加载POI
                markers: [], //地图标记数组
                isScrollChange: false, //是否产生滚动变化
                isShowConfirmBtn: false, //是否显示确认按钮
                positioningTimer: 0, //上一次获取位置信息的时间（用于防止频繁获取定位）
                currentSelect: -1, //当前选择的附近地点列表项序号
                searchShowInput: '搜索地点', //搜索框展示的文字
                searchRawInput: '', //原始搜索输入框的内容
                searchRawInputFocus: false, //原始搜索输入框聚焦状态
            };
        },
        methods: {
            // 主动获取当前位置
            getCurrentPosition() {
                this.checkAuthorization(); //检查用户授权
                if (this.userAuthorization !== 0) {
                    this.getNearbyPlace();
                    this.addressTips = this.currentAddressTips;
                    this.clearSelected();
                    this.isScrollChange = false;
                    this.searchRawInput = '';
                }
            },
            /**
             * 获取附近信息
             * @param {String|Null} location 需要查询的经纬度信息
             */
            async getNearbyPlace(location = null) {
                if (!location && Date.now() - this.positioningTimer >= 3000) {
                    //查询当前位置，且距离上次定位间隔超过3秒
                    wx.stopLocationUpdate();
                    this.markers[0] = {
                        id: 0,
                        width: 40,
                        height: 60,
                        latitude: this.currentLatitude,
                        longitude: this.currentLongitude,
                        alpha: 0,
                    };
                    //开启位置变化监听
                    wx.startLocationUpdate({
                        success: () => {
                            clearTimeout(this.getLocationTimer);
                            this.getLocationTimer = setTimeout(() => {
                                wx.offLocationChange();
                                wx.stopLocationUpdate();
                                this.getLocationFailed = true;
                                this.$refs.toast.show({
                                    text: '获取定位失败',
                                    type: 'error',
                                    direction: 'top',
                                });
                                clearTimeout(this.getLocationTimer);
                                this.getLocationTimer = null;
                            }, 5000);
                            wx.onLocationChange(res => {
                                this.markers[0] = {
                                    id: 0,
                                    width: 40,
                                    height: 60,
                                    latitude: res.latitude,
                                    longitude: res.longitude,
                                    alpha: 1,
                                }; //在地图上显示当前位置标记
                                this.positioningTimer = Date.now(); //重置定时器
                                this.currentLatitude = res.latitude;
                                this.currentLongitude = res.longitude;
                                this.onLoadReady = true;
                                this.utils.throttle(() => {
                                    this.getPositionInfo(`${this.currentLongitude},${this.currentLatitude}`); //获取当前位置信息
                                }, 3000);
                                wx.offLocationChange();
                                wx.stopLocationUpdate();
                                clearTimeout(this.getLocationTimer);
                                this.getLocationTimer = null;
                                this.$forceUpdate();
                            });
                        },
                        fail: error => {
                            this.getLocationFailed = false;
                            this.$refs.toast.show({
                                text: '获取定位失败',
                                type: 'error',
                                direction: 'top',
                            });
                            console.error(error);
                        },
                    });
                }
                else if (!location && Date.now() - this.positioningTimer < 3000) {
                    //查询当前位置，且距离上次定位间隔3秒之内
                    this.onLoadReady = true;
                    this.addressTips = this.currentAddressTips;
                    this.markers[0] = {
                        id: 0,
                        width: 40,
                        height: 60,
                        latitude: this.currentLatitude,
                        longitude: this.currentLongitude,
                        alpha: 1,
                    }; //在地图上显示当前位置标记
                }
                else {
                    //查询指定位置的附近信息
                    const poiResult = await this.getPositionInfo(location); //获取位置信息
                    if (poiResult) {
                        this.onLoadReady = true;
                        this.addressTips = poiResult.markers;
                    }
                }
                this.$forceUpdate();
            },
            /**
             * 根据位置信息获取POI
             * @param {String|Null} location 需要查询的经纬度信息
             */
            getPositionInfo(location = null) {
                return new Promise((resolve, reject) => {
                    this.loadingAddressTips = true;
                    if (location) {
                        //获取指定经纬度的POI信息
                        this.amap.getPoiAround({
                            location: location,
                            querytypes: '050000|060100|120000|150500|150200|150104|141200', //餐饮服务|商场|商务住宅|地铁站|火车站|机场|学校
                            success: data => {
                                if (data) {
                                    this.onLoadReady = true;
                                    this.addressTips = data.markers;
                                    this.addressTipsDetail = data.poisData;
                                    this.currentAddressTips = this.addressTips;
                                }
                                this.loadingAddressTips = false;
                                resolve(data);
                            },
                            fail: error => {
                                this.loadingAddressTips = false;
                                reject(error);
                            },
                        });
                    }
                    else {
                        //获取当前位置的附近信息（暂无用到，后续可删）
                        this.amap.getRegeo({
                            location: location,
                            success: data => {
                                this.loadingAddressTips = false;
                                resolve(data);
                            },
                            fail: error => {
                                this.loadingAddressTips = false;
                                reject(error);
                            },
                        });
                    }
                }).catch(err => {
                    this.loadingAddressTips = false;
                    switch (err.errMsg) {
                        case 'getLocation:fail auth deny':
                            this.$refs.toast.show({
                                text: '请授权获取位置信息',
                                type: 'error',
                                direction: 'top',
                            });
                            console.error('用户拒绝定位权限');
                            break;
                        default:
                            console.error(err);
                    }
                });
            },
            // 地图点击事件
            tapSelect(e) {
                this.utils.throttle(() => {
                    const location = `${e.detail.longitude},${e.detail.latitude}`;
                    this.markers[0] = {
                        id: 0,
                        width: 40,
                        height: 60,
                        latitude: e.detail.latitude,
                        longitude: e.detail.longitude,
                    };
                    this.currentSelect = -2;
                    this.getNearbyPlace(location);
                    this.isShowConfirmBtn = true;
                }, 1000);
            },
            // 获取搜索结果
            getInputTips() {
                return new Promise((resolve, reject) => {
                    this.amap.getInputtips({
                        keywords: this.searchShowInput,
                        location: `${this.currentLongitude},${this.currentLatitude}`,
                        pageSize: 20,
                        success: data => {
                            resolve(data);
                        },
                        fail: e => {
                            reject(e);
                        },
                    });
                }).catch(err => {
                    console.error(err);
                });
            },
            /**
             * 附近位置列表点击事件
             * @param {Number} index 列表索引
             */
            selectTips(index) {
                this.clearSelected();
                this.addressTips[index].selected = true;
                this.isShowConfirmBtn = true;
                let selLatitude, selLongitude;
                if (!!this.addressTips[index].location) {
                    selLatitude = parseFloat(
                        this.addressTips[index].location.substring(this.addressTips[index].location.indexOf(",") + 1)
                    );
                    selLongitude = parseFloat(
                        this.addressTips[index].location.substring(0, this.addressTips[index].location.indexOf(","))
                    );
                }
                else {
                    selLatitude = this.addressTips[index].latitude;
                    selLongitude = this.addressTips[index].longitude;
                }
                this.markers[0] = {
                    id: 0,
                    width: 40,
                    height: 60,
                    latitude: selLatitude,
                    longitude: selLongitude,
                };
                this.currentSelect = index;
                this.$forceUpdate();
            },
            // 清除选择列表
            clearSelected() {
                this.addressTips.forEach(add => {
                    add.selected = false;
                });
            },
            // 用户点击搜索区域
            showSearch() {
                this.searchRawInputFocus = true;
                uni.pageScrollTo({
                    scrollTop: 10,
                });
            },
            // 搜索输入框失焦事件
            bindInputBlur() {
                this.searchRawInputFocus = false;
            },
            // 根据关键词搜索结果
            async doSearch() {
                if (this.searchShowInput !== '' && this.searchShowInput !== '搜索地点') {
                    let searchResult = await this.getInputTips();
                    if (!!searchResult) {
                        searchResult.tips.forEach((v, k) => {
                            if (v.name.includes('公交站') || v.address == null) {
                                searchResult.tips.splice(k, 1);
                            }
                        });
                        this.addressTips = searchResult.tips;
                    }
                    this.$forceUpdate();
                }
            },
            // 检查用户授权状态
            checkAuthorization() {
                wx.getSetting({
                    success: res => {
                        this.userAuthorization = 3;
                        if (res.authSetting['scope.userLocation'] === undefined) {
                            //用户未授权
                            this.loadingAddressTips = false;
                            this.userAuthorization = -1;
                            this.checkUserAuthorizationTimer = setTimeout(() => {
                                clearTimeout(this.checkUserAuthorizationTimer);
                                this.checkUserAuthorizationTimer = null;
                                this.checkAuthorization();
                            }, 500);
                        }
                        else if (!res.authSetting['scope.userLocation']) {
                            //用户拒绝授权
                            this.loadingAddressTips = false;
                            if (!!this.checkUserAuthorizationTimer) {
                                clearTimeout(this.checkUserAuthorizationTimer);
                                this.checkUserAuthorizationTimer = null;
                            }
                            this.$refs.loading.stopLoading();
                            this.userAuthorization = 0;
                            this.reGetAuthorization();
                        }
                        else if (res.authSetting['scope.userLocation']) {
                            //用户已授权
                            if (!!this.checkUserAuthorizationTimer) {
                                clearTimeout(this.checkUserAuthorizationTimer);
                                this.checkUserAuthorizationTimer = null;
                            }
                            this.userAuthorization = 1;
                        }
                        this.$forceUpdate();
                    },
                });
                this.$once('hook:beforeDestroy', () => {
                    clearTimeout(this.checkUserAuthorizationTimer);
                    this.checkUserAuthorizationTimer = null;
                    clearTimeout(this.getLocationTimer);
                    this.getLocationTimer = null;
                }); //销毁定时器
            },
            // 重新获取用户授权
            reGetAuthorization() {
                if (this.userAuthorization !== 1) {
                    //开启小程序用户授权页
                    wx.openSetting({
                        success: res => {
                            if (!res.authSetting['scope.userLocation']) {
                                this.checkAuthorization();
                            }
                        },
                    });
                }
            },
            // 重新获取定位信息
            reGetLocation() {
                this.getNearbyPlace();
                this.onLoadReady = false;
                this.loadingAddressTips = true;
                this.getLocationFailed = false;
            },
            // 取消按钮点击事件
            handleCancel() {
                uni.navigateBack();
            },
            // 确定按钮点击事件
            handleConfirm() {
                let resultDetails = {};
                if (this.currentSelect >= 0) {
                    //结果列表有已选择的地点
                    if (this.searchRawInput !== "") {
                        //当前处于搜索状态
                        resultDetails = this.addressTips[this.currentSelect];
                        resultDetails.location = this.markers[0];
                    }
                    else {
                        //当前未处于搜索状态
                        resultDetails = this.addressTipsDetail[this.currentSelect];
                        if (this.markers.length !== 0) {
                            //地图标记数组不为空
                            resultDetails.location = this.markers[0];
                        }
                        else {
                            //地图标记数组为空
                            resultDetails.location = {
                                latitude: this.currentLatitude,
                                longitude: this.currentLongitude,
                            };
                        }
                    }
                }
                else {
                    //结果列表无已选择的点（用户点击地图选点）
                    if (this.addressTipsDetail.length !== 0) {
                        //结果列表不为空
                        resultDetails = this.addressTipsDetail[0];
                        resultDetails.location = {
                            latitude: this.currentLatitude,
                            longitude: this.currentLongitude,
                        };
                    }
                    else {
                        //结果列表为空
                    }
                }
                try {
                    const eventChannel = this.getOpenerEventChannel();
                    eventChannel.emit('acceptDataFromOpenedPage', {
                        resultDetails: resultDetails
                    });
                    uni.navigateBack();
                } catch (e) {
                    // console.log(resultDetails);
                }
            },
        },
        computed: {
            /**
             * 计算两点距离
             * @return {String} 返回距离结果
             */
            distance() {
                return (la1, lo1, newLocation, newLa, newLo) => {
                    try {
                        let la2, lo2;
                        if (newLocation !== null && newLocation !== undefined) {
                            la2 = parseFloat(newLocation.substring(newLocation.indexOf(',') + 1));
                            lo2 = parseFloat(newLocation.substring(0, newLocation.indexOf(',')));
                        }
                        else {
                            la2 = newLa;
                            lo2 = newLo;
                        }
                        let La1 = (la1 * Math.PI) / 180.0;
                        let La2 = (la2 * Math.PI) / 180.0;
                        let La3 = La1 - La2;
                        let Lb3 = (lo1 * Math.PI) / 180.0 - (lo2 * Math.PI) / 180.0;
                        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
                        s = s * 6378.137; //地球半径
                        s = Math.round(s * 10000) / 10000;
                        let returnValue = ""; //返回运算后的结果字符串
                        switch (true) {
                            case (s * 1000).toFixed(0) <= 100:
                                returnValue = '100m内';
                                break;
                            case (s * 1000).toFixed(0) > 100 && (s * 1000).toFixed(0) < 1000:
                                returnValue = `${(s * 1000).toFixed(0)}m`;
                                break;
                            case (s * 1000).toFixed(0) >= 1000 && (s * 1000).toFixed(0) < 100000:
                                returnValue = `${s.toFixed(1)}km`;
                                break;
                            case (s * 1000).toFixed(0) >= 100000:
                                returnValue = '大于100km';
                                break;
                        }
                        return returnValue;
                    } catch (e) {
                    }
                };
            },
            // 触摸穿透
            pointerEvents() {
                return this.onLoadReady && !this.getLocationFailed ? 'all' : 'none';
            }
        },
        watch: {
            // 原始搜索输入框输入值变化
            searchRawInput(nval) {
                this.searchShowInput = nval.replace(/\s*/g, '');
                if (nval.replace(/\s*/g, '') === '') {
                    this.searchShowInput = '搜索地点';
                    this.addressTips = this.currentAddressTips;
                    this.clearSelected();
                    this.markers[0] = {
                        id: 0,
                        width: 40,
                        height: 60,
                        latitude: this.currentLatitude,
                        longitude: this.currentLongitude,
                        alpha: 0,
                    };
                    this.$forceUpdate();
                }
                else {
                    this.utils.throttle(() => {
                        this.doSearch();
                    }, 1000);
                }
            },
            // 用户授权状态变化
            userAuthorization(nval, oval) {
                switch (nval) {
                    case -1:
                        if (oval !== 3) {
                            this.checkAuthorization();
                        }
                        break;
                    case 0:
                        // this.reGetAuthorization()
                        break;
                    case 1:
                        this.getCurrentPosition();
                        break;
                }
            },
            // 定位完毕状态变化
            onLoadReady(nval) {
                nval ? this.$refs.loading.stopLoading() : this.$refs.loading.startLoading();
            },
            // POI信息加载状态变化
            loadingAddressTips(nval) {
                if (nval) {
                    this.$refs.loadingPOI.startLoading({
                        width: this.windowWidth,
                        height: this.windowHeight * 0.3
                    });
                }
                else {
                    this.$refs.loadingPOI.stopLoading();
                }
            },
            // 获取定位失败监听
            getLocationFailed(nval) {
                if (nval) {
                    this.onLoadReady = true;
                    this.loadingAddressTips = false;
                }
            }
        },
        onPageScroll(res) {
            if (res.scrollTop !== 0) {
                if (this.isScrollChange === false) {
                    this.isScrollChange = true;
                }
                if (this.isShowConfirmBtn === true) {
                    this.isShowConfirmBtn = false;
                }
            }
            else {
                this.isScrollChange = false;
            }
        },
        created() {
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.screenWidth;
                    this.windowHeight = res.screenHeight;
                },
            });
        },
        onLoad() {
            this.utils.resetThrottle();
            this.$refs.loading.startLoading();
            this.$refs.loadingPOI.startLoading({
                width: this.windowWidth,
                height: this.windowHeight * 0.3
            });
        },
        onShow() {
            this.onLoadReady = false;
            this.getCurrentPosition(); //获取当前位置
            this.mapContext = wx.createMapContext('mapContext'); //初始化地图对象
            this.$forceUpdate();
        },
        onHide() {
            wx.stopLocationUpdate({
                fail: (e) => {
                    console.log(e)
                },
            });
        },
    };
</script>

<style lang="scss" scoped>
  @import 'amap';
</style>