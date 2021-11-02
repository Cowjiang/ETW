<template>
  <view
    class="store-search-result-container animate__animated animate__fadeIn"
    :style="{height: `${windowHeight - navigationHeight - 60}px`}">
    <view class="search-filter-container"></view>
    <view class="result-container">
      <scroll-view
        class="result-scroll-view"
        :scroll-y="true">
        <view
          class="store-container"
          v-for="store in storeSearchResult"
          :key="store.id"
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

      </scroll-view>
    </view>
  </view>
</template>

<script>
    import storeSearchResult from '../../common/js/fakeData/storeSearch.js';
    export default {
        name: "storeSearchResult",
        data() {
            return {
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                storeSearchResult: [], //店铺搜索结果
            }
        },
        methods: {
            toStoreMenu(e) {
                wx.navigateTo({
                    url: '/pagesByStore/storeMenu/storeMenu'
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
            this.storeSearchResult = storeSearchResult;
            wx.getSystemInfo({
                success: res => this.windowHeight = res.windowHeight
            }); //获取窗口尺寸
            this.navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
        },
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
                  height: rpx(30);
                  margin: 0 10rpx 8rpx 0;
                  padding: 0 rpx(8);
                  flex-shrink: 0;
                  font-size: rpx(20);
                  line-height: rpx(24);
                  background-color: #f4756b;
                  color: #fff;
                  //color: #f4756b;
                  border-radius: rpx(8);
                  border: rpx(2) solid #f4756b;
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
          padding-bottom: 100rpx;
        }
      }
    }
  }
</style>