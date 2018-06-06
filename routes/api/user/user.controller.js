const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');
const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3();
const fs = require('fs');
var path = require('path');
var buffer = require('buffer');
function encode_base64(filename){
    return new Promise((resolve, reject) => {
        fs.readFile(filename,function(error,data){
            if(error){
                return res.status(500).json({ err });r;
            }else{
                var buf = Buffer.from(data);
                var base64 = buf.toString('base64');
                console.log(base64)
                resolve(base64);
            }
        })
    });

}


function decode_base64(base64str , filename){
    return new Promise((resolve, reject) => {
        var buf = Buffer.from(base64str,'base64');

        fs.writeFile(filename, buf, function(error){
            if(error){
                return res.status(500).json({ err });r;
            }else{
                console.log('File created from base64 string!');
                resolve();
            }
        });
    });


}
exports.test = async (req, res) => {
    // // decode_base64(base64,'beforeCrop.jpg');
    // // bitmap.readFile(filename)
    // //     .then(function() {
    // //         // bitmap is ready
    // //     });
    // // base64 = encode_base64('ddr.jpg');
    // gm('/Users/jeonghyeonlee/Project/Enhance/Enhance-Backend/public/beforeCrop.jpg')
    //     .crop(100, 100)
    //     .write('/Users/jeonghyeonlee/Project/Enhance/Enhance-Backend/public/Cropped.jpg', (err) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log("success")
    //         }
    //     })

    const base64 = req.body.base64;
    var buf = Buffer.from(base64,'base64');
    // decode_base64('any_base64_string_goes_here','rane.jpg');
    var PNGCrop = require('png-crop');
    // let base6 = await encode_base64('/Users/jeonghyeonlee/Project/Enhance/Enhance-Backend/public/beforeCrop.jpg');
    await decode_base64(base64,'/Users/jeonghyeonlee/Project/Enhance/Enhance-Backend/public/beforeCrop1.png');
// if you don't know the image's dimension and want to crop for a point all the
// way til bottom right, just pass a big width/height
//     var config1 = {width: 100, height: 62, top: 95, left: 110};
// // pass a path, a buffer or a stream as the input
    PNGCrop.crop('/Users/jeonghyeonlee/Project/Enhance/Enhance-Backend/public/beforeCrop1.jpg',
        '/Users/jeonghyeonlee/Project/Enhance/Enhance-Backend/public/cropped.png'
        , config1, function(err) {
        if (err) return res.status(500).json({ err });
        console.log('done!');
    });
    return res.status(200).json({mssage:"200"})
}
exports.getUserById = (req, res) => {
    conn.query(
        `SELECT email, username, profile_img, point FROM Users WHERE id = ${req.query.user_id}`,
        (err, result) => {
            if (err) return res.status(500).json({ err });
            return res.status(200).json({
                result
            })
        }
    )
};

exports.updateUsername = (req, res) => {
    const { username } = req.body;
    // console.log(req.decoded._id);
    conn.query(
        "SELECT * FROM Users WHERE username = ?",
        [username],
        (err, result) => {
            if (err) return res.status(500).json({ err });
            if (result.length == 0) {
                conn.query(
                    `UPDATE Users SET username = '${username}' WHERE id = ${req.decoded._id}`,
                    (err, result) => {
                        if (err) return res.status(500).json({ err });
                        return res.status(200).json({
                            message: "success"
                        })
                    }
                )
            } else {
                return res.status(406).json({
                    message: 'username already exists.'
                })
            }
        }
    )
    
};

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
                    if (err) return res.status(500).json({ err });
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
            if (err) return res.status(500).json({ err });
            return res.status(200).json({
                message: "success"
            })
        }
    )

}

exports.changeEmail = (req, res) => {
    const { email } = req.body;
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
                        if(err) return res.status(500).json({ err });
                        return res.status(200).json({
                            message:"success"
                        })
                    }
                )
            }
        }
    )
}

exports.changePassword = (req, res) => {
    const { old_password, new_password } = req.body;
    const old_encrypted = crypto.createHmac('sha1', config.secret)
        .update(old_password)
        .digest('base64');
    const new_encrypted = crypto.createHmac('sha1', config.secret)
        .update(new_password)
        .digest('base64');
    conn.query(
        "SELECT * FROM Users WHERE id = ? and password = ?",
        [req.decoded._id, old_encrypted],
        (err, result) => {
            if (err) return res.status(500).json({ err });
            if (result.length == 0) {
                return res.status(406).json({
                    message: 'you are not allowed'
                })
            } else {
                conn.query(
                    "UPDATE Users SET password = ? WHERE id = ?",
                    [new_encrypted, req.decoded._id],
                    (err, result) => {
                        if (err) return res.status(500).json({ err });
                        return res.status(200).json({
                            message: "password updated"
                        })
                    } 
                )
            }
        }
    )
}
exports.emailCheck = (req, res) => {
    conn.query(
        "SELECT * FROM Users WHERE email = ?",
        [req.query.email],
        (err, result) => {
            if (err) return res.status(500).json({ err });
            if (result.length == 0) {
                return res.status(200).json({
                    isDuplicate: false
                })
            } else {
                return res.status(200).json({
                    isDuplicate: true
                })
            }
        }
    )
}
exports.emailVerification = (req, res) => {
    let random_verify = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20);
    random_verify = random_verify.toString();
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(random_verify)
        .digest('base64');
    let smtpTransport = nodemailer.createTransport(smtpPool({
        service: 'Gmail',
        host: 'localhost',
        port: '465',
        tls: {
            rejectUnauthorize: false
        },

        //이메일 전송을 위해 필요한 인증정보

        //gmail 계정과 암호 
        auth: {
            user: 'dev.team.enhance@gmail.com',
            pass: 'dlsgostmghkdlxld'
        },
        maxConnections: 5,
        maxMessages: 10
    }));

    let mailOpt = {
        from: 'Enhance User Service Team',
        to: req.query.email,
        subject: '인핸스에서 임시비밀번호를 알려드립니다.',
        html: `
			<h3>인핸스(Enhance)에서 보내드리는 임시비밀번호는[<span style="color: #fa615c;">${random_verify}</span>]입니다.<br>
			</h3>`
    };
    smtpTransport.sendMail(mailOpt, function (err, res) {
        if (err) {
            return res.status(500).json({ err });
        } else {
            smtpTransport.close();
        }
    });
    
    conn.query(
        "UPDATE Users SET sub_password = ? WHERE email = ?",
        [encrypted, req.query.email],
        (err, result) => {
            if (err) return res.status(500).json({ err });
            return res.status(200).json({
                message: 'succeed'
            })
        }
    )

};