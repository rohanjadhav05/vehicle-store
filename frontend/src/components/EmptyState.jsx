import React from 'react';

const EmptyState = ({ icon = '🔍', message = 'No results found.' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4 opacity-80">{icon}</div>
      <h3 className="text-lg font-medium text-slate-600">{message}</h3>
    </div>
  );
};

export default EmptyState;
