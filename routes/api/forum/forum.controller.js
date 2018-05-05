const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.createForum = (req, res) => {
    const {coin_list, category, title, content} = req.body;
    const timestamp = new Date();
    timestamp.setUTCHours(timestamp.getUTCHours());
    let coin_input = (coin_id, forum_id) => {
        return new Promise((resolve, reject) => {
            conn.query(
                "INSERT INTO Forum_Coin(forum_id, coin_id) VALUES(?, ?)",
                [forum_id, coin_id],
                (err, result) => {
                    if (err) reject(err);
                    resolve();
                }
            )
        })
    }
    conn.query(
        'INSERT INTO Forums(category, title, content, user_id, created_at) VALUES (?,?,?,?,?)',
        [category, title, content, req.decoded._id, timestamp], (err, result) => {
            if (err) throw err;
            coin_list.forEach(async (coin) => {
                await coin_input(coin, result.insertId);
            });
            return res.status(200).json({
                message: 'done'
            })
        })
    // if (coin_id > 30 || coin_id < 1) {
    //     return res.status(404).json({
    //         message: 'coin type wrong'
    //     })
    // }
    // else {
        
        
    // }
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

exports.createComment = (req, res) => {
    const { forum_id } = req.params;
    const { content } = req.body;
    const timestamp = new Date();
    timestamp.setUTCHours(timestamp.getUTCHours());
    conn.query(
        'INSERT INTO Comments(content, forum_id, created_at) VALUES(?, ? ,?)',
        [content, forum_id, timestamp],
        (err) => {
            if (err) throw err;
            return res.status(200).json({
                message: 'comment created successfully'
            });
        }
    )
};

exports.getOneForum = (req, res) => {
    conn.query(
        'SELECT * FROM Forums JOIN Comments ON Forums.id = Comments.forum_id WHERE Forums.id = ?',
        [req.query.forum_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            });
        }
    )
};