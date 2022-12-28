# WOW Token Tracker
This app uses the Battle.net OAuth flow to get World of Warcraft token prices and show the current and historical prices.

## Prerequisites
- Go to battle.net [developer portal](https://develop.battle.net/access/clients) to create a client first
- Prepare a mongodb service url
- Put above information in the `.env` file in server folder, like
  ```
  MONGODB_URI=<Your mongodb service url>
  BNET_ID=<Your battle.net client id>
  BNET_SECRET=<Your battle.net client secert>
  PORT=3002
  NODE_ENV=production
  ```
  also create a `.env.local` file at the same folder, the content is same as `.env`, but set `NODE_ENV=development`
- Node version >= 16

## Development
- run `yarn server-dev`, then server should be running on port 3002
- run `yarn client-dev`, client should be running on `localhost:3000`

## Production
- run `yarn client-prod` to build client
- run `yarn server-prod` to start server, the app should be running on `localhost:3002`

## Historical data
You can schedule a job to get the token prices, recommend hourly job. For details, refer to `scripts/getToken_task.sh`

## Demo
<a href="https://wow.utticus.com/" target="_blank">https://wow.utticus.com</a>
