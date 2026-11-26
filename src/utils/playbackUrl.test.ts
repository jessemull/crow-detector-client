import { isAllowedPlaybackUrl } from './playbackUrl';

describe('isAllowedPlaybackUrl', () => {
  const originalHosts = process.env.NEXT_PUBLIC_PLAYBACK_HOSTS;

  afterEach(() => {
    process.env.NEXT_PUBLIC_PLAYBACK_HOSTS = originalHosts;
  });

  it('allows configured hosts, CloudFront, crittercanteen, and S3 object hosts', () => {
    process.env.NEXT_PUBLIC_PLAYBACK_HOSTS = 'cdn.example.com';
    expect(isAllowedPlaybackUrl('https://cdn.example.com/clip.mp4')).toBe(true);
    expect(
      isAllowedPlaybackUrl('https://d111111abcdef8.cloudfront.net/clip.mp4')
    ).toBe(true);
    expect(
      isAllowedPlaybackUrl('https://media.crittercanteen.com/clip.mp4')
    ).toBe(true);
    expect(
      isAllowedPlaybackUrl(
        'https://crow-detector-images-dev.s3.us-west-2.amazonaws.com/porch/clip.mp4?X-Amz-Signature=1'
      )
    ).toBe(true);
    expect(
      isAllowedPlaybackUrl(
        'https://bucket.s3.amazonaws.com/feeder/clip.mp4?X-Amz-Signature=1'
      )
    ).toBe(true);
  });

  it('rejects non-https, bad hosts, and non-S3 amazonaws hosts', () => {
    process.env.NEXT_PUBLIC_PLAYBACK_HOSTS = 'cdn.example.com';
    expect(isAllowedPlaybackUrl('http://cdn.example.com/clip.mp4')).toBe(false);
    expect(isAllowedPlaybackUrl('https://evil.example/clip.mp4')).toBe(false);
    expect(isAllowedPlaybackUrl('not a url')).toBe(false);
    expect(
      isAllowedPlaybackUrl('https://lambda.us-west-2.amazonaws.com/clip.mp4')
    ).toBe(false);
  });
});
