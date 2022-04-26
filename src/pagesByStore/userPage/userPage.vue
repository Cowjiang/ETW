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
            <view class="navigation-menu" @click="handleMenuBtnClick">
              <i class="fas fa-bars"/>
            </view>
          </view>
        </view>
      </template>
    </navigationBar>
    <toast ref="toast"/>
    <loading ref="loading" fullscreen/>
    <loading ref="uploading" fullscreen maskColor="rgba(255, 255, 255, 0.8)"/>
    <selectArea ref="selectArea"/>

    <view class="user-page-container">
      <view class="cover-image-container">
        <image
          class="cover-image"
          :src="userInfo.coverUrl"
          :lazy-load="true"
          @click.stop="handleCoverImageClick(userInfo.coverUrl)"
          mode="aspectFill"/>
        <view
          class="cover-mask"
          v-if="userInfo.coverUrl"
          @click.stop="handleCoverImageClick(userInfo.coverUrl)"></view>
      </view>
      <view class="content-container">
        <view class="user-info-container">
          <view class="user-info__row">
            <view class="avatar-container">
              <image
                class="avatar-image"
                :src="userInfo.avgPath"
                :lazy-load="true"
                mode="aspectFill"
                @click="previewImage(userInfo.avgPath)"/>
            </view>
            <view class="focus" @click="gotoFriendList(1)">
              <view class="content">
                {{ userInfo.attentions || 0 }}
              </view>
              <view class="title">
                关注
              </view>
            </view>
            <view class="fans" @click="gotoFriendList(2)">
              <view class="content">
                {{ userInfo.fans || 0 }}
              </view>
              <view class="title">
                粉丝
              </view>
            </view>
            <view class="btn-group">
              <view
                class="focus-btn__default"
                :class="isFocused ? 'focus-btn__focused' : ''"
                v-if="!isMe"
                @click="handleFocus">
                {{ isFocused ? '已关注' : '关注' }}
              </view>
              <view
                class="chat-btn"
                @click="gotoChatDetail"
                v-if="!isMe">
                <i class="fas fa-comments"/>
              </view>
              <view
                class="edit-profile-btn"
                v-if="isMe"
                @click="handleMenuBtnClick">
                编辑资料
              </view>
            </view>
          </view>
          <view class="user-info__row">
            <view class="username">
              {{ userInfo.username || '' }}
            </view>
            <view class="gender">
              <view
                class="gender-gentleman"
                v-if="gender === 1">
                <i class="fa-solid fa-mars"/>
              </view>
              <view
                class="gender-lady"
                v-if="gender === 2">
                <i class="fa-solid fa-venus"/>
              </view>
            </view>
          </view>
          <view class="user-info__row">
            <view
              v-if="userInfo.signature"
              class="description">
              {{ userInfo.signature }}
            </view>
          </view>
          <view class="user-info__row">
            <view
              v-if="areaName"
              class="area-name">
              <i class="fas fa-location-dot"/>
              {{ areaName }}
            </view>
          </view>
        </view>
        <u-divider
          :margin-top="40"
          :margin-bottom="20"
          half-width="100%"
          :use-slot="false"/>
        <view
          class="main-content-container">
          <view class="u-tabs-container">
            <u-tabs
              class="u-tabs"
              :list="[{name: '动态'}, {name: '作品'}]"
              :is-scroll="false"
              :current="currentTab"
              active-color="#f4756b"
              :bar-height="8"
              @change="handleTabsChange"/>
          </view>
          <view
            v-show="currentTab === 0"
            class="trends-container">
            <view
              class="trend"
              v-for="trend in trendList"
              :key="trend.id"
              @click="gotoTrendDetail(trend.id)"
              @longpress="handleTrendLongPress(trend.id)">
              <view class="time-row">
                <view class="title">
                  <i class="far fa-comment"/>
                  发布动态
                </view>
                <view class="time">
                  {{ trend.createdTime | formatTime }}
                </view>
              </view>
              <view class="content-row">
                <view class="trend-content-container">
                  <view class="content-text">
                    {{ trend.content || '' }}
                  </view>
                  <view
                    v-if="trend.dynamicImages.length"
                    class="content-images">
                    <view
                      class="trend-image"
                      v-for="trendImage in trend.dynamicImages.slice(0, 5)"
                      :key="trendImage.id">
                      <image
                        :src="trendImage.imgUrl"
                        mode="aspectFill"
                        :lazy-load="true"/>
                    </view>
                    <view
                      v-if="trend.dynamicImages.length > 5"
                      class="trend-image">
                      <image
                        :src="trend.dynamicImages[6].imgUrl"
                        mode="aspectFill"
                        :lazy-load="true"/>
                      <view class="more-images">
                        +{{ trend.dynamicImages.length - 5 }}
                      </view>
                    </view>
                  </view>
                  <view class="content-info" v-if="trend.stat === 1 || trend.stat === 2">
                    <text>
                      {{ trend.likeNumber }}人点赞
                    </text>
                    <text>
                      {{ trend.commentNumber }}条评论
                    </text>
                  </view>
                  <view class="content-info" v-else>
                    <text :style="{color: trend.stat === -1 ? '#f4756b' : '#999'}">
                      {{ trend.stat === 0 ? '正在审核中' : '审核不通过' }}
                    </text>
                  </view>
                </view>
              </view>
            </view>
            <view class="no-more" v-if="trendList.length && !existMoreTrend">
              <text>没有更多了哦 ~</text>
            </view>
            <view class="no-more" v-if="trendList.length && existMoreTrend">
              <text>下拉加载更多</text>
            </view>
            <view class="no-result" v-else-if="!trendList.length && !existMoreTrend">
              <text>一条动态也没有哦 ~</text>
            </view>
          </view>
          <view
            v-show="currentTab === 1"
            class="trends-container">
            <view class="no-result">
              <text>一个作品也没有哦 ~</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 图片上传组件 -->
    <upload
      class="upload"
      ref="upload"
      :action="action"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :max-size="10485760"
      :max-count="1"
      :show-tips="true"
      :limitType="['png', 'jpg', 'jpeg']"
      @on-success="onUploadSuccess"
      @on-error="onUploadError"
      @on-oversize="onUploadOversize"/>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import loading from "@/components/loading/loading";
    import selectArea from "@/components/selectPopup/selectArea/selectArea";
    import upload from "@/components/upload/upload";
    import {
        addFriend,
        addToBlockList, deleteTrend,
        editMyProfile,
        getUploadSignature,
        getUserRelationships,
        getUserSimpleInfo,
        getUserTrendList,
        removeFriend,
        removeFromBlockList
    } from "@/common/js/api/models";

    export default {
        name: "userPage",
        components: {
            toast, navigationBar, loading, selectArea, upload
        },
        data() {
            return {
                windowWidth: 0, //窗口宽度
                windowHeight: 0, //窗口高度
                navigationHeight: 0, //导航栏高度
                navigationButtonWidth: 0, //导航栏胶囊按钮宽度
                navigationButtonHeight: 0, //导航栏胶囊按钮高度
                userId: '', //用户Id
                userInfo: {}, //用户的信息
                isBlocked: false, //是否已拉黑
                isFocused: false, //是否已关注
                currentTab: 0, //当前显示的标签栏序号
                trendList: [], //用户的动态列表
                currentTrendPage: 0, //当前动态列表的分页页码
                existMoreTrend: true, //是否存在更多动态
                coverVisible: true, //封面图片是否可见
                action: '', //图片上传Url
                fileList: [], //发送图片的队列
            }
        },
        methods: {
            // 获取用户信息
            async getUserInfo() {
                if (!!this.userId) {
                    const getUserSimpleInfoPromise = new Promise((resolve, reject) => {
                        getUserSimpleInfo({
                            urlParam: {
                                userId: this.userId,
                                extend: true
                            }
                        }).then(res => {
                            this.userInfo = res.data;
                            resolve();
                        }).catch(error => {
                            reject(error);
                        });
                    });
                    const getUserRelationshipsPromise = new Promise((resolve, reject) => {
                        getUserRelationships({
                            urlParam: {
                                userId: this.userId
                            }
                        }).then(res => {
                            this.isBlocked = res.data.isBlocked;
                            this.isFocused = res.data.isFriend;
                            resolve();
                        }).catch(err => {
                            reject(err);
                        });
                    });
                    await Promise.all([getUserSimpleInfoPromise, getUserRelationshipsPromise]).then(() => {
                        setTimeout(() => {
                            this.$refs.loading.stopLoading();
                        }, 300);
                    }).catch(error => {
                        console.error(error);
                    });
                }
            },
            // 获取用户的动态列表
            async getUserTrendList(page = 1) {
                if (!!this.userId) {
                    await getUserTrendList({
                        urlParam: {
                            userId: this.userId,
                        },
                        queryData: {
                            pageNumber: page,
                            pageSize: 6
                        }
                    }).then(res => {
                        if (res.data.records.length) {
                            //查询到动态记录
                            this.trendList = page === 1 ? res.data.records : [...this.trendList, ...res.data.records];
                            this.currentTrendPage += 1;
                        }
                        else {
                            this.existMoreTrend = false;
                        }
                    }).catch(error => {
                        console.error(error);
                        this.$refs.toast.show({
                            text: '获取动态失败',
                            type: 'error',
                            direction: 'top'
                        });
                    });
                }
            },
            // 切换菜单标签
            handleTabsChange(index) {
                this.currentTab = index;
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
                }); //返回上一页
            },
            /**
             * 全屏预览图片
             * @param {String} url 图片Url
             */
            previewImage(url) {
                uni.previewImage({
                    urls: [url]
                });
            },
            // 用户关注操作
            async handleFocus() {
                this.utils.throttle(async () => {
                    if (this.isFocused) {
                        //已关注
                        uni.showModal({
                            title: '确定取消关注吗？',
                            success: res => {
                                if (res.confirm) {
                                    removeFriend({
                                        urlParam: {
                                            userId: this.userInfo.userId
                                        }
                                    }).then(() => {
                                        this.isFocused = false;
                                    }).catch(err => {
                                        console.error(err);
                                        this.$refs.toast.show({
                                            text: '取消关注失败',
                                            type: 'error',
                                            direction: 'top'
                                        });
                                    });
                                }
                            }
                        });
                    }
                    else {
                        //未关注
                        await addFriend({
                            urlParam: {
                                userId: this.userInfo.userId
                            }
                        }).then(() => {
                            this.isFocused = true;
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
            // 用户拉黑操作
            async handleBlock() {
                if (this.isBlocked) {
                    //已拉黑
                    await removeFromBlockList({
                        urlParam: {
                            userId: this.userInfo.userId
                        }
                    }).then(() => {
                        this.isBlocked = false;
                    }).catch(err => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '移出黑名单失败',
                            type: 'error',
                            direction: 'top'
                        });
                    });
                }
                else {
                    //未拉黑
                    await addToBlockList({
                        urlParam: {
                            userId: this.userInfo.userId
                        }
                    }).then(() => {
                        this.isBlocked = true;
                    }).catch(err => {
                        console.error(err);
                        this.$refs.toast.show({
                            text: '加入黑名单失败',
                            type: 'error',
                            direction: 'top'
                        });
                    });
                }
            },
            // 导航栏菜单按钮点击事件
            handleMenuBtnClick() {
                this.utils.throttle(() => {
                    if (Number(this.userId) === this.$store.state.userInfo.userId) {
                        //当前登录用户
                        uni.showActionSheet({
                            itemList: ['更换封面图片', '修改我的资料', '退出登录'],
                            success: async res => {
                                if (res.tapIndex === 0) {
                                    //更换封面图片
                                    this.$refs.upload.selectFile();
                                }
                                else if (res.tapIndex === 1) {
                                    //修改我的资料
                                    uni.navigateTo({
                                        url: '/pagesByStore/myUserProfile/myUserProfile'
                                    });
                                }
                                else if (res.tapIndex === 2) {
                                    //退出登录
                                    await this.utils.logout();
                                    uni.switchTab({
                                        url: '/pages/myPage/myPage'
                                    });
                                }
                            }
                        });
                    }
                    else {
                        uni.showActionSheet({
                            itemList: [`${this.isBlocked ? '移出黑名单' : '加入黑名单'}`, '举报'],
                            success: res => {
                                if (res.tapIndex === 0) {
                                    //黑名单操作
                                    this.handleBlock();
                                }
                                else if (res.tapIndex === 1) {
                                    //举报操作
                                    this.$refs.toast.show({
                                        text: '举报成功',
                                        type: 'success',
                                        direction: 'top'
                                    });
                                }
                            }
                        });
                    }
                }, 500);
            },
            /**
             * 封面图片点击事件
             * @param {String} url 封面图片URL
             */
            handleCoverImageClick(url) {
                this.utils.throttle(() => {
                    if (url) {
                        this.previewImage(url);
                    }
                    else if (Number(this.userId) === this.$store.state.userInfo.userId) {
                        //当前登录用户
                        this.$refs.upload.selectFile();
                    }
                }, 500);
            },
            /**
             * 动态长按事件
             * @param {Number} trendId 动态ID
             */
            handleTrendLongPress(trendId) {
                if (Number(this.userId) === this.$store.state.userInfo.userId) {
                    //当前登录用户
                    uni.showActionSheet({
                        itemList: ['删除动态'],
                        itemColor: '#f4756b',
                        success: res => {
                            if (res.tapIndex === 0) {
                                this.deleteTrend(trendId);
                            }
                        }
                    });
                }
            },
            /**
             * 删除动态
             * @param {Number} trendId 动态ID
             */
            deleteTrend(trendId) {
                uni.showModal({
                    title: '确定删除此动态吗？',
                    success: res => {
                        if (res.confirm) {
                            deleteTrend({
                                urlParam: {
                                    trendId: trendId
                                }
                            }).then(() => {
                                this.$refs.toast.show({
                                    text: '删除成功',
                                    type: 'success',
                                    direction: 'top'
                                });
                                this.getUserTrendList();
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
            },
            /**
             * 跳转动态详情页
             * @param {Number|String} trendId 动态ID
             */
            gotoTrendDetail(trendId) {
                this.utils.throttle(() => {
                    uni.navigateTo({
                        url: `/pages/trending/subpages/trendDetail/trendDetail?id=${trendId}`,
                        fail: err => {
                            console.error(err);
                        }
                    });
                }, 1000);
            },
            // 跳转私信详情页
            gotoChatDetail() {
                this.utils.throttle(() => {
                    uni.navigateTo({
                        url: `/pages/chat/subpages/chatDetail/chatDetail?senderId=${this.userInfo.userId}`
                    });
                }, 1000);
            },
            /**
             * 跳转用户的关注/粉丝页
             * @param {Number} type 默认显示的类型，1:关注，2:粉丝
             */
            gotoFriendList(type) {
                this.utils.throttle(() => {
                    uni.navigateTo({
                        url: `/pagesByStore/userPage/subpages/friendList/friendList?type=${type}&userId=${this.userInfo.userId}`
                    });
                }, 1000);
            },
            // 上传图片前的钩子函数
            beforeUpload(index, list) {
                return new Promise((resolve, reject) => {
                    uni.compressImage({
                        src: list[0].url,
                        quality: 80,
                        success: res => {
                            const imageTempPath = res.tempFilePath;
                            const fileSuffix = imageTempPath.substr(imageTempPath.lastIndexOf("."));
                            getUploadSignature({urlParam: 'cover'}).then(res => {
                                const signData = res.data;
                                this.action = signData.host;
                                const key = `${signData.dir}${signData.uuid}${fileSuffix}`; //文件路径
                                this.$refs.upload.formData = {
                                    key: key,
                                    policy: signData.policy,
                                    OSSAccessKeyId: signData.accessId,
                                    success_action_status: "200",
                                    signature: signData.signature,
                                };
                                this.coverUploadUrl = `${signData.host}/${key}`;
                                this.$refs.uploading.startLoading();
                                resolve();
                            }).catch(err => {
                                this.$refs.upload.clear();
                                reject(err);
                            });
                        }
                    });
                });
            },
            // 头像上传成功回调事件
            onUploadSuccess() {
                editMyProfile({
                    queryData: {
                        userId: this.userId,
                        coverUrl: this.coverUploadUrl
                    }
                }).then(() => {
                    this.$set(this.userInfo, 'coverUrl', this.coverUploadUrl);
                    this.$refs.toast.show({
                        text: '修改成功',
                        type: 'success',
                        direction: 'top'
                    });
                }).catch(err => {
                    console.error(err);
                    this.$refs.toast.show({
                        text: '修改失败',
                        type: 'error',
                        direction: 'top'
                    });
                }).finally(() => {
                    this.$refs.uploading.stopLoading();
                    this.$refs.upload.clear();
                });
            },
            //头像上传失败回调事件
            onUploadError(e) {
                console.error(e);
                this.$refs.uploading.stopLoading();
                this.$refs.toast.show({
                    text: '上传失败',
                    type: 'error',
                    direction: 'top'
                });
            },
            //头像上传超出大小限制回调事件
            onUploadOversize() {
                this.$refs.uploading.stopLoading();
                this.$refs.toast.show({
                    text: '图片超出10MB限制',
                    type: 'warning',
                    direction: 'top'
                });
            }
        },
        computed: {
            // 用户性别
            gender() {
                return this.userInfo.gender || 0;
            },
            // 地区名称（根据地区编号查询）
            areaName: {
                get() {
                    if (!!this.userInfo.areaCode) {
                        const queryResult = this.$refs.selectArea.queryAreaName(this.userInfo.areaCode);
                        return queryResult ? `${queryResult[0].replace('省', '')}${queryResult[1].replace('市', '')}` : null;
                    }
                    else return null;
                }
            },
            // 是否为我的主页
            isMe() {
                const userInfo = this.$store.state.userInfo;
                if (this.userInfo.hasOwnProperty('userId') && !!userInfo) {
                    return userInfo.userId === this.userInfo.userId;
                }
            }
        },
        filters: {
            formatTrendStatus(status) {
                const statusList = {
                    '-1': '审核不通过'
                };
            }
        },
        onPageScroll(e) {
            if (e.scrollTop > this.windowHeight * 0.2 && this.coverVisible) {
                this.coverVisible = false;
                this.$refs.navigationBar.setNavigation({
                    titleText: `${this.userInfo.username}的个人主页`,
                    backgroundColor: '#fff'
                });
            }
            else if (e.scrollTop < this.windowHeight * 0.2 && !this.coverVisible) {
                this.coverVisible = true;
                this.$refs.navigationBar.setNavigation({
                    titleText: '',
                });
            }
        },
        onReachBottom() {
            if (this.currentTab === 0) {
                //当前显示的tab是动态列表
                if (this.existMoreTrend) {
                    this.getUserTrendList(this.currentTrendPage + 1);
                }
            }
        },
        async onLoad() {
            this.$refs.loading.startLoading();
            this.userId = this.utils.getCurrentPage().curParam.userId || null;
            const showType = this.utils.getCurrentPage().curParam.type || null;
            if (this.userId === 'undefined') {
                this.$refs.toast.show({
                    text: '获取个人信息失败',
                    type: 'error',
                    direction: 'top'
                });
                return;
            }
            if (!this.userId) {
                await uni.getStorage({
                    key: 'userInfo',
                    success: async res => {
                        this.userId = res.data.userId.toString();
                        await this.getUserInfo();
                        await this.getUserTrendList();
                        if (!!showType) {
                            this.currentTab = Number(showType);
                            setTimeout(() => {
                                uni.pageScrollTo({
                                    selector: `.main-content-container`
                                });
                            }, 500);
                        }
                    },
                    fail: () => {
                        const currentPage = this.utils.getCurrentPage();
                        this.$store.commit('currentPageUrl', currentPage.curFullUrl);
                        uni.redirectTo({
                            url: `/pages/login/wxLogin`
                        });
                    }
                });
            }
            else {
                await this.getUserInfo();
                await this.getUserTrendList();
                if (!!showType) {
                    this.currentTab = Number(showType);
                    setTimeout(() => {
                        uni.pageScrollTo({
                            selector: `.main-content-container`
                        });
                    }, 500);
                }
            }
        },
        mounted() {
            this.windowWidth = this.$store.state.windowWidth;
            this.windowHeight = this.$store.state.windowHeight;
            this.navigationHeight = this.$store.state.navigationHeight;
            this.navigationButtonWidth = this.$refs.navigationBar.navigationButtonWidth;
            this.navigationButtonHeight = this.$refs.navigationBar.navigationBarHeight;
            this.$refs.navigationBar.setNavigation({
                titleText: '',
            });
        },
        onShareAppMessage() {
            return {
                title: `分享${this.userInfo.username}的个人主页`,
                path: `/${this.utils.getCurrentPage().curUrl}?userId=${this.userId}`
            }
        }
    }
</script>

<style lang="scss" scoped>
  @import "userPage";
</style>