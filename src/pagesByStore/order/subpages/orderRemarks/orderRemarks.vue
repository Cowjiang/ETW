<template>
  <view>
    <navigationBar ref="navigationBar" class="navigation-bar"/>
    <toast ref="toast"/>

    <view class="order-remarks-container">
      <u-field
        v-model="remarksContent"
        label-width="0"
        :border-bottom="false"
        :clearable="false"
        maxlength="50"
        :field-style="fieldStyle"
        placeholder="口味、餐具要求···"
        type="textarea"/>
      <view
        class="confirm-btn"
        @click="confirm">
        完成
      </view>
    </view>
  </view>
</template>

<script>
    import toast from "@/components/toast/toast";
    import navigationBar from "@/components/navigationBar/navigationBar";

    export default {
        name: "orderRemarks",
        components: {
            toast, navigationBar
        },
        data() {
            return {
                remarksContent: '', //文本框的值
                fieldStyle: {
                    backgroundColor: '#f6f6f6',
                    borderRadius: '20rpx',
                    padding: '30rpx',
                    minHeight: '200rpx'
                }, //文本框样式
            }
        },
        methods: {
            confirm() {
                try {
                    const eventChannel = this.getOpenerEventChannel();
                    eventChannel.emit("acceptDataFromOpenedPage", {
                        orderRemarks: this.remarksContent
                    });
                    uni.navigateBack();
                } catch (e) {
                    // console.log(e);
                }
            }
        },
        onLoad() {
            try {
                const eventChannel = this.getOpenerEventChannel();
                eventChannel.on("acceptDataFromOpenerPage", data => {
                    this.remarksContent = data.orderRemarks;
                });
            } catch (e) {
                uni.navigateBack();
            }
        },
        mounted() {
            this.$refs.navigationBar.setNavigation({
                titleText: '订单备注',
                backgroundColor: '#fff'
            });
        }
    }
</script>

<style lang="scss" scoped>
  @import "orderRemarks";
</style>