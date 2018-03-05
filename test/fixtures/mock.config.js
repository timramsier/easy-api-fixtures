module.exports = {
  output: {
    filename: '[name].json',
    path: 'test/fixtures/[version]/[endpoint]',
    aliasInPath: false,
  },
  api: [
    {
      url: 'mock-api',
      version: 'v1',
      alias: 'mock',
      fixture: [
        {
          endpoint: 'mock',
          slug: 'data',
        },
      ],
    },
    {
      url: 'mock-api',
      version: 'v1',
      alias: 'mock',
      path: 'test/fixtures/[api]/[endpoint]',
      fixture: [
        {
          endpoint: 'mock',
          slug: 'data',
        },
      ],
    },
    {
      url: 'mock-api',
      version: 'v1',
      alias: 'mock',
      path: 'test/fixtures/[api]/[version]/[endpoint]',
      fixture: [
        {
          endpoint: 'mock',
          slug: 'data',
        },
      ],
    },
  ],
};
