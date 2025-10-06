import React from 'react';

const AuthImagePattern = ({ title, subtitle, gridSize = 9 }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-8 lg:p-12">
      <div className="max-w-sm text-center">
        <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-8">
          {[...Array(gridSize)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-blue-700/20 dark:bg-blue-400/10 ${
                i % 2 === 0 ? 'animate-pulse' : ''
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
