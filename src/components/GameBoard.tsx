import React from 'react';
import { BoardCell, BagItem, GamePhase, GemCoord, GemTypeObject } from '../types';

interface GameBoardProps {
    board: BoardCell[][];
    bag: BagItem[];
    handleGemClick: (r: number, c: number) => void;
    isSelected: (r: number, c: number) => boolean;
    selectedGems: GemCoord[];
    gameMode: GamePhase | string;
    bonusGemTarget: GemTypeObject | null;
    theme: 'light' | 'dark';
}

export const GameBoard: React.FC<GameBoardProps> = ({
    board,
    bag,
    handleGemClick,
    isSelected,
    selectedGems,
    gameMode,
    bonusGemTarget,
    theme,
}) => {
    return (
        <div
            className={`p-3 rounded-2xl shadow-2xl border transition-colors duration-300 backdrop-blur-sm
            ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/60 border-slate-200/50'}
            ${gameMode === 'DISCARD_EXCESS_GEMS' ? 'border-red-500/50' : ''}
        `}
        >
            <div className="text-right text-[10px] text-slate-500 mb-1 font-mono">
                Bag: {bag.length}
            </div>
            <div className="grid grid-cols-5 grid-rows-5 gap-2 w-[300px] h-[300px]">
                {board.map((row, r) =>
                    row.map((gem, c) => {
                        // Defensive check: gem might be undefined
                        if (!gem || !gem.type) {
                            return (
                                <button
                                    key={`${r}-${c}-empty`}
                                    disabled
                                    className={`relative group w-full h-full rounded-full flex items-center justify-center transition-all duration-150 cursor-default`}
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-300/50'}`}
                                    ></div>
                                </button>
                            );
                        }

                        const isSelectedGem = isSelected(r, c);
                        const isGold = gem.type.id === 'gold';
                        let isTarget = false;
                        if (gameMode === 'RESERVE_WAITING_GEM') isTarget = isGold;
                        else if (gameMode === 'PRIVILEGE_ACTION') isTarget = !isGold;
                        else if (gameMode === 'BONUS_ACTION')
                            isTarget = gem.type.id === bonusGemTarget?.id;
                        const isEmpty = gem.type.id === 'empty';
                        const isReviewOrOver = gameMode === 'REVIEW' || gameMode === 'GAME_OVER';
                        const isInteractive = !isEmpty && !isReviewOrOver;
                        return (
                            <button
                                key={`${r}-${c}-${gem.uid || 'null'}`}
                                onClick={() => handleGemClick(r, c)}
                                disabled={!isInteractive}
                                className={`relative group w-full h-full rounded-full flex items-center justify-center transition-all duration-150 ${!isInteractive ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
                            >
                                {isEmpty ? (
                                    <div
                                        className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-300/50'}`}
                                    ></div>
                                ) : (
                                    <div
                                        className={`w-full h-full rounded-full shadow-inner bg-gradient-to-br ${gem.type.color} border ${gem.type.border} 
                                    ${isSelectedGem ? 'ring-2 ring-white scale-105 shadow-[0_0_10px_white]' : 'opacity-90'} 
                                    ${isTarget ? 'ring-4 ring-white animate-pulse z-20' : ''}
                                    ${!isEmpty && gameMode !== 'IDLE' && !isReviewOrOver && !isTarget ? 'opacity-20 grayscale' : ''}
                                `}
                                    >
                                        {isGold && (
                                            <div className="absolute inset-0 flex items-center justify-center text-yellow-900 font-bold text-xs opacity-50">
                                                G
                                            </div>
                                        )}
                                        {isSelectedGem && (
                                            <div className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-md text-lg">
                                                {selectedGems.findIndex(
                                                    (s) => s.r === r && s.c === c
                                                ) + 1}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};
