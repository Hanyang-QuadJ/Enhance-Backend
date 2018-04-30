const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.addFavorite = (req, res) => {
    conn.query('INSERT * from Coins', (err, coins) => {
        if (err) throw err;
        return res.status(200).json({
            message: 'get every coin successfully',
            coins: coins
        });
    });
};



