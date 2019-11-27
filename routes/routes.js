const express = require('express')
const router = express.Router()
const helpers = require('../_helpers')

const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (req.user.role === 'admin') { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

// ===== route for tweets =====
router.get('/', (req, res) => {
  res.redirect('/tweets')
})
router.get('/tweets', (req, res) => {
  res.render('tweets')
})

// ===== route for users =====


// ===== route for followships =====


// ===== route for admin =====


module.exports = router