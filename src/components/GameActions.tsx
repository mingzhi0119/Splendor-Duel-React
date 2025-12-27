import React from 'react';
import { Check, RefreshCw, X, Eye } from 'lucide-react';
import { GamePhase, BagItem, Buff } from '../types';

interface GameActionsProps {
    handleReplenish: () => void;
    bag?: BagItem[];
    gameMode: GamePhase | string;
    handleConfirmTake: () => void;
    selectedGems?: any[];
    handleCancelReserve: () => void;
    handleCancelPrivilege: () => void;
    activeBuff?: Buff;
    onPeekDeck?: (level: number) => void;
    theme: 'light' | 'dark';
}

export const GameActions: React.FC<GameActionsProps> = ({
    handleReplenish,
    bag = [],
    gameMode,
    handleConfirmTake,
    selectedGems = [],
    handleCancelReserve,
    handleCancelPrivilege,
    activeBuff,
    onPeekDeck,
    theme,
}) => {
    const bagCount = bag ? bag.length : 0;
    const selectedCount = selectedGems ? selectedGems.length : 0;

    return (
        <div className="flex flex-col gap-4 items-center mt-4 z-50">
            {/* Game Action Buttons */}
            {gameMode === 'RESERVE_WAITING_GEM' ? (
                // Cancel Reserve Mode - replaces other buttons
                <button
                    onClick={handleCancelReserve}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                >
                    <X size={20} />
                    Cancel Reserve
                </button>
            ) : gameMode === 'PRIVILEGE_ACTION' ? (
                <button
                    onClick={handleCancelPrivilege}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                >
                    <X size={20} />
                    Cancel Privilege
                </button>
            ) : (
                // Normal game actions
                <div className="flex gap-3">
                    {/* Confirm Take Gems */}
                    {selectedCount > 0 && (
                        <button
                            onClick={handleConfirmTake}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all animate-in fade-in zoom-in hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
                        >
                            <Check size={20} />
                            Take {selectedCount} Gem{selectedCount > 1 ? 's' : ''}
                        </button>
                    )}

                    {/* Replenish Board */}
                    <button
                        onClick={handleReplenish}
                        disabled={bagCount === 0 || gameMode !== 'IDLE' || selectedCount > 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all border active:scale-95
                            ${
                                bagCount > 0 && gameMode === 'IDLE' && selectedCount === 0
                                    ? theme === 'dark'
                                        ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                    : (theme === 'dark'
                                          ? 'bg-slate-900/20 border-slate-800/50 text-slate-700'
                                          : 'bg-slate-100/50 border-slate-200/50 text-slate-400') +
                                      ' cursor-not-allowed opacity-50'
                            }`}
                    >
                        <RefreshCw size={16} />
                        Refill ({bagCount})
                    </button>
                </div>
            )}

            {/* Intelligence Action (Peek Deck) */}
            {activeBuff?.effects?.active === 'peek_deck' && gameMode === 'IDLE' && (
                <div
                    className={`flex flex-col gap-2 p-3 rounded-xl border animate-in fade-in slide-in-from-bottom-2
                    ${theme === 'dark' ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50/50 border-purple-200'}
                `}
                >
                    <div className="flex items-center justify-center gap-2 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                        <Eye size={12} /> Intelligence Network
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => onPeekDeck && onPeekDeck(lvl)}
                                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
                            >
                                Peek L{lvl}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
