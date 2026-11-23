import React from 'react';
import { render, screen } from '@testing-library/react';
import FeederPage, { metadata } from './page';

jest.mock('@components/FeederClips/FeederClips', () => {
  const MockFeederClips = () => <div>Feeder Cam page</div>;
  return {
    __esModule: true,
    default: MockFeederClips,
  };
});

describe('Feeder page', () => {
  it('renders the Feeder Cam feature', () => {
    render(<FeederPage />);
    expect(screen.getByText('Feeder Cam page')).toBeTruthy();
  });

  it('keeps the page out of search indexes', () => {
    expect(metadata.title).toBe('Feeder Cam - Critter Canteen');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
