// Proxy server with signed cookie for accessing https://www.dev.blockbusterindex.com at http://localhost:8080...

const urls = {
  production: 'https://www.crittercanteen.com',
  test: 'http://localhost:8080',
};

module.exports = {
  e2e: {
    baseUrl: urls[process.env.NODE_ENV] || 'http://localhost:3000',
    supportFile: false,
  },
};
