import {apiRequest} from "./request.js";

let host = `shitukj.cn/service`; //服务器主机域名
export const httpBaseUrl = `https://${host}`; //HTTP请求服务器基本地址
export const wsBaseUrl = `wss://${host}/websocket`; //WebSocket请求服务器基本地址

// mock
// 获取作品列表
export const getWorkList = (requestConfig) => apiRequest("mockApi/test", {
    method: "GET",
    requestConfig
});

// 获取常看作者
export const getAuthorList = (requestConfig) => apiRequest("mockApi/authorList", {
    method: "GET",
    requestConfig
});

// 获取动态列表
export const getTrendList = (requestConfig) => apiRequest("mockApi/trendsList", {
    method: "GET",
    requestConfig
});

//用户相关
//传统方式登录（账号密码）
export const traditionalLogin = (requestConfig) => apiRequest(`${httpBaseUrl}/login`, {
    method: "POST",
    requestConfig
});

//传统方式注册（账号密码）
export const traditionalRegister = (requestConfig) => apiRequest(`${httpBaseUrl}/user/register`, {
    method: "POST",
    requestConfig
});

//获取验证码
export const getEmailCode = (requestConfig) => apiRequest(`${httpBaseUrl}/user/email/verification`, {
    method: "GET",
    requestConfig,
});

//退出登录
export const logOut = (requestConfig) => apiRequest(`${httpBaseUrl}/logout`, {
    method: "GET",
    requestConfig
});

//微信登录
export const wxLogin = (requestConfig) => apiRequest(`${httpBaseUrl}/login/wx`, {
    method: "POST",
    requestConfig
});

//微信注册
export const wxRegister = (requestConfig) => apiRequest(`${httpBaseUrl}/user/register/wx`, {
    method: "POST",
    requestConfig
});

//微信注册：绑定微信个人信息
export const wxUserProfile = (requestConfig) => apiRequest(`${httpBaseUrl}/user/wx/info`, {
    method: "PUT",
    requestConfig
});

//微信注册：绑定手机号码
export const wxUserPhone = (requestConfig) => apiRequest(`${httpBaseUrl}/user/wx/phone`, {
    method: "PUT",
    requestConfig
});

//获取用户
export const getUser = (requestConfig) => apiRequest(`${httpBaseUrl}/getUser`, {
    method: "GET",
    requestConfig
});

//获取简要用户信息
export const getUserSimpleInfo = (requestConfig) => apiRequest(`${httpBaseUrl}/user/simple/info/${requestConfig.urlParam.userId}?extend=${requestConfig.urlParam.extend || false}`, {
    method: "GET",
    requestConfig,
});

//获取我的个人资料
export const getMyProfile = (requestConfig) => apiRequest(`${httpBaseUrl}/user/current/info`, {
    method: "GET",
    requestConfig
});

//编辑我的个人资料
export const editMyProfile = (requestConfig) => apiRequest(`${httpBaseUrl}/user/profile`, {
    method: "PUT",
    requestConfig
});

//获取学校列表
export const getSchoolList = (requestConfig) => apiRequest(`${httpBaseUrl}/school?province=${requestConfig.urlParam.province}&city=${requestConfig.urlParam.city}&area=${requestConfig.urlParam.area}&keywords=${requestConfig.urlParam.keywords}`, {
    method: "GET",
    requestConfig
});

//获取黑名单
export const getBlockList = (requestConfig) => apiRequest(`${httpBaseUrl}/user/block-list`, {
    method: "GET",
    requestConfig,
});

//添加到黑名单
export const addToBlockList = (requestConfig) => apiRequest(`${httpBaseUrl}/user/block-list/${requestConfig.urlParam.userId}`, {
    method: "POST",
    requestConfig,
});

//从黑名单中移除
export const removeFromBlockList = (requestConfig) => apiRequest(`${httpBaseUrl}/user/block-list/${requestConfig.urlParam.userId}`, {
    method: "DELETE",
    requestConfig,
});

//搜索用户
export const searchUser = (requestConfig) => apiRequest(`${httpBaseUrl}/user/search`, {
    method: "GET",
    requestConfig,
});

//关注用户
export const addFriend = (requestConfig) => apiRequest(`${httpBaseUrl}/user/friend/${requestConfig.urlParam.userId}`, {
    method: "POST",
    requestConfig,
});

// 取消关注用户
export const removeFriend = (requestConfig) => apiRequest(`${httpBaseUrl}/user/friend/${requestConfig.urlParam.userId}`, {
    method: "DELETE",
    requestConfig,
});

//查询用户关系（是否在黑名单、是否关注）
export const getUserRelationships = (requestConfig) => apiRequest(`${httpBaseUrl}/user/friend/${requestConfig.urlParam.userId}/stat`, {
    method: "GET",
    requestConfig
});

//获取我的地址簿
export const getAddressBook = (requestConfig) => apiRequest(`${httpBaseUrl}/user/address`, {
    method: "GET",
    requestConfig
});

//添加地址到地址簿
export const addAddressBook = (requestConfig) => apiRequest(`${httpBaseUrl}/user/address`, {
    method: "POST",
    requestConfig
});

//修改地址簿中的地址
export const updateAddressBook = (requestConfig) => apiRequest(`${httpBaseUrl}/user/address/${requestConfig.urlParam}`, {
    method: "PUT",
    requestConfig,
});

//获取一个地址簿中的地址
export const getAddress = (requestConfig) => apiRequest(`${httpBaseUrl}/user/address/${requestConfig.urlParam}`, {
    method: "GET",
    requestConfig,
});

//删除地址簿中的地址
export const deleteAddressBook = (requestConfig) => apiRequest(`${httpBaseUrl}/user/address/${requestConfig.urlParam}`, {
    method: "DELETE",
    requestConfig,
});

//设置某地址为默认地址
export const setDefaultAddress = (requestConfig) => apiRequest(`${httpBaseUrl}/user/address/${requestConfig.urlParam}/default`, {
    method: "Put",
    requestConfig,
});

//获取我的默认地址
export const getDefaultAddress = (requestConfig) => apiRequest(`${httpBaseUrl}/user/address/default`, {
    method: "GET",
    requestConfig,
});

//地区查询相关
//获取省份
export const getProvince = (requestConfig) => apiRequest(`${httpBaseUrl}/area/province`, {
    method: "GET",
    requestConfig
});

//获取城市
export const getCity = (requestConfig) => apiRequest(`${httpBaseUrl}/area/province/${requestConfig.urlParam.provinceId}/city`, {
    method: "GET",
    requestConfig
});

//获取县级(区/县)
export const getArea = (requestConfig) => apiRequest(`${httpBaseUrl}/area/province/${requestConfig.urlParam.provinceId}/city/${requestConfig.urlParam.cityId}/area`, {
    method: "GET",
    requestConfig
});

//获取乡级(乡镇/街)
export const getTown = (requestConfig) => apiRequest(`${httpBaseUrl}/area/province/${requestConfig.urlParam.provinceId}/city/${requestConfig.urlParam.cityId}/area/${requestConfig.urlParam.townId}/town`, {
    method: "GET",
    requestConfig
});

//动态相关
//获取目录上传签名
export const getUploadSignature = (requestConfig) => apiRequest(`${httpBaseUrl}/signature-oss`, {
    method: "GET",
    requestConfig
});

//发布动态
export const postTrend = (requestConfig) => apiRequest(`${httpBaseUrl}/dynamic`, {
    method: "POST",
    requestConfig
});

//获取动态详情
export const getTrendDetail = (requestConfig) => apiRequest(`${httpBaseUrl}/dynamic/${requestConfig.urlParam.trendId}`, {
    method: "GET",
    requestConfig
});

//获取我关注的动态
export const getMyFocusedTrend = (requestConfig) => apiRequest(`${httpBaseUrl}/dynamic`, {
    method: "GET",
    requestConfig
});

//获取最新动态
export const getNewTrend = (requestConfig) => apiRequest(`${httpBaseUrl}/dynamic/news`, {
    method: "GET",
    requestConfig
});

//获取我的未读动态数量
export const getMyTrendUnreadCount = (requestConfig) => apiRequest(`${httpBaseUrl}/dynamic/remind/count`, {
    method: "GET",
    requestConfig
});

//获取某用户的动态列表
export const getUserTrendList = (requestConfig) => apiRequest(`${httpBaseUrl}/dynamic/user/${requestConfig.urlParam.userId}`, {
    method: "GET",
    requestConfig
});

//删除动态
export const deleteTrend = (requestConfig) => apiRequest(`${httpBaseUrl}/dynamic/${requestConfig.urlParam.trendId}`, {
    method: "DELETE",
    requestConfig,
});

//点赞
export const like = (requestConfig) => apiRequest(`${httpBaseUrl}/like/${requestConfig.urlParam}`, {
    method: "POST",
    requestConfig,
});

//发布动态评论
export const postTrendComment = (requestConfig) => apiRequest(`${httpBaseUrl}/dynamic/${requestConfig.urlParam}/comment`, {
    method: "POST",
    requestConfig,
});

//获取动态评论
export const getTrendComment = (requestConfig) => apiRequest(`${httpBaseUrl}/dynamic/${requestConfig.urlParam}/comment`, {
    method: "GET",
    requestConfig,
});

//在动态评论下回复二级评论
export const postTrendSecondComment = (requestConfig) => apiRequest(`${httpBaseUrl}/comment/${requestConfig.urlParam.commentId}/comment`, {
    method: "POST",
    requestConfig
});

//获取动态评论的二级评论
export const getTrendSecondComment = (requestConfig) => apiRequest(`${httpBaseUrl}/comment/${requestConfig.urlParam}/comment`, {
    method: "GET",
    requestConfig
});

//私信相关
//获取我的私信列表
export const getMyChatList = (requestConfig) => apiRequest(`${httpBaseUrl}/chat/list`, {
    method: "GET",
    requestConfig
});

//获取我的未读私信数量
export const getMyUnreadChatCount = (requestConfig) => apiRequest(`${httpBaseUrl}`, {
    method: "GET",
    requestConfig
});

//获取私信记录
export const getChatHistory = (requestConfig) => apiRequest(`${httpBaseUrl}/chat/user/${requestConfig.urlParam}`, {
    method: "GET",
    requestConfig,
});

//发送私信
export const sendMessage = (requestConfig) => apiRequest(`${httpBaseUrl}/chat/user/${requestConfig.urlParam}`, {
    method: "POST",
    requestConfig,
});

//删除私信记录
export const deleteChatHistory = (requestConfig) => apiRequest(`${httpBaseUrl}/chat/${requestConfig.urlParam}`, {
    method: "DELETE",
    requestConfig,
});

//删除私信列表中的私信记录
export const deleteChatWithFriend = (requestConfig) => apiRequest(`${httpBaseUrl}/chat/friend/${requestConfig.urlParam}`, {
    method: "DELETE",
    requestConfig,
});

// 好友
export const getUserFriend = (requestConfig) => apiRequest(`${httpBaseUrl}/user/${requestConfig.urlParam.userId}/friend`, {
    method: "GET",
    requestConfig,
});

//获取登录websocket的令牌
export const getUserToken = (requestConfig) => apiRequest(`${httpBaseUrl}/socket/connection`, {
    method: "GET",
    requestConfig,
});

//店铺相关
//搜索店铺
export const searchStore = (requestConfig) => apiRequest(`${httpBaseUrl}/store/search`, {
    method: "POST",
    requestConfig
});

//获取店铺菜单
export const getStoreMenu = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam}/type/dishes`, {
    method: "GET",
    requestConfig,
});

//店铺申请
export const postStoreArchives = (requestConfig) => apiRequest(`${httpBaseUrl}/store/archives`, {
    method: "POST",
    requestConfig,
});

//修改店铺信息
export const putMyStoreInfo = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam}/user`, {
    method: "PUT",
    requestConfig,
});

//获取我的店铺信息（店家）
export const getMyStoreInfo = (requestConfig) => apiRequest(`${httpBaseUrl}/store/info`, {
    method: "GET",
    requestConfig
});

//获取店铺信息
export const getStoreInfo = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}`, {
    method: "GET",
    requestConfig
});

//提交店铺图片
export const postMyStoreInfoImage = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam}/image`, {
    method: "POST",
    requestConfig,
});

//获取菜品列表
export const getDishList = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam}/type/dishes`, {
    method: "GET",
    requestConfig,
});

//添加菜品
export const postDishInfo = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam}/dishes`, {
    method: "POST",
    requestConfig,
});

//编辑菜品
export const putDishInfo = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/dishes/${requestConfig.urlParam.dishId}`, {
    method: "PUT",
    requestConfig
});

//删除菜品
export const deleteDishInfo = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/dishes/${requestConfig.urlParam.dishId}`, {
    method: "DELETE",
    requestConfig
});

//获取菜品类型
export const getDishType = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam}/types`, {
    method: "GET",
    requestConfig,
});

//修改菜品类型
export const putDishType = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/type/${requestConfig.urlParam.dishTypeId}`, {
    method: "PUT",
    requestConfig
});

//添加菜品类型
export const postDishType = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam}/type`, {
    method: "POST",
    requestConfig,
});

//删除菜品类型
export const deleteDishType = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/type/${requestConfig.urlParam.typeId}`, {
    method: "DELETE",
    requestConfig
});

//添加定制类型
export const postCustom = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/dishes/${requestConfig.urlParam.dishId}/custom`, {
    method: "POST",
    requestConfig
});

// 获取定制类型
export const getCustom = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/dishes/${requestConfig.urlParam.dishId}/customItems`, {
    method: "GET",
    requestConfig
});

// 删除定制类型
export const deleteCustom = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/dishes/custom/${requestConfig.urlParam.customId}`, {
    method: "DELETE",
    requestConfig
});

// 添加定制项
export const postCustomItem = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/dishes/custom/${requestConfig.urlParam.customId}/item`, {
    method: "POST",
    requestConfig
});

// 删除定制项
export const deleteCustomItem = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/dishes/custom/${requestConfig.urlParam.customId}/item/${requestConfig.urlParam.itemId}`, {
    method: "DELETE",
    requestConfig
});

// 下单
export const addOrder = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/order`, {
    method: "POST",
    requestConfig,
});

//获取我的订单
export const getMyOrder = (requestConfig = {}) => apiRequest(`${httpBaseUrl}/store/order/user`, {
    method: "GET",
    requestConfig,
});

//获取订单详细信息
export const getOrderDetail = (requestConfig = {}) => apiRequest(`${httpBaseUrl}/store/order/detail/${requestConfig.urlParam.orderId}`, {
    method: "GET",
    requestConfig,
});

// 获取店铺的优惠券
export const getCouponByStoreId = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/coupon`, {
    method: "GET",
    requestConfig,
});

//领取优惠券
export const userGetCoupon = (requestConfig) => apiRequest(`${httpBaseUrl}/store/${requestConfig.urlParam.storeId}/user/coupon/${requestConfig.urlParam.couponId}`, {
    method: "POST",
    requestConfig,
});

// 获取用户的优惠券
export const getUserCoupon = (requestConfig) => apiRequest(`${httpBaseUrl}/store/user/coupon`, {
    method: "GET",
    requestConfig,
});

// 获取微信支付信息
export const getOrderWxPayInfo = (requestConfig) => apiRequest(`${httpBaseUrl}/store/order/${requestConfig.urlParam.orderId}/wx/pay`, {
    method: "POST",
});

// 申请退款
export const applyToRefunds = (requestConfig) => apiRequest(`${httpBaseUrl}/store/order/${requestConfig.urlParam.orderId}/refunds/apply`, {
    method: "PUT",
    requestConfig,
});