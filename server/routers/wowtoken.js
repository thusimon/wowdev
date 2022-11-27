const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router()
const { getAllTokens } = require('./util');
const { WoWToken } = require('../db/wowTokenModel');
import HourCache from './hourCache';

// configure Express
router.use(cookieParser());

/**
 * historical tokens are updated hourly at 0 miniute
 * if the request is made before 02:05, return the 01:00 cache
 * if the request is made after 02:05, make the database query and upate cache
 */
const hourCache = new HourCache();

router.get('/all', async (req, res) => {
  try {
    let wowTokens = hourCache.get();
    if (wowTokens) {
      return res.status(200).json({tokens: wowTokens});
    }
    wowTokens = await WoWToken.find({}, { _id: 0, id: 0, updatedAt: 0}).sort({createdAt: 1});
    wowTokens = wowTokens.map(t => ({p: t.prices, d: t.createdAt.getTime()}));
    if (!wowTokens) {
      hourCache.clear();
      return res.status(400).json({err: 'no wow tokens at all'});
    } else {
      hourCache.put(wowTokens);
      return res.status(200).json({tokens: wowTokens});
    }
  } catch (err) {
    hourCache.clear();
    return res.status(401).json({err: err.message});
  }
});

router.get('/', (req, res) => {
  const accessToken = req.cookies.act;
  if (accessToken) {
    getAllTokens(accessToken)
    .then((tokensResp) => {
        //handle success        
        res.json(tokensResp);
    })
    .catch(err => {
      res.status(400).send({err});
    });
  } else {
    res.status(401).send({err: 'no access token'});
  }
});

module.exports = router;