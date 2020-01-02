var network = require('../utils/network.js')

const pageSize = 6;

function pageQuery(start){
  var param = {
    name: 'caipu_db',
    data: {
      method: 'pageQuery',
      param: {
        start: start,
        size: pageSize
      }
    }
  }

  return network.cloudRequest(param);
}

function queryById(id){
  var param = {
    name: 'caipu_db',
    data: {
      method: 'queryById',
      param: {
        id: id
      }
    }
  }

  return network.cloudRequest(param);
}

function add(caipu){
  var param = {
    name: 'caipu_db',
    data: {
      method: 'add',
      param: {
        caipu: caipu
      }
    }
  }

  return network.cloudRequest(param);
}



module.exports = {
  pageQuery: pageQuery,
  queryById: queryById,
  add: add
}