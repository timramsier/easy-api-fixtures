/* eslint-disable  import/prefer-default-export */

export const getMapRegEx = mapObj =>
  new RegExp(
    Object.keys(mapObj)
      .map(key => key.replace(/\[|\]|\?/, match => `\\${match}`))
      .join('|'),
    'gi'
  );

export const stringReplace = (string, mapObj) =>
  string.replace(getMapRegEx(mapObj), matched => mapObj[matched]);

/**
 * Returns the host, protocol, and path of a url
 * @param {String} url - the url to parse
 */
export const parseUrl = url => {
  const regEx = /.*:\/\/.*?(?=\/)|mock-api/gm;
  const base = url.match(regEx)[0];
  const host = base.split('://')[1];
  const protocol = base.split('://')[0];
  const path = url.split(regEx)[1];
  return { base, host, protocol, path };
};
