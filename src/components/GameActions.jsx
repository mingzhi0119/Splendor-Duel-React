import React from 'react';
import { Check, RefreshCw, X } from 'lucide-react';

export const GameActions = ({ 
    handleReplenish, 
    bag = [], 
    gameMode, 
    handleConfirmTake, 
    selectedGems = [], 
    handleCancelReserve
}) => {
    
    // 安全检查，防止 undefined 导致 crash
    const bagCount = bag ? bag.length : 0;
    const selectedCount = selectedGems ? selectedGems.length : 0;

    return (
        <div className="flex flex-col gap-4 items-center mt-4 z-50">
            {/* Game Action Buttons */}
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
                        ${(bagCount > 0 && gameMode === 'IDLE' && selectedCount === 0)
                            ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700' 
                            : 'bg-slate-900/20 border-slate-800/50 text-slate-700 cursor-not-allowed opacity-50'
                        }`}
                >
                    <RefreshCw size={16} />
                    Refill ({bagCount})
                </button>

                {/* Cancel Reserve Mode */}
                {gameMode === 'RESERVE_WAITING_GEM' && (
                    <button 
                        onClick={handleCancelReserve}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:-translate-y-0.5 active:scale-95"
                    >
                        <X size={20} />
                        Cancel Reserve
                    </button>
                )}
            </div>
        </div>
    );
};