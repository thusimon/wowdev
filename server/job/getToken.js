const { getAccessTokenCredFlow, getAllTokens } = require('../routers/util');
const { connectToDb, closeConnection } = require('../db/connection');
const { WoWJobToken } = require('../db/wowTokenModel');

const getTokenJob = async () => {
  const accessTokenResp = await getAccessTokenCredFlow();
  if (accessTokenResp.err) {
    console.log(`falied to get access token, err: ${accessTokenResp.err}`)
    return;
  }
  const accessToken = accessTokenResp.access_token;
  getAllTokens(accessToken)
  .then(prices => {
    return connectToDb()
    .then(() => {
      const wowJobToken = new WoWJobToken({
        prices
      });
      return wowJobToken.save()
      .then(() => {
        console.log(`successfully saved token price: ${prices}`);
        closeConnection();
      });
    });
  });
}

getTokenJob();
