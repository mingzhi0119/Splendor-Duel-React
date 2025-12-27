/**
 * Royal Action Handlers
 *
 * Handles royal card selection and related abilities
 */

import { ABILITIES, GAME_PHASES, GEM_TYPES } from '../../constants';
import { addFeedback, addPrivilege } from '../stateHelpers';
import { finalizeTurn } from '../turnManager';
import { GameState, RoyalCard } from '../../types';

export interface SelectRoyalPayload {
    card: RoyalCard;
}

export const handleForceRoyalSelection = (state: GameState): GameState => {
    state.gameMode = GAME_PHASES.SELECT_ROYAL;
    state.nextPlayerAfterRoyal = state.turn === 'p1' ? 'p2' : 'p1';
    state.pendingReserve = null;
    state.pendingBuy = null;
    state.bonusGemTarget = null;
    return state;
};

export const handleSelectRoyalCard = (state: GameState, payload: SelectRoyalPayload): GameState => {
    const { card } = payload;
    const player = state.turn;

    // Add card to player's royals
    state.royalDeck = state.royalDeck.filter((c) => c.id !== card.id);
    state.playerRoyals[player].push(card);

    // Add crown feedback
    if ((card as any).crowns > 0) addFeedback(state, player, 'crown', (card as any).crowns);

    // Determine next turn based on abilities
    const abilities = Array.isArray(card.ability)
        ? card.ability
        : card.ability
          ? [card.ability]
          : [];
    let nextTurn = state.nextPlayerAfterRoyal || (player === 'p1' ? 'p2' : 'p1');

    // AGAIN ability: repeat turn
    if (abilities.includes(ABILITIES.AGAIN.id as any)) {
        nextTurn = player;
    }

    // BONUS_GEM ability: take a gem
    if (abilities.includes(ABILITIES.BONUS_GEM.id as any)) {
        const hasGem = state.board.some((row) =>
            row.some((g) => g.type.id === (card.bonusColor as any))
        );
        if (hasGem) {
            state.gameMode = GAME_PHASES.BONUS_ACTION;
            state.bonusGemTarget =
                GEM_TYPES[card.bonusColor.toUpperCase() as keyof typeof GEM_TYPES];
            if (!state.nextPlayerAfterRoyal) state.nextPlayerAfterRoyal = nextTurn;
            return state;
        } else {
            state.toastMessage = 'No matching gem available - Skill skipped';
        }
    }

    // STEAL ability: steal gem from opponent
    if (abilities.includes(ABILITIES.STEAL.id as any)) {
        const opponent = player === 'p1' ? 'p2' : 'p1';
        const oppBuff = state.playerBuffs?.[opponent];

        // Check if opponent has Pacifist buff
        if (oppBuff?.effects?.passive?.immuneNegative) {
            state.toastMessage = 'Steal blocked by Pacifist!';
        } else {
            const hasStealable = Object.entries(state.inventories[opponent]).some(
                ([key, count]) => key !== 'gold' && count > 0
            );

            if (hasStealable) {
                state.gameMode = GAME_PHASES.STEAL_ACTION;
                if (!state.nextPlayerAfterRoyal) state.nextPlayerAfterRoyal = nextTurn;
                return state;
            } else {
                state.toastMessage = 'No stealable gem from opponent - Skill skipped';
            }
        }
    }

    // SCROLL ability: gain privilege
    if (abilities.includes(ABILITIES.SCROLL.id as any)) {
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
