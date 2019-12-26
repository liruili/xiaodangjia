// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var scList = await getsc(event.caidan_id,event.start);
  var caipuList = [];
  for(var sc of scList.data){
    var caipu = await getCaipu(sc.caipu_id);
    caipuList.push(caipu.list[0])
  }
  return caipuList;
}

async function getCaipu(caipu_id){
  var caipu = await db.collection('caipu').aggregate()  
    .lookup({
      from: 'user',
      localField: 'user_id',
      foreignField: 'user_id',
      as: 'user',
    })
    .match({ _id: caipu_id })
    .end()
  return caipu;
}

async function getsc(caidan_id,start){
  return await db.collection('sc')
                 .where({caidan_id:caidan_id})
                 .orderBy('date','desc')
                 .skip(start).limit(5)
                 .get()

}