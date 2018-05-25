const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.getUserById = (req, res) => {

    conn.query(
        `SELECT email, username, profile_img, point FROM Users WHERE id = ${req.query.user_id}`,
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            })
        }
    )
};

exports.updateUsername = (req, res) => {
    const {username} = req.body;
    console.log(req.decoded._id);
    conn.query(
        `UPDATE Users SET username = '${username}' WHERE id = ${req.decoded._id}`,
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                message: "success"
            })
        }
    )
}

exports.deleteUser = (req, res) => {
    conn.query(
        `DELETE FROM Users WHERE id = ${req.params.id}`,
        (err) => {
            if (err) throw err;
            return res.status(200).json({
                message: "success"
            })
        }
    )

}