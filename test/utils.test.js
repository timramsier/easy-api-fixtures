const { describe, it } = require('mocha');
const { expect } = require('chai');
const { stringReplace, getMapRegEx } = require('../src/utils');

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
});
