<template>
  <view>
    <navigationBar ref="navigationBar">
      <view
        :style="{
          width: `${submitTrendButtonWidth}px`,
          height: `${submitTrendButtonHeight}px`,
          lineHeight: `${submitTrendButtonHeight}px`,
        }"
        class="submitTrendButton"
        @click="toTrendFromPage"
      >
        <text class="fa fa-pencil fa-fw" />
        发布
      </view>
    </navigationBar>
    <loadRefresh
      ref="loadRefresh"
      :isRefresh="isLoading"
      refreshType="halfCircle"
      backgroundCover="#f4f5f6"
      :currentPage="currentPage"
      :totalNumber="totalPages"
      :pageSize="pageSize"
      @loadMore="loadTrendData(false)"
      @refresh="loadTrendData(true)"
    >
      <!-- <button class="postButton" @click="toTrendFromPage">
        <text>发布</text>
      </button> -->
      <!-- 常访问博主列表 -->
      <!-- <avatarScroll :infoList="authorlist"></avatarScroll> -->
      <!-- 动态列表 -->
      <trendList :trendList="trendList"></trendList>
    </loadRefresh>
  </view>
</template>

<script>
import { getAuthorList, getMyTrend } from "@/common/js/api/models.js";

export default {
  data() {
    return {
      submitTrendButtonWidth: 0,
      submitTrendButtonHeight: 0,
      authorlist: [], //常访问作者
      trendList: [], // 动态列表
      currentPage: 1, //当前页
      pageSize: 5, //每页多少条
      totalPages: 0, //总页数
      isLoading: false, //是否正在请求
    };
  },
  onLoad() {
    this.$refs.navigationBar.setNavigation({
      isShowButton: false,
      backgroundColor: "white",
    });
    this.submitTrendButtonWidth =
      this.$refs.navigationBar.navigationButtonWidth - 12;
    this.submitTrendButtonHeight = this.$refs.navigationBar.navigationBarHeight;
    // 获取常访问作者列表
    getAuthorList()
      .then((res) => {
        this.authorlist = res.data;
      })
      .catch((err) => {
        console.log("获取常访问作者列表", err);
      });
    this.loadTrendData(true);
  },
  methods: {
    //前往动态发布页面
    toTrendFromPage() {
      uni.navigateTo({
        url: "/pages/trending/subpages/trendPostPage",
      });
    },
    //获取动态数据
    loadTrendData(isRefresh) {
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
        })
          .then((res) => {
            if (res.success) {
              const data = res.data;
              this.totalPages = data.total; //获取总页数
              this.trendList = res.data.records;
            }
            this.$refs.loadRefresh.completed();
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            this.isLoading = false;
          });
        // 加载
      } else {
        // 请求下一页内容
        this.currentPage += 1;
        getMyTrend({
          queryData: {
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
          },
        })
          .then((res) => {
            const data = res.data;
            this.trendList = this.trendList.concat(data.records); //衔接上一页的内容
            this.$refs.loadRefresh.completed(); //结束加载过程
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.submitTrendButton {
  background: $uni-color-primary;
  color: white;
  text-align: center;
  border-radius: 30rpx;
  vertical-align: text-bottom;
}
</style>
