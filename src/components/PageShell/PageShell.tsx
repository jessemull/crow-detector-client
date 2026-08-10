import React, { ReactNode } from 'react';

const DOT_GRID_BACKGROUND =
  "bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]";

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
      className={`relative min-h-screen bg-gradient-to-br from-stone-900 via-neutral-800 to-stone-900 ${className}`.trim()}
    >
      <div
        className={`absolute inset-0 ${DOT_GRID_BACKGROUND} opacity-30`}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-16 ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
};

export default PageShell;
