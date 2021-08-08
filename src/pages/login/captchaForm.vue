<template>
    <!-- 注册表单 -->
    <view
        class="captcha-form"
        :class="captchaFormAnimation"
        :style="{ display: showCaptchaForm }"
    >
        <text class="title" v-if="captchaUsernameType === 1">电子邮箱验证</text>
        <text class="title" v-else>手机号验证</text>
        <!-- S 输入框区域 -->
        <view class="input-area">
            <input
                class="captcha-raw-input"
                type="number"
                maxlength="6"
                @input="captchaInputWatcher"
                adjust-position="false"
                v-model="captchaRawInputValue"
                :focus="captchaRawInputFocusState"
                @blur="captchaInputBlur"
            />
            <view class="captcha-info">
                <text>验证码已发送至 {{ captchaUsername }}</text>
            </view>
            <view class="captcha-show-area">
                <view
                    v-for="item in 6"
                    :key="item"
                    class="show-content"
                    :style="{ borderBottomColor: captchaInputShowColor[item] }"
                    @click="captchaInputFocus"
                >
                    {{ captchaInputShowValue[item] || "" }}
                </view>
            </view>
        </view>
        <!-- E 输入框区域 -->

        <view class="resend-captcha">
            <text v-if="captchaResendDelay === 0" @click="resendCaptcha">
                重新发送
            </text>
            <text v-else>{{ captchaResendDelay }} 秒后可重新发送</text>
        </view>

        <!-- S 下方按钮区域 -->
        <view class="button-area">
            <view class="register-button" @click="registerCheck">
                <text>注 册</text>
            </view>
        </view>
        <!-- E 下方按钮区域 -->
        <toast ref="toast"/>
    </view>
</template>

<script>
    import {getEmailCode, registerTest} from "../../common/js/api/models.js";
    import {toast} from '../../components/toast/toast.vue';
    import {imageVerify} from '../../components/imageVerify/imageVerify.vue';

    export default {
        components: {
            toast, imageVerify
        },
        data() {
            return {
                showCaptchaForm: "none", //控制注册窗体显示隐藏
                captchaFormAnimation: "", //注册窗体动效
                captchaUsernameType: 1, //注册的用户名类型，[0: 手机号, 1: 电子邮箱]
                captchaUsername: "", //注册的用户名
                captchaResendInterval: 60, //重新发送验证码的间隔（秒）
                captchaResendTimer: null, //重新发送验证码的计时器
                captchaResendDelay: 0, //重新发送验证码剩余时间
                captchaRawInputValue: "", //验证码原始输入框的值
                captchaInputShowValue: [], //经过处理后的验证码展示数组
                captchaInputShowColor: ["#EDEDED", "#EDEDED", "#EDEDED", "#EDEDED", "#EDEDED", "#EDEDED"], //验证码展示的边框颜色数组
                captchaRawInputFocusState: false, //验证码原始输入框的焦点状态
            };
        },
        onLoad() {
        },
        methods: {
            setUserInfo(captchaUsernameType, captchaUsername) {
                captchaUsernameType === 'email' ? this.captchaUsernameType = 1 : this.captchaUsernameType = 0;
                this.captchaUsername = captchaUsername;
            },
            /**
             * 发送验证码
             */
            sendCaptcha() {
                if (this.captchaUsername === "") {
                    this.$parent.toRegisterScreen();
                }
                else {
                    setTimeout(() => {
                        switch (this.captchaUsernameType) {
                            case 0:
                                break;
                            case 1:
                                getEmailCode({queryData: {email: this.captchaUsername}})
                                    .then((res) => {
                                        console.log(res);
                                        this.$refs.toast.show({
                                            text: "已发送验证码",
                                            type: "success",
                                        });
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                break;
                            default:
                                break;
                        }
                        this.captchaResendDelay = this.captchaResendInterval;
                        this.computeCaptchaResendDelay();
                    }, 100);
                }
            },
            /**
             * 计算重新发送验证码的剩余时间
             */
            computeCaptchaResendDelay() {
                if (this.captchaResendDelay !== 0) {
                    this.captchaResendTimer = setTimeout(() => {
                        this.captchaResendDelay -= 1;
                        this.computeCaptchaResendDelay(); //计算重新发送验证码的剩余时间
                    }, 1000);
                }
                else {
                    if (this.captchaResendTimer !== null) {
                        clearTimeout(this.captchaResendTimer);
                        this.captchaResendTimer = null;
                    }
                }
            },
            /**
             * 重新发送验证码
             */
            resendCaptcha() {
                this.utils.throttle(() => {
                    if (this.captchaResendDelay === 0) {
                        wx.showToast({
                            text: "已发送验证码",
                            icon: "success",
                            duration: 2000,
                        });
                        [this.captchaInputShowValue, this.captchaRawInputValue] = [[], ""]; //重置验证码输入的值
                        this.captchaResendDelay = this.captchaResendInterval; //重置重新发送验证码的剩余时间
                        this.computeCaptchaResendDelay(); //开始计算重新发送验证码的剩余时间
                    }
                });
            },
            /**
             * 验证码输入监听事件
             */
            captchaInputWatcher(e) {
                this.captchaInputShowValue = e.detail.value.toString().split("");
                this.captchaInputShowColor.fill("#EDEDED");
                this.captchaInputShowColor[this.captchaInputShowValue.length] = "#f4756b";
            },
            /**
             * 验证码输入框聚焦事件
             */
            captchaInputFocus() {
                //使验证码原始输入框获得焦点
                this.captchaRawInputFocusState = false;
                this.$nextTick(() => {
                    this.captchaRawInputFocusState = true;
                });
                this.captchaInputShowColor.fill("#EDEDED");
                this.captchaInputShowColor[this.captchaInputShowValue.length] = "#f4756b";
                this.$forceUpdate();
            },
            /**
             * 验证码输入框失焦事件
             */
            captchaInputBlur() {
                this.captchaInputShowColor.fill("#EDEDED");
                this.$forceUpdate();
            },
            /**
             * 注册前检查
             */
            registerCheck() {
                this.utils.throttle(() => {
                    if (this.captchaRawInputValue.length === 6) {
                        registerTest({
                            queryData: {
                                key: this.$parent.username,
                                password: this.$parent.password,
                                code: this.captchaRawInputValue,
                            },
                        })
                            .then((res) => {
                                console.log(res);
                                this.$refs.toast.show({
                                    text: "注册成功",
                                    type: "success",
                                });
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }
                    else {
                        this.$refs.toast.show({
                            text: "验证码格式错误",
                            type: "error",
                        });
                    }
                });
            },
            setAnimation(animation) {
                if (animation !== null) {
                    this.captchaFormAnimation = `animate__animated animate__${animation}`;
                }
            },
            clear() {
                if (this.captchaResendTimer !== null) {
                    clearTimeout(this.captchaResendTimer);
                    this.captchaRawInputValue = '';
                    this.captchaInputShowValue = [];
                    this.captchaInputShowColor = ["#EDEDED", "#EDEDED", "#EDEDED", "#EDEDED", "#EDEDED", "#EDEDED"];
                }
            }
        },
        mounted() {
        },
    };
</script>

<style lang="scss" scoped>
    .captcha-form {
        width: 100vw;
        position: absolute;
        padding: rpx(54);
        margin-top: 11vh;
        animation-duration: 600ms;

        .title {
            font-size: rpx(64);
            font-weight: bold;
            color: $uni-text-color;
        }

        .input-area {
            margin-top: rpx(74);
            width: 100%;

            .captcha-raw-input {
                position: absolute;
                top: 0;
                left: 0;
                transform: translate(rpx(-999), rpx(-900));
                opacity: 0;
            }

            .captcha-info {
                font-size: rpx(30);
                color: $uni-text-color-placeholder;
                text-align: left;
            }

            .captcha-show-area {
                width: 100%;
                display: flex;
                flex-wrap: nowrap;

                .show-content {
                    margin: rpx(100) rpx(15) rpx(20);
                    width: 100%;
                    height: rpx(50);
                    border-bottom: rpx(4) solid #ededed;
                    text-align: center;
                    font-weight: bold;
                    font-size: rpx(48);
                    line-height: rpx(20);
                    color: $uni-text-color;
                    transition-property: border-bottom-color;
                    transition-duration: 0.2s;
                }

                .show-content:nth-of-type(1) {
                    margin-left: 0;
                    margin-right: rpx(15);
                }

                .show-content:nth-of-type(6) {
                    margin-left: rpx(15);
                    margin-right: 0;
                }
            }
        }

        .resend-captcha {
            font-size: rpx(30);
            color: $uni-text-color-placeholder;
            text-align: right;
            padding: rpx(30) 0;
            margin-bottom: rpx(60);
        }

        .button-area {
            width: 100%;
            padding: rpx(30) 0;

            .register-button {
                width: 100%;
                height: rpx(94);
                text-align: center;
                font-size: rpx(35);
                font-weight: bold;
                line-height: rpx(94);
                color: $uni-text-color-inverse;
                background-color: $uni-color-primary;
                border-radius: rpx(14);
            }
        }
    }
</style>
