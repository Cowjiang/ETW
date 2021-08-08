import {apiResquest} from "./request.js";
//#ifdef H5
let baseUrl = "/api"
//#endif
//#ifdef MP-WEIXIN
let baseUrl = "http://us-or-cera-1.natfrp.cloud:21671"
//#endif
// 获取作品列表
export const getWorkList = (requestConfig) =>
	apiResquest("mockApi/test", {method: "GET", requestConfig});
// 获取常看作者
export const getAuthorList = (requestConfig) =>
	apiResquest("mockApi/authorList", {method: "GET", requestConfig});
// 获取动态列表
export const getTrendList = (requestConfig) =>
	apiResquest("mockApi/trendsList", {method: "GET", requestConfig});
//登录
export const loginTest = (requestConfig) =>
	apiResquest(`${baseUrl}/login`, {method: "POST", requestConfig});
//注册
export const registerTest = (requestConfig) =>
	apiResquest(`${baseUrl}/user/register`, {method: "POST", requestConfig});
//获取验证码
export const getEmailCode = (requestConfig) =>
	apiResquest(`${baseUrl}/user/email/verification`, {method: "GET", requestConfig});
//获取用户
export const getUser = (requestConfig) =>
	apiResquest(`${baseUrl}/getUser`, {method: "GET", requestConfig});
//登出
export const logout = (requestConfig) =>
	apiResquest(`${baseUrl}/logout`, {method: "GET", requestConfig});
//获取目录上传签名
export const getUploadSignature = (requestConfig) =>
	apiResquest(`${baseUrl}/signature-oss/${requestConfig.urlParam}`, {method: "GET", requestConfig});
//发布动态
export const postTrend = (requestConfig) =>
	apiResquest(`${baseUrl}/dynamic`, {method: "POST", requestConfig});
//获取我的动态
export const getMyTrend = (requestConfig) =>
	apiResquest(`${baseUrl}/dynamic`, {method: "GET", requestConfig});
//点赞
export const like = (requestConfig) =>
	apiResquest(`${baseUrl}/like/${requestConfig.urlParam}`, {method: "POST", requestConfig});
//发布动态评论
export const postTrendComment = (requestConfig) =>
	apiResquest(`${baseUrl}/dynamic/${requestConfig.urlParam}/comment`, {method: "POST", requestConfig});
//获取动态评论
export const getTrendComment = (requestConfig) =>
	apiResquest(`${baseUrl}/dynamic/${requestConfig.urlParam}/comment`, {method: "GET", requestConfig});
//获取我的私信列表
export const getMyChatList = (requestConfig) =>
	apiResquest(`${baseUrl}/chat/list`, {method: "GET", requestConfig});
//获取私信记录
export const getChatHistory = (requestConfig) =>
	apiResquest(`${baseUrl}/chat/user/${requestConfig.urlParam}`, {method: "GET", requestConfig});
//发送私信
export const sendMessage = (requestConfig) =>
	apiResquest(`${baseUrl}/chat/user/${requestConfig.urlParam}`, {method: "POST", requestConfig});
//删除私信记录
export const deleteChatHistory = (requestConfig) =>
	apiResquest(`${baseUrl}/chat/user`, {method: "DELETE", requestConfig});
//获取用户简要信息（临时）
export const getUserInfoTemp = (requestConfig) =>
	apiResquest(`${baseUrl}/user/simple/info/${requestConfig.urlParam}`, {method: "GET", requestConfig});