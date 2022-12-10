require('dotenv').config();
import express from 'express';
import { connectToDb } from './db/connection';
import rootRoute from './routers/root';
import oauthRoute from './routers/oauth';
import wowTokenRoute from './routers/wowtoken';

const app = express();

const PORT = process.env.PORT;

app.use('/', rootRoute);
app.use('/api/oauth2', oauthRoute);
app.use('/api/wowToken', wowTokenRoute);

app.use(express.static('../client/build'));

app.listen(PORT, () => {
  console.log(`Express server is running on localhost:${PORT}`);
  connectToDb(true);
});
