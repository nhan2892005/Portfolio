import React from 'react';
import { Link } from 'react-router-dom';

const FixedNavigation = ({ toggleSidebar }) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-4 z-50">
      <Link 
        to="/blog"
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
      >
        ← Blog
      </Link>
      
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center justify-center w-10 h-10 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg"
      >
        ↑
      </button>

      <button
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
        onClick={toggleSidebar}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <span className="text-sm font-medium">Xem mục lục</span>
      </button>
    </div>
  );
};

export default FixedNavigation;