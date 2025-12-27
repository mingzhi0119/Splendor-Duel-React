/**
 * Buff Action Handlers
 *
 * Handles game initialization with buffs and buff selection during draft
 */

import { INITIAL_STATE_SKELETON } from '../initialState';
import { GAME_PHASES, BUFFS } from '../../constants';
import { GameState, PlayerKey, Buff, GemColor } from '../../types';

export interface BuffInitPayload {
    initRandoms?: Record<PlayerKey, any>;
}

export interface SelectBuffPayload {
    buffId: string;
    randomColor?: GemColor;
    initRandoms?: Record<PlayerKey, any>;
}

/**
 * Helper: Apply buff initialization effects (onInit)
 */
export const applyBuffInitEffects = (
    state: GameState,
    initRandoms: Record<PlayerKey, any> = {} as Record<PlayerKey, any>
): GameState => {
    // Apply per-player buff init effects
    (['p1', 'p2'] as const).forEach((pid) => {
        const buff = state.playerBuffs[pid];
        const randoms = initRandoms[pid] || {};

        if (buff && buff.effects) {
            if (!state.playerBuffs[pid].state) state.playerBuffs[pid].state = {};

            // Special case: Extortion buff
            if (buff.id === 'extortion') {
                (state.playerBuffs[pid].state as any).refillCount = 0;
            }

            // Special case: Pacifist buff gains extra privilege
            if (buff.id === 'pacifist') {
                state.privileges[pid] = Math.min(3, state.privileges[pid] + 1);
            }

            // Apply onInit effects
            if (buff.effects.onInit) {
                const fx = buff.effects.onInit;

                // Extra privileges
                if (fx.privilege) {
                    state.privileges[pid] += fx.privilege;
                }

                // Random basic gems
                if (fx.randomGem) {
                    const count = typeof fx.randomGem === 'number' ? fx.randomGem : 1;
                    const randColors = randoms.randomGems;
                    // This is a pure function; random values must be provided from the caller.
                    if (randColors) {
                        randColors.slice(0, count).forEach((randColor: GemColor) => {
                            state.inventories[pid][randColor]++;
                        });
                    }
                }

                // Crowns
                if (fx.crowns) {
                    if (!state.extraCrowns) state.extraCrowns = { p1: 0, p2: 0 };
                    state.extraCrowns[pid] += fx.crowns;
                }

                // Pearls
                if (fx.pearl) {
                    state.inventories[pid].pearl += fx.pearl;
                }

                // Gold
                if (fx.gold) {
                    state.inventories[pid].gold += fx.gold;
                }

                // Reserve card
                if (fx.reserveCard) {
                    const lvl = randoms.reserveCardLevel as 1 | 2 | 3;
                    // This is a pure function; random values must be provided from the caller.
                    if (lvl && state.decks[lvl].length > 0) {
                        const card = state.decks[lvl].pop()!;
                        state.playerReserved[pid].push(card);
                    }
                }
            }

            // ✅ Color Preference 虚拟卡处理（必须在 onInit 之后）
            if (buff.id === 'color_preference') {
                const discountColor = randoms.preferenceColor;
                if (
                    discountColor &&
                    !state.playerTableau[pid].some(
                        (c) => c.isBuff && c.id.startsWith('buff-color-pref')
                    )
                ) {
                    const dummyCard = {
                        id: `buff-color-pref-${pid}-${Date.now()}`,
                        points: 0,
                        crowns: 0,
                        bonusColor: discountColor as GemColor,
                        bonusCount: 1, // 提供 1 个折扣
                        level: 0 as 1 | 2 | 3,
                        cost: {} as Record<GemColor, number>,
                        image: null,
                        isBuff: true,
                    };
                    if (!state.playerTableau[pid]) state.playerTableau[pid] = [];
                    state.playerTableau[pid].push(dummyCard as any);
                }
            }
        }
    });

    // Check for gem cap overflow
    const p1Cap = state.playerBuffs?.p1?.effects?.passive?.gemCap || 10;
    const p1Total = Object.values(state.inventories.p1).reduce((a, b) => a + b, 0);

    if (p1Total > p1Cap) {
        state.turn = 'p1';
        state.gameMode = GAME_PHASES.DISCARD_EXCESS_GEMS;
        state.nextPlayerAfterRoyal = 'p1';
    } else {
        const p2Cap = state.playerBuffs?.p2?.effects?.passive?.gemCap || 10;
        const p2Total = Object.values(state.inventories.p2).reduce((a, b) => a + b, 0);
        if (p2Total > p2Cap) {
            state.turn = 'p2';
            state.gameMode = GAME_PHASES.DISCARD_EXCESS_GEMS;
            state.nextPlayerAfterRoyal = 'p1';
        }
    }

    return state;
};

/**
 * Initialize game with selected buffs and game setup
 */
export const handleInit = (state: GameState | null, payload: BuffInitPayload & any): GameState => {
    // Create fresh skeleton to prevent mutating constant
    const skeleton = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON)) as GameState;

    // Combine skeleton with payload, ensuring payload properties overwrite defaults.
    // This restores the original logic from the JS version.
    const initializedState = { ...skeleton, ...payload };

    // Ensure playerBuffs are initialized if not provided in payload.
    if (!initializedState.playerBuffs) {
        initializedState.playerBuffs = { p1: BUFFS.NONE, p2: BUFFS.NONE };
    }

    return applyBuffInitEffects(initializedState, payload.initRandoms);
};

/**
 * Initialize draft phase with buff selection
 */
export const handleInitDraft = (state: GameState | null, payload: any): GameState => {
    const { draftPool, buffLevel, isPvE, ...gameSetup } = payload;
    // Create fresh skeleton
    const newState = JSON.parse(JSON.stringify(INITIAL_STATE_SKELETON)) as GameState;

    newState.draftPool = draftPool;
    newState.buffLevel = buffLevel;
    newState.isPvE = !!isPvE;
    newState.pendingSetup = gameSetup;
    newState.draftOrder = ['p2', 'p1'];
    newState.gameMode = GAME_PHASES.DRAFT_PHASE;
    newState.turn = 'p2';

    return newState;
};

/**
 * Handle player selecting a buff during draft
 */
export const handleSelectBuff = (
    state: GameState,
    payload: SelectBuffPayload | string
): GameState => {
    const buffId = typeof payload === 'object' ? payload.buffId : payload;
    const randomColor = typeof payload === 'object' ? payload.randomColor : null;
    const initRandoms = typeof payload === 'object' ? payload.initRandoms : {};
    const player = state.turn;

    // Find and assign selected buff
    const selectedBuff = state.draftPool.find((b) => b.id === buffId);
    if (selectedBuff) {
        // Cast selectedBuff to Buff type and add state
        const buffWithState = selectedBuff as any as Buff;
        state.playerBuffs[player] = { ...buffWithState, state: {} };
        state.draftPool = state.draftPool.filter((b) => b.id !== buffId);

        // Special: Color Preference buff
        if (selectedBuff.id === 'color_preference' && randomColor) {
            (state.playerBuffs[player].state as any).discountColor = randomColor;

            // Add dummy card for visual representation
            const dummyCard = {
                id: `buff-color-pref-${player}-${Date.now()}`,
                points: 0,
                crowns: 0,
                bonusColor: randomColor as GemColor,
                bonusCount: 1,
                level: 0 as any,
                cost: {},
                image: null,
                isBuff: true,
            } as any;

            if (!state.playerTableau[player]) state.playerTableau[player] = [];
            state.playerTableau[player].push(dummyCard);
        }
    }

    // Draft phase progression
    const currentIdx = state.draftOrder.indexOf(player);
    if (currentIdx !== -1) {
        const nextPlayer = state.draftOrder[currentIdx + 1];

        if (nextPlayer) {
            // Next player's turn to select buff
            state.turn = nextPlayer;
        } else {
            // Draft complete, initialize game
            const setup = state.pendingSetup as any;
            if (setup) {
                state.board = setup.board;
                state.bag = setup.bag;
                state.market = setup.market;
                state.decks = setup.decks;
            }
            state.pendingSetup = null;
            state.draftOrder = [];
            state.gameMode = GAME_PHASES.IDLE;
            state.turn = 'p1';

            return applyBuffInitEffects(state, initRandoms as Record<PlayerKey, any>);
        }
    }

    return state;
};
