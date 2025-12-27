import { validateGemSelection } from './validators';
import type { GameState, GemColor } from '../types.d';

/**
 * Gem coordinate in grid
 */
export interface GemCoord {
    r: number;
    c: number;
}

/**
 * Result of processing a gem click
 */
export interface GemClickResult {
    action?: {
        type: string;
        payload: Record<string, any>;
    };
    newSelection?: GemCoord[];
    error?: string;
}

/**
 * Handle player clicking on their own gems
 *
 * In IDLE mode: selects gems to take (max 3, must be contiguous)
 * In other modes: triggers specific actions based on game mode
 *
 * @param gameState - Current game state
 * @param r - Row coordinate
 * @param c - Column coordinate
 * @param currentSelection - Currently selected gems
 * @returns Result with action or new selection
 */
export const processGemClick = (
    gameState: GameState | null,
    r: number,
    c: number,
    currentSelection: GemCoord[] = []
): GemClickResult => {
    if (!gameState) return { error: 'Game not initialized' };
    if (gameState.winner) return { error: 'Game Over' };

    const gem = gameState.board[r][c];
    if (!gem || !gem.type || gem.type.id === 'empty') return { error: 'Empty cell' };

    switch (gameState.gameMode) {
        case 'BONUS_ACTION':
            if (gem.type.id !== gameState.bonusGemTarget?.id) {
                return { error: `Must select a ${gameState.bonusGemTarget?.label} gem!` };
            }
            return { action: { type: 'TAKE_BONUS_GEM', payload: { r, c } } };

        case 'RESERVE_WAITING_GEM':
            if (gem.type.id !== 'gold') {
                return { error: 'Must select a Gold gem!' };
            }
            if (gameState.pendingReserve?.isDeck) {
                return {
                    action: {
                        type: 'RESERVE_DECK',
                        payload: { ...gameState.pendingReserve, goldCoords: { r, c } },
                    },
                };
            } else {
                return {
                    action: {
                        type: 'RESERVE_CARD',
                        payload: { ...gameState.pendingReserve, goldCoords: { r, c } },
                    },
                };
            }

        case 'PRIVILEGE_ACTION':
            if (gem.type.id === 'gold') {
                return { error: 'Cannot use Privilege on Gold.' };
            }
            return { action: { type: 'USE_PRIVILEGE', payload: { r, c } } };

        case 'IDLE': {
            // Handle Selection Logic
            if (gem.type.id === 'gold') {
                return { error: 'Cannot take Gold directly!' };
            }

            const isSelected = currentSelection.some((s) => s.r === r && s.c === c);
            if (isSelected) {
                return {
                    newSelection: currentSelection.filter((g) => g.r !== r || g.c !== c),
                };
            }

            const newSelection = [...currentSelection, { r, c }];
            if (newSelection.length > 3) {
                return { error: 'Max 3 gems.' };
            }

            const check = validateGemSelection(newSelection);
            if (!check.valid) {
                return { error: check.error || 'Invalid selection' };
            }
            return { newSelection };
        }

        default:
            return { error: 'Invalid Game Mode for Gem Click' };
    }
};

/**
 * Handle player clicking on opponent's gems
 *
 * Only available in STEAL_ACTION mode
 *
 * @param gameState - Current game state
 * @param gemId - Gem color ID to steal
 * @returns Result with steal action or error
 */
export const processOpponentGemClick = (
    gameState: GameState | null,
    gemId: GemColor
): GemClickResult => {
    if (!gameState || gameState.winner) return { error: 'Game Over' };
    if (gameState.gameMode !== 'STEAL_ACTION') return { error: 'Not in Steal Mode' };

    if (gemId === 'gold') return { error: 'Cannot steal Gold!' };

    const opponent = gameState.turn === 'p1' ? 'p2' : 'p1';
    if (gameState.inventories[opponent][gemId] > 0) {
        return { action: { type: 'STEAL_GEM', payload: { gemId } } };
    }
    return { error: 'Opponent does not have this gem.' };
};
