import { GEM_TYPES, INITIAL_COUNTS, BONUS_COLORS } from './constants';
// 🟢 确保引入了真实数据
import { REAL_CARDS } from './data/realCards';

// 洗牌算法
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 生成初始宝石袋
export const generateGemPool = () => {
  let pool = [];
  Object.entries(INITIAL_COUNTS).forEach(([typeKey, count]) => {
    for (let i = 0; i < count; i++) {
      pool.push({
        uid: `${typeKey}-${i}-${Date.now()}`,
        type: GEM_TYPES[typeKey.toUpperCase()],
      });
    }
  });
  return shuffleArray(pool);
};

// 检查相邻
export const isAdjacent = (r1, c1, r2, c2) => {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
};

// 获取连线方向
export const getDirection = (r1, c1, r2, c2) => {
  return { dr: r2 - r1, dc: c2 - c1 };
};

// 🟢 生成卡组：使用 REAL_CARDS
export const generateDeck = (level) => {
  // 严格过滤：只取对应 Level 的卡
  // 注意：我们在 realCards.js 里已经硬编码了 level: 1, 2, 3，这里过滤绝对安全
  const levelCards = REAL_CARDS.filter(c => c.level === level);
  
  const deck = levelCards.map(card => ({
    ...card,
    id: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  }));
  
  return shuffleArray(deck);
};

// 🟢 计算买卡逻辑 (支持 bonusCount 双倍加成)
export const calculateCost = (card, pid, inventories, playerTableau) => {
  const inv = inventories[pid];
  
  // 计算玩家已有的宝石加成 (累加 bonusCount)
  const bonuses = BONUS_COLORS.reduce((acc, color) => { 
    acc[color] = playerTableau[pid]
      .filter(c => c.bonusColor === color)
      .reduce((sum, c) => sum + (c.bonusCount || 1), 0);
    return acc; 
  }, {});

  let totalGoldNeeded = 0;
  for (const [color, costAmt] of Object.entries(card.cost)) {
    // 珍珠没有折扣
    const discount = color === 'pearl' ? 0 : (bonuses[color] || 0);
    const actualCost = Math.max(0, costAmt - discount);
    const playerGemCount = inv[color] || 0;
    
    if (playerGemCount < actualCost) {
      totalGoldNeeded += (actualCost - playerGemCount);
    }
  }
  return totalGoldNeeded <= (inv.gold || 0);
};