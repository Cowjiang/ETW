<template>
  <view class="container">
    <!-- 一张图片 -->
    <view v-if="getLength === 1" class="one-image-box">
      <image
        :src="imageDataList[0].imgUrl"
        @tap="previewImage(0)"
        mode="aspectFill"/>
    </view>
    <!-- 两张或四张图片 -->
    <view
      v-else-if="getLength === 2 || getLength === 4"
      class="two-four-image-box">
      <image
        v-for="(item, index) in imageDataList"
        :key="index"
        :src="item.imgUrl"
        mode="aspectFill"
        @tap="previewImage(index)"/>
    </view>
    <!-- 其他张数 -->
    <view v-else class="other-image-box">
      <image
        v-for="(item, index) in imageDataList"
        :key="index"
        :src="item.imgUrl"
        mode="aspectFill"
        @tap="previewImage(index)"/>
    </view>
  </view>
</template>

<script>
    export default {
        name: "trendsImageGroup",
        props: {
            imageDataList: Array, //图片信息对象
        },
        data() {
            return {};
        },
        computed: {
            // 获取图片列表长度
            getLength: function () {
                return this.imageDataList.length;
            },
        },
        methods: {
            //预览图片
            previewImage(index) {
                let previewImageList = [];
                let imageDataList = this.imageDataList;
                for (const key in imageDataList) {
                    if (Object.hasOwnProperty.call(imageDataList, key)) {
                        const imgUrl = imageDataList[key].imgUrl;
                        previewImageList.push(imgUrl);
                    }
                }
                uni.previewImage({
                    current: index,
                    urls: previewImageList,
                    // longPressActions: {
                    //   itemList: ['发送给朋友', '保存图片', '收藏'],
                    //   success: function(data) {
                    //     console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
                    //   },
                    //   fail: function(err) {
                    //     console.log(err.errMsg);
                    //   }
                    // }
                });
            },
        },
    };
</script>

<style lang="scss" scoped>
  @import 'trendsImageGroup';
</style>
