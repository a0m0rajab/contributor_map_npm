#!/usr/bin/env node
const {drawMapWrapper} = require('./index.js');
const {setEnv} = require('./utils.js');
require('dotenv').config()

try {
  if (process.argv[2] == 'set') {
    return setEnv(process.argv[3]);
  }
  if (!process.argv[3] && !process.env.GitHubToken) {
    throw new Error("GitHub Token not found,\nplease set it as second param,\nYou can obtain your token from this link: https://github.com/settings/tokens");
  }
  drawMapWrapper(process.argv[2], process.argv[3]);
} catch (error) {
  debugger;
  console.log(error.message);
};