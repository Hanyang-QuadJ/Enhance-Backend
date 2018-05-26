const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const config = require("../../../config");
const conn = mysql.createConnection(config);
const crypto = require('crypto');

const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3();


let getCoinById = coin_id => {
    return new Promise((resolve, reject) => {
        conn.query(
            "SELECT * FROM Coins WHERE id = ?",
            [coin_id],
            (err, result) => {
                if (err) reject(err);
                resolve(result[0]);
            }
        );
    });
};

let getCoinsOfForum = forum_id => {
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
                resolve(coins);
            }
        );
    });
};

exports.createForum = (req, res) => {
    const {coin_list, category, title, content, pic_list} = req.body;
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
            );
        });
    };
    const d = new Date();
    d.setUTCHours(d.getUTCHours());

    let pic_input = (result, pic) => {
        return new Promise((resolve, reject) => {
            const picKey = d.getFullYear() + '_'
                + d.getMonth() + '_'
                + d.getDate() + '_'
                + crypto.randomBytes(20).toString('hex') +
                +req.decoded._id + '.jpg';
            const picUrl = `https://s3.ap-northeast-2.amazonaws.com/inhance/${picKey}`;
            let buf = new Buffer(pic.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            s3.putObject({
                Bucket: 'inhance',
                Key: picKey,
                Body: buf,
                ACL: 'public-read'
            }, function (err, response) {
                if (err) {
                    if (err) reject(err);
                } else {
                    // console.log(response)
                    conn.query('INSERT INTO Images(forum_id, img_url) VALUES(?, ?)', [result.insertId, picUrl], (err) => {
                        if (err) reject(err);
                        resolve();
                    })
                }
            });
        })
    }
    conn.query(
        "INSERT INTO Forums(category, title, content, user_id, created_at, view_cnt) VALUES (?,?,?,?,?,?)",
        [category, title, content, req.decoded._id, timestamp, 0],
        async (err, result) => {
            if (err) throw err;
            await coin_list.forEach(async (coin) => {
                await console.log('1')
                await coin_input(coin, result.insertId);
            });
            await pic_list.forEach(async (pic) => {
                await console.log('2')
                await pic_input(result, pic);
            });
            await conn.query(
                `UPDATE Users SET point=point+3 WHERE id=${req.decoded._id}`,
                async (err, result1) => {
                    if (err) throw err;
                    await console.log('3')
                    await console.log(result1)
                    await res.status(200).json({
                        forum_id: result.insertId
                    });
                }
            )

        }
    );
};

exports.updateForum = (req, res) => {
    const {id, coin_list, category, title, content} = req.body;
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
            );
        });
    };
    conn.query(
        "DELETE FROM Forum_Coin WHERE forum_id = ?",
        [id],
        (err, result) => {
            if (err) throw err;
            conn.query(
                "UPDATE Forums SET category = ?, title = ?, content = ?, user_id = ? WHERE id = ?",
                [category, title, content, req.decoded._id, id],
                (err, result) => {
                    if (err) throw err;
                    coin_list.forEach(async coin => {
                        await coin_input(coin, id);
                    });
                    return res.status(200).json({
                        message: "success"
                    });
                }
            );
        }
    )

}


exports.getForumCoin = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        "SELECT * FROM Forum_Coin JOIN Coins ON Forum_Coin.coin_id = Coins.id WHERE Forum_Coin.forum_id = ?",
        [forum_id],
        (err, result) => {
            return res.status(200).json({
                result
            });
        }
    );
};
exports.deleteForum = (req, res) => {
    const {forum_id} = req.params;
    conn.query("DELETE FROM Forums WHERE id = ?", [forum_id], (err, result) => {
        if (err) throw err;
        return res.status(200).json({
            message: "delete forum successfully"
        });
    });
};

function getImagesOfForum(forum_id) {
    return new Promise((resolve, reject) => {
        conn.query(
            "SELECT * FROM Images WHERE forum_id = ?",
            [forum_id],
            (err, result) => {
                if (err) throw err;
                resolve(result);
            }
        )
    })
}

exports.getAllForum = (req, res) => {
    conn.query(
        `SELECT Forums.id,Forums.like_cnt,Forums.dislike_cnt, Users.point, category, title, content, view_cnt, Users.id AS author, Users.email, Users.username, Forums.created_at ` +
        `FROM Forums JOIN Users ON Forums.user_id = Users.id order by created_at asc LIMIT 30 OFFSET ${
            req.query.index
            }`,
        async (err, forums) => {
            if (err) throw err;

            for (let i = 0; i < forums.length; i++) {
                forums[i].coins = await getCoinsOfForum(forums[i].id);
                forums[i].images = await getImagesOfForum(forums[i].id);
            }
            return res.status(200).json({
                nextIndex: parseInt(req.query.index) + 30,
                forums: forums
            });
        }
    );
};

exports.getForumByType = (req, res) => {
    const {category} = req.body;
    conn.query(
        `SELECT Forums.id,Forums.like_cnt, Users.point, category, title, content, view_cnt, Users.id AS author, Users.email, Users.username, Forums.created_at ` +
        `FROM Forums JOIN Users ON Forums.user_id = Users.id WHERE Forums.category = '${category}' order by created_at asc LIMIT 30 OFFSET ${
            req.query.index
            }`,
        async (err, forums) => {
            if (err) throw err;

            for (let i = 0; i < forums.length; i++) {
                forums[i].coins = await getCoinsOfForum(forums[i].id);
            }
            return res.status(200).json({
                nextIndex: parseInt(req.query.index) + 30,
                forums: forums
            });
        }
    );
};

exports.getForumByUserId = (req, res) => {
    conn.query(
        `SELECT Forums.like_cnt,Forums.dislike_cnt, Forums.id, category, title, content, view_cnt, Users.id AS author, Users.email, Users.username, Forums.created_at ` +
        `FROM Forums JOIN Users ON Forums.user_id = Users.id WHERE Forums.user_id=${req.query.user_id}
            `,
        async (err, forums) => {
            if (err) throw err;

            for (let i = 0; i < forums.length; i++) {
                forums[i].coins = await getCoinsOfForum(forums[i].id);
            }
            return res.status(200).json({
                forums
            });
        }
    );
};

exports.getForumByCoins = async (req, res) => {
    const {coins, category} = req.body;
    let forums_id = [];
    let result = [];
    let getForumBycoin = (coins_id) => {
        return new Promise((resolve, reject) => {
            let queryString;
            if (category === "전체") {
                queryString = `SELECT DISTINCT forum_id FROM Forum_Coin JOIN Forums ON Forums.id = forum_id WHERE coin_id = `;
            }
            else {
                queryString = `SELECT DISTINCT forum_id FROM Forum_Coin JOIN Forums ON Forums.id = forum_id WHERE Forums.category = "` + category + `" and (coin_id = `;
            }
            queryString += coins_id[0];
            for (let i = 1; i < coins_id.length; i++) {
                queryString += ` or coin_id = `;
                queryString += coins_id[i];
            }
            if (category !== "전체") {
                queryString += `)`;
            }
            if (req.query.order == encodeURI(1)) {
                queryString += ` order by created_at DESC LIMIT 30 OFFSET ${
                    req.query.index
                    }`;
            }
            else {
                queryString += ` order by like_cnt DESC,dislike_cnt ASC,created_at DESC LIMIT 30 OFFSET ${
                    req.query.index
                    }`;
            }

            conn.query(
                queryString,
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });
    };
    let getForumByid = (id) => {
        return new Promise((resolve, reject) => {

            conn.query(
                'SELECT Forums.id,Forums.dislike_cnt,like_cnt, category, title, content, view_cnt, Users.id AS author, Users.email, Users.username, Forums.created_at ' +
                'FROM Forums JOIN Users ON Forums.user_id = Users.id WHERE Forums.id = ?',
                [id],
                async (err, forums) => {
                    if (err) throw err;

                    for (let i = 0; i < forums.length; i++) {
                        forums[i].coins = await getCoinsOfForum(forums[i].id);
                    }
                    resolve(forums[0]);

                }
            );
        });
    };
    let forums = await getForumBycoin(coins);
    forums = JSON.parse(JSON.stringify(forums));
    for (let i = 0; i < forums.length; i++) {
        // console.log(forums_id);
        ret = await getForumByid(forums[i].forum_id);
        if (ret) {
            result[result.length] = ret;
        }
    }
    return res.status(200).json({
        nextIndex: parseInt(req.query.index) + 30,
        result
    });

};

exports.createComment = (req, res) => {
    const {forum_id} = req.params;
    const {content} = req.body;
    const timestamp = new Date();
    timestamp.setUTCHours(timestamp.getUTCHours());
    conn.query(
        "INSERT INTO Comments(content, forum_id, created_at, user_id) VALUES(?, ? ,?, ?)",
        [content, forum_id, timestamp, req.decoded._id],
        err => {
            if (err) throw err;
            conn.query(
                `UPDATE Users SET point=point+3 WHERE id=${req.decoded._id}`,
                err => {
                    if (err) throw err;
                    return res.status(200).json({
                        message: "comment created successfully"
                    });
                }
            )
        }
    );
};

exports.deleteComment = (req, res) => {
    conn.query(
        `DELETE FROM Comments WHERE id = ${req.query.comment_id}`,

        err => {
            if (err) throw err;
            return res.status(200).json({
                message: "comment removed successfully"
            });
        }
    );
};

exports.getCommentList = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        "SELECT Comments.id, content, user_id, created_at, username, profile_img, point FROM Comments JOIN Users ON Comments.user_id = Users.id WHERE forum_id = ?",
        [forum_id],
        (err, result) => {
            return res.status(200).json({
                result
            });
        }
    );
};

exports.getCommentByUserId = (req, res) => {
    conn.query(
        `SELECT Comments.id, Comments.forum_id, content, user_id, created_at, username, profile_img, point FROM Comments JOIN Users ON Comments.user_id = Users.id WHERE Users.id = ${req.query.user_id}`,

        (err, result) => {
            return res.status(200).json({
                result
            });
        }
    );
};

exports.getOneForum = (req, res) => {
    // let result = [];
    conn.query(
        "SELECT * FROM Forums JOIN Users ON Forums.user_id = Users.id WHERE Forums.id = ?",
        [req.query.forum_id],
        (err, forum) => {
            if (err) throw err;
            conn.query(
                "SELECT * FROM Images WHERE forum_id = ?",
                [req.query.forum_id],
                (err, image) => {
                    if (err) throw err;
                    let result = {
                        id: forum[0].id,
                        category: forum[0].category,
                        title: forum[0].title,
                        content: forum[0].content,
                        user_id: forum[0].user_id,
                        created_at: forum[0].created_at,
                        view_cnt: forum[0].view_cnt,
                        like_cnt: forum[0].like_cnt,
                        dislike_cnt: forum[0].dislike_cnt,
                        email: forum[0].email,
                        username: forum[0].username,
                        // password: forum[0].password,
                        profile_img: forum[0].profile_img,
                        point: forum[0].point,
                        image: image
                    }
                    return res.status(200).json({
                        result
                    });
                }
            )

        }
    );
};

exports.forumView = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        "UPDATE Forums SET view_cnt = view_cnt+1 WHERE id = ?",
        [forum_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                message: "view_cnt + 1"
            });
        }
    );
};

exports.forumLike = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        "INSERT INTO Likes(user_id, forum_id) VALUES(?, ?)",
        [req.decoded._id, forum_id],
        (err, result) => {
            if (err) throw err;
            conn.query(
                "UPDATE Forums SET like_cnt = like_cnt+1 WHERE id = ?",
                [forum_id],
                (err, result) => {
                    if (err) throw err;
                    return res.status(200).json({
                        message: "like_cnt + 1"
                    });
                }
            )
        }
    )
}

exports.forumDislike = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        "DELETE FROM Likes WHERE user_id = ? and forum_id = ?",
        [req.decoded._id, forum_id],
        (err, result) => {
            if (err) throw err;
            conn.query(
                "UPDATE Forums SET like_cnt = like_cnt-1 WHERE id = ?",
                [forum_id],
                (err, result) => {
                    if (err) throw err;
                    return res.status(200).json({
                        message: "like_cnt - 1"
                    });
                }
            )
        }
    )
}

exports.forumHate = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        "INSERT INTO Dislikes(user_id, forum_id) VALUES(?, ?)",
        [req.decoded._id, forum_id],
        (err, result) => {
            if (err) throw err;
            conn.query(
                "UPDATE Forums SET dislike_cnt = dislike_cnt+1 WHERE id = ?",
                [forum_id],
                (err, result) => {
                    if (err) throw err;
                    return res.status(200).json({
                        message: "success"
                    });
                }
            )
        }
    )
}

exports.forumUnhate = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        "DELETE FROM Dislikes WHERE user_id = ? and forum_id = ?",
        [req.decoded._id, forum_id],
        (err, result) => {
            if (err) throw err;
            conn.query(
                "UPDATE Forums SET dislike_cnt = dislike_cnt-1 WHERE id = ?",
                [forum_id],
                (err, result) => {
                    if (err) throw err;
                    return res.status(200).json({
                        message: "success"
                    });
                }
            )
        }
    )
}

exports.forumLikeCheck = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        "SELECT * FROM Likes WHERE user_id = ? and forum_id = ?",
        [req.decoded._id, forum_id],
        (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                return res.status(200).json({
                    message: "it's okay to like this forum"
                })
            } else {
                return res.status(406).json({
                    message: "You already liked this forum"
                })
            }
        }
    )
}

exports.forumHateCheck = (req, res) => {
    const {forum_id} = req.params;
    conn.query(
        "SELECT * FROM Dislikes WHERE user_id = ? and forum_id = ?",
        [req.decoded._id, forum_id],
        (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                return res.status(200).json({
                    message: "it's okay to dislike this forum"
                })
            } else {
                return res.status(406).json({
                    message: "You already disliked this forum"
                })
            }
        }
    )
}