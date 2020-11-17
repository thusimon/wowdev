const btoa = require('btoa');
const axios = require('axios');
const BNET_ID = process.env.BNET_ID;
const BNET_SECRET = process.env.BNET_SECRET;
const OAUTH_CN_HOST = 'https://www.battlenet.com.cn';

// CN, US, EU, KR, TW
const TOKEN_URLS = [
  'https://gateway.battlenet.com.cn/data/wow/token/index?namespace=dynamic-cn&locale=zh_CN',
  'https://us.api.blizzard.com/data/wow/token/index?namespace=dynamic-us&locale=en_US',
  'https://eu.api.blizzard.com/data/wow/token/index?namespace=dynamic-eu&locale=en_US',
  'https://kr.api.blizzard.com/data/wow/token/index?namespace=dynamic-kr&locale=en_US',
  'https://tw.api.blizzard.com/data/wow/token/index?namespace=dynamic-tw&locale=en_US'
];

const getAccessTokenCredFlow = async () => {
  const basicAuth = btoa(`${BNET_ID}:${BNET_SECRET}`);
  const bodyFormData = new URLSearchParams();
  bodyFormData.append('grant_type', 'client_credentials');
  bodyFormData.append('scope', 'wow.profile openid');
  try {
    const tokenResp = await axios({
      method: 'post',
      url: `${OAUTH_CN_HOST}/oauth/token`,
      data: bodyFormData,
      headers: {
        authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if (tokenResp) {
      return tokenResp.data;
    } else {
      return {err: 'no token resp'};
    }
  } catch (err) {
    return {err: 'no token resp'};
  }
}

const getAllTokens = async (accessToken) => {
  const getTokenRequests = TOKEN_URLS.map(tokenUrl => {
    return axios({
      method: 'get',
      url: `${tokenUrl}&access_token=${accessToken}`,
      headers: {
        'Accept': 'application/json'
      }
    })
  });
  return Promise.allSettled(getTokenRequests)
  .then(tokenResponses => {
    return tokenResponses.map(tokenResp => {
      if (tokenResp.status === 'fulfilled') {
        return tokenResp.value.data.price;
      } else {
        return -1;
      }
    });
  });
}

module.exports = { TOKEN_URLS, getAccessTokenCredFlow, getAllTokens };