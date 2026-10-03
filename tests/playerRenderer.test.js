import { describe, it, expect } from 'vitest';
import { PlayerRenderer } from '../js/playerRenderer.js';

function recordingContext() {
    /** @type {number[]} */
    const shadowBlurs = [];
    const handler = {
        get(target, prop) {
            if (prop === 'shadowBlurs') return shadowBlurs;
            if (prop in target) return target[prop];
            return () => {
                if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
                    return { addColorStop() {} };
                }
                return new Proxy({}, handler);
            };
        },
        set(target, prop, value) {
            if (prop === 'shadowBlur') shadowBlurs.push(value);
            target[prop] = value;
            return true;
        },
    };
    return new Proxy({ shadowBlurs }, handler);
}

const core = {
    flashTime: 0,
    magnetTimer: 0,
    x: 100,
    y: 120,
    facingAngle: 0,
    baseAttackRange: 80,
    attackRange: 80,
    radius: 18,
};

describe('玩家穩定繪製', () => {
    it('未攻擊時不設定 shadowBlur', () => {
        const renderer = new PlayerRenderer();
        const ctx = recordingContext();
        renderer.draw(ctx, core, { attackAnimationTime: 0, attackDuration: 0.2 });
        expect(ctx.shadowBlurs).toEqual([]);
    });

    it('揮擊時仍可在劍尖設定 shadowBlur', () => {
        const renderer = new PlayerRenderer();
        const ctx = recordingContext();
        renderer.draw(ctx, core, { attackAnimationTime: 0.1, attackDuration: 0.2 });
        expect(ctx.shadowBlurs.length).toBeGreaterThan(0);
    });
});
