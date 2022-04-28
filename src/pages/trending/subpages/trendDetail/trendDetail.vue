<template>
  <view>
    <navigationBar ref="navigationBar">
      <template v-slot:button>
        <view
          class="navigation-menu-button"
          :style="{width: `${navigationButtonWidth}px`}">
          <view
            class="navigation-menu-button-content"
            :style="{
              height: `${0.54 * navigationButtonHeight}px`,
              margin: `${0.23 * navigationButtonHeight}px 0`,
            }">
            <view class="navigation-back" @click="navigateBack">
              <i class="fas fa-angle-left"/>
            </view>
            <view class="navigation-menu" @click="moreAction(0, trendDetail)">
              <i class="fas fa-bars"/>
            </view>
          </view>
        </view>
      </template>
    </navigationBar>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>

    <view class="trend-detail-container" v-if="readyToShow">
      <view class="trend-content">
        <view class="user-info-container">
          <view class="avatar-container" @click="gotoUserPage(trendDetail.userId)">
            <image :src="trendDetail.userInfo.avgPath" mode="aspectFill"/>
          </view>
          <view class="user-container">
            <view
              class="username"
              @click="gotoUserPage(trendDetail.userId)">
              {{ trendDetail.userInfo.username || ''}}
            </view>
            <view class="post-time">{{ trendDetail.createdTime | formatTime }}</view>
          </view>
          <view
            class="focus-btn-container"
            v-if="!isMyTrend">
            <view
              class="focus-btn__default"
              :class="isFriend ? 'focus-btn__focused' : ''"
              @click="handleFocusBtnClick">
              {{ isFriend ? '已关注' : '关注' }}
            </view>
          </view>
        </view>
        <view
          class="content-container"
          @longpress="moreAction(0, trendDetail)">
          <u-read-more
            text-indent="0"
            color="#808080"
            close-text="展开"
            :toggle="true">
            {{ trendDetail.content || '' }}
          </u-read-more>
        </view>
        <view class="image-container">
          <trendsImageGroup
            v-if="trendDetail.dynamicImages.length !== 0"
            :imageDataList="trendDetail.dynamicImages"/>
        </view>
        <view class="tags-container">
          <view
            class="topic"
            v-if="trendDetail.topic"
            @click.stop="handleTopicClick(trendDetail.topic)">
            #{{ trendDetail.topic }}
          </view>
          <view class="like-number">
            点赞 {{ trendDetail.likeNumber || 0 }}
          </view>
          <view
            class="position-tag"
            v-if="trendDetail.areaInfo"
            @click="showOnMap">
            <i class="fas fa-location-dot"/>
            {{ trendDetail.areaInfo.areaName }}
          </view>
        </view>
      </view>
      <view class="trend-comment">
        <view class="comment-title">
          全部评论({{ commentTotalCount }})
        </view>
        <view
          class="comment-item-container"
          v-for="comment in commentList"
          :key="comment.id"
          :id="`comment${comment.id}`"
          @click="handleCommentClick(comment)">
          <view class="user-info">
            <view class="avatar-container" @click.stop="gotoUserPage(comment.userId)">
              <image :src="comment.userInfo.avgPath" mode="aspectFill"/>
            </view>
            <view class="user-container">
              <view class="username" @click.stop="gotoUserPage(comment.userId)">{{ comment.userInfo.username }}</view>
              <view class="post-time">{{ comment.createdTime | formatTime }}</view>
            </view>
            <view
              class="current-comment-container"
              v-if="currentTopCommentId === comment.id">
              当前评论
            </view>
          </view>
          <view class="content-container">
            {{ comment.content || '' }}
          </view>
          <view class="comment-btn-container">
            <view
              class="comment-btn"
              @click.stop="handleCommentLikeClick(null, comment)">
              <i
                class="fa-thumbs-up"
                :class="comment.isLike ? 'fas liked' : 'far'"/>
              <text>{{ comment.likeNumber }}</text>
            </view>
            <view class="comment-btn">
              <i class="far fa-comment"/>
              <text>{{ comment.commentNumber }}</text>
            </view>
            <view class="comment-btn">
              <i
                class="fas fa-ellipsis"
                @click.stop="moreAction(1, comment, trendDetail)"/>
            </view>
          </view>
          <view
            class="comment-child-container"
            v-if="comment.secondComment"
            @click.stop>
            <view
              class="comment-child"
              v-for="commentChild in comment.commentChildList"
              :key="commentChild.id"
              @click="handleCommentClick(comment, commentChild.scUserInfo, commentChild.id)">
              <view class="user-info-container" @click.stop="gotoUserPage(commentChild.scUserInfo.id)">
                <view class="avatar">
                  <image :src="commentChild.scUserInfo.avgPath" mode="aspectFill"/>
                </view>
                <view class="username">{{ commentChild.scUserInfo.username }}</view>
                <view
                  class="operation-btn"
                  @click.stop="moreAction(2, commentChild, comment)">
                  <i class="fas fa-ellipsis"/>
                </view>
              </view>
              <view class="comment-content-container">
                <span
                  class="comment-parent-username"
                  v-if="commentChild.toUserInfo">
                  @{{ commentChild.toUserInfo.username }}
                </span>
                {{ commentChild.content || '' }}
              </view>
              <view
                class="comment-btn-container"
                @click.stop="handleCommentLikeClick(null, null, commentChild)">
                <i
                  class="fa-thumbs-up"
                  :class="commentChild.isLike ? 'fas liked' : 'far'"/>
                <text class="like-number">
                  {{ commentChild.likeNumber }}
                </text>
                <text class="time">
                  {{ commentChild.createdTime | formatTime }}
                </text>
              </view>
            </view>
            <view
              class="load-more-container"
              v-if="comment.commentNumber > 1 && comment.existMoreCommentChild"
              @click="handleGetMoreCommentChild(comment)">
              查看更多评论
            </view>
          </view>
        </view>
        <view
          class="comment-empty"
          v-if="commentList.length === 0">
          评论区空空如也~
        </view>
      </view>
      <view
        class="input-area"
        :style="{transform: `translateY(-${keyboardHeight}px)`}">
        <!-- 输入框左侧按钮容器 -->
        <view
          class="more-btn-container"
          :style="{transform: `translateX(${inputFocusStatus ? '-230': '0'}rpx)`}">
          <i
            class="fa-thumbs-up"
            :class="trendDetail.isLike ? 'fas liked' : 'far'"
            @click="handleCommentLikeClick(trendDetail)"/>
          <button open-type="share" plain>
            <i class="fas fa-share"/>
          </button>
          <i
            class="far fa-comment"
            :style="{opacity: `${!inputFocusStatus ? '1': '0'}`}"
            @click="handleTrendCommentBtnClick"/>
          <i
            class="fas fa-chevron-right"
            :style="{opacity: `${inputFocusStatus ? '1': '0'}`}"/>
        </view>
        <!-- 底部输入框容器 -->
        <view
          class="input-container"
          :style="{transform: `translateX(${inputFocusStatus ? '-200': '-36'}rpx)`}">
          <view
            class="input-inner-container"
            @click="showRawInput"
            :style="{
              width: `${inputFocusStatus ? 'calc(100vw - 210rpx)' : 'calc(100vw - 370rpx)'}`,
              flexDirection: `${inputFocusStatus ? 'column' : 'row'}`
            }">
            <view
              class="comment-reply-placeholder"
              v-if="currentCommentType === 1">
              @{{ currentCommentInfo.userName }}
            </view>
            <textarea
              class="raw-input"
              v-model="rawInputValue"
              v-if="inputFocusStatus"
              :focus="inputFocusStatus"
              :adjust-position="false"
              :clearable="false"
              height="40rpx"
              auto-height
              :auto-blur="true"
              @focus=""
              @blur="handleInputBlur"
              @input="handleInputKeyChange"
              @confirm="sendComment"
              :confirm-hold="true"
              confirm-type="send"
              @keyboardheightchange="handleKeyboardHeightChange"/>
            <view
              class="show-input"
              v-if="!inputFocusStatus">
              {{ rawInputValue }}
            </view>
            <view
              class="show-input show-input__placeholder"
              v-if="showPlaceholder">
              快来评论一下~
            </view>
          </view>
        </view>
        <!-- 输入框右侧发送按钮容器 -->
        <view
          class="send-btn-container"
          @click="sendComment"
          :style="{opacity: `${isSendReady ? '1': '0.5'}`}">
          <i class="fas fa-paper-plane"/>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import navigationBar from "@/components/navigationBar/navigationBar";
    import toast from "@/components/toast/toast";
    import loading from "@/components/loading/loading";
    import trendsImageGroup from "@/components/trendsImageGroup/trendsImageGroup";
    import {
        addFriend,
        deleteTrend,
        deleteTrendComment,
        deleteTrendSecondComment,
        getOneTrendComment,
        getOneTrendSecondComment,
        getTrendComment,
        getTrendDetail,
        getTrendSecondComment,
        getUserRelationships,
        like,
        postTrendComment,
        postTrendSecondComment,
        removeFriend
    } from "@/common/js/api/models";

    export default {
        name: "trendDetail",
        components: {
            navigationBar, toast, loading, trendsImageGroup
        },
        data() {
            return {
                navigationHeight: 0, //导航栏高度
                navigationButtonWidth: 0, //导航栏胶囊按钮宽度
                navigationButtonHeight: 0, //导航栏胶囊按钮高度
                readyToShow: false, //是否加载数据完成允许显示
                isFriend: false, //与动态作者是否为好友
                trendId: '', //动态ID
                trendDetail: {}, //动态详情信息
                currentTopCommentId: null, //当前置顶的评论id
                commentList: [], //评论列表
                commentTotalCount: 0, //评论总数
                commentPageSize: 10, //评论的分页大小
                currentCommentPage: 1, //当前评论页码
                existMoreComment: true, //是否存在更多评论
                loadingMoreComment: false, //是否正在加载更多评论
                rawInputValue: '', //评论输入框的数据
                rawInputOldValue: '', //评论输入框的旧数据（用于比对）
                inputFocusStatus: false, //输入框聚焦状态
                isSendReady: false, //输入框文字验证状态
                keyboardHeight: 0, //弹起键盘的高度
                currentCommentType: 0, //当前评论类型，0:动态评论，1:二级评论
                currentCommentInfo: {}, //二级评论时，当前选择回复的父评论信息
                commentChildPageSize: 10, //二级评论的分页大小
                loadingMoreCommentChild: false, //是否正在加载更多二级评论
            }
        },
        methods: {
            // 获取动态详情数据
            async getTrendDetail() {
                await getTrendDetail({
                    urlParam: {
                        trendId: this.trendId
                    }
                }).then(res => {
                    res.data.dynamicWithImages.dynamicImages.forEach(image => {
                        image.imgUrl = `${image.imgUrl}?x-oss-process=image/resize,w_800/quality,q_90#${Math.random()}`;
                    });
                    this.trendDetail = res.data.dynamicWithImages;
                    const topicStartIndex = this.trendDetail.content.indexOf('#');
                    const topicEndIndex = this.trendDetail.content.indexOf(' ');
                    if (topicStartIndex === 0 && topicEndIndex !== -1) {
                        //内容包含话题
                        this.trendDetail.topic = this.trendDetail.content.substring(topicStartIndex + 1, topicEndIndex + 1);
                        this.trendDetail.content = this.trendDetail.content.substring(topicEndIndex + 1, this.trendDetail.content.length);
                    }
                    this.getUserRelationships();
                }).catch(err => {
                    if (err.data.errorMsg === '动态不存在') {
                        this.$refs.toast.show({
                            text: '动态已被删除',
                            type: 'error',
                            direction: 'top',
                            showDuration: 99999999
                        });
                    }
                    else {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '获取动态详情失败',
                            type: 'error',
                            direction: 'top'
                        });
                    }
                });
            },
            // 获取动态评论
            async getTrendComment() {
                await getTrendComment({
                    urlParam: this.trendId,
                    queryData: {
                        pageNumber: this.currentCommentPage,
                        pageSize: this.commentPageSize,
                    }
                }).then(res => {
                    this.loadingMoreComment = false;
                    if (res.data.records.length) {
                        let commentList = res.data.records;
                        commentList.forEach(comment => {
                            if (!this.commentList.find(commentItem => commentItem.id === comment.id)) {
                                //评论列表没有重复的评论
                                if (comment.secondComment) {
                                    comment.commentChildList = [];
                                    comment.commentChildList.push(comment.secondComment);
                                    comment.currentCommentChildPage = 0; //当前二级评论的页码
                                    comment.existMoreCommentChild = true; //是否存在更多二级评论
                                }
                                this.commentList.push(comment);
                            }
                        });
                        this.commentTotalCount = res.data.total;
                        if (commentList.length < this.commentPageSize) {
                            this.existMoreComment = false;
                        }
                    }
                    else {
                        this.existMoreComment = false;
                    }
                }).catch(err => {
                    this.loadingMoreComment = false;
                    console.error(err);
                });
            },
            /**
             * 加载更多二级评论
             * @param {Object} commentParent 一级评论
             */
            getMoreCommentChild(commentParent) {
                getTrendSecondComment({
                    urlParam: commentParent.id,
                    queryData: {
                        pageSize: this.commentChildPageSize,
                        pageNumber: commentParent.currentCommentChildPage
                    }
                }).then(res => {
                    this.loadingMoreCommentChild = false;
                    let commentChildList = res.data.records;
                    commentChildList.forEach(commentChild => {
                        if (!commentParent.commentChildList.find(commentItem => commentItem.id === commentChild.id)) {
                            commentParent.commentChildList.push(commentChild);
                        }
                    });
                    if (commentChildList.length < this.commentChildPageSize) {
                        commentParent.existMoreCommentChild = false;
                    }
                }).catch(err => {
                    this.loadingMoreCommentChild = false;
                    console.error(err);
                    this.$refs.toast.show({
                        text: '加载失败',
                        type: 'error',
                        direction: 'top'
                    })
                })
            },
            // 获取与作者的好友关系
            getUserRelationships() {
                getUserRelationships({
                    urlParam: {
                        userId: this.trendDetail.userId
                    }
                }).then(res => {
                    this.isFriend = res.data.isFriend;
                }).catch(err => {
                    console.error(err);
                });
            },
            /**
             * 获取置顶的评论（用于显示点赞/回复的跳转高亮显示）
             * @param {Object} eventInfo 触发高亮显示的事件信息（从页面跳转传入）
             */
            getTopComment(eventInfo) {
                if (eventInfo.eventType === 1 || eventInfo.eventType === 2) {
                    //事件类型为点赞
                    if (eventInfo.targetType === 3) {
                        //点赞一级评论
                        getOneTrendComment({
                            urlParam: {
                                trendId: this.trendId,
                                commentId: eventInfo.targetId
                            }
                        }).then(res => {
                            this.currentTopCommentId = res.data.id;
                            this.commentList = this.commentList.filter(comment => comment.id !== res.data.id);
                            res.data.commentChildList = [];
                            if (!!res.data.secondComment) {
                                res.data.commentChildList.push(res.data.secondComment);
                            }
                            res.data.currentCommentChildPage = 0;
                            res.data.existMoreCommentChild = true;
                            this.commentList.unshift(res.data);
                            setTimeout(() => {
                                uni.pageScrollTo({
                                    selector: `.tags-container`
                                });
                            }, 500);
                        }).catch(err => {
                            console.error(err);
                        });
                    }
                    else if (eventInfo.targetType === 4) {
                        //点赞二级评论
                        getOneTrendSecondComment({
                            urlParam: {
                                secondCommentId: eventInfo.targetId
                            }
                        }).then(res => {
                            this.currentTopCommentId = res.data.id;
                            this.commentList = this.commentList.filter(comment => comment.id !== res.data.id);
                            res.data.commentChildList = [];
                            res.data.commentChildList.push(res.data.secondComment);
                            res.data.currentCommentChildPage = 0;
                            res.data.existMoreCommentChild = true;
                            this.commentList.unshift(res.data);
                            setTimeout(() => {
                                uni.pageScrollTo({
                                    selector: `.tags-container`
                                });
                            }, 500);
                        }).catch(err => {
                            console.error(err);
                        });
                    }
                }
            },
            // 在地图中显示位置
            showOnMap() {
                uni.openLocation({
                    latitude: this.trendDetail.areaInfo.latitude,
                    longitude: this.trendDetail.areaInfo.longitude,
                    scale: 18,
                    name: this.trendDetail.areaInfo.areaName,
                    fail: err => {
                        console.error(err);
                    }
                });
            },
            // 显示消息输入框
            showRawInput() {
                this.inputFocusStatus = true;
            },
            // 监听输入框失焦事件
            handleInputBlur() {
                this.inputFocusStatus = false;
                this.keyboardHeight = 0;
            },
            // 监听键盘弹起高度改变事件
            handleKeyboardHeightChange(e) {
                if (e.detail.height !== 0) {
                    this.keyboardHeight = e.detail.height;
                }
                this.$forceUpdate();
            },
            // 评论输入框键值改变事件
            handleInputKeyChange(e) {
                if (e.detail.keyCode === 8 && e.detail.value === this.rawInputOldValue) {
                    this.handleTrendCommentBtnClick();
                }
            },
            // 动态评论按钮点击事件
            handleTrendCommentBtnClick() {
                this.currentCommentType = 0;
                this.currentCommentInfo = {};
                this.rawInputValue = '';
                this.inputFocusStatus = true;
            },
            // 发送评论
            sendComment() {
                this.utils.throttle(() => {
                    if (this.rawInputValue.replace(/\s*/g, "") !== '') {
                        //评论内容不为空
                        if (this.currentCommentType === 0) {
                            //当前评论类型为动态评论
                            postTrendComment({
                                urlParam: this.trendId,
                                queryData: {
                                    content: this.rawInputValue
                                }
                            }).then(res => {
                                this.$refs.toast.show({
                                    text: '评论成功',
                                    type: 'success',
                                    direction: 'top'
                                });
                                this.rawInputValue = '';
                                this.commentTotalCount += 1;
                                uni.getStorage({
                                    key: 'userInfo',
                                    success: userInfo => {
                                        this.commentList.unshift({
                                            id: res.data.id,
                                            content: res.data.content,
                                            createdTime: res.data.createdTime,
                                            likeNumber: 0,
                                            commentNumber: 0,
                                            userInfo: {
                                                id: userInfo.data.userId,
                                                username: userInfo.data.username,
                                                avgPath: userInfo.data.avgPath
                                            }
                                        });
                                    }
                                });
                            }).catch(err => {
                                console.error(err);
                                this.$refs.toast.show({
                                    text: '评论发送失败',
                                    type: 'error',
                                    direction: 'top'
                                });
                            });
                        }
                        else {
                            //当前评论类型为二级评论
                            let queryData = {
                                content: this.rawInputValue,
                            };
                            if (this.currentCommentInfo.toUserId !== null) {
                                //当前为回复二级评论
                                queryData.toUserId = this.currentCommentInfo.toUserId;
                                queryData.replyId = this.currentCommentInfo.replyCommentId;
                            }
                            postTrendSecondComment({
                                urlParam: {
                                    trendId: this.trendId,
                                    commentId: this.currentCommentInfo.id
                                },
                                queryData: queryData
                            }).then(res => {
                                this.$refs.toast.show({
                                    text: '评论成功',
                                    type: 'success',
                                    direction: 'top'
                                });
                                let comment = this.commentList.find(comment => comment.id === this.currentCommentInfo.id);
                                this.rawInputValue = '';
                                this.currentCommentType = 0;
                                let toUserInfo = null;
                                if (this.currentCommentInfo.toUserId !== null) {
                                    toUserInfo = {
                                        id: this.currentCommentInfo.toUserId,
                                        username: this.currentCommentInfo.userName
                                    }
                                }
                                this.currentCommentInfo = {};
                                uni.getStorage({
                                    key: 'userInfo',
                                    success: userInfo => {
                                        const commentChild = {
                                            id: res.data.id,
                                            content: res.data.content,
                                            createdTime: res.data.createdTime,
                                            likeNumber: 0,
                                            scUserInfo: {
                                                id: userInfo.data.userId,
                                                username: userInfo.data.username,
                                                avgPath: userInfo.data.avgPath
                                            },
                                            toUserInfo: toUserInfo
                                        };
                                        if (comment.commentChildList === undefined) {
                                            comment.secondComment = commentChild;
                                            comment.commentChildList = [];
                                        }
                                        comment.commentChildList.push(commentChild);
                                        comment.commentNumber += 1;
                                        comment.secondComment = {};
                                        this.$forceUpdate();
                                    }
                                });
                            }).catch(err => {
                                console.error(err);
                                this.$refs.toast.show({
                                    text: '评论发送失败',
                                    type: 'error',
                                    direction: 'top'
                                });
                            });
                        }
                    }
                }, 1000);
            },
            /**
             * 评论点击事件
             * @param {Object} comment 评论对象
             * @param {Object|Null} replyUserInfo 回复二级评论时的目标用户（回复一级评论时为null）
             * @param {Number|Null} replayCommentId 回复二级评论时的目标评论ID
             */
            handleCommentClick(comment, replyUserInfo = null, replayCommentId = null) {
                if (!replyUserInfo) {
                    this.rawInputValue = '';
                    this.currentCommentType = 1;
                    this.currentCommentInfo = {
                        id: comment.id,
                        userName: comment.userInfo.username,
                        toUserId: null,
                        replyCommentId: null
                    };
                    this.inputFocusStatus = true;
                }
                else {
                    this.rawInputValue = '';
                    this.currentCommentType = 1;
                    this.currentCommentInfo = {
                        id: comment.id,
                        userName: replyUserInfo.username,
                        toUserId: replyUserInfo.id,
                        replyCommentId: replayCommentId
                    };
                    this.inputFocusStatus = true;
                }
            },
            /**
             * 评论点赞按钮点击事件
             * @param {Object|Null} trend 动态点赞时的动态对象，默认为空
             * @param {Object|Null} commentParent 一级评论时的评论对象，默认为空
             * @param {Object|Null} commentChild 二级评论时的评论对象，默认为空
             */
            handleCommentLikeClick(trend = null, commentParent = null, commentChild = null) {
                this.utils.throttle(() => {
                    if (trend) {
                        //动态点赞
                        this.changeLikeStatus(!this.trendDetail.isLike ? 1 : 2, this.trendId, 2).then(() => {
                            this.$set(this.trendDetail, 'isLike', !this.trendDetail.isLike);
                            this.$set(this.trendDetail, 'likeNumber', this.trendDetail.isLike ? this.trendDetail.likeNumber + 1 : this.trendDetail.likeNumber - 1);
                        }).catch(() => {
                        });
                    }
                    else if (commentParent) {
                        //一级评论点赞
                        this.changeLikeStatus(!commentParent.isLike ? 1 : 2, commentParent.id, 3).then(() => {
                            this.$set(commentParent, 'isLike', !commentParent.isLike);
                            this.$set(commentParent, 'likeNumber', commentParent.isLike ? commentParent.likeNumber + 1 : commentParent.likeNumber - 1);
                        }).catch(() => {
                        });
                    }
                    else {
                        //二级评论点赞
                        this.changeLikeStatus(!commentChild.isLike ? 1 : 2, commentChild.id, 4).then(() => {
                            this.$set(commentChild, 'isLike', !commentChild.isLike);
                            this.$set(commentChild, 'likeNumber', commentChild.isLike ? commentChild.likeNumber + 1 : commentChild.likeNumber - 1);
                            this.$forceUpdate();
                        }).catch(() => {
                        });
                    }
                }, 500);
            },
            /**
             * 改变点赞状态
             * @param {Number} actionType 点赞类型，1：点赞，2：取消
             * @param {Number} targetId 目标ID
             * @param {Number} targetType 点赞对象类型，1：作品，2：动态，3：评论，4：二级评论
             * @return {Promise}
             */
            changeLikeStatus(actionType, targetId, targetType) {
                return new Promise((resolve, reject) => {
                    like({
                        urlParam: targetId,
                        queryData: {
                            actionType: actionType,
                            targetType: targetType
                        }
                    }).then(() => {
                        resolve();
                    }).catch(err => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '点赞失败',
                            type: 'error',
                            direction: 'top'
                        });
                        reject(err);
                    });
                });
            },
            /**
             * 加载更多二级评论按钮点击事件
             * @param {Object} commentParent 一级评论
             */
            handleGetMoreCommentChild(commentParent) {
                this.utils.throttle(() => {
                    if (!this.loadingMoreCommentChild && commentParent.existMoreCommentChild) {
                        commentParent.currentCommentChildPage += 1;
                        this.loadingMoreCommentChild = true;
                        this.getMoreCommentChild(commentParent);
                    }
                }, 1000);
            },
            // 关注按钮点击事件
            handleFocusBtnClick() {
                this.utils.throttle(() => {
                    if (this.isFriend) {
                        removeFriend({
                            urlParam: {
                                userId: this.trendDetail.userId
                            }
                        }).then(() => {
                            this.isFriend = false;
                        }).catch(err => {
                            console.error(err);
                            this.$refs.toast.show({
                                text: '取消关注失败',
                                type: 'error',
                                direction: 'top'
                            });
                        });
                    }
                    else {
                        addFriend({
                            urlParam: {
                                userId: this.trendDetail.userId
                            }
                        }).then(() => {
                            this.isFriend = true;
                        }).catch(err => {
                            console.error(err);
                            this.$refs.toast.show({
                                text: '关注失败',
                                type: 'error',
                                direction: 'top'
                            });
                        });
                    }
                }, 1000);
            },
            /**
             * 动态长按/评论更多操作按钮点击事件
             * @param {Number} type 目标类型，0:动态，1:一级评论, 2:二级评论
             * @param {Object|Null} target 操作的目标
             * @param {Object|Null} parentTarget 目标类型为二级评论时，目标的父评论（一级评论）
             */
            moreAction(type = 0, target, parentTarget = null) {
                this.utils.throttle(() => {
                    const userInfo = this.$store.state.userInfo;
                    const isMe = userInfo.userId === (target.scUserInfo ? target.scUserInfo.id : target.userInfo.id);
                    if (type === 0) {
                        //动态
                        uni.vibrateShort();
                        uni.showActionSheet({
                            itemList: isMe ? ['复制内容', '删除动态'] : ['复制内容', '举报'],
                            success: res => {
                                if (res.tapIndex === 0) {
                                    uni.setClipboardData({
                                        data: target.content
                                    });
                                }
                                else {
                                    if (isMe) {
                                        uni.showModal({
                                            title: '确定删除此动态吗？',
                                            success: res => {
                                                if (res.confirm) {
                                                    deleteTrend({
                                                        urlParam: {
                                                            trendId: target.id
                                                        }
                                                    }).then(() => {
                                                        this.$refs.toast.show({
                                                            text: '删除成功',
                                                            type: 'success',
                                                            direction: 'top'
                                                        });
                                                        const eventChannel = this.getOpenerEventChannel();
                                                        eventChannel.emit("onUpdated", {});
                                                        setTimeout(() => {
                                                            this.navigateBack();
                                                        }, 1500);
                                                    }).catch(err => {
                                                        console.error(err);
                                                        this.$refs.toast.show({
                                                            text: '删除失败',
                                                            type: 'error',
                                                            direction: 'top'
                                                        });
                                                    })
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        this.$refs.toast.show({
                                            text: '举报成功',
                                            type: 'success',
                                            direction: 'top'
                                        });
                                    }
                                }
                            }
                        });
                    }
                    else {
                        uni.showActionSheet({
                            itemList: isMe ? ['复制内容', '删除'] : ['复制内容', '举报'],
                            success: res => {
                                if (res.tapIndex === 0) {
                                    uni.setClipboardData({
                                        data: target.content
                                    });
                                }
                                else {
                                    if (isMe) {
                                        uni.showModal({
                                            title: '确定删除此评论吗？',
                                            success: res => {
                                                if (res.confirm) {
                                                    switch (type) {
                                                        case 1:
                                                            //删除一级评论
                                                            deleteTrendComment({
                                                                urlParam: {
                                                                    trendId: parentTarget.id,
                                                                    commentId: target.id
                                                                }
                                                            }).then(() => {
                                                                this.$refs.toast.show({
                                                                    text: '删除成功',
                                                                    type: 'success',
                                                                    direction: 'top'
                                                                });
                                                                this.commentList.splice(this.commentList.findIndex(comment => comment.id === target.id), 1);
                                                                this.commentTotalCount -= 1;
                                                            }).catch(err => {
                                                                console.error(err);
                                                                this.$refs.toast.show({
                                                                    text: '删除失败',
                                                                    type: 'error',
                                                                    direction: 'top'
                                                                });
                                                            }).finally(() => {
                                                                this.currentCommentType = 0;
                                                                this.currentCommentInfo = {};
                                                                this.rawInputValue = '';
                                                                this.$forceUpdate();
                                                            });
                                                            break;
                                                        case 2:
                                                            //删除二级评论
                                                            deleteTrendSecondComment({
                                                                urlParam: {
                                                                    commentId: parentTarget.id,
                                                                    commentChildId: target.id
                                                                }
                                                            }).then(() => {
                                                                this.$refs.toast.show({
                                                                    text: '删除成功',
                                                                    type: 'success',
                                                                    direction: 'top'
                                                                });
                                                                parentTarget.commentChildList.splice(parentTarget.commentChildList.findIndex(comment => comment.id === target.id), 1);
                                                                parentTarget.commentNumber -= 1;
                                                                if (parentTarget.commentNumber === 0) {
                                                                    parentTarget.secondComment = null;
                                                                }
                                                            }).catch(err => {
                                                                console.error(err);
                                                                this.$refs.toast.show({
                                                                    text: '删除失败',
                                                                    type: 'error',
                                                                    direction: 'top'
                                                                });
                                                            }).finally(() => {
                                                                this.currentCommentType = 0;
                                                                this.currentCommentInfo = {};
                                                                this.rawInputValue = '';
                                                                this.$forceUpdate();
                                                            });
                                                            break;
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        this.$refs.toast.show({
                                            text: '举报成功',
                                            type: 'success',
                                            direction: 'top'
                                        });
                                    }
                                }
                            }
                        });
                    }
                }, 500);
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
            /**
             * 跳转话题动态
             * @param {String} topic 话题
             */
            handleTopicClick(topic) {
                uni.navigateTo({
                    url: `/pages/trending/subpages/trendTopic/trendTopic?topic=${topic}`
                });
            },
            // 返回上一级页面
            navigateBack() {
                uni.navigateBack({
                    fail: () => {
                        uni.switchTab({
                            url: `/pages/trending/trending`,
                            fail: () => {
                                uni.redirectTo({
                                    url: `/pages/trending/trending`,
                                    fail: err => {
                                        console.error(err);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
        computed: {
            // 是否是我发送的动态
            isMyTrend() {
                const userInfo = this.$store.state.userInfo;
                if (this.trendDetail.hasOwnProperty('userInfo') && !!userInfo) {
                    return userInfo.userId === this.trendDetail.userInfo.id;
                }
            },
            // 是否显示评论输入提示
            showPlaceholder() {
                return !this.isSendReady && !this.inputFocusStatus && this.currentCommentType === 0;
            }
        },
        watch: {
            // 消息原始输入框的值
            rawInputValue(nval) {
                this.isSendReady = nval.replace(/\s*/g, "") !== ''; //判断输入框中是否为空白内容
                this.rawInputOldValue = nval;
            },
        },
        onReachBottom() {
            this.utils.throttle(() => {
                if (!this.loadingMoreComment && this.existMoreComment) {
                    this.currentCommentPage += 1;
                    this.loadingMoreComment = true;
                    this.getTrendComment();
                }
            }, 1000);
        },
        async onLoad() {
            this.$refs.loading.startLoading();
            if ((this.trendId = this.utils.getCurrentPage().curParam.id || null) !== null) {
                await this.getTrendDetail();
                await this.getTrendComment();
                try {
                    const eventChannel = this.getOpenerEventChannel();
                    eventChannel.on("eventInfo", async data => {
                        this.getTopComment(data);
                    });
                } catch (e) {}
                if (this.trendDetail.hasOwnProperty('id')) {
                    this.readyToShow = true;
                    setTimeout(() => {
                        this.$refs.loading.stopLoading();
                    }, 300);
                }
            }
            else {
                uni.navigateBack();
            }
        },
        mounted() {
            this.navigationHeight = this.$store.state.navigationHeight;
            this.navigationButtonWidth = this.$refs.navigationBar.navigationButtonWidth;
            this.navigationButtonHeight = this.$refs.navigationBar.navigationBarHeight;
            this.$refs.navigationBar.setNavigation({
                titleText: '动态详情',
                backgroundColor: '#fff',
            });
        },
        onShareAppMessage() {
            return {
                title: `分享动态`,
                path: `${this.utils.getCurrentPage().curFullUrl}`
            }
        }
    }
</script>

<style lang="scss" scoped>
  @import "trendDetail";
</style>