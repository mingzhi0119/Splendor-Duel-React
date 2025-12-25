import React, { useState, useEffect, useRef } from 'react';
import { Shield, Layers, Scroll, Crown } from 'lucide-react';
import { GEM_TYPES, BONUS_COLORS } from '../constants';
import { GemIcon } from './GemIcon';
import { Card } from './Card';
import { FloatingText, CrownFlash } from './VisualFeedback';

export const PlayerZone = ({ player, inventory, cards, reserved, royals = [], privileges, isActive, score, crowns, lastFeedback, onBuyReserved, onUsePrivilege, isPrivilegeMode, onGemClick, isStealMode, isDiscardMode }) => {
  
  // 容错处理：确保 cards 和 royals 是数组
  const safeCards = Array.isArray(cards) ? cards : [];
  const safeRoyals = Array.isArray(royals) ? royals : [];

  // --- Visual Feedback Logic ---
  const [feedbacks, setFeedbacks] = useState([]);
  const [showCrownFlash, setShowCrownFlash] = useState(false);
  
  const lastSeenFeedbackUid = useRef(null);
  const prevCrowns = useRef(0); // Initialize later based on calc

  const totalCrowns = crowns !== undefined ? crowns : [...safeCards, ...safeRoyals].reduce((acc, c) => acc + (c.crowns || 0), 0);

  useEffect(() => {
      // Event-driven feedback for Gems (Pearl/Gold/Steal)
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

      // Check Crown Gain
      if (totalCrowns > prevCrowns.current) {
          setShowCrownFlash(true);
          setTimeout(() => setShowCrownFlash(false), 800);
      }
      prevCrowns.current = totalCrowns;
  }, [lastFeedback, totalCrowns, player]);

  // Group cards by color and calculate stats
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
    <div className={`flex w-full flex-row items-center p-3 rounded-xl transition-colors duration-300 gap-6 
        ${isActive ? 'bg-slate-800 ring-1 ring-emerald-500/50 shadow-lg' : 'bg-slate-900/40'} 
        ${isStealMode ? 'ring-2 ring-rose-500 animate-pulse' : ''}
        ${isDiscardMode && isActive ? 'ring-2 ring-red-500 animate-pulse' : ''}
        min-h-[160px]
    `}>
      <style>
        {`
          @keyframes winningGlow {
            0% { text-shadow: 0 0 5px rgba(250, 204, 21, 0.5); filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.5)); transform: scale(1); }
            50% { text-shadow: 0 0 20px rgba(250, 204, 21, 1); filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.8)); transform: scale(1.1); }
            100% { text-shadow: 0 0 5px rgba(250, 204, 21, 0.5); filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.5)); transform: scale(1); }
          }
          .winning-glow { animation: winningGlow 2s infinite ease-in-out; color: #facc15; }
        `}
      </style>
      
      {/* Module 1: Identity & Privileges */}
      <div className="flex flex-col gap-2 min-w-[100px] shrink-0">
          <div className="flex items-center gap-2">
             <div className={`p-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-slate-700'}`}><Shield size={16} className="text-white" /></div>
             <h3 className={`font-bold text-base whitespace-nowrap ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                 {player === 'p1' ? 'Player 1' : 'Player 2'}
             </h3>
          </div>
          <div className="flex items-center gap-1 pl-1">
                {Array.from({ length: Math.max(0, privileges) }).map((_, i) => (
                    <button 
                        key={i}
                        disabled={!isActive || isPrivilegeMode}
                        onClick={onUsePrivilege}
                        className={`text-amber-200 transition-all ${isActive && !isPrivilegeMode ? 'hover:scale-110 hover:text-amber-100 cursor-pointer animate-pulse' : 'opacity-80 cursor-default'}`}
                    >
                        <Scroll size={20} fill={isActive ? "#fcd34d" : "none"} />
                    </button>
                ))}
                {privileges === 0 && <Scroll size={20} className="text-slate-700/50" />}
          </div>
      </div>

      {/* Module 2: Stats (Score & Crowns) */}
      <div className="flex flex-row gap-8 items-center shrink-0 border-l border-slate-700/50 pl-4 h-full">
            <div className="flex items-center gap-2">
                <span className={`text-4xl font-black text-white leading-none drop-shadow-lg ${score >= 15 ? 'winning-glow' : ''}`}>{score}</span> 
                <span className="text-[10px] text-slate-400 uppercase font-bold mt-2 tracking-wider">Pts</span>
            </div>
            
            <div className="w-[1px] h-8 bg-slate-700/50"></div>

            <div className={`relative flex items-center gap-2 text-yellow-400 ${totalCrowns >= 7 ? 'winning-glow' : ''}`} title="Crowns">
                {showCrownFlash && <CrownFlash />}
                <Crown size={22} fill="currentColor" className="drop-shadow-md" />
                <span className="font-bold text-2xl">{totalCrowns}</span>
            </div>
      </div>

      {/* Module 3: Resources */}
      <div className="flex flex-col gap-3 border-l border-slate-700/50 pl-4 shrink-0 justify-center">
          <div className="flex gap-2">
            {Object.values(GEM_TYPES).filter(g => g.id !== 'empty').map((gem) => {
                const count = inventory[gem.id] || 0;
                
                // 如果是偷窃模式：只能点非黄金
                // 如果是弃牌模式：只要我有这个宝石就能点
                const isClickable = (isStealMode && count > 0 && gem.id !== 'gold') || (isDiscardMode && count > 0);

                return (
                    <div 
                    key={gem.id} 
                    onClick={() => isClickable && onGemClick && onGemClick(gem.id)}
                    className={`relative transition-all ${isClickable ? 'cursor-pointer hover:scale-110 active:scale-95 ring-2 ring-rose-500 rounded-full' : ''}`}
                    >
                        {feedbacks.filter(f => f.type === gem.id).map(f => <FloatingText key={f.id} quantity={f.quantity} label={f.label} />)}
                        <GemIcon type={gem} size="w-8 h-8" count={count} className={count === 0 ? 'grayscale opacity-20' : ''} />
                    </div>
                );
            })}
          </div>
          
          {/* Card Stacks & Color Points */}
          <div className="flex gap-2 items-start mt-2">
              <Layers size={14} className="text-slate-600 mr-1 mt-1" />
              {BONUS_COLORS.map(color => {
                  const stats = colorStats[color];
                  const type = GEM_TYPES[color.toUpperCase()];
                  
                  return (
                      <div key={color} className="flex flex-col items-center gap-1 min-w-[32px]">
                          {/* Stacked Cards */}
                          <div className="relative w-8 h-10 group/stack">
                              {stats.cards.length > 0 ? (
                                  stats.cards.map((card, idx) => (
                                      <div 
                                          key={idx}
                                          className={`absolute w-8 h-10 rounded border ${type.border} bg-gradient-to-br ${type.color} shadow-sm flex items-center justify-center transition-all duration-200 hover:z-50 hover:scale-150 hover:-translate-y-4 origin-bottom`}
                                          style={{ top: `${idx * -2}px`, left: `${idx * 1}px` }}
                                      >
                                          <div className="absolute inset-0 bg-black/10"></div>
                                          {/* Show points on card if > 0 */}
                                          {card.points > 0 && <span className="absolute top-0.5 right-0.5 text-[8px] font-bold text-white leading-none drop-shadow-md">{card.points}</span>}
                                      </div>
                                  ))
                              ) : (
                                  <div className="w-8 h-10 rounded border border-slate-700/30 bg-slate-800/20"></div>
                              )}
                              
                              {/* Total Bonus Count Overlay */}
                              {stats.bonusCount > 0 && <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[10px] font-bold px-1 rounded-full border border-slate-600 z-10 shadow-md">{stats.bonusCount}</div>}
                          </div>

                          {/* Color Points */}
                          <div className={`text-[10px] font-bold ${stats.points >= 10 ? 'text-yellow-400 animate-pulse' : 'text-slate-500'}`}>{stats.points} pts</div>
                      </div>
                  );
              })}
          </div>
      </div>

      {/* Module 4: Cards (Reserved & Royal) */}
      <div className="flex items-center flex-1 justify-end gap-8 border-l border-slate-700/50 pl-6 py-1">
          
          {/* Reserved Section */}
          <div className="flex flex-col items-start gap-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Reserved ({reserved.length}/3)</div>
              
              <div className="flex gap-3 items-center">
                 {reserved.length === 0 && (
                     <div className="w-24 h-32 rounded-lg border-2 border-dashed border-slate-700/50 bg-slate-900/20 flex items-center justify-center text-slate-600 text-[10px] font-medium shrink-0">
                        Empty
                     </div>
                 )}
                 
                 {reserved.map((card, i) => (
                    <div key={i} className="transition-transform hover:-translate-y-2 duration-300 shrink-0">
                        <Card 
                            card={card} 
                            canBuy={isActive && onBuyReserved(card)}
                            onClick={() => isActive && onBuyReserved(card) && onBuyReserved(card, true)}
                            isReservedView={true}
                        />
                    </div>
                 ))}
              </div>
          </div>

          {/* Royal Section */}
          {(safeRoyals.length > 0) && (
             <div className="flex flex-col items-start gap-2 border-l border-slate-700/30 pl-6">
                <div className="text-[10px] text-yellow-600 uppercase font-bold tracking-wider flex items-center gap-1"><Crown size={12}/> Royals</div>
                <div className="flex gap-3 items-center">
                    {safeRoyals.map((card, i) => (
                        <div key={i} className="transition-transform hover:-translate-y-2 duration-300 shrink-0">
                            <Card card={card} isRoyal={true} />
                        </div>
                    ))}
                </div>
             </div>
          )}

      </div>

    </div>
  );
};