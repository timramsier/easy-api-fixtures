require('babel-polyfill');
require('babel-core/register');

const _path = require('path');
const axios = require('axios');
const sanitize = require('sanitize-filename');
const appRootDir = require('app-root-dir').get();
const _ = require('lodash');
const { flatMap } = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');

class easyApiFixtures {
  constructor(configPath = _path.join(appRootDir, 'fixtures.config.js')) {
    this.appRootDir = appRootDir;
    this.defaults = {
      output: {
        filename: '[name].json',
        uglified: false,
        versionInPath: true,
        endpointInPath: true,
        aliasInPath: true,
      },
    };
    this.config = this.parseConfig(this.constructor.loadFile(configPath));
  }

  static loadFile(path) {
    try {
      const file = require(path); //eslint-disable-line
      return file;
    } catch (err) {
      throw err;
    }
  }

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

  static async ensureDirectoryExistence(filePath) {
    if (!fs.existsSync(filePath)) {
      mkdirp.sync(filePath);
    }
  }

  parseConfig(config) {
    const newConfig = config;
    newConfig.output = Object.assign({}, this.defaults.output, config.output);
    const apiArray = flatMap([newConfig.api]);
    const apis = apiArray.map(api =>
      Object.assign({}, api, {
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

  getBasePath(api) {
    const { output } = this.config;
    return _path.join(
      this.appRootDir,
      output.path,
      output.aliasInPath ? _.get(api, 'alias', '') : '',
      output.versionInPath ? _.get(api, 'version', '') : ''
    );
  }

  getConfig() {
    return this.config;
  }

  getFileName(slug) {
    const name = this.config.output.filename.replace('[name]', slug);
    return name;
  }

  request(target) {
    const regEx = /.*:\/\/.*?(?=\/)|\[mock\]/gm;
    const base = target.match(regEx)[0];
    const endpoint = target.split(regEx)[1];
    const { endpointInPath } = this.config.output;
    const pathArray = endpoint.split('/').filter(a => a);
    const fixturePath = _path.join(
      this.getBasePath(
        this.config.api.filter(api => api.url.includes(base))[0]
      ),
      endpointInPath ? pathArray[0] : '',
      this.getFileName(pathArray[1])
    );
    return this.constructor.loadFile(fixturePath);
  }

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

  async writeFile({ fixturePath, slug, endpoint, data }) {
    await this.constructor.ensureDirectoryExistence(
      _path.join(fixturePath, endpoint)
    );
    const file = _path.join(fixturePath, endpoint, this.getFileName(slug));
    fs.writeFile(file, JSON.stringify(data, null, 2), err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('\x1b[32m', file, 'has been created', '\x1b[0m');
    });
  }

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
