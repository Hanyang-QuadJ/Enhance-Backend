const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.naverNewsSearch = (req, res) => {
  var api_url = 'https://openapi.naver.com/v1/search/news?query=' + encodeURI(req.query.query) + '&display=' + encodeURI(req.query.display) + '&start=' + encodeURI(req.query.start); // json 결과
//   var api_url = 'https://openapi.naver.com/v1/search/blog.xml?query=' + encodeURI(req.query.query); // xml 결과
  var request = require('request');
  var options = {
     url: api_url,
     headers: {'X-Naver-Client-Id':config.client_id, 'X-Naver-Client-Secret': config.client_secret}
  };
  request.get(options, function (error, response, body) {
   if (!error && response.statusCode === 200) {
     res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
     res.end(body);
   } else {
     res.status(response.statusCode).end();
     console.log('error = ' + response.statusCode);
   }
  });
}