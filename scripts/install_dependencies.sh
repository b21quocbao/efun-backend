#!/bin/bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt-get -y install nodejs
npm install -g yarn pm2
cd /home/ec2-user/efun-be-v2
yarn install
