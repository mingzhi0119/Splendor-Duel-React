import { GameState, GameAction, Card, PlayerKey, GemCoord } from '../../types';
import { calculateTransaction } from '../../utils';
import { validateGemSelection } from '../validators';
import { ABILITIES } from '../../constants';

/**
 * Heuristic-based AI for Splendor Duel
 */
export const computeAiAction = (state: GameState): GameAction | null => {
    const aiPlayer = state.turn;
    const opponent = aiPlayer === 'p1' ? 'p2' : 'p1';

    // Priority 1: Handle mandatory sub-phases first
    if (state.gameMode === 'SELECT_ROYAL') {
        // Just pick the one with most points for now
        const bestRoyal = [...state.royalDeck].sort((a, b) => b.points - a.points)[0];
        if (bestRoyal) return { type: 'SELECT_ROYAL_CARD', payload: { card: bestRoyal } };
    }

    if (state.gameMode === 'DISCARD_EXCESS_GEMS') {
        // Discard the gem type we have the most of, but keep gold/pearls if possible
        const inv = state.inventories[aiPlayer];
        const discardOrder = (['red', 'green', 'blue', 'white', 'black'] as const)
            .filter((color) => inv[color] > 0)
            .sort((a, b) => inv[b] - inv[a]);

        if (discardOrder.length > 0) {
            return { type: 'DISCARD_GEM', payload: discardOrder[0] };
        }
        // Fallback to gold/pearl if no basics
        if (inv.pearl > 0) return { type: 'DISCARD_GEM', payload: 'pearl' };
        if (inv.gold > 0) return { type: 'DISCARD_GEM', payload: 'gold' };
    }

    if (state.gameMode === 'STEAL_ACTION') {
        const oppInv = state.inventories[opponent];
        const stealable = (['pearl', 'red', 'green', 'blue', 'white', 'black'] as const).filter(
            (c) => oppInv[c] > 0
        );
        if (stealable.length > 0) {
            return { type: 'STEAL_GEM', payload: { gemId: stealable[0] } };
        }
    }

    if (state.gameMode === 'BONUS_ACTION') {
        // Find the target gem on board
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (state.board[r][c].type.id === state.bonusGemTarget?.id) {
                    return { type: 'TAKE_BONUS_GEM', payload: { r, c } };
                }
            }
        }
    }

    if (state.gameMode === 'SELECT_CARD_COLOR') {
        // Pick red as default for Joker
        return {
            type: 'BUY_CARD',
            payload: {
                ...state.pendingBuy,
                card: { ...state.pendingBuy!.card, bonusColor: 'red' },
            },
        };
    }

    if (state.gameMode !== 'IDLE') return null;

    // Priority 2: Buy Cards
    // Check Market
    const buyableFromMarket = [];
    for (const lvl of [3, 2, 1] as const) {
        for (let i = 0; i < state.market[lvl].length; i++) {
            const card = state.market[lvl][i];
            if (
                card &&
                calculateTransaction(
                    card,
                    state.inventories[aiPlayer],
                    state.playerTableau[aiPlayer],
                    state.playerBuffs[aiPlayer]
                ).affordable
            ) {
                buyableFromMarket.push({ card, level: lvl, idx: i });
            }
        }
    }
    // Check Reserved
    const buyableFromReserved = state.playerReserved[aiPlayer].filter(
        (card) =>
            calculateTransaction(
                card,
                state.inventories[aiPlayer],
                state.playerTableau[aiPlayer],
                state.playerBuffs[aiPlayer]
            ).affordable
    );

    // Pick "best" card to buy (heuristic: most points, then level)
    const allBuyable = [
        ...buyableFromMarket.map((item) => ({ ...item, source: 'market' as const })),
        ...buyableFromReserved.map((card) => ({ card, source: 'reserved' as const })),
    ].sort((a, b) => {
        if (b.card.points !== a.card.points) return b.card.points - a.card.points;
        return b.card.level - a.card.level;
    });

    if (allBuyable.length > 0) {
        const best = allBuyable[0];
        if (best.card.bonusColor === 'gold') {
            return {
                type: 'INITIATE_BUY_JOKER',
                payload: {
                    card: best.card,
                    source: best.source,
                    marketInfo: (best as any).level
                        ? { level: (best as any).level, idx: (best as any).idx }
                        : undefined,
                },
            };
        }
        return {
            type: 'BUY_CARD',
            payload: {
                card: best.card,
                source: best.source,
                marketInfo: (best as any).level
                    ? { level: (best as any).level, idx: (best as any).idx }
                    : undefined,
                randoms: { bountyHunterColor: 'red' },
            },
        };
    }

    // Priority 3: Replenish if board is very empty
    const emptyCount = state.board.flat().filter((cell) => cell.type.id === 'empty').length;
    if (emptyCount > 15 && state.bag.length > 0) {
        return {
            type: 'REPLENISH',
            payload: { randoms: { expansionColor: 'red', extortionColor: 'blue' } },
        };
    }

    // Priority 4: Take Gems
    // Simple heuristic: Find a 3-gem line that gives colors we need for cards in market
    const potentialLines = findValidGemLines(state);
    if (potentialLines.length > 0) {
        const currentTotal = Object.values(state.inventories[aiPlayer]).reduce((a, b) => a + b, 0);
        const gemCap = state.playerBuffs[aiPlayer]?.effects?.passive?.gemCap || 10;
        const remainingSpace = gemCap - currentTotal;

        // Sort by length descending
        const sortedLines = potentialLines.sort((a, b) => b.length - a.length);

        // Filter lines that fit in remaining space to avoid discard phase
        const safeLines = sortedLines.filter((line) => line.length <= remainingSpace);

        if (safeLines.length > 0) {
            return { type: 'TAKE_GEMS', payload: { coords: safeLines[0] } };
        } else if (remainingSpace > 0) {
            // If no "perfect" line fits, take the longest line that fits the remaining space
            // (findValidGemLines already returns 1 and 2 gem lines too)
            const bestFitting = sortedLines.find((l) => l.length <= remainingSpace);
            if (bestFitting) return { type: 'TAKE_GEMS', payload: { coords: bestFitting } };
        }

        // If remainingSpace is 0 or no lines fit, we might be forced to skip or replenish
        // but finding gems usually means remainingSpace > 0.
    }

    // Priority 5: Reserve Card (if we have space)
    if (state.playerReserved[aiPlayer].length < 3) {
        // Reserve a high level card
        for (const lvl of [3, 2] as const) {
            for (let i = 0; i < state.market[lvl].length; i++) {
                const card = state.market[lvl][i];
                if (card) {
                    // Check if there is gold on board
                    let goldCoord = null;
                    for (let r = 0; r < 5; r++) {
                        for (let c = 0; c < 5; c++) {
                            if (state.board[r][c].type.id === 'gold') goldCoord = { r, c };
                        }
                    }
                    if (goldCoord) {
                        return {
                            type: 'RESERVE_CARD',
                            payload: { card, level: lvl, idx: i, goldCoords: goldCoord },
                        };
                    } else {
                        return { type: 'RESERVE_CARD', payload: { card, level: lvl, idx: i } };
                    }
                }
            }
        }
    }

    // Final fallback: Replenish if anything left in bag
    if (state.bag.length > 0) {
        return {
            type: 'REPLENISH',
            payload: { randoms: { expansionColor: 'red', extortionColor: 'blue' } },
        };
    }

    return null; // Should not happen in a normal game
};

/**
 * Brute force search for valid gem lines on the board
 */
function findValidGemLines(state: GameState): GemCoord[][] {
    const validLines: GemCoord[][] = [];

    // Check all cells as starting points
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (state.board[r][c].type.id === 'empty' || state.board[r][c].type.id === 'gold')
                continue;

            // Try all directions: horizontal, vertical, 2 diagonals
            const directions = [
                [0, 1],
                [1, 0],
                [1, 1],
                [1, -1],
            ];

            for (const [dr, dc] of directions) {
                // Try lengths 3, 2, 1
                for (let len = 3; len >= 1; len--) {
                    const line: GemCoord[] = [];
                    let possible = true;
                    for (let i = 0; i < len; i++) {
                        const nr = r + dr * i;
                        const nc = c + dc * i;
                        if (nr < 0 || nr >= 5 || nc < 0 || nc >= 5) {
                            possible = false;
                            break;
                        }
                        const cell = state.board[nr][nc];
                        if (cell.type.id === 'empty' || cell.type.id === 'gold') {
                            possible = false;
                            break;
                        }
                        line.push({ r: nr, c: nc });
                    }

                    if (possible && validateGemSelection(line).valid) {
                        validLines.push(line);
                    }
                }
            }
        }
    }
    return validLines;
}
