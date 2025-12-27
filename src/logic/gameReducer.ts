/**
 * Main Game Reducer
 *
 * Central dispatcher for all game actions.
 * Uses Immer for efficient immutable state updates.
 */

import { produce } from 'immer';
import {
    handleTakeGems,
    handleReplenish,
    handleTakeBonusGem,
    handleDiscardGem,
    handleStealGem,
} from './actions/boardActions';
import {
    handleBuyCard,
    handleInitiateBuyJoker,
    handleInitiateReserve,
    handleInitiateReserveDeck,
    handleCancelReserve,
    handleReserveCard,
    handleReserveDeck,
} from './actions/marketActions';
import { handleSelectRoyalCard, handleForceRoyalSelection } from './actions/royalActions';
import {
    handleUsePrivilege,
    handleActivatePrivilege,
    handleCancelPrivilege,
} from './actions/privilegeActions';
import { handleSelectBuff, handleInit, handleInitDraft } from './actions/buffActions';
import {
    handleDebugAddCrowns,
    handleDebugAddPoints,
    handleDebugAddPrivilege,
    handlePeekDeck,
    handleCloseModal,
} from './actions/miscActions';
import { GameState } from '../types';

/**
 * Game action interface
 */
export interface GameAction {
    type: string;
    payload?: any;
}

/**
 * Main reducer function
 *
 * Dispatches actions to appropriate handlers using Immer for efficient
 * immutable state updates. All handlers receive a draft state that can be
 * modified directly - Immer ensures immutability under the hood.
 *
 * @param state - Current game state
 * @param action - Action to apply
 * @returns New game state (or same state for null inputs)
 */
export const applyAction = (state: GameState | null, action: GameAction): GameState | null => {
    const { type, payload } = action;

    // Handle initialization actions specially (they create state from null)
    if (!state) {
        if (type === 'INIT') {
            return handleInit(state, payload);
        }
        if (type === 'INIT_DRAFT') {
            return handleInitDraft(state, payload);
        }
        // For non-init actions, can't proceed without state
        return null;
    }

    // Use Immer's produce() for efficient immutable updates
    return produce(state, (draft) => {
        // Clear previous feedback and UI state to prevent residuals
        draft.lastFeedback = null;
        draft.toastMessage = null;

        switch (type) {
            // ========== INITIALIZATION & SETUP ==========
            case 'SELECT_BUFF':
                return handleSelectBuff(draft, payload);

            // ========== BOARD ACTIONS ==========
            case 'TAKE_GEMS':
                return handleTakeGems(draft, payload);

            case 'REPLENISH':
                return handleReplenish(draft, payload);

            case 'TAKE_BONUS_GEM':
                return handleTakeBonusGem(draft, payload);

            case 'DISCARD_GEM':
                return handleDiscardGem(draft, payload);

            case 'STEAL_GEM':
                return handleStealGem(draft, payload);

            // ========== MARKET ACTIONS ==========
            case 'INITIATE_BUY_JOKER':
                return handleInitiateBuyJoker(draft, payload);

            case 'BUY_CARD':
                return handleBuyCard(draft, payload);

            case 'INITIATE_RESERVE':
                return handleInitiateReserve(draft, payload);

            case 'INITIATE_RESERVE_DECK':
                return handleInitiateReserveDeck(draft, payload);

            case 'CANCEL_RESERVE':
                return handleCancelReserve(draft);

            case 'RESERVE_CARD':
                return handleReserveCard(draft, payload);

            case 'RESERVE_DECK':
                return handleReserveDeck(draft, payload);

            // ========== PRIVILEGE ACTIONS ==========
            case 'ACTIVATE_PRIVILEGE':
                return handleActivatePrivilege(draft);

            case 'USE_PRIVILEGE':
                return handleUsePrivilege(draft, payload);

            case 'CANCEL_PRIVILEGE':
                return handleCancelPrivilege(draft);

            // ========== ROYAL ACTIONS ==========
            case 'FORCE_ROYAL_SELECTION':
                return handleForceRoyalSelection(draft);

            case 'SELECT_ROYAL_CARD':
                return handleSelectRoyalCard(draft, payload);

            // ========== DEBUG ACTIONS ==========
            case 'DEBUG_ADD_CROWNS':
                return handleDebugAddCrowns(draft, payload);

            case 'DEBUG_ADD_POINTS':
                return handleDebugAddPoints(draft, payload);

            case 'DEBUG_ADD_PRIVILEGE':
                return handleDebugAddPrivilege(draft, payload);

            // ========== MODAL ACTIONS ==========
            case 'PEEK_DECK':
                return handlePeekDeck(draft, payload);

            case 'CLOSE_MODAL':
                return handleCloseModal(draft);

            // ========== FALLBACK ==========
            default:
                console.warn('Unknown action type:', type);
                break;
        }
    });
};
