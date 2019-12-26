// pages/class/class.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: app.globalData.navHeight,
    showData: [],
    img_wh:0,
    nvabarData: {
      show: false,
      title: '分类',
    },
    queryResult: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadData(this)
  },

  loadData:function(that){

    wx.cloud.callFunction({
      name: 'getAllCategory',
      success: function (res) {
        console.log(res.result.data)
        that.setData({
          queryResult: res.result.data,
          img_wh: Math.floor(app.globalData.windowWidth * 0.2)
        }) 
      }, fail: function (res) {
        console.log(res)
      }
    })
  },

  async getType(){
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
     return await db.collection('ctae_type').get({
      success: res => {
        console.log('1', res.data)
        return res.data;
      }
    })
  },

  getCategory(){
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    return db.collection('category').get({
      success: res => {
        return res.data; 
      }
    })
  },

  click(){
    wx.showToast({
      icon: 'none',
      title: '小编努力编排中，敬请期待',
    })
  }
})