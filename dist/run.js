#! /usr/bin/env node
'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var clc = require('cli-color');
var packageJSON = require('../package.json');
var EasyApiFixtures = require('./index');

var easyApiFixtures = new EasyApiFixtures(null, true);

var run = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log(clc.black.bgBlue('\n    EASY-API-FIXTURES ' + packageJSON.version + '    '));

            easyApiFixtures.run();

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function run() {
    return _ref.apply(this, arguments);
  };
}();

run();