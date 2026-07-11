import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DamageNumber } from '../js/damageNumber.js';

describe('DamageNumber', () => {
    let instance;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(performance, 'now').mockReturnValue(1000);
        instance = new DamageNumber(100, 200, 30);
    });

    describe('constructor', () => {
        it('應正確設定初始屬性', () => {
            expect(instance.x).toBe(100);
            expect(instance.y).toBe(200);
            expect(instance.value).toBe(30);
            expect(instance.duration).toBe(0.8);
            expect(instance.alpha).toBe(1);
            expect(instance.scale).toBe(1);
            expect(instance.vy).toBe(-60);
            expect(instance.baseY).toBe(200);
        });

        it('傷害 >= 5 時應使用金色', () => {
            const highDmg = new DamageNumber(0, 0, 5);
            expect(highDmg.color).toBe('#f39c12');
        });

        it('傷害 < 5 時應使用白色', () => {
            const lowDmg = new DamageNumber(0, 0, 3);
            expect(lowDmg.color).toBe('#fff');
        });

        it('可自訂顏色', () => {
            const custom = new DamageNumber(0, 0, 10, '#ff0000');
            expect(custom.color).toBe('#ff0000');
        });

        it('fontSize 應依傷害值計算', () => {
            const small = new DamageNumber(0, 0, 1);
            expect(small.fontSize).toBe(18); // 16 + min(2, 20)

            const large = new DamageNumber(0, 0, 100);
            expect(large.fontSize).toBe(36); // 16 + min(200, 20)
        });
    });

    describe('update', () => {
        it('應減少 time', () => {
            instance.update(0.1);
            expect(instance.time).toBeCloseTo(0.7);
        });

        it('progress 在前 60% 時 scale 應放大', () => {
            instance.update(0.1); // progress = 0.7/0.8 = 0.875 > 0.6
            expect(instance.scale).toBeGreaterThan(1);
        });

        it('progress 在後 40% 時 scale 應縮小', () => {
            instance.update(0.5); // progress = 0.3/0.8 = 0.375 < 0.6
            expect(instance.scale).toBeLessThan(1);
        });

        it('scale 不應低於 0.8', () => {
            instance.update(0.79); // progress ≈ 0.0125
            expect(instance.scale).toBeGreaterThanOrEqual(0.8);
        });

        it('y 位置應向上移動', () => {
            const initialY = instance.y;
            instance.update(0.4);
            expect(instance.y).toBeLessThan(initialY);
        });

        it('alpha 隨進度遞減', () => {
            instance.update(0.4);
            expect(instance.alpha).toBeLessThan(1);
            expect(instance.alpha).toBeGreaterThan(0);
        });
    });

    describe('isFinished', () => {
        it('動畫進行中應回傳 false', () => {
            expect(instance.isFinished()).toBe(false);
        });

        it('time <= 0 應回傳 true', () => {
            instance.update(0.81);
            expect(instance.isFinished()).toBe(true);
        });
    });

    describe('draw', () => {
        let mockCtx;

        beforeEach(() => {
            mockCtx = {
                save: vi.fn(),
                restore: vi.fn(),
                fillText: vi.fn(),
                strokeText: vi.fn(),
                globalAlpha: 1,
                font: '',
                textAlign: '',
                textBaseline: '',
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 0,
            };
        });

        it('alpha <= 0 時不繪製任何內容', () => {
            instance.alpha = 0;
            instance.draw(mockCtx);
            expect(mockCtx.save).not.toHaveBeenCalled();
        });

        it('alpha > 0 應呼叫 ctx 方法', () => {
            instance.draw(mockCtx);
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
            expect(mockCtx.fillText).toHaveBeenCalled();
        });

        it('高傷害 (>5) 應呼叫 strokeText', () => {
            instance.value = 10;
            instance.draw(mockCtx);
            expect(mockCtx.strokeText).toHaveBeenCalled();
        });

        it('低傷害 (<5) 不應呼叫 strokeText', () => {
            instance.value = 3;
            instance.draw(mockCtx);
            expect(mockCtx.strokeText).not.toHaveBeenCalled();
        });
    });
});
