import React, { AnchorHTMLAttributes, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import UtilityNotice from './UtilityNotice';

expect.extend(toHaveNoViolations);

jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children?: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('UtilityNotice', () => {
  it('renders title, description, and default home CTA', () => {
    const { container } = render(
      <UtilityNotice
        title="Oops! Page Not Found"
        description="Missing page copy."
      />
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Oops! Page Not Found' })
    ).toBeTruthy();
    expect(screen.getByText('Missing page copy.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(
      screen.queryByRole('button', { name: 'Try again' })
    ).not.toBeInTheDocument();
    expect(container.querySelector('section')?.className).toContain(
      'overflow-x-hidden'
    );
  });

  it('keeps a watermark inside the viewport and passes an axe check', async () => {
    const { container } = render(
      <UtilityNotice
        title="Oops! Page Not Found"
        description="Missing page copy."
        watermark="404"
      />
    );

    const section = container.querySelector('section');
    expect(section?.className).toContain('overflow-x-hidden');
    expect(screen.getByText('404').className).toContain(
      'text-[clamp(8rem,63vw,34rem)]'
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('calls onRetry from the try again button', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    const { container } = render(
      <UtilityNotice
        title="Something went wrong"
        description="Try the page again."
        onRetry={onRetry}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('uses standalone padding without site chrome offset', () => {
    const { container } = render(
      <UtilityNotice
        standalone
        title="Something went wrong"
        description="Fly back home."
        ctaLabel="Home"
      />
    );

    const section = container.querySelector('section');
    expect(section?.className).toContain('py-16');
    expect(section?.className).not.toContain('pt-28');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
