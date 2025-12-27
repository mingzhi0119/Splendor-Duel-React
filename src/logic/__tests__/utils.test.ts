import { describe, it, expect } from 'vitest';
import { calculateTransaction } from '../../utils';
import { Card, GemInventory, Buff } from '../../types';

describe('utils', () => {
    describe('calculateTransaction', () => {
        const baseInv: GemInventory = {
            blue: 0,
            white: 0,
            green: 0,
            black: 0,
            red: 0,
            pearl: 0,
            gold: 0,
        };
        const emptyBuff: Buff = { id: 'none', level: 0, label: '', desc: '', effects: {} };

        const createCard = (level: 1 | 2 | 3, cost: Partial<GemInventory>): Card => ({
            id: 'test-card',
            level,
            cost: { ...baseInv, ...cost },
            points: 0,
            bonusColor: 'blue',
        });

        it('should apply discountAny: 1 to a Level 2 card', () => {
            const card = createCard(2, { blue: 2, red: 2 });
            const buff: Buff = { ...emptyBuff, effects: { passive: { discountAny: 1 } } };
            const result = calculateTransaction(card, baseInv, [], buff);
            // Total cost was 4, should be 3 now.
            expect(result.goldCost).toBe(3);
        });

        it('should stack discountAny: 1 and l3Discount: 3 for a Level 3 card', () => {
            const card = createCard(3, { blue: 5, red: 5 });
            const buff: Buff = {
                ...emptyBuff,
                effects: { passive: { discountAny: 1, l3Discount: 3 } },
            };
            const result = calculateTransaction(card, baseInv, [], buff);
            // Total cost 10 - 4 = 6
            expect(result.goldCost).toBe(6);
        });

        it('should apply goldBuff (half gold price) to Level 3 card', () => {
            const card = createCard(3, { blue: 5 });
            const buff: Buff = { ...emptyBuff, effects: { passive: { goldBuff: true } } };
            const result = calculateTransaction(card, baseInv, [], buff);
            // Cost 5 gold -> ceil(5/2) = 3
            expect(result.goldCost).toBe(3);
        });

        it('should stack all L3 discounts and then apply goldBuff', () => {
            const card = createCard(3, { blue: 10 });
            const buff: Buff = {
                ...emptyBuff,
                effects: { passive: { discountAny: 1, l3Discount: 3, goldBuff: true } },
            };
            const result = calculateTransaction(card, baseInv, [], buff);
            // (10 - 4) = 6. 6 / 2 = 3.
            expect(result.goldCost).toBe(3);
        });

        it('should handle bonuses reducing cost to zero', () => {
            const card = createCard(1, { blue: 2 });
            const tableau = [
                { id: 'b1', bonusColor: 'blue', bonusCount: 1, points: 0, cost: baseInv, level: 1 },
                { id: 'b2', bonusColor: 'blue', bonusCount: 1, points: 0, cost: baseInv, level: 1 },
            ];
            const result = calculateTransaction(card, baseInv, tableau as Card[], null);
            expect(result.goldCost).toBe(0);
            expect(result.affordable).toBe(true);
        });

        it('should handle bonuses and buffs combined reducing cost below zero', () => {
            const card = createCard(2, { blue: 1 });
            const buff: Buff = { ...emptyBuff, effects: { passive: { discountAny: 5 } } };
            const result = calculateTransaction(card, baseInv, [], buff);
            expect(result.goldCost).toBe(0);
        });

        it('should correctly identify card as unaffordable with multiple buffs', () => {
            const card = createCard(3, { blue: 10 });
            const inv = { ...baseInv, gold: 2 };
            const buff: Buff = { ...emptyBuff, effects: { passive: { goldBuff: true } } };
            const result = calculateTransaction(card, inv, [], buff);
            // ceil(10/2) = 5. Gold is 2.
            expect(result.affordable).toBe(false);
        });

        it('should not apply l3Discount to Level 2 cards', () => {
            const card = createCard(2, { blue: 5 });
            const buff: Buff = { ...emptyBuff, effects: { passive: { l3Discount: 3 } } };
            const result = calculateTransaction(card, baseInv, [], buff);
            expect(result.goldCost).toBe(5);
        });

        it('should handle pearl cost (pearls never get bonus discounts)', () => {
            const card = createCard(1, { pearl: 2 });
            const tableau = [
                {
                    id: 'p1',
                    bonusColor: 'pearl' as any,
                    bonusCount: 1,
                    points: 0,
                    cost: baseInv,
                    level: 1,
                },
            ];
            const result = calculateTransaction(card, baseInv, tableau as any, null);
            expect(result.goldCost).toBe(2);
        });

        it('should apply goldBuff after taking into account existing player gems', () => {
            const card = createCard(3, { blue: 10 });
            const inv = { ...baseInv, blue: 4 }; // 10 - 4 = 6 gold needed
            const buff: Buff = { ...emptyBuff, effects: { passive: { goldBuff: true } } };
            const result = calculateTransaction(card, inv, [], buff);
            // 6 / 2 = 3 gold cost
            expect(result.goldCost).toBe(3);
        });
    });
});
