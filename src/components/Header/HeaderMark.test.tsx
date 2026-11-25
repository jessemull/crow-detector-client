import { render, screen } from '@testing-library/react';
import HeaderMark from './HeaderMark';

describe('HeaderMark', () => {
  it('renders the brand mark with no extra class by default', () => {
    render(<HeaderMark />);

    expect(screen.getByTestId('header-mark')).toHaveAttribute('class', '');
  });

  it('applies a class passed by the header', () => {
    render(<HeaderMark className="h-8 w-8 text-cc-ink" />);

    const mark = screen.getByTestId('header-mark');
    expect(mark.getAttribute('class')).toContain('h-8');
    expect(mark.getAttribute('class')).toContain('text-cc-ink');
  });
});
