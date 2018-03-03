/* eslint-disable  import/prefer-default-export */

export const getMapRegEx = mapObj =>
  new RegExp(
    Object.keys(mapObj)
      .map(key => key.replace(/\[|\]/, match => `\\${match}`))
      .join('|'),
    'gi'
  );

export const stringReplace = (string, mapObj) =>
  string.replace(getMapRegEx(mapObj), matched => mapObj[matched]);
