const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.createForum = (req, res) => {
    const {coin_id, category, title, content} = req.body;
    const timestamp = new Date();
    timestamp.setUTCHours(timestamp.getUTCHours());
    if (coin_id > 30 || coin_id < 1) {
        return res.status(404).json({
            message: 'coin type wrong'
        })
    }
    else {
        conn.query('INSERT INTO Forums(coin_id, category, title, content, user_id, created_at) VALUES (?,?,?,?,?,?)',
            [coin_id, category, title, content, req.decoded._id, timestamp], (err, result) => {
                if (err) throw err;
                return res.status(200).json({
                    message: 'create forum successfully',
                });
            })
    }
};

exports.deleteForum = (req, res) => {
    const {id} = req.body;
    conn.query('DELETE FROM Forums WHERE id = ?', [id], (err, result) => {
        if (err) throw err;
        return res.status(200).json({
            message: 'delete forum successfully',
        });
    })

};

exports.updateForum = (req, res) => {
    const {id, coin_id, category, title, content} = req.body;
    const timestamp = new Date();
    timestamp.setUTCHours(timestamp.getUTCHours());
    if (coin_id > 30 || coin_id < 1) {
        return res.status(404).json({
            message: 'coin type wrong'
        })
    }
    else {
        conn.query('UPDATE Forums SET coin_id = ?, category = ?, title = ?, content = ?, user_id = ?, created_at = ? WHERE id = ?',
            [coin_id, category, title, content, req.decoded._id, timestamp, id], (err, result) => {
                if (err) throw err;
                return res.status(200).json({
                    message: 'update forum successfully',
                });
            })
    }
};

exports.getAllForum = (req, res) => {
    conn.query('SELECT Forums.id, coin_id, category, title, content, Users.id, Users.email, Users.username ' +
        'FROM Forums JOIN Users ON Forums.user_id = Users.id'
        , (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                message: 'get all forums successfully',
                forums:result
            });
        })
};

