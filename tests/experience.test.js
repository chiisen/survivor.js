import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExperienceOrb } from '../js/experience.js';

describe('ExperienceOrb', () => {
    let orb;

    beforeEach(() => {
        orb = new ExperienceOrb(100, 200, 50);
    });

    describe('constructor', () => {
        it('儲存座標與經驗值', () => {
            expect(orb.x).toBe(100);
            expect(orb.y).toBe(200);
            expect(orb.value).toBe(50);
        });

        it('初始化半徑為 6', () => {
            expect(orb.radius).toBe(6);
        });

        it('初始化顏色為綠色', () => {
            expect(orb.color).toBe('#2ecc71');
        });

        it('pulseTime 為 0 到 2π 之間的隨機值', () => {
            expect(orb.pulseTime).toBeGreaterThanOrEqual(0);
            expect(orb.pulseTime).toBeLessThan(Math.PI * 2);
        });

        it('初始化 beingAttracted 為 false', () => {
            expect(orb.beingAttracted).toBe(false);
        });
    });

    describe('update', () => {
        it('pulseTime 隨 dt 增加', () => {
            const before = orb.pulseTime;
            orb.update(0.1, 0, 0, 50);
            expect(orb.pulseTime).toBeCloseTo(before + 0.5);
        });

        it('玩家超出拾取範圍時不移動', () => {
            const beforeX = orb.x;
            const beforeY = orb.y;
            orb.update(1, 1000, 1000, 50);
            expect(orb.x).toBe(beforeX);
            expect(orb.y).toBe(beforeY);
        });

        it('玩家超出拾取範圍時 beingAttracted 保持 false', () => {
            orb.update(1, 1000, 1000, 50);
            expect(orb.beingAttracted).toBe(false);
        });

        it('玩家在拾取範圍內時 beingAttracted 設為 true', () => {
            orb.update(0.1, 100, 200, 50);
            expect(orb.beingAttracted).toBe(true);
        });

        it('玩家在拾取範圍內時向玩家方向移動', () => {
            const beforeX = orb.x;
            const beforeY = orb.y;
            orb.update(0.1, 200, 200, 500);
            expect(orb.x).toBeGreaterThan(beforeX);
            expect(orb.y).toBe(beforeY); // 同 y 軸不變
        });

        it('玩家在拾取範圍內且精確重疊時不產生 NaN（len=0 邊界）', () => {
            orb.x = 100;
            orb.y = 200;
            orb.update(0.1, 100, 200, 50);
            expect(orb.x).toBe(100);
            expect(orb.y).toBe(200);
        });

        it('移動速度與 dt 成正比', () => {
            const orb1 = new ExperienceOrb(0, 0, 10);
            const orb2 = new ExperienceOrb(0, 0, 10);
            orb1.update(0.05, 100, 0, 500);
            orb2.update(0.10, 100, 0, 500);
            // orb2 移動距離應為 orb1 的兩倍
            const dist1 = Math.sqrt(orb1.x ** 2 + orb1.y ** 2);
            const dist2 = Math.sqrt(orb2.x ** 2 + orb2.y ** 2);
            expect(dist2).toBeCloseTo(dist1 * 2, 5);
        });
    });

    describe('draw', () => {
        it('繪製時不拋出錯誤', () => {
            const ctx = createMockCtx();
            expect(() => orb.draw(ctx)).not.toThrow();
        });

        it('呼叫 save 與 restore 以重置 Canvas 狀態', () => {
            const ctx = createMockCtx();
            orb.draw(ctx);
            expect(ctx.save).toHaveBeenCalledTimes(1);
            expect(ctx.restore).toHaveBeenCalledTimes(1);
        });

        it('繪製多個圓形（光暈 + 主體 + 外框 + 高光）', () => {
            const ctx = createMockCtx();
            orb.draw(ctx);
            expect(ctx.beginPath).toHaveBeenCalled();
            expect(ctx.arc).toHaveBeenCalled();
            expect(ctx.fill).toHaveBeenCalled();
        });
    });

    describe('isCollected', () => {
        it('玩家與經驗球重疊時返回 true', () => {
            expect(orb.isCollected(100, 200, 10)).toBe(true);
        });

        it('玩家碰撞半徑加上經驗球半徑恰好等於距離時返回 false（< 判斷）', () => {
            // 距離 = 16，玩家半徑 10 + 球半徑 6 = 16 → 16 < 16 為 false
            expect(orb.isCollected(116, 200, 10)).toBe(false);
        });

        it('玩家在碰撞範圍內時返回 true', () => {
            // 距離 = 15 < 10 + 6 = 16 → true
            expect(orb.isCollected(115, 200, 10)).toBe(true);
        });

        it('玩家超出碰撞範圍時返回 false', () => {
            expect(orb.isCollected(500, 500, 10)).toBe(false);
        });

        it('玩家半徑為 0 時距離等於球半徑才不拾取（距離 6 < 0 + 6 為 false）', () => {
            expect(orb.isCollected(100, 200, 0)).toBe(true);
            expect(orb.isCollected(106, 200, 0)).toBe(false);
        });

        it('經驗球被吸引移動後仍可正確判斷拾取', () => {
            // 被吸引到接近玩家（7 次迭代，總移動 210 < 起始距離 223.6，不會 overshoot）
            for (let i = 0; i < 7; i++) {
                orb.update(0.1, 0, 0, 500);
            }
            expect(orb.isCollected(0, 0, 10)).toBe(true);
        });
    });
});

/**
 * 建立 CanvasRenderingContext2D 模擬物件
 * @returns {{ save: Function, restore: Function, beginPath: Function, arc: Function, fill: Function, fillStyle: string }}
 */
function createMockCtx() {
    const mockGradient = {
        addColorStop: vi.fn()
    };
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        strokeStyle: '',
        lineWidth: 1,
        fillStyle: '',
        createRadialGradient: vi.fn(() => mockGradient),
    };
}
