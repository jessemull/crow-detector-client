/**
 * Static export build. ENABLE_ANALYZER=true switches to webpack so
 * @next/bundle-analyzer can write a report. The default Next bundler is Turbopack.
 */
const { spawnSync } = require('child_process');

const args = ['next', 'build'];
if (process.env.ENABLE_ANALYZER === 'true') {
  args.push('--webpack');
}

const result = spawnSync('npx', args, { stdio: 'inherit', shell: true });
process.exit(result.status === null ? 1 : result.status);
