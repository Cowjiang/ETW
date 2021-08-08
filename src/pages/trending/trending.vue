<template>
  <view>
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
      <button class="postButton" @click="toTrendFromPage">
        <text>发布</text>
      </button>
      <!-- 常访问博主列表 -->
      <avatarScroll :infoList="authorlist"></avatarScroll>
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
      authorlist: [], //常访问作者
      trendList: [], // 动态列表
      currentPage: 1, //当前页
      pageSize: 5, //每页多少条
      totalPages: 0, //总页数
      isLoading: false, //是否正在请求
    };
  },
  mounted() {
    // 获取常访问作者列表
    getAuthorList()
      .then((res) => {
        this.authorlist = res.data;
      })
      .catch((err) => {
        console.log("获取常访问作者列表", err);
      });
    this.loadTrendData(true);
    // 获取动态列表
    // getMyTrend({
    //   queryData: {
    //     pageNumber: this.currentPage,
    //     pageSize: this.pageSize,
    //   },
    // })
    //   .then((res) => {
    //     // that.trendList = res.data;
    //     console.log(res.data);
    //     if (res.success) {
    //       this.trendList = res.data.records;
    //     }
    //   })
    //   .catch((err) => {
    //     console.log("【getMyTrend】:", err);
    //   });
  },
  methods: {
    //前往动态发布页面
    toTrendFromPage() {
      uni.navigateTo({
        url: "./subpages/trendPostPage",
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

<style>
page {
  background-color: #f6f8fa;
}
</style>
<style lang="scss" scoped></style>
