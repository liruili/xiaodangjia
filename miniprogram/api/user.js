var network = require('../utils/network.js')
var sys = require('./sys.js');

// const openid = sys.getOpenid(); // 用户openid

/**
 * 通过用户openid查找用户
 * @param {String} openid
 */
function findUserByOpenid(openid){
  var param = {
    name:'userdb',
    data:{
      method: 'queryByOpenid',
      param:{
        openid: openid
      }
    }
  }

  return network.cloudRequest(param);

  // base('queryByOpenid', { openid: openid});
}


function saveUser(userInfo,openid){
  var param = {
    name: 'userdb',
    data: {
      method: 'add',
      param: {
        openid: openid,
        name: userInfo.nickName,
        pic_url: userInfo.avatarUrl
      }
    }
  }

  return network.cloudRequest(param);
}


function update(userInfo, openid){
  var param = {
    name: 'userdb',
    data: {
      method: 'update',
      param: {
        openid: openid,
        name: userInfo.nickName,
        pic_url: userInfo.avatarUrl
      }
    }
  }

  return network.cloudRequest(param);
}


module.exports = {
  findUserByOpenid: findUserByOpenid,
  saveUser: saveUser,
  update: update
}