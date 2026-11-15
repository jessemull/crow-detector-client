import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PorchPage from './page';

jest.mock('@components/PorchClips', () => {
  const MockPorchClips = () => <div>Shelter Cam page</div>;
  return {
    __esModule: true,
    default: MockPorchClips,
  };
});

describe('Porch page', () => {
  it('renders the Shelter Cam feature', async () => {
    render(<PorchPage />);
    await waitFor(() => {
      expect(screen.getByText('Shelter Cam page')).toBeTruthy();
    });
  });
});
