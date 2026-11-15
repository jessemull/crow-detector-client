import React, { ReactNode } from 'react';

const DOT_GRID_BACKGROUND =
  "bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

const PageShell: React.FC<PageShellProps> = ({
  children,
  className = '',
  contentClassName = '',
}) => {
  return (
    <div
      className={`relative min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-neutral-900 ${className}`.trim()}
    >
      <div
        className={`absolute inset-0 ${DOT_GRID_BACKGROUND} opacity-40`}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 mx-auto max-w-6xl px-6 pb-8 pt-28 md:pb-16 md:pt-32 ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
};

export default PageShell;
