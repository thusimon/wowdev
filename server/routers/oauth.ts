import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import passportBNet from 'passport-bnet';
import { getAccessTokenCredFlow } from './util';
import otpIntercepter from './otp-intercepter';

const BNET_ID = process.env.BNET_ID;
const BNET_SECRET = process.env.BNET_SECRET;
const PORT = process.env.PORT;
const BNET_REDIRECT_URL = process.env.BNET_REDIRECT_URL || `http://localhost:${PORT}/api/oauth2/redirect`;
//const SESSION_SECRET = process.env.SESSION_SECRET;
const BnetStrategy = passportBNet.Strategy;

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
    region: 'us',
    scope: 'wow.profile openid',
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

const DAY_MILLISECONDS = 60 * 60 * 24 * 1000;

router.get('/redirect',
  passport.authenticate('bnet', { failureRedirect: '/failure' }),
  (req: any, res) => {
    res.cookie('act' ,req.user.token, {
      httpOnly: true,
      sameSite: true,
      secure: true,
      expires: new Date(Date.now() + DAY_MILLISECONDS) // blizzard access token expires after 1 day
    });
    res.redirect('/wowtoken/');
  });

router.get('/credflow', otpIntercepter, async (req, res) => {
  const tokenResp = await getAccessTokenCredFlow();
  if (tokenResp.err) {
    res.status(401).send({err: tokenResp.err});
  } else {
    res.cookie('act' , tokenResp.access_token, {
      httpOnly: true,
      sameSite: true,
      secure: true,
      expires: new Date(Date.now() + DAY_MILLISECONDS) // blizzard access token expires after 1 day
    });
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

export default router;
