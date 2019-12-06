const tweetController = require("../controllers/tweetController");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

// helpers 用來取代 req.user 成 helpers.getUser(req) & 取代 req.isAuthenticated() 成 helpers.ensureAuthenticated(req)
const helpers = require('../_helpers')

module.exports = (app, passport) => {
  // 驗證使用者權限
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next();
    }
    res.redirect("/signin");
  };
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).role === "admin") {
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
  app.post("/tweets", authenticated, tweetController.postTweets);

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

  // 查看使用者的個人推播頁面、followings、followers、likes
  app.get('/users/:id/tweets', authenticated, userController.getUserTweets)
  app.get('/users/:id/followings', authenticated, userController.getUserFollowings)
  app.get('/users/:id/followers', authenticated, userController.getUserFollowers)
  app.get('/users/:id/likes', authenticated, userController.getUserLikes)
  app.post('/followships', authenticated, userController.addFollowing)
  app.delete('/followships/:userId', authenticated, userController.removeFollowing)
  app.get('/users/:id/edit', authenticated, userController.getUserProfile)
  // 為了通過測試，將 put 改成 post 
  app.post('/users/:id/edit', authenticated, upload.single('image'), userController.putUserProfile)


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
