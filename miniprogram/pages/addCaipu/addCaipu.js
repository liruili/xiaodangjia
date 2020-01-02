import {formatFileName} from "../../utils/util.js"
var caipu_url = require('../../api/caipu.js')
var sys = require('../../api/sys.js')
var util = require('../../utils/util.js')

const app = getApp()

function Yl(){
  return {
    name:'',
    yong_liang:''
  }
}

function Steps(){
  return {
    pic_url:"",
    describe:""
  }
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: app.globalData.navHeight,
    nvabarData: {
      show: true,
      title: '添加菜谱',
    }, 
    title:"",
    content:'',
    coverImg:[],
    imgID:[], // 上传图片返回的地址
    steps: [{ pic_url:"",describe:""}],
    yl_input:[0],
    yl_text:[{name:'',yong_liang:''}],
    yl_flag:true,
    step_flag:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  setTitleValue(e){
    this.data.title = e.detail.value
  },
  setContentValue(e){
    this.data.content = e.detail.value
  },

  setCoverImg(){
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success(res) {
            that.data.width = res.width
            that.data.height = res.height
          }
        })
        
        that.setData({
          coverImg: res.tempFilePaths
        });
      }
    })
  },

  setStepImg(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var oldSteps = this.data.steps;

    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        oldSteps[index].pic_url = res.tempFilePaths[0]
        that.setData({
          steps: oldSteps
        });
      }
    })
  },

  submit(){
    var that = this;
    if(this.check()){
      wx.showLoading({
        title: '提交中',
      })
      this.saveToDB(this.uploadImg());
    }
  },

  check(){
    var data = this.data;
    var msg;
    var result = true;
    if (data.coverImg.length == 0 || data.coverImg[0].length == 0){
      msg = "请设置封面图片";
      result = false;
    }else if(data.title.length == 0){
      msg = '请设置菜单标题'
      result = false;
    }else{
      for (var i = 0; i < data.steps.length; i++) {
        var step = data.steps[i]
        if (step.pic_url.length == 0 || step.describe.length == 0) {
          msg = "请将步骤填写完整";
          result = false;
          break;
        }
      }
      for (var i = 0; i < data.yl_text.length;i++){
        var ylObj = data.yl_text[i]
        if (ylObj.name.length == 0 || ylObj.yong_liang.length == 0){
          msg = "请将用料填写完整";
          result = false;
          break;
        }
      }    
    }

    if(result){
      return true;
    }else{
      wx.showToast({
        icon: 'none',
        title: msg,
      })
      return false;
    }
  },

  saveToDB(promiseArr){
    Promise.all(promiseArr).then(res => {
      var steps = this.data.steps;
      for (var i = 0; i < steps.length; i++){
        steps[i].pic_url = res[i+1];
      }

      caipu_url.add({
        title: this.data.title,
        jie_shao: this.data.content,
        cover_img: { src: res[0], width: this.data.width, height: this.data.height },
        yl: this.data.yl_text,
        bz: steps,
        user_id: sys.getOpenid()
      }).then(res => {
        wx.hideLoading();
        util.showToast('添加成功')
        wx.navigateBack()
      })
    })
  },

  uploadImg(){
    const promiseArr = []

    var imgs = this.data.coverImg;
    for (let i = 0; i < this.data.steps.length;i++){
      imgs.push(this.data.steps[i].pic_url);
    }

    for (let i = 0; i < imgs.length; i++) {
      let filePath = imgs[i]

      let suffix = /\.[^\.]+$/.exec(filePath)[0]; // 正则表达式，获取文件扩展名
    
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath: "caipu/" + app.globalData.openid + "/" + util.formatFileName(new Date())+'/'+i + suffix,
          filePath: filePath, // 文件路径
        }).then(res => {
          reslove(res.fileID)
        })
      }))
    }
    return promiseArr;
  },

  //用料设置按钮
  ylModifyClick(){
    this.setData({
      yl_flag:!this.data.yl_flag
    })
  },
  // 用料添加行
  ylAddClick(){
    var yl_text = this.data.yl_text;
    yl_text.push(new Yl());
    this.setData({
      yl_text: yl_text,
    })
  },

  // 删除用料
  deleteYl(e){
    var delIndex = e.currentTarget.dataset.index;
    var yl_text = this.data.yl_text;
    if (yl_text.length > 1){
      yl_text.splice(delIndex, 1);
      this.setData({
        yl_text: yl_text
      })
    }else{
      util.showToast('留一个吧')
    }
  },
  setYlValue(e){
    console.log(e)
    var indexData = e.currentTarget.dataset.index;
    var index = indexData.split('_')[0];
    var flag = indexData.split('_')[1];
    var val = e.detail.value;//获取输入的值
    var oldVal = this.data.yl_text;
    if(flag == "L"){
      oldVal[index].name = val;//修改对应索引值的内容
    }else{
      oldVal[index].yong_liang = val;//修改对应索引值的内容
    }
    this.setData({
      yl_text: oldVal
    })
  },
  // 步骤添加
  stepAddClick(){
    var steps = this.data.steps;
    steps.push(new Steps());
    this.setData({
      steps: steps,
    })
  },
  setStepValue(e){
    console.log(e)
    var index = e.currentTarget.dataset.index;
    var val = e.detail.value;//获取输入的值
    var oldVal = this.data.steps;
    oldVal[index].describe = val;//修改对应索引值的内容
    this.setData({
      steps: oldVal
    })
  },
  stepModifyClick(){
    this.setData({
      step_flag: !this.data.step_flag,
    })
  },
  deleteStep(e){
    var delIndex = e.currentTarget.dataset.index;
    var steps = this.data.steps;
    if (steps.length > 1) {
      steps.splice(delIndex, 1);
      this.setData({
        steps: steps
      })
    } else {
      util.showToast('留一个吧')
    }
  },
  

})