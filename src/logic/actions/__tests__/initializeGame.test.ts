import { describe, it, expect } from 'vitest';
import { handleInit, handleInitDraft } from '../buffActions';
import { BUFFS, GAME_PHASES } from '../../../constants';

describe('Game Initialization Direct', () => {
    it('handleInit should create game state', () => {
        const payload = {
            board: Array.from({ length: 5 }, () =>
                Array.from({ length: 5 }, () => ({ type: { id: 'red' } }))
            ),
            bag: [],
            market: { 1: [], 2: [], 3: [] },
            decks: { 1: [], 2: [], 3: [] },
        };

        const result = handleInit(null, payload);

        expect(result).toBeDefined();
        expect(result.turn).toBe('p1');
        expect(result.gameMode).toBe('IDLE');
        expect(result.playerBuffs.p1).toBeDefined();
        expect(result.playerBuffs.p2).toBeDefined();
    });

    it('handleInitDraft should create draft state', () => {
        const payload = {
            board: Array.from({ length: 5 }, () =>
                Array.from({ length: 5 }, () => ({ type: { id: 'red' } }))
            ),
            bag: [],
            market: { 1: [], 2: [], 3: [] },
            decks: { 1: [], 2: [], 3: [] },
            draftPool: [BUFFS.PRIVILEGE_FAVOR, BUFFS.HEAD_START],
            buffLevel: 1,
        };

        const result = handleInitDraft(null, payload);

        expect(result).toBeDefined();
        expect(result.gameMode).toBe('DRAFT_PHASE');
        expect(result.turn).toBe('p2');
        expect(result.draftPool.length).toBe(2);
        expect(result.buffLevel).toBe(1);
    });
});
