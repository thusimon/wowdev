const btoa = require('btoa');
const axios = require('axios');
const BNET_ID = process.env.BNET_ID;
const BNET_SECRET = process.env.BNET_SECRET;
const PORT = process.env.PORT;
const BNET_REDIRECT_URL = process.env.BNET_REDIRECT_URL || `http://localhost:${PORT}/api/oauth2/redirect`;
const OAUTH_CN_HOST = 'https://www.battlenet.com.cn';

const getAccessTokenCredFlow = async () => {
  const basicAuth = btoa(`${BNET_ID}:${BNET_SECRET}`);
  const bodyFormData = new URLSearchParams();
  bodyFormData.append('grant_type', 'client_credentials');
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

module.exports = { getAccessTokenCredFlow };