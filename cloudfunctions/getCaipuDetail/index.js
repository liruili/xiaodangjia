// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "test-demo-1yksf"
})

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var caipu_id = event.caipu_id; // 查询菜谱详情的id
  var cur_user_id = event.cur_user_id; // 当前用户id
  var user_id = event.user_id; // 查询菜谱的创建者id

  var detailData = await getDetail(caipu_id);
  var userData = await getUser(user_id);
  var guanZhu = await getGzStatus(caipu_id, user_id,cur_user_id);
  var sc = await getScStatus(caipu_id,cur_user_id);
  var zp = await getzp(caipu_id);

  detailData[0].isgz = guanZhu == 1;
  detailData[0].issc = sc >= 1;
  return { detailData: detailData, userData: userData,zp:zp};
}

async function getzp(caipu_id){
  var zp = await db.collection('zp').aggregate()
                   .match({caipu_id:caipu_id})
                   .lookup({
                      from: "user",
                      localField: "user_id",
                      foreignField: "user_id",
                      as: "userInfo"
                    })
                    .limit(10)
                    .end();
  var now = new Date();
  for(var item of zp.list){
    var zp_date = item.date;
    var diff = now.getTime() - zp_date.getTime();//时间差的毫秒数 
    var leave1 = diff % (24 * 3600 * 1000);    //计算天数后剩余的毫秒数 
    var hours = Math.floor(leave1 / (3600 * 1000)); 
    item.date = hours+'小时前'
  }
  return zp;
}

// 获取菜谱信息
async function getDetail(caipu_id){
  var $ = db.command.aggregate
  var detail = await db.collection('caipu').aggregate()
    .lookup({
      from: "detail",
      localField: "detail_id",
      foreignField: "_id",
      as: "detail"
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$detail', 0]), '$$ROOT'])
    }).project({
      detail: 0
    }).match({
      _id: caipu_id
    }).end();
    return detail.list;
}

// 获取菜谱的用户信息（名字、头像）
async function getUser(user_id){
  var user = await db.collection("user").field({
    name: true,
    touxiang:true
  }).where({
    user_id: user_id
  }).get();

  return user.data;
}

async function getGzStatus(caipu_id, user_id,cur_user_id){
  var result = await db.collection('guan_zhu').where({
    gz_id: user_id,
    user_id: cur_user_id
  }).count()
  return result.total;
}

async function getScStatus(caipu_id, cur_user_id){
  var result = await db.collection('sc').where({
    caipu_id: caipu_id,
    user_id: cur_user_id
  }).count()
  return result.total;
}