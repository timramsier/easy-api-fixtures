const { describe, it } = require('mocha');
const { expect } = require('chai');
const { stringReplace, getMapRegEx, parseUrl } = require('../src/utils');

describe('The utility functions work correctly', () => {
  const mapObj = {
    '[version]': 'v1',
    '[api]': 'test',
    '[endpoint]': 'data',
  };

  describe('getMapRegEx returns the right regex', () => {
    const regExTest = '/\\[version]|\\[api]|\\[endpoint]/gi';
    const regEx = `${getMapRegEx(mapObj)}`;
    it(`Should return ${regExTest}`, done => {
      expect(regEx).to.equal(regExTest);
      done();
    });
  });
  describe('stringReplace returns the correct values', () => {
    const inputPath = '/[api]/[version]/[endpoint]';
    const expectedPath = '/test/v1/data';
    const outputPath = stringReplace(inputPath, mapObj);
    it(`Should return ${expectedPath}`, done => {
      expect(outputPath).to.equal(expectedPath);
      done();
    });
  });
  describe('parseUrl should properly parse a url', () => {
    const url = 'http://www.domain.com/api/v1/pug';
    const complexUrl = 'https://www.domain.com/api/v1/pug?breed=dog';
    const urlObj = parseUrl(url);
    const complexObj = parseUrl(complexUrl);
    console.log(urlObj);
    it('should return an object with the correct properties', done => {
      expect(urlObj).to.be.a('object');
      expect(urlObj).to.have.property('host');
      expect(urlObj).to.have.property('protocol');
      expect(urlObj).to.have.property('path');
      expect(urlObj).to.have.property('base');
      done();
    });
    it(`should return the correct values for ${url}`, done => {
      expect(urlObj.host).to.equal('www.domain.com');
      expect(urlObj.protocol).to.equal('http');
      expect(urlObj.path).to.equal('/api/v1/pug');
      expect(urlObj.base).to.equal('http://www.domain.com');
      done();
    });
    it(`should return the correct values for ${complexUrl}`, done => {
      expect(complexObj.host).to.equal('www.domain.com');
      expect(complexObj.protocol).to.equal('https');
      expect(complexObj.path).to.equal('/api/v1/pug?breed=dog');
      expect(complexObj.base).to.equal('https://www.domain.com');
      done();
    });
  });
});
