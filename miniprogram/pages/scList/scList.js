// miniprogram/pages/scList/scList.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: app.globalData.navHeight,
    nvabarData: {
      show: true,
      title: '',
    },
    caipuList:[],
    start:0 // 获取菜谱列表分页起始
  },

  onLoad: function (options) {
    
    this.data.caidan_id = options.caidan_id
    this.data.curCdIndexOnpre = options.curIndex; // 当前菜单在上一个页面中收藏数组的下标
    this.setData({
      'nvabarData.title':options.name
    })

    this.getCaipuList(this.data.start)
  },


  
  onPullDownRefresh() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    this.data.caipuList = []
    this.data.start = 0
    this.getCaipuList(this.data.start)
    setTimeout(function () {
      wx.stopPullDownRefresh();
      wx.hideLoading();
    }, 500)

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getCaipuList(this.data.start)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /*****************/
  editClick(){
    var that = this;

    wx.showModal({
      title: '提示',
      content: '确定删除这个菜单吗？',
      success(res) {
        if (res.confirm) {
          that.deleteCaidan(that);
          var pages = getCurrentPages();
          var prePage = pages[pages.length - 2]
          prePage.data.sou_cang.splice(that.data.curCdIndexOnpre,1)
          prePage.setData({
            sou_cang: prePage.data.sou_cang
          })

          wx.navigateBack()
        }
      }
    })
  },
  deleteCaidan(that){
    wx.cloud.callFunction({
      name: 'remove',
      data: {
        table: 'caidan',
        condition: {
          _id: that.data.caidan_id,
        }
      }
    })
      .then(res => {
        wx.cloud.callFunction({
          name: 'remove',
          data: {
            table: 'sc',
            condition: {
              caidan_id: that.data.caidan_id,
            }
          }
        })
      })
  },

  itemClick(e){
    var index = e.currentTarget.dataset.index;
    console.log(index)
    var caipu_id = this.data.caipuList[index]._id;
    var user_id = this.data.caipuList[index].user_id
    console.log(caipu_id)
    console.log(user_id)
    wx.navigateTo({
      url: '/pages/detail_cp/detail_cp?caipu_id=' + caipu_id + "&user_id=" + user_id
    })
  },
  delItemClick(e){
    console.log(e)
    var that = this;
    var index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '提示',
      content: '确定删除这个菜谱吗？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.cloud.callFunction({
            name:'remove',
            data:{
              table:'sc',
              condition:{
                caidan_id:that.data.caidan_id,
                caipu_id:that.data.caipuList[index]._id
              }
            }
          })

          wx.showToast({
            icon:'none',
            title: '删除成功',
            success:function(){
              that.data.caipuList.splice(index,1); // 本地数组删除
              that.setData({
                caipuList: that.data.caipuList
              })
            }
          })
        }
      }
    })
  },

  // 获取菜单中菜谱数据
  getCaipuList(start){
    var that = this;

    wx.cloud.callFunction({
      name:'getScList',
      data:{
        caidan_id:that.data.caidan_id,
        start: start
      },
      success:res=>{
        console.log(res)
        var count = res.result.length // 获取的实际个数
        that.data.start += count;
        that.setData({
          caipuList: that.data.caipuList.concat(res.result)
        })
      }
    })
  },
})