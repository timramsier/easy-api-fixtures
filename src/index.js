require('babel-polyfill');

const clc = require('cli-color');
const _path = require('path');
const axios = require('axios');
const sanitize = require('sanitize-filename');
const _ = require('lodash');
const { flatMap } = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { stringReplace, parseUrl } = require('./utils');

// get root project directory
const appRootDir = _path.resolve('.').split('/node_modules')[0];

class easyApiFixtures {
  constructor(configPath, feedback = false) {
    this.requests = [];
    this.emittedFiles = [];
    this.configPath =
      configPath || _path.join(appRootDir, 'fixtures.config.js');
    this.appRootDir = appRootDir;
    this.feedback = feedback;
    this.defaults = {
      requestFunction: axios.get,
      output: {
        filename: '[name].json',
        uglified: false,
      },
    };
    try {
      if (this.feedback) console.log(`\nLoading config: ${this.configPath}`);
      this.config = this.parseConfig(
        this.constructor.loadFile(this.configPath)
      );
      if (this.feedback)
        console.log(clc.green('\nSuccessfully loaded configuration.'));
    } catch (err) {
      throw err;
    }
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
  async getFixturesDataFromApi(api, requestFn = this.config.requestFunction) {
    const _getData = (url, endpoint, slug) => {
      try {
        return requestFn(`${url}/${endpoint}/${slug}`)
          .then(result => {
            if (this.feedback)
              console.log(
                clc.green('\t[success] '),
                `${url}/${endpoint}/${slug}`
              );
            this.requests.push(`${url}/${endpoint}/${slug}`);
            return { slug, endpoint, data: result.data };
          })
          .catch(
            () =>
              this.feedback &&
              console.log(clc.red('\t[failed] '), `${url}/${endpoint}/${slug}`)
          );
      } catch (err) {
        console.log(clc.red(err));
      }
    };

    const fixtures = await Promise.all(
      _.flatMap(api.fixture, fixture => {
        const { url } = api;
        return _.flatMap(fixture.endpoint, endpoint =>
          _.map(fixture.slug, slug => _getData(url, endpoint, slug))
        );
      })
    ).catch(err => console.log(clc.red(err)));
    return fixtures;
  }

  /**
   * Tests for directory's existence and creates it if it does not
   * @param {String} filePath - path to directory
   */
  async ensureDirectoryExistence(filePath) {
    if (!fs.existsSync(filePath)) {
      if (this.feedback)
        console.log(clc.yellow(`${filePath} did not exist...creating it.`));
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
    newConfig.requestFunction = _.get(config, 'requestFunction', axios.get);
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
    const replaceObj = {
      '?': '_where_',
      '=': '_equals_',
      '&': '_and_',
      ' ': '_',
    };
    const parsedSlug = stringReplace(slug, replaceObj);
    const name = this.config.output.filename.replace('[name]', parsedSlug);
    return name;
  }

  /**
   * Returns data using a real URL and the config
   * @param {String} target - the real URL to mock
   */
  request(target) {
    const { path, base } = parseUrl(target);
    console.log(base);
    const [endpoint, filename] = path.split('/').filter(a => a);
    console.log({ endpoint, filename });
    const basePath = this.getBasePath(
      this.config.api.filter(api => api.url.includes(base))[0]
    );
    const updatedPath = stringReplace(basePath, { '[endpoint]': endpoint });
    const fixturePath = _path.join(updatedPath, this.getFileName(filename));
    return this.constructor.loadFile(fixturePath);
  }

  /**
   * Loads API data based on the configuration
   */
  async loadData() {
    this.fixtureData = await Promise.all(
      this.config.api.map(async api => {
        const fixturePath = this.getBasePath(api);
        try {
          return {
            fixturePath,
            fixtures: await this.getFixturesDataFromApi(api),
          };
        } catch (err) {
          throw err;
        }
      })
    );
  }

  /**
   * Writes a fixture to file based on the parameters
   * @param {Object} {fixturePath, slug, endpoint, data}
   */
  async writeFile({ fixturePath, slug, endpoint, data }) {
    if (data && slug && endpoint && fixturePath) {
      const path = stringReplace(fixturePath, { '[endpoint]': endpoint });
      await this.ensureDirectoryExistence(path);
      const filename = this.getFileName(slug);
      const file = _path.join(path, filename);
      await fs.writeFile(file, JSON.stringify(data, null, 2), async err => {
        if (err) {
          console.error(clc.red('\t[failed] '), filename);
          return;
        }
        await this.emittedFiles.push(filename);
        console.log(clc.green('\t[success] '), filename);
      });
    }
  }

  /**
   * Runs the application to create fixtures
   */
  async run() {
    if (this.feedback)
      console.log(
        '\nRetrieving data from APIs...',
        clc.bgWhite.black('\n\n\t STATUS        REQUEST        ')
      );
    try {
      await this.loadData();
    } catch (err) {
      throw err;
    }
    if (this.feedback)
      console.log(
        '\nWriting API data to files...',
        clc.bgWhite.black('\n\n\t STATUS        OUTPUT        ')
      );
    await this.fixtureData.forEach(async data => {
      const { fixturePath } = data;
      await data.fixtures.forEach(async fixture => {
        await this.writeFile({ fixturePath, ...fixture });
      });
    });
  }
}

module.exports = easyApiFixtures;
