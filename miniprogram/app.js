//app.js
App({
  // 全局变量
  globalData: {
    height: 0
  },

  onLaunch: function() {
    // this.getUserMsg();
    this.getStatusBar(); // 获取状态栏数据

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
  },

  /***自定义函数*/
  // 获取状态栏信息
  getStatusBar(){
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.height = res.statusBarHeight; // 状态栏高
        let statusBarHeight = res.statusBarHeight;
        this.globalData.navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2; //导航高度
        this.globalData.navTop = menuButtonObject.top, //胶囊按钮与顶部的距离;
        this.globalData.windowHeight = res.windowHeight; // 屏幕高
        this.globalData.windowWidth = res.windowWidth; // 屏幕宽
      }
    })
  },

  // 获取用户信息
  getUserMsg() {
    wx.getSetting({  // 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限。
      success: res => {
         
        // 检验是否授权已经授权
        // if (res.authSetting['scope.userInfo']) {
          console.log("app: " + "用户已经授权")
          var that = this;
          wx.cloud.callFunction({
            name: "login",
            success: res => {
              console.log(res)
              this.globalData.openid = res.result.openid

              wx.getUserInfo({
                success: res => {
                  that.globalData.userInfo = res.userInfo
                  that.globalData.hasUserInfo = true
                  console.log(res.userInfo)
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (that.userInfoReadyCallback) {
                    that.userInfoReadyCallback(res)
                  } 
                  wx.cloud.callFunction({
                    name:'updateTx',
                    data:{
                      openid:that.globalData.openid,
                      avatarUrl: res.userInfo.avatarUrl
                    }
                  }).then(res=>{
                    console.log("更新头像",res)
                  })               
                },
                fail: (res) => {
                  console.log("app: " + "获取用户信息失败")
                }
              })
            }
          })        
        // }
      }
    })
  }
})