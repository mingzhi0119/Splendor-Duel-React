import { describe, it, expect, beforeEach } from 'vitest';
import { handleBuyCard } from '../marketActions';
import { handleStealGem } from '../boardActions';
import { INITIAL_STATE_SKELETON } from '../../initialState';
import { ABILITIES, GAME_PHASES } from '../../../constants';
import { GameState } from '../../../types';

describe('Steal Mechanics', () => {
    let baseState: GameState;

    beforeEach(() => {
        baseState = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON));
        baseState.turn = 'p1';
        baseState.inventories.p1 = {
            red: 0,
            green: 0,
            blue: 0,
            white: 0,
            black: 0,
            pearl: 0,
            gold: 5,
        };
        baseState.inventories.p2 = {
            blue: 1,
            red: 0,
            green: 0,
            white: 0,
            black: 0,
            pearl: 0,
            gold: 0,
        };
        baseState.playerBuffs = { p1: {} as any, p2: {} as any };
        baseState.playerTableau = { p1: [], p2: [] };
        baseState.playerReserved = { p1: [], p2: [] };
        baseState.playerRoyals = { p1: [], p2: [] };
        baseState.market = { 1: [], 2: [], 3: [] };
        baseState.decks = { 1: [], 2: [], 3: [] };
    });

    it('should enter STEAL_ACTION mode when buying a card with steal ability', () => {
        const stealCard = {
            id: 'steal-card',
            level: 2,
            cost: { gold: 1 },
            points: 1,
            bonusColor: 'blue',
            ability: 'steal',
        } as any;

        const action = {
            card: stealCard,
            source: 'market' as const,
        };

        const nextState = handleBuyCard(baseState, action);

        expect(nextState.gameMode).toBe(GAME_PHASES.STEAL_ACTION);
        expect(nextState.turn).toBe('p1');
        expect(nextState.nextPlayerAfterRoyal).toBe('p2'); // Should be p2 after steal
    });

    it('should execute steal and switch turn', () => {
        baseState.gameMode = GAME_PHASES.STEAL_ACTION;
        baseState.nextPlayerAfterRoyal = 'p2';

        const action = {
            gemId: 'blue' as any,
        };

        const nextState = handleStealGem(baseState, action);

        expect(nextState.inventories.p1.blue).toBe(1);
        expect(nextState.inventories.p2.blue).toBe(0);
        expect(nextState.gameMode).toBe(GAME_PHASES.IDLE);
        expect(nextState.turn).toBe('p2');
    });

    it('should handle AGAIN + STEAL combo', () => {
        const complexCard = {
            id: 'complex-card',
            level: 2,
            cost: { gold: 1 },
            points: 1,
            bonusColor: 'blue',
            ability: ['again', 'steal'],
        } as any;

        const action = {
            card: complexCard,
            source: 'market' as const,
        };

        const nextState = handleBuyCard(baseState, action);

        expect(nextState.gameMode).toBe(GAME_PHASES.STEAL_ACTION);
        expect(nextState.nextPlayerAfterRoyal).toBe('p1'); // AGAIN means next is p1

        const afterSteal = handleStealGem(nextState, { gemId: 'blue' as any });
        expect(afterSteal.turn).toBe('p1'); // Stays p1's turn
        expect(afterSteal.gameMode).toBe(GAME_PHASES.IDLE);
    });
});
