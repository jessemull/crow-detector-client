import { render } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import GaRouteListener from './GaRouteListener';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockedPathname = jest.mocked(usePathname);

describe('GaRouteListener', () => {
  it('reports the current path once gtag exists, including the first view', () => {
    const gtag = jest.fn();
    (window as Window & { gtag?: typeof gtag }).gtag = gtag;
    mockedPathname.mockReturnValue('/about');

    const { rerender } = render(<GaRouteListener measurementId="G-TEST" />);
    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST', {
      page_path: '/about',
    });

    mockedPathname.mockReturnValue('/porch');
    rerender(<GaRouteListener measurementId="G-TEST" />);

    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST', {
      page_path: '/porch',
    });
  });
});
