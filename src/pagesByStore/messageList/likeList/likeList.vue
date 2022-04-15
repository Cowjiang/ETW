<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view
      class="like-list-container"
      :style="{minHeight: `calc(100vh - ${navigationHeight}px)`}">
      <view
        class="like-item"
        v-for="like in likeList"
        :key="like.id"
        @click="handleLikeEventClick(like)">
        <view class="info-container">
          <view class="avatar-container">
            <image
              class="avatar-image"
              :src="like.sourceInfo.avgPath"
              mode="aspectFill"/>
          </view>
          <view class="title-container">
            <view class="user-info">
              <text class="username">
                {{ like.sourceInfo.username }}
              </text>
              <text class="type">
                {{ like.targetType | formatTargetType }}
              </text>
            </view>
            <view class="date">
              {{ like.createdTime | formatTime }}
            </view>
          </view>
        </view>
        <view class="content-container">
          <view class="content">
            {{ like.targetType === 3 || like.targetType === 4 ? `${myUsername}：${like.eventMsg}` : like.eventMsg }}
          </view>
          <view
            class="image"
            v-if="like.eventImgUrl && like.targetType === 2">
            <image
              class="like-image"
              :src="like.eventImgUrl"
              mode="aspectFill"/>
          </view>
        </view>
      </view>
      <view class="no-more" v-if="likeList.length && !existMore">
        <text>没有更多了哦 ~</text>
      </view>
      <view class="no-more" v-if="likeList.length && existMore">
        <text>下拉加载更多</text>
      </view>
      <view class="no-result" v-else-if="!likeList.length && !existMore">
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
        name: "likeList",
        components: {
            navigationBar, toast, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                likeList: [], //点赞列表
                currentPage: 0, //当前分页页码
                existMore: true, //是否存在更多点赞记录
            }
        },
        methods: {
            /**
             * 获取收到的点赞列表
             * @param {Number} page 分页页码
             */
            getLikeList(page = 1) {
                getMessageList({
                    queryData: {
                        eventType: 1,
                        pageNumber: page,
                        pageSize: 15
                    }
                }).then(res => {
                    console.log(res.data)
                    if (res.data.records.length) {
                        //查询到动态记录
                        console.log(res.data)
                        this.likeList = page === 1 ? res.data.records : [...this.likeList, ...res.data.records];
                        this.currentPage += 1;
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
             * 点赞事件的点击事件
             * @param {Object} likeEvent 点赞事件对象
             */
            handleLikeEventClick(likeEvent) {
                if (likeEvent.targetType === 2) {
                    //点赞动态
                    uni.navigateTo({
                        url: `/pages/trending/subpages/trendDetail/trendDetail?id=${likeEvent.targetId}`
                    });
                }
                else if (likeEvent.targetType === 3) {
                    //点赞一级评论
                    uni.navigateTo({
                        url: `/pages/trending/subpages/trendDetail/trendDetail?id=${likeEvent.sourceId}`,
                        success: res => {
                            res.eventChannel.emit('eventInfo', {
                                eventType: 1, //点赞
                                targetType: 3, //点赞一级评论，
                                targetId: likeEvent.targetId //点赞的一级评论ID
                            });
                        }
                    });
                }
                else if (likeEvent.targetType === 4) {
                    //点击二级评论
                    uni.navigateTo({
                        url: `/pages/trending/subpages/trendDetail/trendDetail?id=${likeEvent.sourceId}`
                    });
                }
            },
        },
        computed: {
            myUsername: {
                get() {
                    return this.$store.state.userInfo ? this.$store.state.userInfo.username : '';
                }
            }
        },
        filters: {
            /**
             * 格式化目标类型
             * @param {Number} targetType 目标类型编号
             */
            formatTargetType(targetType) {
                const targetValue = {
                    1: '点赞了你的作品',
                    2: '点赞了你的动态',
                    3: '点赞了你的评论',
                    4: '点赞了你的回复'
                };
                return targetValue[targetType] ?? '';
            }
        },
        onReachBottom() {
            if (this.existMore) {
                this.getLikeList(this.currentPage + 1);
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '收到的赞',
                backgroundColor: '#ffffff'
            });
        },
        onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            this.getLikeList();
        }
    }
</script>

<style lang="scss" scoped>
  @import 'likeList';
</style>