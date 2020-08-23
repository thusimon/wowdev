const express = require('express');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const router = express.Router()

const TOKEN_CN_URL = 'https://gateway.battlenet.com.cn/data/wow/token/index?namespace=dynamic-cn&locale=zh_CN'
// configure Express
router.use(cookieParser());

router.get('/', (req, res) => {
  const accessToken = req.cookies.act;
  if (accessToken) {
    axios({
      method: 'get',
      url: `${TOKEN_CN_URL}&access_token=${accessToken}`,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then((tokenResp) => {
        //handle success        
        res.json(tokenResp.data)
    })
    .catch(err => {
      res.status(400).send({err});
    });
  } else {
    res.status(401).send({err: 'no access token'});
  }
})

module.exports = router;