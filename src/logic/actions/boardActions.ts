/**
 * Board Action Handlers
 *
 * Pure action functions for board-level interactions:
 * - Taking gems from the board
 * - Replenishing the board
 * - Bonus gems and steals
 * - Discarding excess gems
 */

import { GEM_TYPES, SPIRAL_ORDER, GAME_PHASES } from '../../constants';
import { addFeedback, addPrivilege } from '../stateHelpers';
import { finalizeTurn } from '../turnManager';
import { GameState, GemColor, BoardCell } from '../../types';

/**
 * Payload for taking gems from board
 */
export interface TakeGemsPayload {
    coords: Array<{ r: number; c: number }>;
}

/**
 * Payload for bonus gem
 */
export interface BonusGemPayload {
    r: number;
    c: number;
}

/**
 * Payload for stealing gem
 */
export interface StealGemPayload {
    gemId: GemColor;
}

/**
 * Payload for replenish action
 */
export interface ReplenishPayload {
    randoms?: {
        extortionColor?: GemColor;
        expansionColor?: GemColor;
    };
}

/**
 * Handle player taking gems from the board
 *
 * Rules:
 * - Gems must form a valid line (checked by UI)
 * - Taking 2+ gems of same color or 2+ pearls grants opponent privilege
 * - Update inventory and finalize turn
 *
 * @param state - Game state (modified by Immer)
 * @param payload - Coordinates of gems to take
 */
export const handleTakeGems = (state: GameState, payload: TakeGemsPayload): GameState => {
    if (!payload || !payload.coords) return state;
    const { coords } = payload;
    const newInv = { ...state.inventories[state.turn] };
    let pearlCount = 0;
    const colorCounts: Record<string, number> = {};

    // Take gems from board and update inventory
    coords.forEach(({ r, c }) => {
        const gem = state.board[r][c];
        const gemType = gem.type.id;
        newInv[gemType as GemColor] = (newInv[gemType as GemColor] || 0) + 1;
        state.board[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };

        if (gemType === 'pearl') pearlCount++;
        colorCounts[gemType] = (colorCounts[gemType] || 0) + 1;
    });

    // Add feedback for special gems
    const specialGems = coords
        .map(({ r, c }) => state.board[r][c].type.id)
        .filter((t) => t === 'pearl' || t === 'gold');
    specialGems.forEach((t) => addFeedback(state, state.turn, t, 1));

    // Check if opponent should get privilege
    if (pearlCount >= 2 || Object.values(colorCounts).some((c) => c >= 3)) {
        const opponent = state.turn === 'p1' ? 'p2' : 'p1';
        if (state.privileges.p1 + state.privileges.p2 < 3) {
            addPrivilege(state, opponent);
        } else if (state.privileges[state.turn] > 0) {
            state.privileges[state.turn]--;
            addFeedback(state, state.turn, 'privilege', -1);
            addPrivilege(state, opponent);
        }
    }

    state.inventories[state.turn] = newInv;
    finalizeTurn(state, state.turn === 'p1' ? 'p2' : 'p1', newInv);
    return state;
};

/**
 * Replenish the board by refilling empty spaces
 *
 * Uses spiral order to refill from center outward.
 * Handles buff effects (Extortion, Aggressive Expansion).
 *
 * @param state - Game state (modified by Immer)
 * @param payload - Optional random values for deterministic testing
 */
export const handleReplenish = (state: GameState, payload?: ReplenishPayload): GameState => {
    const { randoms } = payload || {};
    const opponent = state.turn === 'p1' ? 'p2' : 'p1';
    const buff = state.playerBuffs?.[state.turn];

    // Check if board is already full (no refill needed)
    if (!state.board.every((row) => row.every((g) => g.type.id === 'empty'))) {
        // Give opponent privilege for non-empty board refill
        if (state.privileges.p1 + state.privileges.p2 < 3) {
            addPrivilege(state, opponent);
        } else if (state.privileges[state.turn] > 0) {
            state.privileges[state.turn]--;
            addFeedback(state, state.turn, 'privilege', -1);
            addPrivilege(state, opponent);
        }

        // Handle Extortion buff effect
        const hasExtortion = buff?.effects?.active === 'replenish_steal';
        if (hasExtortion) {
            if (!buff.state) buff.state = {};
            if (typeof buff.state.refillCount === 'undefined') buff.state.refillCount = 0;
            buff.state.refillCount++;

            // Every 2nd refill, steal a gem
            if (buff.state.refillCount > 0 && buff.state.refillCount % 2 === 0) {
                const oppBuff = state.playerBuffs?.[opponent];
                if (oppBuff?.effects?.passive?.immuneNegative) {
                    state.toastMessage = 'Extortion blocked by Pacifist!';
                } else {
                    let stolenColor = randoms?.extortionColor;
                    if (!stolenColor) {
                        const stealableColors = Object.keys(state.inventories[opponent]).filter(
                            (k) =>
                                k !== 'gold' && k !== 'pearl' && state.inventories[opponent][k] > 0
                        );
                        if (stealableColors.length > 0) {
                            stolenColor = stealableColors[
                                Math.floor(Math.random() * stealableColors.length)
                            ] as GemColor;
                        }
                    }

                    if (stolenColor) {
                        state.inventories[opponent][stolenColor]--;
                        state.inventories[state.turn][stolenColor]++;
                        addFeedback(state, state.turn, stolenColor, 1);
                        addFeedback(state, opponent, stolenColor, -1);
                        addFeedback(state, state.turn, 'extortion', 1);
                        state.toastMessage = `Extortion! Stole 1 ${stolenColor}!`;
                    } else {
                        state.toastMessage = 'Extortion triggered but opponent has no basic gems.';
                    }
                }
            }
        }
    }

    // Handle Aggressive Expansion buff
    if (buff?.effects?.passive?.refillBonus) {
        const randColor = (randoms?.expansionColor ||
            ['red', 'green', 'blue', 'white', 'black'][Math.floor(Math.random() * 5)]) as GemColor;
        state.inventories[state.turn][randColor]++;
        addFeedback(state, state.turn, randColor, 1);
        state.toastMessage = 'Aggressive Expansion: +1 Gem!';
    }

    // Refill empty spaces in spiral order
    for (let i = 0; i < SPIRAL_ORDER.length; i++) {
        const [r, c] = SPIRAL_ORDER[i];
        if (state.board[r][c].type.id === 'empty' && state.bag.length > 0) {
            const bagItem = state.bag.pop();
            if (bagItem && typeof bagItem === 'object') {
                state.board[r][c] = bagItem as BoardCell;
            }
        }
    }

    return state;
};

/**
 * Handle taking a bonus gem from board
 *
 * Used after certain ability triggers.
 * Checks gem cap and discards excess if needed.
 *
 * @param state - Game state (modified by Immer)
 * @param payload - Gem coordinates
 */
export const handleTakeBonusGem = (state: GameState, payload: BonusGemPayload): GameState => {
    if (!payload || typeof payload.r === 'undefined' || typeof payload.c === 'undefined') {
        return state;
    }
    const { r, c } = payload;
    const gem = state.board[r][c];
    const gemType = gem.type.id as GemColor;

    state.board[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
    state.inventories[state.turn][gemType] = (state.inventories[state.turn][gemType] || 0) + 1;
    state.bonusGemTarget = null;

    const totalGems = Object.values(state.inventories[state.turn]).reduce((a, b) => a + b, 0);
    const gemCap = state.playerBuffs?.[state.turn]?.effects?.passive?.gemCap || 10;

    if (totalGems > gemCap) {
        state.gameMode = GAME_PHASES.DISCARD_EXCESS_GEMS;
        return state;
    }

    finalizeTurn(state, state.nextPlayerAfterRoyal || (state.turn === 'p1' ? 'p2' : 'p1'));
    return state;
};

/**
 * Handle discarding a gem (during excess gem phase)
 *
 * Returns gem to bag.
 * Continues turn if player still has excess gems.
 *
 * @param state - Game state (modified by Immer)
 * @param payload - Gem color ID
 */
export const handleDiscardGem = (state: GameState, payload: string): GameState => {
    if (!payload) return state;
    const gemId = payload as GemColor;
    const currentInv = state.inventories[state.turn];

    if (currentInv[gemId] > 0) {
        currentInv[gemId]--;
        state.bag.push({
            type: GEM_TYPES[gemId.toUpperCase()],
            uid: `discard-${Date.now()}`,
        } as any);

        const totalGems = Object.values(currentInv).reduce((a, b) => a + b, 0);
        const gemCap = state.playerBuffs?.[state.turn]?.effects?.passive?.gemCap || 10;
        if (totalGems <= gemCap) {
            const nextP = state.nextPlayerAfterRoyal || (state.turn === 'p1' ? 'p2' : 'p1');
            finalizeTurn(state, nextP, currentInv);
        }
    }

    return state;
};

/**
 * Handle stealing a gem from opponent
 *
 * Used by Steal ability on cards.
 * Checks gem cap after stealing.
 *
 * @param state - Game state (modified by Immer)
 * @param payload - Gem ID to steal
 */
export const handleStealGem = (state: GameState, payload: StealGemPayload): GameState => {
    if (!payload || !payload.gemId) return state;
    const { gemId } = payload;
    const player = state.turn;
    const opponent = player === 'p1' ? 'p2' : 'p1';

    // Steal only if opponent has the gem
    if (state.inventories[opponent][gemId] > 0) {
        state.inventories[opponent][gemId]--;
        state.inventories[player][gemId] = (state.inventories[player][gemId] || 0) + 1;
    }

    addFeedback(state, player, gemId, 1);
    addFeedback(state, opponent, gemId, -1);

    // Check if player now exceeds gem cap
    const totalGems = Object.values(state.inventories[player]).reduce((a, b) => a + b, 0);
    const gemCap = state.playerBuffs?.[player]?.effects?.passive?.gemCap || 10;

    if (totalGems > gemCap) {
        state.gameMode = GAME_PHASES.DISCARD_EXCESS_GEMS;
        return state;
    }

    finalizeTurn(state, state.nextPlayerAfterRoyal || opponent);
    return state;
};
