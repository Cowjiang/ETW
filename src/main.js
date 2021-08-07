import Vue from 'vue'
import App from './App'

//uview
import uView from "uview-ui";
//mock.js
import Mock from '@/common/js/mock';
//封装请求方法
import { apiResquest } from "@/common/js/api/request.js"
//util.js-工具集
import { Utils } from "@/common/js/utils/utils.js"
import * as filters from '@/common/js/utils/filters.js'
//高德地图sdk（已修改为适配uni-app）
import amap from '@/common/js/sdk/amap-uni.js'


//过滤器
Object.keys(filters).forEach(key => { Vue.filter(key, filters[key]) })

Vue.use(uView);
Vue.config.productionTip = false
//定义$apiResquest
Vue.prototype.apiResquest = apiResquest
//工具集
Vue.prototype.utils = new Utils()
//高德地图
Vue.prototype.amap = new amap.AMapWX({
	key: 'fa473dbfe448587f7903db9b0b3a4725'
})

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
