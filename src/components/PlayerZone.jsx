import React from 'react';
import { Shield, Layers, Scroll, Crown } from 'lucide-react'; // 引入 Crown
import { GEM_TYPES, BONUS_COLORS } from '../constants';
import { GemIcon } from './GemIcon';
import { Card } from './Card';

const BonusCardIcon = ({ color, count }) => {
    const type = GEM_TYPES[color.toUpperCase()];
    if (!type || count === 0) return null;
    return (
        <div className={`relative w-8 h-10 rounded border ${type.border} bg-gradient-to-br ${type.color} shadow-sm flex items-center justify-center`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <span className="relative text-white font-bold text-sm drop-shadow-md">{count}</span>
        </div>
    );
};

export const PlayerZone = ({ player, inventory, cards, reserved, privileges, isActive, score, onBuyReserved, onUsePrivilege, isPrivilegeMode }) => {
  const bonuses = BONUS_COLORS.reduce((acc, color) => { acc[color] = cards.filter(c => c.bonusColor === color).length; return acc; }, {});
  
  // 🟢 修复1: 计算皇冠总数
  const totalCrowns = cards.reduce((acc, c) => acc + (c.crowns || 0), 0);

  return (
    <div className={`flex w-full flex-col p-3 rounded-xl transition-colors duration-300 gap-3 ${isActive ? 'bg-slate-800 ring-1 ring-emerald-500/50 shadow-lg' : 'bg-slate-900/40'}`}>
      
      {/* Header: Stats & Privileges */}
      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-slate-700'}`}><Shield size={16} className="text-white" /></div>
          <h3 className={`font-bold text-sm ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>{player === 'p1' ? 'Player 1' : 'Player 2'}</h3>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Privilege Scrolls */}
            <div className="flex items-center gap-1">
                {Array.from({ length: Math.max(0, privileges) }).map((_, i) => (
                    <button 
                        key={i}
                        disabled={!isActive || isPrivilegeMode}
                        onClick={onUsePrivilege}
                        className={`text-amber-200 transition-all ${isActive && !isPrivilegeMode ? 'hover:scale-110 hover:text-amber-100 cursor-pointer animate-pulse' : 'opacity-80 cursor-default'}`}
                        title={isActive ? "Click to Use Privilege" : "Privilege Scroll"}
                    >
                        <Scroll size={18} fill={isActive ? "#fcd34d" : "none"} />
                    </button>
                ))}
                {privileges === 0 && <Scroll size={18} className="text-slate-700" />}
            </div>

            {/* 🟢 修复1: 显示皇冠和分数 */}
            <div className="flex gap-3 text-sm font-bold text-white">
                <div className="flex items-center gap-1 text-yellow-400" title="Crowns">
                    <Crown size={16} fill="currentColor" />
                    <span>{totalCrowns}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-lg">{score}</span> 
                    <span className="text-[10px] text-slate-400 uppercase">Pts</span>
                </div>
            </div>
        </div>
      </div>

      {/* Row 1: Gems Inventory */}
      <div className="flex gap-2 bg-slate-950/30 p-2 rounded-lg">
        {Object.values(GEM_TYPES).filter(g => g.id !== 'empty').map((gem) => (
           <GemIcon key={gem.id} type={gem} size="w-8 h-8" count={inventory[gem.id]||0} className={(inventory[gem.id]||0) === 0 ? 'grayscale opacity-30' : ''} />
        ))}
      </div>

      {/* Row 2: Built Bonuses (Tableau) */}
      <div className="flex gap-2 items-center">
          <Layers size={14} className="text-slate-500" />
          <div className="flex gap-1">
            {BONUS_COLORS.map(color => (
                <BonusCardIcon key={color} color={color} count={bonuses[color] || 0} />
            ))}
            {cards.length === 0 && <span className="text-xs text-slate-600 italic">No built cards</span>}
          </div>
      </div>

      {/* 🟢 修复2: 保留区显示 (Reserved Cards) */}
      {reserved.length > 0 && (
          <div className="border-t border-slate-700/50 pt-2">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Reserved Hand ({reserved.length}/3)</div>
            {/* 移除重叠样式，改为正常的滚动布局，确保卡牌可见且可点击 */}
            <div className="flex gap-3 overflow-x-auto pb-2 min-h-[140px] items-center">
                {reserved.map((card, i) => (
                    <div key={i} className="flex-shrink-0">
                        <Card 
                            card={card} 
                            canBuy={isActive && onBuyReserved(card)}
                            // 如果是当前回合且买得起，传递点击事件
                            onClick={() => isActive && onBuyReserved(card) && onBuyReserved(card, true)}
                            isReservedView={true}
                        />
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
};