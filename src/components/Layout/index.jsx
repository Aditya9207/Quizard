import React from 'react';
import PropTypes from 'prop-types';
import Header from '../Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F0F4FF] to-[#FAF0FF] relative overflow-hidden">
      {/* Background Mesh & Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#7C3AED]/10 via-[#06B6D4]/5 to-[#7C3AED]/10 blur-3xl animate-mesh-move" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#7C3AED]/10 blur-3xl rounded-full orb-1" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#06B6D4]/10 blur-3xl rounded-full orb-2" />
      </div>

      <Header />
      <main className="flex-1 flex flex-col pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;
