/**
 * Turn Manager
 *
 * Handles turn transitions and end-of-turn checks.
 * Manages win conditions, royal card milestones, and gem capacity rules.
 */

import { BONUS_COLORS, GAME_PHASES } from '../constants';
import { GameState, PlayerKey, GemColor } from '../types';

/**
 * Finalize current player's turn and check for:
 * - Win conditions (points, crowns, single color)
 * - Royal card milestones
 * - Gem capacity violations
 *
 * Then transition to next player or game phase.
 *
 * @param state - Current game state (modified in place by Immer)
 * @param nextPlayer - Player ID for next turn
 * @param instantInv - Optional inventory to check (for gem count validation)
 */
export const finalizeTurn = (
    state: GameState,
    nextPlayer: PlayerKey,
    instantInv?: Record<GemColor | 'gold' | 'pearl', number>
): void => {
    // ========== BUFF EFFECTS: Periodic Privilege ==========
    const nextBuff = state.playerBuffs?.[nextPlayer];
    if (nextBuff?.effects?.passive?.periodicPrivilege) {
        if (!nextBuff.state) nextBuff.state = {};
        if (typeof nextBuff.state.turnCount === 'undefined') nextBuff.state.turnCount = 0;
        if (typeof nextBuff.state.specialPrivilege === 'undefined')
            nextBuff.state.specialPrivilege = 0;

        nextBuff.state.turnCount++;
        if (nextBuff.state.turnCount % nextBuff.effects.passive.periodicPrivilege === 0) {
            if (nextBuff.state.specialPrivilege === 0) {
                nextBuff.state.specialPrivilege = 1;
                state.toastMessage = 'High Roller: Gained Special Privilege!';
            }
        }
    }

    // ========== WIN CONDITION CHECKS ==========
    // Get buff-specific win conditions
    const p1Buff = state.playerBuffs?.p1?.effects?.winCondition || {};
    const p2Buff = state.playerBuffs?.p2?.effects?.winCondition || {};
    const currentBuff = state.turn === 'p1' ? p1Buff : p2Buff;

    const POINTS_GOAL = currentBuff.points || 20;
    const CROWNS_GOAL = currentBuff.crowns || 10;
    const SINGLE_COLOR_GOAL = currentBuff.singleColor || 10;
    const DISABLE_SINGLE_COLOR = currentBuff.disableSingleColor || false;

    // Helper: Calculate player's total points
    const getPoints = (pid: PlayerKey): number => {
        const cardPoints = state.playerTableau[pid].reduce((a, c) => a + c.points, 0);
        const royalPoints = state.playerRoyals[pid].reduce((a, c) => a + c.points, 0);
        const extra = state.extraPoints ? state.extraPoints[pid] : 0;
        const buffBonus =
            state.playerBuffs && state.playerBuffs[pid].effects?.passive?.pointBonus
                ? (state.playerTableau[pid].length + state.playerRoyals[pid].length) *
                  state.playerBuffs[pid].effects.passive.pointBonus
                : 0;
        return cardPoints + royalPoints + extra + buffBonus;
    };

    // Helper: Calculate player's total crowns
    const getCrowns = (pid: PlayerKey): number => {
        const cardCrowns = [...state.playerTableau[pid], ...state.playerRoyals[pid]].reduce(
            (a, c) => a + (c.crowns || 0),
            0
        );
        const extra = state.extraCrowns ? state.extraCrowns[pid] : 0;
        return cardCrowns + extra;
    };

    // Helper: Get points from a specific color in tableau
    const getColorPoints = (pid: PlayerKey, color: GemColor): number => {
        return state.playerTableau[pid]
            .filter((c) => c.bonusColor === color && !c.isBuff) // ✅ 排除虚拟卡
            .reduce((a, c) => a + c.points, 0);
    };

    // Check primary win conditions
    if (getPoints(state.turn) >= POINTS_GOAL || getCrowns(state.turn) >= CROWNS_GOAL) {
        state.winner = state.turn;
        return;
    }

    // Check single-color win condition (unless disabled by buff)
    if (!DISABLE_SINGLE_COLOR) {
        for (const color of BONUS_COLORS) {
            if (getColorPoints(state.turn, color) >= SINGLE_COLOR_GOAL) {
                state.winner = state.turn;
                return;
            }
        }
    }

    // ========== ROYAL MILESTONE CHECKS ==========
    const crowns = getCrowns(state.turn);
    const milestones = state.royalMilestones[state.turn];

    // Check if player reached 3 or 6 crowns milestone
    if ((crowns >= 3 && !milestones[3]) || (crowns >= 6 && !milestones[6])) {
        if (state.royalDeck.length > 0) {
            const milestoneHit = crowns >= 6 && !milestones[6] ? 6 : 3;
            state.royalMilestones[state.turn][milestoneHit] = true;
            state.gameMode = GAME_PHASES.SELECT_ROYAL;
            state.nextPlayerAfterRoyal = nextPlayer;
            return;
        }
    }

    // ========== GEM CAPACITY CHECK ==========
    const invToCheck = instantInv || state.inventories[state.turn];
    const totalGems = Object.values(invToCheck).reduce((a, b) => a + b, 0);

    // Dynamic gem cap (some buffs increase it to 11 or 12)
    const gemCap = state.playerBuffs?.[state.turn]?.effects?.passive?.gemCap || 10;

    if (totalGems > gemCap) {
        // Enter discard phase, don't switch turn yet
        state.gameMode = GAME_PHASES.DISCARD_EXCESS_GEMS;
        if (!state.nextPlayerAfterRoyal) {
            state.nextPlayerAfterRoyal = nextPlayer;
        }
        return;
    }

    // ========== NORMAL TURN TRANSITION ==========
    state.turn = nextPlayer;
    state.gameMode = GAME_PHASES.IDLE;
    state.nextPlayerAfterRoyal = null;
};
