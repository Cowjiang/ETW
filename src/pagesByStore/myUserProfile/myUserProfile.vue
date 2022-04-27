<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>
    <loading ref="uploading" fullscreen maskColor="rgba(255, 255, 255, 0.8)"/>

    <view
      class="my-user-profile-container"
      :style="{minHeight: `calc(100vh - ${navigationHeight}px)`}">
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
            个人简介
          </view>
          <view class="row-content">
            <view class="content">
              <input
                type="text"
                v-model="userProfile.signature"
                maxlength="40"
                @focus="descriptionTemp = userProfile.signature"
                @blur="handleDescriptionChange"
                @confirm="handleDescriptionChange">
            </view>
            <i class="fas fa-angle-right"/>
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
            @click="handleSchoolChange">
            <view class="content">
              {{ userProfile.schoolName || '' }}
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
      :max-size="10485760"
      :max-count="1"
      :show-tips="true"
      :limitType="['png', 'jpg', 'jpeg']"
      @on-success="onUploadSuccess"
      @on-error="onUploadError"
      @on-oversize="onUploadOversize"/>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loading from "@/components/loading/loading";
    import selectArea from "@/components/selectPopup/selectArea/selectArea";
    import upload from "@/components/upload/upload";
    import {editMyProfile, getMyProfile, getUploadSignature} from "@/common/js/api/models";

    export default {
        name: "myUserProfile",
        components: {
            toast, navigationBar, loading, selectArea, upload
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
                descriptionTemp: '', //个人简介输入前的缓存
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
             * 个人简介输入更改事件
             * @param {Object} e 输入的个人简介信息
             */
            handleDescriptionChange(e) {
                if (e.detail.value !== this.descriptionTemp) {
                    this.submitChange({
                        userId: this.userProfile.userId,
                        signature: e.detail.value
                    }).then(() => {
                        this.$set(this.userProfile, 'signature', e.detail.value);
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
            // 学校更改事件
            handleSchoolChange() {
                uni.navigateTo({
                    url: '/pagesByStore/myUserProfile/subpages/schoolSearch/schoolSearch',
                    events: {
                        onSchoolSelected: data => {
                            if (data) {
                                this.submitChange({
                                    userId: this.userProfile.userId,
                                    schoolId: data.schoolInfo.schoolId
                                }).then(() => {
                                    this.$set(this.userProfile, 'schoolName', data.schoolInfo.schoolName);
                                    this.$set(this.userProfile, 'schoolId', data.schoolInfo.schoolId);
                                });
                            }
                        }
                    }
                });
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
                return new Promise(resolve => {
                    editMyProfile({
                        queryData: data
                    }).then(() => {
                        resolve();
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
                await this.utils.logout();
                uni.switchTab({
                    url: '/pages/myPage/myPage'
                });
            },
            // 上传图片前的钩子函数
            beforeUpload(index, list) {
                return new Promise((resolve, reject) => {
                    uni.compressImage({
                        src: list[0].url,
                        quality: 80,
                        success: res => {
                            const imageTempPath = res.tempFilePath;
                            const fileSuffix = imageTempPath.substr(imageTempPath.lastIndexOf("."));
                            getUploadSignature({queryData: {dir: 'avatar'}}).then(res => {
                                const signData = res.data;
                                this.action = signData.host;
                                const key = `${signData.dir}${signData.uuid}${fileSuffix}`; //文件路径
                                this.$refs.upload.formData = {
                                    key: key,
                                    policy: signData.policy,
                                    OSSAccessKeyId: signData.accessId,
                                    success_action_status: "200",
                                    signature: signData.signature,
                                };
                                this.avatarUploadUrl = `${signData.host}/${key}`;
                                this.$refs.uploading.startLoading();
                                resolve();
                            }).catch(err => {
                                this.$refs.upload.clear();
                                reject(err);
                            });
                        }
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
                }).finally(() => {
                    this.$refs.uploading.stopLoading();
                });
            },
            //头像上传失败回调事件
            onUploadError(e) {
                console.error(e);
                this.$refs.uploading.stopLoading();
                this.$refs.toast.show({
                    text: '上传失败',
                    type: 'error',
                    direction: 'top'
                });
            },
            //头像上传超出大小限制回调事件
            onUploadOversize() {
                this.$refs.uploading.stopLoading();
                this.$refs.toast.show({
                    text: '图片超出10MB限制',
                    type: 'warning',
                    direction: 'top'
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
            this.$refs.loading.startLoading();
            await getMyProfile().then(res => {
                this.userProfile = res.data;
            }).catch(err => {
                console.error(err);
            }).finally(() => {
                this.$refs.loading.stopLoading();
            });
        },
        beforeDestroy() {
            if (this.$store.state.userInfo) {
                getMyProfile().then(res => {
                    uni.setStorage({
                        key: "userInfo",
                        data: res.data,
                        success: () => {
                            this.$store.commit('userInfo', res.data);
                        },
                    });
                }).catch(err => {
                    console.error(err);
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
  @import 'myUserProfile';
</style>