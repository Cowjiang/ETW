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
    import {toast} from "@/components/toast/toast.vue";
    import {navigationBar} from "@/components/navigationBar/navigationBar.vue";

    export default {
        name: "index",
        components: {
            toast, navigationBar
        },
        data() {
            return {
                pages: [
                    {
                        name: '首页',
                        url: '',
                    },
                    {
                        name: '店铺搜索页',
                        url: '/pagesByStore/storeSearch/storeSearch',
                    },
                    {
                        name: '发布动态',
                        url: '/pages/trending/subpages/trendPostPage',
                    },
                    {
                        name: '消息页',
                        url: '/pages/chatList/chatList',
                    },
                    {
                        name: '地址簿',
                        url: '/pages/addressBook/addressBook'
                    },
                    {
                        name: '我的订单',
                        url: '/pagesByStore/order/subpages/orderList'
                    },
                ], //快速跳转页面列表（自行添加）
                operations: [
                    {
                        id: 0,
                        name: '清除登陆状态'
                    },
                    {
                        id: 1,
                        name: '清除缓存'
                    },
                    {
                        id: 2,
                        name: '订单详情页（调试）'
                    }
                ], //快捷调试操作列表（自行添加）
                notes: [
                    '1. 首次使用体验版，需点击右上角"···"，点击菜单中的"开发调试"，然后点击"开启调试"，重新进入小程序才可正常使用',
                    '2. 在dev编译模式下，可能会出现程序体积过大无法预览的问题（超出2M），使用build编译模式不会出现该问题'
                ], //调试说明列表（自行添加）
            }
        },
        methods: {
            /**
             * 跳转页面
             * @param page {Object} 页面信息
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
                else {
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
            },
            /**
             * 执行快捷操作（自行添加）
             * @param id {Number} 快捷操作的id
             */
            operate(id) {
                switch (id) {
                    case 0:
                        uni.removeStorage({
                            key: 'cookie',
                            success: res => {
                                this.$refs.toast.show({
                                    text: `已清除登陆状态`,
                                    direction: 'top',
                                    type: 'success'
                                });
                            }
                        });
                        break;
                    case 1:
                        uni.clearStorage();
                        this.$refs.toast.show({
                            text: `已清除缓存`,
                            direction: 'top',
                            type: 'success'
                        });
                        break;
                    case 2:
                        uni.navigateTo({
                            url: '/pagesByStore/order/subpages/orderDetail/orderDetail',
                            success: res => {
                                res.eventChannel.emit("acceptDataFromOpenerPage", {
                                    orderId: 'daace2d45399de104776342f3a6eedef',
                                });
                            },
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
                titleText: '食途 - 调试模式',
                backgroundColor: '#fff',
                isShowButton: false
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import 'index';
</style>