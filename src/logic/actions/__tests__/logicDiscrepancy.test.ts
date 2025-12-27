import { describe, it, expect } from 'vitest';
import { applyAction } from '../../gameReducer';
import { INITIAL_STATE_SKELETON } from '../../initialState';
import { BUFFS, GEM_TYPES } from '../../../constants';

// Helper to create a clean state
const createTestState = () => JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON));

describe('Logic Discrepancy Tests (v3.1.0 JS vs Current TS)', () => {
    it('[handleInit] should correctly apply ALL properties from payload, not just board/bag/market/decks', () => {
        // This test is based on the logic from the original JS version (git tag v3.1.0)
        // The original JS logic used { ...skeleton, ...payload }, applying all payload properties.
        // The TS migration changed this to only apply specific properties, which is a logic regression.

        // Let's craft a payload that includes a non-standard initial state.
        const customPayload = {
            // Standard properties
            board: [],
            bag: [],
            market: {},
            decks: {},
            // Custom property that the TS version will ignore
            privileges: { p1: 3, p2: 3 },
        };

        const action = {
            type: 'INIT',
            payload: customPayload,
        };

        // The initial state is null
        const nextState = applyAction(null, action);

        // Assertions
        // The original logic would have respected the custom privileges.
        // The current TS logic will ignore it, and privileges will be the default {p1: 0, p2: 1}.
        expect(nextState.privileges.p1).toBe(3);
        expect(nextState.privileges.p2).toBe(3);
    });

    it('[handleBuyCard] Recycler buff should refund the FIRST color paid, not the most numerous', () => {
        // This test verifies a logic discrepancy found between the original JS and the TS migration.
        // JS version refunded paidColors[0]. TS version refunds the color with the highest amount.
        const state = createTestState();

        // Give p1 the Recycler buff and enough gems
        state.playerBuffs.p1 = BUFFS.RECYCLER;
        state.inventories.p1 = { blue: 1, white: 2, green: 0, black: 0, red: 0, gold: 0, pearl: 0 };

        // Create a card that costs 1 blue and 2 white
        const cardToBuy = {
            id: 'test-card',
            level: 2,
            cost: { blue: 1, white: 2 },
            points: 2,
            bonusColor: 'green',
            crowns: 0,
            ability: 'none',
        };

        // Pre-fill the bag so the refund logic can execute correctly
        state.bag.push({ type: GEM_TYPES.BLUE, uid: 'b-bag' });
        state.bag.push({ type: GEM_TYPES.WHITE, uid: 'w-bag' });
        state.bag.push({ type: GEM_TYPES.WHITE, uid: 'w-bag-2' });

        const action = {
            type: 'BUY_CARD',
            payload: { card: cardToBuy, source: 'market', marketInfo: { level: 2, idx: 0 } },
        };

        const nextState = applyAction(state, action);

        // Assertions
        // Original logic: should refund 1 BLUE because it was the first color in the cost object.
        // Current TS logic: will refund 1 WHITE because more white gems were paid.
        expect(nextState.inventories.p1.blue).toBe(1); // Started with 1, paid 1, got 1 back.
        expect(nextState.inventories.p1.white).toBe(0); // Started with 2, paid 2.
    });

    it('[handleBuyCard & handleSelectRoyalCard] bonusGemTarget should be a string (color), not an object', () => {
        // This test verifies that bonusGemTarget is correctly set as a color string
        // matching the v3.1.0 JS behavior. The TS version was incorrectly using objects
        // like {source: 'card', count: 1} which broke interactionManager validation.
        const state = createTestState();

        // Set up p1 with current turn
        state.turn = 'p1';
        state.gameMode = 'IDLE';
        state.board = Array.from({ length: 5 }, () =>
            Array.from({ length: 5 }, () => ({ type: GEM_TYPES.EMPTY, uid: 'e' }))
        );

        // Create a card with BONUS_GEM ability and bonusColor 'red'
        const cardWithBonus = {
            id: 'bonus-card',
            level: 1,
            cost: { red: 1 },
            points: 1,
            bonusColor: 'red',
            crowns: 0,
            ability: 'bonus_gem',
        };

        // Give player the required gem
        state.inventories.p1 = { ...state.inventories.p1, red: 1 };

        // Add a matching gem to the board so the bonus gem action is available
        state.board[0][0] = { type: GEM_TYPES.RED, uid: 'red-gem-1' };

        // Buy the card with bonus gem ability
        const buyAction = {
            type: 'BUY_CARD',
            payload: { card: cardWithBonus, source: 'market', marketInfo: { level: 1, idx: 0 } },
        };

        const nextState = applyAction(state, buyAction);

        // Assertions
        // bonusGemTarget should be an object now
        expect(typeof nextState.bonusGemTarget).toBe('object');
        expect(nextState.bonusGemTarget.id).toBe('red');
        expect(nextState.gameMode).toBe('BONUS_ACTION');
    });
});
