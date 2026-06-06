import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 px-4 py-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500 mt-auto">
      &copy; {new Date().getFullYear()} Conflux. All rights reserved.
    </footer>
  );
};

export default Footer;
