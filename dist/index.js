'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('babel-polyfill');

var clc = require('cli-color');
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
  function easyApiFixtures(configPath) {
    var feedback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, easyApiFixtures);

    this.requests = [];
    this.emittedFiles = [];
    this.configPath = configPath || _path.join(appRootDir, 'fixtures.config.js');
    this.appRootDir = appRootDir;
    this.feedback = feedback;
    this.defaults = {
      output: {
        filename: '[name].json',
        uglified: false
      }
    };
    try {
      console.log('\nLoading config: ' + this.configPath);
      this.config = this.parseConfig(this.constructor.loadFile(this.configPath));
      console.log(clc.green('\nSuccessfully loaded configuration.'));
    } catch (err) {
      throw err;
    }
  }

  /**
   * Loads file dynamicaly
   * @param {String} path - relative path to a file
   */


  _createClass(easyApiFixtures, [{
    key: 'getFixturesDataFromApi',


    /**
     * Retrieves information from an external API
     * @param {Object} api - An object that holds information on an api from the config file
     * @param {Function} requestFn - (default axios) the promise based http request function
     */
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(api) {
        var _this = this;

        var requestFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : axios.get;

        var _getData, fixtures;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _getData = function _getData(url, endpoint, slug) {
                  return requestFn(url + '/' + endpoint + '/' + slug).then(function (result) {
                    if (_this.feedback) console.log(clc.green('\t[success] '), url + '/' + endpoint + '/' + slug);
                    _this.requests.push(url + '/' + endpoint + '/' + slug);
                    return { slug: slug, endpoint: endpoint, data: result.data };
                  }).catch(function () {
                    return console.log(clc.green('\t[failed] '), url + '/' + endpoint + '/' + slug);
                  });
                };

                _context.next = 3;
                return Promise.all(_.flatMap(api.fixture, function (fixture) {
                  var url = api.url;

                  return _.flatMap(fixture.endpoint, function (endpoint) {
                    return _.map(fixture.slug, function (slug) {
                      return _getData(url, endpoint, slug);
                    });
                  });
                })).catch(function (err) {
                  return console.log(clc.red(err));
                });

              case 3:
                fixtures = _context.sent;
                return _context.abrupt('return', fixtures);

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getFixturesDataFromApi(_x2) {
        return _ref.apply(this, arguments);
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
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(filePath) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!fs.existsSync(filePath)) {
                  if (this.feedback) console.log(clc.yellow(filePath + ' did not exist...creating it.'));
                  mkdirp.sync(filePath);
                }

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function ensureDirectoryExistence(_x4) {
        return _ref2.apply(this, arguments);
      }

      return ensureDirectoryExistence;
    }()

    /**
     * Parses a config object to be used by the application
     * @param {Object} config - the configuration object
     */

  }, {
    key: 'parseConfig',
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
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return Promise.all(this.config.api.map(function () {
                  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(api) {
                    var fixturePath;
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            fixturePath = _this2.getBasePath(api);
                            _context3.t0 = fixturePath;
                            _context3.next = 4;
                            return _this2.getFixturesDataFromApi(api);

                          case 4:
                            _context3.t1 = _context3.sent;
                            return _context3.abrupt('return', {
                              fixturePath: _context3.t0,
                              fixtures: _context3.t1
                            });

                          case 6:
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee3, _this2);
                  }));

                  return function (_x5) {
                    return _ref4.apply(this, arguments);
                  };
                }()));

              case 2:
                this.fixtureData = _context4.sent;

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function loadData() {
        return _ref3.apply(this, arguments);
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
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(_ref6) {
        var _this3 = this;

        var fixturePath = _ref6.fixturePath,
            slug = _ref6.slug,
            endpoint = _ref6.endpoint,
            data = _ref6.data;
        var path, filename, file;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                path = stringReplace(fixturePath, { '[endpoint]': endpoint });
                _context6.next = 3;
                return this.ensureDirectoryExistence(path);

              case 3:
                filename = this.getFileName(slug);
                file = _path.join(path, filename);
                _context6.next = 7;
                return fs.writeFile(file, JSON.stringify(data, null, 2), function () {
                  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(err) {
                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            if (!err) {
                              _context5.next = 3;
                              break;
                            }

                            console.error(clc.red('\t[failed] '), filename);
                            return _context5.abrupt('return');

                          case 3:
                            _context5.next = 5;
                            return _this3.emittedFiles.push(filename);

                          case 5:
                            console.log(clc.green('\t[success] '), filename);

                          case 6:
                          case 'end':
                            return _context5.stop();
                        }
                      }
                    }, _callee5, _this3);
                  }));

                  return function (_x7) {
                    return _ref7.apply(this, arguments);
                  };
                }());

              case 7:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function writeFile(_x6) {
        return _ref5.apply(this, arguments);
      }

      return writeFile;
    }()

    /**
     * Runs the application to create fixtures
     */

  }, {
    key: 'run',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var _this4 = this;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                console.log('\nRetrieving data from APIs...', clc.bgWhite.black('\n\n\t STATUS        REQUEST        '));
                _context9.prev = 1;
                _context9.next = 4;
                return this.loadData();

              case 4:
                _context9.next = 9;
                break;

              case 6:
                _context9.prev = 6;
                _context9.t0 = _context9['catch'](1);
                throw _context9.t0;

              case 9:
                if (this.feedback) console.log('\nWriting API data to files...', clc.bgWhite.black('\n\n\t STATUS        OUTPUT        '));
                _context9.next = 12;
                return this.fixtureData.forEach(function () {
                  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(data) {
                    var fixturePath;
                    return regeneratorRuntime.wrap(function _callee8$(_context8) {
                      while (1) {
                        switch (_context8.prev = _context8.next) {
                          case 0:
                            fixturePath = data.fixturePath;
                            _context8.next = 3;
                            return data.fixtures.forEach(function () {
                              var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(fixture) {
                                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                                  while (1) {
                                    switch (_context7.prev = _context7.next) {
                                      case 0:
                                        _context7.next = 2;
                                        return _this4.writeFile(_extends({ fixturePath: fixturePath }, fixture));

                                      case 2:
                                      case 'end':
                                        return _context7.stop();
                                    }
                                  }
                                }, _callee7, _this4);
                              }));

                              return function (_x9) {
                                return _ref10.apply(this, arguments);
                              };
                            }());

                          case 3:
                          case 'end':
                            return _context8.stop();
                        }
                      }
                    }, _callee8, _this4);
                  }));

                  return function (_x8) {
                    return _ref9.apply(this, arguments);
                  };
                }());

              case 12:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this, [[1, 6]]);
      }));

      function run() {
        return _ref8.apply(this, arguments);
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
  }]);

  return easyApiFixtures;
}();

module.exports = easyApiFixtures;