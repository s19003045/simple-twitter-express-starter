const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Like = db.Like

const adminController = {
  getTweets: (req, res) => {
    return Tweet.findAll().then(tweets => {
      const data = tweets.map(r => {
        r.description = r.description.substring(0, 50)
        return r
      })

      return res.render('admin/tweets', { tweets: data })
    })
  },

  deleteTweet: (req, res) => {
    return Tweet.findByPk(req.params.id)
      .then((tweet) => {
        tweet.destroy()
          .then((tweet) => {
            res.redirect('/admin/tweets')
          })
      })
  },

  getUsers: (req, res) => {
    return User.findAll({
      include: [
        {
          model: Tweet,
          attributes: ['id'],
          include: [{
            model: Like,
            attributes: ['id']
          }]
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
      ]
    }).then(users => {


      users = users.map(user => ({
        ...user.dataValues,
        // 計算推文篇數
        TweetCount: user.Tweets.length,
        LikeArray: user.Tweets.map(function (obj) {
          return obj.Likes.length
        }),
      }))

      // 依推文篇數排序清單
      users = users.sort((a, b) => b.TweetCount - a.TweetCount)
      console.log(users[8])

      return res.render('admin/users', { users })
    })
  }
}

module.exports = adminController