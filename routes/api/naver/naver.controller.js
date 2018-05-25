const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.naverNewsSearch = (req, res) => {
    conn.query(
        `SELECT * FROM News WHERE (coin_id = ? and source = ?) LIMIT 30 OFFSET ${req.query.index}`,
        [req.query.coin_id, req.query.source],
        (err, result) => {
            if(err) throw err;
            return res.status(200).json({
                nextIndex: parseInt(req.query.index) + 30,
                result
            })
        }
    )
};

exports.naverBlogSearch = (req, res) => {
    conn.query(
        `SELECT * FROM Blogs WHERE (coin_id = ? and source = ?) LIMIT 30 OFFSET ${req.query.index}`,
        [req.query.coin_id, req.query.source],
        (err, result) => {
            if(err) throw err;
            return res.status(200).json({
                nextIndex: parseInt(req.query.index) + 30,
                result
            })
        }
    )
};