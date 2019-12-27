const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatFileName(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('_') + '_' + [hour, minute, second].map(formatNumber).join('_')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * @param {String} key:键
 * @param data:数据
 * @param {number} validTime:有效时长,单位：秒
 */
function setStorage(key,data,validTime){
  if(typeof validTime == 'undefined'){
    wx.setStorageSync(key, data);
    return;
  }

  if(typeof validTime == 'number') {
    
    data.validTime = Math.abs(validTime);
    data.set_time = new Date().getTime / 1000;
    wx.setStorageSync(key, data); 
  }
}

/**
 * @param {String} key : 键
 */
function getStorage(key){
  var data = wx.getStorageSync(key);

  if(data){
    var curTime = new Date().getTime / 1000;
    if(curTime - data.set_time > data.validTime){
      wx.setStorageSync(key, null);
      return null;
    }
  }

  return data;
}

module.exports = {
  formatTime: formatTime,
  formatFileName: formatFileName,
  setStorage: setStorage,
  getStorage: getStorage
}
