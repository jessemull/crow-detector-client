import { render, screen } from '@testing-library/react';
import Page from './page';

// Mock the HomePage component
jest.mock('@components/HomePage', () => {
  return function MockHomePage() {
    return <div data-testid="homepage">HomePage Component</div>;
  };
});

describe('Page', () => {
  it('renders the HomePage component', () => {
    render(<Page />);
    expect(screen.getByTestId('homepage')).toBeInTheDocument();
  });
});
