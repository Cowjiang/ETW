<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>

    <view
      class="my-user-profile-container"
      :style="{height: `${windowHeight - navigationHeight}px`}">
      <view class="profile-container">
        <view class="profile-row">
          <view class="row-title">
            头像
          </view>
          <view
            class="row-content"
            @click="handleAvatarChange">
            <image
              class="avatar"
              :src="userProfile.avgPath"
              mode="aspectFill"/>
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            用户名
          </view>
          <view class="row-content">
            <view class="content">
              <input
                type="text"
                v-model="userProfile.username"
                maxlength="20"
                @focus="usernameTemp = userProfile.username"
                @blur="handleUsernameChange"
                @confirm="handleUsernameChange">
            </view>
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            姓名
          </view>
          <view class="row-content">
            <view class="content">
              <input
                type="text"
                v-model="userProfile.realName"
                maxlength="20"
                @focus="usernameTemp = userProfile.realName"
                @blur="handleRealNameChange"
                @confirm="handleRealNameChange">
            </view>
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            性别
          </view>
          <view
            class="row-content gender"
            @click="showGenderSelector = true">
            <view class="content">
              {{ userProfile.gender | formatGender }}
            </view>
            <i class="fas fa-angle-right"/>
            <u-select
              v-model="showGenderSelector"
              :list="[{label: '男', value: 1}, {label: '女', value: 2}]"
              confirm-color="#f4756b"
              :safe-area-inset-bottom="true"
              @confirm="handleGenderChange"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            生日
          </view>
          <view
            class="row-content birthday"
            @click="showBirthdaySelector = true">
            <view class="content">
              {{ userProfile.birthday || '' | formatDateTime('yy-mm-dd') }}
            </view>
            <i class="fas fa-angle-right"/>
            <u-picker
              mode="time"
              v-model="showBirthdaySelector"
              :params="{year: true, month: true, day: true, hour: false, minute: false, second: false}"
              confirm-color="#f4756b"
              :safe-area-inset-bottom="true"
              @confirm="handleBirthdayChange"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            地区
          </view>
          <view
            class="row-content"
            @click="showAreaSelector = true">
            <view class="content">
              {{ userProfile.areaName || areaName }}
            </view>
            <i class="fas fa-angle-right"/>
            <selectArea
              ref="selectArea"
              v-model="showAreaSelector"
              :safe-area-inset-bottom="true"
              maskCloseAble
              @confirm="handleAreaChange"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            我的学校
          </view>
          <view
            class="row-content"
            @click="">
            <view class="content">

            </view>
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            绑定微信
          </view>
          <view class="row-content">
            已绑定
          </view>
        </view>
        <view class="profile-row">
          <view class="row-title">
            我的地址
          </view>
          <view
            class="row-content"
            @click="toAddressBook">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
      </view>
      <view class="logout-button-container">
        <view
          class="btn__default"
          @click="logout">
          退出登录
        </view>
      </view>
    </view>
    <!-- 图片上传组件 -->
    <upload
      class="upload"
      ref="upload"
      :action="action"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :max-size="5242880"
      :max-count="1"
      @on-success="onUploadSuccess"
    ></upload>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import selectArea from "@/components/selectPopup/selectArea/selectArea";
    import upload from "@/components/upload/upload";
    import {editMyProfile, getMyProfile, getSchoolList, getUploadSignature, logOut} from "@/common/js/api/models";

    export default {
        name: "myUserProfile",
        components: {
            toast, navigationBar, selectArea, upload
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                userProfile: {}, //个人资料信息
                avatarUploadUrl: '', //头像上传URL
                usernameTemp: '', //用户名输入前的缓存
                realNameTemp: '', //真实姓名输入前的缓存
                showGenderSelector: false, //是否显示性别选择器
                showBirthdaySelector: false, //是否显示生日日期选择器
                showAreaSelector: false, //是否显示地区选择器
                action: '', //图片上传Url
                fileList: [], //发送图片的队列
            }
        },
        methods: {
            // 头像更改点击事件
            handleAvatarChange() {
                uni.showActionSheet({
                    itemList: ['拍摄', '从相册中选取'],
                    success: res => {
                        if (res.tapIndex === 0) {
                            this.$refs.upload.changeSourceType(['camera']);
                            this.$refs.upload.selectFile();
                        }
                        else {
                            this.$refs.upload.changeSourceType(['album']);
                            this.$refs.upload.selectFile();
                        }
                    }
                });
            },
            /**
             * 用户名输入更改事件
             * @param {Object} e 输入的用户名信息
             */
            handleUsernameChange(e) {
                if (e.detail.value !== this.usernameTemp) {
                    this.submitChange({
                        userId: this.userProfile.userId,
                        username: e.detail.value
                    }).then(() => {
                        this.$set(this.userProfile, 'username', e.detail.value);
                    });
                }
            },
            /**
             * 真实姓名输入更改事件
             * @param {Object} e 输入的真实姓名信息
             */
            handleRealNameChange(e) {
                if (e.detail.value !== this.realNameTemp) {
                    this.submitChange({
                        userId: this.userProfile.userId,
                        realName: e.detail.value
                    }).then(() => {
                        this.$set(this.userProfile, 'realName', e.detail.value);
                    });
                }
            },
            /**
             * 性别更改回调事件
             * @param {Array} gender 性别
             */
            handleGenderChange(gender) {
                if (gender[0].value !== this.userProfile.gender) {
                    this.submitChange({
                        userId: this.userProfile.userId,
                        gender: gender[0].value
                    }).then(() => {
                        this.$set(this.userProfile, 'gender', gender[0].value);
                    });
                }
            },
            /**
             * 出生日期更改回调事件
             * @param {Object} birthday 生日日期
             */
            handleBirthdayChange(birthday) {
                if (`${birthday.year}-${birthday.month}-${birthday.day}` !== this.userProfile.birthday) {
                    this.submitChange({
                        userId: this.userProfile.userId,
                        birthday: `${birthday.year}-${birthday.month}-${birthday.day}`
                    }).then(() => {
                        this.$set(this.userProfile, 'birthday', `${birthday.year}-${birthday.month}-${birthday.day}`);
                    });
                }
            },
            /**
             * 地区更改回调事件
             * @param {Object} area 地区信息
             */
            handleAreaChange(area) {
                if (area.area.value !== this.userProfile.areaCode) {
                    this.submitChange({
                        userId: this.userProfile.userId,
                        areaCode: area.area.value
                    }).then(() => {
                        this.$set(this.userProfile, 'areaCode', area.area.value);
                        this.$set(this.userProfile, 'areaName', `${area.province.label}${area.city.label}${area.area.label}`);
                    });
                }
            },
            // 跳转地址簿
            toAddressBook() {
                uni.navigateTo({
                    url: '/pagesByStore/addressBook/addressBook'
                });
            },
            /**
             * 提交更改
             * @param {Object} data 提交的数据
             * @return {Promise}
             */
            submitChange(data) {
                return new Promise((resolve, reject) => {
                    editMyProfile({
                        queryData: data
                    }).then(res => {
                        if (res.success) {
                            resolve();
                        }
                        else throw new Error(res);
                    }).catch(err => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '修改失败',
                            type: 'error',
                            direction: 'top'
                        });
                    });
                });
            },
            // 退出登录
            async logout() {
                await logOut();
                await uni.removeStorage({
                    key: 'cookie'
                });
                await uni.removeStorage({
                    key: 'userInfo'
                });
                this.$store.commit('userInfo', null);
                uni.navigateTo({
                    url: '/pages/index/index'
                });
            },
            // 上传图片前的钩子函数
            beforeUpload() {
                let imageTempPath = this.$refs.upload.lists[0].url;
                return new Promise((resolve, reject) => {
                    const dir = "avatar";
                    let fileSuffix = imageTempPath.substr(imageTempPath.lastIndexOf("."));
                    getUploadSignature({urlParam: dir}).then((res) => {
                        let signData = res.data;
                        this.action = signData.host;
                        let key = signData.dir + signData.uuid + fileSuffix; //文件路径
                        if (res.success) {
                            this.$refs.upload.formData = {
                                key: key,
                                policy: signData.policy,
                                OSSAccessKeyId: signData.accessId,
                                success_action_status: "200",
                                signature: signData.signature,
                            };
                            this.avatarUploadUrl = signData.host + "/" + key;
                            resolve();
                        }
                        else {
                            this.$refs.upload.clear();
                            reject();
                        }
                    }).catch((err) => {
                        this.$refs.upload.clear();
                        console.error(err);
                    });
                });
            },
            // 头像上传成功回调事件
            onUploadSuccess() {
                this.submitChange({
                    userId: this.userProfile.userId,
                    avgPath: this.avatarUploadUrl
                }).then(() => {
                    this.$set(this.userProfile, 'avgPath', this.avatarUploadUrl);
                });
            }
        },
        computed: {
            // 地区名称（根据地区编号查询）
            areaName: {
                get() {
                    if (!!this.userProfile.areaCode) {
                        const queryResult = this.$refs.selectArea.queryAreaName(this.userProfile.areaCode);
                        return queryResult ? `${queryResult[0]}${queryResult[1]}${queryResult[2]}` : '';
                    }
                    else return '';
                }
            }
        },
        filters: {
            formatGender(gender) {
                return gender === 1 ? '男' : gender === 2 ? '女' : '';
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '个人资料',
                backgroundColor: '#f6f6f6'
            });
        },
        async onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            await getSchoolList({
                urlParam: {
                    province: '44',
                    city: '01',
                    area: '',
                    keywords: ''
                }
            }).then(res => {
                console.log(res);
            }).catch(err => {
                console.error(err)
            });
            await getMyProfile().then(res => {
                if (res.success) {
                    this.userProfile = res.data;
                }
                else throw new Error(res);
            }).catch(err => {
                console.error(err);
            })
        },
        beforeDestroy() {
            getMyProfile().then(res => {
                if (res.success) {
                    uni.setStorage({
                        key: "userInfo",
                        data: res.data,
                        success: () => {
                            this.$store.commit('userInfo', res.data);
                        },
                    });
                }
                else throw new Error(res);
            }).catch(err => {
                console.error(err);
            })
        }
    }
</script>

<style lang="scss" scoped>
  @import 'myUserProfile';
</style>