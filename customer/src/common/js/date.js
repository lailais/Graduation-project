export function getTemplateDate(date, temp) {
  // "yyyy-MM-dd hh:mm 2018-08-07 13:25"
  // "yy-M-d hh:mm  18-8-7  13:25"
  temp = temp.replace(/(y+)/, function (str) {
    let value = String(date.getFullYear())
    return value.substr(4 - str.length)
  })
  let reg = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let key in reg) {
    temp = temp.replace(new RegExp(`(${key})`), function (str) {
      let value = String(reg[key])
      return str.length === 1 ? value : ('00' + value).substr(value.length)
    })
  }
  return temp
}
