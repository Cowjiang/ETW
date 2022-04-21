<style lang="scss">
  @import "uview-ui/index.scss";
  @import "common/css/icon/fontAwesome/css/fontawesome.css";
  @import "common/css/animate.css";
</style>

<script>
    import store from "@/common/js/store";

    export default {
        data() {
            return {}
        },
        method() {
        },
        computed: {
            // 未读消息的数量（存储在Vuex中的数据）
            unreadMessageCount() {
                return this.$store.state.unreadMessageCount;
            },
            // 是否为商家
            shopkeeper: {
                get() {
                    return this.$store.state.shopkeeper;
                }
            }
        },
        watch: {
            unreadMessageCount(nval) {
                if (nval > 0) {
                    uni.setTabBarBadge({
                        index: 1,
                        text: nval < 100 ? nval.toString() : '99+'
                    }); //设置底部导航栏消息页的未读上标
                }
                else {
                    uni.removeTabBarBadge({
                        index: 1
                    });
                }
            },
            // chatMessagesTotalUnread(nval) {
                // this.$store.commit('unreadMessageCount', nval);
            // },
            shopkeeper(nval) {
                uni.setStorage({
                    key: "shopkeeper",
                    data: nval
                });
            }
        },
        mounted() {
            const navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
            const systemInfo = uni.getSystemInfoSync(); //获取系统信息
            this.$store.commit('userInfo', uni.getStorageSync('userInfo'));
            this.$store.commit('shopkeeper', uni.getStorageSync('shopkeeper') ?? false);
            this.$store.commit('navigationHeight', navigationHeight);
            this.$store.commit('windowWidth', systemInfo.windowWidth);
            this.$store.commit('windowHeight', systemInfo.windowHeight);
            setTimeout(() => {
                const systemInfo = uni.getSystemInfoSync(); //获取系统信息
                this.$store.commit('windowWidth', systemInfo.windowWidth);
                this.$store.commit('windowHeight', systemInfo.windowHeight);
            }, 1000);
        }
    };
</script>