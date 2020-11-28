const { getAccessTokenCredFlow, getAllTokens } = require('../routers/util');
const { connectToDb, closeConnection } = require('../db/connection');
const { WoWToken } = require('../db/wowTokenModel');

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
      const wowToken = new WoWToken({
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
