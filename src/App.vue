<style lang="scss">
  @import "uview-ui/index.scss";
  @import "common/css/icon/fontAwesome/css/fontawesome.css";
  @import "common/css/animate.css";
</style>

<script>
    export default {
        data() {
            return {}
        },
        async mounted() {
            const navigationHeight = this.utils.getNavigationHeight(); //获取导航栏高度
            const systemInfo = uni.getSystemInfoSync(); //获取系统信息
            this.$store.commit('navigationHeight', navigationHeight);
            this.$store.commit('windowWidth', systemInfo.windowWidth);
            this.$store.commit('windowHeight', systemInfo.windowHeight);
            uni.getStorage({
                key: 'userInfo',
                success: res => {
                    this.$store.commit('userInfo', res.data);
                }
            });
        },
    };
</script>
