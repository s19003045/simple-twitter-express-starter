const tweetController = require("../controllers/tweetController");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
module.exports = (app, passport) => {
  // 驗證使用者權限
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/signin");
  };
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.role === "admin") {
        return next();
      }
      return res.redirect("/");
    }
    res.redirect("/signin");
  };

  //如果使用者訪問首頁，就導向 /tweets 的頁面
  app.get("/", authenticated, (req, res) => res.redirect("/tweets"));

  //在 /tweets 底下則交給 restController.getTweets 來處理
  app.get("/tweets", authenticated, tweetController.getTweets);

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

  // 後台
  app.get("/admin", authenticatedAdmin, (req, res) =>
    res.redirect("/admin/tweets")
  );
  app.get("/admin/tweets", authenticatedAdmin, adminController.getTweets);
  app.delete(
    "/admin/tweets/:id",
    authenticatedAdmin,
    adminController.deleteTweet
  );
  app.get("/admin/users", authenticatedAdmin, adminController.getUsers);

};
