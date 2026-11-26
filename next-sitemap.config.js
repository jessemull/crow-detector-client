module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.crittercanteen.com',
  generateRobotsTxt: true,

  // Static export deploys `out/`; write sitemap artifacts there directly.

  outDir: './out',
  exclude: ['/porch', '/feeder'],
};
