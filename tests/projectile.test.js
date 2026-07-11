import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Projectile } from '../js/projectile.js';

describe('Projectile', () => {
    let projectile;

    beforeEach(() => {
        projectile = new Projectile();
    });

    describe('constructor', () => {
        it('初始化預設值', () => {
            expect(projectile.x).toBe(0);
            expect(projectile.y).toBe(0);
            expect(projectile.radius).toBe(8);
            expect(projectile.vx).toBe(0);
            expect(projectile.vy).toBe(0);
            expect(projectile.damage).toBe(1);
            expect(projectile.color).toBe('#f39c12');
            expect(projectile.trail).toEqual([]);
            expect(projectile.maxTrailLength).toBe(10);
            expect(projectile.active).toBe(false);
            expect(projectile.isCrit).toBe(false);
        });
    });

    describe('init', () => {
        it('設定位置、方向、速度與傷害', () => {
            projectile.init(100, 200, 200, 200, 300, 10);

            expect(projectile.x).toBe(100);
            expect(projectile.y).toBe(200);
            expect(projectile.damage).toBe(10);
            expect(projectile.active).toBe(true);
            expect(projectile.isCrit).toBe(false);
        });

        it('計算正確的朝右移動速度 (45度)', () => {
            projectile.init(0, 0, 100, 100, 300, 5);
            // normalize(100, 100) = (0.7071, 0.7071)
            expect(projectile.vx).toBeCloseTo(212.13, 0);
            expect(projectile.vy).toBeCloseTo(212.13, 0);
        });

        it('計算正確的水平向右速度 (0度)', () => {
            projectile.init(0, 0, 100, 0, 500, 1);
            expect(projectile.vx).toBeCloseTo(500, 0);
            expect(projectile.vy).toBeCloseTo(0, 0);
        });

        it('計算正確的垂直向下速度 (90度)', () => {
            projectile.init(0, 0, 0, 100, 200, 1);
            expect(projectile.vx).toBeCloseTo(0, 0);
            expect(projectile.vy).toBeCloseTo(200, 0);
        });

        it('計算正確的垂直向上速度 (270度)', () => {
            projectile.init(0, 0, 0, -100, 150, 1);
            expect(projectile.vx).toBeCloseTo(0, 0);
            expect(projectile.vy).toBeCloseTo(-150, 0);
        });

        it('清空軌跡陣列', () => {
            projectile.trail = [{ x: 10, y: 10 }, { x: 20, y: 20 }];
            projectile.init(50, 50, 100, 100, 100, 1);
            expect(projectile.trail).toEqual([]);
        });

        it('重設 isCrit 為 false', () => {
            projectile.isCrit = true;
            projectile.init(0, 0, 100, 100, 100, 1);
            expect(projectile.isCrit).toBe(false);
        });
    });

    describe('reset', () => {
        it('重設所有屬性為預設值', () => {
            projectile.init(100, 200, 300, 300, 300, 10);
            projectile.isCrit = true;
            projectile.trail = [{ x: 10, y: 10 }];

            projectile.reset();

            expect(projectile.x).toBe(0);
            expect(projectile.y).toBe(0);
            expect(projectile.vx).toBe(0);
            expect(projectile.vy).toBe(0);
            expect(projectile.damage).toBe(1);
            expect(projectile.trail).toEqual([]);
            expect(projectile.active).toBe(false);
            expect(projectile.isCrit).toBe(false);
        });

        it('多次 reset 不會出錯', () => {
            expect(() => {
                projectile.reset();
                projectile.reset();
                projectile.reset();
            }).not.toThrow();
        });
    });

    describe('update', () => {
        it('依 dt 更新位置', () => {
            projectile.x = 0;
            projectile.y = 0;
            projectile.vx = 100;
            projectile.vy = 50;

            projectile.update(1);

            expect(projectile.x).toBe(100);
            expect(projectile.y).toBe(50);
        });

        it('dt=0 時位置不變', () => {
            projectile.x = 50;
            projectile.y = 50;
            projectile.vx = 100;
            projectile.vy = 100;

            projectile.update(0);

            expect(projectile.x).toBe(50);
            expect(projectile.y).toBe(50);
        });

        it('小數 dt 正確計算子像素位移', () => {
            projectile.x = 0;
            projectile.y = 0;
            projectile.vx = 300;
            projectile.vy = 200;

            projectile.update(0.5);

            expect(projectile.x).toBe(150);
            expect(projectile.y).toBe(100);
        });

        it('在軌跡陣列前端加入當前位置', () => {
            projectile.x = 10;
            projectile.y = 20;
            projectile.vx = 100;
            projectile.vy = 0;

            projectile.update(1);

            expect(projectile.trail.length).toBe(1);
            expect(projectile.trail[0]).toEqual({ x: 10, y: 20 });
        });

        it('軌跡陣列不超過 maxTrailLength', () => {
            projectile.maxTrailLength = 3;

            for (let i = 0; i < 5; i++) {
                projectile.vx = 100;
                projectile.vy = 0;
                projectile.update(1);
            }

            expect(projectile.trail.length).toBe(3);
        });

        it('多次 update 後軌跡為最新 N 筆位置', () => {
            projectile.maxTrailLength = 3;
            projectile.x = 0;
            projectile.y = 0;
            projectile.vx = 10;
            projectile.vy = 0;

            projectile.update(1); // trail: [{0,0}], x=10
            projectile.update(1); // trail: [{10,0}, {0,0}], x=20
            projectile.update(1); // trail: [{20,0}, {10,0}, {0,0}], x=30
            projectile.update(1); // trail: [{30,0}, {20,0}, {10,0}], x=40

            expect(projectile.x).toBe(40);
            expect(projectile.trail.length).toBe(3);
            expect(projectile.trail[0]).toEqual({ x: 30, y: 0 });
            expect(projectile.trail[1]).toEqual({ x: 20, y: 0 });
            expect(projectile.trail[2]).toEqual({ x: 10, y: 0 });
        });
    });

    describe('draw', () => {
        it('不拋錯地執行繪製流程', () => {
            const ctx = createMockCtx();
            expect(() => projectile.draw(ctx)).not.toThrow();
        });

        it('有軌跡時繪製軌跡與本體', () => {
            const ctx = createMockCtx();
            projectile.x = 100;
            projectile.y = 100;
            projectile.trail = [{ x: 90, y: 100 }, { x: 80, y: 100 }];

            projectile.draw(ctx);

            expect(ctx.beginPath).toHaveBeenCalled();
            expect(ctx.fill).toHaveBeenCalled();
            expect(ctx.arc).toHaveBeenCalled();
        });

        it('isCrit=true 時繪製額外的爆擊邊框', () => {
            const ctx = createMockCtx();
            projectile.isCrit = true;
            projectile.x = 50;
            projectile.y = 50;

            projectile.draw(ctx);

            // stroke 被呼叫（爆擊邊框）
            expect(ctx.stroke).toHaveBeenCalled();
        });

        it('isCrit=false 時不繪製爆擊邊框（無 stroke 呼叫）', () => {
            const ctx = createMockCtx();
            projectile.isCrit = false;
            projectile.x = 50;
            projectile.y = 50;

            projectile.draw(ctx);

            // isCrit=false 時只在建立 radialGradient 後 fill，
            // 不會呼叫 stroke
            expect(ctx.stroke).not.toHaveBeenCalled();
        });

        it('呼叫 ctx.save() 和 ctx.restore() 管理繪圖狀態', () => {
            const ctx = createMockCtx();
            projectile.draw(ctx);
            expect(ctx.save).toHaveBeenCalledTimes(1);
            expect(ctx.restore).toHaveBeenCalledTimes(1);
        });
    });

    describe('isOutOfBounds', () => {
        const width = 800;
        const height = 600;

        it('在畫布內時回傳 false', () => {
            projectile.x = 400;
            projectile.y = 300;
            expect(projectile.isOutOfBounds(width, height)).toBe(false);
        });

        it('在畫布正中心時回傳 false', () => {
            projectile.x = width / 2;
            projectile.y = height / 2;
            expect(projectile.isOutOfBounds(width, height)).toBe(false);
        });

        it('超出左邊界 100px 時回傳 true', () => {
            projectile.x = -101;
            projectile.y = 300;
            expect(projectile.isOutOfBounds(width, height)).toBe(true);
        });

        it('恰好在左邊界 -100px 時回傳 false（margin 內）', () => {
            projectile.x = -100;
            projectile.y = 300;
            expect(projectile.isOutOfBounds(width, height)).toBe(false);
        });

        it('超出右邊界 100px 時回傳 true', () => {
            projectile.x = width + 101;
            projectile.y = 300;
            expect(projectile.isOutOfBounds(width, height)).toBe(true);
        });

        it('恰好在右邊界 +100px 時回傳 false（margin 內）', () => {
            projectile.x = width + 100;
            projectile.y = 300;
            expect(projectile.isOutOfBounds(width, height)).toBe(false);
        });

        it('超出上邊界 100px 時回傳 true', () => {
            projectile.x = 400;
            projectile.y = -101;
            expect(projectile.isOutOfBounds(width, height)).toBe(true);
        });

        it('恰好在上邊界 -100px 時回傳 false（margin 內）', () => {
            projectile.x = 400;
            projectile.y = -100;
            expect(projectile.isOutOfBounds(width, height)).toBe(false);
        });

        it('超出下邊界 100px 時回傳 true', () => {
            projectile.x = 400;
            projectile.y = height + 101;
            expect(projectile.isOutOfBounds(width, height)).toBe(true);
        });

        it('恰好在下邊界 +100px 時回傳 false（margin 內）', () => {
            projectile.x = 400;
            projectile.y = height + 100;
            expect(projectile.isOutOfBounds(width, height)).toBe(false);
        });

        it('負座標在 margin 範圍內回傳 false', () => {
            projectile.x = -50;
            projectile.y = -50;
            expect(projectile.isOutOfBounds(width, height)).toBe(false);
        });
    });
});

/**
 * 建立模擬的 CanvasRenderingContext2D
 */
function createMockCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        get fillStyle() { return this._fillStyle; },
        set fillStyle(v) { this._fillStyle = v; },
        get strokeStyle() { return this._strokeStyle; },
        set strokeStyle(v) { this._strokeStyle = v; },
        get lineWidth() { return this._lineWidth; },
        set lineWidth(v) { this._lineWidth = v; },
        createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
        })),
    };
}
