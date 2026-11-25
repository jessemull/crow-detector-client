import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

jest.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'font-inter' }),
  Urbanist: () => ({ variable: 'font-urbanist' }),
}));

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

jest.mock('@components/Header', () => ({
  Header: () => <header>Header</header>,
}));

jest.mock('@components/Footer', () => ({
  Footer: () => <footer>Footer</footer>,
}));

jest.mock('@components/GaRouteListener', () => ({
  GaRouteListener: () => null,
}));

describe('RootLayout', () => {
  const originalId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
  const originalConsent = process.env.NEXT_PUBLIC_GA_CONSENT;

  afterEach(() => {
    process.env.NEXT_PUBLIC_GA_TRACKING_ID = originalId;
    process.env.NEXT_PUBLIC_GA_CONSENT = originalConsent;
    jest.resetModules();
  });

  it('renders the page without analytics when consent is missing', async () => {
    delete process.env.NEXT_PUBLIC_GA_CONSENT;
    process.env.NEXT_PUBLIC_GA_TRACKING_ID = 'not-an-id';
    jest.resetModules();
    const { default: RootLayout } = await import('./layout');

    render(
      <RootLayout>
        <p>Home copy</p>
      </RootLayout>
    );

    expect(screen.getByText('Home copy')).toBeInTheDocument();
    expect(screen.queryByText(/gtag/)).not.toBeInTheDocument();
  });

  it('injects analytics only for a granted measurement id', async () => {
    process.env.NEXT_PUBLIC_GA_CONSENT = 'granted';
    process.env.NEXT_PUBLIC_GA_TRACKING_ID = 'G-TEST123';
    jest.resetModules();
    const { default: RootLayout } = await import('./layout');

    render(
      <RootLayout>
        <p>Home copy</p>
      </RootLayout>
    );

    expect(screen.getByText(/G-TEST123/)).toBeInTheDocument();
  });
});
