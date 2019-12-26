// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  var user_id = event.user_id;
  var joinDate = await getUserJoinDate(user_id);
  var userGzCount = await getUserGzCount(user_id);
  var userFunsCount = await getUserFunsCount(user_id);

  return { date: joinDate, gzCount: userGzCount, funsCount: userFunsCount};
}

async function getUserJoinDate(user_id){
  const $ = db.command.aggregate;
  return await db.collection("user").aggregate().match({
    user_id: user_id
  }).project({
    year: $.year('$date')
  }).end({
    success: function (res) {
      console.log(res)
      that.setData({
        date: res.list[0].year
      })
    }
  })
}

async function getUserGzCount(user_id){
  return await db.collection('guan_zhu').where({
    user_id: user_id 
  }).count()
}

async function getUserFunsCount(user_id) {
  return await db.collection('guan_zhu').where({
    gz_id: user_id
  }).count()
}

