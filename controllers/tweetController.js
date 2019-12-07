const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Reply = db.Reply;
const Like = db.Like;
const helpers = require("../_helpers");
const pageLimit = 10;

const tweetController = {
  getTweets: (req, res) => {
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

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
        offset: offset,
        limit: pageLimit,
        distinct: true,
        order: [["updatedAt", "DESC"]]
      }).then(result => {
        // data for pagination
        let page = Number(req.query.page) || 1
        let pages = Math.ceil(result.count / pageLimit)
        let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
        let prev = page - 1 < 1 ? 1 : page - 1
        let next = page + 1 > pages ? pages : page + 1

        res.render("tweets", {
          tweets: result.rows,
          top_ten_users,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
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
