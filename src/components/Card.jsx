import React from 'react';
import { Crown, Download, RotateCcw, Hand, Scroll, Plus } from 'lucide-react';
import { GEM_TYPES, ABILITIES } from '../constants';
import { GemIcon } from './GemIcon';

export const Card = ({ card, canBuy, onClick, onReserve, isReservedView = false, isRoyal = false }) => {
  // Empty State
  if (!card) return (
    <div className="w-24 h-32 bg-slate-800/50 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs">
      Empty
    </div>
  );
  
  // Background Gradient
  const bgGradient = isRoyal 
      ? 'from-yellow-600 to-amber-800 ring-2 ring-yellow-400/50' 
      : card.level === 1 ? 'from-slate-700 to-slate-800' 
      : card.level === 2 ? 'from-yellow-900/40 to-slate-800' 
      : 'from-blue-900/40 to-slate-800';
  
  const handleCardClick = () => {
      if ((canBuy || isRoyal) && onClick) {
          onClick();
      }
  };

  // Ability Icons
  const getAbilityContent = () => {
      let abilitiesList = [];
      if (Array.isArray(card.ability)) {
          abilitiesList = card.ability;
      } else if (card.ability && card.ability !== 'none') {
          abilitiesList = [card.ability];
      }

      if (abilitiesList.length === 0) return null;

      return (
          <div className="flex flex-row gap-0.5 mt-0.5">
              {abilitiesList.map((abilId, idx) => {
                  const iconProps = { size: 12, className: "text-white drop-shadow-md" };
                  let IconComponent = null;
                  let bgColor = "bg-slate-600";

                  switch (abilId) {
                      case ABILITIES.AGAIN.id:     IconComponent = RotateCcw; bgColor = "bg-amber-500"; break;
                      case ABILITIES.STEAL.id:     IconComponent = Hand;      bgColor = "bg-rose-500"; break;
                      case ABILITIES.SCROLL.id:    IconComponent = Scroll;    bgColor = "bg-purple-500"; break;
                      case ABILITIES.BONUS_GEM.id: IconComponent = Plus;      bgColor = "bg-emerald-500"; break;
                      default: return null;
                  }
                  if (!IconComponent) return null;

                  return (
                      <div key={idx} className={`p-0.5 rounded-md ${bgColor} shadow-md flex items-center justify-center`} title={abilId}>
                          <IconComponent {...iconProps} />
                      </div>
                  );
              })}
          </div>
      );
  };

  return (
    <div 
        onClick={handleCardClick}
        className={`relative w-24 h-32 rounded-lg border transition-all duration-200 bg-gradient-to-b ${bgGradient} overflow-hidden group
        ${(canBuy && !isRoyal) ? 'border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] cursor-pointer hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0' : 
          isRoyal ? 'border-yellow-700/50' : 'border-slate-600 opacity-90 cursor-default'}
    `}>
      
      {/* 1. Top Left: Points & Ability */}
      <div className="absolute top-1 left-1.5 flex flex-row items-center gap-1 pointer-events-none z-10">
        <span className={`font-bold text-white leading-none drop-shadow-md ${card.points > 0 ? 'text-lg' : 'text-sm opacity-0 hidden'}`}>
            {card.points > 0 ? card.points : '0'}
        </span>
        {getAbilityContent()}
      </div>

      {/* 2. Top Right: Bonus Gem */}
      <div className="absolute top-1 right-1 pointer-events-none flex flex-col gap-0.5 z-10">
          {Array.from({ length: card.bonusCount || (isRoyal ? 0 : 1) }).map((_, i) => (
             <GemIcon key={i} type={GEM_TYPES[card.bonusColor.toUpperCase()]} size="w-5 h-5" className="shadow-md" />
          ))}
      </div>

      {/* 3. Bottom Left: Cost */}
      {card.cost && (
          <div className="absolute bottom-1.5 left-1.5 pointer-events-none z-10">
            <div className="flex flex-col gap-0.5">
              {Object.entries(card.cost).map(([color, amt]) => (
                // 🟢 修复：min-w-[18px] min-h-[18px] 强制保持圆形
                <div key={color} className={`
                    relative flex items-center justify-center w-[18px] h-[18px] rounded-full shrink-0
                    bg-gradient-to-br ${GEM_TYPES[color.toUpperCase()].color} 
                    shadow-[0_1px_2px_rgba(0,0,0,0.5)] border border-white/10
                `}>
                  <span className="text-[9px] font-black text-white z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] leading-none">
                    {amt}
                  </span>
                </div>
              ))}
            </div>
          </div>
      )}

      {/* 4. Bottom Right: Crowns */}
      <div className="absolute bottom-1.5 right-1.5 pointer-events-none flex flex-col items-center gap-0.5 z-10">
          {card.crowns > 0 && Array.from({ length: card.crowns }).map((_, i) => (
             <Crown key={i} size={12} className="text-yellow-400 drop-shadow-md" fill="currentColor" />
          ))}
      </div>

      {/* 5. Royal Badge */}
      {isRoyal && (
          <div className="absolute bottom-2 left-2 pointer-events-none">
              <Crown size={24} className="text-white/20 -rotate-12" />
          </div>
      )}

      {/* 6. Reserve Button */}
      {!isReservedView && !isRoyal && onReserve && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 z-20">
             <button 
                onClick={(e) => { e.stopPropagation(); onReserve(card); }}
                className="bg-yellow-500 hover:bg-yellow-400 p-1.5 rounded-full text-white shadow-lg transition-transform hover:scale-110 active:scale-90"
                title="Reserve"
             >
                 <Download size={16} />
             </button>
        </div>
      )}
    </div>
  );
};