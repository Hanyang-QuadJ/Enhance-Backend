const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mysql = require('mysql');
const cors = require('cors');
const config = require('./config');
const cron = require('node-cron');
const conn = mysql.createConnection(config);
const searchKeyword = require('./data/searchKeyword');
const request = require('request');
/* =======================
 LOAD THE CONFIG
 ==========================*/
const port = process.env.PORT || 3000;

/* =======================
 EXPRESS CONFIGURATION
 ==========================*/
const app = express();
app.use(cors())
// process.on('uncaughtException', function(err) {
// 	console.log('Caught exception: ' + err);
// });
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// parse JSON and url-encoded query
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(express.static('apidoc'));
app.get('/', (req, res) => {
    res.send('index.html')
});

// print the request log on console
app.use(morgan(':remote-addr'), function (req, res, next) {
    next();
});

app.use(morgan(':method'), function (req, res, next) {
    next();
});

app.use(morgan(':url'), function (req, res, next) {
    next();
});

app.use(morgan(':date'), function (req, res, next) {
    next();
});

app.use(morgan(':status'), function (req, res, next) {
    next();
});

// set the secret key variable for jwt
app.set('jwt-secret', config.secret);
// index page, just for testing

app.use('/api', require('./routes/api'));

// open the server
app.listen(port, () => {
    console.log(`Express is running on port ${port}`)
});


/* ========================
 JOB SCHEDULING
 ==========================*/


promiseRequest = (options) => {
    return new Promise((resolve, reject) => {
        request.get(options, function (error, res, body) {
            if (!error && res.statusCode === 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
};

getArticles = async (query) => {
    let ret = [];
    let displayed = 100;
    let start = 1;
    while (displayed === 100 && start < 1001) {
        const api_url = 'https://openapi.naver.com/v1/search/news?query=' + encodeURI(query) + '&display=' + encodeURI(100) + '&start=' + encodeURI(start);
        const options = {
            url: api_url,
            headers: {'X-Naver-Client-Id': config.client_id, 'X-Naver-Client-Secret': config.client_secret}
        };
        let body = await promiseRequest(options);
        body = JSON.parse(body);

        displayed = body.display;
        start += 100;
        console.log(body.start + " / " + body.total + " : " + body.display);
        ret.push(...body.items);
    }
    return new Promise((resolve, reject) => {
        resolve(ret);
    });
};

insertNews = (article, coin_id, source) => {
    return new Promise((resolve, reject) => {
        conn.query('INSERT INTO News (title, originallink, link, description, pubDate, coin_id, source) VALUES (?,?,?,?,?,?,?)',
            [article.title, article.originallink, article.link, article.description, article.pubDate, coin_id, source], (err, result) => {
                if (err) reject(err);
                else {
                    console.log(result);
                    resolve(result);
                }
            });
    });
};

truncateNews = () => {
    return new Promise((resolve, reject) => {
        conn.query('TRUNCATE News', (err, result) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};

// cron.schedule('*/50 * * * * *', async function () {
refreshNews = async () => {
    let articles = [];
    await truncateNews();
    for (let i = 0; i < searchKeyword.coins.length; i++) {
        articles = await getArticles(searchKeyword.coins[i].searchKeyword);
        for (let j = 0; j < articles.length; j++) {
            await insertNews(articles[j], i + 1, "naver");
        }
    }
};

// refreshNews();


// });
