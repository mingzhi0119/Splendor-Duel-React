/**
 * Type declarations for JavaScript modules
 *
 * These allow TypeScript to recognize .js files that don't have .d.ts counterparts
 */

declare module '../constants' {
    export const GRID_SIZE: number;
    export const GAME_PHASES: Record<string, string>;
    export const GEM_TYPES: Record<string, any>;
    export const INITIAL_COUNTS: Record<string, number>;
    export const BONUS_COLORS: string[];
    export const SPIRAL_ORDER: Array<[number, number]>;
    export const ABILITIES: Record<string, any>;
    export const ROYAL_CARDS: any[];
    export const BUFF_LEVELS: Record<number, string>;
    export const BUFFS: Record<string, any>;
}

declare module '../utils' {
    export function generateGemPool(): any[];
    export function generateDeck(level: number): any[];
    export function shuffleArray(arr: any[]): any[];
    export function calculateTransaction(
        card: any,
        inventory: any,
        tableau: any,
        buff: any
    ): { goldCost: number; gemsPaid: Record<string, number> };
}

declare module '../logic/initialState' {
    export const INITIAL_STATE_SKELETON: any;
}

declare module '../logic/interactionManager' {
    export interface GemCoord {
        r: number;
        c: number;
    }
    export interface GemClickResult {
        action?: {
            type: string;
            payload: Record<string, any>;
        };
        newSelection?: GemCoord[];
        error?: string;
    }
    export function processGemClick(
        gameState: any,
        r: number,
        c: number,
        currentSelection?: GemCoord[]
    ): GemClickResult;
    export function processOpponentGemClick(gameState: any, gemId: string): GemClickResult;
}
