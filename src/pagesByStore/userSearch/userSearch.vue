<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen maskColor="#f6f6f6"/>

    <view class="user-search-container">
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
            placeholder="输入用户名"
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
      :style="{ height: `calc(100vh - ${navigationHeight + 60}px)` }">
      <scroll-view
        class="result-scroll-view"
        :scroll-y="true"
        @scrolltolower="handleLoadMore">
        <view
          class="user-container"
          v-for="user in userSearchResult"
          :key="user.id"
          :data-userid="user.id"
          @click="handleUserClick(user.id)">
          <view class="img-container">
            <view class="image">
              <image
                :src="user.avgPath"
                style="width: 100%; height: 100%"
                mode="aspectFill"/>
            </view>
          </view>
          <view class="user-info">
            <view class="username">
              {{ user.username }}
            </view>
            <view class="description">
              {{ user.signature || '' }}
            </view>
          </view>
          <view
            class="focus-btn"
            v-if="userInfo.userId !== user.id">
            <view
              class="btn__default"
              :class="user.isFriend ? 'btn__friend' : ''"
              @click.stop="handleAddFriend(user.id)">
              <i
                class="fas"
                :class="user.isFriend ? user.isConcerned ? 'fa-arrow-right-arrow-left' : 'fa-check' : 'fa-plus'"/>
              <text>{{ user.isFriend ? user.isConcerned ? '互相关注' : '已关注' : '关注' }}</text>
            </view>
          </view>
        </view>
        <view
          class="load-more"
          v-if="existMore && !loadingMore && userSearchResult.length !== 0">
          <text>下拉加载更多</text>
        </view>
        <view
          class="load-more loading-more"
          v-show="loadingMore && userSearchResult.length !== 0">
          <loading ref="loadingMore"/>
        </view>
        <view class="load-more" v-if="!existMore && userSearchResult.length !== 0">
          <text>没有更多了哦 ~</text>
        </view>
        <view class="no-result" v-if="!existMore && userSearchResult.length === 0">
          <text>没有搜索到相关用户</text>
        </view>
        <view class="safe-area"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loading from "@/components/loading/loading";
    import {addFriend, removeFriend, searchUser} from "@/common/js/api/models";

    export default {
        name: "userSearch",
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
                showHistory: true, //是否显示搜索历史
                showResult: false, //是否显示搜索结果
                pageSize: 10, //分页大小
                currentPage: 0, //当前页码
                existMore: true, //是否存在更多搜索结果
                loadingMore: false, //正在加载更多搜索结果
                userSearchResult: [], //用户搜索结果
            }
        },
        methods: {
            /**
             * 搜索结果事件
             * @param {Boolean} isLoadMore 是否为加载更多结果触发，默认为false
             */
            searchResult(isLoadMore = false) {
                this.utils.throttle(() => {
                    if (!isLoadMore && this.searchValue.replace(/\s*/g, "") !== this.currentSearchValue) {
                        // 搜索框内容发生了改变，且不是加载更多结果
                        this.currentSearchValue = this.searchValue.replace(/\s*/g, "");
                        this.existMore = true;
                        this.currentPage = 0;
                    }
                    else if (!isLoadMore && this.searchValue.replace(/\s*/g, "") === this.currentSearchValue) {
                        // 搜索框内容没有改变，且不是加载更多结果
                        return;
                    }
                    this.$refs.loading.startLoading();
                    searchUser({
                        queryData: {
                            username: this.currentSearchValue,
                            pageSize: this.pageSize,
                            pageNumber: isLoadMore ? this.currentPage + 1 : 1
                        }
                    }).then(res => {
                        this.loadingMore = false;
                        if (!isLoadMore) {
                            //不是加载更多（重新搜索）
                            this.userSearchResult = [];
                        }
                        if (res.data.records.length !== 0) {
                            //当前查询的结果数量不为0
                            res.data.records.forEach(user => {
                                this.userSearchResult.push(user);
                            });
                            this.currentPage += 1;
                            if (res.data.records.length < this.pageSize) {
                                this.existMore = false;
                            }
                        }
                        else {
                            //当前查询的结果数量为0
                            this.existMore = false;
                        }
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
                            uni.switchTab({
                                url: '/pages/trending/trending',
                                fail: () => {
                                    uni.redirectTo({
                                        url: '/pages/trending/trending'
                                    });
                                }
                            });
                        }
                    });
                }, 2000);
            },
            // 搜索输入框聚焦事件
            handleSearchInputFocus() {
                this.showResult = false;
                this.showHistory = true;
            },
            // 下滑加载更多
            handleLoadMore() {
                this.utils.throttle(() => {
                    if (!this.loadingMore && this.existMore) {
                        this.loadingMore = true;
                        this.searchResult(true);
                    }
                }, 1000);
            },
            /**
             * 用户点击事件
             * @param {Number|String} uid 操作目标用户的id
             */
            handleUserClick(uid) {
                uni.navigateTo({
                    url: `/pagesByStore/userPage/userPage?userId=${uid}`
                });
            },
            /**
             * 添加好友/移除好友事件
             * @param {Number|String} uid 操作目标用户的id
             */
            handleAddFriend(uid) {
                this.utils.throttle(() => {
                    this.$refs.loading.startLoading();
                    this.userSearchResult.find(user => {
                        if (user.id === uid) {
                            if (user.isFriend) {
                                removeFriend({
                                    urlParam: {
                                        userId: user.id
                                    }
                                }).then(() => {
                                    this.$refs.loading.stopLoading();
                                    user.isFriend = false;
                                }).catch(err => {
                                    this.$refs.loading.stopLoading();
                                    console.error(err);
                                    this.$refs.toast.show({
                                        text: '取消关注失败',
                                        type: 'error',
                                        direction: 'top'
                                    });
                                });
                            }
                            else {
                                addFriend({
                                    urlParam: {
                                        userId: user.id
                                    }
                                }).then(() => {
                                    this.$refs.loading.stopLoading();
                                    user.isFriend = true;
                                }).catch(err => {
                                    this.$refs.loading.stopLoading();
                                    console.error(err);
                                    this.$refs.toast.show({
                                        text: '关注失败',
                                        type: 'error',
                                        direction: 'top'
                                    });
                                });
                            }
                        }
                    });
                }, 1000);
            }
        },
        computed: {
            userInfo() {
                return this.$store.state.userInfo;
            }
        },
        watch: {
            loadingMore(nval, oval) {
                if (nval && !oval && this.userSearchResult.length !== 0) {
                    this.$refs.loadingMore.startLoading({
                        width: this.windowWidth,
                        height: 54,
                    });
                }
                if (!nval && oval) {
                    this.$refs.loadingMore.stopLoading();
                }
            }
        },
        mounted() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
        },
        onShow() {
            this.$refs.navigationBar.setNavigation({
                titleText: '搜索用户',
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
  @import 'userSeach';
</style>