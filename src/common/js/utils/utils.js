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
}

