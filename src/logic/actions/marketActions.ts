/**
 * Market Action Handlers
 *
 * Handles card purchase and reservation mechanics
 */

import { GEM_TYPES, ABILITIES, GAME_PHASES } from '../../constants';
import { calculateTransaction } from '../../utils';
import { addFeedback, addPrivilege } from '../stateHelpers';
import { finalizeTurn } from '../turnManager';
import { GameState, Card, GemColor, PlayerKey } from '../../types';

export interface BuyCardPayload {
    card: Card;
    source: 'market' | 'reserved';
    marketInfo?: { level: 1 | 2 | 3; idx: number };
    randoms?: { bountyHunterColor?: GemColor };
}

export interface ReserveCardPayload {
    card: Card;
    level: 1 | 2 | 3;
    idx: number;
    goldCoords?: { r: number; c: number };
}

export interface ReserveDeckPayload {
    level: 1 | 2 | 3;
    goldCoords?: { r: number; c: number };
}

export const handleInitiateBuyJoker = (state: GameState, payload: any): GameState => {
    state.pendingBuy = payload;
    state.gameMode = GAME_PHASES.SELECT_CARD_COLOR;
    return state;
};

export const handleBuyCard = (state: GameState, payload: BuyCardPayload): GameState => {
    const { card, source, marketInfo, randoms } = payload;
    const player = state.turn;
    const inv = state.inventories[player];
    const tableau = state.playerTableau[player];
    const buff = state.playerBuffs?.[player];

    state.pendingBuy = null;

    const { affordable, goldCost, gemsPaid } = calculateTransaction(card, inv, tableau, buff);

    if (!affordable) {
        state.toastMessage = 'Cannot afford this card!';
        return state;
    }

    // Return gems to bag
    Object.entries(gemsPaid).forEach(([color, paid]) => {
        inv[color as GemColor] -= paid as number;
        for (let k = 0; k < (paid as number); k++) {
            state.bag.push({
                type: GEM_TYPES[color.toUpperCase()],
                uid: `returned-${color}-${Date.now()}-${k}`,
            } as any);
        }
    });

    // Return gold to bag
    inv.gold -= goldCost;
    for (let k = 0; k < goldCost; k++) {
        state.bag.push({ type: GEM_TYPES.GOLD, uid: `returned-gold-${Date.now()}-${k}` } as any);
    }

    // Minimalism: Double Bonus for first 5 cards
    if (buff?.effects?.passive?.doubleBonusFirst5 && state.playerTableau[player].length < 5) {
        (card as any).bonusCount = 2;
        state.toastMessage = 'Minimalism: Card grants Double Bonus!';
    }

    state.playerTableau[player].push(card);

    // Handle crowns
    if ((card as any).crowns > 0) {
        addFeedback(state, player, 'crown', (card as any).crowns);

        // Bounty Hunter: Gain gem for crown
        if (buff?.effects?.passive?.crownBonusGem) {
            const basics: GemColor[] = ['red', 'green', 'blue', 'white', 'black'];
            const randColor = (randoms?.bountyHunterColor ||
                basics[Math.floor(Math.random() * basics.length)]) as GemColor;
            inv[randColor]++;
            addFeedback(state, player, randColor, 1);
            state.toastMessage = 'Bounty Hunter: +1 Gem!';
        }
    }

    // Recycler: Refund one gem on lvl 2/3 card
    if (
        buff?.effects?.passive?.recycler &&
        ((card as any).level === 2 || (card as any).level === 3)
    ) {
        const paidColors = Object.keys(gemsPaid).filter(
            (c) => (gemsPaid as any)[c] > 0 && c !== 'pearl'
        );
        if (paidColors.length > 0) {
            const refundColor = paidColors[0] as GemColor;
            inv[refundColor]++;
            for (let i = state.bag.length - 1; i >= 0; i--) {
                const bagItem = state.bag[i];
                const bag = bagItem as any;
                if (typeof bag === 'object' && 'type' in bag && bag.type?.id === refundColor) {
                    state.bag.splice(i, 1);
                    break;
                }
            }
            addFeedback(state, player, refundColor, 1);
            state.toastMessage = 'Recycled 1 Gem!';
        }
    }

    // Refresh market or remove from reserved
    if (source === 'market' && marketInfo) {
        const { level, idx } = marketInfo;
        const deck = state.decks[level];
        if (deck.length > 0) {
            state.market[level][idx] = deck.pop()!;
        } else {
            state.market[level][idx] = null as any;
        }
    } else if (source === 'reserved') {
        state.playerReserved[player] = state.playerReserved[player].filter((c) => c.id !== card.id);
    }

    // Determine next turn
    let nextTurn: PlayerKey = player === 'p1' ? 'p2' : 'p1';
    const abilities = Array.isArray((card as any).ability)
        ? (card as any).ability
        : (card as any).ability
          ? [(card as any).ability]
          : [];

    // AGAIN ability: repeat turn
    if (abilities.includes(ABILITIES.AGAIN.id)) {
        nextTurn = player;
    }

    // BONUS_GEM ability: take a gem
    if (abilities.includes(ABILITIES.BONUS_GEM.id as any)) {
        const targetColor = String((card as any).bonusColor).toUpperCase();
        const hasGem = state.board.some((row) =>
            row.some((g) => g.type.id === (card as any).bonusColor)
        );
        if (hasGem) {
            state.gameMode = GAME_PHASES.BONUS_ACTION;
            state.bonusGemTarget = GEM_TYPES[targetColor as keyof typeof GEM_TYPES];
            return state;
        } else {
            state.toastMessage = 'No matching gem available - Skill skipped';
        }
    }

    // SCROLL ability: gain privilege
    if (abilities.includes(ABILITIES.SCROLL.id)) {
        const opponent = player === 'p1' ? 'p2' : 'p1';
        if (state.privileges.p1 + state.privileges.p2 < 3) {
            addPrivilege(state, player);
        } else if (state.privileges[opponent] > 0) {
            state.privileges[opponent]--;
            addFeedback(state, opponent, 'privilege', -1);
            addPrivilege(state, player);
        }
    }

    finalizeTurn(state, nextTurn);
    return state;
};

export const handleInitiateReserve = (state: GameState, payload: any): GameState => {
    state.pendingReserve = payload;
    state.gameMode = GAME_PHASES.RESERVE_WAITING_GEM;
    return state;
};

export const handleInitiateReserveDeck = (state: GameState, payload: any): GameState => {
    state.pendingReserve = { ...payload, isDeck: true };
    state.gameMode = GAME_PHASES.RESERVE_WAITING_GEM;
    return state;
};

export const handleCancelReserve = (state: GameState): GameState => {
    state.pendingReserve = null;
    state.gameMode = GAME_PHASES.IDLE;
    return state;
};

export const handleReserveCard = (state: GameState, payload: ReserveCardPayload): GameState => {
    const { card, level, idx, goldCoords } = payload;
    const player = state.turn;

    if (state.playerReserved[player].length >= 3) {
        state.toastMessage = 'Reserve limit reached!';
        return state;
    }

    state.playerReserved[player].push(card);

    const deck = state.decks[level];
    state.market[level][idx] = deck.length > 0 ? deck.pop()! : (null as any);

    // Take gold gem if available
    if (goldCoords) {
        const { r, c } = goldCoords;
        if (state.board[r][c].type.id === 'gold') {
            state.board[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
            state.inventories[player].gold++;
            addFeedback(state, player, 'gold', 1);
        }
    }

    // Patient Investor: +2 gold on first reserve
    const buff = state.playerBuffs?.[player];
    if (buff?.effects?.passive?.firstReserveBonus) {
        if (!buff.state) buff.state = {};
        if (!(buff.state as any).hasReserved) {
            (buff.state as any).hasReserved = true;
            state.inventories[player].gold += 2;
            addFeedback(state, player, 'gold', 2);
            state.toastMessage = 'Patient Investor: +2 Gold!';
        }
    }

    state.pendingReserve = null;
    state.gameMode = GAME_PHASES.IDLE;
    finalizeTurn(state, player === 'p1' ? 'p2' : 'p1');
    return state;
};

export const handleReserveDeck = (state: GameState, payload: ReserveDeckPayload): GameState => {
    const { level, goldCoords } = payload;
    const player = state.turn;

    if (state.playerReserved[player].length >= 3) {
        state.toastMessage = 'Reserve limit reached!';
        return state;
    }

    if (state.decks[level].length > 0) {
        const card = state.decks[level].pop()!;
        state.playerReserved[player].push(card);
    }

    // Take gold gem if available
    if (goldCoords) {
        const { r, c } = goldCoords;
        if (state.board[r][c].type.id === 'gold') {
            state.board[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
            state.inventories[player].gold++;
            addFeedback(state, player, 'gold', 1);
        }
    }

    // Patient Investor: +2 gold on first reserve
    const buff = state.playerBuffs?.[player];
    if (buff?.effects?.passive?.firstReserveBonus) {
        if (!buff.state) buff.state = {};
        if (!(buff.state as any).hasReserved) {
            (buff.state as any).hasReserved = true;
            state.inventories[player].gold += 2;
            addFeedback(state, player, 'gold', 2);
            state.toastMessage = 'Patient Investor: +2 Gold!';
        }
    }

    state.pendingReserve = null;
    state.gameMode = GAME_PHASES.IDLE;
    finalizeTurn(state, player === 'p1' ? 'p2' : 'p1');
    return state;
};
