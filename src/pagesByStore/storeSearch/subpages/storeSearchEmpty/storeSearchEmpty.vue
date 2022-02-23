<template>
  <view
    class="store-search-empty-container animate__animated animate__fadeIn">
    <view
      class="search-history-container"
      v-if="showHistory">
      <view class="title-container">
        <text>
          搜索历史
        </text>
        <text
          @click="clearHistory">
          {{ searchHistoryList.length === 0 ? '' : `${showDelBtn ? '取消' : '清空'}` }}
        </text>
      </view>
      <view class="content-container">
        <view
          class="content"
          v-for="historyItem in searchHistoryList"
          :key="historyItem.id"
          @longpress="handleHistoryLongPress">
          <view
            class="content-text"
            :data-id="historyItem.id"
            @click="handleHistoryClick">
            {{ historyItem.content }}
          </view>
          <view
            class="close-btn"
            v-if="showDelBtn"
            :data-id="historyItem.id"
            @click="deleteSingleHistory">
            ×
          </view>
        </view>
        <view
          class="empty-content"
          v-if="searchHistoryList.length === 0">
          历史记录为空
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    export default {
        name: "storeSearchEmpty",
        props: {
            showHistory: {
                type: Boolean,
                default: true,
            },
        },
        data() {
            return {
                searchHistoryList: [], //搜索历史列表
                showDelBtn: false, //是否显示历史记录的删除按钮（×）
            }
        },
        methods: {
            // 初始化
            init() {
                wx.getStorage({
                    key: 'searchHistoryList',
                    success: res => {
                        this.historyFilter(res.data);
                    },
                    fail: () => {
                        this.historyFilter(null);
                    }
                });
            },
            /**
             * 搜索历史过滤器
             * @param {Array} historyList 搜索历史列表
             */
            historyFilter(historyList) {
                if (historyList ?? '') {
                    //历史记录不为空
                    this.searchHistoryList = historyList.filter(item => {
                        return !item.isDeleted;
                    }).slice(0, 6); //过滤掉已删除的历史，并取前六项
                    wx.setStorage({
                        key: 'searchHistoryList',
                        data: this.searchHistoryList
                    });
                }
                else {
                    this.searchHistoryList = [];
                }
            },
            // 清空搜索历史
            clearHistory() {
                if (this.showDelBtn) {
                    this.showDelBtn = false;
                }
                else {
                    if (this.searchHistoryList.length !== 0) {
                        wx.removeStorage({
                            key: 'searchHistoryList',
                            success: res => {
                                this.searchHistoryList = [];
                            }
                        });
                    }
                }
            },
            /**
             * 新增搜索历史
             * @param {String} searchValue 搜索字符串
             */
            addHistory(searchValue) {
                if(searchValue.replace(/\s*/g, "") !== '') {
                    let searchHistoryList = [];
                    wx.getStorage({
                        key: 'searchHistoryList',
                        success: res => {
                            searchHistoryList = res.data;
                            searchHistoryList.forEach((item, index) => {
                                if (item.content === searchValue) {
                                    searchHistoryList.splice(index, 1);
                                }
                            });
                            searchHistoryList.unshift({
                                id: Date.parse(Date()),
                                content: searchValue,
                                isDeleted: false
                            });
                            wx.setStorage({
                                key: 'searchHistoryList',
                                data: searchHistoryList
                            });
                        },
                        fail: () => {
                            searchHistoryList = [];
                            searchHistoryList.unshift({
                                id: Date.parse(Date()),
                                content: searchValue,
                                isDeleted: false
                            });
                            wx.setStorage({
                                key: 'searchHistoryList',
                                data: searchHistoryList
                            });
                        },
                        complete: () => {
                            this.init();
                        }
                    });
                }
            },
            // 搜索输入框聚焦事件
            handleSearchInputFocus() {
                this.showDelBtn = false;
            },
            // 搜索历史长按事件
            handleHistoryLongPress() {
                this.showDelBtn = true;
            },
            // 删除单条历史记录
            deleteSingleHistory(e) {
                this.searchHistoryList.find((item, index) => {
                    if (item.id === e.currentTarget.dataset.id) {
                        this.searchHistoryList.splice(index, 1);
                        return item;
                    }
                });
                wx.setStorage({
                    key: 'searchHistoryList',
                    data: this.searchHistoryList
                });
                this.init();
            },
            // 历史记录点击事件
            handleHistoryClick(e) {
                const searchValue = this.searchHistoryList.find(item => {
                    return item.id === e.currentTarget.dataset.id;
                }).content;
                this.$emit('historyClick', searchValue);
            },
        },
        mounted() {
            this.init();
        }
    }
</script>

<style lang="scss" scoped>
  @import 'storeSearchEmpty';
</style>