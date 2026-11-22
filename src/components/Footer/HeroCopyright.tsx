import React from 'react';
import { copyrightLine } from './copyright';

/**
 * Below-the-fold copyright on full-bleed heroes.
 * Sits after a min-h-dvh content block so the first screen is photo-only;
 * transparent text over the same section image — no bar.
 */
const HeroCopyright: React.FC = () => (
  <div className="relative z-10 border-0 bg-transparent px-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-6">
    <p className="text-center text-sm text-white/70">{copyrightLine()}</p>
  </div>
);

export default HeroCopyright;
