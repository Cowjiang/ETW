<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="rgba(255,255,255,0)"/>

    <view
      class="select-school-container"
      :style="{height: `${windowHeight - navigationHeight}px`}">
      <view class="select-container">
        <view class="select-row">
          <view class="row-title">
            所在地区
          </view>
          <view
            class="row-content"
            @click="showAreaSelector = true">
            <view class="content">
              {{ areaName }}
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
        <view class="select-row">
          <view class="row-title">
            选择学校
          </view>
          <view
            class="row-content"
            @click="openSchoolSelector">
            <view class="content">
              {{ schoolName }}
            </view>
            <i class="fas fa-angle-right"/>
            <u-select
              v-model="showSchoolSelector"
              :list="schoolSelectorValue"
              confirm-color="#f4756b"
              :safe-area-inset-bottom="true"
              @confirm="handleSchoolChange"/>
          </view>
        </view>
      </view>
      <view class="confirm-button-container">
        <view
          class="btn__default"
          :class="!!schoolName ? '' : 'btn_disabled'"
          @click="confirmSchool">
          确认
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loading from "@/components/loading/loading";
    import selectArea from "@/components/selectPopup/selectArea/selectArea";
    import {getSchoolList} from "@/common/js/api/models";

    export default {
        name: "selectSchool",
        components: {
            toast, navigationBar, loading, selectArea
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                showAreaSelector: false, //是否显示地区选择器
                showSchoolSelector: false, //是否显示学校选择器
                schoolList: [], //学校列表
                areaCode: '', //地区行政编号
                areaName: '', //地区名称
                schoolId: '', //学校ID
                schoolName: '', //学校名称
            }
        },
        methods: {
            /**
             * 地区选择回调事件
             * @param {Object} area 地区信息
             */
            handleAreaChange(area) {
                if (area.area.value !== this.areaCode) {
                    this.areaCode = area.area.value;
                    this.areaName = `${area.province.label}${area.city.label}${area.area.label}`;
                    this.getSchoolList();
                }
            },
            /**
             * 学校选择回调事件
             * @param {Array} school 学校信息
             */
            handleSchoolChange(school) {
                if (school[0].value) {
                    this.schoolId = school[0].value;
                    this.schoolName = school[0].label;
                }
            },
            // 获取学校列表
            async getSchoolList() {
                this.$refs.loading.startLoading();
                await getSchoolList({
                    urlParam: {
                        province: this.areaCode.slice(0, 2),
                        city: this.areaCode.slice(2, 4),
                        area: this.areaCode.slice(4, 6),
                        keywords: ''
                    }
                }).then(res => {
                    if (res.success) {
                        this.schoolList = res.data;
                    }
                    else throw new Error(res);
                }).catch(err => {
                    console.error(err);
                    this.$refs.toast.show({
                        text: '获取学校失败',
                        type: 'error',
                        direction: 'top'
                    });
                }).finally(() => {
                    this.$refs.loading.stopLoading();
                });
            },
            // 打开学校选择器
            openSchoolSelector() {
                if (!!this.areaCode) {
                    this.showSchoolSelector = true;
                }
                else {
                    this.showAreaSelector = true;
                }
            },
            // 确认学校
            confirmSchool() {
                this.utils.throttle(() => {
                    if (!!this.schoolName) {
                        try {
                            const eventChannel = this.getOpenerEventChannel();
                            eventChannel.emit("onSchoolSelected", {
                                schoolInfo: {
                                    schoolId: this.schoolId,
                                    schoolName: this.schoolName
                                }
                            });
                            uni.navigateBack();
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }, 2000);
            },
        },
        computed: {
            // 学校选择器的内容
            schoolSelectorValue() {
                let schoolList = [];
                if (this.schoolList) {
                    this.schoolList.map(school => {
                        schoolList.push({
                            label: school.name,
                            value: school.id
                        });
                    });
                }
                return schoolList;
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '选择学校',
                backgroundColor: '#f6f6f6'
            });
        },
        onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
        }
    }
</script>

<style lang="scss" scoped>
  @import "selectSchool";
</style>