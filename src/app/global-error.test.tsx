import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Sentry from '@sentry/nextjs';
import GlobalError from './global-error';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

jest.mock('next/font/google', () => ({
  Urbanist: () => ({ className: 'font-urbanist' }),
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
});
