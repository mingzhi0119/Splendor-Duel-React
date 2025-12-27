import { describe, it, expect } from 'vitest';
import { validateGemSelection } from '../validators';

describe('validators', () => {
    describe('validateGemSelection', () => {
        // Helper to create coords
        const c = (r: number, c: number) => ({ r, c });

        it('should allow single gem selection', () => {
            expect(validateGemSelection([c(0, 0)]).valid).toBe(true);
        });

        it('should allow empty selection', () => {
            expect(validateGemSelection([]).valid).toBe(true);
        });

        describe('valid lines', () => {
            it('should allow 2 horizontal gems', () => {
                const selection = [c(0, 0), c(0, 1)];
                expect(validateGemSelection(selection).valid).toBe(true);
            });

            it('should allow 3 horizontal gems', () => {
                const selection = [c(0, 0), c(0, 1), c(0, 2)];
                expect(validateGemSelection(selection).valid).toBe(true);
            });

            it('should allow 2 vertical gems', () => {
                const selection = [c(0, 0), c(1, 0)];
                expect(validateGemSelection(selection).valid).toBe(true);
            });

            it('should allow 3 vertical gems', () => {
                const selection = [c(0, 0), c(1, 0), c(2, 0)];
                expect(validateGemSelection(selection).valid).toBe(true);
            });

            it('should allow 2 diagonal gems', () => {
                const selection = [c(0, 0), c(1, 1)];
                expect(validateGemSelection(selection).valid).toBe(true);
            });

            it('should allow 3 diagonal gems', () => {
                const selection = [c(0, 0), c(1, 1), c(2, 2)];
                expect(validateGemSelection(selection).valid).toBe(true);
            });

            it('should work regardless of order', () => {
                const selection = [c(0, 2), c(0, 0), c(0, 1)];
                expect(validateGemSelection(selection).valid).toBe(true);
            });

            it('should handle reverse diagonal selection', () => {
                const selection = [c(0, 2), c(1, 1), c(2, 0)];
                expect(validateGemSelection(selection).valid).toBe(true);
            });
        });

        describe('invalid selections', () => {
            it('should reject non-straight lines (L-shape)', () => {
                const selection = [c(0, 0), c(0, 1), c(1, 1)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
                expect(result.error).toMatch(/straight line/);
            });

            it('should reject non-straight diagonal-ish lines', () => {
                // (0,0) to (2,2) is a line, but (1,2) is off-axis
                const selection = [c(0, 0), c(2, 2), c(1, 2)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
                expect(result.error).toMatch(/straight line/);
            });

            it('should reject duplicate gem selection', () => {
                const selection = [c(0, 0), c(0, 0)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
                expect(result.error).toMatch(/unique/i);
            });

            it('should reject span > 3 gems', () => {
                const selection = [c(0, 0), c(0, 3)]; // Distance 3
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
                expect(result.error).toMatch(/Too far apart/);
            });

            it('should reject horizontal gap (length 2, span 2)', () => {
                const selection = [c(0, 0), c(0, 2)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
                expect(result.error).toMatch(/gap/i);
            });

            it('should reject vertical gap (length 2, span 2)', () => {
                const selection = [c(0, 0), c(2, 0)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
                expect(result.error).toMatch(/gap/i);
            });

            it('should reject diagonal gap (length 2, span 2)', () => {
                const selection = [c(0, 0), c(2, 2)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
                expect(result.error).toMatch(/gap/i);
            });

            it('should reject 3 gems with gap at edge', () => {
                const selection = [c(0, 0), c(0, 1), c(0, 3)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
            });

            it('should reject 3 gems forming a V-shape', () => {
                const selection = [c(0, 0), c(1, 1), c(0, 2)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
                expect(result.error).toMatch(/straight line/);
            });

            it('should reject 3 gems forming an L-shape at corner', () => {
                const selection = [c(0, 0), c(1, 0), c(1, 1)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
            });

            it('should reject wrap-around logic if any', () => {
                const selection = [c(0, 4), c(0, 0)]; // 4 to 0
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
            });

            it('should reject selection of 4 gems in a line', () => {
                const selection = [c(0, 0), c(0, 1), c(0, 2), c(0, 3)];
                expect(validateGemSelection(selection).valid).toBe(false);
            });

            it('should reject a "Knight move" selection', () => {
                const selection = [c(0, 0), c(2, 1)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
                expect(result.error).toMatch(/straight line/i);
            });

            it('should reject a 2x2 square selection', () => {
                const selection = [c(0, 0), c(0, 1), c(1, 0), c(1, 1)];
                expect(validateGemSelection(selection).valid).toBe(false);
            });

            it('should reject 3 gems with an irregular diagonal (broken slope)', () => {
                const selection = [c(0, 0), c(1, 1), c(2, 3)];
                expect(validateGemSelection(selection).valid).toBe(false);
                expect(validateGemSelection(selection).error).toMatch(/straight line/i);
            });

            it('should reject 2 gems too far apart diagonally', () => {
                const selection = [c(0, 0), c(3, 3)];
                const result = validateGemSelection(selection);
                expect(result.valid).toBe(false);
                expect(result.error).toMatch(/far apart/i);
            });

            it('should reject selection with duplicate coordinates in messy order', () => {
                const selection = [c(1, 1), c(0, 0), c(1, 1)];
                expect(validateGemSelection(selection).valid).toBe(false);
                expect(validateGemSelection(selection).error).toMatch(/unique/i);
            });

            it('should reject a 3-gem selection that forms a wide V', () => {
                const selection = [c(0, 0), c(2, 1), c(0, 2)];
                expect(validateGemSelection(selection).valid).toBe(false);
            });

            it('should reject a selection that is straight but spans across the entire board', () => {
                const selection = [c(0, 0), c(4, 0)];
                expect(validateGemSelection(selection).valid).toBe(false);
                expect(validateGemSelection(selection).error).toMatch(/far apart/i);
            });
        });
    });
});
