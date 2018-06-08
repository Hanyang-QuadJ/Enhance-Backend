const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

const InternalError = (err) => {
    return res.status(500).json({
        message: err
    })
}

exports.deleteForum = (req, res) => {
    const {forum_id} = req.params;
    const flag = req.decoded.flag;
    if (flag === 0) {
        return res.status(400).json({
            message: "Forbidden"
        })
    }
    else if (flag === 1) {
        conn.query("DELETE FROM Forums WHERE id = ?", [forum_id], (err, result) => {
            if (err) InternalError(err);
            return res.status(200).json({
                message: "delete forum successfully"
            });
        });
    }
};

exports.deleteUser = (req, res) => {
    const {username} = req.body;
    const flag = req.decoded.flag;
    console.log(flag);
    if (flag !== 1) {
        return res.status(400).json({
            message: "Forbidden"
        })
    }
    else if (flag === 1) {
        console.log("fwejfiaohefawehfiae");
        conn.query("DELETE FROM Users WHERE username = ?", [username], (err, result) => {
            if (err) InternalError(err);
            return res.status(200).json({
                message: "delete user successfully"
            });
        });
    }
};

exports.createCoin = (req, res) => {
    const {kor, full, abbr, keyword} = req.body;
    const flag = req.decoded.flag;
    if (flag === 0) {
        return res.status(400).json({
            message: "Forbidden"
        })
    }
    else if (flag === 1) {
        conn.query(`INSERT INTO Coins (kor, full, abbr, keyword) VALUES ('${kor}','${full}','${abbr}','${keyword}')`, (err, result) => {
            if (err) InternalError(err);
            return res.status(200).json({
                message: "add coin successfully"
            });
        });
    }
};

exports.deleteCoin = (req, res) => {
    const {abbr} = req.body;
    const flag = req.decoded.flag;
    if (flag === 0) {
        return res.status(400).json({
            message: "Forbidden"
        })
    }
    else if (flag === 1) {
        conn.query("DELETE FROM Coins WHERE abbr = ?", [abbr], (err, result) => {
            if (err) InternalError(err);
            return res.status(200).json({
                message: "delete forum successfully"
            });
        });
    }
};

exports.deleteComment = (req, res) => {
    const {comment_id} = req.params;
    const flag = req.decoded.flag;
    if (flag === 0) {
        return res.status(400).json({
            message: "Forbidden"
        })
    }
    else if (flag === 1) {
        conn.query("DELETE FROM Comments WHERE id = ?", [comment_id], (err, result) => {
            if (err) InternalError(err);
            return res.status(200).json({
                message: "delete forum successfully"
            });
        });
    }
};