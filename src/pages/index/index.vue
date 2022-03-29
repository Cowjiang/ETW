<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>

    <view class="index-container">
      <view class="page-btn-list">
        <view class="title">
          跳转页面
        </view>
        <view class="btn-list">
          <view
            class="btn"
            v-for="page in pages"
            :key="page.name"
            @click="goto(page)">
            {{ page.name }}
          </view>
        </view>
      </view>
      <view class="operation-btn-list">
        <view class="title">
          快捷操作
        </view>
        <view class="btn-list">
          <view
            class="btn"
            v-for="operation in operations"
            :key="operation.id"
            @click="operate(operation.id)">
            {{ operation.name }}
          </view>
        </view>
      </view>
      <view class="note-list">
        <view class="title">
          调试说明
        </view>
        <view class="notes">
          <view
            class="note"
            v-for="note in notes"
            :key="note">
            {{ note }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";
    import {logOut} from "@/common/js/api/models";

    /**
     * @description 调试面板
     * @property {String} title 页面标题
     * @property {Array} pages 快速跳转页面列表（name, url, data）
     * @property {Array} operations 快捷调试操作列表（id, name）
     * @property {Array} notes 调试说明列表
     */
    export default {
        name: "index",
        components: {
            toast, navigationBar
        },
        props: {
            title: {
                type: String,
                default: '食途 - 调试模式'
            },
            pages: {
                type: Array,
                default: [
                    {
                        name: '动态页',
                        url: '/pages/trending/trending',
                    },
                    {
                        name: '动态详情页',
                        url: '/pages/trending/subpages/trendDetail/trendDetail?id=81',
                    },
                    {
                        name: '发布动态',
                        url: '/pages/trending/subpages/trendEdit/trendEdit',
                    },
                    {
                        name: '消息页',
                        url: '/pages/chat/chatList',
                    },
                    {
                        name: '地址簿',
                        url: '/pagesByStore/addressBook/addressBook'
                    },
                    {
                        name: '店铺搜索页',
                        url: '/pages/storeSearch/storeSearch',
                    },
                    {
                        name: '我的订单',
                        url: '/pagesByStore/order/subpages/orderList/orderList'
                    },
                    {
                        name: '用户搜索',
                        url: '/pagesByStore/userSearch/userSearch'
                    },
                    {
                        name: '我的个人资料',
                        url: '/pagesByStore/myUserProfile/myUserProfile'
                    },
                    {
                        name: '用户主页',
                        url: '/pagesByStore/userPage/userPage?userId=35'
                    },
                ]
            },
            operations: {
                type: Array,
                default: [
                    {
                        id: 0,
                        name: '退出登录'
                    },
                    {
                        id: 1,
                        name: '清除缓存'
                    },
                    {
                        id: 2,
                        name: '私信测试'
                    }
                ]
            },
            notes: {
                type: Array,
                default: [
                    '1. 首次使用体验版，需点击右上角"···"，点击菜单中的"开发调试"，然后点击"开启调试"，重新进入小程序才可正常使用',
                    '2. 在dev编译模式下，可能会出现程序体积过大无法预览的问题（超出2M），使用build编译模式可减小程序体积',
                ]
            }
        },
        data() {
            return {}
        },
        methods: {
            /**
             * 跳转页面
             * @param {Object} page 页面信息
             */
            goto(page) {
                const pageName = page.name;
                const pageUrl = page.url;
                if (pageUrl === '' || !pageUrl) {
                    this.$refs.toast.show({
                        text: `「${pageName}」正在开发中`,
                        direction: 'top',
                        type: 'warning'
                    });
                }
                else if (!!page.data) {
                    uni.navigateTo({
                        url: pageUrl,
                        success: res => {
                            res.eventChannel.emit(Object.keys(page.data)[0], Object.values(page.data)[0])
                        },
                        fail: err => {
                            console.error(err);
                            this.$refs.toast.show({
                                text: `「${pageName}」路径错误`,
                                direction: 'top',
                                type: 'error'
                            });
                        }
                    });
                }
                else {
                    uni.switchTab({
                        url: pageUrl,
                        fail: () => {
                            uni.navigateTo({
                                url: pageUrl,
                                fail: err => {
                                    console.error(err);
                                    this.$refs.toast.show({
                                        text: `「${pageName}」路径错误`,
                                        direction: 'top',
                                        type: 'error'
                                    });
                                }
                            });
                        }
                    });
                }
            },
            /**
             * 执行快捷操作（自行添加）
             * @param {Number} id 快捷操作的id
             */
            async operate(id) {
                switch (id) {
                    case 0:
                        await this.utils.logout();
                        this.$refs.toast.show({
                            text: `已清除登陆状态`,
                            direction: 'top',
                            type: 'success'
                        });
                        break;
                    case 1:
                        uni.clearStorage();
                        this.$store.commit('userInfo', null);
                        this.$refs.toast.show({
                            text: `已清除缓存`,
                            direction: 'top',
                            type: 'success'
                        });
                        break;
                    case 2:
                        uni.navigateTo({
                            url: `/pages/chat/subpages/chatDetail/chatDetail?senderId=${35}`
                        });
                        break;
                    default:
                        this.$refs.toast.show({
                            text: `未设置指定操作`,
                            direction: 'top',
                            type: 'error'
                        });
                        break;
                }
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: this.title,
                backgroundColor: '#fff',
                isShowButton: false
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import 'index';
</style>