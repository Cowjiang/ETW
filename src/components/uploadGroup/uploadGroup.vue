<template>
  <view class="container" id="container">
    <upload
      ref="upload"
      :action="action"
      :file-list="fileList"
      :auto-upload="false"
      :before-upload="beforeUpload"
      :max-size="10485760"
      :max-count="maxImageCount"
      :size-type="sizeType"
      :limitType="['png', 'jpg', 'jpeg']"
      :height="uploadItemWidth"
      @on-choose-complete="onChooseComplete"
      @on-success="onUploadSuccess"
      @on-uploaded="onUploaded"
      @on-error="onError"
      @on-remove="onRemove"
    ></upload>
  </view>
</template>

<script>
    import {getUploadSignature} from "@/common/js/api/models.js";

    export default {
        name: "uploadGroup",
        props: {
            width: {
                type: Number
            },
            maxImageCount: {
                type: Number,
                default: 9,
            },
            uploadImageDir: {
                type: String,
            },
            uploadId: {
                type: String,
            },
            sizeType: {
                type: Array,
                default: ["original", "compressed"],
            },
            fileList: {
                type: Array,
                default: [],
            },
        },
        data() {
            return {
                uploadItemWidth: 0,
                lists: [],
                imageSrc: "",
                action: "",
                formData: {},
                signData: {}, //获取签名的数据
                tempFinalSrc: {}, //
                imageList: [],
            };
        },
        methods: {
            /**
             * @description 单个文件上传成功后回调
             * @param list  上传文件列表
             */
            onChooseComplete(list) {
                this.$emit("onChooseComplete");
            },
            /**
             * @description 单个文件上传成功后回调
             * @param data 上传文件成功后的响应
             * @param listsIndex 上传文件信息列表下标
             * @param lists  上传文件信息列表
             */
            onUploadSuccess(data, listsIndex, lists) {
                this.imageList.push(this.tempFinalSrc);
                console.log(
                    // `下标【${listsIndex}】的图片上传成功，云端访问路径为：`,
                    this.tempFinalSrc
                );
            },
            /**
             * @description: 所有图片上传成功后的回调
             */
            onUploaded(lists) {
                // console.log("所有图片上传成功");
                this.$emit("onImageUploaded", this.imageList, this.uploadId);
            },
            /**
             * @description 上传文件前回调
             * @param listsIndex 上传文件信息列表下标
             * @param lists  上传文件信息列表
             */
            beforeUpload(listsIndex, lists) {
                console.log("上传前回调", listsIndex);
                return new Promise((resolve, reject) => {
                    const dir = this.uploadImageDir;
                    let tempPath = lists[listsIndex].file.path;
                    let fileSuffix = tempPath.substr(tempPath.lastIndexOf("."));
                    getUploadSignature({queryData: {dir: dir}})
                        .then((res) => {
                            let signData = res.data; // 拿到后端返回数据
                            this.action = signData.host; //上传的url
                            let key = signData.dir + signData.uuid + fileSuffix; // 组合保存到云的文件路径
                            if (res.success) {
                                this.$refs.upload.formData = {
                                    key: key,
                                    policy: signData.policy,
                                    OSSAccessKeyId: signData.accessId,
                                    success_action_status: "200", //让服务端返回200,不然，默认会返回204
                                    signature: signData.signature,
                                };
                                this.tempFinalSrc = signData.host + "/" + key;
                                resolve();
                            }
                            else {
                                reject();
                                console.log("获取签名失败", res);
                            }
                        })
                        .catch((err) => {
                            console.error("getUploadSignature错误", err);
                            uni.showToast({
                                title: '网络异常'
                            });
                        });
                });
            },
            /**
             * @description: 错误发生的回调
             * @param {*} err 错误原因
             * @param {*} index 错误下标
             */
            onError(err, index) {
                uni.showModal({
                    title: "警告",
                    content: `上传图片出现错误，出现在下标【${index}】：${err}`,
                    success: function (res) {
                        if (res.confirm) {
                        }
                        else if (res.cancel) {
                        }
                    },
                });
                throw err;
            },
            /**
             * @description 移除图片的回调
             * @param listsIndex 移除图片列表下标
             * @param lists  当前文件列表
             */
            onRemove(listsIndex, lists) {
                this.$emit("onRemoveImage", listsIndex, lists);
            },
        },
        mounted() {
            this.uploadItemWidth = (this.width - 60) / 3 - 10;
        }
    };
</script>

<style lang="scss" scoped>
  .slot-btn {
    width: 200rpx;
    height: 200rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background: $uni-color-grey;
    border-radius: 20rpx;
    margin: 8rpx;
  }
  .slot-btn__hover {
    background-color: rgb(235, 236, 238);
  }
  .upload-btn {
    width: 200rpx;
    height: 200rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background: $uni-color-grey;
    margin: 8rpx;
  }
</style>
