//index.js
//获取应用实例
const app = getApp()

Page({

  data: {
    leftImg: [],
    rightImg: [],
    tempImg: [],
    leftHeight:0,
    rightHeight:0,
    nvabarData: {
      show: false, 
      title: '', 
    },
    top: app.globalData.navHeight,
    count:0, // 加载的资源个数
    pageSize:5
  },
  onLoad: function() {


    // 加载图片
    this.loadImg();
  },

  onReachBottom(){
    console.log("粗低了")
    this.loadImg()
  },
  onPullDownRefresh() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })

    this.data =  {
      leftImg: [],
      rightImg: [],
      tempImg: [],
      leftHeight: 0,
      rightHeight: 0,
      nvabarData: {
        show: false,
          title: '', 
      },
      top: app.globalData.navHeight,
        count: 0, // 加载的资源个数
        pageSize: 5
    },

    setTimeout(function () {
      wx.stopPullDownRefresh();
      wx.hideLoading();
      that.onLoad();
    }, 500)

  },

  /********函数********/
  async loadImg() {
    var list = await this.pageQuery(this.data.count,this.data.pageSize);
    console.log("query",list.data)
    this.data.tempImg = list.data;
    this.data.count += list.data.length;

    for(var i = 0;i < list.data.length;i++){
      var pic_url = list.data[i].cover_img.src;
      console.log("获取图片宽高：第" + i + "张");
      wx.getImageInfo({
        src: pic_url,
        success:res => {
          console.log(i,res);
        }
      })

    }

    this.renderList();
  },

  renderList() {
    var tempImg = this.data.tempImg;
    var leftHeight = this.data.leftHeight;
    var rightHeight = this.data.rightHeight;
    var leftImg = this.data.leftImg;
    var rightImg = this.data.rightImg;

    for(var item of tempImg){

      var imgW = item.cover_img.width;
      var imgH = item.cover_img.height;

      item.cover_img.width = Math.floor(app.globalData.windowWidth * 0.45);
      item.cover_img.height = Math.floor(app.globalData.windowWidth * 0.45 * imgH / imgW);

      if (leftHeight == 0 || leftHeight <= rightHeight) {
        leftImg.push(item);
        leftHeight += item.cover_img.height
      } else {
        rightImg.push(item);
        rightHeight += item.cover_img.height
      }
    }

    this.setData({
      leftImg:leftImg,
      rightImg:rightImg,
      leftHeight: leftHeight,
      rightHeight: rightHeight});

    this.tempImg = []
    console.log("渲染")
  },

  async pageQuery(start,size){
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    var list = await db.collection('caipu')
      .skip(start) // 跳过结果集中的前 10 条，从第 11 条开始返回
      .limit(size) // 限制返回数量为 10 条
      .get();
    console.log("分页查询完");
    return list;
  },

  /**监听函数***/
  selected(e){

    var flag = e.currentTarget.dataset.flag;
    var index = e.currentTarget.dataset.id;

    var caipu = {};
    if(flag === "left"){
      caipu = this.data.leftImg[index];
    }else{
      caipu = this.data.rightImg[index];
    }

    wx.navigateTo({
      url: '/pages/detail_cp/detail_cp?caipu_id=' + caipu._id+"&user_id="+caipu.user_id
    })
  },
  searchClick(){
    wx.showToast({
      icon:'none',
      title: '努力赶工中...',
    })
  }
})