<template>
  <view class="container">
    <!-- 一张图片 -->
    <view v-if="getLength === 1" class="one-image-box">
      <image
        :src="imageDataList[0].imgUrl"
        @tap="previewImage(0)"
        @longpress="handleLongPress(item.imgUrl)"
        mode="aspectFill"
        :lazy-load="true"/>
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
        @tap="previewImage(index)"
        @longpress="handleLongPress(item.imgUrl)"
        :lazy-load="true"/>
    </view>
    <!-- 其他张数 -->
    <view v-else class="other-image-box">
      <image
        v-for="(item, index) in imageDataList"
        :key="index"
        :src="item.imgUrl"
        mode="aspectFill"
        @tap="previewImage(index)"
        @longpress="handleLongPress(item.imgUrl)"
        :lazy-load="true"/>
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
                        const imgUrl = imageDataList[key].imgUrl.replace('?x-oss-process=image/resize,w_400/quality,q_80', '');
                        previewImageList.push(imgUrl);
                    }
                }
                uni.previewImage({
                    current: index,
                    urls: previewImageList
                });
            },
            /**
             * 图片长按事件
             * @param {String} imgUrl 图片地址
             */
            handleLongPress(imgUrl) {
                uni.vibrateShort();
                uni.showActionSheet({
                    itemList: ['查看原图', '保存到手机'],
                    success: res => {
                        if (res.tapIndex === 0) {
                            uni.previewImage({
                                urls: [imgUrl.replace('?x-oss-process=image/resize,w_400/quality,q_80', '')],
                            });
                        }
                        else if (res.tapIndex === 1) {
                            uni.downloadFile({
                                url: imgUrl.replace('?x-oss-process=image/resize,w_400/quality,q_80', '?x-oss-process=image/resize,w_2000/quality,q_80'),
                                success: (res) => {
                                    if (res.statusCode === 200) {
                                        uni.saveImageToPhotosAlbum({
                                            filePath: res.tempFilePath,
                                            success: function () {
                                                uni.showToast({
                                                    title: "保存成功",
                                                    icon: "none"
                                                });
                                            },
                                            fail: function () {
                                                uni.showToast({
                                                    title: "保存失败",
                                                    icon: "none"
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                })
            }
        },
    };
</script>

<style lang="scss" scoped>
  @import 'trendsImageGroup';
</style>
