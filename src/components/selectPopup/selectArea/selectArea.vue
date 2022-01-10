<template>
    <!-- u-popup弹出框 -->
    <u-popup
        :maskCloseAble="maskCloseAble"
        mode="bottom"
        :popup="false"
        v-model="value"
        length="auto"
        :safeAreaInsetBottom="safeAreaInsetBottom"
        @close="close">
        <!-- 标题栏区域 -->
        <view
            class="u-picker-header"
            @touchmove.stop.prevent="">
            <view
                class="u-btn-picker u-btn-picker--tips"
                :style="{ color: cancelColor }"
                :hover-stay-time="150"
                @click="handleCancel">
                {{ cancelText }}
            </view>
            <view class="u-picker__title">{{ title }}</view>
            <view
                class="u-btn-picker u-btn-picker--primary"
                :style="{ color: isMoving ? cancelColor : confirmColor }"
                :hover-stay-time="150"
                @touchmove.stop=""
                @click="handleConfirm">
                {{ confirmText }}
            </view>
        </view>
        <!-- 热门城市 -->
        <view
            class="popular-city"
            v-if="showPopularCity">
            <view class="title">热门城市</view>
            <view class="popular-city-container">
                <view
                    class="popular-city-item"
                    :class="popularCitySelected === index ? 'popular-city-selected' : ''"
                    v-for="(city, index) in popularCity"
                    :key="index"
                    @click="selectPopularCity(index)">
                    {{ city.name }}
                </view>
            </view>
            <view class="title">选择地区</view>
        </view>
        <!-- 地区选择器 -->
        <view class="u-datetime-picker">
            <view
                class="u-picker-body"
                :style="{height: `${showPopularCity ? '400rpx' : '500rpx'}`}">
                <picker-view
                    class="u-picker-view"
                    :value="valueArr"
                    @pickstart="pickStart"
                    @change="pickChange"
                    @pickend="pickEnd">
                    <picker-view-column v-if="!reset">
                        <view
                            class="u-column-item"
                            v-for="(item, index) in provinces"
                            :key="index">
                            <view class="u-line-1">{{ item.label }}</view>
                        </view>
                    </picker-view-column>
                    <picker-view-column v-if="!reset">
                        <view
                            class="u-column-item"
                            v-for="(item, index) in citys"
                            :key="index">
                            <view class="u-line-1">{{ item.label }}</view>
                        </view>
                    </picker-view-column>
                    <picker-view-column v-if="!reset">
                        <view
                            class="u-column-item"
                            v-for="(item, index) in areas"
                            :key="index">
                            <view class="u-line-1">{{ item.label }}</view>
                        </view>
                    </picker-view-column>
                </picker-view>
            </view>
        </view>
    </u-popup>
</template>

<script>
    import provinces from 'uview-ui/libs/util/province.js';
    import citys from 'uview-ui/libs/util/city.js';
    import areas from 'uview-ui/libs/util/area.js';

    export default {
        /**
         * @description 选择地区组件
         * @property {Array} defaultAreaCode 默认显示地区的编码，格式：["13", "1303", "130304"]
         * @property {Boolean} safeAreaInsetBottom 是否显示底部不可触摸空白区域，默认为false
         * @property {Boolean} maskCloseAble 是否允许通过点击遮罩关闭Picker，默认为false
         * @property {Boolean} value 通过v-model控制组件的弹出与收起，为true时打开Picker
         * @property {String} title 顶部标题内容，默认为空
         * @property {Boolean} showPopularCity 是否显示热门城市，默认为true
         * @example <selectArea v-model="showPicker" @confirm="handleConfirm"></selectArea>
         * @method init() 初始化Picker
         * @method queryAreaName(String) 根据行政编码查询地区名称
         * @event {Function} confirm 用户点击确认按钮，返回当前选择地区的结果集
         * @event {Function} cancel 用户点击取消按钮或点击遮罩层关闭Picker，返回当前选择地区的结果集
         */
        options: {styleIsolation: 'shared'}, //允许样式穿透
        name: "selectArea",
        props: {
            defaultAreaCode: {
                type: Array,
                default() {
                    return ["44", "4401", "440103"];
                }
            },
            safeAreaInsetBottom: {
                type: Boolean,
                default: false
            },
            maskCloseAble: {
                type: Boolean,
                default: false
            },
            value: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            showPopularCity: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                cancelText: '取消', //取消按钮的文字
                confirmText: '确认', //确认按钮的文字
                cancelColor: '#606266', //取消按钮的颜色
                confirmColor: '#f4756b', //确认按钮的颜色
                reset: false, //是否重置
                valueArr: [], //地区数组
                provinces: provinces,
                citys: citys[0],
                areas: areas[0][0],
                province: 0,
                city: 0,
                area: 0,
                isMoving: false, // Picker是否在滑动过程中
                popularCity: [
                    {
                        name: '北京', //展示的热门城市名称
                        province: '北京市', //热门城市省份
                        city: '市辖区', //热门城市名
                        area: '东城区' //热门城市区/县
                    },
                    {
                        name: '上海',
                        province: '上海市',
                        city: '市辖区',
                        area: '黄浦区'
                    },
                    {
                        name: '广州',
                        province: '广东省',
                        city: '广州市',
                        area: '荔湾区'
                    },
                    {
                        name: '深圳',
                        province: '广东省',
                        city: '深圳市',
                        area: '罗湖区'
                    },
                    {
                        name: '成都',
                        province: '四川省',
                        city: '成都市',
                        area: '锦江区'
                    },
                    {
                        name: '杭州',
                        province: '浙江省',
                        city: '杭州市',
                        area: '上城区'
                    },
                    {
                        name: '南京',
                        province: '江苏省',
                        city: '南京市',
                        area: '玄武区'
                    },
                    {
                        name: '重庆',
                        province: '重庆市',
                        city: '市辖区',
                        area: '万州区'
                    },
                ], //热门城市列表
                popularCitySelected: -1, //热门城市当前选中的序号，值为-1则未选任何热门城市
            };
        },
        methods: {
            // 初始化
            init() {
                this.valueArr = [];
                this.reset = false;
                this.valueArr.push(0);
                this.setProvinces();
                this.valueArr.push(0);
                this.setCitys();
                this.valueArr.push(0);
                this.setAreas();
                this.$forceUpdate();
            },
            // 设置省份
            setProvinces() {
                let tmp = '';
                let useCode = false;
                if (this.popularCitySelected !== -1) {
                    tmp = this.popularCity[this.popularCitySelected].province;
                }
                else if (this.defaultAreaCode.length) {
                    tmp = this.defaultAreaCode[0];
                    useCode = true;
                }
                else tmp = 0;
                // 历遍省份数组匹配
                provinces.map((v, k) => {
                    if (useCode ? v.value === tmp : v.label === tmp) {
                        tmp = k;
                    }
                });
                this.province = tmp;
                this.provinces = provinces;
                // 设置默认省份的值
                this.valueArr.splice(0, 1, this.province);
            },
            // 设置城市
            setCitys() {
                let tmp = '';
                let useCode = false;
                if (this.popularCitySelected !== -1) {
                    tmp = this.popularCity[this.popularCitySelected].city;
                }
                else if (this.defaultAreaCode.length) {
                    tmp = this.defaultAreaCode[1];
                    useCode = true;
                }
                else tmp = 0;
                citys[this.province].map((v, k) => {
                    if (useCode ? v.value === tmp : v.label === tmp) {
                        tmp = k;
                    }
                });
                this.city = tmp;
                this.citys = citys[this.province];
                this.valueArr.splice(1, 1, this.city);
            },
            // 设置区县
            setAreas() {
                let tmp = '';
                let useCode = false;
                if (this.popularCitySelected !== -1) {
                    tmp = this.popularCity[this.popularCitySelected].area;
                }
                else if (this.defaultAreaCode.length) {
                    tmp = this.defaultAreaCode[2];
                    useCode = true;
                }
                else tmp = 0;
                areas[this.province][this.city].map((v, k) => {
                    if (useCode ? v.value === tmp : v.label === tmp) {
                        tmp = k;
                    }
                });
                this.area = tmp;
                this.areas = areas[this.province][this.city];
                this.valueArr.splice(2, 1, this.area);
            },
            /**
             * 选择热门城市
             * @param {Number} index 选择的热门城市的序号
             */
            selectPopularCity(index) {
                this.popularCitySelected = index;
                this.reset = true;
                this.init();
                this.isMoving = false;
            },
            // Picker滑动开始
            pickStart() {
                this.isMoving = true;
            },
            // Picker滑动结束
            pickEnd() {
                this.isMoving = false;
                if (this.popularCitySelected !== -1) {
                    if (this.popularCity[this.popularCitySelected].province !== provinces[this.province].label
                        || this.popularCity[this.popularCitySelected].city !== citys[this.province][this.city].label) {
                        this.popularCitySelected = -1;
                    }
                }
            },
            // 用户更改Picker的列选项
            pickChange(e) {
                this.valueArr = e.detail.value;
                let i = 0;
                this.province = this.valueArr[i++];
                this.city = this.valueArr[i++];
                this.area = this.valueArr[i++];
            },
            // 用户点击确定按钮
            handleConfirm() {
                if (this.isMoving) return;
                let result = {};
                result.action = 'confirm';
                result.province = provinces[this.province];
                result.city = citys[this.province][this.city];
                result.area = areas[this.province][this.city][this.area];
                this.$emit('confirm', result); //绑定confirm事件，回传已选择地区的结果集
                this.close();
            },
            // 用户点击取消按钮或者点击遮罩层
            handleCancel() {
                if (this.isMoving) return;
                let result = {};
                result.action = 'cancel';
                result.province = provinces[this.province];
                result.city = citys[this.province][this.city];
                result.area = areas[this.province][this.city][this.area];
                this.$emit('cancel', result); //绑定cancel事件，回传已选择地区的结果集
                this.close();
            },
            // 关闭Picker
            close(e) {
                this.$emit('input', false);
            },
            /**
             * 根据行政编码查询地区名称
             * @param {String} adCode 行政编码，例："440104"
             * @return {Boolean | Array} 查询失败返回false，查询成功返回名称数组，格式：[省份, 城市, 区县]
             */
            queryAreaName(adCode) {
                let result = [];
                let provinceIndex, cityIndex;
                try {
                    let areaCodeArray = [adCode.slice(0, 2), adCode.slice(0, 4), adCode];
                    provinces.map((v, k) => {
                        if (v.value === areaCodeArray[0]) {
                            result[0] = v.label;
                            provinceIndex = k;
                        }
                    });
                    citys[provinceIndex].map((v, k) => {
                        if (v.value === areaCodeArray[1]) {
                            result[1] = v.label;
                            cityIndex = k;
                        }
                    });
                    areas[provinceIndex][cityIndex].map((v, k) => {
                        if (v.value === areaCodeArray[2]) {
                            result[2] = v.label;
                        }
                    });
                }
                catch (e) {
                    console.error(e)
                    return false;
                }
                return result;
            }
        },
        computed: {
            // 强制触发props变化监听器
            propsChange() {
                return `${this.mode}-${this.defaultAreaCode}`;
            },
            // 强制触发地区变化监听器
            regionChange() {
                return `${this.province}-${this.city}`;
            }
        },
        watch: {
            // 监听props变化
            propsChange() {
                this.reset = true;
                setTimeout(() => this.init(), 10);
            },
            // 监听地区变化
            regionChange(val) {
                this.citys = citys[this.province];
                this.areas = areas[this.province][this.city];
            },
            // 重新初始化
            value(n) {
                if (n) {
                    this.reset = true;
                    setTimeout(() => this.init(), 10);
                }
            }
        },
        mounted() {
        },
        onLoad() {
        },
        created() {
        }
    }
</script>

<style lang="scss" scoped>
    /deep/ .u-drawer-content, .u-picker-header {
        border-radius: rpx(30);
    }

    .u-picker-header {
        width: 100%;
        height: rpx(90);
        padding: 0 rpx(30);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        font-size: rpx(30);
        background: #fff;
        position: relative;

        .u-picker__title {
            color: $u-content-color;
        }

        .u-btn-picker {
            padding: rpx(16);
            box-sizing: border-box;
            text-align: center;
            text-decoration: none;
        }

        .u-btn-picker--primary {
            color: $u-type-primary;
        }

        .u-btn-picker--tips {
            color: $u-tips-color;
        }
    }

    .u-picker-header::after {
        content: '';
        position: absolute;
        border-bottom: rpx(1) solid #eaeef1;
        -webkit-transform: scaleY(0.5);
        transform: scaleY(0.5);
        bottom: 0;
        right: 0;
        left: 0;
    }

    .popular-city {
        width: 100%;
        height: fit-content;

        .title {
            width: 100%;
            height: fit-content;
            padding-left: rpx(30);
            font-size: rpx(26);
            line-height: rpx(70);
            color: #f4756b;
        }

        .title:last-child {
            margin-bottom: rpx(20);
        }

        .popular-city-container {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            text-align: center;
            margin-bottom: rpx(20);
            padding: 0 rpx(30);

            .popular-city-item {
                width: 22vw;
                height: rpx(70);
                margin: rpx(8) calc((100vw - 60rpx - 88vw) / 6);
                text-align: center;
                font-size: rpx(28);
                line-height: rpx(70);
                color: #666;
                background-color: #f7f7f7;
                border-radius: rpx(50);
            }

            .popular-city-item:first-child, .popular-city-item:nth-child(5) {
                margin-left: 0;
            }

            .popular-city-item:last-child, .popular-city-item:nth-child(4) {
                margin-right: 0;
            }

            .popular-city-selected {
                background-color: #f4756b;
                color: #fff;
            }
        }
    }

    .u-datetime-picker {
        position: relative;
        z-index: 999;

        .u-picker-body {
            width: 100%;
            overflow: hidden;
            background-color: #fff;

            .u-picker-view {
                height: 100%;
                box-sizing: border-box;

                .u-column-item {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    font-size: rpx(30);
                    color: $u-main-color;
                    padding: 0 rpx(8);
                }
            }
        }
    }
</style>