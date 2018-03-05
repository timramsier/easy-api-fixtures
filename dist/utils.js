'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* eslint-disable  import/prefer-default-export */

var getMapRegEx = exports.getMapRegEx = function getMapRegEx(mapObj) {
  return new RegExp(Object.keys(mapObj).map(function (key) {
    return key.replace(/\[|\]|\?/, function (match) {
      return '\\' + match;
    });
  }).join('|'), 'gi');
};

var stringReplace = exports.stringReplace = function stringReplace(string, mapObj) {
  return string.replace(getMapRegEx(mapObj), function (matched) {
    return mapObj[matched];
  });
};

/**
 * Returns the host, protocol, and path of a url
 * @param {String} url - the url to parse
 */
var parseUrl = exports.parseUrl = function parseUrl(url) {
  var regEx = /.*:\/\/.*?(?=\/)|mock-api/gm;
  var base = url.match(regEx)[0];
  var host = base.split('://')[1];
  var protocol = base.split('://')[0];
  var path = url.split(regEx)[1];
  return { base: base, host: host, protocol: protocol, path: path };
};