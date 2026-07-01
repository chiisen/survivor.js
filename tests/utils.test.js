import { describe, it, expect } from 'vitest';
import {
    distance, distanceSquared, normalize, randomRange, randomInt,
    formatTime, clamp, lerp, getExpLevelMultiplier
} from '../js/utils.js';

describe('utils.js', () => {
    describe('distance', () => {
        it('計算兩點間歐氏距離', () => {
            expect(distance(0, 0, 3, 4)).toBe(5);
        });

        it('相同點距離為 0', () => {
            expect(distance(5, 5, 5, 5)).toBe(0);
        });

        it('負座標也能正確計算', () => {
            expect(distance(-3, -4, 0, 0)).toBe(5);
        });
    });

    describe('distanceSquared', () => {
        it('返回距離的平方（避免開根號）', () => {
            expect(distanceSquared(0, 0, 3, 4)).toBe(25);
        });

        it('用於比較時無需開根號', () => {
            const d1 = distanceSquared(0, 0, 3, 4);
            const d2 = distanceSquared(0, 0, 1, 2);
            expect(d1 > d2).toBe(true);
        });
    });

    describe('normalize', () => {
        it('向量長度為 1', () => {
            const result = normalize(3, 4);
            const len = Math.sqrt(result.x ** 2 + result.y ** 2);
            expect(len).toBeCloseTo(1);
        });

        it('零向量返回 0, 0', () => {
            const result = normalize(0, 0);
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });
    });

    describe('randomRange', () => {
        it('回傳值在 min 和 max 之間', () => {
            for (let i = 0; i < 100; i++) {
                const val = randomRange(5, 10);
                expect(val >= 5 && val <= 10).toBe(true);
            }
        });
    });

    describe('randomInt', () => {
        it('回傳整數在 [min, max] 區間內', () => {
            for (let i = 0; i < 100; i++) {
                const val = randomInt(3, 7);
                expect(Number.isInteger(val)).toBe(true);
                expect(val >= 3 && val <= 7).toBe(true);
            }
        });

        it('min === max 時回傳該值', () => {
            expect(randomInt(5, 5)).toBe(5);
        });
    });

    describe('clamp', () => {
        it('值在範圍內時不變', () => {
            expect(clamp(5, 0, 10)).toBe(5);
        });

        it('小於 min 時回傳 min', () => {
            expect(clamp(-5, 0, 10)).toBe(0);
        });

        it('大於 max 時回傳 max', () => {
            expect(clamp(15, 0, 10)).toBe(10);
        });
    });

    describe('lerp', () => {
        it('t=0 回傳 a', () => {
            expect(lerp(10, 20, 0)).toBe(10);
        });

        it('t=1 回傳 b', () => {
            expect(lerp(10, 20, 1)).toBe(20);
        });

        it('t=0.5 回傳中點', () => {
            expect(lerp(0, 100, 0.5)).toBe(50);
        });
    });

    describe('formatTime', () => {
        it('格式化秒數為 MM:SS', () => {
            expect(formatTime(65)).toBe('01:05');
            expect(formatTime(0)).toBe('00:00');
            expect(formatTime(3600)).toBe('60:00');
        });
    });

    describe('getExpLevelMultiplier', () => {
        it('L1 = 1 (無加成)', () => {
            expect(getExpLevelMultiplier(1)).toBe(1);
        });

        it('L5 = 1.5^4 = 5.0625', () => {
            expect(getExpLevelMultiplier(5)).toBeCloseTo(5.0625, 5);
        });

        it('L10 = 1.5^9 ≈ 38.4434', () => {
            expect(getExpLevelMultiplier(10)).toBeCloseTo(38.4434, 4);
        });

        it('自訂 growthRate 正確套用', () => {
            expect(getExpLevelMultiplier(3, 2)).toBe(4); // 2^(3-1) = 4
        });

        it('L0 不會崩潰 (level-1 = -1)', () => {
            // 雖然遊戲中不會出現 L0，但純函式應有定義行為
            // 1.5^(-1) = 2/3 ≈ 0.6667
            expect(getExpLevelMultiplier(0)).toBeCloseTo(2 / 3, 4);
        });
    });
});