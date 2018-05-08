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
        'INSERT INTO Forums(category, title, content, user_id, created_at, view_cnt) VALUES (?,?,?,?,?)',
        [category, title, content, req.decoded._id, timestamp, 0], (err, result) => {
            if (err) throw err;
            coin_list.forEach(async (coin) => {
                await coin_input(coin, result.insertId);
            });
            return res.status(200).json({
                forum_id: result.insertId
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
exports.getForumCoin = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        'SELECT * FROM Forum_Coin JOIN Coins ON Forum_Coin.coin_id = Coins.id WHERE Forum_Coin.forum_id = ?',
        [forum_id],
        (err, result) => {
            return res.status(200).json({
                result
            })
        }
    )
}
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
    let getCoinById = (coin_id) => {
        return new Promise((resolve, reject) => {
            conn.query(
                "SELECT * FROM Coins WHERE id = ?",
                [coin_id],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result[0]);
                }
            )
        })
    };

    let getCoinsOfForum = (forum_id) => {
        return new Promise((resolve, reject) => {
            coins = [];
            conn.query(
                "SELECT coin_id FROM Forum_Coin WHERE forum_id = ?",
                [forum_id],
                async (err, coins_id) => {

                    if (err) reject(err);
                    for (let i = 0; i < coins_id.length; i++) {
                        coins[i] = await getCoinById(coins_id[i].coin_id);
                    }
                    resolve(coins)
                }
            )
        })
    };
    conn.query(`SELECT Forums.id, category, title, content, Users.id AS author, Users.email, Users.username, Forums.created_at ` +
        `FROM Forums JOIN Users ON Forums.user_id = Users.id LIMIT 30 OFFSET ${req.query.index}`
        , async (err, forums) => {
            if (err) throw err;

            for (let i = 0; i < forums.length; i++) {
                forums[i].coins = await getCoinsOfForum(forums[i].id);
            }
            return res.status(200).json({
                nextIndex: parseInt(req.query.index) + 30,
                forums: forums
            });
        })
};

exports.createComment = (req, res) => {
    const {forum_id} = req.params;
    const {content} = req.body;
    const timestamp = new Date();
    timestamp.setUTCHours(timestamp.getUTCHours());
    conn.query(
        'INSERT INTO Comments(content, forum_id, created_at, user_id) VALUES(?, ? ,?, ?)',
        [content, forum_id, timestamp, req.decoded._id],
        (err) => {
            if (err) throw err;
            return res.status(200).json({
                message: 'comment created successfully'
            });
        }
    )
};

exports.getCommentList = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        'SELECT Comments.id, content, user_id, created_at, username, profile_img, point FROM Comments JOIN Users ON Comments.user_id = Users.id WHERE forum_id = ?',
        [forum_id],
        (err, result) => {
            return res.status(200).json({
                result
            })
        }
    )
};

exports.getOneForum = (req, res) => {
    conn.query(
        'SELECT * FROM Forums JOIN Users ON Forums.user_id = Users.id WHERE Forums.id = ?',
        [req.query.forum_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            });
        }
    )
};

exports.forumView = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        'UPDATE Forums SET view_cnt = view_cnt+1 WHERE id = ?',
        [forum_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                message: 'view_cnt + 1'
            })
        }
    )
};