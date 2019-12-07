const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Like = db.Like
const pageLimit = 15

const adminController = {
  getTweets: (req, res) => {
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    return Tweet.findAndCountAll({
      offset: offset,
      limit: pageLimit
    }).then(tweets => {
      // data for pagination
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(tweets.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1

      const data = tweets.rows.map(r => {
        r.description = r.description.substring(0, 50)
        return r
      })

      return res.render('admin/tweets', {
        tweets: data,
        page: page,
        totalPage: totalPage,
        prev: prev,
        next: next
      })
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
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    return User.findAndCountAll({
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
      ],
      offset: offset,
      limit: pageLimit,
      distinct: true
    }).then(users => {
      // data for pagination
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(users.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1

      users = users.rows.map(user => ({
        ...user.dataValues,
        // 計算推文篇數
        TweetCount: user.Tweets.length,
        //同一user的每篇推文like數丟進一個陣列
        LikeArray: user.Tweets.map(function (obj) {
          return obj.Likes.length
        }),
      }))

      users = users.map(user => ({
        ...user,
        //計算該user獲得總like數
        LikeCount: user.LikeArray.reduce(function (a, b) {
          return a + b;
        }, 0)
      }))

      // 依推文篇數排序清單
      users = users.sort((a, b) => b.TweetCount - a.TweetCount)
      return res.render('admin/users', {
        users,
        page: page,
        totalPage: totalPage,
        prev: prev,
        next: next
      })
    })
  }
}

module.exports = adminController