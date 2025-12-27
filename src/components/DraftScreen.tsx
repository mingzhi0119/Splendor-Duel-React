import React from 'react';
import { Sparkles, Crown, Shield, Swords, ArrowRight } from 'lucide-react';
import { BUFF_STYLES } from '../styles/buffs';
import { Buff, PlayerKey } from '../types';

interface DraftScreenProps {
    draftPool: Buff[];
    buffLevel: number;
    activePlayer: PlayerKey;
    onSelectBuff: (buffId: string) => void;
    theme: 'light' | 'dark';
}

export const DraftScreen: React.FC<DraftScreenProps> = ({
    draftPool,
    buffLevel,
    activePlayer,
    onSelectBuff,
    theme,
}) => {
    return (
        <div
            className={`h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500
            ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}
        `}
        >
            {/* Background Ambience */}
            <div
                className={`absolute inset-0 pointer-events-none opacity-20
                ${
                    theme === 'dark'
                        ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-950 to-slate-950'
                        : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-200/40 via-slate-100 to-slate-100'
                }
            `}
            />

            {/* Header */}
            <div className="z-10 text-center mb-12 animate-in slide-in-from-top-10 duration-700">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Sparkles className="text-amber-400" size={32} />
                    <h1 className="text-4xl font-black uppercase tracking-wider">
                        Roguelike Draft
                    </h1>
                    <Sparkles className="text-amber-400" size={32} />
                </div>
                <p className={`text-lg font-medium opacity-60`}>Level {buffLevel} Buff Selection</p>
            </div>

            {/* Active Player Indicator */}
            <div
                className={`z-10 mb-8 flex items-center gap-3 px-6 py-3 rounded-full border shadow-lg animate-pulse
                ${
                    activePlayer === 'p1'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-500'
                        : 'bg-blue-600/20 border-blue-500 text-blue-500'
                }
            `}
            >
                {activePlayer === 'p1' ? <Shield size={24} /> : <Swords size={24} />}
                <span className="text-xl font-bold uppercase">
                    {activePlayer === 'p1' ? 'Player 1 Selecting' : 'Player 2 Selecting'}
                </span>
            </div>

            {/* Buff Cards */}
            <div className="z-10 flex flex-col md:flex-row gap-6 max-w-6xl px-4">
                {draftPool.map((buff, idx) => (
                    <button
                        key={buff.id}
                        onClick={() => onSelectBuff(buff.id)}
                        className={`group relative flex flex-col w-72 h-96 p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl
                            ${BUFF_STYLES[buff.level]}
                            ${theme === 'dark' ? 'hover:shadow-purple-900/50' : 'hover:shadow-purple-200/50'}
                        `}
                        style={{ animationDelay: `${idx * 150}ms` }}
                    >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                                <Crown size={28} className="text-amber-300" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60 border px-2 py-1 rounded-full">
                                Lvl {buff.level}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-white transition-colors">
                            {buff.label}
                        </h3>

                        {/* Description */}
                        <p className="text-sm font-medium leading-relaxed opacity-80 mb-6 flex-grow">
                            {buff.desc}
                        </p>

                        {/* Win Condition Changes (if any) */}
                        {buff.effects.winCondition && (
                            <div className="mt-auto pt-4 border-t border-white/10 text-xs space-y-1 opacity-90">
                                <p className="font-bold uppercase opacity-60 mb-1">
                                    Win Condition Shift:
                                </p>
                                {buff.effects.winCondition.points && (
                                    <div className="flex justify-between">
                                        <span>Points:</span>
                                        <span className="font-mono font-bold text-amber-300">
                                            {buff.effects.winCondition.points}
                                        </span>
                                    </div>
                                )}
                                {buff.effects.winCondition.crowns && (
                                    <div className="flex justify-between">
                                        <span>Crowns:</span>
                                        <span className="font-mono font-bold text-amber-300">
                                            {buff.effects.winCondition.crowns}
                                        </span>
                                    </div>
                                )}
                                {buff.effects.winCondition.disableSingleColor && (
                                    <div className="text-rose-300 font-bold">
                                        Cannot win by Single Color
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Select Action */}
                        <div
                            className={`absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2 font-bold uppercase tracking-widest text-xs
                            ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                        `}
                        >
                            Select <ArrowRight size={16} />
                        </div>
                    </button>
                ))}
            </div>

            <div className="absolute bottom-8 text-xs opacity-30 z-10">
                P2 picks first to balance the first-move advantage.
            </div>
        </div>
    );
};
