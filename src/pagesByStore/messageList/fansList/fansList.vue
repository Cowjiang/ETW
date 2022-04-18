<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view
      class="fans-list-container"
      :style="{minHeight: `calc(100vh - ${navigationHeight}px)`}">
      <view
        class="fans-item"
        v-for="fans in fansList"
        :key="fans.id"
        @click="gotoUserPage(fans.sourceInfo.id)">
        <view class="info-container">
          <view class="avatar-container">
            <image
              class="avatar-image"
              :src="fans.sourceInfo.avgPath"
              mode="aspectFill"/>
          </view>
          <view class="title-container">
            <view class="user-info">
              <text class="username">
                {{ fans.sourceInfo.username }}
              </text>
              <text class="type">
                关注了你
              </text>
            </view>
            <view class="date">
              {{ fans.createdTime | formatTime }}
            </view>
          </view>
          <view class="btn-container">
            <view class="btn__default btn__friend">
              <text>查看</text>
            </view>
          </view>
        </view>
      </view>
      <view class="no-more" v-if="fansList.length && !existMore">
        <text>没有更多了哦 ~</text>
      </view>
      <view class="no-more" v-if="fansList.length && existMore">
        <text>下拉加载更多</text>
      </view>
      <view class="no-result" v-else-if="!fansList.length && !existMore">
        <text>一条记录也没有哦 ~</text>
      </view>
    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";
    import {getMessageList} from "@/common/js/api/models";

    export default {
        name: "fansList",
        components: {
            navigationBar, toast, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                fansList: [], //评论列表
                currentPage: 0, //当前分页页码
                existMore: true, //是否存在更多评论记录
            }
        },
        methods: {
            /**
             * 获取新增关注列表
             * @param {Number} page 分页页码
             */
            getFansList(page = 1) {
                getMessageList({
                    queryData: {
                        eventType: 4,
                        pageNumber: page,
                        pageSize: 15
                    }
                }).then(res => {
                    if (res.data.records.length) {
                        //查询到新增关注记录
                        this.fansList = page === 1 ? res.data.records : [...this.fansList, ...res.data.records];
                        this.currentPage += 1;
                        if (res.data.records.length < 15) {
                            this.existMore = false;
                        }
                    }
                    else {
                        this.existMore = false;
                    }
                }).catch(error => {
                    console.error(error);
                    this.$refs.toast.show({
                        text: '获取数据失败',
                        type: 'error',
                        direction: 'top'
                    });
                });
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
        },
        computed: {
            myUsername: {
                get() {
                    return this.$store.state.userInfo ? this.$store.state.userInfo.username : '';
                }
            }
        },
        onReachBottom() {
            if (this.existMore) {
                this.getFansList(this.currentPage + 1);
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '新增关注',
                backgroundColor: '#ffffff'
            });
        },
        onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            this.getFansList();
        }
    }
</script>

<style lang="scss" scoped>
  @import 'fansList';
</style>