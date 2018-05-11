const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const config = require("../../../config");
const conn = mysql.createConnection(config);


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
            );
        });
    };
    conn.query(
        "INSERT INTO Forums(category, title, content, user_id, created_at, view_cnt) VALUES (?,?,?,?,?,?)",
        [category, title, content, req.decoded._id, timestamp, 0],
        (err, result) => {
            if (err) throw err;
            coin_list.forEach(async coin => {
                await coin_input(coin, result.insertId);
            });
            return res.status(200).json({
                forum_id: result.insertId
            });
        }
    );
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
    const {id} = req.body;
    conn.query("DELETE FROM Forums WHERE id = ?", [id], (err, result) => {
        if (err) throw err;
        return res.status(200).json({
            message: "delete forum successfully"
        });
    });
};

exports.updateForum = (req, res) => {
    const {id, coin_id, category, title, content} = req.body;
    const timestamp = new Date();
    timestamp.setUTCHours(timestamp.getUTCHours());
    if (coin_id > 30 || coin_id < 1) {
        return res.status(404).json({
            message: "coin type wrong"
        });
    } else {
        conn.query(
            "UPDATE Forums SET coin_id = ?, category = ?, title = ?, content = ?, user_id = ?, created_at = ? WHERE id = ?",
            [coin_id, category, title, content, req.decoded._id, timestamp, id],
            (err, result) => {
                if (err) throw err;
                return res.status(200).json({
                    message: "update forum successfully"
                });
            }
        );
    }
};

exports.getAllForum = (req, res) => {
    conn.query(
        `SELECT Forums.id, Users.point, category, title, content, view_cnt, Users.id AS author, Users.email, Users.username, Forums.created_at ` +
        `FROM Forums JOIN Users ON Forums.user_id = Users.id LIMIT 30 OFFSET ${
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
        `SELECT Forums.id, category, title, content, view_cnt, Users.id AS author, Users.email, Users.username, Forums.created_at ` +
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
    const {coins} = req.body;
    let forums_id = [];
    let result = [];
    let getForumBycoin = (coins_id) => {
        return new Promise((resolve, reject) => {
            let queryString = 'SELECT DISTINCT forum_id FROM Forum_Coin WHERE coin_id = ';
            queryString += coins_id[0];
            for (let i = 1; i < coins_id.length; i++) {
                queryString += ' or coin_id = ';
                queryString += coins_id[i];
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
                'SELECT Forums.id, category, title, content, view_cnt, Users.id AS author, Users.email, Users.username, Forums.created_at ' +
                'FROM Forums JOIN Users ON Forums.user_id = Users.id WHERE Forums.id = ?',
                [id],
                async (err, forums) => {
                    if (err) throw err;

                    for (let i = 0; i < forums.length; i++) {
                        forums[i].coins = await getCoinsOfForum(forums[i].id);
                    }
                    resolve(forums);

                }
            );
        });
    };
    let forums = await getForumBycoin(coins);
    forums = JSON.parse(JSON.stringify(forums));
    for (let i = 0; i < forums.length; i++) {
        // console.log(forums_id);
        result[i] = await getForumByid(forums[i].forum_id);

    }
    return res.status(200).json({
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
            return res.status(200).json({
                message: "comment created successfully"
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
    conn.query(
        "SELECT * FROM Forums JOIN Users ON Forums.user_id = Users.id WHERE Forums.id = ?",
        [req.query.forum_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            });
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
  const { forum_id } = req.params;
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
  const { forum_id } = req.params;
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

exports.forumLikeCheck = (req, res) => {
  const { forum_id } = req.params;
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