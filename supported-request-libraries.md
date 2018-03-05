# Promise based HTTP request libraries

This package supports promise based HTTP request libraries that support 
a `.then` after the request is made.  Libraries that require only the 
url to be provided when making a request are the easiest to use.  Otherwise
it may require adding a wrapper such as **promise-request** has below.

It is possible that a future release will switch to a plugin system to make
easier to integrate request libraries.

## The following libraries have been tested for use:

### "axios": "^0.17.1"

`axios.get` is the default method used

### "promise-request": "^0.1.2"

Requires some reshaping of the request as follows:
```javascript
const request = require('promise-request');

// taken from the utils.js script
const parseUrl = url => {
  const regEx = /.*:\/\/.*?(?=\/)|mock-api/gm;
  const base = url.match(regEx)[0];
  const host = base.split('://')[1];
  const protocol = base.split('://')[0];
  const path = url.split(regEx)[1];
  return { base, host, protocol, path };
};

// Config below
...
  requestFunction: url => {
    const { protocol, host, path } = parseUrl(url);
    return request({
      scheme: protocol,
      host,
      path,
      method: 'GET',
    });
  },
...
```

### "request-promise": "^4.2.2"

Easy to use this one.  Just import it and set it as the requestFunction

```javascript
const rp = require('request-promise');

// Config below
...
  requestFunction: rp,
...
```
