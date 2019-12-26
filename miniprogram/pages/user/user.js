
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: app.globalData.navHeight,
    nvabarData: {
      show: false,
      title: '',
    },
    isAuthor:false,
    date:'',
    tab_list:["收藏","菜谱","作品"],
    current:0,
    sou_cang:[],
    myCaipu:[],
    myZp:[],
    gzCount:0,
    funsCount:0
  },

  onLoad:function(){
    this.checkAuthor();
    if(this.data.isAuthor){
      // this.getUser();
      this.getMySc();
      this.getMycaipu();
      this.getUserMsg();
    }
  },

  onShareAppMessage(){
    return {
      path:"/pages/index/index"
    }
  },
  onPullDownRefresh(){
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })

    setTimeout(function(){
      wx.stopPullDownRefresh();
      wx.hideLoading();
      that.onLoad();
    },500)
    
  },

  getUserMsg(){
    console.log("getUserMsg", app.globalData.openid)
    wx.cloud.callFunction({
      name:'getUserMsg',
      data: {
        user_id: app.globalData.openid
      }
    }).then(res=>{
      var result = res.result;
      console.log(result)
      this.setData({
        date: result.date.list[0].year,
        gzCount:result.gzCount.total,
        funCount:result.funsCount.total
      })
    })
  },

  // 获取我的菜谱
  async getMycaipu(){
    var that = this;
    const db = wx.cloud.database();
    const $ = db.command.aggregate;

    db.collection("caipu").aggregate().match({
      user_id:app.globalData.openid
    }).sort({ create_date: -1 })
      .project({
      _id: 1,
      title:1,
      cover_img:1,
      year: $.dateToString({
        date: '$create_date',
        format: '%Y-%m'
      })
    }).end({
      success:function(res){
        console.log(res)
       that.setData({
         myCaipu:res.list
       })
      }
    })
  },

  // 获取我的收藏
  getMySc(){
    var that = this;
    wx.cloud.callFunction({
      name: "getSouCang",
      data:{
        user_id: app.globalData.openid
      },
      success: res => {
        console.log(res)
        that.setData({ sou_cang: res.result})
        console.log(that.data.sou_cang[0].list[0].cover_img)
      }
    })
  },

  // 第一次使用时验证授权
  checkAuthor(){
    console.log(app.globalData.hasUserInfo)
    if(app.globalData.hasUserInfo){
      this.setData({
        isAuthor:true
      })
    }
  },
  
  // 授权验证按钮监听函数
  getUserInfo: function (e) {
    var that = this;

    wx.cloud.callFunction({
      name:"login",
      success:res=>{
        console.log(res)
        app.globalData.openid = res.result.openid
        if (e.detail.userInfo) {
          console.log(e.detail.userInfo)
          that.setData({
            isAuthor: true
          })
          app.globalData.userInfo = e.detail.userInfo
          app.globalData.hasUserInfo = true;
          that.addUser();
          // 首次登陆后获取数据
          that.getMySc();
          that.getMycaipu();
        }
      }
    })  
  },
  // 新用户进来
  addUser(){
    const db = wx.cloud.database();
    // 首先确认数据库没有当前用户
    db.collection('user').where({
      user_id: app.globalData.openid 
    }).count().then(res => {
      console.log(res.total)
      if(res.total == 0){
        db.collection("user").add({
          data: {
            name: app.globalData.userInfo.nickName,
            touxiang: app.globalData.userInfo.avatarUrl,
            guan_zhu: [],
            my_caipu: [],
            my_zuopin: [],
            sou_cang: [],
            user_id: app.globalData.openid,
            date:new Date()
          }
        });
      }
    })
    
  },
  // tab点击监听
  selected(e){
    console.log(e)
    this.setData({
      current: e.currentTarget.dataset.current
    })
  },

  addClick(){
    wx.navigateTo({
      url: '/pages/addCaipu/addCaipu'
    })
  },
  caipuClick(e){
    var index = e.currentTarget.dataset.index;
    console.log(index)
    console.log(this.data.myCaipu)
    console.log(this.data.myCaipu[index]._id)
    wx.navigateTo({
      url: '/pages/detail_cp/detail_cp?caipu_id=' + this.data.myCaipu[index]._id + 
      "&user_id=" + app.globalData.openid,
    })
  },
  scItemClick(e){
    var index = e.currentTarget.dataset.index;
    var caidan_id = this.data.sou_cang[index]._id
    var caidan_name = this.data.sou_cang[index].name
    wx.navigateTo({
      url: '/pages/scList/scList?caidan_id=' + caidan_id + '&name=' + caidan_name+
      '&curIndex='+index
    })
  }
})