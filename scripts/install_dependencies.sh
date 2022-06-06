#!/bin/bash
curl --silent --location https://rpm.nodesource.com/setup_16.x | bash -
apt -y install nodejs
npm install -g yarn pm2
cd /home/ec2-user/efun-be-v2
yarn install
