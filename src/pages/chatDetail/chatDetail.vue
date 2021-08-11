<template>
    <view>
        <navigationBar ref="navigationBar" class="navigation-bar"/>
        <toast ref="toast" class="toast"/>
<<<<<<< HEAD
=======

        <view class="chat-container" :style="{height: `${windowHeight - navigationHeight}px`}">
            <view class="top-btn-area" :style="{top: `${navigationHeight}px`}">
                <view>关注TA</view>
                <view>加入黑名单</view>
            </view>
            <view class="message-area"
                  :style="{height: `${windowHeight - navigationHeight - 60}px`, transform: `translateY(-${keyboardHeight}px)`}">
                <scroll-view class="message-scroll-view" ref="scrollView" :scroll-y="true" @scroll="handleScroll"
                             :scroll-into-view="scrollToViewId" scroll-with-animation="true">
                    <view id="scrollTopView"></view>
                    <view class="message-container" v-for="(message, index) in messageRecords" :key="index"
                          :id="`message${index}`">
                        <view class="datetime-container"
                              v-if="computeDatetime(messageRecords[index - 1] === undefined ? 0 : messageRecords[index - 1].time, message.time)">
                            {{ message.time | formatTime }}
                        </view>
                        <view class="avatar-container"
                              :class="message.isMe === false ? 'avatar-container-left' : 'avatar-container-right'">

                        </view>
                        <view class="message-content" @longpress="handleLongPress" :data-name="`message${index}`"
                              @touchstart="handleTouchStart" @touchend="handleTouchEnd" @touchcancel="handleTouchEnd"
                              :class="message.isMe === false ? 'message-content-left' : 'message-content-right'"
                              :style="{filter: `${messageTouchingId === 'message' + index ? 'brightness(90%)' : 'brightness(100%)'}`}"
                        >
                            {{ message.content }}
                        </view>
                    </view>
                    <view id="scrollBottomView"></view>
                </scroll-view>
            </view>
            <view class="input-area"
                  :style="{transform: `translateY(-${keyboardHeight}px)`}">
                <view class="more-btn-container"
                      :style="{transform: `translateX(${inputFocusStatus ? '-120': '0'}rpx)`}">
                    <i class="fa fa-picture-o" aria-hidden="true"
                       :style="{opacity: `${inputFocusStatus ? '0': '1'}`}" @click="chooseImage(0)"></i>
                    <i class="fa fa-camera" aria-hidden="true"
                       :style="{opacity: `${inputFocusStatus ? '0': '1'}`}" @click="chooseImage(1)"></i>
                    <i class="fa fa-chevron-right" aria-hidden="true"
                       :style="{opacity: `${inputFocusStatus ? '1': '0'}`}"></i>
                </view>
                <view class="input-container">
                    <view class="input-inner-container" @click="showRawInput"
                          :style="{
                               width: `${inputFocusStatus ? 'calc(100vw - 200rpx)' : 'calc(100vw - 220rpx - 80rpx)'}`
                          }"
                    >
                        <input type="text" class="raw-input" v-model="rawInputValue" :focus="inputFocusStatus"
                               :adjust-position="false" v-if="inputFocusStatus"
                               @focus="handleInputFocus" @blur="handleInputBlur" @confirm="sendMessage"
                               :confirm-hold="true" :confirm-type="`发送`"
                               @keyboardheightchange="handleKeyboardHeightChange" :auto-blur="true">
                        <view class="show-input" v-if="!inputFocusStatus">{{ rawInputValue }}</view>
                    </view>
                    <view class="send-btn-container" @click="sendMessage"
                          :style="{opacity: `${isSendReady ? '1': '0.5'}`}">
                        <i class="fa fa-paper-plane" aria-hidden="true"></i>
                    </view>
                </view>
            </view>
        </view>
>>>>>>> eea6043a56d8f8bee5bd4839b43e0feb7cdc3ebc
    </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';
<<<<<<< HEAD

    import {getUserInfoTemp} from "../../common/js/api/models.js";
=======
    // import {getUserInfoTemp} from "../../common/js/api/models.js";
>>>>>>> eea6043a56d8f8bee5bd4839b43e0feb7cdc3ebc

    export default {
        components: {
            toast, navigationBar
        },
        data() {
            return {
<<<<<<< HEAD
                receiverId: '',
                receiverName: '',
=======
                windowWidth: 0,
                windowHeight: 0,
                navigationHeight: 0,
                receiverInfo: {
                    userId: '0',
                    avgPath: '',
                    realName: '',
                    username: '蜜雪冰城',
                },
                rawInputValue: '',
                inputFocusStatus: false,
                isSendReady: false,
                keyboardHeight: 0,
                messageRecords: [],
                messageRecordsTemp: [
                    {
                        id: 0,
                        isMe: false,
                        isPhoto: false,
                        content: '你爱我',
                        time: "2021-08-06T08:43:32.000+00:00",
                    },
                    {
                        id: 1,
                        isMe: false,
                        isPhoto: false,
                        content: '我爱你',
                        time: "2021-08-06T08:43:34.000+00:00",
                    },
                    {
                        id: 2,
                        isMe: false,
                        isPhoto: false,
                        content: '蜜雪冰城甜蜜蜜你爱我我爱你蜜雪冰城甜蜜蜜',
                        time: "2021-08-06T08:43:38.000+00:00",
                    },
                    {
                        id: 3,
                        isMe: true,
                        isPhoto: false,
                        content: 'I love you you love me',
                        time: "2021-08-06T08:58:31.000+00:00",
                    },
                    {
                        id: 4,
                        isMe: true,
                        isPhoto: false,
                        content: 'Mixue ice cream & tea I love you you love me Mixue ice cream & tea',
                        time: "2021-08-06T08:58:35.000+00:00",
                    },
                    {
                        id: 5,
                        isMe: false,
                        isPhoto: false,
                        content: '你',
                        time: "2021-08-07T04:48:38.000+00:00",
                    },
                    {
                        id: 6,
                        isMe: false,
                        isPhoto: false,
                        content: '爱我',
                        time: "2021-08-07T04:43:32.000+00:00",
                    },
                    {
                        id: 7,
                        isMe: false,
                        isPhoto: false,
                        content: '我爱你',
                        time: "2021-08-08T01:43:34.000+00:00",
                    },
                    {
                        id: 8,
                        isMe: false,
                        isPhoto: false,
                        content: '蜜雪冰城甜蜜蜜你爱我我爱你蜜雪冰城甜蜜蜜',
                        time: "2021-08-08T08:43:38.000+00:00",
                    },
                    {
                        id: 9,
                        isMe: true,
                        isPhoto: false,
                        content: '你爱我我爱你',
                        time: "2021-08-08T08:44:31.000+00:00",
                    },
                    {
                        id: 10,
                        isMe: true,
                        isPhoto: false,
                        content: '蜜雪冰城甜蜜蜜你爱我呀我爱你你爱我我爱你蜜雪冰城甜蜜蜜你爱我我爱你蜜雪冰城甜蜜蜜你爱我我爱你蜜雪冰城甜蜜蜜你爱我我爱你蜜雪冰城甜蜜蜜',
                        time: "2021-08-09T10:48:31.000+00:00",
                    },
                    {
                        id: 11,
                        isMe: false,
                        isPhoto: false,
                        content: '我也爱你呢',
                        time: "2021-08-10T08:48:38.000+00:00",
                    },
                ],
                scrollToViewId: '',
                messageTouchingId: '',
>>>>>>> eea6043a56d8f8bee5bd4839b43e0feb7cdc3ebc
            }
        },
        methods: {
            setChatBaseInfo() {
<<<<<<< HEAD
                getUserInfoTemp({
                    urlParam: this.receiverId
                }).then(res => {
                    console.log(res.data)
                    let userInfo = res.data;
                    this.receiverName = userInfo.realName;
                    this.$refs.navigationBar.setNavigation({
                        titleText: this.receiverName,
                        backgroundColor: '#ffffff'
                    });
                })
            }
        },

        computed: {},
        watch: {},
        mounted() {

        },
        onLoad() {
            this.getOpenerEventChannel().on('chatList', res => {
                this.receiverId = res.data.receiverId;
                if (this.receiverId !== '') {
                    this.setChatBaseInfo();
                }
            })
=======
                this.$refs.navigationBar.setNavigation({
                    titleText: this.receiverInfo.username,
                    backgroundColor: '#ffffff'
                });
                // getUserInfoTemp({
                //     urlParam: this.receiverInfo.userId
                // }).then(res => {
                //     console.log(res.data)
                //     let userInfo = res.data;
                //     if (Object.getOwnPropertyNames(userInfo).length) {
                //         this.receiverInfo = Object.assign(this.receiverInfo, userInfo);
                //     }
                // });
            },
            showRawInput() {
                this.inputFocusStatus = true;
                // this.scrollToViewId = `message${this.messageRecords.length - 1}`;
            },
            handleInputFocus() {
                // this.inputFocusStatus = true;
            },
            handleInputBlur() {
                this.inputFocusStatus = false;
                this.keyboardHeight = 0;
            },
            handleKeyboardHeightChange(e) {
                if (e.detail.height !== 0) {
                    this.keyboardHeight = e.detail.height;
                }
                this.$forceUpdate();
            },
            sendMessage() {
                setTimeout(() => {
                    this.scrollToViewId = `message${this.messageRecords.length - 1}`;
                    this.$forceUpdate();
                }, 0);
                if (this.isSendReady === true) {
                    this.messageRecords.push({
                        id: this.messageRecords.length + 2,
                        isMe: true,
                        isPhoto: false,
                        content: this.rawInputValue,
                        time: new Date()
                    });
                    this.rawInputValue = '';
                    this.inputFocusStatus = true;
                }
                else {
                    this.inputFocusStatus = true;
                }
            },
            chooseImage(mode) {
                switch (mode) {
                    case 0:
                        uni.chooseImage({
                            count: 1,
                            sourceType: ['album'],
                            success: res => {
                                console.log(res);
                            }
                        });
                        break;
                    case 1:
                        uni.chooseImage({
                            count: 1,
                            sourceType: ['camera'],
                            success: res => {
                                console.log(res);
                            }
                        });
                        break;
                }
            },
            handleScroll(e) {
                // console.log(e)
            },
            handleLongPress(e) {
                uni.showActionSheet({
                    itemList: ['复制', '举报该用户'],
                    success: res => {
                        if (res.tapIndex === 0) {
                            uni.setClipboardData({
                                data: this.messageRecords[parseInt(e.target.dataset.name.replace('message', ''))].content,
                                success: () => {

                                }
                            });
                        }
                        else {
                            this.$refs.toast.show({
                                text: '举报成功',
                                type: 'success'
                            });
                        }
                    }
                });
            },
            handleTouchStart(e) {
                this.messageTouchingId = e.target.dataset.name;
                this.$forceUpdate();
            },
            handleTouchEnd(e) {
                this.messageTouchingId = '';
                this.$forceUpdate();
            }
        },
        computed: {
            computeDatetime(oldTime, newTime) {
                return (oldTime, newTime) => {
                    return (new Date(newTime) - new Date(oldTime)) / 1000 / 60 >= 5;
                }
            }
        },
        filters: {
            formatTime(time) {
                let messageDate = new Date(time);
                let nowDate = new Date();
                let messageTime = {
                    year: messageDate.getFullYear(),
                    month: messageDate.getMonth() + 1,
                    day: messageDate.getDate(),
                    hour: messageDate.getHours().toString().padStart(2, '0'),
                    min: messageDate.getMinutes().toString().padStart(2, '0'),
                    second: messageDate.getSeconds()
                }
                let nowTime = {
                    year: nowDate.getFullYear(),
                    month: nowDate.getMonth() + 1,
                    day: nowDate.getDate()
                }
                if (messageTime.year === nowTime.year && messageTime.month === nowTime.month && messageTime.day === nowTime.day) {
                    return `${messageTime.hour}:${messageTime.min}`;
                }
                else {
                    return `${messageTime.year}-${messageTime.month}-${messageTime.day} ${messageTime.hour}:${messageTime.min}`;
                }
            }
        },
        watch: {
            rawInputValue(nval, oval) {
                this.isSendReady = nval.replace(/\s*/g, "") !== '';
            },
            messageRecords(nval, oval) {
                this.scrollToViewId = `scrollBottomView`;
                this.$forceUpdate();
            }
        },
        mounted() {
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                },
            }); //获取窗口尺寸
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
        },
        onLoad() {
            // this.getOpenerEventChannel().on('chatList', res => {
            //     this.receiverId = res.data.receiverId;
            //     if (this.receiverId !== '') {
            //         this.setChatBaseInfo();
            //     }
            // })
            this.messageRecords = this.messageRecordsTemp;
            this.setChatBaseInfo();
>>>>>>> eea6043a56d8f8bee5bd4839b43e0feb7cdc3ebc
        },
        onShow() {

        },
        onHide() {

        }
    }
</script>

<style lang="scss" scoped>
    .toast {
        position: absolute;
        top: rpx(150);
        width: 100%;
    }
<<<<<<< HEAD
=======

    .chat-container {
        width: 100vw;
        height: 100vh;
        background-color: #fff;

        .top-btn-area {
            display: flex;
            width: 100%;
            height: rpx(100);
            position: fixed;
            background-color: #fff;
            z-index: 99;

            view {
                width: 100%;
                height: rpx(70);
                margin: rpx(15) rpx(40) rpx(30);
                text-align: center;
                font-size: rpx(28);
                line-height: rpx(70);
                border-radius: rpx(100);
                background-color: $uni-color-grey;
            }

            view:nth-child(1) {
                margin-right: rpx(10);
            }

            view:nth-child(2) {
                margin-left: rpx(10);
            }
        }

        .message-area {
            width: 100%;
            height: 100%;
            background-color: #fff;
            transition-duration: 200ms;

            .message-scroll-view {
                position: relative;
                width: 100%;
                height: calc(100% - 120rpx);
                top: rpx(120);

                .message-container {
                    width: 100%;
                    height: fit-content;
                    margin-bottom: rpx(40);

                    .datetime-container {
                        width: 100vw;
                        margin: rpx(60) 0 rpx(30);
                        font-size: rpx(24);
                        text-align: center;
                        color: $uni-color-gray;
                    }

                    .datetime-container:nth-child(1) {
                        margin-top: 0;
                    }

                    .avatar-container {
                        width: rpx(80);
                        height: rpx(80);
                        border-radius: 50%;
                    }

                    .message-content {
                        width: fit-content;
                        max-width: calc(100vw - 280rpx);
                        height: fit-content;
                        min-height: rpx(60);
                        padding: rpx(20);
                        font-size: rpx(30);
                    }

                    .avatar-container-left {
                        float: left;
                        margin-left: rpx(40);
                        background-color: orange;
                    }

                    .message-content-left {
                        margin-left: rpx(140);
                        border-radius: rpx(0) rpx(20) rpx(20) rpx(40);
                        background-color: #f4f5f6;
                    }

                    .avatar-container-right {
                        float: right;
                        margin-right: rpx(40);
                        background-color: deepskyblue;
                    }

                    .message-content-right {
                        margin-left: auto;
                        margin-right: rpx(140);
                        border-radius: rpx(20) rpx(0) rpx(40) rpx(20);
                        background-color: #f4756b;
                        color: #fff;
                    }
                }

                .message-container:nth-child(1) {
                    margin-top: rpx(30);
                }
            }
        }

        .input-area {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
            height: rpx(120);
            background-color: #fff;

            .more-btn-container {
                display: inline;
                padding: rpx(20) 0 rpx(20) rpx(40);
                width: fit-content;
                height: 100%;
                float: left;
                font-size: rpx(36);
                line-height: rpx(80);
                color: #666666;
                transition-duration: 200ms;

                .fa:nth-child(1) {
                    letter-spacing: rpx(40);
                }
            }

            .input-container {
                display: inline;
                position: fixed;
                bottom: rpx(20);
                right: 0;
                width: fit-content;
                margin: rpx(20) rpx(20) 0 0;
                height: rpx(80);
                float: right;
                transition-duration: 200ms;

                .input-inner-container {
                    width: calc(100vw - 220rpx - 80rpx);
                    height: 100%;
                    float: left;
                    padding: rpx(20) rpx(40);
                    border-radius: rpx(100);
                    background-color: $uni-color-grey;
                    transition-duration: 200ms;
                    transition-property: width, transform;

                    .raw-input {
                        font-size: rpx(32);
                    }

                    .show-input {
                        font-size: rpx(32);
                        height: 100%;
                    }
                }

                .send-btn-container {
                    opacity: 1;
                    display: inline;
                    height: rpx(70);
                    width: rpx(70);
                    margin-top: rpx(10);
                    margin-left: rpx(20);
                    font-size: rpx(40);
                    line-height: rpx(70);
                    text-align: center;
                    color: #fff;
                    background-color: #f4756b;
                    border-radius: 50%;
                    float: right;
                    transition-property: opacity;
                    transition-duration: 200ms;
                }
            }
        }
    }
>>>>>>> eea6043a56d8f8bee5bd4839b43e0feb7cdc3ebc
</style>