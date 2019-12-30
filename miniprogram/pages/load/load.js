var sys = require('../../api/sys.js')
var user_api = require('../../api/user.js')

Page({
  data: {

  },

  onLoad: function (options) {

    sys.getWindowSize()

    this.getUserWxInfo()
  },

  getUserWxInfo:function(){
    var that = this;
    wx.getSetting({ 
      success: res => {
        // 检验是否授权已经授权
        if (res.authSetting['scope.userInfo']) {
          sys.login((openid) => {
            sys.getUserWxInfo((userInfo) => {
              user_api.update(userInfo, openid);  // 每次进入先把数据库用户数据更新
              that.toIndex();
            })
          })        
        }else{
          that.toIndex();
        }
      },
      fail:res=>{
        console.log(res)
      }
    })
  },


  toIndex:function(){
    setTimeout(()=>{
      wx.switchTab({
        url: '../index/index',
      })
    },500);
  }
})