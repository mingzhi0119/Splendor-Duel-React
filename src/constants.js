import { RotateCcw, Hand, Scroll, Plus } from 'lucide-react';

export const GRID_SIZE = 5;

export const GEM_TYPES = {
  BLUE:  { id: 'blue',  color: 'from-blue-400 to-blue-700',     border: 'border-blue-300', label: 'Blue' },
  WHITE: { id: 'white', color: 'from-slate-100 to-slate-400',   border: 'border-white',    label: 'White' },
  GREEN: { id: 'green', color: 'from-emerald-400 to-emerald-700', border: 'border-emerald-300', label: 'Green' },
  BLACK: { id: 'black', color: 'from-slate-700 to-slate-900',   border: 'border-gray-500', label: 'Black' },
  RED:   { id: 'red',   color: 'from-red-400 to-red-700',       border: 'border-red-300',  label: 'Red' },
  PEARL: { id: 'pearl', color: 'from-pink-300 to-pink-500',     border: 'border-pink-300', label: 'Pearl' },
  GOLD:  { id: 'gold',  color: 'from-yellow-300 via-yellow-500 to-yellow-700', border: 'border-yellow-200', label: 'Gold' },
  EMPTY: { id: 'empty', color: 'bg-transparent', border: 'border-transparent', label: '' },
};

export const INITIAL_COUNTS = {
  red: 4, green: 4, blue: 4, black: 4, white: 4, pearl: 2, gold: 3,
};

export const BONUS_COLORS = ['blue', 'white', 'green', 'black', 'red'];

// 🌀 螺旋填充顺序 (之前如果缺了这个，刷新盘面会报错)
export const SPIRAL_ORDER = [
  [2, 2],
  [2, 3], [3, 3], [3, 2], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3],
  [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]
];

// ⚡ 特殊能力定义 (之前如果缺了这个，读取 realCards.js 会直接白屏)
export const ABILITIES = {
  AGAIN:     { id: 'again',     label: 'Play Again',     icon: RotateCcw },
  STEAL:     { id: 'steal',     label: 'Steal Gem',      icon: Hand },
  SCROLL:    { id: 'scroll',    label: 'Take Scroll',    icon: Scroll },
  BONUS_GEM: { id: 'bonus_gem', label: 'Take Gem',       icon: Plus },
  NONE:      { id: 'none',      label: '',               icon: null }
};

// 🟢 新增：皇室卡定义 (Royal Cards)
export const ROYAL_CARDS = [
  { id: 'royal-3pts', points: 3, bonusColor: 'gold', ability: 'none', label: 'The Queen' },
  { id: 'royal-again', points: 2, bonusColor: 'gold', ability: 'again', label: 'The Merchant' },
  { id: 'royal-scroll', points: 2, bonusColor: 'gold', ability: 'scroll', label: 'The Judge' },
  { id: 'royal-steal', points: 2, bonusColor: 'gold', ability: 'steal', label: 'The Thief' }
];