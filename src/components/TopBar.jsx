import React from 'react';
import { Crown, Trophy, History } from 'lucide-react';

export const TopBar = ({ p1Score, p1Crowns, p2Score, p2Crowns, turnCount, activePlayer, theme }) => {
    const isP1Winning = p1Score >= 15 || p1Crowns >= 7;
    const isP2Winning = p2Score >= 15 || p2Crowns >= 7;

    return (
        <div className={`fixed top-0 left-0 w-full h-20 backdrop-blur-md border-b z-[60] flex items-center justify-between px-8 transition-colors duration-500
            ${theme === 'dark' ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'}
        `}>
            {/* Player 1 Overview (Left) */}
            <div className={`flex items-center gap-8 transition-all duration-500 ${activePlayer === 'p1' ? 'opacity-100 scale-105' : 'opacity-100'}`}>
                <span className="text-lg font-black text-emerald-500 uppercase tracking-widest drop-shadow-md">Player 1</span>
                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 ${isP1Winning && p1Score >= 15 ? 'animate-pulse text-yellow-400' : (theme === 'dark' ? 'text-white' : 'text-slate-800')}`}>
                        <Trophy size={24} />
                        <span className="text-4xl font-black drop-shadow-lg">{p1Score}</span>
                        <span className="text-xs text-slate-500 font-bold mt-2">PTS</span>
                    </div>
                    <div className={`flex items-center gap-2 ${isP1Winning && p1Crowns >= 7 ? 'animate-pulse text-yellow-400' : 'text-yellow-500'}`}>
                        <Crown size={24} fill="currentColor" />
                        <span className="text-4xl font-black drop-shadow-lg">{p1Crowns}</span>
                        <span className="text-xs text-slate-500 font-bold mt-2">/ 10</span>
                    </div>
                </div>
            </div>

            {/* Center Info */}
            <div className="flex flex-col items-center justify-center">
                <div className={`flex items-center gap-2 px-4 py-1 rounded-full border transition-colors duration-500
                    ${theme === 'dark' ? 'text-slate-400 bg-slate-900/50 border-slate-800' : 'text-slate-600 bg-slate-200/50 border-slate-300'}
                `}>
                    <History size={14} />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest">Action #{turnCount}</span>
                </div>
            </div>

            {/* Player 2 Overview (Right) */}
            <div className={`flex items-center gap-8 transition-all duration-500 flex-row-reverse ${activePlayer === 'p2' ? 'opacity-100 scale-105' : 'opacity-100'}`}>
                <span className="text-lg font-black text-blue-500 uppercase tracking-widest drop-shadow-md">Player 2</span>
                <div className="flex items-center gap-6 flex-row-reverse">
                    <div className={`flex items-center gap-2 ${isP2Winning && p2Score >= 15 ? 'animate-pulse text-yellow-400' : (theme === 'dark' ? 'text-white' : 'text-slate-800')}`}>
                        <Trophy size={24} />
                        <span className="text-4xl font-black drop-shadow-lg">{p2Score}</span>
                        <span className="text-xs text-slate-500 font-bold mt-2">PTS</span>
                    </div>
                    <div className={`flex items-center gap-2 ${isP2Winning && p2Crowns >= 7 ? 'animate-pulse text-yellow-400' : 'text-yellow-500'}`}>
                        <Crown size={24} fill="currentColor" />
                        <span className="text-4xl font-black drop-shadow-lg">{p2Crowns}</span>
                        <span className="text-xs text-slate-500 font-bold mt-2">/ 10</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
