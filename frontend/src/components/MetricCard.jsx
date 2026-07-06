import React from 'react';

export default function MetricCard({ title, value, unit = "" }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col justify-between min-h-[120px]">
      <p className="text-xs font-medium text-gray-400 tracking-tight">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-2">
        {value}{unit}
      </h3>
    </div>
  );
}