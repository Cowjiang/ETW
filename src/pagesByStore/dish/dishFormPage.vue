<template>
  <view class="contanier">
    <navigationBar ref="navigationBar"></navigationBar>
    <toast ref="toast"></toast>
    <!-- 添加定制类型弹出层 -->
    <u-popup
      v-model="isShowCustomPop"
      mode="bottom"
      border-radius="14"
      height="customPopupHeight"
      :safeAreaInsetBottom="true"
    >
      <view class="popup-box">
        <u-form-item v-show="!isAddCustomItemByEdit" label-position="top" label="定制类型">
          <u-input v-model="customInfo.customName" maxlength="10" :clearable="false" />
        </u-form-item>
        <u-form-item label-position="top" label="定制项目">
          <u-input
            v-model="customInfo.customItemTitleInput"
            maxlength="10"
            placeholder="请输入定制项名称"
            :clearable="false"
          />
          <u-input
            v-model="customInfo.customItemPriceInput"
            type="number"
            maxlength="3"
            placeholder="请输入定制项价格（选填）"
            :clearable="false"
          />
          <view slot="right" class="add-button" @click="addCustomItem">
            <text class="fa fa-plus"></text>
          </view>
        </u-form-item>
        <u-form-item
          v-show="!isAddCustomItemByEdit"
          label-position="left"
          label="是否单选"
          label-width="180"
        >
          <u-switch slot="right" v-model="customInfo.isSingle" :active-color="primaryColor"></u-switch>
        </u-form-item>
        <view>
          <u-tag
            v-for="(item,index) in customInfo.customItems"
            :key="index"
            :text="`${item.customItemTitle} ${item.customItemPrice > 0 ? item.customItemPrice + '￥' : ''}`"
            :closeable="true"
            :bg-color="primaryColor"
            :border-color="primaryColor"
            color="#ffffff"
            shape="circle"
            @close="customInfo.customItems.splice(index, 1)"
          ></u-tag>
        </view>
        <button class="submit-button" @click="customPopupSubmit">添加</button>
      </view>
    </u-popup>
    <u-form :model="dishInfoForm" ref="uForm">
      <u-form-item label-position="top" label="菜品封面图片">
        <uploadGroup
          ref="dishInfoImageUpload"
          uploadImageDir="sotre/dish-info"
          uploadId="dishInfoImageUpload"
          :maxImageCount="1"
          :file-list="fileList"
          @onRemoveImage="clearImage(arguments)"
          @onImageUploaded="allImageUploaded(arguments)"
          @onChooseComplete="isImageChoosen = true"
        ></uploadGroup>
      </u-form-item>
      <u-form-item label-position="top" label="菜品名称">
        <u-input v-model="dishInfoForm.name" maxlength="10" />
      </u-form-item>
      <u-form-item label-position="top" label="菜品简短介绍">
        <u-input v-model="dishInfoForm.summary" maxlength="20" />
      </u-form-item>
      <u-form-item label-position="top" label="菜品描述">
        <u-input v-model="dishInfoForm.description" maxlength="200" />
      </u-form-item>
      <u-form-item label-position="top" label="原价（单位：元）">
        <u-input v-model="dishInfoForm.price" type="number" maxlength="4" />
      </u-form-item>
      <u-form-item label-position="top" label="折扣（8.5折为85，原价为100，单位：%）">
        <u-input v-model="dishInfoForm.discount" placeholder="请输入折扣比例" type="number" maxlength="3" />
      </u-form-item>
      <u-form-item label-position="top" label="菜品类型">
        <u-input
          v-model="dishTypeInputValue"
          placeholder="请选择菜品类型"
          :disabled="true"
          type="select"
          @click="isShowSelectDishType = true"
        />
        <u-select
          v-model="isShowSelectDishType"
          safe-area-inset-bottom="true"
          :list="dishTypeList"
          :confirm-color="primaryColor"
          @confirm="confirmDishType()"
        ></u-select>
      </u-form-item>
      <u-form-item label-position="top" label="打包费">
        <u-input v-model="dishInfoForm.packingCharges" type="number" maxlength="2" />
      </u-form-item>
      <!-- 添加定制类型 -->
      <u-form-item label-position="left" label="添加定制类型" label-width="180">
        <view
          slot="right"
          class="add-button"
          @click="isAddCustomItemByEdit = false; isShowCustomPop = true"
        >
          <text class="fa fa-plus"></text>
        </view>
      </u-form-item>
      <!-- 添加定制类型 -->
      <u-form-item
        v-if="customList.length !== 0"
        label-position="top"
        label="定制类型"
        label-width="180"
      >
        <view v-for="item1 in customList" :key="item1.customId" class="custom-containier">
          <view class="title">
            {{ item1.customName }}({{ item1.isSingle ? '单选' : '多选' }})
            <view v-if="!isAdd" class="button-group">
              <text class="add" @click="addCustomItemByEdit(item1.customId)">添加</text>
              <text class="delete" @click="deleteCustomByEdit(item1.customId)">删除</text>
            </view>
          </view>
          <view class="custom-item-containier">
            <u-tag
              v-for="item2 in item1.customItems"
              :key="item2.customItemId"
              :text="`${item2.customItemTitle} ${item2.customItemPrice > 0 ? item2.customItemPrice + '￥' : ''}`"
              :closeable="true"
              :bg-color="primaryColor"
              :border-color="primaryColor"
              color="#ffffff"
              shape="circle"
              @close="deleteCustomItemByEdit(item1.customId, item2.customItemId)"
            ></u-tag>
          </view>
        </view>
      </u-form-item>
    </u-form>
    <button
      class="submit-button"
      :disabled="isShowLoading"
      @click="clickSubmitButton"
      :class="isShowLoading ? 'disabled-button' : ''"
    >
      <i v-show="isShowLoading" class="fa fa-spinner fa-spin fa-fw"></i>
      {{ isAdd ? "添加" : "编辑" }}
    </button>
  </view>
</template>

<script>
import {
  postDishInfo, putDishInfo, postCustom, getCustom, postCustomItem, deleteCustom, deleteCustomItem
} from "@/common/js/api/models.js";
export default {
  data () {
    return {
      isAdd: true, //当前是否为添加菜品
      isShowSelectDishType: false,
      isShowLoading: false, //提交的加载
      isImageChoosen: false, //是否选择了照片
      isShowCustomPop: false,//是否展示定制类型弹出框
      isAddCustomItemByEdit: false,//是否在编辑菜单时添加定制项
      // 菜品信息
      dishInfoForm: {
        imageUrl: null, //封面图片
        name: "", //菜品名称
        description: "", //菜品描述
        summary: "", //菜品概要介绍
        price: null, //原价（单位：元）
        discount: 100, //折扣
        packingCharges: null, //打包费（外卖）（单位：元）
        typeId: "", //菜品类型id
      },
      // 店铺信息
      storeMainInfo: {
        id: "",
        likeNumber: "",
        browseNumber: "",
        score: "",
        sales: "",
        userId: "",
      },
      // 需要提交的定制类型信息
      customInfo: {
        customName: null,
        customItems: [],
        isSingle: true,
        customItemTitleInput: "",
        customItemPriceInput: ""
      },
      customList: [],//定制类型列表
      dishTypeList: [],//菜品类型列表
      fileList: [], //上传组件的图片
      primaryColor: "#f4756b",
      dishTypeInputValue: "",
      customIdByEdit: '',//编辑定制项时的定制类型id
    };
  },
  computed: {
    customPopupHeight () {
      if (this.isAddCustomItemByEdit) {
        return 500
      } else {
        return 900
      }
    }
  },
  onLoad () {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on(
      "acceptDataFromOpenerPage",
      (isAdd, storeMainInfo, dishTypeList, dishInfo) => {
        this.isAdd = isAdd;
        this.storeMainInfo = storeMainInfo;
        //编辑
        if (this.isAdd === false) {
          Object.assign(this.dishInfoForm, dishInfo);
          this.fileList.push({ url: this.dishInfoForm.imageUrl });
          this.isImageChoosen = true;
          this.getCustomData()
        }
        dishTypeList.forEach((element) => {
          if (this.isAdd === false && element.id === dishInfo.typeId) {
            this.dishTypeInputValue = element.typeName;
          }
          this.dishTypeList.push({
            label: element.typeName,
            value: element.id,
          });
        });
        this.$refs.navigationBar.setNavigation({
          backgroundColor: "white",
          titleText: `${this.isAdd ? "添加" : "编辑"}菜品`,
        });
      }
    );
  },
  methods: {
    /**
     * @description: 选择菜品类型的回调
     * @param {*} e 选择的参数
     */
    confirmDishType (e) {
      this.dishTypeInputValue = e[0].label;
      this.dishInfoForm.typeId = e[0].value;
    },
    /**
     * @description: 点击提交按钮
     */
    clickSubmitButton () {
      this.utils.debounce(() => {
        console.log("上传前表单数据", this.dishInfoForm);
        //添加
        if (this.isAdd) {
          if (!this.utils.isObjectAnyKeyEmpty(this.dishInfoForm, ["imageUrl"]) && this.isImageChoosen) {
            this.$refs.dishInfoImageUpload.$refs.upload.upload();
          } else {
            this.$refs.toast.show({
              text: "有信息未填写",
              type: "warning",
            });
          }
          //编辑
        } else {
          if (
            !this.utils.isObjectAnyKeyEmpty(this.dishInfoForm, ["imageUrl", "isCustom"]) && this.isImageChoosen) {
            //更改过图片
            if (this.fileList.length === 0) {
              this.$refs.dishInfoImageUpload.$refs.upload.upload();
            } else {
              //未改过图片
              const dishId = this.dishInfoForm.id;
              delete this.dishInfoForm.id;
              putDishInfo({
                urlParam: {
                  storeId: this.storeMainInfo.id,
                  dishId: dishId,
                },
                queryData: this.dishInfoForm,
                headerData: { "Content-type": "application/json" },
              }).then((res) => {
                if (res.success) {
                  this.$refs.toast.show({
                    text: "编辑成功",
                    type: "success",
                  });
                  this.backPage();
                } else {
                  this.$refs.toast.show({
                    text: "编辑失败",
                    type: "error",
                  });
                }
              });
            }
          } else {
            this.$refs.toast.show({
              text: "有信息未填写",
              type: "warning",
            });
          }
        }
      });
    },
    /**
     * @description: 请求接口
     * @param {Object} imageList 每个上传组件上传的图片
     * @param {String} uploadId 每个上传组件的标识
     */
    async allImageUploaded (args) {
      const uploadedImageList = args[0];
      this.dishInfoForm.imageUrl = uploadedImageList[0];
      try {
        //添加
        if (this.isAdd === true) {
          this.dishInfoForm.dishesCustoms = this.customList
          await postDishInfo({
            urlParam: this.storeMainInfo.id,
            queryData: this.dishInfoForm,
            headerData: { "Content-type": "application/json" },
          });
          //编辑
        } else {
          const dishId = this.dishInfoForm.id;
          delete this.dishInfoForm.id;
          await putDishInfo({
            urlParam: {
              storeId: this.storeMainInfo.id,
              dishId: dishId,
            },
            queryData: this.dishInfoForm,
          });
        }

        this.$refs.toast.show({
          text: "提交成功",
          type: "success",
        });
        this.backPage();
      } catch (error) {
        console.log(error.data.errorMsg);
        this.$refs.toast.show({
          text: "提交失败",
          type: "error",
        });
      }
    },
    /**
     * @description: 清除当前菜品的图片
     */
    clearImage (args) {
      this.isImageChoosen = false;
      let index = args[0];
      this.dishInfoForm.imageUrl = null;
      this.fileList.splice(index, 1);
    },
    /**
     * @description: 返回上一页
     */
    backPage () {
      const pages = getCurrentPages();
      //上一个页面
      let prePage = pages[pages.length - 2];
      //调用上一页拉取数据的方法
      prePage.$vm.getDishListData();
      uni.navigateBack();
    },
    /**
 * @description: 添加定制项
 */
    addCustomItem () {
      if (this.customInfo.customItemTitleInput) {
        let customItemTitle = this.customInfo.customItemTitleInput
        let customItemPrice = this.customInfo.customItemPriceInput || 0
        this.customInfo.customItems.push({ customItemTitle: customItemTitle, customItemPrice: customItemPrice })
        this.customInfo.customItemTitleInput = ""
        this.customInfo.customItemPriceInput = ""
      } else {
        this.$refs.toast.show({
          text: "请输入定制项名称",
          type: "warning",
        });
      }
    },
    /**
   * @description: 定制类型popup提交
   */
    async customPopupSubmit () {
      if (!this.customInfo.customName && !this.isAddCustomItemByEdit) {
        this.$refs.toast.show({
          text: "有信息未填写",
          type: "warning",
        });
        return
      } else if (this.customInfo.customItems.length === 0) {
        this.$refs.toast.show({
          text: "未添加定制项目",
          type: "warning",
        });
        return
      }
      if (this.isAdd) {
        this.customList.push({
          customName: this.customInfo.customName,
          isSingle: this.customInfo.isSingle,
          customItems: this.customInfo.customItems
        })
        this.isShowCustomPop = false
        this.$refs.toast.show({
          text: "添加成功",
          type: "success",
        });
      } else {
        if (this.isAddCustomItemByEdit) {
          await postCustomItem({
            urlParam: {
              storeId: this.storeMainInfo.id,
              customId: this.customIdByEdit
            },
            queryData: { items: this.customInfo.customItems },
            headerData: { "Content-type": "application/json" },
          }).then((res) => {
            console.log(res);
            if (res.success) {
              this.isShowCustomPop = false
              this.clearCustomInfo()
              this.getCustomData()
              this.$refs.toast.show({
                text: "添加成功",
                type: "success",
              });
            }
          })
        } else {
          await postCustom({
            urlParam: {
              storeId: this.storeMainInfo.id,
              dishId: this.dishInfoForm.id,
            },
            queryData: { customName: this.customInfo.customName, isSingle: this.customInfo.isSingle, customItems: this.customInfo.customItems },
            headerData: { "Content-type": "application/json" },
          }).then((res) => {
            if (res.success) {
              this.isShowCustomPop = false
              this.clearCustomInfo()
              this.getCustomData()
              this.$refs.toast.show({
                text: "添加成功",
                type: "success",
              });
            } else {
              this.$refs.toast.show({
                text: "添加失败",
                type: "error",
              });
            }
          })
        }
      }


    },
    /**
     * @description: 请求定制项
     */
    async getCustomData () {
      await getCustom({
        urlParam: {
          storeId: this.storeMainInfo.id,
          dishId: this.dishInfoForm.id,
        }
      }).then((res) => {
        this.customList = res.data
      })
    },
    /**
     * @description: 编辑时删除定制类型
     */
    async deleteCustomByEdit (id) {
      uni.showModal({
        title: "提示",
        content: "确定删除该定制类型吗？",
        showCancel: true,
        success: ({ confirm, cancel }) => {
          if (confirm) {
            deleteCustom({
              urlParam: {
                storeId: this.storeMainInfo.id,
                customId: id,
              }
            }).then((res) => {
              if (res.success) {
                this.getCustomData()
                this.$refs.toast.show({
                  text: "删除成功",
                  type: "success",
                });
              }
            })
          }
        },
      });
    },
    /**
     * @description: 编辑时添加定制项
     */
    addCustomItemByEdit (id) {
      this.isShowCustomPop = true
      this.isAddCustomItemByEdit = true
      this.customIdByEdit = id
    },
    /**
     * @description: 删除定制项
     */
    deleteCustomItemByEdit (customId, itemId) {
      uni.showModal({
        title: "提示",
        content: "确定删除该定制项吗？",
        showCancel: true,
        success: ({ confirm, cancel }) => {
          if (confirm) {
            deleteCustomItem({
              urlParam: {
                storeId: this.storeMainInfo.id,
                customId: customId,
                itemId: itemId
              }
            }).then((res) => {
              if (res.success) {
                this.getCustomData()
                this.$refs.toast.show({
                  text: "删除成功",
                  type: "success",
                });
              }
            })
          }
        },
      });

    },
    /**
     * @description: 清除customInfo
     */
    clearCustomInfo () {
      this.customInfo.customName = ''
      this.customInfo.customItemTitleInput = ''
      this.customInfo.customItemPriceInput = ''
      this.customInfo.customItems = []
      this.customInfo.isSingle = true
    }
  },
};
</script>

<style lang="scss" scoped>
.contanier {
  padding: 0 32rpx;
}
.disabled-button {
  color: white !important;
  background-color: $uni-color-primary !important;
  opacity: 0.5 !important;
}
.submit-button {
  width: 400rpx;
  height: 80rpx;
  line-height: 80rpx;
  margin: 72rpx auto;
  text-align: center;
  font-size: 36rpx;
  color: white;
  background-color: $uni-color-primary;
  border-radius: 14rpx;
}
.add-button {
  background-color: $uni-color-primary;
  color: white;
  text-align: center;
  font-size: 28rpx;
  width: 42rpx;
  height: 42rpx;
  line-height: 42rpx;
  border-radius: 50%;
}
.popup-box {
  padding: 32rpx 64rpx;
  /deep/ .u-tag {
    margin: 16rpx 8rpx !important;
  }
}
.custom-containier {
  padding: 24rpx;
  margin: 12rpx 0;
  border-radius: 12rpx;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  .title {
    font-weight: 500;
  }
  .button-group {
    float: right;
    .add {
      color: $uni-color-primary;
      margin-right: 12rpx;
    }
  }
}
</style>
