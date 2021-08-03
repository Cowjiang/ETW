/**
 *封装请求
 *@param {Object} url 接口的地址
 *@param {Object} pramsObject 自定义请求参数
 *@return {Promise} 请求结果
 **/
export const apiResquest = (url, pramsObject) => {
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
      headerData = {};
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
    return uni.request({
      url: url,
      data: queryData,
      method: method,
      header: headerData,
      success: (res) => {
        console.log(queryData,method,headerData);
        console.log(`【${url}】请求响应：`, res);
        // 和后端约定的状态码
        const { errorCode } = res.data;
        // 根据 code 进行判断
        if (errorCode === undefined) {
          reject(res);
          return
        } else {
          switch (errorCode) {
            case 200:
              if (res.header["Set-Cookie"] != undefined) {
                uni.setStorageSync('cookie', res.header["Set-Cookie"])
              }
              resolve(res.data);
              break;
            case 3002:
              // 未登录
              uni.showModal({
                title: '提示',
                content: '该功能需要登录才能使用，是否前往登录页面？',
                success: function (res) {
                  if (res.confirm) {
                    uni.navigateTo({
                      url: "/pages/login/login",
                    });
                  } else if (res.cancel) {
                  }
                }
              });
              reject(res)
              break;
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
