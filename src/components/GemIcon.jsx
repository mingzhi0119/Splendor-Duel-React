import React from 'react';

export const GemIcon = ({ type, size = "w-6 h-6", className = "", count }) => (
  <div className={`relative ${size} rounded-full bg-gradient-to-br ${type.color} border ${type.border} shadow-sm ${className}`} title={type.label}>
    {type.id === 'pearl' && <span className="flex items-center justify-center h-full text-[10px] text-pink-900 font-bold">P</span>}
    {type.id === 'gold' && <span className="flex items-center justify-center h-full text-[10px] text-yellow-900 font-bold">G</span>}
    {count !== undefined && (
        <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] font-bold px-1.5 rounded-full border border-slate-600 z-10">{count}</span>
    )}
  </div>
);