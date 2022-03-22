<template>
  <view>
    <view class="uni-padding-wrap uni-common-mt">
      <view class="demo">
        <block v-if="imageSrc">
          <image :src="imageSrc" class="image" mode="widthFix"></image>
        </block>
        <block v-else>
          <view class="uni-hello-addfile" @click="chooseImage">+ 选择图片</view>
        </block>
      </view>
    </view>
  </view>
</template>
<script>
import { getUploadSignature } from "@/common/js/api/models.js";
export default {
  data() {
    return {
      title: "uploadFile",
      imageSrc: "",
    };
  },
  onUnload() {
    this.imageSrc = "";
  },
  methods: {
    chooseImage: function () {
      // 文件选择
      uni.chooseImage({
        // 单文件
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album"],
        success: (chooseRes) => {
          // 选择到该图片
          console.log("选择图片成功，临时路径：", chooseRes.tempFilePaths[0]);
          // 图片虚拟路径
          let imageSrc = chooseRes.tempFilePaths[0];
          // 文件后缀名
          let fileSuffix = chooseRes.tempFiles[0].path.substr(
            chooseRes.tempFiles[0].path.lastIndexOf(".")
          );
          // 目标目录
          let dir = "user-avatar";
          getUploadSignature({ urlParam: dir })
            .then((res) => {
              let signData = res.data; // 拿到后端返回数据
              let key = signData.dir + signData.uuid + fileSuffix; // 组合保存到云的文件路径
              if (res.success) {
                // 开始阿里云oss直传
                uni.uploadFile({
                  url: signData.host, // 阿里云oss主机路径
                  filePath: imageSrc,
                  fileType: "image",
                  name: "file",
                  formData: {
                    key: key,
                    policy: signData.policy,
                    OSSAccessKeyId: signData.accessId,
                    success_action_status: "200", //让服务端返回200,不然，默认会返回204
                    signature: signData.signature,
                  },
                  success: (res) => {
                    // 删除成功后干的事情
                    console.log("阿里云上传图片成功", res);
                    // 云端访问路径
                    let finalSrc = signData.host + "/" + key;
                    console.log("云端访问路径:", finalSrc);
                    this.imageSrc = imageSrc;
                  },
                  fail: (err) => {
                    console.log("阿里云上传图片失败", err);
                  },
                });
              } else {
                console.log("获取签名失败", res);
              }
            })
            .catch((err) => {
              console.log("getUploadSignature错误", err);
            });
        },
        fail: (err) => {
          console.log("选择图片失败", err);
          // #ifdef MP
          uni.getSetting({
            success: (res) => {
              let authStatus = res.authSetting["scope.album"];
              if (!authStatus) {
                uni.showModal({
                  title: "授权失败",
                  content:
                    "Hello uni-app需要从您的相册获取图片，请在设置界面打开相关权限",
                  success: (res) => {
                    if (res.confirm) {
                      uni.openSetting();
                    }
                  },
                });
              }
            },
          });
          // #endif
        },
      });
    },
  },
};
</script>

<style>
.image {
  width: 100%;
}

.demo {
  background: #fff;
  padding: 50rpx;
}
</style>
