'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* eslint-disable  import/prefer-default-export */

var getMapRegEx = exports.getMapRegEx = function getMapRegEx(mapObj) {
  return new RegExp(Object.keys(mapObj).map(function (key) {
    return key.replace(/\[|\]/, function (match) {
      return '\\' + match;
    });
  }).join('|'), 'gi');
};

var stringReplace = exports.stringReplace = function stringReplace(string, mapObj) {
  return string.replace(getMapRegEx(mapObj), function (matched) {
    return mapObj[matched];
  });
};