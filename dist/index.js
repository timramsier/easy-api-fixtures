'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('babel-polyfill');

var _path = require('path');
var axios = require('axios');
var sanitize = require('sanitize-filename');
var _ = require('lodash');

var _require = require('lodash'),
    flatMap = _require.flatMap;

var fs = require('fs');
var mkdirp = require('mkdirp');

var _require2 = require('./utils'),
    stringReplace = _require2.stringReplace;

// get root project directory


var appRootDir = _path.resolve('.').split('/node_modules')[0];

var easyApiFixtures = function () {
  function easyApiFixtures() {
    var configPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _path.join(appRootDir, 'fixtures.config.js');

    _classCallCheck(this, easyApiFixtures);

    this.appRootDir = appRootDir;
    this.defaults = {
      output: {
        filename: '[name].json',
        uglified: false
      }
    };
    this.config = this.parseConfig(this.constructor.loadFile(configPath));
  }

  /**
   * Loads file dynamicaly
   * @param {String} path - relative path to a file
   */


  _createClass(easyApiFixtures, [{
    key: 'parseConfig',


    /**
     * Parses a config object to be used by the application
     * @param {Object} config - the configuration object
     */
    value: function parseConfig(config) {
      var newConfig = config;
      newConfig.output = Object.assign({}, this.defaults.output, config.output);
      var apiArray = flatMap([newConfig.api]);
      var apis = apiArray.map(function (api) {
        return Object.assign({}, api, {
          _pathMap: {
            '[api]': sanitize(_.get(api, 'alias', _.get(api, 'url', ''))),
            '[version]': _.get(api, 'version', '')
          },
          alias: sanitize(api.alias || api.url),
          fixture: flatMap([api.fixture]).map(function (fixture) {
            return Object.assign({}, fixture, {
              slug: flatMap([fixture.slug]),
              endpoint: flatMap([fixture.endpoint])
            });
          })
        });
      });
      return Object.assign({}, newConfig, { api: apis });
    }

    /**
     * Returns the base path based on the api provided
     * @param {Object} api - An object that holds information on an api from the config file
     */

  }, {
    key: 'getBasePath',
    value: function getBasePath(api) {
      var path = this.config.output.path;

      var pathToUse = api.path || path;

      return _path.join(this.appRootDir, stringReplace(pathToUse, api._pathMap));
    }

    /**
     * Returns the configuration
     */

  }, {
    key: 'getConfig',
    value: function getConfig() {
      return this.config;
    }

    /**
     * Returns the filename based on slug provided and configuration
     * @param {String} slug - the slug of the request
     */

  }, {
    key: 'getFileName',
    value: function getFileName(slug) {
      var replaceObj = {
        '?': '_where_',
        '=': '_equals_',
        '&': '_and_',
        ' ': '_'
      };
      var parsedSlug = stringReplace(slug, replaceObj);
      var name = this.config.output.filename.replace('[name]', parsedSlug);
      return name;
    }

    /**
     * Returns data using a real URL and the config
     * @param {String} target - the real URL to mock
     */

  }, {
    key: 'request',
    value: function request(target) {
      var regEx = /.*:\/\/.*?(?=\/)|mock-api/gm;
      var base = target.match(regEx)[0];
      var endpoint = target.split(regEx)[1];
      var pathArray = endpoint.split('/').filter(function (a) {
        return a;
      });
      var basePath = this.getBasePath(this.config.api.filter(function (api) {
        return api.url.includes(base);
      })[0]);
      var path = stringReplace(basePath, { '[endpoint]': pathArray[0] });
      var fixturePath = _path.join(path, this.getFileName(pathArray[1]));
      return this.constructor.loadFile(fixturePath);
    }

    /**
     * Loads API data based on the configuration
     */

  }, {
    key: 'loadData',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return Promise.all(this.config.api.map(function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(api) {
                    var fixturePath;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            fixturePath = _this.getBasePath(api);
                            _context.t0 = fixturePath;
                            _context.next = 4;
                            return _this.constructor.getFixturesDataFromApi(api);

                          case 4:
                            _context.t1 = _context.sent;
                            return _context.abrupt('return', {
                              fixturePath: _context.t0,
                              fixtures: _context.t1
                            });

                          case 6:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, _this);
                  }));

                  return function (_x2) {
                    return _ref2.apply(this, arguments);
                  };
                }()));

              case 2:
                this.fixtureData = _context2.sent;

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function loadData() {
        return _ref.apply(this, arguments);
      }

      return loadData;
    }()

    /**
     * Writes a fixture to file based on the parameters
     * @param {Object} {fixturePath, slug, endpoint, data}
     */

  }, {
    key: 'writeFile',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref4) {
        var fixturePath = _ref4.fixturePath,
            slug = _ref4.slug,
            endpoint = _ref4.endpoint,
            data = _ref4.data;
        var path, file;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                path = stringReplace(fixturePath, { '[endpoint]': endpoint });
                _context3.next = 3;
                return this.constructor.ensureDirectoryExistence(path);

              case 3:
                file = _path.join(path, this.getFileName(slug));

                fs.writeFile(file, JSON.stringify(data, null, 2), function (err) {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  console.log('\x1b[32m', file, 'has been created', '\x1b[0m');
                });

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function writeFile(_x3) {
        return _ref3.apply(this, arguments);
      }

      return writeFile;
    }()

    /**
     * Runs the application to create fixtures
     */

  }, {
    key: 'run',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.loadData();

              case 2:
                this.fixtureData.forEach(function (data) {
                  var fixturePath = data.fixturePath;

                  data.fixtures.forEach(function (fixture) {
                    _this2.writeFile(_extends({ fixturePath: fixturePath }, fixture));
                  });
                });

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function run() {
        return _ref5.apply(this, arguments);
      }

      return run;
    }()
  }], [{
    key: 'loadFile',
    value: function loadFile(path) {
      try {
        var file = require(path); //eslint-disable-line
        return file;
      } catch (err) {
        throw err;
      }
    }

    /**
     * Retrieves information from an external API
     * @param {Object} api - An object that holds information on an api from the config file
     * @param {Function} requestFn - (default axios) the promise based http request function
     */

  }, {
    key: 'getFixturesDataFromApi',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(api) {
        var requestFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : axios.get;

        var _getData, fixtures;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _getData = function _getData(url, endpoint, slug) {
                  return requestFn(url + '/' + endpoint + '/' + slug).then(function (result) {
                    return {
                      slug: slug,
                      endpoint: endpoint,
                      data: result.data
                    };
                  }).catch(function (err) {
                    return console.log(err);
                  });
                };

                _context5.next = 3;
                return Promise.all(_.flatMap(api.fixture, function (fixture) {
                  var url = api.url;

                  return _.flatMap(fixture.endpoint, function (endpoint) {
                    return _.map(fixture.slug, function (slug) {
                      return _getData(url, endpoint, slug);
                    });
                  });
                }));

              case 3:
                fixtures = _context5.sent;
                return _context5.abrupt('return', fixtures);

              case 5:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getFixturesDataFromApi(_x4) {
        return _ref6.apply(this, arguments);
      }

      return getFixturesDataFromApi;
    }()

    /**
     * Tests for directory's existence and creates it if it does not
     * @param {String} filePath - path to directory
     */

  }, {
    key: 'ensureDirectoryExistence',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(filePath) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!fs.existsSync(filePath)) {
                  mkdirp.sync(filePath);
                }

              case 1:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function ensureDirectoryExistence(_x6) {
        return _ref7.apply(this, arguments);
      }

      return ensureDirectoryExistence;
    }()
  }]);

  return easyApiFixtures;
}();

module.exports = easyApiFixtures;