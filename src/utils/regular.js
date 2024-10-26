/*
 * @Author: Jaycee 
 * @Date: 2021-12-04 17:10:37 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-08-20 11:16:45
 */
let regular = {
  postalCode: /^[0-9]{6}$/, // 邮政编码
  isPhone: /^1[0-9]\d{9}$/g, // 校验手机号
  fixedTelephone: /^\d{3,4}-\d{7,8}(-\d{3,4})?$/g, // 固定电话
  isMailbox: /^[a-zA-Z0-9]+([_.-][a-zA-Z0-9]+)*@([a-zA-Z0-9]+[-_.]?[.])+[a-zA-Z]{2,3}$/, // 校验邮箱
  MatchChinese: /^[\u2E80-\u9FFF]+$/, // 只允许输入中文
  MatchEnglish: /^[a-zA-Z]+$/, // 只允许输入英文
  AllNumber: /^\d+$/, // 只允许数字
  hasPriceNum: /^\d*[.]?\d{1,2}$/, // 0或者正数（允许两位小数）
  integerZero: /^[0-9]\d*$/, // 大于等于0的整数
  positiveNumber: /^\+?[1-9][0-9]*$/, // 大于0的整数
  positiveFloat: /^(?!0+(\.0+)?$)\d+(\.\d{0,2})?$/, // 大于0的浮点数，小数点后不超过两位
  isMoney: /(^([-]?)[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^([-]?)(0){1}$)|(^([-]?)[0-9]\.[0-9]([0-9])?$)/,//验证金额，允许正负数，保留两位小数
  checkIsPositive: /^\d+(?=\.{0,1}\d+$|$)/,//验证正整数+正小数+0(请输入大于等于0的正数)
  checkIsPositiveInteger: /^(0|[1-9][0-9]*)$/,//验证正整数+0(请输入大于等于0的正整数)
  checkIsPositiveIntegerEx0: /^([1-9][0-9]*)$/,//验证正整数(请输入大于0的正整数)
  checkRate: /^([1-9][0-9]{0,1}$)|(^[0-9]{1,2}\.[0-9]{1,2}$)/,//(0-99)保留两位小数
};
export default regular;
