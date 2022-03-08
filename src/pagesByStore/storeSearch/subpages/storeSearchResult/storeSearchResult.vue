<template>
  <view
    class="store-search-result-container animate__animated animate__fadeIn"
    :style="{ height: `${windowHeight - navigationHeight - 60}px` }">
    <view class="search-filter-container">
      <!-- 搜索过滤器区域 -->
    </view>
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
              <view class="image">
                <image
                  :src="store.imgUrl"
                  style="width: 100%; height: 100%"
                  mode="aspectFill"/>
              </view>
            </view>
            <view class="info">
              <view class="name">
                <text>{{ store.name }}</text>
                <i class="fas fa-ellipsis-v"/>
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
                  :inactive-color="`#ddd`"/>
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
          <loading ref="loadingMore"/>
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
    import loading from "@/components/loading/loading";
    import {searchStore} from "@/common/js/api/models";

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
                searchKeyword: "", //搜索关键词
                storeSearchResult: [], //店铺搜索结果
                longitude: 0, //经度
                latitude: 0, //纬度
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
             * @param {String} keyword 搜索关键词
             * @return {Promise}
             */
            doSearch(keyword) {
                return new Promise((resolve, reject) => {
                    this.searchKeyword = keyword;
                    searchStore({
                        queryData: {
                            keywords: keyword,
                            pageSize: this.pageSize,
                            pageNumber: this.currentPage + 1,
                            longitude: this.longitude === 0 ? null : this.longitude,
                            latitude: this.latitude === 0 ? null : this.latitude,
                        },
                        headerData: {"Content-type": "application/json"},
                    }).then(res => {
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
                    }).catch((err) => {
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
                    url: "/pagesByStore/storeMenu/storeMenu",
                    success: res => {
                        res.eventChannel.emit("storeInfo", {
                            storeInfo: storeInfo,
                        });
                    },
                });
            },
            /**
             * 格式化店铺评分显示
             * @param {Number|String} score 店铺评分
             * @return {String} 格式化后的店铺评分
             */
            formatScore(score) {
                const scoreNumber = Number(score);
                return scoreNumber > 0 && scoreNumber <= 5 ? `${scoreNumber}分` : '暂无评分';
            },
            /**
             * 格式化人均消费显示
             * @param {Number|String} perCost 人均消费
             * @return {String} 格式化后的人均消费
             */
            formatPerCost(perCost) {
                const perCostNumber = Number(perCost);
                return !isNaN(perCost) && perCost > 0 ? `￥${Math.ceil(perCostNumber / 100)}/人` : '';
            },
            // 格式化距离显示
            formatDistance(distance) {
                if (distance === undefined) {
                    return "";
                }
                else if (distance < 1000) {
                    return Math.round(distance) + "m";
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
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
        },
    };
</script>

<style lang="scss" scoped>
  @import 'storeSearchResult';
</style>
