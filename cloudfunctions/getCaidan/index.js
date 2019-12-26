// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return await getCaidanList(event.user_id)
}

async function getCaidanList(user_id){
  var caidan = await db.collection('caidan').where({
    user_id:user_id
  }).get();

  var caidanData = caidan.data;

  for (var i = 0; i < caidanData.length; i++) {
    var firSc = await getScAtFir(caidanData[i]._id)
    if (firSc.data.length > 0){ // 菜单不为空时
      var cover_img = await getCoverImg(firSc.data[0].caipu_id)
      caidanData[i].cover_img = cover_img.data[0].cover_img.src
    }
  }

  return caidanData;
}

async function getScAtFir(caidan_id){
  return await db.collection('sc').where({
    caidan_id:caidan_id
  }).limit(1).get()
}

async function getCoverImg(caipu_id){
  return await db.collection('caipu').field({
    cover_img:1
  }).where({
    _id:caipu_id
  }).get()
}