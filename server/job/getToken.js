const axios = require('axios');
const { getAccessTokenCredFlow } = require('../routers/util');
const { connectToDb, closeConnection } = require('../db/connection');
const WowToken = require('../db/wowTokenModel');

// CN, US, EU, KR, TW
const TOKEN_URLS = [
  'https://gateway.battlenet.com.cn/data/wow/token/index?namespace=dynamic-cn&locale=zh_CN',
  'https://us.api.blizzard.com/data/wow/token/index?namespace=dynamic-us&locale=en_US',
  'https://eu.api.blizzard.com/data/wow/token/index?namespace=dynamic-eu&locale=en_US',
  'https://kr.api.blizzard.com/data/wow/token/index?namespace=dynamic-kr&locale=en_US',
  'https://tw.api.blizzard.com/data/wow/token/index?namespace=dynamic-tw&locale=en_US'
];

const getTokenJob = async () => {
  const accessTokenResp = await getAccessTokenCredFlow();
  if (accessTokenResp.err) {
    console.log(`falied to get access token, err: ${accessTokenResp.err}`)
    return;
  }
  const accessToken = accessTokenResp.access_token;
  const getTokenRequests = TOKEN_URLS.map(tokenUrl => {
    return axios({
      method: 'get',
      url: `${tokenUrl}&access_token=${accessToken}`,
      headers: {
        'Accept': 'application/json'
      }
    })
  });
  Promise.allSettled(getTokenRequests)
  .then(tokenResponses => {
    console.log('get token prices of all regions');
    return tokenResponses.map(tokenResp => {
      if (tokenResp.status === 'fulfilled') {
        return tokenResp.value.data.price;
      } else {
        return -1;
      }
    });
  })
  .then(prices => {
    return connectToDb()
    .then(() => {
      const wowToken = new WowToken({
        prices
      });
      return wowToken.save()
      .then(() => {
        console.log(`successfully saved token price: ${prices}`);
        closeConnection();
      });
    });
  });
}

getTokenJob();
