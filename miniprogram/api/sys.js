
var util = require('../utils/util.js')

const SCREEN_SIZE = 'screenSize';
const USER_WX_INFO = 'userWxInfo';


var userWxInfo; // 用户的微信信息

/**
 * 回调
 */
function onCallBack(res,callBack){
  if(typeof callBack == 'function'){
    callBack(res);
  }
}

/**
 * 获取屏幕尺寸
 */
function getWindowSize(callBack){
  console.log('获取屏幕尺寸')
  var screenSize = util.getStorage(SCREEN_SIZE);
  if(screenSize){
    onCallBack(screenSize, callBack);
    return;
  }

  wx.getSystemInfo({
    success: function(res) {
      var screenSize = {
        width: res.windowWidth,
        height: res.windowHeight
      }
      
      util.setStorage(SCREEN_SIZE,screenSize);
      onCallBack(screenSize, callBack);
    }
  })
}


// function getLocalUserWxInfo(callBack){
//   console.log("获取用户微信信息")
//   var userWxInfo = util.getStorage(USER_WX_INFO);
//   if(userWxInfo){
//     onCallBack(userWxInfo,callBack);
//     return;
//   }

//   wx.getUserInfo({
//     success:res=>{
//       console.log(res.userInfo);
//       util.setStorage(USER_WX_INFO,res.userInfo);
//       onCallBack(userWxInfo, callBack);
//     },
//     fail:res=>{
//       console.log(res);
//       onCallBack(res,callBack);
//     }
//   })
// }

function getUserWXInfo(callBack){
  console.log("获取用户微信信息");

  var that = this;
  wx.getUserInfo({
    success: res => {
      var localUserInfo = util.getStorage(USER_WX_INFO);
      if (localUserInfo){
        that.compareUserInfo(localUserInfo,res.userInfo);       
      }
      util.setStorage(USER_WX_INFO, res.userInfo);
      that.setUserWxInfo(res.userInfo);
      
      onCallBack(res.userInfo,callBack);
    }
  })
}

/**比较用户的微信信息是否有变动，有则更新数据表 */
function compareUserInfo(localUserInfo,userInfo){

  if(localUserInfo.nickName != userInfo.nickName){
    // 更新数据库用户昵称
    // TODO
    
  } 
  if (localUserInfo.avatarUrl != userInfo.avatarUrl){
    // 更新数据库用户头像
    //TODO

  }

}

function checkIsNewUser(callBack){

}

function setUserWxInfo(userWxInfo){
  this.userWxInfo = userWxInfo;
}

function getUserWxInfo(){
  return this.userWxInfo;
}

module.exports = {
  getWindowSize: getWindowSize,
  getUserWxInfo: getUserWxInfo
}
