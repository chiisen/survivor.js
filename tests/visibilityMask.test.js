import { describe, it, expect } from 'vitest';
import { VisibilityMask } from '../js/visibilityMask.js';

function makeCanvas() {
    const calls = {
        fillRect: 0,
        createRadialGradient: 0,
        drawImage: 0,
        composites: /** @type {string[]} */ ([]),
        /** @type {number[]|null} */
        lastCenter: null,
        lastFill: '',
    };
    const ctx = {
        fillStyle: '',
        _op: 'source-over',
        get globalCompositeOperation() { return this._op; },
        set globalCompositeOperation(value) {
            this._op = value;
            calls.composites.push(value);
        },
        save() {},
        restore() {},
        clearRect() {},
        beginPath() {},
        arc() {},
        fill() {},
        fillRect() {
            calls.fillRect++;
            calls.lastFill = this.fillStyle;
            if (!calls.fills) calls.fills = [];
            calls.fills.push(this.fillStyle);
        },
        drawImage() {
            calls.drawImage++;
        },
        createRadialGradient(x, y) {
            calls.createRadialGradient++;
            calls.lastCenter = [x, y];
            return { addColorStop() {} };
        },
    };
    return { width: 0, height: 0, getContext: () => ctx, calls };
}

describe('視野遮罩靜態暗層', () => {
    it('玩家只移動時不重建靜態填色，洞的位置跟著更新', () => {
        /** @type {ReturnType<typeof makeCanvas>[]} */
        const made = [];
        const mask = new VisibilityMask(() => {
            const canvas = makeCanvas();
            made.push(canvas);
            return canvas;
        });
        const main = makeCanvas();

        const mainCtx = main.getContext('2d');
        mask.draw(mainCtx, 800, 600, 100, 120);
        expect(mask.staticBuilds).toBe(1);
        const staticCanvas = made[0];
        const frameCanvas = made[1];
        const staticFills = staticCanvas.calls.fillRect;
        const staticGradients = staticCanvas.calls.createRadialGradient;
        expect(staticFills).toBeGreaterThan(0);
        expect(staticCanvas.calls.fills.some((fill) => String(fill).includes(String(mask.darkness)))).toBe(true);

        mask.draw(mainCtx, 800, 600, 240, 300);

        expect(mask.staticBuilds).toBe(1);
        expect(staticCanvas.calls.fillRect).toBe(staticFills);
        expect(staticCanvas.calls.createRadialGradient).toBe(staticGradients);
        expect(main.calls.createRadialGradient).toBe(0);
        expect(main.calls.drawImage).toBe(2);
        expect(frameCanvas.calls.composites).toContain('destination-out');
        expect(frameCanvas.calls.lastCenter).toEqual([290, 350]);
        expect(frameCanvas.calls.drawImage).toBeGreaterThan(0);
    });
});
