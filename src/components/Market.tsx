import React, { useCallback } from 'react';
import { Layers } from 'lucide-react';
import { Card } from './Card';
import { calculateTransaction } from '../utils';
import { Card as CardType, GamePhase, PlayerKey, GemInventory, Buff } from '../types';

interface MarketProps {
    market: Record<number, (CardType | null)[]>;
    decks: Record<number, CardType[]>;
    gameMode: GamePhase | string;
    turn: PlayerKey;
    inventories: Record<PlayerKey, GemInventory>;
    playerTableau: Record<PlayerKey, CardType[]>;
    playerBuffs: Record<PlayerKey, Buff>;
    handleReserveDeck: (level: number) => void;
    initiateBuy: (card: CardType, source: string, context?: any) => void;
    handleReserveCard: (card: CardType, level: number, idx: number) => void;
    theme: 'light' | 'dark';
}

export const Market: React.FC<MarketProps> = React.memo(
    ({
        market,
        decks,
        gameMode,
        turn,
        inventories,
        playerTableau,
        playerBuffs,
        handleReserveDeck,
        initiateBuy,
        handleReserveCard,
        theme,
    }) => {
        // Optimization: Stable callback for buying cards
        const handleBuy = useCallback(
            (card: CardType, context: any) => {
                if (card && context) {
                    initiateBuy(card, 'market', context);
                }
            },
            [initiateBuy]
        );

        // Optimization: Stable callback for reserving cards
        const handleReserve = useCallback(
            (card: CardType, context: any) => {
                if (card && context) {
                    handleReserveCard(card, context.level, context.idx);
                }
            },
            [handleReserveCard]
        );

        return (
            <div className="flex flex-col gap-4 items-center shrink-0 w-fit">
                <h2
                    className={`text-[10px] font-bold uppercase tracking-widest mb-1 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}
                >
                    Market
                </h2>
                {[3, 2, 1].map((lvl) => {
                    const pBuffs = playerBuffs?.[turn]?.effects?.passive || {};
                    const revealL1 = lvl === 1 && pBuffs.revealDeck1;
                    const revealL3 = lvl === 3 && pBuffs.extraL3;
                    const deck = decks[lvl];
                    const topCard = deck.length > 0 ? deck[deck.length - 1] : null;
                    const isRevealed = (revealL1 || revealL3) && topCard;

                    return (
                        <div key={lvl} className="flex gap-3 justify-center items-center">
                            <div
                                onClick={() => handleReserveDeck(lvl)}
                                className={`w-24 h-32 shrink-0 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 shadow-md relative overflow-hidden group
                            ${
                                gameMode === 'IDLE' && decks[lvl].length > 0
                                    ? (theme === 'dark'
                                          ? 'border-slate-600 hover:border-emerald-400'
                                          : 'border-slate-400 hover:border-emerald-500') +
                                      ' cursor-pointer hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0'
                                    : (theme === 'dark'
                                          ? 'border-slate-800 opacity-40'
                                          : 'border-slate-300 opacity-40') + ' cursor-default'
                            }
                        `}
                            >
                                <div
                                    className={`absolute inset-0 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`}
                                />

                                {isRevealed ? (
                                    <div className="absolute inset-0 z-10 p-1 pointer-events-none">
                                        {/* Use a scaled down version or custom renderer for the revealed card to ensure it fits and looks like "top of deck" */}
                                        <Card
                                            card={topCard}
                                            canBuy={false}
                                            theme={theme}
                                            isDeckPreview={true}
                                        />
                                    </div>
                                ) : (
                                    <div className="relative z-10 flex flex-col items-center">
                                        <Layers size={18} className="text-slate-500 mb-1" />
                                        <div className="text-slate-400 font-bold text-[10px]">
                                            Lvl {lvl}
                                        </div>
                                        <div className="text-slate-600 text-[9px] font-mono">
                                            {decks[lvl].length}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {market[lvl].map((card, i) => (
                                <Card
                                    key={i}
                                    card={card}
                                    // Optimization: Check affordability using unified logic
                                    canBuy={
                                        gameMode === 'IDLE' &&
                                        card !== null &&
                                        calculateTransaction(
                                            card,
                                            inventories[turn],
                                            playerTableau[turn],
                                            playerBuffs[turn]
                                        ).affordable
                                    }
                                    context={JSON.stringify({ level: lvl, idx: i })}
                                    onClick={handleBuy}
                                    onReserve={handleReserve}
                                    theme={theme}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    }
);
