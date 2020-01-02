function request(){
  
}

function cloudRequest(param,success,fail){
  console.log('------------- call cloudFunction ----------------')
  if (param.data){
    console.log('{function:' + param.name + '.' + param.data.method  +'}')
  }
  console.log(param);

  return wx.cloud.callFunction({
    name: param.name,
    data: param.data,
  });
}

module.exports = {
  cloudRequest: cloudRequest
}