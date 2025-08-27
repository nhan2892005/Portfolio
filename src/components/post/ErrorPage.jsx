import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-24">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Bài viết không tồn tại</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/blog')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Quay lại Blog
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              🏠 Trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;