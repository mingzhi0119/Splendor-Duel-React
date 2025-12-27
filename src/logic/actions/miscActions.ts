/**
 * Miscellaneous Action Handlers
 *
 * Debug utilities, modals, and special actions
 */

import { addFeedback } from '../stateHelpers';
import { finalizeTurn } from '../turnManager';
import { GameState, PlayerKey } from '../../types';

/**
 * Debug: Add crowns to a player
 */
export const handleDebugAddCrowns = (state: GameState, payload: PlayerKey): GameState => {
    const pid = payload;
    if (!state.extraCrowns) state.extraCrowns = { p1: 0, p2: 0 };
    state.extraCrowns[pid] = (state.extraCrowns[pid] || 0) + 1;
    addFeedback(state, pid, 'crown', 1);
    finalizeTurn(state, state.turn);
    return state;
};

/**
 * Debug: Add points to a player
 */
export const handleDebugAddPoints = (state: GameState, payload: PlayerKey): GameState => {
    const pid = payload;
    if (!state.extraPoints) state.extraPoints = { p1: 0, p2: 0 };
    state.extraPoints[pid] = (state.extraPoints[pid] || 0) + 1;
    finalizeTurn(state, state.turn);
    return state;
};

/**
 * Peek at top 3 cards of a deck (Intelligence ability)
 */
export const handlePeekDeck = (state: GameState, payload: { level: 1 | 2 | 3 }): GameState => {
    const { level } = payload;
    const deck = state.decks[level];
    const top3 = deck.slice(-3).reverse(); // Last 3 cards, reversed for viewing order

    state.activeModal = {
        type: 'PEEK',
        data: {
            cards: top3,
            level: level,
        },
    };

    return state;
};

/**
 * Close any active modal
 */
export const handleCloseModal = (state: GameState): GameState => {
    state.activeModal = null;
    return state;
};
