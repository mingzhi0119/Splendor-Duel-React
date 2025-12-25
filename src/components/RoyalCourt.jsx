import React from 'react';
import { Crown } from 'lucide-react';
import { Card } from './Card';

export const RoyalCourt = ({ royalDeck, gameMode, handleSelectRoyal, theme }) => {
    return (
        <div className={`flex flex-col gap-4 items-center p-4 rounded-3xl border backdrop-blur-sm shrink-0 w-fit transition-colors duration-500
            ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/40 border-slate-200/50'}
        `}>
            <h2 className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Crown size={14} /> Royal Court
            </h2>
            <div className="grid grid-cols-2 gap-3">
                {royalDeck.length > 0 ? (
                    royalDeck.map(card => (
                        <div
                            key={card.id}
                            className={`relative transition-all duration-300 ${gameMode === 'SELECT_ROYAL' ? 'cursor-pointer hover:scale-110 hover:rotate-1 z-50 ring-4 ring-yellow-400/50 rounded-lg shadow-xl' : 'opacity-80 grayscale-[0.2]'}`}
                            onClick={() => gameMode === 'SELECT_ROYAL' && handleSelectRoyal(card)}
                        >
                            <Card card={card} isRoyal={true} />
                            {gameMode === 'SELECT_ROYAL' && (
                                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce shadow-lg">PICK!</div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 h-64 flex items-center justify-center text-slate-700 italic text-xs">Court is Empty</div>
                )}
            </div>
        </div>
    );
};
