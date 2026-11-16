'use client';

import { useEffect, useRef, useState } from 'react';
import {
  SPLASH_SIZES,
  splashFallback,
  splashImageMissing,
  splashSrcSet,
  type HeroImage,
} from '@constants/heroes';

type SplashBackgroundProps = {
  image: HeroImage;
  frameClassName: string;
};

const SplashBackground = ({ image, frameClassName }: SplashBackgroundProps) => {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const fallback = splashFallback(image);

  useEffect(() => {
    const element = imageRef.current;

    // A failed splash can finish before hydration, so onError never runs.

    if (element && splashImageMissing(element)) {
      setFailed(true);
    }
  }, [image.id]);

  if (failed) {
    return null;
  }

  return (
    <picture>
      <source
        type="image/webp"
        srcSet={splashSrcSet(image, 'webp')}
        sizes={SPLASH_SIZES}
      />
      {/* Static export cannot resize on request, so this srcset is prebuilt. */}
      <img
        ref={imageRef}
        src={fallback.jpeg}
        srcSet={splashSrcSet(image, 'jpeg')}
        sizes={SPLASH_SIZES}
        width={fallback.width}
        height={fallback.height}
        alt=""
        fetchPriority="high"
        className={`absolute left-0 w-full object-cover ${frameClassName}`}
        style={{ objectPosition: image.objectPosition }}
        onError={() => setFailed(true)}
        data-testid="splash-image"
      />
    </picture>
  );
};

export default SplashBackground;
