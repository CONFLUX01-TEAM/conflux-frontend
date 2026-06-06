import React from 'react';
import type { ButtonProps } from '../types';

const Button: React.FC<ButtonProps> = ({ children, label, icon, className = '', disabled, ...props }) => {
  return (
    <button
      // className={`w-full inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      className={`w-full inline-flex items-center justify-center gap-2 transition-all duration-200 ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {label || children}
    </button>
  );
};

export default Button;