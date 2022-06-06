#!/bin/bash
cd /home/ec2-user/efun-be-v2
pm2 del main 2> /dev/null
APP_ENV=production pm2 start dist/main.js