const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.naverNewsSearch = (req, res) => {
    const { coin_id, source } = req.params;
    conn.query(
        'SELECT * FROM News WHERE (coin_id = ? and source = ?)',
        [coin_id, source],
        (err, result) => {
            if(err) throw err;
            return res.status(200).json({
                result
            })
        }
    )
}