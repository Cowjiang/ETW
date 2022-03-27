export const tabbars = [
  {
    iconPath: "star",
    selectedIconPath: "star-fill",
    text: "动态",
    count: 2,
    pagePath: "/pages/trending/trending",
    customIcon: false,
  },
  {
    iconPath: "shopping-cart",
    selectedIconPath: "shopping-cart-fill",
    text: "店铺",
    pagePath: "/pages/store/storeSearch",
    customIcon: false,
  },
  {
    iconPath: "https://cdn.uviewui.com/uview/common/min_button.png",
    selectedIconPath:
      "https://cdn.uviewui.com/uview/common/min_button_select.png",
    text: "发布动态",
    midButton: true,
    customIcon: true,
  },
  {
    iconPath: "chat",
    selectedIconPath: "chat-fill",
    text: "私信",
    pagePath: "/pages/chat/chat",
    customIcon: false,
  },

  {
    iconPath: "account",
    selectedIconPath: "account-fill",
    text: "我的",
    pagePath: "/pages/mine/me",
    count: 23,
    isDot: false,
    customIcon: false,
  },
];

import { wxLogin } from "../api/models";
export const toWxLogin = () => {
  return new Promise((resolve, reject) => {
    let code = uni.getStorageSync("login_token");

    if (code !== "" && code.split("|")[1] > new Date().getTime()) {
      resolve(code.split("|")[0]);
    } else {
      uni.getProvider({
        service: "oauth",
        success: (result) => {
          const provider = result.provider;
          uni.login({
            provider: provider.id,
            success: (res) => {
              wxLogin({
                queryData: {
                  code: res.code,
                },
              }).then((res) => {
                if (res.success) {
                  let loginToken =
                    res.data + "|" + (new Date().getTime() + 3600000 * 3);
                  uni.setStorageSync("login_token", loginToken);

                  resolve(res.data);
                }
              });
            },
          });
        },
      });
    }
  });
};

export const toPayment = (data) => {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: "wxpay",
      timeStamp: data.timestamp + "",
      package: "prepay_id=" + data.prepay_id,
      paySign: data.sign,
      nonceStr: data.nonce,
      signType: "RSA",
      success: function(res) {
        console.log("success:" + "支付成功");
        resolve(res);
      },
      fail: function(err) {
        console.log("fail:" + "支付失败");
        reject(err);
      },
    });
  });
};
