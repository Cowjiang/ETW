<style lang="scss">
    //uview
    @import "uview-ui/index.scss";
    //font-awesome
    @import "./common/css/icon/font-awesome.css";
</style>

<style>
    @import "common/css/animate.css";
</style>

<script>
    export default {
        data() {
            return {
                URL: '123'
            }
        },
        onLaunch: function () {
            console.log("App Launch");
        },
        onShow: function () {
            console.log("App Show");
        },
        onHide: function () {
            console.log("App Hide");
        },
    };
</script>
