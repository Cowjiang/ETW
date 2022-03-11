<template>
  <view>
    <navigationBar ref="navigationBar">
      <view class="navigation-btn">
        <view
          :style="{
            width: `${submitTrendButtonWidth}px`,
            height: `${submitTrendButtonHeight}px`,
          }"
          class="trend-edit-btn"
          @click="gotoTrendEdit">
          <i class="fas fa-pencil fa-fw"/>
          <text>发布</text>
        </view>
        <view
          class="home-btn"
          :style="{
            width: `${submitTrendButtonHeight}px`,
            height: `${submitTrendButtonHeight}px`,
          }"
          @click="gotoHomePage">
          <i class="fas fa-house"/>
        </view>
      </view>
    </navigationBar>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view class="trending-container">
      <view
        class="trend-content"
        v-for="trend in trendList"
        :key="trend.id"
        @click="gotoTrendDetail(trend.id)">
        <view class="user-info-container" @click.stop>
          <view class="avatar-container">
            <image :src="trend.userInfo.avgPath" mode="aspectFill"/>
          </view>
          <view class="user-container">
            <view class="username">{{ trend.userInfo.username }}</view>
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
          <view class="comment-btn" @click.stop>
            <i class="fas fa-ellipsis"/>
          </view>
        </view>
      </view>
    </view>
    <view
      v-show="!isLoading && existMore"
      class="load-more"></view>
    <view
      v-show="isLoading"
      class="load-more loading-more">
      <loading ref="loadingMore"/>
    </view>
    <view
      v-show="!existMore"
      class="load-more">
      <text>没有更多了哦 ~</text>
    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";
    import {getAuthorList, getMyTrend, like} from "@/common/js/api/models.js";

    export default {
        components: {
            navigationBar, toast, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                submitTrendButtonWidth: 0,
                submitTrendButtonHeight: 0,
                authorList: [], //常访问作者
                trendList: [], //动态列表
                currentPage: 1, //当前页
                pageSize: 3, //每页多少条
                totalPages: 0, //总页数
                isLoading: false, //是否正在请求
                existMore: true, //是否还有更多结果
            };
        },
        methods: {
            /**
             * 获取动态列表数据
             * @param {Boolean} isRefresh 是否为刷新
             */
            getTrendData(isRefresh) {
                if (this.isLoading) {
                    return;
                }
                this.isLoading = true;
                //刷新
                if (isRefresh) {
                    this.currentPage = 1;
                    getMyTrend({
                        queryData: {
                            pageNumber: this.currentPage,
                            pageSize: this.pageSize,
                        },
                    }).then((res) => {
                        if (res.success) {
                            const data = res.data;
                            if (data.records.length < this.pageSize) {
                                this.existMore = false;
                            }
                            else {
                                this.existMore = true;
                            }
                            this.totalPages = data.total; //获取总页数
                            this.trendList = res.data.records;
                        }
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.isLoading = false;
                        uni.stopPullDownRefresh();
                    });
                }
                else {
                    // 请求下一页内容
                    this.currentPage += 1;
                    getMyTrend({
                        queryData: {
                            pageNumber: this.currentPage,
                            pageSize: this.pageSize,
                        },
                    }).then(res => {
                        const data = res.data;
                        if (data.records.length < this.pageSize) {
                            this.existMore = false;
                        }
                        this.trendList = this.trendList.concat(data.records); //衔接上一页的内容
                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        this.isLoading = false;
                    });
                }
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
             * 动态点赞事件
             * @param {Object} trend 动态
             */
            handleTrendLike(trend) {
                this.changeLikeStatus(!trend.isLike ? 1 : 2, trend.id, 2).then(() => {
                    this.$set(trend, 'isLike', !trend.isLike);
                    this.$set(trend, 'likeNumber', trend.isLike ? trend.likeNumber + 1 : trend.likeNumber - 1);
                }).catch(() => {});
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
        },
        onReachBottom() {
            this.utils.throttle(() => {
                if (this.existMore) {
                    this.getTrendData(false);
                }
            }, 1000);
        },
        onPullDownRefresh(e) {
            this.utils.throttle(() => {
                this.getTrendData(true);
            }, 1000);
        },
        watch: {
            isLoading(nval) {
                if (nval) {
                    this.$refs.loadingMore.startLoading({
                        width: this.windowWidth,
                        height: 54
                    });
                }
                else {
                    this.$refs.loadingMore.stopLoading();
                }
            }
        },
        onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.$refs.navigationBar.setNavigation({
                isShowButton: false,
                backgroundColor: "#fff",
            });
            this.submitTrendButtonWidth =
                this.$refs.navigationBar.navigationButtonWidth - 12;
            this.submitTrendButtonHeight = this.$refs.navigationBar.navigationBarHeight;
            // 获取常访问作者列表
            getAuthorList()
                .then((res) => {
                    this.authorList = res.data;
                })
                .catch((err) => {
                    console.log("获取常访问作者列表", err);
                });
            this.getTrendData(true);
        },
    };
</script>

<style lang="scss" scoped>
  @import "trending";
</style>
