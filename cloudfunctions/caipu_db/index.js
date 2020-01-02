// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  var method = event.method;

  switch (method) {
    case 'pageQuery':
      return await pageQuery(event);
    case 'queryById':
      return await queryById(event);
    case 'add':
      return await add(event);
  }
}

async function pageQuery(event){
  var param = event.param;
  return await db.collection('caipu').orderBy('create_date', 'desc').skip(param.start).limit(param.size).get();
}

async function queryById(event){
  var param = event.param;

  return await db.collection('caipu').aggregate()
    .match({
      _id: param.id
    })
    .lookup({
      from: 'user',
      localField: 'user_id',
      foreignField: 'user_id',
      as: 'user',
    })
    .end()
}

async function add(event) {
  var caipu = event.param.caipu;
  return await db.collection('caipu').add({
    data:{
      title: caipu.title,
      jie_shao: caipu.jie_shao,
      cover_img: caipu.cover_img,	
      yl: caipu.yl,	
      bz: caipu.bz,	
      score: 0,	
      cooked: 0,
      date: new Date(),	
      user_id: caipu.user_id
    }
  })
}