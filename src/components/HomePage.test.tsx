import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />);
    expect(screen.getByText('🐦 Critter Canteen')).toBeInTheDocument();
  });

  it('renders the feeding station status section', () => {
    render(<HomePage />);
    expect(screen.getByText('🍽️ Feeding Station Status')).toBeInTheDocument();
  });

  it('renders feeder and camera status indicators', () => {
    render(<HomePage />);
    expect(screen.getByTestId('feeder-status')).toBeInTheDocument();
    expect(screen.getByTestId('camera-status')).toBeInTheDocument();
  });

  it('renders the feed button', () => {
    render(<HomePage />);
    expect(screen.getByText('🍽️ Feed the Crows')).toBeInTheDocument();
  });

  it('renders the placeholder message', () => {
    render(<HomePage />);
    expect(
      screen.getByText(/🚧 This is a placeholder interface/)
    ).toBeInTheDocument();
  });
});
