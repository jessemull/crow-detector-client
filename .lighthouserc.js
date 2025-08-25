// Proxy server with signed cookie for accessing https://www.dev.blockbusterindex.com at http://localhost:8080...

const urls = {
  production: 'https://www.crittercanteen.com',
  test: 'http://localhost:8080',
};

const assertions = {
  production: {
    'categories:performance': ['error', { minScore: 0.8 }],
    'categories:accessibility': ['error', { minScore: 0.9 }],
    'categories:seo': ['error', { minScore: 0.9 }],
    'categories:best-practices': ['error', { minScore: 0.9 }],
  },
  test: {
    'categories:performance': ['warn', { minScore: 0.6 }],
    'categories:accessibility': ['error', { minScore: 0.9 }],
    'categories:seo': ['error', { minScore: 0.9 }],
    'categories:best-practices': ['error', { minScore: 0.9 }],
  }
};

const settings = {
  production: {
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    }
  },
  test: {
    throttlingMethod: 'devtools',
    throttling: {
      rttMs: 100,
      throughputKbps: 5120,
      cpuSlowdownMultiplier: 1,
    }
  }
};

module.exports = {
  ci: {
    assert: {
      assertions: assertions[process.env.NODE_ENV] || assertions.test,
    },
    collect: {
      numberOfRuns: 3,
      settings: settings[process.env.NODE_ENV] || settings.test,
      startServer: async () => {
        if (process.env.NODE_ENV === 'test') {
          const execa = await import('execa');
          await execa('npm', ['run', 'proxy'], { stdio: 'inherit' });
        } else {
          const execa = await import('execa');
          await execa('npm', ['run', 'dev'], { stdio: 'inherit' });
        }
      },
      url: urls[process.env.NODE_ENV] || 'http://localhost:3000',
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
