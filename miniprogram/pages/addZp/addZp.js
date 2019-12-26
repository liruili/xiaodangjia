import { formatFileName } from "../../utils/util.js"
const app = getApp();

Page({

  data: {
    top: app.globalData.navHeight,
    win_width:app.globalData.windowWidth,
    win_height:app.globalData.windowHeight,
    nvabarData: {
      show: true,
      title: '添加作品',
    },
    prewHidden:true,
    curIndex:0, // 当前预览图的下标
    files:[],
    imgID:[],
    content:''
  },


  onLoad(options) {
    this.data.caipu_id = options.caipu_id; // 获取菜谱ID
  },

  contentInput(e){
    this.data.console = e.detail.value
  },
 
  //获取上传图片
  addClick(e) {
    var that = this
    if (that.data.files.length <5){
      wx.chooseImage({
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        count:5,
        success: function (res) {

          that.setData({
            files: that.data.files.concat(res.tempFilePaths).slice(0,5) // 保证最多5个
          })
          console.log(that.data.files)
        },
      })
    }else{
      wx.showToast({
        icon:'none',
        title: '最多选择5张！',
      })
    }
    
  },
  // 预览图片
  previewImage: function (e) {
    console.log(e.currentTarget.dataset.index)
    this.setData({
      prewHidden:false,
      curIndex: e.currentTarget.dataset.index
    })
  },
  // 点击图片外区域取消预览
  cancleClick(){
    this.setData({ prewHidden: true, curIndex: 0})
  },
  // 删除图片
  delClick(e){
   
    this.data.files.splice(this.data.curIndex, 1);

    if (this.data.curIndex == this.data.files.length) {
      this.data.curIndex = this.data.files.length - 1;
    }

    this.setData({
      files: this.data.files,
      curIndex: this.data.curIndex
    })

    if (this.data.files.length == 0){
      this.cancleClick();
    }
  },
  // 滑动监听
  itemChange(e){
    console.log(e)
    this.data.curIndex = e.detail.current
  },

  submit(){
    wx.showLoading({
      title: '提交中',
    })
    var promiseArr = this.uploadImg();
    const db = wx.cloud.database()
    var that = this;
    Promise.all(promiseArr).then(res => { 
      this.data.imgID.sort()
      db.collection('zp').add({
        data: {
          content: this.data.content,
          imgs: this.data.imgID,
          user_id: app.globalData.openid,
          caipu_id: this.data.caipu_id,
          good_count:0,
          date:new Date(),
        }
      })
      .then(res => {
          wx.hideLoading();
          wx.showToast({
            icon:'none',
            title: '发布成功',
          });
          wx.navigateBack();
      }) 
    })
  },
  uploadImg() {
    const promiseArr = []
    var imgs = this.data.files;
    console.log(imgs)
    for (let i = 0; i < imgs.length; i++) {
      let filePath = imgs[i]
      console.log(filePath)
      let suffix = /\.[^\.]+$/.exec(filePath)[0]; // 正则表达式，获取文件扩展名
      //在每次上传的时候，就往promiseArr里存一个promise，只有当所有的都返回结果时，才可以继续往下执行
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath: "zp/" + app.globalData.openid + "/" + formatFileName(new Date()) + '_' + i + suffix,
          filePath: filePath, // 文件路径
        }).then(res => {
          console.log(res)
          this.setData({
            imgID: this.data.imgID.concat(res.fileID)
          })
          reslove()
        }).catch(error => {
          console.log(error)
        })
      }))
    }
    return promiseArr;
  },

})
