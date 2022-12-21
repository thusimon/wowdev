import express from 'express';
import cookieParser from 'cookie-parser';
import { serialize } from 'bson';
import { getAccessTokenCredFlow, getAllTokens, isAccessTokenExpired } from './util';
import WoWToken from '../db/wowTokenModel';
import Cache from './cache';
import otpIntercepter from './otp-intercepter';

const router = express.Router();

// configure Express
router.use(cookieParser());

/**
 * historical tokens are updated hourly at 0 miniute
 */
const historyDataCache = new Cache<Buffer>(60 * 60 * 1000);
const realtimeDataCache = new Cache<Buffer>(60 * 10 * 1000);

router.get('/all', otpIntercepter, async (req, res) => {
  try {
    const wowTokensCache = historyDataCache.get();
    if (wowTokensCache) {
      res.status(200).end(wowTokensCache, 'binary')
    }
    let wowTokens = await WoWToken.find({}, { _id: 0, id: 0, updatedAt: 0}).sort({createdAt: 1});
    wowTokens = wowTokens.map(t => ({p: t.prices, d: t.createdAt.getTime()}));
    if (!wowTokens) {
      historyDataCache.clear();
      return res.status(400).json({err: 'no wow tokens at all'});
    } else {
      const bsonWowTokens = serialize({tokens: wowTokens});
      const curTime = new Date();
      const timestamp = new Date(curTime.getFullYear(), curTime.getMonth(), curTime.getDate(), curTime.getHours(), 0, 0, 0).getTime();
      historyDataCache.put(bsonWowTokens, timestamp);
      res.status(200).end(bsonWowTokens, 'binary')
    }
  } catch (err) {
    historyDataCache.clear();
    return res.status(401).json({err: err.message});
  }
});

let accessTokenCached = null;

router.get('/', otpIntercepter, async (req, res) => {
  const wowTokensCache = realtimeDataCache.get();
  if (wowTokensCache) {
    res.status(200).end(wowTokensCache, 'binary');
    return;
  }
  // no cache, need to get wow tokens
  // check if accessToken expired
  if (isAccessTokenExpired(accessTokenCached)) {
    const newAccessToken = await getAccessTokenCredFlow();
    if (newAccessToken.err) {
      realtimeDataCache.clear();
      res.status(403).json({ err: newAccessToken.err });
      return;
    }
    newAccessToken.expires_at = new Date().getTime() + newAccessToken.expires_in * 1000;
    accessTokenCached = newAccessToken;
  }
  const accessToken = accessTokenCached.access_token;
  if (accessToken) {
    getAllTokens(accessToken)
    .then((tokensResp) => {
        //handle success
        const bsonResp = serialize(tokensResp);
        realtimeDataCache.put(bsonResp, new Date().getTime());
        res.status(200).end(bsonResp, 'binary')
    })
    .catch(err => {
      realtimeDataCache.clear();
      res.status(400).send({err});
    });
  } else {
    realtimeDataCache.clear();
    res.status(401).send({err: 'no access token'});
  }
});

export default router;
