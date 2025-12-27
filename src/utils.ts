import { GEM_TYPES, INITIAL_COUNTS, BONUS_COLORS } from './constants';
// 🟢 确保引入了真实数据
import { REAL_CARDS } from './data/realCards';
import { Card, GemInventory, Buff, BoardCell, GemColor } from './types';

// 洗牌算法
export const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j] as T, newArray[i] as T];
    }
    return newArray;
};

// 生成初始宝石袋
export const generateGemPool = (): BoardCell[] => {
    const pool: BoardCell[] = [];
    Object.entries(INITIAL_COUNTS).forEach(([typeKey, count]) => {
        for (let i = 0; i < count; i++) {
            pool.push({
                uid: `${typeKey}-${i}-${Date.now()}`,
                type: (GEM_TYPES as any)[typeKey.toUpperCase()],
            });
        }
    });
    return shuffleArray(pool);
};

// 检查相邻
export const isAdjacent = (r1: number, c1: number, r2: number, c2: number): boolean => {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
};

// 获取连线方向
export const getDirection = (r1: number, c1: number, r2: number, c2: number) => {
    return { dr: r2 - r1, dc: c2 - c1 };
};

// 🟢 生成卡组：使用 REAL_CARDS
export const generateDeck = (level: number): Card[] => {
    // 严格过滤：只取对应 Level 的卡
    // 注意：我们在 realCards.js 里已经硬编码了 level: 1, 2, 3，这里过滤绝对安全
    const levelCards = REAL_CARDS.filter((c) => c.level === level);

    const deck = levelCards.map((card) => ({
        ...(card as Card),
        id: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    }));

    return shuffleArray(deck);
};

// 🟢 Unified Transaction Calculator (Used by Hook and Reducer)
export const calculateTransaction = (
    card: Card,
    playerInv: GemInventory,
    playerTableau: Card[],
    playerBuffs: Buff | null = null
) => {
    const bonuses = BONUS_COLORS.reduce(
        (acc, color) => {
            acc[color] = playerTableau
                .filter((c) => c.bonusColor === color && !c.isBuff) // ✅ 排除虚拟卡
                .reduce((sum, c) => sum + (c.bonusCount || 1), 0);
            return acc;
        },
        {} as Record<GemColor, number>
    );

    const buffEffects = playerBuffs?.effects?.passive || {};

    // Flexible Discount: Only applies to Level 2 and 3 cards
    const discountAny = card.level === 2 || card.level === 3 ? buffEffects.discountAny || 0 : 0;
    const l3Discount = card.level === 3 && buffEffects.l3Discount ? buffEffects.l3Discount : 0;
    const totalFlatDiscount = discountAny + l3Discount;

    const rawCost: Record<string, number> = {};

    // 1. Apply Bonus Discounts
    Object.entries(card.cost).forEach(([color, cost]) => {
        let discount = 0;
        if (color !== 'pearl' && color !== 'gold') discount = bonuses[color as GemColor] || 0;
        // Note: Color Preference dummy card already adds to 'bonuses' in tableau, so no extra logic here.

        const needed = Math.max(0, cost - discount);
        rawCost[color] = needed;
    });

    // 2. Apply Flat Discounts (Buffs)
    let remainingDiscount = totalFlatDiscount;
    Object.keys(rawCost).forEach((color) => {
        if (remainingDiscount > 0 && rawCost[color] > 0) {
            const reduction = Math.min(rawCost[color], remainingDiscount);
            rawCost[color] -= reduction;
            remainingDiscount -= reduction;
        }
    });

    let goldCost = 0;
    const gemsPaid: Record<string, number> = {};

    // 3. Calculate Payment
    Object.entries(rawCost).forEach(([color, needed]) => {
        const available = playerInv[color] || 0;
        const paid = Math.min(needed, available);

        if (color !== 'gold') {
            gemsPaid[color] = paid;
            goldCost += needed - paid;
        }
    });

    // 4. All-Seeing Eye Gold Buff
    const isGoldBuff = buffEffects.goldBuff && card.level === 3;
    if (isGoldBuff) {
        goldCost = Math.ceil(goldCost / 2.0);
    }

    const affordable = (playerInv.gold || 0) >= goldCost;

    return { affordable, goldCost, gemsPaid };
};
