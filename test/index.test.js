/* eslint-disable no-unused-vars */
const { describe, it } = require('mocha');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const EasyApiFixtures = require('../src/index');
const { stringReplace } = require('../src/utils');

const runTests = (promiseLibName, configPath) => {
  describe(`The EasyApiFixtures class should work correctly - ${promiseLibName}`, () => {
    const easyApi = new EasyApiFixtures(configPath);
    const config = easyApi.constructor.loadFile(configPath);
    describe('Configuration file works correctly.', () => {
      it('loadFile should load the file with no error', done => {
        expect(config).to.be.a('object');
        done();
      });

      it('getConfig should return the configuration', done => {
        expect(easyApi.getConfig()).to.be.a('object');
        done();
      });
    });
    describe('getFileName should handle all cases properly', () => {
      it('should replace the filename correctly', done => {
        expect(easyApi.getFileName('light')).to.equal('light.json');
        done();
      });
      it('should replace ?, =, &, and spaces properly', done => {
        expect(easyApi.getFileName('light on?limit=10&offset=5')).to.equal(
          'light_on_where_limit_equals_10_and_offset_equals_5.json'
        );
        done();
      });
    });
    describe('parseConfig handles config correctly', () => {
      it('should transform api.*.fixture.*.slug to array if a string', done => {
        const unparsedSlug = config.api[0].fixture[0].slug;
        const { slug } = easyApi.parseConfig(config).api[0].fixture[0];
        expect(unparsedSlug).to.be.a('string');
        expect(slug).to.be.a('array');
        done();
      });

      it('should transform api.*.fixture.*.endpoint to array if a string', done => {
        const unparsedEndpoint = config.api[0].fixture[0].endpoint;
        const { endpoint } = easyApi.parseConfig(config).api[0].fixture[0];
        expect(unparsedEndpoint).to.be.a('string');
        expect(endpoint).to.be.a('array');
        done();
      });
    });

    describe('Fixture data retrieval should work correctly', () => {
      it(`request should return mock api data`, done => {
        const data = easyApi.request('mock-api/mock/data');
        expect(data).to.be.a('object');
        done();
      });
    });

    describe('getBasePath should return a valid path', () => {
      it('output.path = "test/fixtures/[api]/[version]/[endpoint]" - should return mock/v1/[endpoint]', done => {
        const basePath = easyApi.getBasePath(easyApi.config.api[2]);
        expect(basePath).to.equal(
          path.join(easyApi.appRootDir, 'test/fixtures/mock/v1/[endpoint]')
        );
        done();
      });
      it('output.path = "test/fixtures/[api]/[endpoint]" - should return mock/[endpoint]', done => {
        const basePath = easyApi.getBasePath(easyApi.config.api[1]);
        expect(basePath).to.equal(
          path.join(easyApi.appRootDir, 'test/fixtures/mock/[endpoint]')
        );
        done();
      });
      it('output.path = "test/fixtures/[version]/[endpoint]" - should return v1/[endpoint]', done => {
        const basePath = easyApi.getBasePath(easyApi.config.api[0]);
        expect(basePath).to.equal(
          path.join(easyApi.appRootDir, 'test/fixtures/v1/[endpoint]')
        );
        done();
      });
    });

    describe('File system interactions work correctly', () => {
      const basePath = './test/dir';
      const testPath = stringReplace(`${basePath}/[endpoint]`, {
        '[endpoint]': 'endpoint',
      });
      const filePath = path.join(testPath, 'slug.json');

      describe('ensureDirectoryExistence work correctly', () => {
        easyApi.ensureDirectoryExistence(testPath);
        it(`should correctly create ${filePath})}`, done => {
          expect(fs.existsSync(testPath)).to.equal(true);
          done();
        });
      });

      describe('writeFile works correctly', () => {
        easyApi.writeFile({
          fixturePath: testPath,
          slug: 'slug',
          endpoint: 'endpoint',
          data: { data: true },
        });
        it(`Should properly create ${filePath}`, done => {
          expect(fs.existsSync(filePath)).to.equal(true);
          done();
        });
      });

      describe('loadFile should properly load a file', () => {
        const file = path.join(
          easyApi.appRootDir,
          'test/fixtures/v1/mock/data.json'
        );
        it(`should load the test file ${file}`, done => {
          const testFile = easyApi.constructor.loadFile(file);
          expect(testFile.arrayOfNumbers.length).to.equal(3);
          done();
        });
      });

      // remove created directory
      setTimeout(() => rimraf(basePath, () => null), 1000);
    });

    describe('External API requests should work', () => {
      describe('getFixturesDataFromApi should work correctly', () => {
        easyApi
          .getFixturesDataFromApi(easyApi.config.api[0], async url => ({
            data: easyApi.request(url),
          }))
          .then(fixtureData => {
            it('should return an array of objects', done => {
              expect(fixtureData).to.be.a('array');
              done();
            });
            it('a returned object should have the correct properties', done => {
              expect(fixtureData[0]).to.have.property('slug');
              expect(fixtureData[0]).to.have.property('endpoint');
              expect(fixtureData[0]).to.have.property('data');
              done();
            });
          })
          .catch(err => console.log(err));
      });
    });
  });
};

const defaultConfigPath = path.join(__dirname, 'fixtures/mock.config.js');
runTests('Default (axios)', defaultConfigPath);
