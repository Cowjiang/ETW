<template>
  <view :style="{marginBottom: `${backgroundColor === '' ? 0 : topAreaHeight + navigationButtonHorizontalMargin}px`}">
    <!-- 导航栏背景 -->
    <view
      class="navigation-background"
      :style="{
        height: `${topAreaHeight + navigationButtonHorizontalMargin}px`,
        backgroundColor: `${backgroundColor === '' ? 'transparent' : backgroundColor}`
      }">
    </view>
    <!-- 导航栏主体 -->
    <view
      class="navigation-bar"
      :style="{
        top: `${navigationBarTop}px`,
        height: `${navigationBarHeight}px`
      }">
      <view
        :style="{
          width: `${navigationButtonWidth}px`,
          marginLeft: `${navigationButtonHorizontalMargin}px`,
        }">
        <!-- 导航栏左侧胶囊按钮插槽 -->
        <slot>
          <!-- 胶囊按钮模板 -->
          <view class="navigation-menu-button" v-if="isShowButton">
            <view
              class="navigation-menu-button-content"
              :style="{
                height: `${0.54 * navigationBarHeight}px`,
                margin: `${0.23 * navigationBarHeight}px 0`,
              }">
              <view class="navigation-back" @click="backButtonClickEvent">
                <image
                  src="../../static/images/navigation/navigation@back.png"
                  class="navigation-back-image"
                  mode="heightFix">
                </image>
              </view>
              <view class="navigation-home" @click="homeButtonClickEvent">
                <image
                  src="../../static/images/navigation/navigation@home.png"
                  class="navigation-home-image"
                  mode="heightFix">
                </image>
                <!--<i class="fa fa-cog" aria-hidden="true" :style="{fontSize: `${0.6 * navigationBarHeight}px`}"></i>-->
              </view>
            </view>
          </view>
        </slot>
      </view>
      <!-- 导航栏标题 -->
      <view
        class="navigation-title"
        v-if="isShowTitle"
        :style="{
          lineHeight: `${navigationBarHeight}px`,
          width: `${windowWidth - 2 * navigationButtonWidth - 2 * navigationButtonHorizontalMargin - 20}px`,
          color: `${titleColor}`
        }">
        <view class="title">{{ titleText }}</view>
      </view>
    </view>
  </view>

</template>

<script>
    /**
     * @description 自定义导航栏组件
     * @example <navigationBar ref="nav"></navigationBar>
     * @method setNavigation(Object) 设置导航栏信息
     */
    export default {
        data() {
            return {
                windowWidth: 0, //设备窗口宽度
                windowHeight: 0, //设备窗口高度
                navigationBarTop: 0, //导航栏距离顶部的距离
                navigationBarHeight: 0, //导航栏的高度
                navigationButtonWidth: 0, //导航栏胶囊按钮宽度
                topAreaHeight: 0, //顶部区域高度（导航栏高度 + 状态栏高度）
                navigationButtonHorizontalMargin: 0, //导航栏胶囊按钮水平方向的外边距
                isShowButton: true, //是否显示胶囊按钮
                isShowTitle: true, //是否展示标题
                titleText: '', //导航栏标题
                titleColor: '#333333', //标题字体颜色
                backgroundColor: '', //导航栏背景颜色，为空时背景颜色为透明，且导航栏不占高度
                customBackFunc: null, //自定义返回按钮触发行为方法
            };
        },
        methods: {
            /**
             * 设置导航栏行为
             * @param {Object} options 导航栏设置
             * @example setNavigation({isShowButton: true, titleText: '标题', titleColor: '#999999', backgroundColor: '#ffffff', customBackFunc: function() {...}})
             */
            setNavigation(options) {
                let config = {
                    isShowButton: true, //是否显示左侧胶囊按钮
                    titleText: '', //标题内容，为空字符串时不显示标题
                    titleColor: 'dark', //标题字体颜色，可传入"light"/"dark"，或自定义色号
                    backgroundColor: '', //导航栏背景颜色，为空时背景颜色为透明，且导航栏不占高度
                    customBackFunc: null, //自定义返回按钮点击事件
                };
                if (Object.getOwnPropertyNames(options).length) {
                    config = Object.assign(config, options);
                }
                if (typeof config.customBackFunc === "function") {
                    this.customBackFunc = config.customBackFunc;
                }
                this.isShowTitle = `${(config.titleText !== '')}`;
                switch (config.titleColor) {
                    case 'dark':
                        this.titleColor = '#333333';
                        break;
                    case 'light':
                        this.titleColor = '#ffffff'
                        break;
                    default:
                        this.titleColor = config.titleColor;
                }
                this.backgroundColor = `${config.backgroundColor === '' ? '' : config.backgroundColor}`;
                this.isShowButton = config.isShowButton;
                this.titleText = config.titleText;
            },
            // 导航栏返回按钮点击事件
            backButtonClickEvent() {
                this.navigationTo(1);
            },
            // 导航栏主页按钮点击事件
            homeButtonClickEvent() {
                this.navigationTo(2);
            },
            /**
             * 页面跳转方法
             * @param {number} mode 跳转模式 1:返回上一页, 2:跳转首页
             */
            navigationTo(mode) {
                switch (mode) {
                    case 1:
                        if (this.customBackFunc !== null) {
                            this.customBackFunc(); //执行自定义跳转行为
                        }
                        else {
                            wx.navigateBack({
                                fail: res => {
                                    uni.redirectTo({
                                        url: `/pages/index/index`
                                    });
                                }
                            }); //返回上一页
                            this.resetNavigation();
                        }
                        break;
                    case 2:
                        wx.redirectTo({
                            url: "/pages/index/index",
                        }); //跳转首页
                        this.resetNavigation();
                        break;
                }
            },
            // 返回导航栏总高度
            getNavigationHeight() {
                return this.topAreaHeight;
            },
            // 重置导航栏默认行为
            resetNavigation() {
                setTimeout(() => {
                    this.isShowButton = true;
                    this.isShowTitle = true;
                    this.titleText = '';
                    this.titleColor = '#333333'
                    this.backgroundColor = '';
                    this.customBackFunc = null;
                }, 1000);
            },
        },
        beforeMount() {
            //获取设备信息
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                },
            });
            let {width, height, left, right, top, bottom} = wx.getMenuButtonBoundingClientRect(); //获取胶囊按钮尺寸信息
            [
                this.navigationBarTop,
                this.navigationBarHeight,
                this.navigationButtonWidth,
                this.navigationButtonHorizontalMargin,
                this.topAreaHeight
            ] = [top, height, width, this.windowWidth - right, height + top];
        },
    };
</script>

<style lang="scss" scoped>
  .navigation-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 300rpx;
    z-index: 99999999;
  }

  .navigation-bar {
    width: 100vw;
    position: fixed;
    display: flex;
    left: 0;
    z-index: 99999999;

    .navigation-menu-button {
      height: 100%;
      border-radius: 50rpx;
      border: 1rpx solid rgba(125, 125, 125, 0.1);
      background-color: rgba(255, 255, 255, 0.6);

      .navigation-menu-button-content {
        display: flex;

        .navigation-back {
          height: 100%;
          width: 100%;
          text-align: center;

          .navigation-back-image {
            height: 100%;
          }
        }

        .navigation-home {
          height: 100%;
          width: 100%;
          text-align: center;
          border-left: 1rpx solid rgba(100, 100, 100, 0.1);

          .navigation-home-image {
            height: 100%;
          }
        }
      }
    }

    .navigation-title {
      height: 100%;
      margin-left: 10px;
      text-align: center;
      font-size: 36rpx;
      color: #333;
      white-space: nowrap;
      overflow: hidden;

      .title {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
</style>