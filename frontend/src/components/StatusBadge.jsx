import React from 'react';

const StatusBadge = ({ status }) => {
  let styleClasses = "bg-slate-100 text-slate-700";

  if (status === 'PENDING') {
    styleClasses = "bg-[#FEF3C7] text-[#92400E]";
  } else if (status === 'CONFIRMED') {
    styleClasses = "bg-green-100 text-green-700";
  } else if (status === 'CANCELLED') {
    styleClasses = "bg-red-100 text-red-700";
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${styleClasses}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
