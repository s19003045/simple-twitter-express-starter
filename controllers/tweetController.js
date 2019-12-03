const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Reply = db.Reply;
const Like = db.Like;
const Sequelize = require("sequelize");

const tweetController = {
  getTweets: (req, res) => {
    User.findAll({
      include: [{ model: User, as: "Followers" }]
    }).then(users => {
      users.sort((a, b) =>
        a.Followers.length > b.Followers.length
          ? -1
          : b.Followers.length > a.Followers.length
          ? 1
          : 0
      );
      let top_ten_users = users.slice(0, 10);
      Tweet.findAndCountAll({
        include: [User, Reply, Like],
        order: [["updatedAt", "DESC"]]
      }).then(result => {
        res.render("tweets", {
          tweets: result.rows,
          top_ten_users
        });
      });
    });
  },
  postTweets: (req, res) => {
    if (!req.body.tweettext) {
      req.flash("error_messages", "there's no text input");
      res.redirect("back");
    } else {
      return Tweet.create({
        description: req.body.tweettext,
        UserId: req.user.id
      }).then(user => {
        res.redirect("/tweets");
      });
    }
  },
  getReplies: (req, res) => {
    Tweet.findByPk(req.params.tweet_id, {
      include: [
        {
          model: User,
          attributes: ["name", "avatar", "introduction"],
          include: [
            { model: Tweet },
            { model: User, as: "Followers" },
            { model: User, as: "Followings" },
            { model: Like }
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
      res.render("replies", { tweet, twitter });
    });
  }
};

module.exports = tweetController;
