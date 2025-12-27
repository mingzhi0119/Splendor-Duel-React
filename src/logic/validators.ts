/**
 * Game State Validators
 *
 * Pure validation functions that check game state rules.
 * Return validation results with error messages for user feedback.
 */

import type { GemCoord } from './interactionManager';

/**
 * Result of validation
 */
export interface ValidationResult {
    valid: boolean;
    hasGap?: boolean;
    error?: string | null;
}

/**
 * Validate that selected gems form a valid line
 * Rules:
 * - Must be in a straight line (row, column, or diagonal)
 * - Maximum 3 gems selected
 * - If 3 gems, they must be contiguous (no gaps)
 *
 * @param gems - Array of gem coordinates
 * @returns Validation result with error message if invalid
 */
export const validateGemSelection = (gems: GemCoord[]): ValidationResult => {
    // Single gem or empty is always valid
    if (gems.length <= 1) {
        return { valid: true, hasGap: false };
    }

    // Sort gems by row, then column for consistent ordering
    const sorted = [...gems].sort((a, b) => a.r - b.r || a.c - b.c);
    // Sorting is already done above: sorted = [...gems].sort((a, b) => a.r - b.r || a.c - b.c);

    // Check for duplicates
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].r === sorted[i + 1].r && sorted[i].c === sorted[i + 1].c) {
            return { valid: false, error: 'Select unique gems.' };
        }
    }

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    // Calculate direction
    const dr = last.r - first.r;
    const dc = last.c - first.c;

    // Check if gems form a straight line
    const isRow = dr === 0;
    const isCol = dc === 0;
    const isDiag = Math.abs(dr) === Math.abs(dc);

    if (!isRow && !isCol && !isDiag) {
        return {
            valid: false,
            error: 'Must be in a straight line.',
        };
    }

    // Check distance (max 3 gems = span of 2)
    const span = Math.max(Math.abs(dr), Math.abs(dc));
    if (span > 2) {
        return {
            valid: false,
            error: 'Too far apart (Max 3 gems).',
        };
    }

    // Check for gaps in 2-gem selection
    if (sorted.length === 2 && span > 1) {
        return { valid: false, hasGap: true, error: 'Gap detected.' };
    }

    // Verify ALL gems are on the line
    // (This catches "L-shapes" that accidentally match start/end diagonal check)
    // Normalized direction step

    for (let i = 1; i < sorted.length - 1; i++) {
        const gem = sorted[i];
        // Correct logic: Check if gem is on the line segment
        // For line from first to last:
        // (r - r1) * dc = (c - c1) * dr
        const crossProduct = (gem.r - first.r) * dc - (gem.c - first.c) * dr;
        if (crossProduct !== 0) {
            return {
                valid: false,
                error: 'Must be in a straight line.',
            };
        }
    }

    // If 3 gems, verify they're contiguous (no gaps)
    if (sorted.length === 3) {
        const mid = sorted[1];
        // Correct midpoint calculation based on direction
        const midExpected = {
            r: first.r + (dr !== 0 ? (dr > 0 ? 1 : -1) : 0),
            c: first.c + (dc !== 0 ? (dc > 0 ? 1 : -1) : 0),
        };

        if (mid.r !== midExpected.r || mid.c !== midExpected.c) {
            return {
                valid: false,
                hasGap: true,
                error: 'Gap detected. Gems must be contiguous.',
            };
        }
    }

    return {
        valid: true,
        hasGap: false,
        error: null,
    };
};
