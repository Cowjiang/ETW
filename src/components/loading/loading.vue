<template>
  <view class="loading-fake-container">
    <view
      class="loading-container"
      :class="fullscreen ? 'full-screen' : ''"
      :style="{
        '--loading-color': loadingColor,
        '--mask-color': `${showMask ? maskColor : 'transparent'}`,
        width: `${positionConfig.width}px`,
        height: `${positionConfig.height}px`,
        top: `${positionConfig.top}px`,
        left: `${positionConfig.left}px`,
        opacity: `${isLoading ? '1' : '0'}`,
        pointerEvents: `${pointerEvents}`
      }">
      <view
        class="loading-box"
        :style="{animationPlayState: `${isLoading ? 'running' : 'pause'}`}">
      </view>
    </view>
  </view>
</template>

<script>
    /**
     * @description loading组件
     * @property {String} parentClass 父节点的样式名，当需要局部显示Loading时需设置该属性，亦可使用startLoading()方法传入参数手动设置
     * @property {Boolean} fullscreen 是否全屏显示Loading，默认为false，优先度排行：startLoading()自定义参数 > fullscreen > parentClass
     * @property {Boolean} showMask 是否显示Loading背景，默认为true
     * @property {String} maskColor Loading背景颜色，默认为白色，仅当showMask为true时生效
     * @property {String} loadingColor Loading主体颜色，默认为'#f4756b'
     * @property {Boolean} allowTouch 是否允许触摸穿透遮罩层，默认为false
     * @property {Boolean} isShowRepeatedError 是否抛出重复开启/关闭错误，默认为false
     * @method startLoading(null|Object) 开始Loading动画
     * @method stopLoading() 停止Loading动画
     * @example <loading parentClass="parent" maskColor="#111111" showMask loadingColor="#cccccc" allowTouch fullscreen isShowRepeatedError></loading>
     */
    export default {
        name: "loading",
        props: {
            parentClass: {
                type: String,
                default: '',
            },
            fullscreen: {
                type: Boolean,
                default: false,
            },
            showMask: {
                type: Boolean,
                default: true,
            },
            maskColor: {
                type: String,
                default: '#ffffff'
            },
            loadingColor: {
                type: String,
                default: '#f4756b'
            },
            allowTouch: {
                type: Boolean,
                default: false,
            },
            isShowRepeatedError: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                positionConfig: {
                    width: 0,
                    height: 0,
                    top: 0,
                    left: 0
                }, //loading容器位置尺寸配置信息
                isLoading: false, //是否正在loading
                errorState: false, //是否发生错误
            };
        },
        methods: {
            /**
             * 开始Loading动画
             * @param {null|Object} positionOptions 手动配置的位置尺寸信息，参数可选，为空对象时必须设置组件属性fullscreen或parentClass
             */
            startLoading(positionOptions = null) {
                return new Promise((resolve, reject) => {
                    if (positionOptions !== null) {
                        this.positionConfig.width = positionOptions.width || 0;
                        this.positionConfig.height = positionOptions.height || 0;
                        this.positionConfig.top = positionOptions.top || 0;
                        this.positionConfig.left = positionOptions.left || 0;
                        this.isShowRepeatedError = positionOptions.isShowRepeatedError || false;
                        if (!this.isLoading) {
                            this.isLoading = true;
                            this.$forceUpdate();
                            resolve();
                            return true;
                        }
                        else {
                            //loading已在运行，重复开始loading
                            if (this.isShowRepeatedError) {
                                reject('Loading Error: Cannot start loading because the load animation is already running.');
                                return true;
                            }
                            else {
                                resolve();
                                return false;
                            }
                        }
                    }
                    else {
                        if (this.fullscreen) {
                            if (this.parentClass !== '') {
                                //同时设置了fullscreen和parentClass属性
                                console.warn(`Loading Warn: Do not set the fullscreen property and the parentClass property at the same time.`);
                            }
                            else {
                                if (!this.isLoading) {
                                    this.isLoading = true;
                                    this.$forceUpdate();
                                    resolve();
                                    return true;
                                }
                                else {
                                    //loading已在运行，重复开始loading
                                    if (this.isShowRepeatedError) {
                                        reject('Loading Error: Cannot start loading because the load animation is already running.');
                                        return true;
                                    }
                                    else {
                                        resolve();
                                        return false;
                                    }
                                }
                            }
                        }
                        else {
                            if (this.parentClass !== '') {
                                uni.getSystemInfo({
                                    success: res => {
                                        let obj = uni.createSelectorQuery().select(`.${this.parentClass}`);
                                        obj.boundingClientRect(parentData => {
                                            if (parentData !== null && parentData !== undefined) {
                                                try {
                                                    if (Object.getOwnPropertyNames(parentData).length) {
                                                        this.positionConfig = Object.assign(this.positionConfig, parentData);
                                                    }
                                                    this.positionConfig.top = 0;
                                                    if (parentData.height > this.windowHeight - parentData.top) {
                                                        this.positionConfig.height = this.windowHeight - parentData.top / 2 - this.navigationHeight;
                                                    }
                                                    if (parentData.width > this.windowWidth - parentData.left) {
                                                        this.positionConfig.width = this.windowWidth - parentData.left / 2;
                                                    }
                                                    if (this.positionConfig.width < 80) {
                                                        this.positionConfig.width = 45;
                                                    }
                                                    if (this.positionConfig.height < 80) {
                                                        this.positionConfig.height = 45;
                                                    }
                                                    if (!this.isLoading) {
                                                        this.isLoading = true;
                                                        this.$forceUpdate();
                                                        resolve();
                                                        return true;
                                                    }
                                                    else {
                                                        //loading已在运行，重复开始loading
                                                        if (this.isShowRepeatedError) {
                                                            reject('Loading Error: Cannot start loading because the load animation is already running.');
                                                            return true;
                                                        }
                                                        else {
                                                            resolve();
                                                            return false;
                                                        }
                                                    }
                                                } catch (e) {
                                                    console.error('Loading Error:', e);
                                                }
                                            }
                                            else {
                                                console.error(`Loading Error: Unable to query a node that matches the selector '.${this.parentClass}'.`); //无法查询到节点
                                            }
                                        }).exec();
                                    },
                                    fail: err => {
                                        reject(err);
                                        return false;
                                    }
                                });
                            }
                            else {
                                reject(`Loading Error: Cannot start loading because the 'parentClass' property is not set.`); //未设置'parentClass'属性
                                return false;
                            }
                        }
                    }
                });
            },
            // 停止Loading动画
            stopLoading() {
                return new Promise((resolve, reject) => {
                    if (this.isLoading) {
                        this.isLoading = false;
                        this.$forceUpdate();
                        resolve();
                        return true;
                    }
                    else {
                        //loading未在运行，无法停止loading
                        if (this.isShowRepeatedError) {
                            reject('Loading Error: Cannot stop loading because the loading animation is not running.');
                            return true;
                        }
                        else {
                            resolve();
                            return false;
                        }
                    }
                })
            }
        },
        computed: {
            /**
             * 计算是否允许触摸穿透
             * @return {String} pointer-events的值
             */
            pointerEvents() {
                const canTouch = this.allowTouch ? true : !this.isLoading;
                return canTouch ? 'none' : 'all';
            }
        },
        watch: {
            //发生错误的监听器
            errorState(nval, oval) {
                if (nval && !oval) {
                    this.stopLoading();
                }
            }
        },
        created() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
        }
    };
</script>

<style lang="scss" scoped>
  @import 'loading';
</style>