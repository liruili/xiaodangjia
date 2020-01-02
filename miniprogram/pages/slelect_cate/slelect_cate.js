var cate_api = require('../../api/category.js')
var util = require('../../utils/util.js')

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: app.globalData.navHeight,
    nvabarData: {
      show: true,
      title: '菜谱分类',
    },
    hidden:true, 
    p_index: 0,
    actived: [],
    max: 3,
    count:0,
    items:[],
    selectd:[]
  },

  onLoad(options){
    wx.showLoading({
      title: '加载中',
    })

    if (options.actived != 'undefined'){
      var actived = JSON.parse(options.actived);
      this.setData({ actived: actived })

      for (var i = 0; i < actived.length; i++) {
        for (var j = 0; j < actived.length; j++) {
          if (actived[i][j] == 1) {
            this.data.count++;
          }
        }
      }
    }  

    this._init();
  },

  _init(){
    cate_api.getCategoryList().then(res => {
      wx.hideLoading();

      var resultList = res.result.list;
      this.setData({
        items: resultList,
        hidden: false
      })

      if(this.data.actived.length == 0){
        var arr = [];
        for (var i = 0; i < resultList.length; i++) {
          arr[i] = new Array(resultList[i].sub_list.length).fill(0);
        }
        this.data.actived = arr;
      }
    })
  },

  lClick(e){
    this.setData({
      p_index:e.currentTarget.dataset.index
    })
  },

  rClick(e){
    
      var index = e.currentTarget.dataset.index;
      var actived = this.data.actived;
      if (actived[this.data.p_index][index] == 0) {
        if (this.data.count < this.data.max) {
          actived[this.data.p_index][index] = 1;
          this.data.count++;
        } else {
          util.showToast('最多选3个')
        }
      } else {
        actived[this.data.p_index][index] = 0;
        this.data.count--;
      }

      this.setData({ actived: actived})    
  },

  submit(){
    var select = [];
    var actived = this.data.actived;

    for(var i = 0;i < actived.length;i++){
      for (var j = 0; j < actived[i].length; j++) {
        if(actived[i][j] == 1){
          select.push({
            p_index: i,
            c_index: j,
            id: this.data.items[i].sub_list[j]._id,
            name: this.data.items[i].sub_list[j].name,
          });
        }
      }
    }

    var pages = getCurrentPages();

    pages[pages.length - 2].setData({
      category: select,
      actived : actived
    })

    wx.navigateBack({})
  }
})