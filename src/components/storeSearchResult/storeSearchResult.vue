<template>
  <view
    class="store-search-result-container animate__animated animate__fadeIn"
    :style="{height: `${windowHeight - navigationHeight - 60}px`}">
    <view class="search-filter-container"></view>
    <view class="result-container">
      <scroll-view
        class="result-scroll-view"
        :scroll-y="true"
        @scrolltolower="handleLoadMore">
        <view
          class="store-container"
          v-for="store in storeSearchResult"
          :key="store.id"
          :data-storeid="store.id"
          @click="toStoreMenu">
          <view class="info-container">
            <view class="img-container">
              <view class="image"></view>
            </view>
            <view class="info">
              <view class="name">
                <text>{{ store.name }}</text>
                <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
              </view>
              <view class="score-container">
                <u-rate
                  class="u-rate"
                  :current="store.score"
                  :disabled="true"
                  :size="22"
                  :gutter="0"
                  :active-color="`#f4756b`"
                  :inactive-icon="`star-fill`"
                  :inactive-color="`#ddd`">
                </u-rate>
                <text
                  :class="formatScore(store.score) === '暂无评分' ? 'score__grey' : 'score__default'">
                  {{ formatScore(store.score) }}
                </text>
                <text class="per-cost">{{ formatPerCost(store.perCost) }}</text>
                <text class="distance">2.7KM</text>
              </view>
              <view class="description">
                {{ store.characteristic }}
              </view>
              <view class="tags">
                <view
                  class="tag"
                  v-for="tag in store.tags"
                  :key="tag.id"
                  :style="{
                    backgroundColor: tag.backgroundColor,
                    borderColor: tag.borderColor,
                    color: tag.color
                  }">
                  {{ tag.content }}
                </view>
              </view>
            </view>
          </view>
          <view class="combo-container"></view>
        </view>
        <view
          class="load-more"
          v-show="existMore && !loadingMore && storeSearchResult.length !== 0">
          <text>下拉加载更多</text>
        </view>
        <view
          class="load-more loading-more"
          v-show="loadingMore && storeSearchResult.length !== 0">
          <loading ref="loadingMore"></loading>
        </view>
        <view
          class="load-more"
          v-show="!existMore && storeSearchResult.length !== 0">
          <text>没有更多了哦 ~</text>
        </view>
        <view class="safe-area"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
    import {loading} from '../../components/loading/loading.vue';
    import storeSearchResult from '../../common/js/fakeData/storeSearch.js';
    import {getSearchResult} from "@/common/js/api/models";

    export default {
        name: "storeSearchResult",
        components: {
            loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                pageSize: 5, //分页大小
                currentPage: 0, //当前页码
                totalPage: 0, //总页数
                loadingMore: false, //正在加载更多搜索结果
                existMore: true, //是否存在更多搜索结果
                searchKeyword: '', //搜索关键词
                storeSearchResult: [], //店铺搜索结果
            }
        },
        methods: {
            // 初始化
            init() {
                this.currentPage = 0;
                this.totalPage = 0;
                this.loadingMore = false;
                this.existMore = true;
                this.searchKeyword = '';
                this.storeSearchResult = [];
            },
            /**
             * 执行搜索操作
             * @param keyword {String} 搜索关键词
             * @return {Promise}
             */
            doSearch(keyword) {
                return new Promise((resolve, reject) => {
                    this.searchKeyword = keyword;
                    if (keyword === '必胜客') {
                        //测试用，后续删除
                        this.storeSearchResult = storeSearchResult;
                        this.loadingMore = false;
                        this.existMore = false;
                        setTimeout(() => {
                            resolve(storeSearchResult);
                        }, 1000)
                    }
                    getSearchResult({
                        queryData: {
                            keywords: keyword,
                            pageSize: this.pageSize,
                            pageNumber: this.currentPage + 1,
                        },
                        headerData: { "Content-type": "application/json" },
                    }).then(res => {
                        if (res.success) {
                            console.log(res.data)
                            this.loadingMore = false;
                            if (res.data.records.length !== 0) {
                                //当前查询的结果数量不为0
                                res.data.records.forEach(store => {
                                    this.storeSearchResult.push(store);
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
                            setTimeout(() => {
                                resolve(res.data);
                            }, 1000)
                        }
                    }).catch(err => {
                        reject(err);
                    });
                });
            },
            // 下滑加载更多
            handleLoadMore() {
                this.utils.throttle(() => {
                    if (!this.loadingMore && this.existMore) {
                        this.loadingMore = true;
                        this.doSearch(this.searchKeyword);
                    }
                }, 1000);
            },
            // 跳转店铺菜单页
            toStoreMenu(e) {
                const storeInfo = this.storeSearchResult.find(store => store.id === e.currentTarget.dataset.storeid);
                wx.navigateTo({
                    url: '/pagesByStore/storeMenu/storeMenu',
                    success: res => {
                        res.eventChannel.emit('storeInfo', {
                            storeInfo: storeInfo
                        });
                    }
                });
            },
            /**
             * 格式化店铺评分显示
             * @param score {Number | String} 店铺评分
             * @return {String} 格式化后的店铺评分
             */
            formatScore(score) {
                let scoreNumber = Number(score);
                if (scoreNumber > 0 && scoreNumber <= 5) {
                    return `${scoreNumber}分`;
                }
                else {
                    return '暂无评分';
                }
            },
            /**
             * 格式化人均消费显示
             * @param perCost {Number | String} 人均消费
             * @return {String} 格式化后的人均消费
             */
            formatPerCost(perCost) {
                let perCostNumber = Number(perCost);
                if (!isNaN(perCost) && perCost > 0) {
                    return `￥${perCostNumber}/人`
                }
                else {
                    return '';
                }
            }
        },
        mounted() {
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                }
            }); //获取窗口尺寸
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
        },
        watch: {
            loadingMore(nval, oval) {
                if (nval && !oval && this.storeSearchResult.length !== 0) {
                    this.$refs.loadingMore.startLoading({
                        width: this.windowWidth - 40,
                        height: 54
                    });
                }
                if (!nval && oval) {
                    this.$refs.loadingMore.stopLoading();
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
  .store-search-result-container {
    width: 100vw;
    height: 100%;
    padding: 20rpx 40rpx 0 40rpx;
    --animate-duration: 500ms;

    .search-filter-container {
      width: 100%;
      height: fit-content;
      display: none;
    }

    .result-container {
      width: 100%;
      height: 100%;

      .result-scroll-view {
        width: 100%;
        height: 100%;

        ::-webkit-scrollbar {
          width: 0;
          height: 0;
          color: transparent;
        }

        .store-container {
          width: 100%;
          height: fit-content;
          padding: 24rpx 0;

          .info-container {
            width: 100%;
            height: fit-content;
            display: flex;
            flex-direction: row;

            .img-container {
              width: 21vw;
              height: fit-content;
              flex-shrink: 0;

              .image {
                width: 100%;
                height: 21vw;
                background-color: #f6f6f6;
                border-radius: 20rpx;
              }
            }

            .info {
              width: 100%;
              height: fit-content;
              padding: 0 0 20rpx 20rpx;

              .name {
                display: flex;
                flex-direction: row;
                font-size: 30rpx;
                color: #000;
                line-height: 48rpx;

                text:first-child {
                  max-width: calc(100vw - 21vw - 120rpx);
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                }

                .fa-ellipsis-v {
                  margin-left: auto;
                  color: #eee;
                  line-height: 48rpx;
                }
              }

              .score-container {
                display: flex;
                flex-direction: row;
                font-size: 24rpx;
                line-height: 48rpx;
                color: #555;

                .u-rate {
                  margin-right: 10rpx;
                }

                .score__default {
                  color: #f4756b;
                }

                .score__grey {
                  color: #888;
                }

                .per-cost {
                  margin-left: 20rpx;
                }

                .distance {
                  margin-left: auto;
                }
              }

              .description {
                max-width: calc(100vw - 21vw - 100rpx);
                font-size: 22rpx;
                line-height: 40rpx;
                color: #555;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
              }

              .tags {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                margin-top: 10rpx;

                .tag {
                  width: fit-content;
                  height: 30rpx;
                  margin: 0 10rpx 8rpx 0;
                  padding: 0 8rpx;
                  flex-shrink: 0;
                  font-size: 20rpx;
                  line-height: 24rpx;
                  background-color: #f4756b;
                  color: #fff;
                  //color: #f4756b;
                  border-radius: 8rpx;
                  border: 2rpx solid #f4756b;
                }
              }
            }
          }

          .combo-container {
            width: 100%;
            height: fit-content;
          }
        }

        .store-container:first-child {
          padding-top: 0;
        }

        .store-container:last-child {
          padding-bottom: 0;
        }

        .load-more {
          height: fit-content;
          width: 100%;
          margin-top: 30rpx;
          padding-bottom: 70rpx;
          background-color: #fff;
          border-radius: 30rpx;
          color: $uni-text-color-placeholder;
          font-size: 26rpx;
          text-align: center;

          text {
            margin-left: 10rpx;
          }
        }

        .loading-more {
          height: 150rpx;
          padding-bottom: 0;
          margin-top: 0;
        }

        .safe-area {
          width: 100%;
          height: 0;
          height: calc(constant(safe-area-inset-bottom));
          height: calc(env(safe-area-inset-bottom));
        }
      }
    }
  }
</style>