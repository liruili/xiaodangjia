// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  var method = event.method;

  switch (method) {
    case 'getCategoryList':
      return await getCategoryList();
  }
}


async function getCategoryList(){
  return await db.collection('ctae_type').aggregate()
    .lookup({
      from: 'category',
      localField: '_id',
      foreignField: 'type_id',
      as: 'sub_list',
    })
    .end()
}