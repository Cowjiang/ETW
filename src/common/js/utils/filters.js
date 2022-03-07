import Vue from 'vue';
/**
 * 格式化多类型时间
 * @param {String|Date} time 时间戳或者时间对象
 * @param {String} type 时间类型
 * @return {String} 格式化后的时间
 */
Vue.filter('formatDateTime', (time, type) => {
    //判断传入的是时间戳还是时间对象
    const date = time instanceof Date ? time : new Date(time);
    const y = date.getFullYear();
    const m = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    const d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    const h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    const minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    const second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    switch (type) {
        case "yy-mm-dd hh:mm:ss":
            return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second;
        case "yy-mm-dd type":
            return y + "-" + m + "-" + d + " " + (h === 13 ? "下午" : "上午");
        case "yy-mm-dd hh:mm":
            return y + "-" + m + "-" + d + " " + h + ":" + minute;
        case "yy/mm/dd hh:mm:ss":
            return y + "/" + m + "/" + d + " " + h + ":" + minute + ":" + second;
        case "yy-mm-dd":
            return y + "-" + m + "-" + d;
        case "yy.mm.dd":
            return y + "." + m + "." + d;
        case "yy.mm.dd hh:mm:ss":
            return y + "." + m + "." + d + " " + h + ":" + minute + ":" + second;
        case "mm-dd hh:mm":
            return m + "-" + d + " " + h + ":" + minute;
    }
});

Vue.filter('discountFilter', number => {
    if (number < 1) {
        return number * 10 + "折";
    }
});

/**
 * 格式化时间（日期为今天时省略日期只显示时间），精确到分钟
 * @param {String} time 时间字符串
 * @return {String} 格式化后的时间
 */
Vue.filter('formatTime', time => {
    const messageDate = new Date(time);
    const nowDate = new Date();
    const messageTime = {
        year: messageDate.getFullYear(),
        month: messageDate.getMonth() + 1,
        day: messageDate.getDate(),
        hour: messageDate.getHours().toString().padStart(2, '0'),
        min: messageDate.getMinutes().toString().padStart(2, '0'),
        second: messageDate.getSeconds()
    }
    const nowTime = {
        year: nowDate.getFullYear(),
        month: nowDate.getMonth() + 1,
        day: nowDate.getDate()
    }
    if (messageTime.year === nowTime.year && messageTime.month === nowTime.month && messageTime.day === nowTime.day) {
        return `${messageTime.hour}:${messageTime.min}`;
    }
    else {
        return `${messageTime.year}-${messageTime.month}-${messageTime.day} ${messageTime.hour}:${messageTime.min}`;
    }
});

/**
 * 格式化联系人姓名
 * @param {String} contactName 联系人姓名（未格式化的）
 * @return {String} 格式化后的联系人姓名
 */
Vue.filter('formatContactName', contactName => {
    if (contactName) {
        if (contactName.endsWith("{#先生}")) {
            return `${contactName.replace("{#先生}", "")}（先生）`;
        }
        else if (contactName.endsWith("{#女士}")) {
            return `${contactName.replace("{#女士}", "")}（女士）`;
        }
        else {
            return contactName;
        }
    }
    else return '';
});


/**
 * 格式化商品数量显示
 * @param {Number} amount 商品数量
 * @return {String} 格式化后的商品数量
 */
Vue.filter('formatAmount', amount => {
    return typeof amount !== "number" ? `x NaN` : `x ${amount}`;
});

/**
 * 格式化价格显示
 * @param {Number} price 价格
 * @return {String} 格式化后的价格
 */
Vue.filter('formatPrice', price => {
    return typeof price !== "number" ? `￥NaN` : `￥${price / 100.0}`;
});