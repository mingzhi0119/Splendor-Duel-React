import React from 'react';
import { Shield, Layers, Scroll, Crown } from 'lucide-react';
import { GEM_TYPES, BONUS_COLORS } from '../constants';
import { GemIcon } from './GemIcon';
import { Card } from './Card';

const BonusCardIcon = ({ color, count }) => {
    const type = GEM_TYPES[color.toUpperCase()];
    if (!type || count === 0) return null;
    return (
        <div className={`relative w-6 h-8 rounded border ${type.border} bg-gradient-to-br ${type.color} shadow-sm flex items-center justify-center`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <span className="relative text-white font-bold text-xs drop-shadow-md">{count}</span>
        </div>
    );
};

// 🟢 确保这里的 props 包含 isDiscardMode
export const PlayerZone = ({ player, inventory, cards, reserved, royals = [], privileges, isActive, score, onBuyReserved, onUsePrivilege, isPrivilegeMode, onGemClick, isStealMode, isDiscardMode }) => {
  
  // 容错处理：确保 cards 和 royals 是数组
  const safeCards = Array.isArray(cards) ? cards : [];
  const safeRoyals = Array.isArray(royals) ? royals : [];

  const bonuses = BONUS_COLORS.reduce((acc, color) => { 
      acc[color] = safeCards
        .filter(c => c.bonusColor === color)
        .reduce((sum, c) => sum + (c.bonusCount || 1), 0);
      return acc; 
  }, {});

  const totalCrowns = [...safeCards, ...safeRoyals].reduce((acc, c) => acc + (c.crowns || 0), 0);

  return (
    <div className={`flex w-full flex-row items-center p-3 rounded-xl transition-colors duration-300 gap-6 
        ${isActive ? 'bg-slate-800 ring-1 ring-emerald-500/50 shadow-lg' : 'bg-slate-900/40'} 
        ${isStealMode ? 'ring-2 ring-rose-500 animate-pulse' : ''}
        ${isDiscardMode && isActive ? 'ring-2 ring-red-500 animate-pulse' : ''}
    `}>
      
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
                <span className="text-4xl font-black text-white leading-none drop-shadow-lg">{score}</span> 
                <span className="text-[10px] text-slate-400 uppercase font-bold mt-2 tracking-wider">Pts</span>
            </div>
            
            <div className="w-[1px] h-8 bg-slate-700/50"></div>

            <div className="flex items-center gap-2 text-yellow-400" title="Crowns">
                <Crown size={22} fill="currentColor" className="drop-shadow-md" />
                <span className="font-bold text-2xl">{totalCrowns}</span>
            </div>
      </div>

      {/* Module 3: Resources */}
      <div className="flex flex-col gap-3 border-l border-slate-700/50 pl-4 shrink-0 justify-center">
          <div className="flex gap-2">
            {Object.values(GEM_TYPES).filter(g => g.id !== 'empty').map((gem) => {
                const count = inventory[gem.id] || 0;
                
                // 🟢 修复：正确的点击判断逻辑
                // 如果是偷窃模式：只能点非黄金
                // 如果是弃牌模式：只要我有这个宝石就能点
                const isClickable = (isStealMode && count > 0 && gem.id !== 'gold') || (isDiscardMode && count > 0);

                return (
                    <div 
                    key={gem.id} 
                    onClick={() => isClickable && onGemClick && onGemClick(gem.id)}
                    className={`relative transition-all ${isClickable ? 'cursor-pointer hover:scale-110 ring-2 ring-rose-500 rounded-full' : ''}`}
                    >
                        <GemIcon type={gem} size="w-8 h-8" count={count} className={count === 0 ? 'grayscale opacity-20' : ''} />
                    </div>
                );
            })}
          </div>
          <div className="flex gap-1.5 items-center">
              <Layers size={14} className="text-slate-600 mr-1" />
              {BONUS_COLORS.map(color => (
                  <BonusCardIcon key={color} color={color} count={bonuses[color] || 0} />
              ))}
          </div>
      </div>

      {/* Module 4: Cards (Reserved & Royal) */}
      <div className="flex items-center flex-1 justify-end gap-8 border-l border-slate-700/50 pl-6 overflow-x-auto no-scrollbar py-1">
          
          {/* Reserved Section */}
          <div className="flex flex-col items-start gap-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Reserved ({reserved.length}/3)</div>
              
              <div className="flex gap-3 items-center">
                 {reserved.length === 0 && (
                     <div className="w-32 h-48 rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/30 flex items-center justify-center text-slate-700 text-xs font-medium">
                        Empty Slot
                     </div>
                 )}
                 
                 {reserved.map((card, i) => (
                    <div key={i} className="transition-transform hover:-translate-y-2 duration-300">
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
                        <div key={i} className="transition-transform hover:-translate-y-2 duration-300">
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