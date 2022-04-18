<template>
  <view>
    <navigationBar ref="navigationBar"/>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view
      class="comment-list-container"
      :style="{minHeight: `calc(100vh - ${navigationHeight}px)`}">
      <view
        class="comment-item"
        v-for="comment in commentList"
        :key="comment.id"
        @click="handleLikeEventClick(comment)">
        <view class="info-container">
          <view class="avatar-container">
            <image
              class="avatar-image"
              :src="comment.sourceInfo.avgPath"
              mode="aspectFill"/>
          </view>
          <view class="title-container">
            <view class="user-info">
              <text class="username">
                {{ comment.sourceInfo.username }}
              </text>
              <text class="type">
                {{ comment.targetType | formatTargetType }}
              </text>
            </view>
            <view class="date">
              {{ comment.createdTime | formatTime }}
            </view>
          </view>
        </view>
        <view class="content-container">
          {{ comment.eventMsg }}
        </view>
        <view class="source-container">
          <view class="content">
            {{ comment.targetType === 3 || comment.targetType === 4 ? `${myUsername}：${comment.sourceMsg}` : comment.sourceMsg }}
          </view>
          <view
            class="image"
            v-if="comment.eventImgUrl && comment.targetType === 3">
            <image
              class="like-image"
              :src="comment.eventImgUrl"
              mode="aspectFill"/>
          </view>
        </view>
      </view>
      <view class="no-more" v-if="commentList.length && !existMore">
        <text>没有更多了哦 ~</text>
      </view>
      <view class="no-more" v-if="commentList.length && existMore">
        <text>下拉加载更多</text>
      </view>
      <view class="no-result" v-else-if="!commentList.length && !existMore">
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
        name: "commentList",
        components: {
            navigationBar, toast, loading
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                commentList: [], //评论列表
                currentPage: 0, //当前分页页码
                existMore: true, //是否存在更多评论记录
            }
        },
        methods: {
            /**
             * 获取收到的评论列表
             * @param {Number} page 分页页码
             */
            getCommentList(page = 1) {
                getMessageList({
                    queryData: {
                        eventType: 2,
                        pageNumber: page,
                        pageSize: 15
                    }
                }).then(res => {
                    if (res.data.records.length) {
                        //查询到动态记录
                        console.log(res.data)
                        this.commentList = page === 1 ? res.data.records : [...this.commentList, ...res.data.records];
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
             * 评论事件的点击事件
             * @param {Object} commentEvent 评论事件对象
             */
            handleLikeEventClick(commentEvent) {
                if (commentEvent.targetType === 2 || commentEvent.targetType === 3) {
                    //评论动态、一级评论
                    uni.navigateTo({
                        url: `/pages/trending/subpages/trendDetail/trendDetail?id=${commentEvent.sourceId}`,
                        success: res => {
                            res.eventChannel.emit('eventInfo', {
                                eventType: 2, //评论
                                targetType: 3, //评论一级评论，
                                targetId: commentEvent.targetId //评论的一级评论ID
                            });
                        }
                    });
                }
                else if (commentEvent.targetType === 4) {
                    //评论二级评论
                    uni.navigateTo({
                        url: `/pages/trending/subpages/trendDetail/trendDetail?id=${commentEvent.sourceId}`,
                        success: res => {
                            res.eventChannel.emit('eventInfo', {
                                eventType: 2, //评论
                                targetType: 4, //评论二级评论，
                                targetId: commentEvent.targetId //评论的二级评论ID
                            });
                        }
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
                    2: '评论了你的动态',
                    4: '回复了你的评论'
                };
                return targetValue[targetType] ?? '';
            }
        },
        onReachBottom() {
            if (this.existMore) {
                this.getCommentList(this.currentPage + 1);
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '回复我的',
                backgroundColor: '#ffffff'
            });
        },
        onLoad() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            this.getCommentList();
        }
    }
</script>

<style lang="scss" scoped>
  @import 'commentList';
</style>