#! /usr/bin/env node
const clc = require('cli-color');
const packageJSON = require('../package.json');
const EasyApiFixtures = require('./index');

const easyApiFixtures = new EasyApiFixtures(null, true);

const run = async () => {
  console.log(
    clc.black.bgBlue(`\n    EASY-API-FIXTURES ${packageJSON.version}    `)
  );

  easyApiFixtures.run();
};

run();
