<template>
    <view
        :style="{
            marginBottom: `${backgroundColor === '' ? 0 : topAreaHeight + navigationButtonHorizontalMargin}px`
        }"
    >
        <view
            class="navigation-background"
            :style="{
                height: `${topAreaHeight + navigationButtonHorizontalMargin}px`,
                backgroundColor: `${backgroundColor === '' ? 'transparent' : backgroundColor}`
            }"
        >

        </view>
        <view
            class="navigation-bar"
            :style="{
                top: `${navigationBarTop}px`,
                height: `${navigationBarHeight}px`
            }"
        >
            <view
                class="navigation-menu-button"
                v-if="isShowButton"
                :style="{
                    width: `${navigationButtonWidth}px`,
                    marginLeft: `${navigationButtonHorizontalMargin}px`,
                }"
            >
                <view
                    class="navigation-menu-button-content"
                    :style="{
                        height: `${0.54 * navigationBarHeight}px`,
                        margin: `${0.23 * navigationBarHeight}px 0`,
                    }"
                >
                    <view class="navigation-back" @click="backButtonClickEvent">
                        <image
                            src="../../static/images/navigation/navigation@back.png"
                            class="navigation-back-image"
                            mode="heightFix"
                        ></image>
                    </view>
                    <view class="navigation-home" @click="homeButtonClickEvent">
                        <image
                            src="../../static/images/navigation/navigation@home.png"
                            class="navigation-home-image"
                            mode="heightFix"
                        ></image>
                    </view>
                </view>
            </view>

            <view
                class="navigation-title"
                v-if="isShowTitle"
                :style="{
                    lineHeight: `${navigationBarHeight}px`,
                    width: `${windowWidth - 2 * navigationButtonWidth - 2 * navigationButtonHorizontalMargin}px`,
                }"
            >
                <text class="title">{{ titleText }}</text>
            </view>
        </view>
    </view>

</template>

<script>
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
                titleText: "", //导航栏标题
                backgroundColor: '1',
                customBackFunc: null, //自定义返回按钮触发行为方法
            };
        },
        methods: {
            /**
             * 设置导航栏行为
             * @param isShowButton 是否显示胶囊按钮(true/false)
             * @param isShowTitle 是否展示标题(true/false)
             * @param titleText 导航栏标题
             * @param customBackFunc 自定义返回按钮点击事件
             */
            setNavigation(isShowButton, isShowTitle, titleText, customBackFunc) {
                if (typeof customBackFunc === "function") {
                    this.customBackFunc = customBackFunc;
                }
                else {
                    this.customBackFunc = null;
                }
                [this.isShowButton, this.isShowTitle, this.titleText] = [
                    isShowButton,
                    isShowTitle,
                    titleText,
                ];
            },
            /**
             * 导航栏返回按钮点击事件
             */
            backButtonClickEvent() {
                this.navigationTo(1);
            },
            /**
             * 导航栏主页按钮点击事件
             */
            homeButtonClickEvent() {
                this.navigationTo(2);
            },
            /**
             * 页面跳转方法
             * @param mode 跳转模式，[1:返回上一页, 2:跳转首页]
             */
            navigationTo(mode) {
                switch (mode) {
                    case 1:
                        if (this.customBackFunc !== null) {
                            this.customBackFunc(); //执行自定义跳转行为
                        }
                        else {
                            wx.navigateBack(); //返回上一页
                        }
                        break;
                    case 2:
                        wx.navigateTo({
                            url: "../home/home",
                        }); //跳转首页
                        break;
                }
                this.resetNavigation();
            },
            /**
             * 返回导航栏总高度
             */
            getNavigationHeight() {
                return this.topAreaHeight;
            },
            /**
             * 设置导航栏背景颜色
             * @param backgroundColor 导航栏背景颜色，为空字符串或null时设置为透明
             */
            setNavigationBackgroundColor(backgroundColor) {
                if (backgroundColor === null || backgroundColor === '' || backgroundColor === undefined) {
                    this.backgroundColor = '';
                }
                else {
                    this.backgroundColor = backgroundColor;
                }
                console.log(backgroundColor)
            },
            /**
             * 重置导航栏默认行为
             */
            resetNavigation() {
                this.isShowButton = true;
                this.isShowTitle = true;
                this.titleText = "";
                this.customBackFunc = null;
                this.backgroundColor = '';
            },
        },
        beforeMount() {
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                },
            }); // 获取设备信息
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
        //background-color: orange;
        width: 100%;
        height: rpx(300);
    }

    .navigation-bar {
        width: 100vw;
        position: fixed;
        display: flex;
        z-index: 99999;

        .navigation-menu-button {
            height: 100%;
            border-radius: rpx(50);
            border: rpx(1) solid rgba(125, 125, 125, 0.1);
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
                    border-left: rpx(1) solid rgba(100, 100, 100, 0.1);

                    .navigation-home-image {
                        height: 100%;
                    }
                }
            }
        }

        .navigation-title {
            height: 100%;
            text-align: center;
            font-size: rpx(36);
            color: $uni-text-color;
        }
    }
</style>