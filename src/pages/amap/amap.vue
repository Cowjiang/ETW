<template>
    <view class="select-position">
        <view class="top-mask">
            <view class="cancel-btn" @click="handleCancel">
                取消
            </view>
        </view>

        <map id="mapContext" ref="mapContext" :latitude="latitude" :longitude="longitude" :scale="16" :max-scale="18"
             :show-location="true"
             :markers="markers" :include-points="markers" @tap="tapSelect"
             :style="{
                  transform: `${isScrollChange ? 'translateY(-' + windowHeight * 0.11 + 'px)' : 0}`,
                  pointerEvents: `${onLoadReady ? 'all' : 'none'}`
             }">
        </map>

        <view class="positioning-btn" @click="getCurrentPosition" v-if="!isScrollChange"
              :style="{
                   transform: `${isScrollChange ? 'translateY(-' + windowHeight * 0.28 + 'px)' : 0}`,
                   color: `${onLoadReady ? '#333' : '#f35b56'}`
              }"
        >
            <i class="fa fa-location-arrow" aria-hidden="true"></i>
        </view>

        <view class="result-container"
              :style="{
                   height: `${isScrollChange ? windowHeight * 0.75 + 'px' : 100 + '%'}`,
                   transform: `${isScrollChange ? 'translateY(30vh)' : 'translateY(55vh)'}`,
                   overflowY: `${isScrollChange ? 'scroll' : ''}`,
                   pointerEvents: `${onLoadReady ? 'all' : 'none'}`
              }"
              @touchmove="isShowConfirmBtn = false"
        >
            <view class="address-tips-container">
                <view class="item" v-for="(add, index) in addressTips" :key="add.id" @click="selectTips(index)"
                      v-if="add.id.length !== 0 && onLoadReady">
                    <view class="name" :style="{color: `${add.selected ? '#f4756b' : '#333'}`}">{{ add.name }}</view>
                    <view class="address" :style="{color: `${add.selected ? '#f4756b' : '#ccc'}`}">
                        {{ distance(currentLatitude, currentLongitude, add.location, add.latitude, add.longitude) }} |
                        {{
                            add.district || ''
                        }}{{ add.address || '' }}
                    </view>
                </view>
                <view class="no-result" v-if="addressTips.length === 0 || !onLoadReady" @click="reGetAuthorization"
                      :style="{
                           fontSize: `${userAuthorization === 1 ? '32rpx' : '42rpx'}`,
                           fontWeight: `${userAuthorization === 1 ? 'normal' : 'bold'}`,
                      }">
                    {{ userAuthorization === 1 ? '无搜索结果' : '点此授权获取位置信息' }}
                </view>
            </view>
        </view>

        <view class="search-mask"
              :style="{transform: `${isScrollChange ? 'translateY(30vh)' : 'translateY(55vh)'}`}"></view>
        <view class="search-container" @click="showSearch"
              :style="{
                   transform: `${isScrollChange ? 'translateY(-' + windowHeight * 0.275 + 'px)' : '-40rpx'}`,
                   textAlign: `${searchRawInputFocus ? 'left' : 'center'}`,
                   pointerEvents: `${onLoadReady ? 'all' : 'none'}`
              }">
            <i class="fa fa-search" aria-hidden="true"
               :style="{textIndent: `${searchRawInputFocus ? '30rpx' : '0'}`}"></i>
            <text v-if="!searchRawInputFocus">{{ searchShowInput }}</text>
            <input type="text" v-model="searchRawInput" :focus="searchRawInputFocus" @blur="bindInputBlur"
                   v-if="searchRawInputFocus" @confirm="doSearch" :confirm-type="`搜索`">
        </view>

        <view class="confirm-container" v-if="isShowConfirmBtn"
              :style="{pointerEvents: `${onLoadReady ? 'all' : 'none'}`}">
            <view class="confirm-mask"></view>
            <view class="confirm-btn" @click="handleConfirm">
                确定
            </view>
        </view>
        <toast ref="toast" class="toast"/>
    </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';

    export default {
        components: {
            toast
        },
        data() {
            return {
                mapContext: null,
                onLoadReady: false, //加载完毕状态
                userAuthorization: -1, //用户授权定位权限状态，[-1: 未授权, 0: 拒绝, 1: 已授权]
                checkUserAuthorizationTimer: null,
                windowWidth: 0,
                windowHeight: 0,
                currentLatitude: 0, //用户当前纬度
                currentLongitude: 0, //用户当前经度
                latitude: 39.909187,
                longitude: 116.397451,
                currentCity: '',
                addressTips: [], //附近推荐POI
                currentAddressTips: [], //用户当前位置附近推荐POI
                markers: [],
                isScrollChange: false,
                isShowConfirmBtn: false,
                positioningTimer: 0,
                currentSelect: -1,
                searchShowInput: '搜索地点',
                searchRawInput: '',
                searchRawInputFocus: false,
            }
        },
        methods: {
            /**
             * 主动获取当前位置
             */
            getCurrentPosition() {
                this.checkAuthorization(); //检查用户授权
                if (this.userAuthorization !== 0) {
                    this.getNearbyPlace(null);
                    this.addressTips = this.currentAddressTips;
                    this.clearSelected();
                    this.isScrollChange = false;
                    this.searchRawInput = '';
                }
            },

            /**
             * 地图点击事件
             */
            tapSelect(e) {
                let location = `${e.detail.longitude},${e.detail.latitude}`;
                this.markers[0] = {
                    latitude: e.detail.latitude,
                    longitude: e.detail.longitude
                };
                this.currentSelect = -2;
                this.getNearbyPlace(location);
                this.isShowConfirmBtn = true;
            },

            /**
             * 获取附近信息
             * @param location 需要查询的经纬度信息
             */
            async getNearbyPlace(location) {
                if (location === null && Date.now() - this.positioningTimer >= 3000) {
                    wx.stopLocationUpdate();
                    this.markers[0] = {
                        latitude: this.currentLatitude,
                        longitude: this.currentLongitude,
                        alpha: 0
                    };
                    wx.startLocationUpdate({
                        success: res => {
                            wx.onLocationChange((res) => {
                                this.markers[0] = {
                                    latitude: res.latitude,
                                    longitude: res.longitude,
                                    alpha: 0
                                };
                                this.positioningTimer = Date.now();
                                this.currentLatitude = res.latitude;
                                this.currentLongitude = res.longitude;
                                this.utils.throttle(() => {
                                    this.getPositionInfo(`${this.currentLongitude},${this.currentLatitude}`);
                                }, 3000);
                                wx.stopLocationUpdate();
                                this.$forceUpdate();
                            });
                        },
                        fail: error => {
                            this.$refs.toast.show({
                                text: '获取定位失败',
                                type: 'error',
                                direction: 'top'
                            });
                            console.log(error);
                        }
                    });
                }
                else if (location === null && Date.now() - this.positioningTimer < 3000) {
                    this.onLoadReady = true;
                    this.addressTips = this.currentAddressTips;
                    this.markers[0] = {
                        latitude: this.currentLatitude,
                        longitude: this.currentLongitude,
                        alpha: 0
                    };
                }
                else {
                    let poiResult = await this.getPositionInfo(location);
                    if (poiResult !== null) {
                        this.onLoadReady = true;
                        this.addressTips = poiResult.markers;
                    }
                }
                if (this.onLoadReady === true) {
                    wx.hideLoading({
                        fail: e => {
                            // console.log(e)
                        }
                    });
                }
                else {
                    wx.showLoading({
                        title: '加载中'
                    });
                }
                this.$forceUpdate();
            },

            /**
             * 根据位置信息获取POI
             * @param location 需要查询的经纬度信息
             */
            getPositionInfo(location) {
                return new Promise((resolve, reject) => {
                    if (location !== null) {
                        this.amap.getPoiAround({
                            location: location,
                            querytypes: '050000|060100|120000|150500|150200|150104|141200', //餐饮服务|商场|商务住宅|地铁站|火车站|机场|学校
                            success: data => {
                                if (data !== null) {
                                    this.onLoadReady = true;
                                    this.addressTips = data.markers;
                                    this.currentAddressTips = this.addressTips;
                                }
                                resolve(data);
                            },
                            fail: error => {
                                reject(error);
                            }
                        })
                    }
                    else {
                        this.amap.getRegeo({
                            success: data => {
                                if (data !== null) {
                                    this.currentCity = data[0].regeocodeData.addressComponent.city;
                                }
                                resolve(data);
                            },
                            fail: error => {
                                reject(error);
                            }
                        });
                    }
                }).catch(err => {
                    switch (err.errMsg) {
                        case 'getLocation:fail auth deny':
                            this.$refs.toast.show({
                                text: '请授权获取位置信息',
                                type: 'error',
                                direction: 'top'
                            });
                            console.log('用户拒绝定位权限');
                            break;
                        default:
                            // this.$refs.toast.show({
                            //     text: err.errMsg,
                            //     type: 'error',
                            //     direction: 'top'
                            // });
                            console.log(err);
                    }
                })
            },

            /**
             * 获取搜索结果
             */
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
                        }
                    })
                }).catch(err => {
                    console.log(err);
                })
            },

            /**
             * 附近位置列表点击事件
             * @param index 列表索引
             */
            selectTips(index) {
                this.clearSelected();
                this.addressTips[index].selected = true;
                this.isShowConfirmBtn = true;
                let selLatitude, selLongitude;
                if (this.addressTips[index].location !== null && this.addressTips[index].location !== undefined) {
                    selLatitude = parseFloat(this.addressTips[index].location.substring(this.addressTips[index].location.indexOf(',') + 1));
                    selLongitude = parseFloat(this.addressTips[index].location.substring(0, this.addressTips[index].location.indexOf(',')));
                }
                else {
                    selLatitude = this.addressTips[index].latitude;
                    selLongitude = this.addressTips[index].longitude;
                }
                this.markers[0] = {
                    latitude: selLatitude,
                    longitude: selLongitude,
                };
                this.currentSelect = index;
                this.$forceUpdate();
            },

            /**
             * 清除选择列表
             */
            clearSelected() {
                for (const add of this.addressTips) {
                    add.selected = false;
                }
            },

            /**
             * 取消按钮点击事件
             */
            handleCancel() {
                this.$refs.toast.show({
                    text: '取消按钮点击',
                    type: 'success',
                    direction: 'top'
                });
            },

            /**
             * 确定按钮点击事件
             */
            handleConfirm() {
                let resultLatitude, resultLongitude;
                if (this.markers.length !== 0) {
                    resultLatitude = this.markers[0].latitude;
                    resultLongitude = this.markers[0].longitude;
                }
                else {
                    resultLatitude = this.currentLatitude;
                    resultLongitude = this.currentLongitude;
                }
                this.$refs.toast.show({
                    text: `经纬度：${resultLongitude},${resultLatitude}`,
                    type: 'success',
                    direction: 'top'
                });
            },

            /**
             * 用户点击搜索区域
             */
            showSearch() {
                this.searchRawInputFocus = true;
                uni.pageScrollTo({
                    scrollTop: 10,
                });
            },

            /**
             * 搜索输入框失焦事件
             */
            bindInputBlur() {
                this.searchRawInputFocus = false;
            },

            /**
             * 根据关键词搜索结果
             */
            async doSearch() {
                if (this.searchShowInput !== '' && this.searchShowInput !== '搜索地点') {
                    let searchResult = await this.getInputTips();
                    if (searchResult !== null) {
                        this.addressTips = searchResult.tips;
                    }
                    this.$forceUpdate();
                }
            },

            /**
             * 检查用户授权状态
             */
            checkAuthorization() {
                wx.getSetting({
                    success: res => {
                        this.userAuthorization = 3;
                        if (res.authSetting['scope.userLocation'] === undefined) {
                            this.userAuthorization = -1;
                            this.checkUserAuthorizationTimer = setTimeout(() => {
                                clearTimeout(this.checkUserAuthorizationTimer);
                                this.checkUserAuthorizationTimer = null;
                                this.checkAuthorization();
                            }, 500);
                        }
                        else if (res.authSetting['scope.userLocation'] === false) {
                            if (this.checkUserAuthorizationTimer !== null) {
                                clearTimeout(this.checkUserAuthorizationTimer);
                                this.checkUserAuthorizationTimer = null;
                            }
                            this.userAuthorization = 0;
                            this.reGetAuthorization();
                        }
                        else if (res.authSetting['scope.userLocation'] === true) {
                            if (this.checkUserAuthorizationTimer !== null) {
                                clearTimeout(this.checkUserAuthorizationTimer);
                                this.checkUserAuthorizationTimer = null;
                            }
                            this.userAuthorization = 1;
                        }
                        this.$forceUpdate();
                    }
                })
            },

            /**
             * 重新获取用户授权
             */
            reGetAuthorization() {
                if (this.userAuthorization !== 1) {
                    wx.openSetting({
                        success: res => {
                            if (res.authSetting['scope.userLocation'] === false) {
                                this.checkAuthorization();
                            }
                        }
                    });
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
        computed: {
            /**
             * 计算两点距离
             */
            distance() {
                return (la1, lo1, newLocation, newLa, newLo) => {
                    let la2, lo2;
                    if (newLocation !== null && newLocation !== undefined) {
                        la2 = parseFloat(newLocation.substring(newLocation.indexOf(',') + 1));
                        lo2 = parseFloat(newLocation.substring(0, newLocation.indexOf(',')));
                    }
                    else {
                        la2 = newLa;
                        lo2 = newLo;
                    }
                    let La1 = la1 * Math.PI / 180.0;
                    let La2 = la2 * Math.PI / 180.0;
                    let La3 = La1 - La2;
                    let Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
                    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
                    s = s * 6378.137; //地球半径
                    s = Math.round(s * 10000) / 10000;
                    let returnValue = ''; //返回运算后的结果字符串
                    switch (true) {
                        case (s * 1000).toFixed(0) <= 100:
                            returnValue = '100m内';
                            break;
                        case (s * 1000).toFixed(0) > 100 && (s * 1000).toFixed(0) < 1000:
                            returnValue = `${(s * 1000).toFixed(0)}m`;
                            break;
                        case (s * 1000).toFixed(0) >= 1000 && (s * 1000).toFixed(0) < 100000:
                            returnValue = `${(s).toFixed(1)}km`;
                            break;
                        case (s * 1000).toFixed(0) >= 100000:
                            returnValue = '大于100km';
                            break;
                    }
                    return returnValue;
                }
            }
        },
        watch: {
            searchRawInput(nval, oval) {
                this.searchShowInput = nval.replace(/\s*/g, "");
                if (nval.replace(/\s*/g, "") === '') {
                    this.searchShowInput = '搜索地点';
                    this.addressTips = this.currentAddressTips;
                    this.clearSelected();
                    this.markers[0] = {
                        latitude: this.currentLatitude,
                        longitude: this.currentLongitude,
                        alpha: 0
                    };
                    this.$forceUpdate();
                }
                else {
                    this.utils.throttle(() => {
                        this.doSearch();
                    }, 1000)
                }
            },
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
            onLoadReady(nval, oval) {
                if (nval === true) {
                    this.$nextTick(() => {
                        wx.hideLoading();
                    });
                }
                else if (nval === false) {
                    wx.showLoading({
                        title: '加载中'
                    });
                }
            }
        },
        mounted() {
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.screenWidth;
                    this.windowHeight = res.screenHeight;
                },
                fail: res => {
                    console.log(res);
                }
            });
        },
        onLoad() {

        },
        onShow() {
            this.$nextTick(() => {
                this.onLoadReady = false;
                wx.showLoading({
                    title: '加载中'
                });
                this.getCurrentPosition();
            });
            this.mapContext = wx.createMapContext('mapContext');
            this.$forceUpdate();
        },
        onHide() {
            wx.stopLocationUpdate({
                fail: e => {
                    // console.log(e)
                }
            });
        }
    }
</script>

<style lang="scss" scoped>
    .select-position {
        width: 100vw;
        height: 100vh;

        .top-mask {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: rpx(250);
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0));
            z-index: 10;
            pointer-events: none;

            .cancel-btn {
                font-size: rpx(34);
                color: #ffffff;
                margin: rpx(100) rpx(40) 0;
                pointer-events: all;
            }
        }

        map {
            width: 100%;
            height: 60vh;
            //transition-property: ;
            transition-duration: 500ms;
        }

        .positioning-btn {
            position: fixed;
            top: calc(55vh - 150rpx);
            right: rpx(30);
            width: rpx(90);
            height: rpx(90);
            color: $uni-text-color;
            background-color: $uni-bg-color;
            border-radius: 50%;
            text-align: center;
            font-size: rpx(48);
            line-height: rpx(90);
            box-shadow: rpx(6) rpx(6) rpx(10) #dddddd;
            transition-duration: 500ms;
        }

        .result-container {
            background-color: $uni-bg-color;
            position: absolute;
            //top: 55vh;
            top: 0;
            left: 0;
            width: 100%;
            border-radius: rpx(30) rpx(30) 0 0;
            transition-duration: 500ms;
            padding-top: rpx(100);
            padding-bottom: rpx(30);

            .address-tips-container {
                width: 100%;

                .item {
                    width: 100%;
                    height: rpx(100);
                    padding: rpx(65) rpx(40);

                    .name {
                        font-size: rpx(32);
                        color: $uni-text-color;
                        margin-bottom: rpx(5);
                    }

                    .address {
                        font-size: rpx(26);
                        color: #cccccc;
                    }
                }

                .item:nth-last-child(1) {
                    margin-bottom: rpx(100);
                }

                .no-result {
                    width: 100%;
                    height: 35vh;
                    text-align: center;
                    font-size: rpx(32);
                    line-height: 35vh;
                    color: #cccccc;
                    pointer-events: all;
                }
            }
        }

        .search-mask {
            width: 100%;
            height: rpx(150);
            position: absolute;
            top: 0;
            left: 0;
            border-radius: rpx(30) rpx(30) 0 0;
            background-color: $uni-bg-color;
            transition-duration: 500ms;
        }

        .search-container {
            width: 90%;
            height: rpx(70);
            margin: 0 auto;
            border-radius: rpx(15);
            background-color: $uni-color-grey;
            text-align: center;
            font-size: rpx(32);
            line-height: rpx(70);
            color: $uni-color-gray;
            transform: translateY(rpx(-40));
            transition-duration: 500ms;

            text {
                margin-left: rpx(15);
            }

            input {
                position: relative;
                top: rpx(-70);
                left: rpx(75);
                width: 80%;
                height: rpx(70);
                line-height: rpx(70);

            }
        }

        .confirm-container {
            position: fixed;
            bottom: 0;
            width: 100%;
            height: rpx(200);
            transition-duration: 100ms;
            transition-property: opacity;
            pointer-events: none;

            .confirm-mask {
                width: 100%;
                height: 100%;
                background: linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.5));
                pointer-events: none;
            }

            .confirm-btn {
                width: 36%;
                height: rpx(70);
                text-align: center;
                line-height: rpx(70);
                font-size: rpx(32);
                color: #fff;
                border-radius: rpx(15);
                position: absolute;
                left: 32%;
                letter-spacing: rpx(2);
                bottom: rpx(55);
                margin: 0 auto;
                background-color: $uni-color-primary;
                pointer-events: all;
            }
        }
    }

    .toast {
        position: absolute;
        top: rpx(150);
        width: 100%;
    }
</style>