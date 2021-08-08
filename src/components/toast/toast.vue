<template>
    <view :class="[isTopDirection ? 'top-direction' : '']">
        <view
            class="toast"
            v-for="(item, index) in toastQueue"
            :key="index"
            :for-item="item"
            :class="[
                item.isShow ? item.toastAnimation : '',
                `type-${item.type}`,
                `${selDirection(item.direction)}`,
            ]"
            :id="`toast${index}`"
            :style="{
                top: `${navigationHeight * 0.5}rpx`,
                zIndex: `${item.isShow ? '999999' : '-1'}`,
                display: item.isShow ? 'flex' : 'none',
                animationDuration: `${item.animationDuration}ms`,
                marginTop: `${item.marginTop}rpx`,
                transitionDuration: `${item.marginTransitionDuration}ms`,
            }"
        >
            <text
                class="fa fa-lg fa-check-circle"
                v-if="item.type === 'success'"
            ></text>
            <text
                class="fa fa-lg fa-warning"
                v-else-if="item.type === 'warning'"
            ></text>
            <text
                class="fa fa-lg fa-exclamation-circle"
                v-else-if="item.type === 'error'"
            ></text>
            <text class="title-text">{{ item.text }}</text>
        </view>
    </view>
</template>

<script>
    export default {
        name: "toast",
        data() {
            return {
                navigationHeight: 0,
                showDuration: 2500, //消息显示的时间，毫秒
                toastQueue: [], //消息队列
                pushReady: true, //允许新消息推送进入消息队列
                isTopDirection: "", //显示方向是否为顶部居中
            };
        },
        methods: {
            /**
             * 显示新消息
             * @param options 消息的选项设置
             */
            show(options) {
                let config = {
                    type: "", //消息类型，['success', 'warning', 'error']
                    text: "", //消息内容
                    showDuration: 2500, //显示持续时间，毫秒
                    isShow: false, //是否显示消息
                    direction: "right", //出现的方向，['left', 'right', 'top']
                    toastAnimation: "", //消息动效
                    animationDuration: 800, //动画持续时间，毫秒
                    isShowIcon: true, //是否显示图标
                    timer: null, //计时器，用于延迟执行消失过程
                    marginTop: 0, //顶部外边距
                    marginTransitionDuration: 0, //消息外边距位移动效持续时间
                };
                if (Object.getOwnPropertyNames(options).length) {
                    config = Object.assign(config, options);
                    this.showDuration = config.showDuration;
                }
                config.isShow = true;
                switch (config.direction) {
                    case "left":
                        config.toastAnimation = "animate__animated animate__slideInLeft";
                        break;
                    case "top":
                        config.toastAnimation = "animate__animated animate__slideInDown";
                        break;
                    case "right":
                        config.toastAnimation = "animate__animated animate__slideInRight";
                        break;
                }
                let waitTimer = setInterval(() => {
                    if (this.pushReady === true) {
                        clearInterval(waitTimer);
                        config.marginTop =
                            this.toastQueue.length === 0 ? 0 : this.toastQueue.length * 120;
                        this.toastQueue.push(config);
                        let toastTemp = this.toastQueue[this.toastQueue.length - 1];
                        toastTemp.timer = setTimeout(() => {
                            toastTemp.animationDuration = 500;
                            toastTemp.toastAnimation = "animate__animated animate__fadeOut";
                            setTimeout(() => {
                                this.pushReady = false;
                                toastTemp.isShow = false;
                                this.changeMarginTop(this.toastQueue.indexOf(toastTemp));
                                setTimeout(() => {
                                    this.toastQueue.splice(this.toastQueue.indexOf(toastTemp), 1);
                                    this.pushReady = true;
                                }, 500);
                            }, toastTemp.animationDuration);
                            clearTimeout(toastTemp.timer);
                            toastTemp.timer = null;
                        }, this.showDuration);
                    }
                }, 100);
            },

            /**
             * 改变消息队列的顶部外边距
             * @param index 要删除的消息的索引值
             */
            changeMarginTop(index) {
                for (const item of this.toastQueue) {
                    item.toastAnimation = "";
                    if (this.toastQueue.indexOf(item) > index) {
                        item.marginTransitionDuration = 500;
                        item.marginTop = (this.toastQueue.indexOf(item) - 1) * 120;
                        setTimeout(() => {
                            item.marginTransitionDuration = 0;
                        }, 500);
                    }
                    else if (this.toastQueue.indexOf(item) < index) {
                        item.marginTop = this.toastQueue.indexOf(item) * 120;
                    }
                }
            },

            /**
             * 选择消息显示的反向，用于设置样式
             * @param direction 消息显示方向
             */
            selDirection(direction) {
                switch (direction) {
                    case "left":
                        return "left-direction";
                    case "top":
                        this.isTopDirection = true;
                        break;
                    case "right":
                        return "right-direction";
                }
            },
        },
        mounted() {
            this.navigationHeight = this.utils.getNavigationHeight();
        },
    };
</script>

<style lang="scss" scoped>
    .toast {
        position: absolute;
        z-index: -1;
        min-width: 30%;
        min-height: rpx(100);
        max-height: rpx(100);
        display: flex;
        gap: rpx(10);
        color: $uni-color-black;
        border-radius: rpx(16);
        background: $uni-color-white;
        align-items: center;
        justify-content: center;
        font-size: rpx(28);
        pointer-events: none;
        padding: rpx(18) rpx(40);
        transition-property: margin-top;
    }
    .title-text {
        @include ellipsis(2);
        text-indent: rpx(10);
    }

    .left-direction {
        left: 5%;
    }

    .top-direction {
        display: flex;
        justify-content: center;
    }

    .right-direction {
        right: 5%;
    }

    .type-primary {
        color: $uni-color-primary;
        background-color: $uni-color-primary-light;
        border: 1px solid rgb(215, 234, 254);
    }

    .type-success {
        color: #ffffff;
        background-color: #4caf50;
        border: 0 solid #bef5c8;
        //border-left: 3px solid;
    }

    .type-error {
        color: #ffffff;
        background-color: #ff5252;
        border: 0 solid #fde2e2;
        //border-left: 3px solid;
    }

    .type-warning {
        color: #ffffff;
        background-color: #fb8c00;
        border: 0 solid #faecd8;
        //border-left: 3px solid;
    }

    @keyframes slideInRight {
        from {
            -webkit-transform: translate3d(100vw, 0, 0);
            transform: translate3d(100vw, 0, 0);
            visibility: visible;
        }

        to {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
        }
    }
    .animate__slideInRight {
        -webkit-animation-name: slideInRight;
        animation-name: slideInRight;
    }

    @keyframes slideInLeft {
        from {
            -webkit-transform: translate3d(-100vw, 0, 0);
            transform: translate3d(-100vw, 0, 0);
            visibility: visible;
        }

        to {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
        }
    }
    .animate__slideInLeft {
        -webkit-animation-name: slideInLeft;
        animation-name: slideInLeft;
    }
</style>
