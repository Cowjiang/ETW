import { apiResquest } from "./request.js";
//#ifdef H5
// let baseUrl = "/api"
//#endif
//#ifdef MP-WEIXIN
// let baseUrl = "http://free.svipss.top:21199"
//#endif

let host = `112.74.19.170:8887`; //服务器主机域名
export const httpBaseUrl = `http://${host}`; //HTTP请求服务器基本地址
export const wsBaseUrl = `ws://${host}/websocket`; //WebSocket请求服务器基本地址

// mock
// 获取作品列表
export const getWorkList = (requestConfig) =>
	apiResquest("mockApi/test", { method: "GET", requestConfig });
// 获取常看作者
export const getAuthorList = (requestConfig) =>
	apiResquest("mockApi/authorList", { method: "GET", requestConfig });
// 获取动态列表
export const getTrendList = (requestConfig) =>
	apiResquest("mockApi/trendsList", { method: "GET", requestConfig });

//用户相关
//登录
export const loginTest = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/login`, { method: "POST", requestConfig });
//注册
export const registerTest = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/user/register`, { method: "POST", requestConfig });
//获取验证码
export const getEmailCode = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/user/email/verification`, { method: "GET", requestConfig });
//获取用户
export const getUser = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/getUser`, { method: "GET", requestConfig });
//登出
export const logout = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/logout`, { method: "GET", requestConfig });
//获取黑名单
export const getBlockList = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/user/block-list`, { method: "GET", requestConfig });
//添加到黑名单
export const addBlockList = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/user/block-list/${requestConfig.urlParam}`, { method: "POST", requestConfig });
//从黑名单中移除
export const deleteBlockList = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/user/block-list/${requestConfig.urlParam}`, { method: "DELETE", requestConfig });
//获取我的地址簿
export const getAddressBook = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/user/address/${requestConfig.urlParam}`, { method: "GET", requestConfig });
//添加地址到地址簿
export const addAddressBook = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/user/address/${requestConfig.urlParam}`, { method: "POST", requestConfig });
//修改地址簿中的地址
export const updateAddressBook = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/user/address/${requestConfig.urlParam}`, { method: "PUT", requestConfig });
//获取一个地址簿中的地址
export const getAddress = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/user/address/${requestConfig.urlParam}`, { method: "GET", requestConfig });
//删除地址簿中的地址
export const deleteAddressBook = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/user/address/${requestConfig.urlParam}`, { method: "DELETE", requestConfig });

//地区查询相关
//获取省份
export const getProvince = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/area/province`, { method: "GET", requestConfig });
//获取城市
export const getCity = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/area/province/${requestConfig.urlParam.provinceId}/city`, { method: "GET", requestConfig });
//获取县级(区/县)
export const getArea = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/area/province/${requestConfig.urlParam.provinceId}/city/${requestConfig.urlParam.cityId}/area`, { method: "GET", requestConfig });
//获取乡级(乡镇/街)
export const getTown = (requestConfig) =>
    apiResquest(`${httpBaseUrl}/area/province/${requestConfig.urlParam.provinceId}/city/${requestConfig.urlParam.cityId}/area/${requestConfig.urlParam.townId}/town`, { method: "GET", requestConfig });

//动态相关
//获取目录上传签名
export const getUploadSignature = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/signature-oss`, { method: "GET", requestConfig });
//发布动态
export const postTrend = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/dynamic`, { method: "POST", requestConfig });
//获取我的动态
export const getMyTrend = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/dynamic`, { method: "GET", requestConfig });
//点赞
export const like = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/like/${requestConfig.urlParam}`, { method: "POST", requestConfig });
//发布动态评论
export const postTrendComment = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/dynamic/${requestConfig.urlParam}/comment`, { method: "POST", requestConfig });
//获取动态评论
export const getTrendComment = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/dynamic/${requestConfig.urlParam}/comment`, { method: "GET", requestConfig });
//在动态评论下回复二级评论
export const postTrendSecondComment = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/comment/${requestConfig.urlParam.commentId}/comment`, { method: "POST", requestConfig });
//获取动态评论的二级评论
export const getTrendSecondComment = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/comment/${requestConfig.urlParam.commentId}/comment`, { method: "GET", requestConfig });


//私信相关
//获取我的私信列表
export const getMyChatList = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/chat/list`, { method: "GET", requestConfig });
//获取私信记录
export const getChatHistory = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/chat/user/${requestConfig.urlParam}`, { method: "GET", requestConfig });
//发送私信
export const sendMessage = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/chat/user/${requestConfig.urlParam}`, { method: "POST", requestConfig });
//删除私信记录
export const deleteChatHistory = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/chat/${requestConfig.urlParam}`, { method: "DELETE", requestConfig });
//获取用户简要信息（临时）
export const getUserInfoTemp = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/user/simple/info/${requestConfig.urlParam}`, { method: "GET", requestConfig });
//获取登录websocket的令牌
export const getUserToken = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/socket/connection`, { method: "GET", requestConfig });


//店铺相关


//店铺申请
export const postStoreArchives = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/store/archives`, { method: "POST", requestConfig });
export const putStoreInfo = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/store/${requestConfig.urlParam}/user`, { method: "PUT", requestConfig });
export const getMyStoreInfo = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/store/info`, { method: "GET", requestConfig });