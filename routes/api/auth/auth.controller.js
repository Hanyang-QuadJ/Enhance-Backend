const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.register = (req, res) => {
    const secret = req.app.get('jwt-secret');
    const {email, username, password} = req.body;
    const d = new Date();
    d.setUTCHours(d.getUTCHours());

    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(password)
        .digest('base64');
    conn.query('SELECT * from Users WHERE email=?', [email], (err, rows) => {
        if (err) throw err;
        else if (rows.length === 0) {
            conn.query(
                'INSERT INTO Users(email, username, password) VALUES (?, ?, ?)',
                [email, username, encrypted],
                (err, result) => {
                    if (err) throw err;
                    console.log(result);
                    jwt.sign(
                        {
                            _id: result.insertId,
                            email: email,
                        },
                        secret,
                        {
                            expiresIn: '7d',
                            issuer: 'rebay_admin',
                            subject: 'userInfo'
                        }, (err, token) => {
                            if (err) return res.status(406).json({message: 'register failed'});
                            conn.query('SELECT * from Favorites WHERE user_id = ? AND coin_id = 1',
                                [result.insertId], (err, result2) => {
                                    if (result2.length >= 1) {
                                        return res.status(404).json({
                                            message: 'You already have this coin as favorite'
                                        })
                                    } else {
                                        conn.query('INSERT INTO Favorites(user_id, coin_id) VALUES (?,1)', [result.insertId], (err, result) => {
                                            if (err) throw err;
                                            return res.status(200).json({
                                                message: 'registered successfully',
                                                token
                                            });
                                        })
                                    }
                                });
                            
                        });
                });
        } else {
            return res.status(406).json({
                message: 'user email or username exists'
            })
        }
    });
};

exports.login = (req, res) => {
    const {email, password} = req.body;
    const secret = req.app.get('jwt-secret');
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(password)
        .digest('base64');
    conn.query(
        'SELECT * from Users WHERE email=? and password=?',
        [email, encrypted],
        (err, result) => {
            if (err) throw err;
            else if (result.length === 0) {
                return res.status(406).json({message: 'login failed'});
            } else {
                jwt.sign(
                    {
                        _id: result[0].id,
                        email: result[0].email,
                    },
                    secret,
                    {
                        expiresIn: '7d',
                        issuer: 'rebay_admin',
                        subject: 'userInfo'
                    }, (err, token) => {
                        if (err) return res.status(406).json({message: 'login failed'});
                        return res.status(200).json({
                            message: 'logged in successfully',
                            token
                        });
                    });
            }
        }
    )
};

exports.me = (req, res) => {
    conn.query('SELECT * from Users WHERE id=?', [req.decoded._id], (err, result) => {
        if (err) throw err;
        return res.status(200).json({
            me: result
        });
    });
};

