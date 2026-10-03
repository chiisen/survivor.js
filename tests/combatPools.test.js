import { describe, it, expect } from 'vitest';
import { EnemyProjectile, createEnemyProjectilePool } from '../js/enemyProjectile.js';
import { createDamageNumberPool, spawnDamageNumber } from '../js/damageNumbers.js';

function recordingContext() {
    const calls = { createRadialGradient: 0 };
    const ctx = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        save() {},
        restore() {},
        beginPath() {},
        arc() {},
        fill() {},
        stroke() {},
        createRadialGradient() {
            calls.createRadialGradient++;
            return { addColorStop() {} };
        },
    };
    return { ctx, calls };
}

describe('敵人投射物池與繪製', () => {
    it('繪製 K 顆時不建立 CanvasGradient，且物件來自池', () => {
        const pool = createEnemyProjectilePool();
        const projectiles = [];
        for (let i = 0; i < 7; i++) {
            projectiles.push(pool.get({
                x: i, y: i, vx: 1, vy: 0, damage: 1, radius: 5, color: '#9b59b6',
            }));
        }

        const { ctx, calls } = recordingContext();
        for (const projectile of projectiles) {
            expect(projectile).toBeInstanceOf(EnemyProjectile);
            expect(projectile._pooled).toBe(true);
            projectile.draw(ctx);
        }
        expect(calls.createRadialGradient).toBe(0);
    });
});

describe('傷害數字池上限', () => {
    it('超過 50 後仍在場的數量不超過 50，且來自池', () => {
        const pool = createDamageNumberPool();
        for (let i = 0; i < 60; i++) {
            spawnDamageNumber(pool, i, i, i, null);
        }
        const active = pool.getActiveObjects().filter((item) => item._active);
        expect(active.length).toBeLessThanOrEqual(50);
        expect(active.length).toBeGreaterThan(0);
        expect(active.every((item) => item._pooled)).toBe(true);
    });
});
