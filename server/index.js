require('dotenv').config()
const express = require('express');
const { connectToDb } = require('./db/connection');
const oauthRoute = require('./routers/oauth');
const wowTokenRoute = require('./routers/wowtoken');

const app = express();

const PORT = process.env.PORT;

app.use(express.static('client/build'));
app.use('/wowtoken', express.static('client/build'));

app.use('/api/oauth2', oauthRoute);
app.use('/api/wowToken', wowTokenRoute);

app.listen(PORT, () => {
  console.log(`Express server is running on localhost:${PORT}`);
  connectToDb();
});