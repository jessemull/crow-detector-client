/**
 * Optional SSH helper. The CloudFormation stack does not create a bastion.
 * Set SSH_HOST, SSH_USER, and SSH_PRIVATE_KEY_PATH only if an operator still
 * has a host to reach. npm run bastion is the entry point.
 */
const { execFileSync } = require('child_process');

const SSH_HOST = process.env.SSH_HOST;
const SSH_PRIVATE_KEY_PATH = process.env.SSH_PRIVATE_KEY_PATH;
const SSH_USER = process.env.SSH_USER;

if (!SSH_HOST || !SSH_PRIVATE_KEY_PATH || !SSH_USER) {
  console.error('Missing required environment variables for SSH connection');
  console.error('Please set SSH_HOST, SSH_PRIVATE_KEY_PATH, and SSH_USER');
  process.exit(1);
}

try {
  execFileSync('ssh', ['-i', SSH_PRIVATE_KEY_PATH, `${SSH_USER}@${SSH_HOST}`], {
    stdio: 'inherit',
  });
} catch {
  console.error('SSH connection failed');
  process.exit(1);
}
