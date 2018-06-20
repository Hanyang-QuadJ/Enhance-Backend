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
app.use(cors());
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
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));


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

setInterval(function () {
    // console.log('yes')
    conn.query('SELECT * FROM Users');
}, 3000);
/* ========================
 JOB SCHEDULING
 ==========================*/


promiseRequest = (options) => {
    return new Promise((resolve, reject) => {
        request.get(options, function (error, res, body) {
            if (!error && res.statusCode === 200) {
                resolve(body);
            } else {
                console.log(body);
                console.log(res.statusCode);
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
        const api_url = 'https://openapi.naver.com/v1/search/news?query=' + encodeURI(query).replace("/\\+/gi", "%20") + '&display=' + encodeURI(100) + '&start=' + encodeURI(start);
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
    conn.query('SELECT * FROM Coins', async (err, result) => {
        for (let i = 0; i < result.length; i++) {
            articles = await getArticles(result[i].keyword);
            for (let j = 0; j < articles.length; j++) {
                await insertNews(articles[j], result[i].id, "naver");
            }
        }
    });
};

// refreshNews();


// });

getBlogs = async (query) => {
    let ret = [];
    let displayed = 100;
    let start = 1;
    while (displayed === 100 && start < 101) {
        const api_url = 'https://openapi.naver.com/v1/search/blog?query=' + encodeURI(query) + '&display=' + encodeURI(100) + '&start=' + encodeURI(start);
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

insertBlogs = (article, coin_id, source) => {
    return new Promise((resolve, reject) => {
        console.log(article);
        let link = article.link;
        let result;
        if (link.indexOf("naver") !== -1) {
            let parsedLink = link.split('?');
            let number = parsedLink[1].split('logNo=');
            result = parsedLink[0] + '/' + number[1];
        }
        else {
            result = link;
        }
        conn.query('INSERT INTO Blogs (title, link, description,bloggername, pubDate, coin_id, source) VALUES (?,?,?,?,?,?,?)',
            [article.title, result, article.description, article.bloggername, article.postdate, coin_id, source], (err, result) => {
                if (err) throw err;
                else {
                    console.log(result);
                    resolve(result);
                }
            });
    });
};

truncateBlogs = () => {
    return new Promise((resolve, reject) => {
        conn.query('TRUNCATE Blogs', (err, result) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};
refreshBlogs = async () => {
    let articles = [];
    await truncateBlogs();
    conn.query('SELECT * FROM Coins', async (err, result) => {
        for (let i = 0; i < result.length; i++) {
            // for (let i = 0; i < 1; i++) {
            articles = await getBlogs(result[i].keyword);
            for (let j = 0; j < articles.length; j++) {
                await insertBlogs(articles[j], result[i].id, "naver");
            }
        }
    })
};
cron.schedule('*/60 * * * * *', async function () {
    await refreshBlogs();
    await refreshNews();
});
