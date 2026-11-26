/**
 * Hosts allowed for signed clip playback URLs from the porch/feeder APIs.
 * CloudFront and crittercanteen stay default; S3 virtual-hosted object URLs
 * are allowed because the API returns time-limited S3 signed URLs.
 */
const PLAYBACK_HOST_SUFFIXES = ['.cloudfront.net', '.crittercanteen.com'];

const configuredPlaybackHosts = (): string[] =>
  (process.env.NEXT_PUBLIC_PLAYBACK_HOSTS || '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter((host) => host.length > 0);

/**
 * Virtual-hosted S3 object hosts that match CloudFront CSP media-src
 * (us-west-2 dotted + hyphen forms, plus legacy bucket.s3.amazonaws.com).
 */
const isAmazonS3ObjectHost = (host: string): boolean =>
  host.endsWith('.s3.amazonaws.com') ||
  host.endsWith('.s3.us-west-2.amazonaws.com') ||
  host.endsWith('.s3-us-west-2.amazonaws.com');

export const isAllowedPlaybackUrl = (value: string): boolean => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') {
    return false;
  }
  const host = url.hostname.toLowerCase();
  if (configuredPlaybackHosts().includes(host)) {
    return true;
  }
  if (isAmazonS3ObjectHost(host)) {
    return true;
  }
  return PLAYBACK_HOST_SUFFIXES.some(
    (suffix) => host.endsWith(suffix) && host.length > suffix.length
  );
};
