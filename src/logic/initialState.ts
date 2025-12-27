import { GRID_SIZE, ROYAL_CARDS, BUFFS, GAME_PHASES } from '../constants';
import { GameState } from '../types';

export const INITIAL_STATE_SKELETON: GameState = {
    board: Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => ({
            type: { id: 'empty', color: '', border: '', label: '' },
            uid: 'skeleton',
        }))
    ),
    bag: [],

    // ========== TURN & PHASE ==========
    turn: 'p1',
    gameMode: GAME_PHASES.IDLE,
    isPvE: false,
    pendingReserve: null,
    bonusGemTarget: null,
    pendingBuy: null,
    nextPlayerAfterRoyal: null,
    decks: { 1: [], 2: [], 3: [] },
    market: { 1: [], 2: [], 3: [] },
    inventories: {
        p1: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
        p2: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
    },
    privileges: { p1: 0, p2: 1 },
    playerTableau: { p1: [], p2: [] },
    playerReserved: { p1: [], p2: [] },
    royalDeck: ROYAL_CARDS || [],
    playerRoyals: { p1: [], p2: [] },
    royalMilestones: { p1: { 3: false, 6: false }, p2: { 3: false, 6: false } },
    extraPoints: { p1: 0, p2: 0 },
    extraCrowns: { p1: 0, p2: 0 },
    playerBuffs: { p1: BUFFS.NONE, p2: BUFFS.NONE },
    draftPool: [],
    draftOrder: [],
    buffLevel: 0,
    pendingSetup: null,
    privilegeGemCount: 0,
    activeModal: null,
    lastFeedback: null,
    toastMessage: null,
    winner: null,
};
