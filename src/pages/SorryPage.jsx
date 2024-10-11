import React from 'react';
import { Link } from 'react-router-dom';

const SorryPage = () => {
  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-100'>
      <h1 className='text-4xl font-semibold text-red-500'>Oops!</h1>
      <p className='mt-4 text-xl text-gray-700'>
      The content may not have been made public yet.
      </p>
      <Link
        to='/'
        className='mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300'
      >
        Go Back to Home
      </Link>
    </div>
  );
};

export default SorryPage;
