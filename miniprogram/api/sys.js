
var util = require('../utils/util.js')
var network = require('../utils/network.js')
var user_api = require('./user.js')

const SCREEN_SIZE = 'screenSize';
const USER_WX_INFO = 'userWxInfo';
const OPENID = 'openid';


var userWxInfo; // 用户的微信信息
var openid;

/**
 * 回调
 */
function onCallBack(callBack, res){
  if (typeof callBack == 'function'){
    if (typeof res != 'undefined') {
      callBack(res);
    } else {
      callBack();
    }
  }

}

/**
 * 获取屏幕尺寸
 */
function getWindowSize(callBack){
  console.log('获取屏幕尺寸')
  var screenSize = util.getStorage(SCREEN_SIZE);
  if(screenSize){
    onCallBack(callBack,screenSize);
    return;
  }

  wx.getSystemInfo({
    success: function(res) {
      var screenSize = {
        width: res.windowWidth,
        height: res.windowHeight
      }
      
      util.setStorage(SCREEN_SIZE,screenSize);
      onCallBack( callBack,screenSize);
    }
  })
}


function getUserWxInfo(callBack){
  console.log("获取用户微信信息");

  wx.getUserInfo({
    success: res => {
      console.log(res.userInfo)

      var localUserInfo = util.getStorage(USER_WX_INFO);
      if (localUserInfo){
        compareUserInfo(localUserInfo,res.userInfo);       
      }    
      setUserWxInfo(res.userInfo);  
      onCallBack(callBack,res.userInfo);
    }
  })
}

function compareUserInfo(localUserInfo,userInfo){
  console.log(localUserInfo)
  console.log(userInfo)
  if (localUserInfo.nickName != userInfo.nickName || localUserInfo.avatarUrl != userInfo.avatarUrl){
    console.log('asdsad')
    user_api.update(userInfo, openid);  
    util.setStorage(USER_WX_INFO, userInfo);
  }
}

function setUserWxInfo(userWxInfoData){
  userWxInfo = userWxInfoData;
}

function getUserWxInfoObj(){
  return userWxInfo;
}

function setOpenid(openidData){
  openid = openidData
}

function getOpenid(){
  return openid;
}

/**
 * 登录获取oenid
 */
function login(callBack){
  var param = {name:'login',data:null}

  network.cloudRequest(param).then(res=>{
      var openid = res.result.openid;
    console.log('openid:' + openid)
      setOpenid(openid);
      onCallBack(callBack,openid);
  })
}

module.exports = {
  getWindowSize: getWindowSize,
  getUserWxInfo: getUserWxInfo,
  getUserWxInfoObj: getUserWxInfoObj,
  login: login,
  setUserWxInfo: setUserWxInfo,
  getOpenid: getOpenid
}
