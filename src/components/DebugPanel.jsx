import React from 'react';

export function DebugPanel({ player, onAddCrowns, onAddPoints, onForceRoyal }) {
  return (
    <div className="bg-slate-900/90 border-2 border-red-900/50 p-3 rounded-lg backdrop-blur-md shadow-2xl w-48">
      <div className="text-red-500 font-bold text-[10px] mb-2 uppercase tracking-tighter border-b border-red-900/30 pb-1">
        Bug Modifier: {player}
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={onAddCrowns} className="bg-slate-800 hover:bg-slate-700 text-white text-[9px] py-1 rounded border border-slate-600 transition-colors text-left px-2">
          +1 Crown
        </button>
        <button onClick={onAddPoints} className="bg-slate-800 hover:bg-slate-700 text-white text-[9px] py-1 rounded border border-slate-600 transition-colors text-left px-2">
          +1 Point
        </button>
        <button onClick={onForceRoyal} className="bg-red-900/40 hover:bg-red-800/60 text-red-200 text-[9px] py-1 rounded border border-red-700 transition-colors font-bold">
          FORCE ROYAL SELECTION
        </button>
      </div>
    </div>
  );
}
