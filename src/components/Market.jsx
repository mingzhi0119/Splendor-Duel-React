import React from 'react';
import { Layers } from 'lucide-react';
import { Card } from './Card';
import { calculateCost } from '../utils';

export const Market = ({
    market,
    decks,
    gameMode,
    turn,
    inventories,
    playerTableau,
    handleReserveDeck,
    initiateBuy,
    handleReserveCard,
    theme
}) => {
    return (
        <div className="flex flex-col gap-4 items-center shrink-0 w-fit">
            <h2 className={`text-[10px] font-bold uppercase tracking-widest mb-1 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Market</h2>
            {[3, 2, 1].map(lvl => (
                <div key={lvl} className="flex gap-3 justify-center items-center">
                    <div
                        onClick={() => handleReserveDeck(lvl)}
                        className={`w-24 h-32 shrink-0 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 shadow-md relative overflow-hidden group
                            ${gameMode === 'IDLE' && decks[lvl].length > 0 
                                ? (theme === 'dark' ? 'border-slate-600 hover:border-emerald-400' : 'border-slate-400 hover:border-emerald-500') + ' cursor-pointer hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0' 
                                : (theme === 'dark' ? 'border-slate-800 opacity-40' : 'border-slate-300 opacity-40') + ' cursor-default'}
                        `}
                    >
                        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`} />
                        <div className="relative z-10 flex flex-col items-center">
                            <Layers size={18} className="text-slate-500 mb-1" />
                            <div className="text-slate-400 font-bold text-[10px]">Lvl {lvl}</div>
                            <div className="text-slate-600 text-[9px] font-mono">{decks[lvl].length}</div>
                        </div>
                    </div>

                    {market[lvl].map((card, i) => (
                        <Card key={i} card={card}
                            canBuy={gameMode === 'IDLE' && card && calculateCost(card, turn, inventories, playerTableau)}
                            onClick={() => card && initiateBuy(card, 'market', { level: lvl, idx: i })}
                            onReserve={() => card && handleReserveCard(card, lvl, i)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};
