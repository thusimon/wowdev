import { getAccessTokenCredFlow, getAllTokens } from '../routers/util';
import { connectToDb, closeConnection } from '../db/connection';
import WoWToken from '../db/wowTokenModel';

const getTokenJob = async () => {
  console.log(new Date());
  const accessTokenResp = await getAccessTokenCredFlow();
  if (accessTokenResp.err) {
    console.log(`falied to get access token, err: ${accessTokenResp.err}`)
    return;
  }
  const accessToken = accessTokenResp.access_token;
  getAllTokens(accessToken)
  .then(prices => {
    return connectToDb(false)
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
  })
  .catch(e => {
    console.log(e);
  });
}

getTokenJob();
