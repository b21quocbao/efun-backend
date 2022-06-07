#!/bin/bash
cd /home/ubuntu/efun-be-v2
pm2 del main 2> /dev/null
APP_ENV=production pm2 start dist/main.js