function request(){
  
}

function cloudRequest(param,success,fail){
  console.log('------------- call cloudFunction ----------------')
  console.log(param);

  return wx.cloud.callFunction({
    name: param.name,
    data: param.data,
  });
}

module.exports = {
  cloudRequest: cloudRequest
}