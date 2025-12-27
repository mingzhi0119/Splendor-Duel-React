import { describe, it, expect } from 'vitest';
import { generateGemPool, generateDeck } from '../../../utils';
import { GRID_SIZE } from '../../../constants';

describe('GameBoard Initialization', () => {
    it('should generate valid gem pool', () => {
        const fullPool = generateGemPool();

        // Should have 25 gems total (4+4+4+4+4+2+3)
        expect(fullPool).toBeDefined();
        expect(fullPool.length).toBe(25);

        // Each gem should have type and uid
        fullPool.forEach((gem) => {
            expect(gem).toBeDefined();
            expect(gem.type).toBeDefined();
            expect(gem.type.id).toBeDefined();
            expect(gem.uid).toBeDefined();
        });
    });

    it('should initialize board with valid gems (no undefined)', () => {
        const fullPool = generateGemPool();
        const initialBoardFlat = fullPool.slice(0, 25);

        expect(initialBoardFlat.length).toBe(25);

        // Create board grid
        const newBoard = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            const row = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                const gem = initialBoardFlat[r * GRID_SIZE + c];
                row.push(gem);
            }
            newBoard.push(row);
        }

        // Verify all board cells have valid gems
        expect(newBoard).toBeDefined();
        expect(newBoard.length).toBe(5);

        newBoard.forEach((row, r) => {
            expect(row.length).toBe(5);
            row.forEach((gem, c) => {
                expect(gem, `Board[${r}][${c}] should not be undefined`).toBeDefined();
                expect(gem.type, `Board[${r}][${c}].type should be defined`).toBeDefined();
                expect(gem.type.id, `Board[${r}][${c}].type.id should be defined`).toBeDefined();
            });
        });
    });

    it('should generate decks without undefined elements', () => {
        const d1 = generateDeck(1);
        const d2 = generateDeck(2);
        const d3 = generateDeck(3);

        expect(d1).toBeDefined();
        expect(d2).toBeDefined();
        expect(d3).toBeDefined();

        // Verify deck arrays don't contain undefined
        [d1, d2, d3].forEach((deck) => {
            expect(deck.length).toBeGreaterThan(0);
            deck.forEach((card) => {
                expect(card).toBeDefined();
                expect(card.id).toBeDefined();
                expect(card.level).toBeDefined();
            });
        });
    });

    it('should create market without consuming deck cards', () => {
        const d1 = generateDeck(1);
        const d2 = generateDeck(2);
        const d3 = generateDeck(3);

        const d1Count = d1.length;
        const d2Count = d2.length;
        const d3Count = d3.length;

        const market = { 3: d3.splice(0, 3), 2: d2.splice(0, 4), 1: d1.splice(0, 5) };

        // Market should have correct amounts
        expect(market[1].length).toBe(5);
        expect(market[2].length).toBe(4);
        expect(market[3].length).toBe(3);

        // Remaining decks should be correct
        expect(d1.length).toBe(d1Count - 5);
        expect(d2.length).toBe(d2Count - 4);
        expect(d3.length).toBe(d3Count - 3);

        // All market cards should be defined
        Object.values(market).forEach((cards) => {
            cards.forEach((card) => {
                expect(card).toBeDefined();
                expect(card.id).toBeDefined();
            });
        });
    });
});
