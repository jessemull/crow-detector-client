import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import * as Sentry from '@sentry/nextjs';
import GlobalError from './global-error';

expect.extend(toHaveNoViolations);

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'font-inter', variable: '--font-inter' }),
  Urbanist: () => ({
    className: 'font-urbanist',
    variable: '--font-urbanist-family',
  }),
}));

describe('GlobalError', () => {
  it('shows the crash notice and retries', async () => {
    const user = userEvent.setup();
    const retry = jest.fn();

    render(
      <GlobalError error={new Error('boom')} reset={jest.fn()} retry={retry} />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <GlobalError
        error={new Error('boom')}
        reset={jest.fn()}
        retry={jest.fn()}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
