const { execSync } = require('child_process');

let path = '.env.local';

switch (process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT) {
  case 'production':
    path = '.env.production';
    break;
  case 'test':
    path = '.env.test';
    break;
  default:
    path = '.env.local';
    break;
}

require('dotenv').config({ path, quiet: true });

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

  const commitHash = execSync('git rev-parse HEAD').toString().trim();
  const release =
    process.env.NEXT_PUBLIC_SENTRY_RELEASE || `${env}-${commitHash}`;

  console.log(
    `Uploading source maps for release ${release} in ${env} environment...`
  );

  const cliEnv = {
    ...process.env,
    SENTRY_AUTH_TOKEN: SENTRY_AUTH_TOKEN_SOURCE_MAPS,
  };

  try {
    execSync(
      `npx sentry-cli releases --org ${SENTRY_ORG} --project ${SENTRY_PROJECT} new ${release}`,
      { stdio: 'inherit', env: cliEnv }
    );
    execSync(
      `npx sentry-cli releases --org ${SENTRY_ORG} --project ${SENTRY_PROJECT} files ${release} upload-sourcemaps .next --url-prefix "~/_next" --validate --ignore-file .sentryignore`,
      { stdio: 'inherit', env: cliEnv }
    );
    execSync(
      `npx sentry-cli releases --org ${SENTRY_ORG} --project ${SENTRY_PROJECT} finalize ${release}`,
      { stdio: 'inherit', env: cliEnv }
    );
    execSync(
      `npx sentry-cli releases --org ${SENTRY_ORG} --project ${SENTRY_PROJECT} deploys ${release} new --env ${env}`,
      { stdio: 'inherit', env: cliEnv }
    );

    console.log('Sentry source maps uploaded.');
  } catch (err) {
    console.error('Sentry source map upload failed: ', err.message);
    process.exit(1);
  }
})();
