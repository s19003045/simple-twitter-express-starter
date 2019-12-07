const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Reply = db.Reply;
const Like = db.Like;
const helpers = require("../_helpers");

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
    if (!req.body.description) {
      req.flash("error_messages", "there's no text input");
      res.redirect("back");
    } else if (req.body.description.length > 140) {
      req.flash(
        "error_messages",
        "tweet description only can contain max 140 characters."
      );
      res.redirect("back");
    } else {
      return Tweet.create({
        description: req.body.description,
        UserId: helpers.getUser(req).id
      }).then(tweet => {
        res.redirect("/tweets");
      });
    }
  }
};

module.exports = tweetController;
