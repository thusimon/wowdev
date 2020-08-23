const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const BnetStrategy = require('passport-bnet').Strategy;
const { getAccessTokenCredFlow } = require('./util');
const BNET_ID = process.env.BNET_ID;
const BNET_SECRET = process.env.BNET_SECRET;
const PORT = process.env.PORT;
const BNET_REDIRECT_URL = process.env.BNET_REDIRECT_URL || `http://localhost:${PORT}/api/oauth2/redirect`;
//const SESSION_SECRET = process.env.SESSION_SECRET;

const router = express.Router()

let accessToken; //cache

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the BnetStrategy within Passport.
passport.use(new BnetStrategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: BNET_REDIRECT_URL,
    region: "cn",
    scope: "wow.profile openid",
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(function () {
    return done(null, profile);
  });
}));

// configure Express
router.use(cookieParser());


// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
router.use(passport.initialize());
router.use(passport.session());

router.get('/authorize', passport.authenticate('bnet'));


router.get('/redirect',
  passport.authenticate('bnet', { failureRedirect: '/failure' }),
  (req, res) => {
    res.cookie('act' ,req.user.token, {httpOnly: true, sameSite: true, secure: false});
    res.redirect('/wowtoken/');
  });

router.get('/credflow', async (req, res) => {
  const tokenResp = await getAccessTokenCredFlow();
  if (tokenResp.err) {
    res.status(401).send({err: tokenResp.err});
  } else {
    res.cookie('act' , tokenResp.access_token, {httpOnly: true, sameSite: true, secure: false});
    res.json(tokenResp);
  }
})

/*
router.get('/redirect', (req, res) => {
  const code = req.query.code;
  // exchange for access token
  const basicAuth = btoa(`${BNET_ID}:${BNET_SECRET}`);
  // build request body
  const bodyFormData = new URLSearchParams();
  bodyFormData.append('grant_type', 'authorization_code');
  bodyFormData.append('code', code);
  bodyFormData.append('redirect_uri', BNET_REDIRECT_URL);
  bodyFormData.append('scope', 'wow.profile openid');
  axios({
    method: 'post',
    url: `${OAUTH_CN_HOST}/oauth/token`,
    data: bodyFormData,
    headers: {
      authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(function (response) {
      //handle success
      console.log(response.data);
  })
  .catch(function (response) {
      //handle error
      console.log('err', response);
  });
});

router.get('/success', (req, res) => {
  if(req.isAuthenticated()) {
    console.log(58, req.user);
    var output = '<h1>Express OAuth Test</h1>' + req.user.id + '<br>';
    if(req.user.battletag) {
      output += req.user.battletag + '<br>';
    }
    output += '<a href="/api/oauth2/logout">Logout</a>';
    res.send(output);
  } else {
    res.send('<h1>Express OAuth Test</h1>' +
             '<a href="/api/oauth2">Login with Bnet</a>');
  }
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/api/oauth2');
});
*/

module.exports = router;