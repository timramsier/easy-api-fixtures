# easy-api-fixtures

This library uses a declaritbve methodolgy to make it easy to create data fixtures for your testing needs.  If you are like me, you strongly dislike having to keep your data fixtures up to date after changes are made to an upstream API dependency.  To make it easier to manage these changes, this packages uses allows you to include a `fixtures.config.js` to control your fixtures.

## Install
[npm: easy-api-fixtures](https://www.npmjs.com/package/easy-api-fixtures)

Install with  npm
```bash
npm install easy-api-fixtures --save-dev
```

Install with yarn
```bash
yarn add easy-api-fixtures --dev=yes
```
## Creating Fixtures
To use this library you just need to include a `fixtures.config.js` file in your projects root directory.  Once that is done you can create a script to run the binary:
```json
"scripts": {
  "fixtures": "createFixtures"
}
```
And then use one of the following commands in the CLI:

npm
```bash
npm run fixtures
```

yarn
```bash
yarn fixtures
```

## Request Fixture Data

Once the fixtures are created, you will need to use the library to easily retrieve the fixture data.  That is as easy as importing the library into your tests and using the `request()` function.
```javascript
const mockApi = require('easy-api-fixtures');

...
// url should be the real url that would be used to retrieve the data in production
const url = 'http://www.fake-api.com/post/1'
const data = mockApi.request(url)
...

// You can now use 'data' in your testing needs
```
## Basic Config Example
The following is a basic example of the bare minimum amount of configuration that needs to be in the `fixtures.config.js` file.  The following configuration will create `./test/fixtures/post/1.json` with the data that a `GET` request to `http://www.fake-api.com/post/1` would provide.

```javascript

module.exports = {
  output: {
    // make sure this is relative to your projects root directory
    path: 'test/fixtures'
  },
  api: {
    url: 'http://www.fake-api.com',
    fixture: {
      endpoint: 'post',
      slug: '1'
    }
  }
}
```

## Config Options
The following is a full example of a configuration file that this package can use.  Note that it identifies the type of information supported.

```javascript
module.exports = {
  output: {
    filename: String,
    path: String,
    endpointInPath: Boolean,
    versionInPath: Boolean,
    aliasInPath: Boolean,
  },
  // `api` can be either a single Object or an Array of them
  api: {
    url: String,
    version: String,
    alias: String,
    // `fixture` can be either a single Object or an Arrat of them
    fixture: [
      {
        endpoint: String | Array,
        slug: String | Array,
      }
    ],
  },
};

```

## Config Options

### output _Object_
#### filename _String_
##### Default: `[name].json`
This sets the pattern to be used when creating the fixture files.  `[name]` is replaced by the `slug` of the api request.
#### path _String_
##### Required
This is the path where the fixtures will be stored.
#### endpointInPath _Boolean_
##### Default: `true`
This determines whether the API endpoint should be included in the save path for fixtures and the retrieval path.
#### versionInPath _Boolean_
##### Default: `true`
This determines whether the API version should be included in the save path for fixtures and the retrieval path.
#### aliasInPath _Boolean_
##### Default: `true`
This determines whether the API alias (via config file) should be included in the save path for fixtures and the retrieval path.
### api _Object_ or _Array_
This is either a single or an array of apis that will be used to create fixtures.
#### url _String_
The base API URL to use when making requests to create the fixtures. (i.e. http://www.fake-api.com)
#### version _String_
The version of the API to make the requests against. (ex. v1, v2, beta )
#### alias _String_ or _Array_
##### Default: _A sanitized representation of the `url` property_
This is the name of the directory that will be used to save all fixture data for the API.  This defaults to a sanitized representation of the `url` used to make the request.  For example, http://www.fake-api.com will become **httpwwwfake-apicom**
#### fixture _Object_ or _Array_
This is either a single or an array of objects used to determine what requests to make to create the fixtures
##### endpoint _String_ or _Array_
This is either a single or an array of API endpoints to query to create the fixtures
##### slug _String_ or _Array_
This is either a single or an array of queries to make against the above endpoints.
