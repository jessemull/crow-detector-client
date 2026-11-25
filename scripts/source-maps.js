const { execFileSync } = require('child_process');
const path = require('path');

let envFile = '.env.local';

switch (process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT) {
  case 'production':
    envFile = '.env.production';
    break;
  case 'test':
    envFile = '.env.test';
    break;
  default:
    envFile = '.env.local';
    break;
}

require('dotenv').config({ path: envFile, quiet: true });

(() => {
  const env = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

  const { SENTRY_AUTH_TOKEN_SOURCE_MAPS, SENTRY_ORG, SENTRY_PROJECT } =
    process.env;

  if (!SENTRY_AUTH_TOKEN_SOURCE_MAPS || !SENTRY_ORG || !SENTRY_PROJECT) {
    const message =
      'Sentry upload skipped due to missing environment variables...';
    if (process.env.CI) {
      console.error(message);
      process.exit(1);
    }
    console.warn(message);
    return;
  }

  const release = process.env.NEXT_PUBLIC_SENTRY_RELEASE;
  if (!release || release.startsWith('undefined-')) {
    console.error('NEXT_PUBLIC_SENTRY_RELEASE is required');
    process.exit(1);
  }

  console.log(
    `Uploading source maps for release ${release} in ${env} environment...`
  );

  const cliEnv = {
    ...process.env,
    SENTRY_AUTH_TOKEN: SENTRY_AUTH_TOKEN_SOURCE_MAPS,
  };

  const runSentryCli = (args) => {
    execFileSync(path.join('node_modules', '.bin', 'sentry-cli'), args, {
      stdio: 'inherit',
      env: cliEnv,
    });
  };

  try {
    runSentryCli([
      'releases',
      '--org',
      SENTRY_ORG,
      '--project',
      SENTRY_PROJECT,
      'new',
      release,
    ]);
    runSentryCli([
      'releases',
      '--org',
      SENTRY_ORG,
      '--project',
      SENTRY_PROJECT,
      'files',
      release,
      'upload-sourcemaps',
      '.next',
      '--url-prefix',
      '~/_next',
      '--validate',
      '--ignore-file',
      '.sentryignore',
    ]);
    runSentryCli([
      'releases',
      '--org',
      SENTRY_ORG,
      '--project',
      SENTRY_PROJECT,
      'finalize',
      release,
    ]);
    runSentryCli([
      'releases',
      '--org',
      SENTRY_ORG,
      '--project',
      SENTRY_PROJECT,
      'deploys',
      release,
      'new',
      '--env',
      env,
    ]);

    console.log('Sentry source maps uploaded.');
  } catch (err) {
    console.error('Sentry source map upload failed: ', err.message);
    process.exit(1);
  }
})();
