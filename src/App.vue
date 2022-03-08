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
            const res = uni.getSystemInfoSync(); //获取系统信息
            this.$store.commit('navigationHeight', navigationHeight);
            this.$store.commit('windowWidth', res.windowWidth);
            this.$store.commit('windowHeight', res.windowHeight);
        },
    };
</script>
