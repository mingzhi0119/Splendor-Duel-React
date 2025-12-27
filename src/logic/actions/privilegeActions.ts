/**
 * Privilege Action Handlers
 *
 * Handles using privilege scrolls to steal gems
 */

import { GEM_TYPES, GAME_PHASES } from '../../constants';
import { addFeedback } from '../stateHelpers';
import { GameState, GemColor } from '../../types';

export interface UsePrivilegePayload {
    r: number;
    c: number;
}

/**
 * Activate privilege action phase
 */
export const handleActivatePrivilege = (state: GameState): GameState => {
    state.gameMode = GAME_PHASES.PRIVILEGE_ACTION;
    state.privilegeGemCount = 0;
    return state;
};

/**
 * Cancel privilege action phase
 */
export const handleCancelPrivilege = (state: GameState): GameState => {
    state.gameMode = GAME_PHASES.IDLE;
    state.privilegeGemCount = 0;
    return state;
};

/**
 * Use privilege to take a gem from board
 *
 * Some buffs (Double Agent) allow taking 2 gems per privilege use.
 */
export const handleUsePrivilege = (state: GameState, payload: UsePrivilegePayload): GameState => {
    if (!payload || typeof payload.r === 'undefined' || typeof payload.c === 'undefined') {
        return state;
    }
    const { r, c } = payload;
    const gem = state.board[r][c];
    const gemType = gem.type.id as string; // Can be 'gold', 'empty', or GemColor

    // Can't take gold or empty spaces
    if (gemType === 'gold' || gemType === 'empty') return state;

    // Take the gem
    state.board[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
    state.inventories[state.turn][gemType] = (state.inventories[state.turn][gemType] || 0) + 1;
    addFeedback(state, state.turn, gemType, 1);

    const buff = state.playerBuffs?.[state.turn];
    const hasDoubleAgent = buff?.effects?.passive?.privilegeBuff === 2;

    // Handle Double Agent buff (can take 2 gems per privilege)
    if (hasDoubleAgent) {
        if (typeof state.privilegeGemCount === 'undefined') state.privilegeGemCount = 0;
        state.privilegeGemCount++;

        if (state.privilegeGemCount === 1) {
            // First gem taken, consume privilege
            if ((buff?.state as any)?.specialPrivilege > 0) {
                (buff!.state as any).specialPrivilege = 0;
                state.toastMessage = 'Used Special Privilege!';
            } else if (state.privileges[state.turn] > 0) {
                state.privileges[state.turn]--;
                addFeedback(state, state.turn, 'privilege', -1);
            }
        }

        // Can take 2nd gem?
        if (state.privilegeGemCount < 2) {
            const hasMoreGems = state.board.some((row) =>
                row.some((g) => g.type.id !== 'empty' && g.type.id !== 'gold')
            );

            if (hasMoreGems) {
                state.toastMessage = 'Double Agent: Select 2nd Gem!';
                return state;
            }
        }

        // Both gems taken or no more gems available
        state.privilegeGemCount = 0;
    } else {
        // Normal privilege: consume it
        if ((buff?.state as any)?.specialPrivilege > 0) {
            (buff!.state as any).specialPrivilege = 0;
            state.toastMessage = 'Used Special Privilege!';
        } else if (state.privileges[state.turn] > 0) {
            state.privileges[state.turn]--;
            addFeedback(state, state.turn, 'privilege', -1);
        }
    }

    state.gameMode = GAME_PHASES.IDLE;
    return state;
};
