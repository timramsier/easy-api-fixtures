module.exports = {
  output: {
    filename: '[name].json',
    path: 'test/fixtures',
    aliasInPath: false,
  },
  api: {
    url: '[mock]',
    version: 'v1',
    alias: 'mock',
    fixture: [
      {
        endpoint: 'mock',
        slug: 'data',
      },
    ],
  },
};
