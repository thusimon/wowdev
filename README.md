# WOW Token Tracker
This app uses the Battle.net OAuth flow to get token prices and show the current and historical prices.

## Prerequisites
- Go to battle.net [developer portal](https://develop.battle.net/access/clients) to create a client first
- Prepare a mongodb service url
- Put above information in the `.env` file in root folder, like
  ```
  MONGODB_URI=<Your mongodb service url>
  BNET_ID=<Your battle.net client id>
  BNET_SECRET=<Your battle.net client secert>
  PORT=3010
  ```
- Node version >= 16

## Development
run `yarn dev`, then server should be running on port 3010, and client should be running on `localhost:3000`

## Production
run `yarn build` to build client

run `yarn start-prod` to start server, the app should be running on `localhost:3010`

## Historical data
You can schedule a job to get the token prices, recommend hourly job. For details, refer to `scripts/getToken_task.sh`

## Demo
