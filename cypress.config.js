// Cypress baseUrl by NODE_ENV: production site, local proxy (:8080), or Next dev (:3000).

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
