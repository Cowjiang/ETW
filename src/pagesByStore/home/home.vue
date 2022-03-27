<template>
    <view>
        <view>
            <!-- 骨架屏组件 -->
            <workSkeleton v-if="loading"></workSkeleton>
            <!-- 作品瀑布流组件 -->
            <workWater :flowList="workList"></workWater>
        </view>
        <view>
            <!-- 导航栏 -->
            <navigationBar ref="navigationBar"></navigationBar>
            <view :style="{marginTop: `${navigationBarHeight}px`}">
                <tabs
                    :list="list"
                    :is-scroll="false"
                    :current="current"
                    @change="change"
                ></tabs>
                <!-- 骨架屏组件 -->
                <workSkeleton v-if="loading"></workSkeleton>
                <!-- 作品瀑布流组件 -->
                <workWater :flowList="workList"></workWater>
                <!-- 加载更多组件 -->
                <u-loadmore bg-color="rgb(240, 240, 240)" :status="loadStatus"></u-loadmore>
            </view>
        </view>
    </view>
</template>

<script>
    import {getWorkList} from "../../common/js/api/models.js";
    import {navigationBar} from '../../components/navigationBar/navigationBar.vue';

    export default {
        components: {
            navigationBar
        },
        data() {
            return {
                navigationBarHeight: 0,
                list: [
                    {
                        name: "选项1",
                    },
                    {
                        name: "选项2",
                    },
                    {
                        name: "选项3",
                    },
                ],
                current: 0,
                loadStatus: "loadmore", //加载更多加载状态
                loading: true, //骨架屏加载状态
                workList: [], //作品列表
            };
        },
        onLoad() {
            let that = this;
            getWorkList()
                .then((res) => {
                    that.workList = res.data;
                    that.loading = false;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        onReachBottom() {
            this.loadStatus = "loading";
            this.loadWorkList();
        },
        methods: {
            //加载作品列表
            loadWorkList() {
                setTimeout(() => {
                    let that = this;
                    getWorkList()
                        .then((res) => {
                            that.workList.push.apply(that.workList, res.data);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                    this.loadStatus = "loadmore";
                }, 2000);
            },
            change(index) {
                this.current = index;
                console.log(this.current);
            },
            getNavigationBarHeight() {
                this.navigationBarHeight = this.$refs['navigationBar'].getNavigationHeight();
                // return this.$refs['navigationBar'].setNavigation();
            }
        },
        current: 0,
        loading: true, //骨架屏加载状态
        workList: [], //作品列表
        mounted() {
            this.$refs['navigationBar'].setNavigation(false, false, '')
            this.getNavigationBarHeight()
            wx.navigateTo({
                url: '../login/login'
            })
        }
    }
</script>

<style>
    page {
        background-color: rgb(240, 240, 240);
    }
</style>
<style lang="scss" scoped></style>
