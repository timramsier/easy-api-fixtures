require('babel-polyfill');

const _path = require('path');
const axios = require('axios');
const sanitize = require('sanitize-filename');
const _ = require('lodash');
const { flatMap } = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { stringReplace } = require('./utils');

// get root project directory
const appRootDir = _path.resolve('.').split('/node_modules')[0];
class easyApiFixtures {
  constructor(configPath = _path.join(appRootDir, 'fixtures.config.js')) {
    this.appRootDir = appRootDir;
    this.defaults = {
      output: {
        filename: '[name].json',
        uglified: false,
      },
    };
    this.config = this.parseConfig(this.constructor.loadFile(configPath));
  }

  /**
   * Loads file dynamicaly
   * @param {String} path - relative path to a file
   */
  static loadFile(path) {
    try {
      const file = require(path); //eslint-disable-line
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
  static async getFixturesDataFromApi(api, requestFn = axios.get) {
    const _getData = (url, endpoint, slug) =>
      requestFn(`${url}/${endpoint}/${slug}`)
        .then(result => ({
          slug,
          endpoint,
          data: result.data,
        }))
        .catch(err => console.log(err));
    const fixtures = await Promise.all(
      _.flatMap(api.fixture, fixture => {
        const { url } = api;
        return _.flatMap(fixture.endpoint, endpoint =>
          _.map(fixture.slug, slug => _getData(url, endpoint, slug))
        );
      })
    );
    return fixtures;
  }

  /**
   * Tests for directory's existence and creates it if it does not
   * @param {String} filePath - path to directory
   */
  static async ensureDirectoryExistence(filePath) {
    if (!fs.existsSync(filePath)) {
      mkdirp.sync(filePath);
    }
  }

  /**
   * Parses a config object to be used by the application
   * @param {Object} config - the configuration object
   */
  parseConfig(config) {
    const newConfig = config;
    newConfig.output = Object.assign({}, this.defaults.output, config.output);
    const apiArray = flatMap([newConfig.api]);
    const apis = apiArray.map(api =>
      Object.assign({}, api, {
        _pathMap: {
          '[api]': sanitize(_.get(api, 'alias', _.get(api, 'url', ''))),
          '[version]': _.get(api, 'version', ''),
        },
        alias: sanitize(api.alias || api.url),
        fixture: flatMap([api.fixture]).map(fixture =>
          Object.assign({}, fixture, {
            slug: flatMap([fixture.slug]),
            endpoint: flatMap([fixture.endpoint]),
          })
        ),
      })
    );
    return Object.assign({}, newConfig, { api: apis });
  }

  /**
   * Returns the base path based on the api provided
   * @param {Object} api - An object that holds information on an api from the config file
   */
  getBasePath(api) {
    const { path } = this.config.output;
    const pathToUse = api.path || path;

    return _path.join(this.appRootDir, stringReplace(pathToUse, api._pathMap));
  }

  /**
   * Returns the configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Returns the filename based on slug provided and configuration
   * @param {String} slug - the slug of the request
   */
  getFileName(slug) {
    const name = this.config.output.filename.replace('[name]', slug);
    return name;
  }

  /**
   * Returns data using a real URL and the config
   * @param {String} target - the real URL to mock
   */
  request(target) {
    const regEx = /.*:\/\/.*?(?=\/)|mock-api/gm;
    const base = target.match(regEx)[0];
    const endpoint = target.split(regEx)[1];
    const pathArray = endpoint.split('/').filter(a => a);
    const basePath = this.getBasePath(
      this.config.api.filter(api => api.url.includes(base))[0]
    );
    const path = stringReplace(basePath, { '[endpoint]': pathArray[0] });
    const fixturePath = _path.join(path, this.getFileName(pathArray[1]));
    return this.constructor.loadFile(fixturePath);
  }

  /**
   * Loads API data based on the configuration
   */
  async loadData() {
    this.fixtureData = await Promise.all(
      this.config.api.map(async api => {
        const fixturePath = this.getBasePath(api);
        return {
          fixturePath,
          fixtures: await this.constructor.getFixturesDataFromApi(api),
        };
      })
    );
  }

  /**
   * Writes a fixture to file based on the parameters
   * @param {Object} {fixturePath, slug, endpoint, data}
   */
  async writeFile({ fixturePath, slug, endpoint, data }) {
    const path = stringReplace(fixturePath, { '[endpoint]': endpoint });
    await this.constructor.ensureDirectoryExistence(path);
    const file = _path.join(path, this.getFileName(slug));
    fs.writeFile(file, JSON.stringify(data, null, 2), err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('\x1b[32m', file, 'has been created', '\x1b[0m');
    });
  }

  /**
   * Runs the application to create fixtures
   */
  async run() {
    await this.loadData();
    this.fixtureData.forEach(data => {
      const { fixturePath } = data;
      data.fixtures.forEach(fixture => {
        this.writeFile({ fixturePath, ...fixture });
      });
    });
  }
}

module.exports = easyApiFixtures;
