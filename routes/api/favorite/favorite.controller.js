const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.addFavorite = (req, res) => {
    const {user_id, coin_id} = req.body;

    conn.query('SELECT * from Favorites WHERE user_id = ? AND coin_id = ?',
        [user_id, coin_id], (err, result) => {
            if (result.length >= 1) {
                return res.status(404).json({
                    message: 'You already have this coin as favorite'
                })
            }
            else if (coin_id>30 || coin_id <1) {
                return res.status(404).json({
                    message: 'There is no such coin'
                })
            }
            else {
                conn.query('INSERT INTO Favorites(user_id, coin_id) VALUES (?,?)',[user_id,coin_id],(err, result) => {
                    if (err) throw err;
                    return res.status(200).json({
                        message: 'add favorite successfully',
                    });
                })


            }

        });

};



