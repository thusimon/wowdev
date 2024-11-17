import btoa from 'btoa';
import axios, { AxiosError } from 'axios';
const BNET_ID = process.env.BNET_ID;
const BNET_SECRET = process.env.BNET_SECRET;
const OAUTH_CN_HOST = 'https://www.battlenet.com.cn';
const OAUTH_US_HOST = 'https://oauth.battle.net'

// CN, US, EU, KR, TW
export const TOKEN_URLS = [
  'https://gateway.battlenet.com.cn/data/wow/token/index?namespace=dynamic-cn&locale=zh_CN',
  'https://us.api.blizzard.com/data/wow/token/index?namespace=dynamic-us&locale=en_US',
  'https://eu.api.blizzard.com/data/wow/token/index?namespace=dynamic-eu&locale=en_US',
  'https://kr.api.blizzard.com/data/wow/token/index?namespace=dynamic-kr&locale=en_US',
  'https://tw.api.blizzard.com/data/wow/token/index?namespace=dynamic-tw&locale=en_US'
];

export const getAccessTokenCredFlow = async () => {
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
      return {err: 'no token resp 1'};
    }
  } catch (err) {
    return {err: 'no token resp 2'};
  }
};

export const isAccessTokenExpired = (accessToken) => {
  if (!accessToken || !accessToken.access_token || !Number.isInteger(accessToken.expires_at)) {
    return true;
  }
  if (new Date().getTime() >= accessToken.expires_at) {
    return true;
  }
  return false;
}

export const getAllTokens = async (accessToken) => {
  const getTokenRequests = TOKEN_URLS.map(tokenUrl => {
    // Hack: by pass the Chinese token url
    if (tokenUrl === TOKEN_URLS[0]) {
      return Promise.resolve({
        data: {
            price: -10000 // -1G
        }
      });
    }
    return axios({
      method: 'get',
      url: tokenUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
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
};
