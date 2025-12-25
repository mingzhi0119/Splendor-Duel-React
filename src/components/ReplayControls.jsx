import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

export const ReplayControls = ({ undo, redo, canUndo, canRedo, currentIndex, historyLength }) => {
    // Ensure display logic is clamped to valid range
    const safeIndex = Math.min(currentIndex, historyLength - 1);
    const currentStep = safeIndex + 1;

    return (
        <div className="flex items-center gap-4 bg-slate-950/90 p-3 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
            <button
                onClick={undo}
                disabled={!canUndo}
                aria-label="Step Backward"
                className={`p-2 rounded-xl border transition-all flex items-center justify-center
                    ${canUndo
                        ? 'bg-slate-800 border-slate-600 text-slate-200 hover:border-amber-500 hover:text-amber-500 hover:bg-slate-800/80 hover:shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-900/30 border-slate-800 text-slate-700 cursor-not-allowed'}
                `}
            >
                <Undo2 size={20} />
            </button>
            
            <div className="flex flex-col items-center min-w-[4rem]">
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-0.5">Turn</span>
                <span className="text-base font-mono font-bold text-slate-200 tabular-nums">
                    {currentStep} <span className="text-slate-600 mx-1">/</span> {historyLength}
                </span>
            </div>

            <button
                onClick={redo}
                disabled={!canRedo}
                aria-label="Step Forward"
                className={`p-2 rounded-xl border transition-all flex items-center justify-center
                    ${canRedo
                        ? 'bg-slate-800 border-slate-600 text-slate-200 hover:border-cyan-500 hover:text-cyan-500 hover:bg-slate-800/80 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900/30 border-slate-800 text-slate-700 cursor-not-allowed'}
                `}
            >
                <Redo2 size={20} />
            </button>
        </div>
    );
};
