#!/usr/bin/env node
const {drawMapWrapper} = require('./index.js')
debugger;

try {
  if (!process.argv[3]) {
    throw new Error("GitHub Token not found,\nplease set it as second param,\nYou can obtain your token from this link: https://github.com/settings/tokens");
  }
  drawMapWrapper(process.argv[2], process.argv[3]);
} catch (error) {
  debugger;
  console.log(error.message);
};