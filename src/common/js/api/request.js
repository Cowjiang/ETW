import { Utils } from "@/common/js/utils/utils.js"

/**
 *封装请求
 * @param {Object} url 接口的地址
 * @param {Object} pramsObject 自定义请求参数
 * @return {Promise} 请求结果
 **/
export const apiResquest = (url, pramsObject) => {
    let utils = new Utils; //创建工具集对象
    //header,cookies,query等参数
    const requestConfig = pramsObject.requestConfig  //方法
    let method = pramsObject.method
    //请求query数据
    let queryData = {};
    //请求头
    let headerData = {};
    // 判断请求类型
    switch (method) {
        case "GET":
            headerData = { "Content-type": "application/json" };
            break;
        case "POST":
            headerData = { "Content-type": "application/x-www-form-urlencoded" };
            break;
        case "PUT":
            headerData = { "Content-type": "application/x-www-form-urlencoded" };
            break;
        case "DELETE":
            headerData = {};
            break;
        default:
            break;
    }
    //判断有无自定义请求配置参数，没有时为undefined
    if (requestConfig) {
        if (requestConfig.hasOwnProperty("queryData")) {
            queryData = requestConfig.queryData;
        }
        if (requestConfig.hasOwnProperty("headerData")) {
            headerData = requestConfig.headerData
        }
    }
    //判断有无cookie
    if (uni.getStorageSync("cookie") != undefined) {
        let cookie = uni.getStorageSync("cookie");
        headerData["cookie"] = cookie;
    }
    return new Promise((resolve, reject) => {
        uni.request({
            url: url,
            data: queryData,
            method: method,
            header: headerData,
            success: (res) => {
                // console.log(res.data.errorCode)
                // console.log(queryData,method,headerData);
                console.log(`【${url}】请求响应：`, res);
                //HTTP状态码
                const { statusCode } = res
                // 和后端约定的状态码
                const { errorCode } = res.data;
                if (statusCode === 400) {
                    reject(res);
                }
                // 根据 code 进行判断
                if (errorCode === undefined) {
                    reject(res);
                    return
                }
                else {
                    switch (errorCode) {
                        case 200:
                            if (res.header["Set-Cookie"] != undefined) {
                                uni.setStorageSync('cookie', res.header["Set-Cookie"])
                            }
                            resolve(res.data);
                            break;
                        case 999:
                            if (res.data.data !== '用户登录过期') {
                                if (res.data.errorMsg === '失败') {
                                    reject(res.data);
                                }
                                break;
                            }
                        case 3002:
                            // 未登录
                            console.log('该功能需要登录才能使用');
                            let currentPage = utils.getCurrentPage();
                            if (currentPage.curUrl === 'pages/login/login') {
                                reject(res);
                                break;
                            }
                            else {
                                uni.redirectTo({
                                    url: `/pages/login/login?redirectPath=${currentPage.curUrl}`
                                });
                                reject(res);
                                break;
                            }
                        default:
                            break;
                    }
                }
            },
            fail: (err) => {
                console.log(`【${url}】请求失败：`, err);
                reject(err);
            },
            complete: () => {
                // console.log(`【${url}】请求完成`);
            },
        });
    });
};
