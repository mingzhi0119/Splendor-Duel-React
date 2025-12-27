import { RotateCcw, Hand, Scroll, Plus } from 'lucide-react';
import { GemColor, RoyalCard, CardAbility } from './types';

export const GRID_SIZE = 5;

export const GAME_PHASES = {
    IDLE: 'IDLE',
    DRAFT_PHASE: 'DRAFT_PHASE',
    SELECT_ROYAL: 'SELECT_ROYAL',
    DISCARD_EXCESS_GEMS: 'DISCARD_EXCESS_GEMS',
    BONUS_ACTION: 'BONUS_ACTION',
    STEAL_ACTION: 'STEAL_ACTION',
    PRIVILEGE_ACTION: 'PRIVILEGE_ACTION',
    RESERVE_WAITING_GEM: 'RESERVE_WAITING_GEM',
    SELECT_CARD_COLOR: 'SELECT_CARD_COLOR',
} as const;

export const GEM_TYPES = {
    BLUE: {
        id: 'blue' as const,
        color: 'from-blue-400 to-blue-700',
        border: 'border-blue-300',
        label: 'Blue',
    },
    WHITE: {
        id: 'white' as const,
        color: 'from-slate-100 to-slate-400',
        border: 'border-white',
        label: 'White',
    },
    GREEN: {
        id: 'green' as const,
        color: 'from-emerald-400 to-emerald-700',
        border: 'border-emerald-300',
        label: 'Green',
    },
    BLACK: {
        id: 'black' as const,
        color: 'from-slate-700 to-slate-900',
        border: 'border-gray-500',
        label: 'Black',
    },
    RED: {
        id: 'red' as const,
        color: 'from-red-400 to-red-700',
        border: 'border-red-300',
        label: 'Red',
    },
    PEARL: {
        id: 'pearl' as const,
        color: 'from-pink-300 to-pink-500',
        border: 'border-pink-300',
        label: 'Pearl',
    },
    GOLD: {
        id: 'gold' as const,
        color: 'from-yellow-300 via-yellow-500 to-yellow-700',
        border: 'border-yellow-200',
        label: 'Gold',
    },
    EMPTY: {
        id: 'empty' as const,
        color: 'bg-transparent',
        border: 'border-transparent',
        label: '',
    },
} as const;

export const INITIAL_COUNTS: Record<string, number> = {
    red: 4,
    green: 4,
    blue: 4,
    black: 4,
    white: 4,
    pearl: 2,
    gold: 3,
};

export const BONUS_COLORS: GemColor[] = ['blue', 'white', 'green', 'black', 'red'];

// 🌀 螺旋填充顺序 (之前如果缺了这个，刷新盘面会报错)
export const SPIRAL_ORDER = [
    [2, 2],
    [2, 3],
    [3, 3],
    [3, 2],
    [3, 1],
    [2, 1],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 4],
    [4, 3],
    [4, 2],
    [4, 1],
    [4, 0],
    [3, 0],
    [2, 0],
    [1, 0],
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
];

// ⚡ 特殊能力定义 (之前如果缺了这个，读取 realCards.js 会直接白屏)
export const ABILITIES = {
    AGAIN: { id: 'again', label: 'Play Again', icon: RotateCcw },
    STEAL: { id: 'steal', label: 'Steal Gem', icon: Hand },
    SCROLL: { id: 'scroll', label: 'Take Scroll', icon: Scroll },
    BONUS_GEM: { id: 'bonus_gem', label: 'Take Gem', icon: Plus },
    NONE: { id: 'none', label: '', icon: null },
};

// 🟢 新增：皇室卡定义 (Royal Cards)
export const ROYAL_CARDS: RoyalCard[] = [
    {
        id: 'royal-3pts',
        points: 3,
        bonusColor: 'gold' as GemColor,
        ability: 'none' as CardAbility,
        label: 'The Queen',
    },
    {
        id: 'royal-again',
        points: 2,
        bonusColor: 'gold' as GemColor,
        ability: 'again' as CardAbility,
        label: 'The Merchant',
    },
    {
        id: 'royal-scroll',
        points: 2,
        bonusColor: 'gold' as GemColor,
        ability: 'scroll' as CardAbility,
        label: 'The Judge',
    },
    {
        id: 'royal-steal',
        points: 2,
        bonusColor: 'gold' as GemColor,
        ability: 'steal' as CardAbility,
        label: 'The Thief',
    },
];

export const BUFF_LEVELS = {
    1: 'Minor Tweak',
    2: 'Tactical Shift',
    3: 'Game Changer',
};

export const BUFFS = {
    // --- Level 1 ---
    PRIVILEGE_FAVOR: {
        id: 'privilege_favor',
        level: 1,
        label: 'Privilege Favor',
        desc: 'Start with 1 extra Privilege Scroll and 1 Gold.',
        effects: { onInit: { privilege: 1, gold: 1 } },
    },
    HEAD_START: {
        id: 'head_start',
        level: 1,
        label: 'Head Start',
        desc: 'Start with 1 random basic Gem. Win Condition: 18 Points.',
        effects: { onInit: { randomGem: 1 }, winCondition: { points: 18 } },
    },
    ROYAL_BLOOD: {
        id: 'royal_blood',
        level: 1,
        label: 'Royal Blood',
        desc: 'Start with 1 Crown.',
        effects: { onInit: { crowns: 1 } },
    },
    INTELLIGENCE: {
        id: 'intelligence',
        level: 1,
        label: 'Intelligence',
        desc: 'Action: Peek at top 3 cards of any deck.',
        effects: { active: 'peek_deck' },
    },
    DEEP_POCKETS: {
        id: 'deep_pockets',
        level: 1,
        label: 'Deep Pockets',
        desc: 'Gem holding limit increased to 12.',
        effects: { passive: { gemCap: 12 } },
    },
    BACKUP_SUPPLY: {
        id: 'backup_supply',
        level: 1,
        label: 'Backup Supply',
        desc: 'Start with 2 random basic Gems.',
        effects: { onInit: { randomGem: 2 } },
    },
    PATIENT_INVESTOR: {
        id: 'patient_investor',
        level: 1,
        label: 'Patient Investor',
        desc: 'Gain 2 Gold on your first Reserve action.',
        effects: { passive: { firstReserveBonus: 2 } },
    },
    INSIGHT: {
        id: 'insight',
        level: 1,
        label: 'Insight',
        desc: 'You can always see the top card of the Level 1 Deck.',
        effects: { passive: { revealDeck1: true } },
    },

    // --- Level 2 ---
    PEARL_TRADER: {
        id: 'pearl_trader',
        level: 2,
        label: 'Pearl Trader',
        desc: 'Gem holding limit increased to 11. Start with 1 Pearl.',
        effects: { onInit: { pearl: 1 }, passive: { gemCap: 11 } },
    },
    GOLD_RESERVE: {
        id: 'gold_reserve',
        level: 2,
        label: 'Gold Reserve',
        desc: 'Start with 1 Gold and 1 random Reserved Card.',
        effects: { onInit: { gold: 1, reserveCard: 1 } },
    },
    COLOR_PREFERENCE: {
        id: 'color_preference',
        level: 2,
        label: 'Color Preference',
        desc: 'Random color costs -1 for you (assigned at start).',
        effects: { passive: { discountRandom: 1 } },
    },
    EXTORTION: {
        id: 'extortion',
        level: 2,
        label: 'Extortion',
        desc: 'Every 2nd time you Replenish the board, steal 1 basic gem from opponent.',
        effects: { active: 'replenish_steal' },
    },
    FLEXIBLE_DISCOUNT: {
        id: 'flexible_discount',
        level: 2,
        label: 'Flexible Discount',
        desc: 'Reduce cost of Level 2 and 3 cards by 1.',
        effects: { passive: { discountAny: 1 } },
    },
    BOUNTY_HUNTER: {
        id: 'bounty_hunter',
        level: 2,
        label: 'Bounty Hunter',
        desc: 'Gain 1 random gem when you buy a card with Crowns.',
        effects: { passive: { crownBonusGem: true } },
    },
    RECYCLER: {
        id: 'recycler',
        level: 2,
        label: 'Recycler',
        desc: 'Get 1 gem back when buying Level 2 or 3 cards.',
        effects: { passive: { recycler: true } },
    },
    AGGRESSIVE_EXPANSION: {
        id: 'aggressive_expansion',
        level: 2,
        label: 'Aggressive Expansion',
        desc: 'Gain 1 random gem when you Replenish the board.',
        effects: { passive: { refillBonus: true } },
    },

    // --- Level 3 ---
    GREED_KING: {
        id: 'greed_king',
        level: 3,
        label: 'King of Greed',
        desc: 'All cards give +1 Point. Win Condition: 25 Points.',
        effects: { passive: { pointBonus: 1 }, winCondition: { points: 25 } },
    },
    ROYAL_ENVOY: {
        id: 'royal_envoy',
        level: 3,
        label: 'Royal Envoy',
        desc: 'Can pick remaining Royal Card at Turn 5. No Single Color Win.',
        effects: { active: 'turn5_royal', winCondition: { disableSingleColor: true } },
    },
    DOUBLE_AGENT: {
        id: 'double_agent',
        level: 3,
        label: 'Double Agent',
        desc: 'Privileges take 2 gems. Gem Cap: 8.',
        effects: { passive: { privilegeBuff: 2, gemCap: 8 } },
    },
    ALL_SEEING_EYE: {
        id: 'all_seeing_eye',
        level: 3,
        label: 'All-Seeing Eye',
        desc: 'Reveal extra Level 3 card. Pay L3 cards with Gold at half value. Win Condition: Single Color 13.',
        effects: { passive: { extraL3: true, goldBuff: true }, winCondition: { singleColor: 13 } },
    },
    WONDER_ARCHITECT: {
        id: 'wonder_architect',
        level: 3,
        label: 'Wonder Architect',
        desc: 'Level 3 cards cost 3 less. Win Condition: 13 Crowns (No Single Color Win).',
        effects: {
            passive: { l3Discount: 3 },
            winCondition: { crowns: 13, disableSingleColor: true },
        },
    },
    MINIMALIST: {
        id: 'minimalist',
        level: 3,
        label: 'Minimalist',
        desc: 'First 5 cards purchased provide Double Bonuses. Max Gems: 6.',
        effects: { passive: { doubleBonusFirst5: true, gemCap: 6 } },
    },
    PACIFIST: {
        id: 'pacifist',
        level: 3,
        label: 'Pacifist',
        desc: 'Immune to negative effects (Theft). Start with 1 extra Privilege.',
        effects: { passive: { immuneNegative: true } },
    },
    DESPERATE_GAMBLE: {
        id: 'desperate_gamble',
        level: 3,
        label: 'Desperate Gamble',
        desc: 'Start with 2 Gold. Cannot "Take 3 Gems". Gain a special (non-stealable) Privilege every 2 turns.',
        effects: { onInit: { gold: 2 }, passive: { noTake3: true, periodicPrivilege: 2 } },
    },

    // Default
    NONE: {
        id: 'none',
        level: 0,
        label: 'Classic',
        desc: 'No buffs.',
        effects: {},
    },
} as const;
