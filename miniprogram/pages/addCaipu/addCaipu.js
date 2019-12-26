// miniprogram/pages/addCaipu/addCaipu.js
import {formatFileName} from "../../utils/util.js"
const app = getApp()

function Yl(){
  return {
    name:'',
    yong_liang:''
  }
}

function Steps(){
  return {
    img:"",
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
    steps:[{img:"",describe:""}],
    yl_input:[0],
    yl_text:[{name:'',yong_liang:''}],
    yl_flag:true,
    step_flag:true,
    modifyYlText:"调整",
    modifyStepText:"调整",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  setTitleValue(e){
    // this.setData({
    //   title: e.detail.value
    // })
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
        var width, height;
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
    console.log(e)
    console.log(index)
    var oldSteps = this.data.steps;
    console.log(oldSteps)
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        oldSteps[index].img = res.tempFilePaths[0]
        that.setData({
          steps: oldSteps
        });
        console.log(that.data.steps)
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
        if (step.img.length == 0 || step.describe.length == 0) {
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
    const db = wx.cloud.database()
    var that = this;
    Promise.all(promiseArr).then(res => {
      var step = this.data.steps;
      console.log(step);
      this.data.imgID.sort()
      for (var i = 0; i < step.length; i++) {
        step[i].img = this.data.imgID[i+1];
      }
      console.log(step);

      db.collection('detail').add({
        data: {
          content: this.data.content,
          cai_liao:this.data.yl_text,
          step:step 
        }
      })
      .then(res => {
        console.log(res)
        var detail_id = res._id;

        db.collection('caipu').add({
          data: {
            cooked_count: 0,
            cover_img: {src:that.data.imgID[0],width:that.data.width,height:that.data.height},
            create_date:new Date(),
            detail_id: detail_id,
            score:0,
            title:that.data.title,
            user_id:app.globalData.openid
          }
        }).then(res=>{
          wx.hideLoading()
          wx.showToast({
            title: '提交成功',
          })
        })
  
      })
      .catch(error => {
        console.log(error)
      })
    })
  },

  uploadImg(){
    const promiseArr = []
    //只能一张张上传 遍历临时的图片数组
    var imgs = this.data.coverImg;
    for (let i = 0; i < this.data.steps.length;i++){
      imgs.push(this.data.steps[i].img);
    }

    console.log(imgs)
    for (let i = 0; i < imgs.length; i++) {
      let filePath = imgs[i]
      console.log(filePath)
      let suffix = /\.[^\.]+$/.exec(filePath)[0]; // 正则表达式，获取文件扩展名
      //在每次上传的时候，就往promiseArr里存一个promise，只有当所有的都返回结果时，才可以继续往下执行
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath: "caipu/" + app.globalData.openid+"/" + formatFileName(new Date())+'_'+i + suffix,
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

  //用料设置按钮
  ylModifyClick(){
    this.setData({
      yl_flag:!this.data.yl_flag,
      modifyYlText: this.data.yl_flag ? "调整完成" : "调整"
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
      wx.showToast({
        icon: 'none',
        title: '留一个吧',
      })
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
      modifyStepText: this.data.step_flag ? "调整完成" : "调整"
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
      wx.showToast({
        icon: 'none',
        title: '留一个吧',
      })
    }
  },
  

})