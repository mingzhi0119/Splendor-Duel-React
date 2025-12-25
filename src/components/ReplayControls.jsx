import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

export const ReplayControls = ({ undo, redo, canUndo, canRedo, currentIndex, historyLength, theme }) => {
    const safeIndex = Math.min(currentIndex, historyLength - 1);
    const currentStep = safeIndex + 1;

    return (
        <div className={`flex items-center gap-4 p-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-colors duration-500
            ${theme === 'dark' ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'}
        `}>
            <button
                onClick={undo}
                disabled={!canUndo}
                aria-label="Step Backward"
                className={`p-2 rounded-xl border transition-all flex items-center justify-center
                    ${canUndo
                        ? (theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-800/80' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200') + ' hover:border-amber-500 hover:text-amber-500 hover:shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : (theme === 'dark' ? 'bg-slate-900/30 border-slate-800 text-slate-700' : 'bg-slate-100/30 border-slate-200 text-slate-300') + ' cursor-not-allowed'}
                `}
            >
                <Undo2 size={20} />
            </button>
            
            <div className="flex flex-col items-center min-w-[4rem]">
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-0.5">Turn</span>
                <span className={`text-base font-mono font-bold tabular-nums ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    {currentStep} <span className="text-slate-600 mx-1">/</span> {historyLength}
                </span>
            </div>

            <button
                onClick={redo}
                disabled={!canRedo}
                aria-label="Step Forward"
                className={`p-2 rounded-xl border transition-all flex items-center justify-center
                    ${canRedo
                        ? (theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-800/80' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200') + ' hover:border-cyan-500 hover:text-cyan-500 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : (theme === 'dark' ? 'bg-slate-900/30 border-slate-800 text-slate-700' : 'bg-slate-100/30 border-slate-200 text-slate-300') + ' cursor-not-allowed'}
                `}
            >
                <Redo2 size={20} />
            </button>
        </div>
    );
};
