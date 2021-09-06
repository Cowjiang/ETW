/**
 * 时间格式化过滤器
 * @param {time} 时间戳或者时间对象
 * @param {type} 时间类型
 */
export function dateFilter(time, type) {
  var date;
  //判断传入的是时间戳还是时间对象
  if (time instanceof Date) {
    date = time;
  } else {
    date = new Date(time);
  }
  var y = date.getFullYear();
  var m =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1) * 1
      : date.getMonth() + 1;
  var d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  var h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  var minute =
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  var second =
    date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
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
}
export function discountFilter(number) {
  if (number < 1) {
    return number * 10 + "折";
  }
}
