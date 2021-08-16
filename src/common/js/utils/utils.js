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
	 * @param fn 要执行的方法
	 * @param interval 等待时间，默认500ms
	 */
	throttle(fn, interval) {
		this.throttleGapTime = interval || 500;
		(() => {
			this.throttleBackTime = new Date();
			if (this.throttleBackTime - this.throttleEnterTime > this.throttleGapTime) {
				fn.call(this, arguments);
				this.throttleEnterTime = this.throttleBackTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
			}
		})();
	}

	/**
	 * 防抖函数
	 * @param fn 要执行的方法
	 * @param interval 等待时间，默认500ms
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
		} else {
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
		let {height, top, right} = wx.getMenuButtonBoundingClientRect(); //获取胶囊按钮尺寸信息
		return height + top + windowWidth - right;
	}

	// 获取当前页面URL及参数
	getCurrentPage() {
		let routes = getCurrentPages(); //获取当前打开过的页面路由数组
		let curRoute = routes[routes.length - 1].route; //获取当前页面路由
		let curParam = routes[routes.length - 1].options; //获取路由参数
		// 拼接参数
		let param = ''
		for (let key in curParam) {
			param += '&' + key + '=' + curParam[key];
		}
		let curUrl = {
			curUrl: curRoute,
			curParam: curParam
		};
		return curUrl;
	}
}

