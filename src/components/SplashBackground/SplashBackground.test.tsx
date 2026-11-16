import { fireEvent, render, screen } from '@testing-library/react';
import { getAboutImage, getActiveHero } from '@constants/heroes';
import SplashBackground from './SplashBackground';

const mockImageState = (complete: boolean, naturalWidth: number) => {
  const completeSpy = jest
    .spyOn(HTMLImageElement.prototype, 'complete', 'get')
    .mockReturnValue(complete);
  const widthSpy = jest
    .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
    .mockReturnValue(naturalWidth);

  return () => {
    completeSpy.mockRestore();
    widthSpy.mockRestore();
  };
};

describe('SplashBackground', () => {
  it('offers a webp srcset and a jpeg fallback', () => {
    const restore = mockImageState(true, 1280);
    render(
      <SplashBackground
        image={getActiveHero()}
        frameClassName="!-top-[25%] !h-[125%]"
      />
    );

    const image = screen.getByTestId('splash-image');
    expect(image).toHaveAttribute('src', '/images/hero/spencer-1280.jpg');
    expect(image).toHaveAttribute(
      'srcset',
      '/images/hero/spencer-640.jpg 640w, /images/hero/spencer-960.jpg 960w, /images/hero/spencer-1280.jpg 1280w'
    );
    expect(image).toHaveAttribute('sizes', '100vw');
    expect(document.querySelector('source')).toHaveAttribute(
      'srcset',
      '/images/hero/spencer-640.webp 640w, /images/hero/spencer-960.webp 960w, /images/hero/spencer-1280.webp 1280w'
    );
    restore();
  });

  it('drops the image when the request fails', () => {
    const restore = mockImageState(false, 0);
    render(
      <SplashBackground
        image={getAboutImage()}
        frameClassName="!-top-[20%] !h-[120%]"
      />
    );

    fireEvent.error(screen.getByTestId('splash-image'));
    expect(screen.queryByTestId('splash-image')).toBeNull();
    restore();
  });

  it('drops a splash that already failed before hydration', () => {
    const restore = mockImageState(true, 0);
    render(
      <SplashBackground image={getActiveHero()} frameClassName="!-top-[25%]" />
    );

    expect(screen.queryByTestId('splash-image')).toBeNull();
    restore();
  });
});
