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
            // 新增 isFollowed 屬性
            top_ten_users = top_ten_users.map(r => ({
              ...r.dataValues,
              isFollowed: logginedUser.Followings.map(d => d.id).includes(parseInt(r.id))
            }))

            result.rows = result.rows.map(r => ({
              ...r.dataValues,
              isLiked: r.Likes.map(d => d.UserId).includes(helpers.getUser(req).id)
            }))

            // 登入者 id
            const reqUserId = helpers.getUser(req).id

            res.render("tweets", {
              tweets: result.rows,
              top_ten_users,
              reqUserId
            });
          })
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
  },
  // 對推播 like
  addLike: (req, res) => {

    // 判斷是否已 follow 該使用者
    Like.findAll({
      where: {
        UserId: helpers.getUser(req).id
      }
    })
      .then(likedTweets => {

        const likedTweetsId = likedTweets.map(r => r.TweetId)
        // 已 follow 該使用者，返回
        if (likedTweetsId.includes(parseInt(req.params.id))) {
          return res.redirect('back')
        } else {
          // 若未曾 like 該 tweet，則新增一筆
          return Like.create({
            UserId: helpers.getUser(req).id,
            TweetId: parseInt(req.params.id)
          })
            .then((like) => {
              return res.redirect('back')
            })
        }
      })
  },
  // 對推播 unlike
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        TweetId: req.params.id
      }
    })
      .then((like) => {
        like.destroy()
          .then((like) => {
            return res.redirect('back')
          })
      })
  },
};

module.exports = tweetController;
