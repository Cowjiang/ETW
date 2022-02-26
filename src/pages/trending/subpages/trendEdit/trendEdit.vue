<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view
      class="trend-edit-container"
      :style="{height: `${windowHeight - navigationHeight}px`}">
      <view class="textarea-container">
        <u-field
          v-model="textareaValue"
          label-width="0"
          :border-bottom="false"
          :clearable="false"
          maxlength="300"
          placeholder="最近有什么有意思的事情想和大家分享？"
          type="textarea"/>
      </view>
      <view class="image-upload-container">
        <uploadGroup
          ref="uploadGroup"
          uploadImageDir="dynamic"
          maxImageCount="9"
          @onImageUploaded="submitPost(arguments)"/>
      </view>
      <view class="menu-container">
        <view
          class="menu-item"
          v-for="item in menuItemList"
          :key="item.id"
          @click="handleMenuItemClick(item.id)">
          <view class="title-icon">
            <i class="fa" :class="item.titleIcon" aria-hidden="true"></i>
          </view>
          <view class="title-text">
            {{ item.titleText }}
          </view>
          <view class="tag" v-show="item.tag">
            {{ item.tag }}
          </view>
        </view>
      </view>
      <view class="button-container">
        <view
          class="btn__default"
          :class="isPostReady ? 'btn__available' : 'btn__unavailable'"
          @click="handlePostBtnClick">
          发布
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import navigationBar from '@/components/navigationBar/navigationBar';
    import toast from '@/components/toast/toast';
    import loading from '@/components/loading/loading';
    import uploadGroup from '@/components/uploadGroup/uploadGroup';
    import {postTrend} from "@/common/js/api/models";

    export default {
        name: "trendEdit",
        components: {
            navigationBar, toast, uploadGroup, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                titleValue: '', //帖子标题的值
                textareaValue: '', //文本域的值
                menuItemList: [{
                    id: 1,
                    titleText: '选择地点',
                    titleIcon: 'fa-map-marker'
                }], //菜单项列表
                isPostReady: false, //是否准备发送
                positionInfo: {}, //位置信息
            }
        },
        methods: {
            /**
             * 菜单项点击事件
             * @param {Number} itemId 菜单项id
             */
            handleMenuItemClick(itemId) {
                switch (itemId) {
                    case 1:
                        uni.navigateTo({
                            url: "/pages/amap/amap",
                            events: {
                                acceptDataFromOpenedPage: data => {
                                    if (data) {
                                        this.positionInfo = {
                                            latitude: data.resultDetails.location.latitude,
                                            longitude: data.resultDetails.location.longitude,
                                            areaCode: data.resultDetails.adcode,
                                            addressName: data.resultDetails.name
                                        }
                                        this.menuItemList[0].tag = data.resultDetails.name;
                                    }
                                },
                            },
                        });
                        break;
                    case 2:
                        this.showTitleEdit = true;
                        break;
                }
            },
            // 发布按钮点击事件
            handlePostBtnClick() {
                this.utils.debounce(() => {
                    if (this.isPostReady) {
                        this.$refs.loading.startLoading();
                        this.$refs.uploadGroup.$refs.upload.upload();
                    }
                });
            },
            // 发布帖子
            submitPost(args) {
                let trendContent = {
                    content: this.textareaValue,
                    images: args[0],
                };
                if (this.positionInfo.latitude) {
                    trendContent.latitude = this.positionInfo.latitude;
                    trendContent.longitude = this.positionInfo.longitude;
                    trendContent.areaCode = this.positionInfo.areaCode;
                    trendContent.areaName = this.positionInfo.addressName;
                }
                postTrend({
                    queryData: trendContent,
                }).then(res => {
                    this.$refs.loading.stopLoading();
                    if (res.success) {
                        console.log(res);
                        uni.redirectTo({
                            url: "/pages/trending/trending",
                        });
                    }
                    else {
                        console.error(res);
                        this.$refs.toast.show({
                            text: '发布失败',
                            type: 'error',
                            direction: 'top'
                        });
                    }
                }).catch(err => {
                    console.error(err);
                    this.$refs.loading.stopLoading();
                    this.$refs.toast.show({
                        text: '发布失败',
                        type: 'error',
                        direction: 'top'
                    });
                });
            },
        },
        watch: {
            textareaValue(nval) {
                this.isPostReady = nval.replace(/[ ]/g, "").length > 5;
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '发布动态',
                backgroundColor: '#fff',
            });
        },
        onLoad() {
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                },
            }); //获取窗口尺寸
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
        }
    }
</script>

<style lang="scss" scoped>
  @import 'trendEdit';
</style>