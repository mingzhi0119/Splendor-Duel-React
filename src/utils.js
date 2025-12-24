import { GEM_TYPES, INITIAL_COUNTS, BONUS_COLORS } from './constants';

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

// 生成随机造价 (辅助函数)
const generateRandomCost = (level) => {
  const cost = {};
  const totalCost = level === 1 ? 2 : level === 2 ? 5 : 8;
  const colors = [...BONUS_COLORS].sort(() => 0.5 - Math.random()).slice(0, 2);
  let remaining = totalCost;
  colors.forEach(color => {
    if (remaining > 0) {
      const amt = Math.ceil(Math.random() * (remaining / 2));
      cost[color] = amt;
      remaining -= amt;
    }
  });
  if (remaining > 0) cost[colors[0]] = (cost[colors[0]] || 0) + remaining;
  return cost;
};

// 生成卡组
export const generateDeck = (level, count = 12) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `l${level}-${i}-${Date.now()}`,
    level,
    points: level === 1 ? (Math.random() > 0.7 ? 1 : 0) : level === 2 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 4) + 3,
    crowns: Math.random() > 0.8 ? 1 : 0,
    bonusColor: BONUS_COLORS[Math.floor(Math.random() * BONUS_COLORS.length)],
    cost: generateRandomCost(level),
  }));
};

// 计算买卡逻辑
export const calculateCost = (card, pid, inventories, playerTableau) => {
  const inv = inventories[pid];
  const bonuses = BONUS_COLORS.reduce((acc, color) => { acc[color] = playerTableau[pid].filter(c => c.bonusColor === color).length; return acc; }, {});
  let totalGoldNeeded = 0;
  for (const [color, costAmt] of Object.entries(card.cost)) {
    const discount = bonuses[color] || 0;
    const actualCost = Math.max(0, costAmt - discount);
    const playerGemCount = inv[color] || 0;
    if (playerGemCount < actualCost) {
      totalGoldNeeded += (actualCost - playerGemCount);
    }
  }
  return totalGoldNeeded <= (inv.gold || 0);
};