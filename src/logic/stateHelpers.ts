/**
 * State Helper Functions
 *
 * Low-level utility functions for modifying game state.
 * These are pure functions that handle common state mutations.
 */

import { GameState, PlayerKey } from '../types';

/**
 * Add feedback for a player action to the state
 *
 * @param state - Current game state
 * @param player - Player ID ('p1' or 'p2')
 * @param type - Feedback type (gem color, action, etc.)
 * @param diff - Change amount (positive or negative)
 */
export const addFeedback = (
    state: GameState,
    player: PlayerKey,
    type: string,
    diff: number
): void => {
    if (!state.lastFeedback) {
        state.lastFeedback = {
            uid: Date.now() + '-' + Math.random(),
            items: [],
        };
    }
    const existing = state.lastFeedback.items.find((i) => i.player === player && i.type === type);
    if (existing) {
        existing.diff += diff;
    } else {
        state.lastFeedback.items.push({ player, type, diff });
    }
};

/**
 * Add a privilege scroll to a player (capped at 3)
 *
 * @param state - Current game state
 * @param pid - Player ID ('p1' or 'p2')
 */
export const addPrivilege = (state: GameState, pid: PlayerKey): void => {
    if (state.privileges[pid] < 3) {
        state.privileges[pid]++;
        addFeedback(state, pid, 'privilege', 1);
    }
};
