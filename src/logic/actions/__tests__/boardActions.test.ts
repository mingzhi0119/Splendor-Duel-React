/**
 * Example test suite for boardActions
 *
 * Demonstrates how to test pure action handlers with Vitest
 * Each test validates that the action correctly modifies game state
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleDiscardGem } from '../boardActions';
import { INITIAL_STATE_SKELETON } from '../../initialState';
import { GEM_TYPES } from '../../../constants';

describe('boardActions', () => {
    let testState;

    beforeEach(() => {
        // Create a fresh copy of initial state for each test
        testState = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON));
        testState.turn = 'p1';

        // Give p1 some gems to work with
        testState.inventories.p1 = {
            blue: 5,
            white: 3,
            green: 2,
            black: 1,
            red: 2,
            gold: 1,
            pearl: 0,
        };
    });

    describe('handleDiscardGem', () => {
        it('should reduce gem count when player discards a gem', () => {
            const initialBlue = testState.inventories.p1.blue;

            // Action: player p1 discards a blue gem
            const updatedState = handleDiscardGem(testState, 'blue');

            // Assertion: blue count decreased by 1
            expect(updatedState.inventories.p1.blue).toBe(initialBlue - 1);
        });

        it('should not reduce gems below zero', () => {
            // Give p1 zero white gems
            testState.inventories.p1.white = 0;

            const updatedState = handleDiscardGem(testState, 'white');

            // Should still be 0 (not negative)
            expect(updatedState.inventories.p1.white).toBe(0);
        });

        it('should add discarded gem to bag', () => {
            const initialBagLength = testState.bag.length;

            const updatedState = handleDiscardGem(testState, 'red');

            // Bag should have one more item after discarding
            expect(updatedState.bag.length).toBe(initialBagLength + 1);
            // The discarded gem should be in the bag
            const discardedGem = updatedState.bag[updatedState.bag.length - 1] as any;
            expect(discardedGem.type.id).toBe('red');
        });

        it('should transition to next player when total gems <= 10', () => {
            // Set up: p1 has exactly 11 gems (over the limit)
            testState.inventories.p1 = {
                blue: 3,
                white: 3,
                green: 2,
                black: 1,
                red: 1,
                gold: 1,
                pearl: 0,
            };
            testState.gameMode = 'DISCARD_EXCESS_GEMS';
            testState.nextPlayerAfterRoyal = null;

            // Action: discard blue gem
            const updatedState = handleDiscardGem(testState, 'blue');

            // Calculate total gems after discard
            const totalGems = Object.values(updatedState.inventories.p1).reduce((a, b) => a + b, 0);

            // If total is <= 10, turn should change to p2
            if (totalGems <= 10) {
                expect(updatedState.turn).toBe('p2');
            }
        });
    });

    describe('edge cases', () => {
        it('should handle empty gem inventory gracefully', () => {
            testState.inventories.p1 = {
                blue: 0,
                white: 0,
                green: 0,
                black: 0,
                red: 0,
                gold: 0,
                pearl: 0,
            };

            const updatedState = handleDiscardGem(testState, 'blue');

            // Should not crash, all values should remain 0
            expect(updatedState.inventories.p1.blue).toBe(0);
        });

        it('should preserve other player gems when discarding', () => {
            const initialP2Gems = JSON.parse(JSON.stringify(testState.inventories.p2));

            const updatedState = handleDiscardGem(testState, 'red');

            // p2 inventory should not change
            expect(updatedState.inventories.p2).toEqual(initialP2Gems);
        });
    });
});
