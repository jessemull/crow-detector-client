// Proxy server with signed cookie for accessing https://www.dev.blockbusterindex.com at http://localhost:8080...

const urls = {
  production: 'https://www.crittercanteen.com',
  test: 'http://localhost:8080',
};

const throttling = {
  production: 'simulate',
  test: 'simulate'
}

module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
      },
    },
    collect: {
      numberOfRuns: 3,
      settings: {
        throttlingMethod: throttling[process.env.NODE_ENV] || 'devtools',
      },
      startServer: async () => {
        const execa = await import('execa');
        await execa('npm', ['run', 'dev'], { stdio: 'inherit' });
      },
      url: urls[process.env.NODE_ENV] || 'http://localhost:3000',
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
