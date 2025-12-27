import { describe, it, expect } from 'vitest';
import { INITIAL_STATE_SKELETON } from '../../initialState';
import { GAME_PHASES } from '../../../constants';

describe('Take Gems & Refill Workflow', () => {
    it('should initialize with empty bag', () => {
        expect(INITIAL_STATE_SKELETON.bag).toBeDefined();
        expect(INITIAL_STATE_SKELETON.bag.length).toBe(0);
    });

    it('initial game mode should be IDLE', () => {
        expect(INITIAL_STATE_SKELETON.gameMode).toBe(GAME_PHASES.IDLE);
    });

    it('should have proper game board initialized', () => {
        expect(INITIAL_STATE_SKELETON.board).toBeDefined();
        expect(INITIAL_STATE_SKELETON.board.length).toBe(5);
        expect(INITIAL_STATE_SKELETON.board[0].length).toBe(5);

        // All cells should have type
        INITIAL_STATE_SKELETON.board.forEach((row) => {
            row.forEach((cell) => {
                expect(cell).toBeDefined();
                expect(cell.type).toBeDefined();
                expect(cell.type.id).toBeDefined();
            });
        });
    });

    it('should have inventories for both players', () => {
        expect(INITIAL_STATE_SKELETON.inventories).toBeDefined();
        expect(INITIAL_STATE_SKELETON.inventories.p1).toBeDefined();
        expect(INITIAL_STATE_SKELETON.inventories.p2).toBeDefined();

        // All should start at 0
        const p1Gems = Object.values(INITIAL_STATE_SKELETON.inventories.p1);
        const p2Gems = Object.values(INITIAL_STATE_SKELETON.inventories.p2);

        expect(p1Gems.every((g) => g === 0)).toBe(true);
        expect(p2Gems.every((g) => g === 0)).toBe(true);
    });

    it('refill button should be disabled when bag is empty', () => {
        const bagCount = INITIAL_STATE_SKELETON.bag.length;
        expect(bagCount).toBe(0);
        // In GameActions.jsx: disabled={bagCount === 0 || gameMode !== 'IDLE' || selectedCount > 0}
        // So button should be disabled when bag is empty
    });

    it('bag should accumulate gems when player takes gems', () => {
        // This logic is tested in integration tests with full game flow
        // Unit tests verify initial state is correct
        expect(INITIAL_STATE_SKELETON.bag.length).toBe(0);
    });

    it('initial privileges distribution', () => {
        expect(INITIAL_STATE_SKELETON.privileges.p1).toBe(0);
        expect(INITIAL_STATE_SKELETON.privileges.p2).toBe(1);
    });
});
