<template>
    <!-- 注册表单 -->
    <view
        class="register-form"
        :class="registerFormAnimation"
        :style="{ display: showRegisterForm }"
    >
        <text class="title">注 册</text>
        <!-- S 输入框区域 -->
        <view class="input-area">
            <view
                class="username-container"
                :class="usernameContainerStyle"
                v-if="isEmailInput"
            >
                <view class="input-placeholder" :class="usernamePlaceholderStyle">
                    电子邮箱
                </view>
                <input
                    type="text"
                    class="username-input"
                    v-model="email"
                    :focus="emailFocusState"
                    @focus="inputFocus(1)"
                    @blur="inputBlur"
                    @input="usernameWatcher"
                    @confirm="usernameConfirm"
                    confirm-type="next"
                />
            </view>
            <view class="username-container" :class="usernameContainerStyle" v-else>
                <view class="input-placeholder" :class="usernamePlaceholderStyle">
                    手机号
                </view>
                <input
                    type="number"
                    class="username-input"
                    v-model="phone"
                    :focus="phoneFocusState"
                    @focus="inputFocus(1)"
                    @blur="inputBlur"
                    @input="usernameWatcher"
                    maxlength="11"
                    @confirm="usernameConfirm"
                    confirm-type="next"
                />
            </view>
            <view class="password-container" :class="passwordContainerStyle">
                <view class="input-placeholder" :class="passwordPlaceholderStyle">
                    密码
                </view>
                <input
                    type="password"
                    class="password-input"
                    v-model="password"
                    :focus="passwordFocusState"
                    @focus="inputFocus(2)"
                    @blur="inputBlur"
                    @input="passwordWatcher"
                    @confirm="passwordConfirm"
                    confirm-type="done"
                />
            </view>
        </view>
        <!-- E 输入框区域 -->

        <view class="change-username">
            <text v-if="!isEmailInput" @click="changeUsername">使用电子邮箱注册</text>
            <text v-else @click="changeUsername">使用手机号注册</text>
        </view>

        <!-- S 下方按钮区域 -->
        <view class="button-area">
            <view class="register-button" @click="registerCheck">
                <text>注 册</text>
            </view>
            <view class="exist-account">
                <text>已有账号？</text>
                <text class="login-now" @click="loginNow">立即登录</text>
            </view>
        </view>
        <!-- E 下方按钮区域 -->

        <toast ref="toast"/>

        <mask :isShow="isShowImageVerify" @click="isShowImageVerify = false">
            <imageVerify ref="imageVerify"></imageVerify>
        </mask>
    </view>
</template>

<script>
    import {Validator} from "../../common/js/validate/validate.js";
    import {toast} from '../../components/toast/toast.vue';
    import {imageVerify} from '../../components/imageVerify/imageVerify.vue';

    export default {
        components: {
            toast, imageVerify
        },
        data() {
            return {
                showRegisterForm: "none", //控制注册窗体显示隐藏
                registerFormAnimation: "", //注册窗体动效
                usernameContainerStyle: "", //用户名输入容器样式
                passwordContainerStyle: "", //密码输入容器样式
                usernamePlaceholderStyle: "", //用户名小标题样式
                passwordPlaceholderStyle: "", //密码小标题样式
                isEmailInput: false, //当前是否为电子邮箱输入状态（值为false时是手机号输入状态）
                emailFocusState: false, //电子邮箱输入框焦点状态
                phoneFocusState: false, //手机号输入框焦点状态
                passwordFocusState: false, //密码输入框焦点状态
                email: "", //邮箱输入框中的值
                phone: "", //手机号输入框中的值
                password: "", //密码输入框中的值
                isShowImageVerify: false, //是否显示图片拖拽验证
            };
        },
        onLoad() {
        },
        methods: {
            /**
             * 输入框聚焦事件
             * @param sel 触发目标，值为1是用户名输入框，值为2是密码输入框
             */
            inputFocus(sel) {
                switch (sel) {
                    case 1:
                        this.usernameContainerStyle = "container-focus";
                        this.passwordContainerStyle = "";
                        this.usernamePlaceholderStyle = "placeholder-focus";
                        if (this.password === "") {
                            this.passwordPlaceholderStyle = "";
                        }
                        break;
                    case 2:
                        this.passwordContainerStyle = "container-focus";
                        this.usernameContainerStyle = "";
                        this.passwordPlaceholderStyle = "placeholder-focus";
                        if (this.username === "") {
                            this.usernamePlaceholderStyle = "";
                        }
                        break;
                }
            },

            /**
             * 输入框失焦事件
             */
            inputBlur() {
                this.usernameContainerStyle = "";
                this.passwordContainerStyle = "";
                if (this.email === "" && this.phone === "") {
                    this.usernamePlaceholderStyle = "";
                }
                if (this.password === "") {
                    this.passwordPlaceholderStyle = "";
                }
            },
            /**
             * 用户名输入框监听器（后续若不使用可以删除）
             */
            usernameWatcher(e) {
                //Username Watcher
                this.$parent.username = this.email || this.phone;
            },
            /**
             * 密码输入框输入监听器（后续若不使用可以删除）
             */
            passwordWatcher(e) {
                //Password Watcher
                this.$parent.password = this.password;
            },
            /**
             * 用户名输入框确认事件
             */
            usernameConfirm(e) {
                if (e.detail.value !== "") {
                    //使密码输入框重新获得焦点
                    this.passwordFocusState = false;
                    this.$nextTick(() => {
                        this.passwordFocusState = true;
                    });
                }
                else {
                    //使用户名输入框重新获得焦点
                    if (this.isEmailInput === true) {
                        this.emailFocusState = false;
                        this.$nextTick(() => {
                            this.emailFocusState = true;
                        });
                    }
                    else {
                        this.phoneFocusState = false;
                        this.$nextTick(() => {
                            this.phoneFocusState = true;
                        });
                    }
                }
            },
            /**
             * 密码输入框确认事件
             */
            passwordConfirm(e) {
                if (e.detail.value === "") {
                    //使密码输入框重新获得焦点
                    this.passwordFocusState = false;
                    this.$nextTick(() => {
                        this.passwordFocusState = true;
                    });
                }
                else {
                    this.registerCheck(); //注册检查
                }
            },
            /**
             * 切换电子邮箱/手机号输入框
             */
            changeUsername() {
                this.utils.throttle(() => {
                    this.isEmailInput === true ? (this.email = "") : (this.phone = "");
                    this.password = "";
                    this.isEmailInput = !this.isEmailInput;
                    this.inputBlur();
                });
            },
            /**
             * 注册检查
             */
            registerCheck() {
                this.utils.throttle(() => {
                    let data, rules;
                    if (this.isEmailInput) {
                        data = {
                            username: this.email,
                            password: this.password,
                        };
                        rules = [
                            {
                                key: "username",
                                regExp: ["email"],
                                required: true,
                            },
                            {
                                key: "password",
                                required: true,
                            },
                        ];
                    }
                    else {
                        data = {
                            username: this.phone,
                            password: this.password,
                        };
                        rules = [
                            {
                                key: "username",
                                regExp: ["phone"],
                                required: true,
                            },
                            {
                                key: "password",
                                required: true,
                            },
                        ];
                    }
                    let validator = new Validator();
                    let validatedInfo = validator.validate(data, rules);
                    let [usernameValidatedInfo, passwordValidatedInfo] = [
                        validatedInfo.username,
                        validatedInfo.password,
                    ];
                    if (usernameValidatedInfo.required && passwordValidatedInfo.required) {
                        if (usernameValidatedInfo.regExp.length === 0) {
                            // this.isShowImageVerify = true;




                            if (this.isEmailInput === true) {
                                this.$parent.$refs["captchaForm"].setUserInfo('email', this.email);
                            }
                            else {
                                this.$parent.$refs["captchaForm"].setUserInfo('phone', this.phone);
                            }
                            this.$parent.$refs.navigationBar.setNavigation({
                                titleText: '注册',
                                customBackFunc: this.$parent.toRegisterScreen,
                            });
                            this.$parent.toCaptchaScreen();
                        }
                        else {
                            this.$refs.toast.show({
                                text: "邮箱/手机格式错误",
                                type: "warning",
                            });
                        }
                    }
                    else {
                        if (!usernameValidatedInfo.required) {
                            this.$refs.toast.show({
                                text: "必须填写邮箱/手机",
                                type: "warning",
                            });
                        }
                        else if (!passwordValidatedInfo.required) {
                            this.$refs.toast.show({
                                text: "必须填写密码",
                                type: "warning",
                            });
                        }
                    }
                }, 2500);
            },
            /**
             * 立即登录按钮点击事件
             */
            loginNow() {
                this.utils.throttle(() => {
                    [
                        this.usernameContainerStyle,
                        this.passwordContainerStyle,
                        this.usernamePlaceholderStyle,
                        this.passwordPlaceholderStyle,
                    ] = ["", "", "", ""]; //还原输入区域样式
                    this.$parent.$refs.navigationBar.setNavigation({
                        titleText: '登录',
                        customBackFunc: this.$parent.toRegisterScreen,
                    });
                    this.$parent.toLoginScreen();
                });
            },
            setAnimation(animation) {
                if (animation !== null) {
                    this.registerFormAnimation = `animate__animated animate__${animation}`;
                }
            },
            clear(animation) {
                this.email = '';
                this.phone = '';
                this.password = '';
                this.isEmailInput = false;
                if (animation !== null) {
                    this.setAnimation(animation);
                }
            }
        },
        mounted() {
        },
    };
</script>

<style lang="scss" scoped>
    .register-form {
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

            .username-container {
                height: rpx(110);
                border-bottom: rpx(4) solid #ededed;
                margin-bottom: rpx(46);
                transition-property: border-bottom-color;
                transition-duration: 0.2s;

                .input-placeholder {
                    font-size: rpx(34);
                    color: $uni-text-color-placeholder;
                    transition-duration: 0.2s;
                    transition-property: transform, font-size;
                    transform: translateY(rpx(40));
                }

                .username-input {
                    height: rpx(80);
                    font-size: rpx(32);
                    color: $uni-text-color;
                    transform: translateY(rpx(-10));
                }

                .placeholder-focus {
                    transform: translateY(0);
                    font-size: rpx(32);
                }
            }

            .password-container {
                height: rpx(110);
                border-bottom: rpx(4) solid #ededed;
                transition-property: border-bottom-color;
                transition-duration: 0.2s;

                .input-placeholder {
                    font-size: rpx(34);
                    color: $uni-text-color-placeholder;
                    transition-duration: 0.2s;
                    transition-property: transform, font-size;
                    transform: translateY(rpx(40));
                }

                .password-input {
                    height: rpx(80);
                    font-size: rpx(32);
                    color: $uni-text-color;
                    transform: translateY(rpx(-10));
                }

                .placeholder-focus {
                    transform: translateY(0);
                    font-size: rpx(32);
                }
            }

            .container-focus {
                border-bottom-color: $uni-color-primary;
            }
        }

        .change-username {
            font-size: rpx(30);
            color: $uni-text-color-placeholder;
            text-align: right;
            padding: rpx(30) 0;
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

            .exist-account {
                width: 100%;
                height: rpx(180);
                text-align: center;
                font-size: rpx(32);
                line-height: rpx(180);
                color: #444444;

                .login-now {
                    color: $uni-color-primary;
                }
            }
        }
    }
</style>
