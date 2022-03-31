<template>
  <view>
    <navigationBar ref="navigationBar">
      <template v-slot:button>
        <view style="width: 220rpx">
          <u-tabs
            class="u-tabs"
            :list="[{name: '关注'}, {name: '推荐'}]"
            :is-scroll="false"
            height="80"
            font-size="34"
            bold
            bg-color="transparent"
            :current="currentTrendType"
            active-color="#f4756b"
            inactive-color="#9e9e9e"
            :bar-height="8"
            :active-item-style="{
              fontWeight: 'bold',
              fontSize: '38rpx',
              color: '#111'
            }"
            @change="handleTabsChange"/>
        </view>
      </template>
    </navigationBar>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <!-- 关注的动态列表（关注的人） -->
    <view
      class="trending-container focus-trend-list"
      v-show="currentTrendType === 0">
      <view
        class="trend-content"
        v-for="trend in focusTrendList"
        :key="trend.id"
        @click="gotoTrendDetail(trend.id)">
        <view class="user-info-container" @click.stop>
          <view class="avatar-container" @click="gotoUserPage(trend.userInfo.id)">
            <image :src="trend.userInfo.avgPath" mode="aspectFill"/>
          </view>
          <view class="user-container">
            <view class="username" @click="gotoUserPage(trend.userInfo.id)">{{ trend.userInfo.username }}</view>
            <view class="post-time">{{ trend.createdTime | formatTime }}</view>
          </view>
        </view>
        <view class="content-container">
          {{ trend.content }}
        </view>
        <view class="image-container" @click.stop>
          <trendsImageGroup
            v-if="trend.dynamicImages.length !== 0"
            :imageDataList="trend.dynamicImages"/>
        </view>
        <view class="tags-container">
          <view class="browse-count">
            浏览 {{ trend.browseNumber }}
          </view>
          <view
            class="position-tag"
            v-if="trend.areaInfo"
            @click.stop="showOnMap(trend.areaInfo)">
            <i class="fas fa-location-dot"/>
            {{ trend.areaInfo.areaName }}
          </view>
        </view>
        <view class="comment-btn-container">
          <view
            class="comment-btn"
            @click.stop="handleTrendLike(trend)">
            <i
              class="fa-thumbs-up"
              :class="trend.isLike ? 'fas liked' : 'far'"/>
            <text>{{ trend.likeNumber }}</text>
          </view>
          <view class="comment-btn">
            <i class="far fa-comment"/>
            <text>{{ trend.commentNumber }}</text>
          </view>
          <view class="comment-btn" @click.stop="moreAction(trend)">
            <i class="fas fa-ellipsis"/>
          </view>
        </view>
      </view>
      <view
        v-if="!focusTrendListLoadingMore && focusTrendListExistMore"
        class="load-more">
        <text>下拉加载更多</text>
      </view>
      <view
        v-show="focusTrendListLoadingMore"
        class="load-more loading-more">
        <loading ref="focusTrendListLoadingMore"/>
      </view>
      <view
        v-if="!focusTrendListExistMore"
        class="load-more">
        <text>没有更多了哦 ~</text>
      </view>
    </view>

    <!-- 主要的动态列表（推荐） -->
    <view
      class="trending-container main-trend-list"
      v-show="currentTrendType === 1">
      <view
        class="trend-content"
        v-for="trend in mainTrendList"
        :key="trend.id"
        @click="gotoTrendDetail(trend.id)">
        <view class="user-info-container" @click.stop>
          <view class="avatar-container" @click="gotoUserPage(trend.userInfo.id)">
            <image :src="trend.userInfo.avgPath" mode="aspectFill"/>
          </view>
          <view class="user-container">
            <view class="username" @click="gotoUserPage(trend.userInfo.id)">{{ trend.userInfo.username }}</view>
            <view class="post-time">{{ trend.createdTime | formatTime }}</view>
          </view>
        </view>
        <view class="content-container">
          {{ trend.content }}
        </view>
        <view class="image-container" @click.stop>
          <trendsImageGroup
            v-if="trend.dynamicImages.length !== 0"
            :imageDataList="trend.dynamicImages"/>
        </view>
        <view class="tags-container">
          <view class="browse-count">
            浏览 {{ trend.browseNumber }}
          </view>
          <view
            class="position-tag"
            v-if="trend.areaInfo"
            @click.stop="showOnMap(trend.areaInfo)">
            <i class="fas fa-location-dot"/>
            {{ trend.areaInfo.areaName }}
          </view>
        </view>
        <view class="comment-btn-container">
          <view
            class="comment-btn"
            @click.stop="handleTrendLike(trend)">
            <i
              class="fa-thumbs-up"
              :class="trend.isLike ? 'fas liked' : 'far'"/>
            <text>{{ trend.likeNumber }}</text>
          </view>
          <view class="comment-btn">
            <i class="far fa-comment"/>
            <text>{{ trend.commentNumber }}</text>
          </view>
          <view class="comment-btn" @click.stop="moreAction(trend)">
            <i class="fas fa-ellipsis"/>
          </view>
        </view>
      </view>
      <view
        v-if="!mainTrendListLoadingMore && mainTrendListExistMore"
        class="load-more">
        <text>下拉加载更多</text>
      </view>
      <view
        v-show="mainTrendListLoadingMore"
        class="load-more loading-more">
        <loading ref="mainTrendListLoadingMore"/>
      </view>
      <view
        v-if="!mainTrendListExistMore"
        class="load-more">
        <text>没有更多了哦 ~</text>
      </view>
    </view>
    <view
      class="edit-trend-btn"
      v-if="!mainTrendListLoadingMore && !focusTrendListLoadingMore"
      @click="gotoTrendEdit">
      <i class="fas fa-pen"/>
    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";
    import trendsImageGroup from "@/components/trendsImageGroup/trendsImageGroup";
    import {getMyFocusedTrend, getNewTrend, like} from "@/common/js/api/models.js";

    export default {
        components: {
            navigationBar, toast, loading, trendsImageGroup
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                currentTrendType: 1, //当前动态列表类型，0:关注用户的动态，1:推荐的动态
                mainTrendList: [], //主要的动态列表（推荐）
                focusTrendList: [], //关注的动态列表（关注用户）
                mainTrendListPageNumber: 0, //主要的动态列表的页码
                focusTrendListPageNumber: 0, //关注的动态列表的页码
                pageSize: 10, //分页查询动态数据的每页数量
                mainTrendListLoadingMore: false, //是否正在请求（主要的动态列表）
                focusTrendListLoadingMore: false, //是否正在请求（关注的动态列表）
                mainTrendListExistMore: true, //存在更多数据（主要的动态列表）
                focusTrendListExistMore: true, //存在更多数据（关注的动态列表）
            };
        },
        methods: {
            /**
             * 获取动态列表数据
             * @param {Number} type 动态列表的类型，0:关注用户的动态，1:推荐的动态
             * @param {Boolean} isRefresh 是否为刷新数据（重新获取），默认为true
             */
            getTrendData(type, isRefresh = true) {
                if (type === 0) {
                    //当前获取动态数据类型为关注的动态
                    if (this.focusTrendListLoadingMore) {
                        return;
                    }
                    this.focusTrendListLoadingMore = true;
                    getMyFocusedTrend({
                        queryData: {
                            pageNumber: isRefresh ? 1 : this.focusTrendListPageNumber + 1,
                            pageSize: this.pageSize,
                        },
                    }).then(res => {
                        if (res.success) {
                            if (isRefresh) {
                                //刷新
                                this.focusTrendListPageNumber = 0;
                                this.focusTrendList = [];
                            }
                            const data = res.data;
                            if (data.records.length !== 0) {
                                //当前查询的结果数量不为0
                                this.focusTrendListExistMore = data.records.length >= this.pageSize;
                                data.records.forEach(trend => {
                                    this.focusTrendList.push(trend);
                                });
                                this.focusTrendListPageNumber += 1;
                            }
                            else {
                                //当前查询的结果数量为0
                                this.focusTrendListExistMore = false;
                            }
                        }
                    }).catch((err) => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '获取数据失败',
                            type: 'error',
                            direction: 'top'
                        });
                    }).finally(() => {
                        this.focusTrendListLoadingMore = false;
                        uni.stopPullDownRefresh();
                    });
                }
                else if (type === 1) {
                    //当前获取动态数据类型为推荐的动态
                    if (this.mainTrendListLoadingMore) {
                        return;
                    }
                    this.mainTrendListLoadingMore = true;
                    getNewTrend({
                        queryData: {
                            pageNumber: isRefresh ? 1 : this.mainTrendListPageNumber + 1,
                            pageSize: this.pageSize,
                        },
                    }).then(res => {
                        if (res.success) {
                            if (isRefresh) {
                                //刷新
                                this.mainTrendListPageNumber = 0;
                                this.mainTrendList = [];
                            }
                            const data = res.data;
                            if (data.records.length !== 0) {
                                //当前查询的结果数量不为0
                                this.mainTrendListExistMore = data.records.length >= this.pageSize;
                                data.records.forEach(trend => {
                                    this.mainTrendList.push(trend);
                                });
                                this.mainTrendListPageNumber += 1;
                            }
                            else {
                                //当前查询的结果数量为0
                                this.mainTrendListExistMore = false;
                            }
                        }
                    }).catch((err) => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '获取数据失败',
                            type: 'error',
                            direction: 'top'
                        });
                    }).finally(() => {
                        this.mainTrendListLoadingMore = false;
                        uni.stopPullDownRefresh();
                    });
                }
            },
            // 切换菜单标签
            handleTabsChange(index) {
                this.utils.throttle(() => {
                    this.currentTrendType = index;
                    uni.pageScrollTo({
                        scrollTop: 0,
                        duration: 500
                    });
                }, 500);
            },
            // 前往动态编辑发布页面
            gotoTrendEdit() {
                uni.navigateTo({
                    url: "/pages/trending/subpages/trendEdit/trendEdit",
                });
            },
            // 返回主页
            gotoHomePage() {
                uni.redirectTo({
                    url: `/pages/index/index`
                });
            },
            /**
             * 前往动态详情页
             * @param {Number} trendId 动态ID
             */
            gotoTrendDetail(trendId) {
                if (trendId) {
                    uni.navigateTo({
                        url: `/pages/trending/subpages/trendDetail/trendDetail?id=${trendId}`,
                    });
                }
            },
            /**
             * 跳转用户个人主页
             * @param {Number|String} userId 用户ID
             */
            gotoUserPage(userId) {
                uni.navigateTo({
                    url: `/pagesByStore/userPage/userPage?userId=${userId}`
                });
            },
            /**
             * 动态点赞事件
             * @param {Object} trend 动态
             */
            handleTrendLike(trend) {
                this.changeLikeStatus(!trend.isLike ? 1 : 2, trend.id, 2).then(() => {
                    this.$set(trend, 'isLike', !trend.isLike);
                    this.$set(trend, 'likeNumber', trend.isLike ? trend.likeNumber + 1 : trend.likeNumber - 1);
                }).catch(() => {
                });
            },
            /**
             * 改变点赞状态
             * @param {Number} actionType 点赞类型，1：点赞，2：取消
             * @param {Number} targetId 目标ID
             * @param {Number} targetType 点赞对象类型，1：作品，2：动态，3：评论，4：二级评论
             * @return {Promise}
             */
            changeLikeStatus(actionType, targetId, targetType) {
                return new Promise((resolve, reject) => {
                    like({
                        urlParam: targetId,
                        queryData: {
                            actionType: actionType,
                            targetType: targetType
                        }
                    }).then(res => {
                        if (res.success) {
                            resolve();
                        }
                        else {
                            throw new Error(res);
                        }
                    }).catch(err => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '点赞失败',
                            type: 'error',
                            direction: 'top'
                        });
                        reject(err);
                    });
                });
            },
            /**
             * 在地图上显示位置
             * @param {Object} areaInfo 地址信息
             */
            showOnMap(areaInfo) {
                uni.openLocation({
                    latitude: areaInfo.latitude,
                    longitude: areaInfo.longitude,
                    scale: 18,
                    name: areaInfo.areaName,
                    fail: err => {
                        console.error(err);
                    }
                });
            },
            /**
             * 动态的更多操作按钮点击事件
             * @param {Object} trend 动态
             */
            moreAction(trend) {
                uni.showActionSheet({
                    itemList: ['复制内容', '举报'],
                    success: res => {
                        if (res.tapIndex === 0) {
                            uni.setClipboardData({
                                data: trend.content
                            });
                        }
                        else {
                            this.$refs.toast.show({
                                text: '举报成功',
                                type: 'success',
                                direction: 'top'
                            });
                        }
                    }
                });
            }
        },
        // 页面滑动触底事件
        onReachBottom() {
            this.utils.throttle(() => {
                if (this.currentTrendType === 0 && this.focusTrendListExistMore) {
                    this.getTrendData(0, false);
                }
                else if (this.currentTrendType === 1 && this.mainTrendListExistMore) {
                    this.getTrendData(1, false);
                }
            }, 1000);
        },
        // 页面下拉刷新事件
        onPullDownRefresh() {
            this.utils.throttle(() => {
                this.getTrendData(this.currentTrendType);
            }, 1000);
        },
        watch: {
            mainTrendListLoadingMore(nval) {
                if (nval) {
                    this.$refs.mainTrendListLoadingMore.startLoading({
                        width: this.windowWidth - 30,
                        height: 54
                    });
                }
                else {
                    this.$refs.mainTrendListLoadingMore.stopLoading();
                }
            },
            focusTrendListLoadingMore(nval) {
                if (nval) {
                    this.$refs.focusTrendListLoadingMore.startLoading({
                        width: this.windowWidth - 30,
                        height: 54
                    });
                }
                else {
                    this.$refs.focusTrendListLoadingMore.stopLoading();
                }
            },
            currentTrendType(nval) {
                if (nval === 0 && !this.focusTrendList.length && this.focusTrendListExistMore) {
                    this.getTrendData(0);
                }
                else if (nval === 1 && !this.mainTrendList.length && this.mainTrendListExistMore) {
                    this.getTrendData(1);
                }
            }
        },
        onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.$refs.navigationBar.setNavigation({
                isShowButton: false,
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backgroundBlur: true
            });
            this.getTrendData(this.currentTrendType);
        },
    };
</script>

<style lang="scss" scoped>
  @import "trending";
</style>
