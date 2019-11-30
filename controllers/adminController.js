const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Like = db.Like

const adminController = {
  getTweets: (req, res) => {
    return Tweet.findAll().then(tweets => {
      return res.render('admin/tweets', { tweets })
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
        Tweet,
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
      ]
    }).then(users => {
      return res.render('admin/users', { users })
    })
  }
}

module.exports = adminController