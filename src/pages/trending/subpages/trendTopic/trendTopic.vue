<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view class="trend-topic-container">
      <view class="trending-container main-trend-list">
        <view
          class="trend-content"
          v-for="trend in trendList"
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
            <view
              class="tag-container"
              v-if="trend.isTop">
              置顶动态
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
              <!--            浏览 {{ trend.browseNumber }}-->
              <text
                style="color: #576991"
                v-if="trend.topic">
                # {{ trend.topic }}
              </text>
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
          v-if="!trendListLoadingMore && trendListExistMore"
          class="load-more">
          <text>下拉加载更多</text>
        </view>
        <view
          v-show="trendListLoadingMore"
          class="load-more loading-more">
          <loading ref="trendListLoadingMore"/>
        </view>
        <view
          v-if="!trendListExistMore"
          class="load-more">
          <text>没有更多了哦 ~</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";
    import {getNewTrend, like} from "@/common/js/api/models";

    export default {
        name: "trendTopic",
        components: {
            navigationBar, toast, loading
        },
        data() {
            return {
                topicName: '', //话题名称
                trendList: [], //动态列表
                trendListPageNumber: 0, //动态列表的页码
                pageSize: 10, //分页查询动态数据的每页数量
                trendListLoadingMore: false, //是否正在请求
                trendListExistMore: true, //存在更多数据
            }
        },
        methods: {
            /**
             * 获取动态列表数据
             * @param {Boolean} isRefresh 是否为刷新数据（重新获取），默认为true
             */
            async getTrendData(isRefresh = true) {
                if (this.trendListLoadingMore) {
                    return;
                }
                this.trendListLoadingMore = true;
                getNewTrend({
                    queryData: {
                        pageNumber: isRefresh ? 1 : this.trendListPageNumber + 1,
                        pageSize: this.pageSize,
                        keywords: this.topicName
                    },
                }).then(res => {
                    if (isRefresh) {
                        //刷新
                        this.trendListPageNumber = 0;
                        this.trendList = [];
                    }
                    const data = res.data;
                    if (data.records.length !== 0) {
                        //当前查询的结果数量不为0
                        this.trendListExistMore = data.records.length >= this.pageSize;
                        data.records.forEach(trend => {
                            trend.dynamicImages.forEach(image => {
                                image.imgUrl = `${image.imgUrl}#${Math.random()}`;
                            });
                            const topicStartIndex = trend.content.indexOf('#');
                            if (topicStartIndex !== -1) {
                                //内容包含话题
                                trend.topic = trend.content.substring(topicStartIndex + 1, trend.content.indexOf(' ') + 1);
                                trend.content = trend.content.substring(trend.content.indexOf(' ') + 1, trend.content.length);
                            }
                            this.trendList.push(trend);
                        });
                        this.trendListPageNumber += 1;
                    }
                    else {
                        //当前查询的结果数量为0
                        this.trendListExistMore = false;
                    }
                }).catch(err => {
                    console.error(err);
                    this.$refs.toast.show({
                        text: '获取数据失败',
                        type: 'error',
                        direction: 'top'
                    });
                }).finally(() => {
                    this.trendListLoadingMore = false;
                    uni.stopPullDownRefresh();
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
                        events: {
                            onUpdated: () => {
                                this.getTrendData();
                            }
                        }
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
                    }).then(() => {
                        resolve();
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
            },
        },
        // 页面滑动触底事件
        onReachBottom() {
            this.utils.throttle(() => {
                if (this.trendListExistMore) {
                    this.getTrendData(false);
                }
            }, 1000);
        },
        watch: {
            trendListLoadingMore(nval) {
                if (nval) {
                    this.$refs.trendListLoadingMore.startLoading({
                        width: this.windowWidth - 30,
                        height: 54
                    });
                }
                else {
                    this.$refs.trendListLoadingMore.stopLoading();
                }
            },
        },
        onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            if ((this.topicName = this.utils.getCurrentPage().curParam.topic || null) !== null) {
                this.$refs.navigationBar.setNavigation({
                    titleText: this.topicName,
                    backgroundColor: '#fff'
                });
                this.getTrendData();
            }
            else {
                uni.navigateBack();
            }
        }
    }
</script>

<style lang="scss" scoped>
  @import 'trendTopic';
</style>