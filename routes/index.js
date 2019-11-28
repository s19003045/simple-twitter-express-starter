const tweetController = require("../controllers/tweetController");
const userController = require("../controllers/userController");
module.exports = (app, passport) => {
  //如果使用者訪問首頁，就導向 /tweets 的頁面
  app.get("/", (req, res) => res.redirect("/tweets"));

  //在 /tweets 底下則交給 restController.getTweets 來處理
  app.get("/tweets", tweetController.getTweets);

  // signup
  app.get("/signup", userController.signUpPage);
  app.post("/signup", userController.signUp);

  // signin
  app.get("/signin", userController.signInPage);
  app.post(
    "/signin",
    passport.authenticate("local", {
      failureRedirect: "/signin",
      failureFlash: true
    }),
    userController.signIn
  );
  app.get("/logout", userController.logout);
};
