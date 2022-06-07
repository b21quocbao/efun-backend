#!/bin/bash
cd /home/ubuntu/efun-be-v2
pm2 del main 2> /dev/null
APP_ENV=production pm2 start dist/main.js
pm2 del crawler 2> /dev/null
APP_ENV=production pm2 start "node dist/console.js crawl-all 999999999999" --name crawler