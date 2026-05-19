import { describe, it, expect } from 'vitest';
import { getRandomUpgrades, UPGRADES } from '../js/talent.js';

describe('talent.js', () => {
    describe('getRandomUpgrades', () => {
        it('回傳指定數量的天賦', () => {
            const result = getRandomUpgrades(3);
            expect(result).toHaveLength(3);
        });

        it('回傳的每個天賦都是 UPGRADES 內的有效值', () => {
            const result = getRandomUpgrades(5);
            result.forEach(talent => {
                expect(UPGRADES.some(u => u.type === talent.type)).toBe(true);
            });
        });

        it('回傳的天賦不重複', () => {
            const result = getRandomUpgrades(5);
            const types = result.map(t => t.type);
            const unique = new Set(types);
            expect(unique.size).toBe(types.length);
        });

        it('請求數量超過可用天賦時，回傳所有天賦', () => {
            const result = getRandomUpgrades(100);
            expect(result.length).toBeLessThanOrEqual(UPGRADES.length);
        });

        it('預設回傳 3 個天賦', () => {
            // 呼叫多次確認預設值穩定
            for (let i = 0; i < 10; i++) {
                const result = getRandomUpgrades();
                expect(result).toHaveLength(3);
            }
        });
    });

    describe('UPGRADES 常數', () => {
        it('每個天賦都有必要欄位', () => {
            UPGRADES.forEach(talent => {
                expect(talent).toHaveProperty('type');
                expect(talent).toHaveProperty('name');
                expect(talent).toHaveProperty('description');
                expect(talent).toHaveProperty('value');
                expect(talent).toHaveProperty('icon');
            });
        });

        it('每個 type 都是唯一字串', () => {
            const types = UPGRADES.map(t => t.type);
            const unique = new Set(types);
            expect(unique.size).toBe(types.length);
        });

        it('攻擊相關天賦值合理', () => {
            const attackTalents = UPGRADES.filter(t =>
                ['damage', 'fireRate', 'projectileSpeed', 'projectileCount', 'critChance', 'critDamage'].includes(t.type)
            );
            attackTalents.forEach(t => {
                expect(typeof t.value).toBe('number');
                expect(t.value).toBeGreaterThan(0);
            });
        });
    });
});