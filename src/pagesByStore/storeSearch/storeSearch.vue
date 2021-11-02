<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"></loading>

    <view class="store-search-container">
      <view class="input-container">
        <view
          class="input"
          :style="{width: `${showResult ? '100%' : 'calc(100% - 90rpx)'}`}">
          <i class="fa fa-search" aria-hidden="true"></i>
          <input
            type="text"
            v-model="searchValue"
            :focus="searchInputFocus"
            @focus="handleSearchInputFocus"
            :confirm-type="`search`"
            :adjust-position="false"
            placeholder="输入店铺名"
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
    <storeSearchEmpty
      ref="storeSearchEmpty"
      :showHistory="showHistory"
      v-show="showHistory"
      @historyClick="handleHistoryClick">
    </storeSearchEmpty>
    <storeSearchResult
      ref="storeSearchResult"
      v-show="showResult">
    </storeSearchResult>
  </view>
</template>

<script>
    import {toast} from '../../components/toast/toast.vue';
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';
    import {loading} from '../../components/loading/loading.vue';
    import {storeSearchEmpty} from '../../components/storeSearchEmpty/storeSearchEmpty';
    import {storeSearchResult} from '../../components/storeSearchResult/storeSearchResult';

    export default {
        name: "storeSearch",
        components: {
            toast, navigationBar, loading, storeSearchEmpty, storeSearchResult
        },
        data() {
            return {
                searchValue: '', //搜索输入框的值
                searchInputFocus: false, //搜索输入框聚焦状态
                showHistory: true, //是否显示搜索历史
                showResult: false, //是否显示搜索结果
                searchTrigger: false, //搜索触发器，用于验证搜索输入框输入值的变动
                navigateBackTrigger: false, //导航返回触发器，用于判断取消按钮及返回按钮的行为
            }
        },
        methods: {
            // 搜索事件
            searchResult() {
                this.utils.throttle(() => {
                    if (!this.searchTrigger) {
                        this.searchTrigger = true;
                        this.navigateBackTrigger = true;
                        this.$refs.loading.startLoading();
                        setTimeout(() => {
                            const searchValue = this.searchValue.replace(/\s*/g, "");
                            this.$refs.storeSearchEmpty.addHistory(searchValue);
                            this.showResult = true;
                            this.showHistory = false;
                            this.$refs.loading.stopLoading();
                        }, 500);
                    }
                    else {
                        this.$refs.loading.startLoading();
                        setTimeout(() => {
                            this.showResult = true;
                            this.showHistory = false;
                            this.$refs.loading.stopLoading();
                        }, 500);
                    }
                }, 300);
            },
            // 搜索输入框确认事件
            handleInputConfirm() {
                if (this.searchValue.replace(/\s*/g, "") !== '') {
                    this.searchResult();
                }
                else {
                    this.searchValue = '';
                }
            },
            // 取消按钮点击事件
            handleCancelBtnClick() {
                this.utils.throttle(() => {
                    if (this.navigateBackTrigger) {
                        this.showResult = true;
                        this.showHistory = false;
                    }
                }, 2000);
            },
            // 搜索输入框聚焦事件
            handleSearchInputFocus() {
                this.$refs.storeSearchEmpty.handleSearchInputFocus();
                this.showResult = false;
                this.showHistory = true;
            },
            // 历史记录点击事件
            handleHistoryClick(searchValue) {
                this.searchValue = searchValue;
                this.searchResult();
            }
        },
        watch: {
            // 搜索输入框的值监听器
            searchValue(nval, oval) {
                if (nval.replace(/\s*/g, "") !== oval.replace(/\s*/g, "") && this.searchTrigger) {
                    this.searchTrigger = false;
                }
            }
        },
        onShow() {
            this.$refs.navigationBar.setNavigation({
                titleText: '搜索店铺',
                backgroundColor: '#fff',
                customBackFunc: () => {
                    if (this.showHistory) {
                        wx.navigateBack({
                            fail: () => {
                                uni.redirectTo({
                                    url: `/pages/home/home`
                                });
                            }
                        });
                    }
                    else {
                        this.handleSearchInputFocus();
                    }
                }
            });
            this.searchInputFocus = true;
        }
    }
</script>

<style lang="scss" scoped>
  .store-search-container {
    width: 100%;
    height: fit-content;
    padding: 30rpx 0 20rpx 0;

    .input-container {
      width: 100%;
      height: 70rpx;
      display: flex;
      flex-direction: row;
      flex-shrink: 0;
      padding: 0 40rpx;

      .input {
        width: calc(100% - 90rpx);
        height: 100%;
        flex-shrink: 0;
        display: flex;
        flex-direction: row;
        padding: 0 20rpx;
        background-color: #f1f1f1;
        border-radius: 50rpx;
        overflow: hidden;
        transition-property: width;
        transition-duration: 500ms;

        .fa {
          margin-right: 20rpx;
          font-size: 36rpx;
          line-height: 70rpx;
          color: #aaa;
          font-weight: lighter;
        }

        input {
          width: 100%;
          height: 70rpx;
          font-size: 28rpx;
          line-height: 70rpx;
          color: #333;
        }
      }

      .cancel-btn {
        width: 90rpx;
        height: 100%;
        padding-left: 30rpx;
        font-size: 30rpx;
        color: #888;
        line-height: 70rpx;
        overflow: hidden;
        transition-property: opacity;
        transition-duration: 500ms;
        transition-delay: 500ms;
      }
    }
  }
</style>