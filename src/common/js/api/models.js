import { apiResquest } from "./request.js";
//#ifdef H5
// let baseUrl = "/api"
//#endif
//#ifdef MP-WEIXIN
let host = "free.svipss.top:21199"; //服务器主机域名
export const httpBaseUrl = `http://${host}`; //HTTP请求服务器基本地址
export const wsBaseUrl = `ws://${host}/websocket`; //WebSocket请求服务器基本地址
//#endif

// 获取作品列表
export const getWorkList = (requestConfig) =>
	apiResquest("mockApi/test", { method: "GET", requestConfig });
// 获取常看作者
export const getAuthorList = (requestConfig) =>
	apiResquest("mockApi/authorList", { method: "GET", requestConfig });
// 获取动态列表
export const getTrendList = (requestConfig) =>
	apiResquest("mockApi/trendsList", { method: "GET", requestConfig });



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
//获取目录上传签名
export const getUploadSignature = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/signature-oss/${requestConfig.urlParam}`, { method: "GET", requestConfig });
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
	apiResquest(`${httpBaseUrl}/dynamic/${requestConfig.urlParam.trendId}/comment/${requestConfig.urlParam.commentId}/comment`, { method: "POST", requestConfig });
//获取动态评论的二级评论
export const getTrendSecondComment = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/dynamic/${requestConfig.urlParam.trendId}/comment/${requestConfig.urlParam.commentId}/comment`, { method: "GET", requestConfig });
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
//获取登录websocket的临时令牌
export const getUserToken = (requestConfig) =>
	apiResquest(`${httpBaseUrl}/socket/connection`, { method: "GET", requestConfig });
