import { describe, it, expect } from 'vitest';
import { createFloorCache, drawFloor } from '../js/floorDraw.js';

/**
 * @returns {{ ctx: object, calls: { drawImage: number, createRadialGradient: number } }}
 */
function recordingContext() {
    const calls = { drawImage: 0, createRadialGradient: 0 };
    const ctx = {
        fillStyle: '',
        drawImage() {
            calls.drawImage++;
        },
        createRadialGradient() {
            calls.createRadialGradient++;
            return { addColorStop() {} };
        },
        fillRect() {},
    };
    return { ctx, calls };
}

describe('地板快取繪製', () => {
    it('已載入時主畫布每幀只貼一次，與寬高除以 64 無關', () => {
        const cache = createFloorCache();
        const main = recordingContext();
        const off = recordingContext();
        let canvases = 0;
        const createCanvas = () => {
            canvases++;
            return { width: 0, height: 0, getContext: () => off.ctx };
        };

        drawFloor(main.ctx, cache, 1920, 1080, {}, true, createCanvas);
        expect(main.calls.drawImage).toBe(1);
        expect(off.calls.drawImage).toBeGreaterThan(1);

        const tiled = off.calls.drawImage;
        drawFloor(main.ctx, cache, 1920, 1080, {}, true, createCanvas);
        expect(main.calls.drawImage).toBe(2);
        expect(off.calls.drawImage).toBe(tiled);
        expect(canvases).toBe(1);

        drawFloor(main.ctx, cache, 128, 128, {}, true, createCanvas);
        expect(main.calls.drawImage).toBe(3);
    });

    it('未載入時主畫布該幀不建立放射漸層，快取只建一次', () => {
        const cache = createFloorCache();
        const main = recordingContext();
        const off = recordingContext();
        const createCanvas = () => ({ width: 0, height: 0, getContext: () => off.ctx });

        drawFloor(main.ctx, cache, 800, 600, null, false, createCanvas);
        drawFloor(main.ctx, cache, 800, 600, null, false, createCanvas);

        expect(main.calls.createRadialGradient).toBe(0);
        expect(main.calls.drawImage).toBe(2);
        expect(off.calls.createRadialGradient).toBe(1);
    });
});
