const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Reply = db.Reply;
const Like = db.Like;
const helpers = require("../_helpers");

const replyController = {
  getReplies: (req, res) => {
    Tweet.findByPk(req.params.tweet_id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "avatar", "introduction"],
          include: [
            { model: Tweet, attributes: ["id"] },
            { model: User, as: "Followers", attributes: ["id"] },
            { model: User, as: "Followings", attributes: ["id"] },
            { model: Like, attributes: ["id"] }
          ]
        },
        {
          model: Reply,
          include: [{ model: User, attributes: ["name", "avatar"] }]
        },
        { model: Like }
      ]
    }).then(tweet => {
      // 整理資料
      const twitter = {
        ...tweet.User.dataValues,
        tweetCount: tweet.User.Tweets.length,
        followingCount: tweet.User.Followings.length,
        followerCount: tweet.User.Followers.length,
        likeCount: tweet.User.Likes.length
      };
      // 取得登入者的 followings，做為判斷 top_10_users 是否為登入者的 followings
      User.findByPk(parseInt(helpers.getUser(req).id), {
        include: [
          Like,
          {
            model: User,
            as: 'Followings',
            attributes: ['id']
          }
        ]
      })
        .then(logginedUser => {
          tweet.isLiked = logginedUser.Likes.map(d => d.TweetId).includes(tweet.id)
          res.render("replies", { tweet, twitter });
        })



    });
  },
  postReplies: (req, res) => {
    if (!req.body.comment) {
      req.flash("error_messages", "there's no text input");
      res.redirect("back");
    } else {
      return Reply.create({
        comment: req.body.comment,
        TweetId: req.params.tweet_id,
        UserId: helpers.getUser(req).id
      }).then(reply => {
        res.redirect("back");
      });
    }
  }
};

module.exports = replyController;
