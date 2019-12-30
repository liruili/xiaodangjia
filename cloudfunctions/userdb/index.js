// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var method = event.method;
  
  switch(method){
    case 'queryByOpenid':
      return await queryByOpenid(event);
    case 'add':
      return await add(event);
    case 'update':
      return await update(event);
  }
}

async function queryByOpenid(event) {
  var param = event.param;
  return await db.collection('user').where({user_id:param.openid}).count();
}

async function add(event){
  var param = event.param;
  return await db.collection('user').add({
    data:{
      user_id: param.openid,
      name: param.name,
      pic_url: param.pic_url,
      date: new Date()
    }
  })
}

async function update(event){
  var param = event.param;
  return await db.collection('user').where({ user_id: param.openid }).update({
    data:{
      name: param.name,
      pic_url: param.pic_url
    }
  })
}