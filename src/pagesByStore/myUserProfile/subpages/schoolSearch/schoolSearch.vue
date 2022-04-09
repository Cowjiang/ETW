<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"/>

    <view class="school-search-container">
      <view class="input-container">
        <view
          class="input"
          :style="{width: `${showResult ? '100%' : 'calc(100% - 90rpx)'}`}">
          <i class="fa fa-search"/>
          <input
            type="text"
            v-model="searchValue"
            :focus="searchInputFocus"
            @focus="handleSearchInputFocus"
            :confirm-type="`search`"
            :adjust-position="false"
            placeholder="输入学校名称"
            @confirm="handleInputConfirm">
        </view>
        <view
          class="cancel-btn"
          :style="{
            transform: `translateX(${showResult ? '100rpx' : '0'})`,
            opacity: `${showResult ? 0 : 1}`
          }"
          @click="handleCancelBtnClick">
          取消
        </view>
      </view>
    </view>
    <view
      class="result-container"
      :style="{ height: `${windowHeight - navigationHeight - 60}px` }">
      <scroll-view
        class="result-scroll-view"
        :scroll-y="true"
        :scroll-top="scrollTop"
        @scroll="onScroll">
        <view
          class="school"
          v-for="school in schoolList"
          :key="school.id"
          @click="handleSchoolClick(school)">
          <view class="school-name">
            {{ school.name }}
          </view>
        </view>
        <view class="no-result" v-show="noResult">
          <text>没有搜索到相关学校</text>
        </view>
        <view class="safe-area"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
    /**
     * @description 学校搜索页
     * @event onSchoolSelected(schoolInfo) 选择的学校信息，包含schoolId、schoolName
     */

    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loading from "@/components/loading/loading";
    import {getSchoolList} from "@/common/js/api/models";

    export default {
        name: "schoolSearch",
        components: {
            toast, navigationBar, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                searchValue: '', //搜索输入框的值
                currentSearchValue: '', //当前搜索输入框的值
                searchInputFocus: false, //搜索输入框聚焦状态
                showResult: false, //是否显示搜索结果
                schoolList: [], //学校列表
                noResult: false, //搜索结果为空
                scrollTop: 0, //scrollView的滚动高度
            }
        },
        methods: {
            /**
             * 搜索结果事件
             */
            searchResult() {
                this.utils.throttle(() => {
                    if (this.searchValue.replace(/\s*/g, "") !== this.currentSearchValue) {
                        // 搜索框内容发生了改变
                        this.currentSearchValue = this.searchValue.replace(/\s*/g, "");
                    }
                    else if (this.searchValue.replace(/\s*/g, "") === this.currentSearchValue) {
                        // 搜索框内容没有改变
                        return;
                    }
                    this.$refs.loading.startLoading();
                    this.noResult = false;
                    this.$nextTick(() => {
                        this.scrollTop = 0;
                    });
                    getSchoolList({
                        urlParam: {
                            keywords: this.currentSearchValue
                        }
                    }).then(res => {
                        if (!res.data.length) {
                            this.noResult = true;
                        }
                        this.schoolList = res.data;
                        this.$refs.loading.stopLoading();
                    }).catch(err => {
                        console.error(err);
                        this.$refs.loading.stopLoading();
                        this.$refs.toast.show({
                            text: '搜索失败',
                            type: 'error',
                            duration: 'top'
                        });
                    });
                }, 0);
            },
            // 搜索输入框确认事件
            handleInputConfirm() {
                this.searchValue.replace(/\s*/g, "") !== '' ? this.searchResult() : this.searchValue = '';
            },
            // 取消按钮点击事件
            handleCancelBtnClick() {
                this.utils.throttle(() => {
                    uni.navigateBack({
                        fail: () => {
                            uni.redirectTo({
                                url: '/pages/index/index'
                            });
                        }
                    });
                }, 2000);
            },
            // 搜索输入框聚焦事件
            handleSearchInputFocus() {
                this.showResult = false;
            },
            /**
             * 学校点击事件
             * @param {Object} school 点击的学校对象
             */
            handleSchoolClick(school) {
                try {
                    const eventChannel = this.getOpenerEventChannel();
                    eventChannel.emit("onSchoolSelected", {
                        schoolInfo: {
                            schoolId: school.id,
                            schoolName: school.name
                        }
                    });
                    uni.navigateBack();
                } catch (e) {
                    console.error(e);
                }
            },
            // scroll-view的滚动回调事件
            onScroll(e) {
                this.scrollTop = e.detail.scrollTop;
            }
        },
        mounted() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
        },
        onShow() {
            this.$refs.navigationBar.setNavigation({
                titleText: '选择学校',
                backgroundColor: '#fff'
            });
            this.searchInputFocus = true;
            if (this.searchValue.replace(/\s*/g, "") !== '') {
                this.currentSearchValue = '';
                this.searchResult();
            }
        }
    }
</script>

<style lang="scss" scoped>
  @import 'schoolSearch';
</style>