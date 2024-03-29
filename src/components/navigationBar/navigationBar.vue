<template>
  <view :style="{marginBottom: `${backgroundColor === '' ? 0 : topAreaHeight + navigationButtonHorizontalMargin}px`}">
    <!-- 导航栏背景 -->
    <view
      class="navigation-background"
      :style="{
        height: `${topAreaHeight + navigationButtonHorizontalMargin}px`,
        backgroundColor: `${backgroundColor === '' ? 'transparent' : backgroundColor}`,
        backdropFilter: `${backgroundBlur ? 'blur(10px)' : 'unset'}`
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
          marginLeft: `${navigationButtonHorizontalMargin}px`,
          minWidth: `${isShowButton ? navigationButtonWidth : 0}px`
        }">
        <!-- 导航栏左侧胶囊按钮插槽 -->
        <slot name="button" v-if="unreadMessageCount === 0 || hideBadge">
          <!-- 胶囊按钮模板 -->
          <view
            class="navigation-menu-button"
            :style="{width: `${navigationButtonWidth}px`}"
            v-if="isShowButton">
            <view
              class="navigation-menu-button-content"
              :style="{
              height: `${0.54 * navigationBarHeight}px`,
              margin: `${0.23 * navigationBarHeight}px 0`,
            }">
              <view class="navigation-back" @click="backButtonClickEvent">
                <i class="fas fa-angle-left"/>
              </view>
              <view class="navigation-menu" @click="homeButtonClickEvent">
                 <i class="fas fa-house"/>
              </view>
            </view>
          </view>
        </slot>
        <!-- 存在未读消息时的胶囊按钮 -->
        <view
          class="navigation-menu-button"
          :style="{width: `${navigationButtonWidth}px`}"
          v-if="isShowButton && !hideBadge && unreadMessageCount !== 0">
          <view
            class="navigation-menu-button-content"
            :style="{
              height: `${0.54 * navigationBarHeight}px`,
              margin: `${0.23 * navigationBarHeight}px 0`,
            }">
            <view class="navigation-back" @click="backButtonClickEvent">
              <i class="fas fa-angle-left"/>
            </view>
            <view class="navigation-menu" @click="navigationTo(3)">
              <i class="fas fa-message"/>
              <view
                class="badge-container"
                v-if="unreadMessageCount !== 0">
                <view class="badge">
                  {{ unreadMessageCount }}
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 导航栏标题 -->
      <view
        class="navigation-title"
        v-if="isShowTitle"
        :style="{
          width: `${windowWidth - 2 * navigationButtonWidth - 2 * navigationButtonHorizontalMargin - 20}px`,
          lineHeight: `${navigationBarHeight}px`,
          textAlign: `${isShowButton ? 'center' : 'left'}`,
          color: `${titleColor}`
        }">
        <slot name="title">
          <view class="title">{{ titleText }}</view>
        </slot>
      </view>
    </view>
  </view>

</template>

<script>
    /**
     * @description 自定义导航栏组件
     * @example <navigationBar ref="nav"></navigationBar>
     * @slot:button 胶囊按钮插槽
     * @slot:title 标题插槽
     * @method setNavigation(Object) 设置导航栏信息（关于支持传入设置对象的值请参考方法说明）
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
                hideBadge: false, //是否隐藏消息提醒时的气泡提醒
                isShowTitle: true, //是否展示标题
                titleText: '', //导航栏标题
                titleColor: '#333333', //标题字体颜色
                backgroundColor: '', //导航栏背景颜色，为空时背景颜色为透明，且导航栏不占高度
                backgroundBlur: false, //导航栏背景是否高斯模糊
                customBackFunc: null, //自定义返回按钮触发行为方法
            };
        },
        methods: {
            /**
             * 设置导航栏行为
             * @param {Object} options 导航栏设置，包含：isShowButton、hideBadge、titleText、titleColor、backgroundColor、backgroundBlur、customBackFunc
             * @example setNavigation({isShowButton: false, titleText: '标题', backgroundColor: '#fff'})
             */
            setNavigation(options) {
                let config = {
                    isShowButton: true, //是否显示左侧胶囊按钮（不显示时标题靠左显示）
                    hideBadge: false, //是否隐藏消息提醒时的气泡提醒
                    titleText: '', //标题内容，为空字符串时不显示标题
                    titleColor: 'dark', //标题字体颜色，可传入"light"/"dark"，或自定义色号
                    backgroundColor: '', //导航栏背景颜色，为空时背景颜色为透明，且导航栏不占高度
                    backgroundBlur: false, //导航栏背景是否高斯模糊
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
                this.hideBadge = config.hideBadge;
                this.titleText = config.titleText;
                this.backgroundBlur = config.backgroundBlur;
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
             * @param {Number} mode 跳转模式 1:返回上一页, 2:跳转首页, 3: 跳转消息页
             */
            navigationTo(mode) {
                switch (mode) {
                    case 1:
                        if (this.customBackFunc !== null) {
                            this.customBackFunc(); //执行自定义跳转行为
                        }
                        else {
                            uni.navigateBack({
                                fail: () => {
                                    uni.switchTab({
                                        url: `/pages/trending/trending`,
                                        fail: () => {
                                            uni.redirectTo({
                                                url: `/pages/trending/trending`,
                                                fail: err => {
                                                    console.error(err);
                                                }
                                            });
                                        }
                                    });
                                }
                            }); //返回上一页
                            this.resetNavigation();
                        }
                        break;
                    case 2:
                        uni.switchTab({
                            url: `/pages/trending/trending`,
                            fail: () => {
                                uni.redirectTo({
                                    url: `/pages/trending/trending`,
                                    fail: err => {
                                        console.error(err);
                                    }
                                });
                            }
                        }); //跳转首页
                        this.resetNavigation();
                        break;
                    case 3:
                        uni.switchTab({
                            url: `/pages/chat/chatList`,
                            fail: () => {
                                uni.redirectTo({
                                    url: `/pages/chat/chatList`,
                                    fail: err => {
                                        console.error(err);
                                    }
                                });
                            }
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
        computed: {
            // 未读消息的数量（存储在Vuex中的数据）
            unreadMessageCount: {
                get() {
                    const unreadMessageCount = this.$store.state.unreadMessageCount;
                    return unreadMessageCount > 99 ? '99' : unreadMessageCount;
                }
            },
        },
        beforeMount() {
            //获取设备信息
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            let {width, height, left, right, top, bottom} = uni.getMenuButtonBoundingClientRect(); //获取胶囊按钮尺寸信息
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
  @import 'navigationBar';
</style>