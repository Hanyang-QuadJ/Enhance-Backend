const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.daumNewsSearch = (req, res) => {
    var api_url = 'https://dapi.kakao.com/v2/search/web?query=' + encodeURI(req.query.query) + '&size=' + encodeURI(req.query.size) + '&page=' + encodeURI(req.query.page); // json 결과
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'Authorization': 'KakaoAK '+config.daum_key}
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
            res.end(body);
        } else {
            res.status(response.statusCode).end();
            // console.log('error = ' + response.statusCode);
            console.log(response);
        }
    });
}