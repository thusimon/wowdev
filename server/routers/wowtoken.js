const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router()
const { getAllTokens } = require('./util');
const WoWToken = require('../db/wowTokenModel');

// configure Express
router.use(cookieParser());

router.get('/all', async (req, res) => {
  try {
    let wowTokens = await WoWToken.find({}, { _id: 0, id: 0, updatedAt: 0}).sort({createdAt: 1});
    wowTokens = wowTokens.map(t => ({p: t.prices, d: t.createdAt}));
    if (!wowTokens) {
      return res.status(400).json({err: 'no wow tokens at all'});
    } else {
      return res.status(200).json({tokens: wowTokens});
    }
  } catch (err) {
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