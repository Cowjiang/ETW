/**
 *验证类
 *@param {Object} data 需要验证的数据，格式为 {username:"abc"}
 *@param {Array} rules 验证的规则，格式为 [{key:"abc"，require:true,regExp: ["email", "phone"]}]
 *@return {Object} 错误信息
 **/
class Validator {
  //class类必需的构造函数
  constructor() { }
  //验证方法
  validate(data, rules) {
    let validatedInfos = {}; //存放验证错误信息
    //遍历数组中每个数据对应的每个规则对象
    rules.forEach((rule) => {
      let value = data[rule.key]; //获取这个规则验证的数据
      //判断是否必需
      if (rule.required) {
        let info = this.required(value);//验证后信息
        if (info.required) {
          this.setDefaultObj(validatedInfos, rule.key);
          validatedInfos[rule.key] = info;
        } else {
          this.setDefaultObj(validatedInfos, rule.key);
          validatedInfos[rule.key] = info;
          return; // 当必须的值为空时，直接返回不再执行
        }
      }
      //过滤key和require这两个键
      let restKeys = Object.keys(rule).filter(
        (key) => key !== "key" && key !== "required"
      );
      //遍历剩下的规则
      restKeys.forEach((restKey) => {
        if (this[restKey]) {
          let info = this[restKey](value, rule[restKey]);//验证后信息
          this.setDefaultObj(validatedInfos, rule.key);
          validatedInfos[rule.key][restKey] = info;

        } else {
          throw `${restKey} 规则不存在`;
        }
      });
    });
    // 返回验证信息
    return validatedInfos;
  }
  //各个验证规则
  //必填
  required(value) {
    if (!value && value !== 0) {
      return { "required": false };
    } else {
      return { "required": true };
    }
  }
  //最小长度
  minLength(value, l) {
    if (value.length <= l) {
      return { "minLength": true }
    } else {
      return { "minLength": false }
    }
  }
  //正则表达式
  regExp(value, regExpArray) {
    // regExp 可以是用户自定义的正则也可以是内置的
    let regExpInfos = [];
    regExpArray.forEach((regExpName) => {
      switch (regExpName) {
        case "phone":
          if (!/^1\d{10}$/.test(value)) {
            regExpInfos.push("手机格式错误");
          }
          break;
        case "email":
          if (!/^([a-zA-Z0-9]+[-_\.]?)+@[a-zA-Z0-9]+\.[a-z]+$/.test(value)) {
            regExpInfos.push("邮箱格式错误");
          }
          break;
        default:
          //自定义正则
          if (!regExp.test(value)) {
            regExpInfos.push("格式错误");
          }
          break;
      }
    });
    return regExpInfos;
  }
  //生成对象便于赋值
  setDefaultObj(obj, key) {
    obj[key] = obj[key] || {};
  }
}

export { Validator };
