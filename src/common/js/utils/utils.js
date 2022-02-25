export class Utils {
    constructor() {
        this.throttleBackTime = 0;
        this.throttleGapTime = 0;
        this.throttleEnterTime = 0;
        this.debounceTimer;
        this.debounceGapTime = 0;
    }

    /**
     * 节流函数
     * @param {function} fn 要执行的方法
     * @param {number} interval 等待时间，默认500ms
     */
    throttle(fn, interval) {
        this.throttleGapTime = interval || 500;
        (() => {
            this.throttleBackTime = new Date();
            if (this.throttleBackTime - this.throttleEnterTime > this.throttleGapTime) {
                fn.call(this, arguments);
                this.throttleEnterTime = this.throttleBackTime;
            }
        })();
    }

    // 重置节流函数（仅供特殊情况使用）
    resetThrottle() {
        this.throttleBackTime = 0;
        this.throttleGapTime = 0;
        this.throttleEnterTime = 0;
    }

    /**
     * 防抖函数
     * @param {function} fn 要执行的方法
     * @param {number} interval 等待时间，默认500ms
     */
    debounce(fn, interval) {
        this.debounceGapTime = interval || 500;
        (() => {
            clearTimeout(this.debounceTimer);
            let args = arguments;
            this.debounceTimer = setTimeout(() => {
                fn.call(this, args);
            }, this.debounceGapTime);
        })();
    }

    /**
     * 总页数
     * @param（总条数，每页总条数）
     */
    getTotalPages(total, pageSize) {
        if (!total) {
            return 0;
        }
        else {
            if (pageSize != 0 &&
                total % pageSize == 0) {
                return parseInt(total / pageSize);
            }
            if (pageSize != 0 &&
                total % pageSize != 0) {
                return parseInt(total / pageSize) + 1;
            }
        }
    }

    // 获取导航栏高度
    getNavigationHeight() {
        let windowWidth;
        wx.getSystemInfo({
            success: res => windowWidth = res.windowWidth,
        });
        const { height, top, right } = wx.getMenuButtonBoundingClientRect(); //获取胶囊按钮尺寸信息
        return height + top + windowWidth - right;
    }

    // 获取当前页面URL及参数
    getCurrentPage() {
        let routes = getCurrentPages(); //获取当前打开过的页面路由数组
        let curRoute = routes[routes.length - 1].route; //获取当前页面路由
        let curParam = routes[routes.length - 1].options; //获取路由参数
        // 拼接参数
        let param = '';
        for (let key in curParam) {
            param += '&' + key + '=' + curParam[key];
        }
        return {
            curUrl: curRoute,
            curParam: curParam
        };
    }
    /**
     * @description: 判断对象的键是否为空
     * @param {*} obj 需要判断的对象
     * @param {*} arr 数组内为该对象可以为空的键
     */    
    isObjectAnyKeyEmpty(obj,arr) {
        let isAnyKeyEmpty = false
        for (const key in obj) {
            if (arr&&arr.indexOf(key) !== -1) {
                continue;
            }
            if (!obj[key] || obj[key] === {} || obj[key] === []) {
                isAnyKeyEmpty = true;
                break
            }
        }
        return isAnyKeyEmpty
    }
}

