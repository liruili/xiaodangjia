// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  // return event.user_id;
  return await getSc(event.user_id,1);
}

async function getCaidan(user_id){
  return await db.collection("caidan").where({
    user_id: user_id
  }).get();
}

async function getSc(user_id,count){
  var caidan = await getCaidan(user_id);
  var caidanData = caidan.data;
  // 遍历获取到的用户菜单
  for(var i = 0;i<caidanData.length;i++){
    var item = caidanData[i];
    item.list = []; // 给添加个数组保存具体的菜谱数据
    // 查询收藏表获取对应的菜谱id
    var sc = await db.collection('sc').where({
      caidan_id:item._id
    }).orderBy('date','desc').skip(0).limit(3).get();
    // 通过菜谱id获取具体的菜谱
    for(var k = 0;k<sc.data.length;k++){
      var img = await getCaipu(sc.data[k].caipu_id)
      item.list.push(img.data[0])
    }  
  }
  
  return caidanData;
}

async function getCaipu(caipu_id){
  return await db.collection("caipu").where({
    _id: caipu_id
  }).get();
}

async function getScList(userName){
  var sc =  await db.collection("user").field({
    sou_cang: true
  }).where({
    name: userName
  }).get();

  return sc;
}