const bcrypt = require("bcrypt-nodejs");
const db = require("../models");
const User = db.User;
const Tweet = db.Tweet;
const Like = db.Like;
const Reply = db.Reply;
const Followship = db.Followship;
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const helpers = require("../_helpers");

const userController = {
  signUpPage: (req, res) => {
    return res.render("signup");
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash("error_messages", "兩次密碼輸入不同！");
      return res.redirect("/signup");
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash("error_messages", "信箱重複！");
          return res.redirect("/signup");
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(
              req.body.password,
              bcrypt.genSaltSync(10),
              null
            )
          }).then(user => {
            req.flash("success_messages", "成功註冊帳號！");
            return res.redirect("/signin");
          });
        }
      });
    }
  },

  signInPage: (req, res) => {
    return res.render("signin");
  },

  signIn: (req, res) => {
    req.flash("success_messages", "成功登入！");
    res.redirect("/tweets");
  },

  logout: (req, res) => {
    req.flash("success_messages", "登出成功！");
    req.logout();
    res.redirect("/signin");
  },

  getUserTweets: async (req, res) => {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          order: [["createdAt", "DESC"]],
          include: [Reply, Like]
        },
        {
          model: User,
          as: "Followers",
          attributes: ["id"]
        },
        {
          model: User,
          as: "Followings",
          attributes: ["id"]
        },
        {
          model: Like,
          attributes: ["id"]
        }
      ]
    })
    // return res.json(user)
    const logginedUser = await User.findByPk(parseInt(helpers.getUser(req).id), {
      include: [
        Like,
        {
          model: User,
          as: 'Followings',
          attributes: ['id']
        }
      ]
    })

    const data = {
      ...user.dataValues,
      tweetCount: user.Tweets.length,
      followerCount: user.Followers.length,
      followingCount: user.Followings.length,
      likeCount: user.Likes.length,
      isFollowed: logginedUser.Followings.map(d => d.id).includes(parseInt(req.params.id))
    }

    data.Tweets = data.Tweets.map(r => ({
      ...r.dataValues,
      replyCount: r.Replies.length,
      likeCount: r.Likes.length,
      isLiked: logginedUser.Likes.map(d => d.TweetId).includes(r.id)
    }))

    const reqUserId = helpers.getUser(req).id

    return res.render('userTweets', { data, reqUserId })

  },

  getUserFollowings: async (req, res) => {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          attributes: ["id"]
        },
        {
          model: User,
          as: "Followers",
          attributes: ["id"]
        },
        {
          model: User,
          as: "Followings"
        },
        {
          model: Like,
          attributes: ["id"]
        }
      ]
    })

    const logginedUser = await User.findByPk(parseInt(helpers.getUser(req).id), {
      include: [
        Like,
        {
          model: User,
          as: 'Followings',
          attributes: ['id']
        }
      ]
    })

    const data = {
      ...user.dataValues,
      tweetCount: user.Tweets.length,
      followerCount: user.Followers.length,
      followingCount: user.Followings.length,
      likeCount: user.Likes.length,
      isFollowed: logginedUser.Followings.map(d => d.id).includes(parseInt(req.params.id))
    }

    //將 followings 依建立時間從最新到最舊排序
    data.Followings = data.Followings.sort((a, b) => {
      return b.createdAt - a.createdAt
    })

    data.Followings = data.Followings.map(r => ({
      ...r.dataValues,
      // 該 user 是否被使用者追蹤者
      isFollowed: logginedUser.Followings.map(d => d.id).includes(r.id),
      isUserSelf: helpers.getUser(req).id === r.id
    }))

    const reqUserId = helpers.getUser(req).id

    return res.render('userFollowings', { data, reqUserId })

  },

  getUserFollowers: async (req, res) => {
    // 先找出該 user (被搜尋的 user)的相關資料
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          attributes: ["id"]
        },
        {
          model: User,
          as: "Followers"
        },
        {
          model: User,
          as: "Followings",
          attributes: ["id"]
        },
        {
          model: Like,
          attributes: ["id"]
        }
      ]
    })
    const logginedUser = await User.findByPk(parseInt(helpers.getUser(req).id), {
      include: [
        Like,
        {
          model: User,
          as: 'Followings',
          attributes: ['id']
        }
      ]
    })

    const data = {
      ...user.dataValues,
      tweetCount: user.Tweets.length,
      followerCount: user.Followers.length,
      followingCount: user.Followings.length,
      likeCount: user.Likes.length,
      isFollowed: logginedUser.Followings.map(d => d.id).includes(parseInt(req.params.id))
    }

    //將 followers 依建立時間從最新到最舊排序
    data.Followers = data.Followers.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    data.Followers = data.Followers.map(r => ({
      ...r.dataValues,
      // 該 user 是否被使用者追蹤者
      isFollowed: logginedUser.Followings.map(d => d.id).includes(r.id),
      isUserSelf: helpers.getUser(req).id === r.id
    }));

    const reqUserId = helpers.getUser(req).id;

    return res.render("userFollowers", { data, reqUserId });
  },
  getUserLikes: async (req, res) => {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          attributes: ["id"],
        },
        {
          model: User,
          as: "Followers",
          attributes: ["id"]
        },
        {
          model: User,
          as: "Followings",
          attributes: ["id"]
        },
        {
          model: Like,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: Tweet,
              include: [
                {
                  model: User,
                  attributes: ["id", "name", "avatar"]
                },
                {
                  model: Like,
                  attributes: ["id"]
                },
                {
                  model: Reply,
                  attributes: ["id"]
                }
              ]
            }
          ]
        }
      ]
    })

    const logginedUser = await User.findByPk(parseInt(helpers.getUser(req).id), {
      include: [{
        model: Like, attributes: ["TweetId"]
      }]
    })
    const data = {
      ...user.dataValues,
      tweetCount: user.Tweets.length,
      followerCount: user.Followers.length,
      followingCount: user.Followings.length,
      likeCount: user.Likes.length
    }
    const likedTweets = data.Likes.map(r => ({
      ...r.Tweet.dataValues,
      replyCount: r.Tweet.Replies.length,
      likeCount: r.Tweet.Likes.length,
      isLiked: logginedUser.Likes.map(d => d.TweetId).includes(r.Tweet.id)
    }))
    // 登入者 id
    const reqUserId = helpers.getUser(req).id

    return res.render('userLikes', { data, reqUserId, likedTweets })
  },

  addFollowing: (req, res) => {
    if (parseInt(req.body.id) === helpers.getUser(req).id) {
      req.flash("error_messages", "permission denied");
      // 導向首頁(為了通過測試，status code 須為 200)
      return res.render("tweets");
    }
    // 判斷是否已 follow 該使用者
    Followship.findAll({
      where: {
        followerId: helpers.getUser(req).id
      }
    })
      .then(followings => {
        // 已 follow 該使用者，返回
        const followingsId = followings.map(r => r.followingId)
        if (followingsId.includes(parseInt(req.body.id))) {
          return res.redirect('back')
        } else {
          // 未 follow 該使用者，新增 followship
          return Followship.create({
            followingId: parseInt(req.body.id),
            followerId: helpers.getUser(req).id
          })
            .then((followship) => {
              return res.redirect('back')
            })
        }
      })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId
      }
    }).then(followship => {
      followship.destroy().then(followship => {
        return res.redirect("back");
      });
    });
  },

  getUserProfile: (req, res) => {
    if (parseInt(req.params.id) !== helpers.getUser(req).id) {
      return res.redirect(`/users/${helpers.getUser(req).id}/tweets`);
    }
    return User.findByPk(req.params.id)
      .then(user => {
        return res.render('getUserProfile', { user })
      })
  },

  // 編輯使用者個人資料
  putUserProfile: (req, res) => {
    if (parseInt(req.params.id) !== parseInt(helpers.getUser(req).id)) {
      req.flash("error_messages", "permission denied");
      return res.redirect(`/users/${helpers.getUser(req).id}/tweets`);
    }

    if (!req.body.name) {
      req.flash("error_messages", "name should not be blank");
      return res.redirect("back");
    }

    const { file } = req;

    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);

      imgur.upload(file.path, (err, img) => {
        if (err) {
          console.log(err);
        } else {
          return User.findByPk(req.params.id).then(user => {
            user
              .update({
                name: req.body.name,
                avatar: file ? img.data.link : user.avatar,
                introduction: req.body.introduction || user.introduction
              })
              .then(user => {
                req.flash(
                  "success_messages",
                  "profile was successfully update"
                );
                return res.redirect(`/users/${helpers.getUser(req).id}/tweets`);
              });
          });
        }
      });
    } else {
      return User.findByPk(req.params.id).then(user => {
        user
          .update({
            name: req.body.name,
            introduction: req.body.introduction || user.introduction
          })
          .then(user => {
            req.flash("success_messages", "profile was successfully update");
            return res.redirect(`/users/${helpers.getUser(req).id}/tweets`);
          });
      });
    }
  }
};

module.exports = userController;
