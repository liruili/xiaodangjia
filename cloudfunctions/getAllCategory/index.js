// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  var categorys = await getCategory()
  var types = await getType();
  // types[0].list = []
  for (var i = 0; i < types.length;i++) {
    types[i].list = [];
  }

  for (var i = 0; i < categorys.length; i++){
    
    for (var j = 0; j < types.length; j++){
      if (types[j]._id === categorys[i].type_id){
        types[j].list.push(categorys[i])
      }
    }
  }

  return {data:types};
};

// 云函数中自定义函数需要async，异步
async function getCategory(){
  try {
    var categorys =  await db.collection('category').get({
      success: function (res) {
        return res;
      }
    });

    return categorys.data;
  } catch (e) {
    console.error(e);
  }
}

async function getType() {
  try {
    var types = await db.collection('ctae_type').get({
      success: function (res) {
        return res;
      }
    });
    return types.data;
  } catch (e) {
    console.error(e);
  }
}