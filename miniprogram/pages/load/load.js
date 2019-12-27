var sys = require('../../api/sys.js')
Page({


  data: {

  },

  onLoad: function (options) {

    sys.getWindowSize(res=>{
      console.log(res)
    })

    this.getUserWxInfo()
  },

  getUserWxInfo:function(){
    var that = this;
    wx.getSetting({ 
      success: res => {
        // 检验是否授权已经授权
        if (res.authSetting['scope.userInfo']) {
          sys.getUserWxInfo(() => {
            that.toIndex();
          })
        }else{
          that.toIndex();
        }
      }
    })
  },


  toIndex:function(){
    setTimeout(()=>{
      wx.switchTab({
        url: '../index/index',
      })
    },1000);
  }
})