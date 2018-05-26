const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3();

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

exports.changeProfileImage = (req, res) => {
    const { base64 } = req.body;
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + 9);
    const picKey = d.getFullYear() + '_'
        + d.getMonth() + '_'
        + d.getDate() + '_'
        + crypto.randomBytes(20).toString('hex') +
        + req.decoded._id + '.jpg';
    const picUrl = `https://s3-ap-northeast-2.amazonaws.com/inhance/${picKey}`;
    let buf = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    s3.putObject({
        Bucket: 'inhance',
        Key: picKey,
        Body: buf,
        ACL: 'public-read'
    }, function (err, response) {
        if (err) {
            return res.status(406).json({
                err
            })
        } else {
            conn.query(
                `UPDATE Users SET profile_img = '${picUrl}' WHERE id = ${req.decoded._id}`,
                (err, result) => {
                    if (err) throw err;
                    return res.status(200).json({
                        message: "success"
                    })
                }
            )
        }
    });
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

exports.changeEmail = (req, res) => {
    const {email} = req.body;
    conn.query(
        `SELECT * FROM Users WHERE email = '${email}'`,
        (err, result) => {
            if (result.length !==0) {
                return res.status(404).json({
                    message: "email already exist"
                })
            }
            else {
                conn.query(
                    `UPDATE Users SET email = '${email}' WHERE id = ${req.decoded._id}`,
                    (err, result) => {
                        if(err) throw err;
                        return res.status(200).json({
                            message:"success"
                        })
                    }
                )
            }
        }
    )
}