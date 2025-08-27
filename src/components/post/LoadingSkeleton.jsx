import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-24">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;