<template>
  <view>
    <navigationBar ref="navigationBar">
      <template v-slot:title>
        <view style="width: 100%">
          <u-tabs
            ref="uTabs"
            class="u-tabs"
            :list="[{name: '推荐'}, {name: '关注'}, {name: '粉丝'}]"
            :is-scroll="false"
            :height="80"
            font-size="32"
            bold
            bg-color="transparent"
            :current="currentShowType"
            active-color="#f4756b"
            inactive-color="#9e9e9e"
            :bar-height="8"
            :active-item-style="{
              fontWeight: 'bold',
              fontSize: '36rpx',
              color: '#111'
            }"
            @change="handleTabsChange"/>
        </view>
      </template>
    </navigationBar>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view
      class="friend-list-container"
      :style="{height: `calc(100vh - ${navigationHeight}px)`}">
      <swiper
        class="swiper"
        :current="currentShowType"
        @animationfinish="onSwiperAnimationFinish">
        <!-- 推荐用户列表 -->
        <swiper-item class="fiend-list">
          <scroll-view
            class="user-scroll-view"
            :scroll-y="true">
            <view
              class="user-container"
              v-for="user in recommendList"
              :key="user.id"
              @click="gotoUserPage(user.id)">
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
              <view class="focus-btn">
                <view
                  class="btn__default"
                  :class="user.isFriend ? 'btn__friend' : ''"
                  @click.stop="handleFocus(user.id, user)">
                  <i
                    class="fas"
                    :class="user.isFriend ? user.isConcerned ? 'fa-arrow-right-arrow-left' : 'fa-check' : 'fa-plus'"/>
                  <text>{{ user.isFriend ? user.isConcerned ? '互相关注' : '已关注' : '关注' }}</text>
                </view>
              </view>
            </view>
            <view
              v-if="recommendList.length === 0"
              class="no-result"
              :style="{height: `calc(100vh - ${navigationHeight}px)`}">
              <text>暂无推荐的用户</text>
            </view>
            <view
              v-if="recommendList.length"
              class="safe-area"></view>
          </scroll-view>
        </swiper-item>
        <!-- 关注列表 -->
        <swiper-item class="fiend-list">
          <view
            class="user-search-container"
            @click="handleUserSearch">
            <i class="fas fa-search"/>
            <text>输入用户名搜索</text>
          </view>
          <scroll-view
            class="user-scroll-view"
            :scroll-y="true"
            :refresher-enabled="true"
            :refresher-triggered="focusListRefreshTrigger"
            @refresherrefresh="handleRefresh(1)"
            @refresherrestore="handleRefreshEnd(1)"
            @scrolltolower="handleLoadMore(1)">
            <view
              class="user-container"
              v-for="user in focusList"
              :key="user.id"
              @click="gotoUserPage(user.friendId)">
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
              <view class="focus-btn">
                <view
                  class="btn__default"
                  :class="user.isFriend ? 'btn__friend' : ''"
                  @click.stop="handleFocus(user.friendId, user)">
                  <i
                    class="fas"
                    :class="user.isFriend ? user.isConcerned ? 'fa-arrow-right-arrow-left' : 'fa-check' : 'fa-plus'"/>
                  <text>{{ user.isFriend ? user.isConcerned ? '互相关注' : '已关注' : '关注' }}</text>
                </view>
              </view>
            </view>
            <view
              class="load-more"
              v-if="focusListExistMore && !focusListLoadingMore && focusList.length !== 0">
              <text>下拉加载更多</text>
            </view>
            <view
              class="load-more loading-more"
              v-show="focusListLoadingMore && focusList.length !== 0">
              <loading ref="focusLoadingMore"/>
            </view>
            <view
              class="load-more"
              v-if="!focusListExistMore && focusList.length !== 0">
              <text>没有更多了哦 ~</text>
            </view>
            <view
              v-if="focusList.length === 0"
              class="no-result"
              :style="{height: `calc(100vh - ${navigationHeight + 100}px)`}">
              <text>暂无关注的用户</text>
            </view>
            <view
              v-if="focusList.length"
              class="safe-area"></view>
          </scroll-view>
        </swiper-item>
        <!-- 粉丝列表 -->
        <swiper-item class="fiend-list">
          <view
            class="user-search-container"
            @click="handleUserSearch">
            <i class="fas fa-search"/>
            <text>输入用户名搜索</text>
          </view>
          <scroll-view
            class="user-scroll-view"
            :scroll-y="true"
            :refresher-enabled="true"
            :refresher-triggered="fansListRefreshTrigger"
            @refresherrefresh="handleRefresh(2)"
            @refresherrestore="handleRefreshEnd(2)"
            @scrolltolower="handleLoadMore(2)">
            <view
              class="user-container"
              v-for="user in fansList"
              :key="user.id"
              @click="gotoUserPage(user.friendId)">
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
              <view class="focus-btn">
                <view
                  class="btn__default"
                  :class="user.isFriend ? 'btn__friend' : ''"
                  @click.stop="handleFocus(user.friendId, user)">
                  <i
                    class="fas"
                    :class="user.isFriend ? user.isConcerned ? 'fa-arrow-right-arrow-left' : 'fa-check' : 'fa-plus'"/>
                  <text>{{ user.isFriend ? user.isConcerned ? '互相关注' : '已关注' : '关注' }}</text>
                </view>
              </view>
            </view>
            <view
              class="load-more"
              v-if="fansListExistMore && !fansListLoadingMore && fansList.length !== 0">
              <text>下拉加载更多</text>
            </view>
            <view
              class="load-more loading-more"
              v-show="fansListLoadingMore && fansList.length !== 0">
              <loading ref="focusLoadingMore"/>
            </view>
            <view
              class="load-more"
              v-if="!fansListExistMore && fansList.length !== 0">
              <text>没有更多了哦 ~</text>
            </view>
            <view
              v-if="fansList.length === 0"
              class="no-result"
              :style="{height: `calc(100vh - ${navigationHeight + 100}px)`}">
              <text>暂无粉丝哦~</text>
            </view>
            <view
              v-if="fansList.length"
              class="safe-area"></view>
          </scroll-view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
    /**
     * @description 用户好友列表页
     * @param userId 用户ID，默认为当前已登陆的用户
     * @param type 显示的用户列表类型，0:推荐用户，1:关注，2:粉丝，默认为1
     */

    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";
    import {
        addFriend,
        editMyProfile,
        getMyProfile,
        getRecommendUserList,
        getUserFansList,
        getUserFocusList,
        removeFriend
    } from "@/common/js/api/models";

    export default {
        name: "friendList",
        components: {
            navigationBar, toast, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                currentShowType: null, //当前显示的用户列表类型，0:推荐用户，1:关注，2:粉丝
                userId: null, //用户Id
                myUserId: null, //我的用户ID
                mySchoolId: null, //我的学校ID
                recommendList: [], //推荐用户列表
                focusList: [], //关注用户列表
                fansList: [], //粉丝用户列表
                pageSize: 15, //分页大小
                focusListPageNumber: 0, //关注用户列表的页码
                fansListPageNumber: 0, //粉丝用户列表的页码
                focusListLoadingMore: false, //正在加载更多数据（关注列表）
                fansListLoadingMore: false, //正在加载更多数据（粉丝列表）
                focusListExistMore: true, //存在更多数据（关注列表）
                fansListExistMore: true, //存在更多数据（粉丝列表）
                focusListRefreshTrigger: false, //下拉刷新状态（关注列表）
                fansListRefreshTrigger: false, //下拉刷新状态（关注列表）
            }
        },
        methods: {
            // 获取推荐用户列表
            getRecommendUserList() {
                if (this.mySchoolId) {
                    getRecommendUserList({
                        urlParam: {
                            schoolId: this.mySchoolId
                        }
                    }).then(res => {
                        console.log(res);
                        if (res.success) {
                            this.recommendList = res.data;
                        }
                        else throw new Error(res);
                    }).catch(err => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '获取数据失败',
                            type: 'error',
                            direction: 'top'
                        });
                    }).finally(() => {
                        this.$refs.loading.stopLoading();
                    });
                }
            },
            /**
             * 获取关注用户列表
             * @param {Boolean} isLoadMore 是否为加载更多结果触发，默认为false
             */
            getFocusList(isLoadMore = false) {
                getUserFocusList({
                    urlParam: {
                        userId: this.userId
                    },
                    queryData: {
                        pageSize: this.pageSize,
                        pageNumber: isLoadMore ? this.focusListPageNumber + 1 : 1
                    }
                }).then(res => {
                    console.log(res);
                    if (res.success) {
                        if (!isLoadMore) {
                            //不是加载更多（重新获取数据）
                            this.focusList = [];
                            this.focusListPageNumber = 0;
                        }
                        if (res.data.records.length !== 0) {
                            //当前查询的结果数量不为0
                            res.data.records.forEach(user => {
                                this.focusList.push(user);
                            });
                            this.focusListPageNumber += 1;
                            this.focusListExistMore = res.data.records.length >= this.pageSize;
                        }
                        else {
                            //当前查询的结果数量为0
                            this.focusListExistMore = false;
                        }
                    }
                    else throw new Error(res);
                }).catch(err => {
                    console.error(err);
                    this.$refs.toast.show({
                        text: '获取数据失败',
                        type: 'error',
                        direction: 'top'
                    });
                }).finally(() => {
                    this.$refs.loading.stopLoading();
                    this.focusListLoadingMore = false;
                    this.focusListFreshing = false;
                    this.focusListRefreshTrigger = false;
                });
            },
            /**
             * 获取粉丝用户列表
             * @param {Boolean} isLoadMore 是否为加载更多结果触发，默认为false
             */
            getFansList(isLoadMore = false) {
                getUserFansList({
                    urlParam: {
                        userId: this.userId
                    },
                    queryData: {
                        pageSize: this.pageSize,
                        pageNumber: isLoadMore ? this.fansListPageNumber + 1 : 1
                    }
                }).then(res => {
                    console.log(res);
                    if (res.success) {
                        if (!isLoadMore) {
                            //不是加载更多（重新获取数据）
                            this.fansList = [];
                            this.fansListPageNumber = 0;
                        }
                        if (res.data.records.length !== 0) {
                            //当前查询的结果数量不为0
                            res.data.records.forEach(user => {
                                this.fansList.push(user);
                            });
                            this.fansListPageNumber += 1;
                            this.fansListExistMore = res.data.records.length >= this.pageSize;
                        }
                        else {
                            //当前查询的结果数量为0
                            this.fansListExistMore = false;
                        }
                    }
                    else throw new Error(res);
                }).catch(err => {
                    console.error(err);
                    this.$refs.toast.show({
                        text: '获取数据失败',
                        type: 'error',
                        direction: 'top'
                    });
                }).finally(() => {
                    this.$refs.loading.stopLoading();
                    this.fansListLoadingMore = false;
                    this.fansListFreshing = false;
                    this.fansListRefreshTrigger = false;
                });
            },
            /**
             * 用户关注操作
             * @param {Number|String} userId 用户ID
             * @param {Object} user 用户对象
             */
            async handleFocus(userId, user) {
                this.utils.throttle(async () => {
                    if (user.isFriend) {
                        uni.showModal({
                            title: '确定取消关注？',
                            confirmColor: '#f4756b',
                            success: res => {
                                if (res.confirm) {
                                    //已关注
                                    removeFriend({
                                        urlParam: {
                                            userId: userId
                                        }
                                    }).then(res => {
                                        if (res.success) {
                                            user.isFriend = false;
                                        }
                                        else throw new Error(res);
                                    }).catch(err => {
                                        console.error(err);
                                        this.$refs.toast.show({
                                            text: '取消关注失败',
                                            type: 'error',
                                            direction: 'top'
                                        });
                                    });
                                }
                            }
                        });
                    }
                    else {
                        //未关注
                        await addFriend({
                            urlParam: {
                                userId: userId
                            }
                        }).then(res => {
                            if (res.success) {
                                user.isFriend = true;
                            }
                            else throw new Error(res);
                        }).catch(err => {
                            console.error(err);
                            this.$refs.toast.show({
                                text: '关注失败',
                                type: 'error',
                                direction: 'top'
                            });
                        });
                    }
                }, 1000);
            },
            /**
             * 切换菜单标签
             * @param {Number} index 切换的序号
             */
            handleTabsChange(index) {
                this.utils.throttle(() => {
                    this.currentShowType = index;
                    uni.pageScrollTo({
                        scrollTop: 0,
                        duration: 500
                    });
                }, 500);
            },
            // swiper滑动结束回调事件
            onSwiperAnimationFinish(e) {
                this.currentShowType = e.detail.current;
            },
            // 搜索用户
            handleUserSearch() {
                uni.navigateTo({
                    url: '/pagesByStore/userSearch/userSearch'
                });
            },
            /**
             * 加载更多数据
             * @param {Number} type 1:关注，2:粉丝
             */
            handleLoadMore(type) {
                this.utils.throttle(() => {
                    if (type === 1) {
                        if (!this.focusListLoadingMore && this.focusListExistMore) {
                            this.focusListLoadingMore = true;
                            this.getFocusList(true);
                        }
                    }
                    else if (type === 2) {
                        if (!this.fansListLoadingMore && this.fansListExistMore) {
                            this.fansListLoadingMore = true;
                            this.getFansList(true);
                        }
                    }
                }, 1000);
            },
            /**
             * 下拉刷新开始事件
             * @param {Number} type 1:关注，2:粉丝
             */
            handleRefresh(type) {
                if (type === 1) {
                    if (this.focusListFreshing) return;
                    this.focusListFreshing = true;
                    if (!this.focusListRefreshTrigger) {
                        this.focusListRefreshTrigger = true;
                    }
                    setTimeout(() => {
                        this.getFocusList();
                    }, 500);
                }
                else if (type === 2) {
                    if (this.fansListFreshing) return;
                    this.fansListFreshing = true;
                    if (!this.fansListRefreshTrigger) {
                        this.fansListRefreshTrigger = true;
                    }
                    setTimeout(() => {
                        this.getFansList();
                    }, 500);
                }
            },
            /**
             * 下拉刷新结束事件
             * @param {Number} type 1:关注，2:粉丝
             */
            handleRefreshEnd(type) {
                if (type === 1) {
                    if (this.focusListFreshing) {
                        this.focusListFreshing = false;
                    }
                    if (this.focusListRefreshTrigger) {
                        this.focusListRefreshTrigger = false;
                    }
                }
                else if (type === 2) {
                    if (this.fansListFreshing) {
                        this.fansListFreshing = false;
                    }
                    if (this.fansListRefreshTrigger) {
                        this.fansListRefreshTrigger = false;
                    }
                }
            },
            /**
             * 用户点击事件
             * @param {Number|String} userId 操作目标用户的id
             */
            gotoUserPage(userId) {
                uni.navigateTo({
                    url: `/pagesByStore/userPage/userPage?userId=${userId}`
                });
            }
        },
        watch: {
            currentShowType(nval) {
                if (nval === 0 && this.mySchoolId == null) {
                    //当前显示的是推荐用户列表，且我的学校ID为空
                    this.$refs.loading.startLoading();
                    getMyProfile().then(res => {
                        if (res.success) {
                            this.myUserId = res.data.userId;
                            if (!!res.data.schoolId) {
                                //已绑定学校
                                this.mySchoolId = res.data.schoolId;
                                this.getRecommendUserList();
                            }
                            else {
                                //未绑定学校
                                uni.showModal({
                                    title: '未绑定学校',
                                    content: '请绑定学校以获取用户推荐',
                                    confirmText: '立即绑定',
                                    confirmColor: '#f4756b',
                                    success: res => {
                                        if (res.confirm) {
                                            uni.navigateTo({
                                                url: '/pagesByStore/myUserProfile/subpages/schoolSearch/schoolSearch',
                                                events: {
                                                    onSchoolSelected: data => {
                                                        if (data) {
                                                            const schoolId = data.schoolInfo.schoolId;
                                                            this.$refs.loading.startLoading();
                                                            editMyProfile({
                                                                queryData: {
                                                                    userId: this.myUserId,
                                                                    schoolId: schoolId
                                                                }
                                                            }).then(res => {
                                                                if (res.success) {
                                                                    this.mySchoolId = schoolId;
                                                                    this.getRecommendUserList();
                                                                }
                                                                else throw new Error(res);
                                                            }).catch(err => {
                                                                console.error(err);
                                                                this.$refs.loading.stopLoading();
                                                                this.$refs.toast.show({
                                                                    text: '学校绑定失败',
                                                                    type: 'error',
                                                                    direction: 'top'
                                                                });
                                                                this.currentShowType = 1;
                                                            });
                                                        }
                                                    }
                                                },
                                                success: () => {
                                                    this.$refs.loading.stopLoading();
                                                }
                                            });
                                        }
                                        else if (res.cancel) {
                                            this.currentShowType = 1;
                                            this.$refs.loading.stopLoading();
                                        }
                                    }
                                });
                            }
                        }
                        else throw new Error(res);
                    }).catch(err => {
                        console.error(err);
                    });
                }
                else if (nval === 1 && this.userId) {
                    if (!this.focusList.length && this.focusListExistMore) {
                        this.getFocusList();
                    }
                }
                else if (nval === 2 && this.userId) {
                    if (!this.fansList.length && this.fansListExistMore) {
                        this.getFansList();
                    }
                }
            },
            userId(nval) {
                if (nval) {
                    if (this.currentShowType === 1) {
                        this.getFocusList();
                    }
                    else if (this.currentShowType === 2) {
                        this.getFansList();
                    }
                }
            },
            focusListLoadingMore(nval, oval) {
                if (nval && !oval && this.focusList.length !== 0) {
                    this.$refs.focusLoadingMore.startLoading({
                        width: this.windowWidth - 40,
                        height: 54,
                    });
                }
                if (!nval && oval) {
                    this.$refs.focusLoadingMore.stopLoading();
                }
            }
        },
        onLoad() {
            this.$refs.loading.startLoading();
            this.currentShowType = Number(this.utils.getCurrentPage().curParam.type) ?? 1;
            this.userId = this.utils.getCurrentPage().curParam.userId ?? null;
            if (this.userId === 'undefined') {
                this.$refs.toast.show({
                    text: '获取个人信息失败',
                    type: 'error',
                    direction: 'top'
                });
                return;
            }
            if (!this.userId) {
                if (!(this.userId = uni.getStorageSync('userInfo').userId || null)) {
                    uni.getStorage({
                        key: 'userInfo',
                        success: res => {
                            this.userId = res.data.userId;
                        },
                        fail: () => {
                            const currentPage = this.utils.getCurrentPage();
                            this.$store.commit('currentPageUrl', currentPage.curFullUrl);
                            uni.redirectTo({
                                url: `/pages/login/wxLogin`
                            });
                        }
                    });
                }
            }
        },
        mounted() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            this.$refs.navigationBar.setNavigation({
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backgroundBlur: true
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import "friendList";
</style>