# 安装说明

1、安装相关依赖, 默认已拥有node环境

```
// 安装依赖
npm install
```

1. 运行到指定平台

```
// 运行到H5
npm run serve
// 运行至对应的小程序平台
npm dev:PLATFORM
// 例如
npm run dev:mp-weixin
```

| 值         | 平台         |
| ---------- | ------------ |
| h5         | H5           |
| mp-weixin  | 微信小程序   |
| mp-alipay  | 支付宝小程序 |
| mp-baidu   | 百度小程序   |
| mp-toutiao | 头条小程序   |
| mp-qq      | qq 小程序    |

# 目录结构

```
│  App.vue
│  main.js
│  manifest.json
│  package-lock.json
│  package.json
│  pages.json
│  uni.scss /* 全局 scss */
├─common /* 可复用的css或js */
│  ├─css
│  └─js
│     ├─api /* 请求的封装 */
│     └─mock /* mock数据 */
├─components 
├─pages /* 主页(底部导航栏对应的页面)放pages目录下 在主页跳转的子页放主页文件夹下的subpages目录 */
│  ├─home
|     └─subpages 
├─static /* 静态资源文件夹 */
│  └─images
└─wxcomponents /* 存放微信小程序格式的组件 */

```


