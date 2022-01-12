<template>
  <view
    class="store-search-result-container animate__animated animate__fadeIn"
    :style="{ height: `${windowHeight - navigationHeight - 60}px` }"
  >
    <view class="search-filter-container"></view>
    <view class="result-container">
      <scroll-view
        class="result-scroll-view"
        :scroll-y="true"
        @scrolltolower="handleLoadMore"
      >
        <view
          class="store-container"
          v-for="store in storeSearchResult"
          :key="store.id"
          :data-storeid="store.id"
          @click="toStoreMenu"
        >
          <view class="info-container">
            <view class="img-container">
              <view class="image">
                <image
                  :src="store.imgUrl"
                  style="width: 100%; height: 100%"
                  mode="aspectFill"
                ></image>
              </view>
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
                  :inactive-color="`#ddd`"
                >
                </u-rate>
                <text :class="formatScore(store.score) === '暂无评分' ? 'score__grey' : 'score__default'">
                  {{ formatScore(store.score) }}
                </text>
                <text class="per-cost">{{ formatPerCost(store.perCost) }}</text>
                <text class="distance">{{ formatDistance(store.distance) }}</text>
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
                  }"
                >
                  {{ tag.content }}
                </view>
              </view>
            </view>
          </view>
          <view class="combo-container"></view>
        </view>
        <view
          class="load-more"
          v-show="existMore && !loadingMore && storeSearchResult.length !== 0"
        >
          <text>下拉加载更多</text>
        </view>
        <view
          class="load-more loading-more"
          v-show="loadingMore && storeSearchResult.length !== 0"
        >
          <loading ref="loadingMore"></loading>
        </view>
        <view class="load-more" v-show="!existMore && storeSearchResult.length !== 0">
          <text>没有更多了哦 ~</text>
        </view>
        <view class="no-result" v-show="!existMore && storeSearchResult.length === 0">
          <text>没有搜索到相关店铺</text>
        </view>
        <view class="safe-area"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
    import {loading} from "@/components/loading/loading.vue";
    import storeSearchResult from "@/common/js/fakeData/storeSearch.js";
    import {getSearchResult} from "@/common/js/api/models";

    export default {
        name: "storeSearchResult",
        components: {
            loading,
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
                searchKeyword: "", //搜索关键词
                storeSearchResult: [], //店铺搜索结果
                longitude: 0,
                latitude: 0,
            };
        },
        methods: {
            // 初始化
            init() {
                this.currentPage = 0;
                this.totalPage = 0;
                this.loadingMore = false;
                this.existMore = true;
                this.searchKeyword = "";
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
                    if (keyword === "必胜客") {
                        //测试用，后续删除
                        this.storeSearchResult = storeSearchResult;
                        this.loadingMore = false;
                        this.existMore = false;
                        setTimeout(() => {
                            resolve(storeSearchResult);
                        }, 0);
                    }
                    getSearchResult({
                        queryData: {
                            keywords: keyword,
                            pageSize: this.pageSize,
                            pageNumber: this.currentPage + 1,
                            longitude: this.longitude === 0 ? null : this.longitude,
                            latitude: this.latitude === 0 ? null : this.latitude,
                        },
                        headerData: {"Content-type": "application/json"},
                    })
                        .then(res => {
                            if (res.success) {
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
                                }, 0);
                            }
                        })
                        .catch((err) => {
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
                const storeInfo = this.storeSearchResult.find(
                    (store) => store.id === e.currentTarget.dataset.storeid
                );
                wx.navigateTo({
                    url: "/pagesByStore/storeMenu/storeMenu",
                    success: (res) => {
                        res.eventChannel.emit("storeInfo", {
                            storeInfo: storeInfo,
                        });
                    },
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
                    return "暂无评分";
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
                    return `￥${perCostNumber}/人`;
                }
                else {
                    return "";
                }
            },
            formatDistance(distance) {
                if (distance === undefined) {
                    return "未知";
                }
                else if (distance < 1000) {
                    return Math.round(distance) + " m";
                }
                else if (distance > 1000) {
                    return (distance / 1000.0).toFixed(1) + "km";
                }
            },
        },
        watch: {
            loadingMore(nval, oval) {
                if (nval && !oval && this.storeSearchResult.length !== 0) {
                    this.$refs.loadingMore.startLoading({
                        width: this.windowWidth - 40,
                        height: 54,
                    });
                }
                if (!nval && oval) {
                    this.$refs.loadingMore.stopLoading();
                }
            },
        },
        mounted() {
            uni.getLocation({
                type: "wgs84",
                success: res => {
                    this.longitude = res.longitude;
                    this.latitude = res.latitude;
                },
                fail: err => {
                    console.error(err);
                },
            });
            wx.getSystemInfo({
                success: res => {
                    this.windowWidth = res.windowWidth;
                    this.windowHeight = res.windowHeight;
                },
            }); //获取窗口尺寸
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
        },
    };
</script>

<style lang="scss" scoped>
  @import 'storeSearchResult';
</style>
