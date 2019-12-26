// pages/detail_cp/detail_cp.js
const app = getApp()
const ImgLoader = require('../../components/img-loader/img-loader.js')
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSelf:true,
    caipu:{},
    detail:{},
    user:{},
    nvabarData: {
      show: true,
      title: "",
    },
    top: app.globalData.navHeight,
    isShow:false,
    sc_img:"../../img/icons/like.png",
    wheight: app.globalData.windowHeight + 42,
    scHeight: app.globalData.windowHeight * 0.6,
    moveData:null,
    baseShow:false,
    caidan:[],
    zp:[],
    isShowCaidanList:true,
    cdName:'',
    cdContent:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    wx.showLoading({
      title: '加载中...',
    })
    setTimeout(function () {
      wx.hideLoading()
      that.setData({isShow:true})
    }, 1000) 

    console.log("详情页")
    console.log(options)
    this.data.caipu_id = options.caipu_id;
    this.data.user_id = options.user_id;

    wx.cloud.callFunction({
      name: 'getCaipuDetail',
      data:{
        caipu_id: that.data.caipu_id,
        user_id: that.data.user_id,
        cur_user_id:app.globalData.openid
      },
      success: function (res) {
        console.log(res)
        that.setData({
          detail: res.result.detailData[0],
          user: res.result.userData[0],
          zp: res.result.zp.list,
          isSelf : app.globalData.openid == res.result.detailData[0].user_id
        })
        
      }, fail: function (res) {
        console.log(res)
      }
    });

    this.getMenuList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.detail.title,
      imageUrl: this.data.detail.cover_img.src
    }
  },

  // 关注点击
  gzClick(){
    if (this.data.detail.isgz){
      console.log('取消关注')
      wx.cloud.callFunction({ // 删除只能在服务端执行
        name:'remove',
        data:{
          table:'guan_zhu',
          condition:{
            gz_id: this.data.detail.user_id,
            user_id: app.globalData.openid
          }
        }
      })

      this.setData({
        'detail.isgz': false
      })
      
    }else{
      console.log('关注')
      db.collection('guan_zhu').add({
        data:{
          gz_id:this.data.detail.user_id,
          user_id:app.globalData.openid
        }
      })
     
      this.setData({
        'detail.isgz':true
      })
   
    }
  },
  // 收藏点击
  onSouCang(){
    if(this.data.detail.issc){
      wx.cloud.callFunction({
        name:'remove',
        data:{
          table:'sc',
          condition: {
            user_id: app.globalData.openid,
            caipu_id: this.data.detail._id,
          }
        }
      })

      wx.showToast({
        icon:'none',
        title: '已从收藏夹移除',
      })
      this.setData({
        'detail.issc':false
      })
    }else{
      this.showScMenu(); 
    }
  },

  // 获取菜单列表
  getMenuList(){
    var that = this
    // 获取菜单数据
    wx.cloud.callFunction({
      name: 'getCaidan',
      data: {
        user_id: app.globalData.openid
      },
      success: res => {
        console.log(res);
        that.setData({
          caidan: res.result
        })
      }
    })
  },

  // 取消搜藏
  cancleSc(){
    this.hiddenScMenu(false)
  },

  /***************/
  // 显示搜藏菜单列表
  showScMenu(){
    var that = this
    wx.createSelectorQuery().select('#footer').fields({
      size: true,
      rect: true
    }, function (res) {
      console.log(res)
      var anim = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease',
      });
      anim.translate(0, -that.data.scHeight).opacity(1).step({ duration: 200 })
      that.setData({
        moveData: anim.export(),
        baseShow: true
      })
    }).exec()
  },
  // 隐藏搜藏菜单列表
  hiddenScMenu(bashShow){
    var anim = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease',
    });
    anim.opacity(0).translate(0, this.data.scHeight).step({ duration: 200 })
    this.setData({
      moveData: anim.export(),
      baseShow: bashShow,
      isShowCaidanList:true
    })
  },

  // 添加收藏
  addSc(e){
    console.log(e)
    var index = e.currentTarget.dataset.index;
    db.collection('sc').add({
      data:{
        caidan_id: this.data.caidan[index]._id,
        caipu_id: this.data.detail._id,
        user_id:app.globalData.openid,
        date: new Date()
      }
    });

    this.hiddenScMenu(false);
    this.setData({
      'detail.issc':true
    })
    wx.showToast({
      duration:1000,
      title: '已添加至' + this.data.caidan[index].name,
    })
  },

  createCaidan(){
    this.setData({
      isShowCaidanList:false
    })
  },
  cdNameInput(e){
    this.setData({
      cdName:e.detail.value
    })
  },

  contentInput(e){
    this.setData({
      cdContent: e.detail.value
    })
  },
  // 创建并添加到菜单
  addCaidan(){
    var that = this;
    var cdName = this.data.cdName.trim()
    var cdContent = this.data.cdContent.trim()

    if (cdName.length < 1 || cdContent.length < 1){
      this.showToast('none', '还有内容待输入...', 1000)
    }else{
      db.collection('caidan').add({
        data:{
          name: cdName,
          content: cdContent,
          user_id: app.globalData.openid
        }
      })
      .then(res=>{
        console.log(res)
        db.collection('sc').add({
          data: {
            caipu_id: that.data.detail._id,
            caidan_id: res._id,
            user_id: app.globalData.openid
          }
        })
      })
      this.showToast('none', '已添加至：' + cdName,1500)
      this.hiddenScMenu(false);
      this.setData({
        'detail.issc':true
      })
    }
  },
  addZpClick(){
    wx.navigateTo({
      url: '/pages/addZp/addZp?caipu_id=' + this.data.detail._id,
    })
  },
  AllZpClick(){
    wx.showToast({
      icon:'none',
      title: '吭哧吭哧...',
    })
  },
  zpDetailClick(){
    wx.showToast({
      icon: 'none',
      title: '吭哧吭哧...',
    })
  },
  // 显示toast
  showToast(icon,msg,duration){
    wx.showToast({
      icon: icon,
      title: msg,
      duration: duration
    })
  }
})