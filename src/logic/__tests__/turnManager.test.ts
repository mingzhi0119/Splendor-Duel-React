import { describe, it, expect, beforeEach } from 'vitest';
import { finalizeTurn } from '../turnManager';
import { INITIAL_STATE_SKELETON } from '../initialState';
import { produce } from 'immer';
import { GameState } from '../../types';

describe('turnManager', () => {
    let baseState: GameState;

    beforeEach(() => {
        baseState = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON));
        baseState.turn = 'p1';
        // Ensure nested objects exist to avoid undefined errors if skeleton is minimal
        if (!baseState.playerBuffs) baseState.playerBuffs = { p1: {} as any, p2: {} as any };
        if (!baseState.playerTableau) baseState.playerTableau = { p1: [], p2: [] };
        if (!baseState.playerRoyals) baseState.playerRoyals = { p1: [], p2: [] };
        if (!baseState.royalMilestones) baseState.royalMilestones = { p1: {}, p2: {} };
        if (!baseState.inventories) baseState.inventories = { p1: {} as any, p2: {} as any };
    });

    const createState = (overrides = {}) => {
        return produce(baseState, (draft) => {
            Object.assign(draft, overrides);
        });
    };

    describe('finalizeTurn', () => {
        it('should switch turn to next player', () => {
            const state = produce(baseState, (draft) => {
                finalizeTurn(draft, 'p2');
            }) as any;

            expect(state.turn).toBe('p2');
            expect(state.gameMode).toBe('IDLE');
        });

        describe('Win Conditions', () => {
            it('should declare winner if points goal reached (default 20)', () => {
                const startState = createState({
                    extraPoints: { p1: 20 },
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                }) as any;

                expect(state.winner).toBe('p1');
            });

            it('should declare winner if crowns goal reached (default 10)', () => {
                const startState = createState({
                    extraCrowns: { p1: 10 },
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                }) as any;

                expect(state.winner).toBe('p1');
            });

            it('should declare winner if single color points reached (default 10)', () => {
                // Need to add cards to tableau
                const card = { points: 10, bonusColor: 'blue', isBuff: false } as any;
                const startState = produce(baseState, (draft) => {
                    draft.playerTableau.p1.push(card);
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                }) as any;

                expect(state.winner).toBe('p1');
            });
        });

        describe('Royal Milestones', () => {
            it('should trigger royal selection at 3 crowns', () => {
                const startState = createState({
                    extraCrowns: { p1: 3 },
                    royalDeck: [{ id: 'royal1' }] as any, // ensure deck not empty
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                }) as any;

                expect(state.gameMode).toBe('SELECT_ROYAL');
                expect(state.royalMilestones.p1[3]).toBe(true);
                expect(state.nextPlayerAfterRoyal).toBe('p2'); // Should return to this after royal
                expect(state.winner).toBe(null); // Game not over
            });

            it('should trigger royal selection at 6 crowns', () => {
                const startState = createState({
                    extraCrowns: { p1: 6 },
                    royalDeck: [{ id: 'royal1' }],
                    royalMilestones: { p1: { 3: true }, p2: {} }, // 3 already taken
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                }) as any;

                expect(state.gameMode).toBe('SELECT_ROYAL');
                expect(state.royalMilestones.p1[6]).toBe(true);
            });
        });

        describe('Gem Capacity', () => {
            it('should trigger discard phase if gems > 10', () => {
                const startState = produce(baseState, (draft) => {
                    draft.inventories.p1 = { blue: 11 } as any;
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                }) as any;

                expect(state.gameMode).toBe('DISCARD_EXCESS_GEMS');
                expect(state.nextPlayerAfterRoyal).toBe('p2');
                // Turn should NOT change yet
                expect(state.turn).toBe('p1');
            });

            it('should respect buffed gem capacity', () => {
                const startState = produce(baseState, (draft) => {
                    draft.inventories.p1 = { blue: 11 } as any;
                    draft.playerBuffs.p1 = {
                        effects: { passive: { gemCap: 12 } },
                    } as any;
                });

                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                }) as any;

                // 11 <= 12, so valid. Should switch turn.
                expect(state.turn).toBe('p2');
                expect(state.gameMode).toBe('IDLE');
            });
        });

        describe('Buff Stacking and Numerical Limits', () => {
            it('should handle extremely high point values without crashing', () => {
                const startState = createState({
                    extraPoints: { p1: Number.MAX_SAFE_INTEGER - 100 },
                });
                const state = produce(startState, (draft) => {
                    draft.playerTableau.p1.push({ points: 200, bonusColor: 'red' } as any);
                    finalizeTurn(draft, 'p2');
                }) as any;
                expect(state.winner).toBe('p1');
            });

            it('should correctly apply pointBonus from buffs', () => {
                const startState = produce(baseState, (draft) => {
                    draft.playerBuffs.p1 = {
                        id: 'test',
                        level: 3,
                        label: 'Test',
                        desc: '',
                        effects: { passive: { pointBonus: 5 } },
                    } as any;
                    draft.playerTableau.p1.push({ points: 0, bonusColor: 'red' } as any);
                    draft.playerRoyals.p1.push({
                        points: 0,
                        bonusColor: 'blue',
                        ability: 'none',
                        label: '',
                    } as any);
                });
                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                }) as any;
                // 2 items * 5 bonus = 10 points

                // Win condition is 20 by default. Should not win yet.
                expect(state.winner).toBe(null);

                const winningState = produce(startState, (draft) => {
                    // Add more items to reach 20 points
                    draft.playerTableau.p1.push({ points: 0, bonusColor: 'green' } as any);
                    draft.playerTableau.p1.push({ points: 0, bonusColor: 'white' } as any);
                    finalizeTurn(draft, 'p2');
                }) as any;
                // 4 items * 5 bonus = 20 points. Should win.
                expect(winningState.winner).toBe('p1');
            });

            it('should handle multiple crown milestones in one turn', () => {
                // If a player somehow gets 6 crowns in one go (e.g. initial buff + royal card)
                const startState = createState({
                    extraCrowns: { p1: 6 },
                    royalDeck: [{ id: 'r1' }, { id: 'r2' }],
                    royalMilestones: { p1: { 3: false, 6: false }, p2: {} },
                });
                const state = produce(startState, (draft) => {
                    finalizeTurn(draft, 'p2');
                }) as any;
                // Should hit 6 milestone first? Or 3?

                // current logic: if ((crowns >= 3 && !milestones[3]) || (crowns >= 6 && !milestones[6]))
                // it picks one.
                expect(state.gameMode).toBe('SELECT_ROYAL');
                expect(state.royalMilestones.p1[6] || state.royalMilestones.p1[3]).toBe(true);
            });
        });
    });
});
