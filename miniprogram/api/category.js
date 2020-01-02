var network = require('../utils/network.js')

function getCategoryList(){
  var param = {
    name: 'category_db',
    data: {
      method: 'getCategoryList'
    }
  }

  return network.cloudRequest(param);

}

module.exports = {
  getCategoryList: getCategoryList,
}