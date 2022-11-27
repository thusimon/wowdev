#!/bin/sh

# crontab -e
# run every hour 00
# 0 * * * *  <absolute path>/wowdev/scripts/getTokens_task.sh
cd ~/wowdev
BNET_ID=<BNET_ID> BNET_SECRET=<BNET_SECRET> MONGODB_URI="<MONGODB_URI>" node server/build/job/getToken>>~/wowdev/logs/log-$(date +"%m-%d-%Y").log 2>&1
