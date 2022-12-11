import express from 'express';
import cookieParser from 'cookie-parser';
import { serialize } from 'bson';
import { getAllTokens } from './util';
import WoWToken from '../db/wowTokenModel';
import HourCache from './hourCache';
import otpIntercepter from './otp-intercepter';

const router = express.Router();

// configure Express
router.use(cookieParser());

/**
 * historical tokens are updated hourly at 0 miniute
 */
const hourCache = new HourCache<Buffer>();

router.get('/all', otpIntercepter, async (req, res) => {
  try {
    const wowTokensCache = hourCache.get();
    if (wowTokensCache) {
      res.status(200).end(wowTokensCache, 'binary')
      //return res.status(200).json({tokens: wowTokens});
    }
    let wowTokens = await WoWToken.find({}, { _id: 0, id: 0, updatedAt: 0}).sort({createdAt: 1});
    wowTokens = wowTokens.map(t => ({p: t.prices, d: t.createdAt.getTime()}));
    if (!wowTokens) {
      hourCache.clear();
      return res.status(400).json({err: 'no wow tokens at all'});
    } else {
      const bsonWowTokens = serialize({tokens: wowTokens});
      hourCache.put(bsonWowTokens);
      res.status(200).end(bsonWowTokens, 'binary')
      //return res.status(200).json({tokens: wowTokens});
    }
  } catch (err) {
    hourCache.clear();
    return res.status(401).json({err: err.message});
  }
});

router.get('/', otpIntercepter, (req, res) => {
  const accessToken = req.cookies.act;
  if (accessToken) {
    getAllTokens(accessToken)
    .then((tokensResp) => {
        //handle success
        const bsonResp = serialize(tokensResp);
        res.status(200).end(bsonResp, 'binary')
    })
    .catch(err => {
      res.status(400).send({err});
    });
  } else {
    res.status(401).send({err: 'no access token'});
  }
});

export default router;
