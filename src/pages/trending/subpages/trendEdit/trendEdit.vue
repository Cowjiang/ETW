<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view
      class="trend-edit-container"
      :style="{height: `calc(100vh - ${navigationHeight}px)`}">
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
          :width="(windowWidth * 2) - 72"
          @onImageUploaded="submitPost(arguments)"/>
      </view>
      <view class="menu-container">
        <view class="menu-item">
          <view class="select-topic-container">
            <i class="fas fa-hashtag"></i>
            <view
              class="title-text"
              @click="topicInputFocus = true">
              话题
            </view>
            <input
              class="content-text"
              type="text"
              v-model="topicValue"
              :focus="topicInputFocus"
              maxlength="10"
              @focus="topicInputFocus = false">
            <i class="fas fa-angle-right"/>
          </view>
        </view>
        <view class="menu-item">
          <view
            class="select-position-container"
            @click="gotoMap">
            <i class="fas fa-location-dot"/>
            <view class="title-text">
              选择地点
            </view>
            <view class="content-text address-name" v-if="positionInfo.addressName">
              {{ positionInfo.addressName }}
            </view>
            <i
              class="fas fa-angle-right"
              :style="{marginLeft: `${positionInfo.addressName ? 'unset' : 'auto'}`}"/>
          </view>
          <view class="address-tips-container">
            <scroll-view
              :scroll-x="true">
              <view class="address-tips">
                <view
                  class="tag"
                  v-if="positionInfo.addressName"
                  @click="clearPosition">
                  不选择地点
                </view>
                <view
                  class="tag"
                  v-for="address in addressTips"
                  v-if="address.name !== positionInfo.addressName"
                  :key="address.id"
                  @click="handleAddressTipsClick(address)">
                  {{ address.name }}
                </view>
                <view class="end"></view>
              </view>
            </scroll-view>
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
    import store from "@/common/js/store";

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
                isPostReady: false, //是否准备发送
                topicValue: '', //话题
                topicInputFocus: false, //话题输入框的聚焦状态
                positionInfo: {}, //位置信息
                addressTips: [], //附近地点建议
            }
        },
        methods: {
            // 获取定位信息
            getLocation() {
                this.amap.getPoiAround({
                    querytypes: '050000|060100|120000|150500|150200|150104|141200', //餐饮服务|商场|商务住宅|地铁站|火车站|机场|学校
                    success: data => {
                        if (data) {
                            this.addressTips = data.poisData.slice(0, 10);
                            this.positionInfo = {
                                latitude: parseFloat(data.poisData[0].location.substring(data.poisData[0].location.indexOf(",") + 1)),
                                longitude: parseFloat(data.poisData[0].location.substring(0, data.poisData[0].location.indexOf(","))),
                                areaCode: data.poisData[0].adcode,
                                addressName: data.poisData[0].name
                            }
                        }
                    },
                    fail: err => {
                        console.error(err);
                    },
                });
            },
            // 地图选址
            gotoMap() {
                uni.navigateTo({
                    url: "/pagesByStore/amap/amap",
                    events: {
                        acceptDataFromOpenedPage: data => {
                            if (data) {
                                this.positionInfo = {
                                    latitude: data.resultDetails.location.latitude,
                                    longitude: data.resultDetails.location.longitude,
                                    areaCode: data.resultDetails.adcode,
                                    addressName: data.resultDetails.name
                                }
                            }
                        },
                    },
                });
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
                    content: this.topicValue.replace(/\s*/g, "") !== '' ? `#${this.topicValue} ${this.textareaValue}` : this.textareaValue,
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
                }).then(() => {
                    const eventChannel = this.getOpenerEventChannel();
                    eventChannel.emit("onSent", {});
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
                    });
                }).catch(err => {
                    console.error(err);
                    this.$refs.toast.show({
                        text: '发布失败',
                        type: 'error'
                    });
                });
            },
            /**
             * 附近地址建议点击事件
             * @param {Object} address 地址信息
             */
            handleAddressTipsClick(address) {
                this.positionInfo = {
                    latitude: parseFloat(address.location.substring(address.location.indexOf(",") + 1)),
                    longitude: parseFloat(address.location.substring(0, address.location.indexOf(","))),
                    areaCode: address.adcode,
                    addressName: address.name
                }
            },
            // 清除位置信息
            clearPosition() {
                this.positionInfo = {};
            }
        },
        watch: {
            textareaValue(nval) {
                this.isPostReady = nval.replace(/[ ]/g, '').length > 1;
            },
            topicValue(nval) {
                this.topicValue = nval.replaceAll(/\s*/g, '').replaceAll('#', '');
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '发布动态',
                backgroundColor: '#fff',
            });
        },
        onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            this.getLocation();
            if (!this.$store.state.userInfo) {
                const currentPage = this.utils.getCurrentPage();
                this.$store.commit('currentPageUrl', currentPage.curFullUrl);
                uni.redirectTo({
                    url: `/pages/login/wxLogin`
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
  @import 'trendEdit';
</style>