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
  GaRouteListener: ({ measurementId }: { measurementId: string }) => (
    <p>Listening for {measurementId}</p>
  ),
}));

describe('RootLayout', () => {
  const originalId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
  const originalConsent = process.env.NEXT_PUBLIC_GA_CONSENT;

  afterEach(() => {
    if (originalId === undefined) {
      delete process.env.NEXT_PUBLIC_GA_TRACKING_ID;
    } else {
      process.env.NEXT_PUBLIC_GA_TRACKING_ID = originalId;
    }
    if (originalConsent === undefined) {
      delete process.env.NEXT_PUBLIC_GA_CONSENT;
    } else {
      process.env.NEXT_PUBLIC_GA_CONSENT = originalConsent;
    }
    jest.resetModules();
  });

  async function renderLayout() {
    jest.resetModules();
    const { default: RootLayout } = await import('./layout');
    return render(
      <RootLayout>
        <p>Home copy</p>
      </RootLayout>
    );
  }

  it('renders the page without analytics when consent is missing', async () => {
    delete process.env.NEXT_PUBLIC_GA_CONSENT;
    process.env.NEXT_PUBLIC_GA_TRACKING_ID = 'G-TEST123';

    await renderLayout();

    expect(screen.getByText('Home copy')).toBeInTheDocument();
    expect(screen.queryByText(/gtag/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Listening for/)).not.toBeInTheDocument();
  });

  it('renders the page without analytics when the measurement id is invalid', async () => {
    process.env.NEXT_PUBLIC_GA_CONSENT = 'granted';
    process.env.NEXT_PUBLIC_GA_TRACKING_ID = 'not-an-id';

    await renderLayout();

    expect(screen.queryByText(/gtag/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Listening for/)).not.toBeInTheDocument();
  });

  it('renders the page without analytics when the measurement id is missing', async () => {
    process.env.NEXT_PUBLIC_GA_CONSENT = 'granted';
    delete process.env.NEXT_PUBLIC_GA_TRACKING_ID;

    await renderLayout();

    expect(screen.queryByText(/gtag/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Listening for/)).not.toBeInTheDocument();
  });

  it('injects analytics and the route listener only for a granted measurement id', async () => {
    process.env.NEXT_PUBLIC_GA_CONSENT = 'granted';
    process.env.NEXT_PUBLIC_GA_TRACKING_ID = 'G-TEST123';

    await renderLayout();

    expect(screen.getByText(/gtag\/js\?id=G-TEST123/)).toBeInTheDocument();
    expect(screen.getByText('Listening for G-TEST123')).toBeInTheDocument();
  });
});
