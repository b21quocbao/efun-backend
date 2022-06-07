#!/bin/bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt-get -y install nodejs
npm install -g yarn pm2
cd /home/ubuntu/efun-be-v2
yarn install
