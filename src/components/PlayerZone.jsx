import React, { useState, useEffect, useRef } from 'react';
import { Shield, Layers, Scroll, Swords } from 'lucide-react';
import { GEM_TYPES, BONUS_COLORS } from '../constants';
import { GemIcon } from './GemIcon';
import { Card } from './Card';
import { FloatingText, CrownFlash } from './VisualFeedback';

export const PlayerZone = ({ player, inventory, cards, reserved, royals = [], privileges, isActive, lastFeedback, onBuyReserved, onUsePrivilege, isPrivilegeMode, onGemClick, isStealMode, isDiscardMode, theme }) => {
  
  const safeCards = Array.isArray(cards) ? cards : [];
  const safeRoyals = Array.isArray(royals) ? royals : [];

  // --- Visual Feedback Logic ---
  const [feedbacks, setFeedbacks] = useState([]);
  const lastSeenFeedbackUid = useRef(null);

  useEffect(() => {
      if (lastFeedback && lastFeedback.uid !== lastSeenFeedbackUid.current) {
          lastSeenFeedbackUid.current = lastFeedback.uid;
          const myItems = lastFeedback.items.filter(item => item.player === player);
          myItems.forEach(item => {
              const id = Date.now() + Math.random();
              const label = item.type.charAt(0).toUpperCase() + item.type.slice(1);
              const quantity = item.diff > 0 ? `+${item.diff}` : `${item.diff}`;
              setFeedbacks(prev => [...prev, { id, quantity, label, type: item.type }]);
              setTimeout(() => setFeedbacks(prev => prev.filter(f => f.id !== id)), 1500);
          });
      }
  }, [lastFeedback, player]);

  const colorStats = BONUS_COLORS.reduce((acc, color) => {
      const colorCards = safeCards.filter(c => c.bonusColor === color);
      acc[color] = {
          cards: colorCards,
          bonusCount: colorCards.reduce((sum, c) => sum + (c.bonusCount || 1), 0),
          points: colorCards.reduce((sum, c) => sum + c.points, 0)
      };
      return acc;
  }, {});

  return (
    <div className={`flex w-full h-full flex-row items-center p-4 transition-all duration-500 gap-4
        ${isActive 
            ? (theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80') 
            : (theme === 'dark' ? 'bg-slate-950/40 opacity-90' : 'bg-slate-100/40 opacity-90')
        }
        ${isActive ? `ring-1 ${player === 'p1' ? 'ring-emerald-500/30' : 'ring-blue-500/30'}` : ''} 
        ${isStealMode ? 'ring-2 ring-rose-500 animate-pulse' : ''}
        ${isDiscardMode && isActive ? 'ring-2 ring-red-500 animate-pulse' : ''}
    `}>
      
      {/* Module 1: Identity & Privileges */}
      <div className={`flex flex-col gap-3 min-w-[80px] shrink-0 items-center justify-center border-r pr-4 transition-colors duration-500
          ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}
      `}>
          <div className="flex flex-col items-center gap-1">
             <div className={`p-2 rounded-full shadow-lg ${isActive ? (player === 'p1' ? 'bg-emerald-600 shadow-emerald-900/50' : 'bg-blue-600 shadow-blue-900/50') : (theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300')}`}>
                 {player === 'p1' ? <Shield size={20} className={theme === 'dark' || isActive ? "text-white" : "text-slate-600"} /> : <Swords size={20} className={theme === 'dark' || isActive ? "text-white" : "text-slate-600"} />}
             </div>
             <h3 className={`font-bold text-xs whitespace-nowrap uppercase tracking-wider ${isActive ? (player === 'p1' ? 'text-emerald-400' : 'text-blue-400') : 'text-slate-500'}`}>
                 {player === 'p1' ? 'Player 1' : 'Player 2'}
             </h3>
          </div>
          <div className="flex items-center gap-1 justify-center flex-wrap max-w-[80px]">
                {Array.from({ length: Math.max(0, privileges) }).map((_, i) => (
                    <button 
                        key={i}
                        disabled={!isActive || isPrivilegeMode}
                        onClick={onUsePrivilege}
                        className={`text-amber-200 transition-all ${isActive && !isPrivilegeMode ? 'hover:scale-110 hover:text-amber-100 cursor-pointer animate-pulse' : 'opacity-80 cursor-default'}`}
                    >
                        <Scroll size={16} fill={isActive ? "#fcd34d" : "none"} className={theme === 'dark' ? 'text-amber-200' : 'text-amber-500'} />
                    </button>
                ))}
                {privileges === 0 && <Scroll size={16} className={theme === 'dark' ? 'text-slate-800' : 'text-slate-300'} />}
          </div>
      </div>

      {/* Module 2: Resources (Inventory & Stacks) */}
      <div className="flex flex-col gap-3 shrink-0 justify-center" style={{ flex: 65 }}>
          {/* Gems Row */}
          <div className="flex gap-3 justify-center">
            {Object.values(GEM_TYPES).filter(g => g.id !== 'empty').map((gem) => {
                const count = inventory[gem.id] || 0;
                const isClickable = (isStealMode && count > 0 && gem.id !== 'gold') || (isDiscardMode && count > 0);

                return (
                    <div 
                    key={gem.id} 
                    onClick={() => isClickable && onGemClick && onGemClick(gem.id)}
                    className={`relative transition-all group ${isClickable ? 'cursor-pointer hover:scale-110 active:scale-95 ring-2 ring-rose-500 rounded-full' : ''}`}
                    >
                        {feedbacks.filter(f => f.type === gem.id).map(f => <FloatingText key={f.id} quantity={f.quantity} label={f.label} />)}
                        <GemIcon type={gem} size="w-10 h-10" count={count} className={count === 0 ? 'grayscale opacity-30' : 'shadow-lg'} />
                    </div>
                );
            })}
          </div>
          
          {/* Card Stacks & Bonuses */}
          <div className="flex gap-3 items-start justify-center mt-1">
              <Layers size={14} className="text-slate-600 mr-1 mt-1" />
              {BONUS_COLORS.map(color => {
                  const stats = colorStats[color];
                  const type = GEM_TYPES[color.toUpperCase()];
                  
                  return (
                      <div key={color} className="flex flex-col items-center gap-1 min-w-[32px]">
                          <div className="relative w-14 h-20 group/stack">
                              {stats.cards.length > 0 ? (
                                  stats.cards.map((card, idx) => (
                                      <div 
                                          key={idx}
                                          className={`absolute w-14 h-20 rounded border ${type.border} bg-gradient-to-br ${type.color} shadow-sm flex items-center justify-center transition-all duration-200 z-0`}
                                          style={{ top: `${idx * -2}px`, left: `${idx * 1}px` }}
                                      >
                                          {card.points > 0 && <span className="absolute top-0.5 right-0.5 text-[6px] font-bold text-white leading-none drop-shadow-md">{card.points}</span>}
                                      </div>
                                  ))
                              ) : (
                                  <div className={`w-14 h-20 rounded border ${theme === 'dark' ? 'border-slate-800 bg-slate-900/20' : 'border-slate-300 bg-slate-200/20'}`}></div>
                              )}
                              {stats.bonusCount > 0 && <div className={`absolute -bottom-2 -right-2 text-[9px] font-bold px-1 rounded-full border z-10 shadow-md ${theme === 'dark' ? 'bg-slate-950 text-white border-slate-700' : 'bg-white text-slate-800 border-slate-300'}`}>{stats.bonusCount}</div>}
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>

      {/* Module 3: Reserved & Royals (Compact) */}
      <div className={`flex flex-col justify-center gap-2 border-l pl-4 min-w-0 transition-colors duration-500
          ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}
      `} style={{ flex: 35 }}>
          {/* Reserved Section - No Stacking */}
          <div className="w-full flex items-center justify-start gap-2 overflow-x-auto py-1">
              {reserved.length === 0 && <span className="text-[10px] text-slate-700 italic w-full text-center">No Reserved Cards</span>}
              {reserved.map((card, i) => (
                  <div key={i} className="transition-transform duration-200 ease-in-out shrink-0">
                      <Card 
                          card={card} 
                          canBuy={isActive && onBuyReserved(card)}
                          onClick={() => isActive && onBuyReserved(card) && onBuyReserved(card, true)}
                          isReservedView={true}
                          size="small"
                      />
                  </div>
              ))}
          </div>
          
          {/* Royal Section - No Stacking */}
          <div className="w-full flex items-center justify-start gap-2 overflow-x-auto py-1">
              {safeRoyals.length === 0 && <span className="text-[10px] text-slate-700 italic w-full text-center">No Royal Cards</span>}
              {safeRoyals.map((card, i) => (
                  <div 
                      key={i} 
                      className="transition-transform duration-200 ease-in-out shrink-0"
                  >
                      <Card card={card} isRoyal={true} size="small" />
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};
