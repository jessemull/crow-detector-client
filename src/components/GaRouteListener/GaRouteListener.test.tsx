import { render } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import GaRouteListener from './GaRouteListener';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockedPathname = jest.mocked(usePathname);

type GtagWindow = Window & {
  gtag?: (
    command: 'config',
    measurementId: string,
    params: { page_path: string }
  ) => void;
};

describe('GaRouteListener', () => {
  afterEach(() => {
    delete (window as GtagWindow).gtag;
  });

  it('reports the current path once gtag exists, including the first view', () => {
    const gtag = jest.fn();
    (window as GtagWindow).gtag = gtag;
    mockedPathname.mockReturnValue('/about');

    const { rerender } = render(<GaRouteListener measurementId="G-TEST" />);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST', {
      page_path: '/about',
    });

    rerender(<GaRouteListener measurementId="G-TEST" />);
    expect(gtag).toHaveBeenCalledTimes(1);

    mockedPathname.mockReturnValue('/porch');
    rerender(<GaRouteListener measurementId="G-TEST" />);

    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST', {
      page_path: '/porch',
    });
  });

  it('uses the home path when the router has no pathname', () => {
    const gtag = jest.fn();
    (window as GtagWindow).gtag = gtag;
    mockedPathname.mockReturnValue('');

    render(<GaRouteListener measurementId="G-TEST" />);

    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST', {
      page_path: '/',
    });
  });

  it('sends the current path when gtag becomes ready', () => {
    const gtag = jest.fn();
    mockedPathname.mockReturnValue('/about');

    render(<GaRouteListener measurementId="G-TEST" />);
    expect(gtag).not.toHaveBeenCalled();

    (window as GtagWindow).gtag = gtag;
    window.dispatchEvent(new Event('ga-ready'));

    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST', {
      page_path: '/about',
    });
  });

  it('does not send after unmount', () => {
    const gtag = jest.fn();
    mockedPathname.mockReturnValue('/about');

    const { unmount } = render(<GaRouteListener measurementId="G-TEST" />);
    unmount();

    (window as GtagWindow).gtag = gtag;
    window.dispatchEvent(new Event('ga-ready'));

    expect(gtag).not.toHaveBeenCalled();
  });
});
