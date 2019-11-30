const bcrypt = require("bcrypt-nodejs");
const db = require("../models");
const User = db.User;
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply

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

  getUserTweets: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          order: [['createdAt', 'DESC']],
          limit: 30, //搜尋 30 筆 
          include: [Reply, Like]
        },
        {
          model: User,
          as: 'Followers',
          attributes: ['id']
        },
        {
          model: User,
          as: 'Followings',
          attributes: ['id']
        },
        {
          model: Like,
          attributes: ['id']
        }
      ]
    })
      .then(user => {

        const data = {
          ...user.dataValues,
          tweetCount: user.Tweets.length,
          followerCount: user.Followers.length,
          followingCount: user.Followings.length,
          likeCount: user.Likes.length
        }
        data.Tweets = data.Tweets.map(tweet => ({
          ...tweet.dataValues,
          replyCount: tweet.Replies.length,
          likeCount: tweet.Likes.length
        }))

        return res.render('userTweets', { data })
      })
  },
  getUserFollowings: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          attributes: ['id']
        },
        {
          model: User,
          as: 'Followers',
          attributes: ['id']
        },
        {
          model: User,
          as: 'Followings'
        },
        {
          model: Like,
          attributes: ['id']
        }
      ]
    })
      .then(user => {

        const data = {
          ...user.dataValues,
          tweetCount: user.Tweets.length,
          followerCount: user.Followers.length,
          followingCount: user.Followings.length,
          likeCount: user.Likes.length,
        }
        data.Followings = data.Followings.map(r => ({
          ...r.dataValues,
          // 該 user 是否被使用者追蹤者
          isFollowed: req.user.Followings.map(d => d.id).includes(r.id)
        }))

        return res.render('userFollowings', { data })
      })
  },
  getUserFollowers: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          attributes: ['id']
        },
        {
          model: User,
          as: 'Followers'
        },
        {
          model: User,
          as: 'Followings',
          attributes: ['id'],
        },
        {
          model: Like,
          attributes: ['id']
        }
      ]
    })
      .then(user => {

        const data = {
          ...user.dataValues,
          tweetCount: user.Tweets.length,
          followerCount: user.Followers.length,
          followingCount: user.Followings.length,
          likeCount: user.Likes.length,
          // 該 user 是否被使用者追蹤者
          isFollowed: req.user.Followers.map(d => d.id).includes(user.id)
        }

        data.Followers = data.Followers.map(r => ({
          ...r.dataValues,
          // 該 user 是否被使用者追蹤者
          isFollowed: req.user.Followings.map(d => d.id).includes(r.id)
        }))
        return res.render('userFollowers', { data })
      })
  },
  getUserLikes: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        {
          model: Tweet,
          attributes: ['id']
        },
        {
          model: User,
          as: 'Followers',
          attributes: ['id']
        },
        {
          model: User,
          as: 'Followings',
          attributes: ['id']
        },
        {
          model: Like,
          order: [['createdAt', 'DESC']],
          limit: 20, //搜尋 20 筆
          include: [
            {
              model: Tweet,
              include: [
                {
                  model: Like,
                  attributes: ['id']
                },
                {
                  model: Reply,
                  attributes: ['id']
                }
              ]
            }
          ]
        }
      ]
    })
      .then(user => {

        const data = {
          ...user.dataValues,
          tweetCount: user.Tweets.length,
          followerCount: user.Followers.length,
          followingCount: user.Followings.length,
          likeCount: user.Likes.length
        }

        return res.json(data)
      })
  },
};

module.exports = userController;
