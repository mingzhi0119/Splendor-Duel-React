/**
 * Game State Selectors
 *
 * Pure functions that extract and compute data from game state.
 * Selectors are useful for derived data and calculations.
 */

import { GameState, PlayerKey } from '../types';

/**
 * Calculate total points for a player
 *
 * Points come from:
 * - Standard development cards in tableau
 * - Royal cards
 * - Extra points (from special effects)
 * - Buff bonuses (some buffs grant point multipliers)
 *
 * @param state - Current game state (safe for null)
 * @param pid - Player ID ('p1' or 'p2')
 * @returns Total points for the player
 */
export const getPlayerScore = (state: GameState | null, pid: PlayerKey): number => {
    if (!state) return 0;

    // Points from regular cards in tableau
    const cardPoints = state.playerTableau[pid].reduce((acc, c) => acc + c.points, 0);

    // Points from royal cards
    const royalPoints = state.playerRoyals[pid].reduce((acc, c) => acc + c.points, 0);

    // Extra points from special effects
    const extra = (state.extraPoints && state.extraPoints[pid]) || 0;

    // Buff bonuses (some buffs grant points per card)
    let buffBonus = 0;
    const buffEffects = state.playerBuffs?.[pid]?.effects?.passive;
    if (buffEffects) {
        if (buffEffects.pointBonus) {
            const totalCards = state.playerTableau[pid].length + state.playerRoyals[pid].length;
            buffBonus += totalCards * buffEffects.pointBonus;
        }
    }

    return cardPoints + royalPoints + extra + buffBonus;
};

/**
 * Get total crown count for a player
 *
 * Crowns are special achievements that count towards win condition.
 * Sources:
 * - Royal cards sometimes have crowns
 * - Extra crowns from special effects
 *
 * @param state - Current game state (safe for null)
 * @param pid - Player ID ('p1' or 'p2')
 * @returns Total crown count for the player
 */
export const getCrownCount = (state: GameState | null, pid: PlayerKey): number => {
    if (!state) return 0;

    // Get all cards (regular + royal)
    const allCards = [...state.playerTableau[pid], ...state.playerRoyals[pid]];

    // Sum crowns from cards
    const cardCrowns = allCards.reduce((acc, c) => acc + (c.crowns || 0), 0);

    // Add extra crowns
    const extra = (state.extraCrowns && state.extraCrowns[pid]) || 0;

    return cardCrowns + extra;
};

/**
 * Get total gem count for a player
 *
 * Useful for checking gem capacity and discard limits.
 *
 * @param state - Current game state
 * @param pid - Player ID ('p1' or 'p2')
 * @returns Total gem count
 */
export const getTotalGems = (state: GameState, pid: PlayerKey): number => {
    return Object.values(state.inventories[pid]).reduce((a, b) => a + b, 0);
};

/**
 * Check if a player has exceeded the gem holding limit
 *
 * Standard limit is 10 gems. Some buffs increase this to 11 or 12.
 *
 * @param state - Current game state
 * @param pid - Player ID
 * @returns true if player has more than their cap
 */
export const hasExcessGems = (state: GameState, pid: PlayerKey): boolean => {
    const currentGems = getTotalGems(state, pid);
    const gemCap = state.playerBuffs[pid]?.effects?.passive?.gemCap ?? 10;
    return currentGems > gemCap;
};
