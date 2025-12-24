import React from 'react';
import { Crown, Download } from 'lucide-react';
import { GEM_TYPES } from '../constants';
import { GemIcon } from './GemIcon';

export const Card = ({ card, canBuy, onClick, onReserve, isReservedView = false }) => {
  if (!card) return <div className="w-24 h-32 bg-slate-800/50 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs">Empty</div>;
  
  const bgGradient = card.level === 1 ? 'from-slate-700 to-slate-800' : card.level === 2 ? 'from-yellow-900/40 to-slate-800' : 'from-blue-900/40 to-slate-800';
  
  // 🟢 优化: 如果能买，整个卡片都可以点击
  const handleCardClick = () => {
      if (canBuy && onClick) {
          onClick();
      }
  };

  return (
    <div 
        onClick={handleCardClick}
        className={`relative w-24 h-32 rounded-lg border flex flex-col p-2 transition-all duration-200 bg-gradient-to-b ${bgGradient}
        ${canBuy ? 'border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] cursor-pointer hover:scale-105' : 'border-slate-600 opacity-90 cursor-default'}
    `}>
      {/* Header */}
      <div className="flex justify-between items-start mb-1 pointer-events-none">
        <span className="font-bold text-white text-lg drop-shadow-md">{card.points > 0 ? card.points : ''}</span>
        <div className="flex flex-col items-end gap-1">
          <GemIcon type={GEM_TYPES[card.bonusColor.toUpperCase()]} size="w-5 h-5" />
          {card.crowns > 0 && <Crown size={12} className="text-yellow-400" />}
        </div>
      </div>
      
      {/* Middle / Reserve Button */}
      <div className="flex-grow flex items-center justify-center">
         {!isReservedView && onReserve && (
             <button 
                onClick={(e) => { e.stopPropagation(); onReserve(card); }}
                className="opacity-0 hover:opacity-100 bg-yellow-500/80 p-1.5 rounded-full text-white shadow-lg transition-opacity hover:scale-110"
                title="Reserve"
             >
                 <Download size={16} />
             </button>
         )}
      </div>

      {/* Footer: Cost */}
      <div className={`bg-slate-900/80 rounded p-1 backdrop-blur-sm w-full text-center transition-colors ${canBuy ? 'bg-emerald-900/40' : ''}`}>
        <div className="flex flex-wrap gap-1 justify-center pointer-events-none">
          {Object.entries(card.cost).map(([color, amt]) => (
            <div key={color} className={`relative flex items-center justify-center w-5 h-5 rounded-full border ${GEM_TYPES[color.toUpperCase()].border} bg-slate-800`}>
               <span className={`text-[10px] font-bold text-${color}-200 z-10`}>{amt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};