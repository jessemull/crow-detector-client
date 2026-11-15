import React from 'react';
import Link from 'next/link';

type UtilityNoticeProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  watermark?: string;
  /** Full-document crash page (no site header above). */
  standalone?: boolean;
};

const UtilityNotice: React.FC<UtilityNoticeProps> = ({
  title,
  description,
  ctaLabel = 'Back to Home',
  watermark,
  standalone = false,
}) => {
  return (
    <section
      className={
        standalone
          ? 'relative flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] px-6 py-16 text-center md:px-10'
          : 'relative flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] px-6 pb-16 pt-28 text-center md:px-10 md:pt-32'
      }
    >
      {watermark ? (
        <p
          className="pointer-events-none absolute left-[49.2%] top-[53%] -translate-x-1/2 -translate-y-1/2 text-center font-urbanist text-[clamp(17rem,63vw,34rem)] font-semibold leading-none tracking-[-0.08em] text-black/[0.045]"
          aria-hidden="true"
        >
          {watermark}
        </p>
      ) : null}

      <div className="relative z-10 flex max-w-2xl flex-col items-center">
        <h1 className="mb-4 font-urbanist text-4xl font-medium leading-tight tracking-[-0.04em] text-[#0e0e0e] md:text-5xl md:leading-[1.05] lg:text-[56px] lg:tracking-[-1.12px]">
          {title}
        </h1>
        <p className="mb-8 max-w-xl font-urbanist text-base font-medium leading-relaxed tracking-[-0.32px] text-[#0e0e0e]/70 md:text-lg">
          {description}
        </p>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-[50px] bg-[#fff017] px-6 font-urbanist text-[16px] font-semibold leading-[22.4px] tracking-[-0.32px] text-[#0e0e0e] transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e0e0e]"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
};

export default UtilityNotice;
