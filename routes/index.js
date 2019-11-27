const tweetController = require("../controllers/tweetController");
module.exports = app => {
  //如果使用者訪問首頁，就導向 /tweets 的頁面
  app.get("/", (req, res) => res.redirect("/tweets"));

  //在 /tweets 底下則交給 restController.getTweets 來處理
  app.get("/tweets", tweetController.getTweets);
};