const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.naverSearch = (req, res) => {
    if(req.query.source === encodeURI(0)){
        conn.query(
            `SELECT * FROM News WHERE (coin_id = ?) LIMIT 30 OFFSET ${req.query.index}`,
            [req.query.coin_id, req.query.source],
            (err, result) => {
                if(err) throw err;
                return res.status(200).json({
                    nextIndex: parseInt(req.query.index) + 30,
                    result
                })
            }
        )
    }
    else if(req.query.source === encodeURI(1)){
        conn.query(
            `SELECT * FROM Blogs WHERE (coin_id = ?) LIMIT 30 OFFSET ${req.query.index}`,
            [req.query.coin_id, req.query.source],
            (err, result) => {
                if(err) throw err;
                return res.status(200).json({
                    nextIndex: parseInt(req.query.index) + 30,
                    result
                })
            }
        )
    }

};

