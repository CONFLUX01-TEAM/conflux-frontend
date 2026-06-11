import React from 'react';

interface SpinnerProps {
  /** Tailwind size classes, e.g. "size-6". Defaults to a mid-size spinner. */
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className = 'size-8' }) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-[#E6E6E6] border-t-[#0D2D54] ${className}`}
    />
  );
};

export default Spinner;
