const BNET_ID = process.env.BNET_ID;
const BNET_SECRET = process.env.BNET_SECRET;
import btoa from 'btoa';
import axios from 'axios';
const OAUTH_CN_HOST = 'https://www.battlenet.com.cn';
const OAUTH_US_HOST = 'https://oauth.battle.net'

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
      url: `${OAUTH_US_HOST}/token`,
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
    const tokenResults = tokenResponses.map(tokenResult => {
      if (tokenResult.status === 'fulfilled') {
        return tokenResult.value;
      } else {
        return {
          data: {
            price: -10000 // -1G
          }
        };
      }
    });
    return tokenResults.map(tokenResp => tokenResp.data.price);
  });
}

module.exports = { TOKEN_URLS, getAccessTokenCredFlow, getAllTokens };