import { describe, it, expect } from 'vitest';
import { MagnetItem } from '../js/magnetItem.js';

describe('MagnetItem', () => {
    it('應該能正確初始化座標與半徑', () => {
        const item = new MagnetItem(100, 200);
        expect(item.x).toBe(100);
        expect(item.y).toBe(200);
        expect(item.radius).toBe(8);
    });

    it('應該能判定玩家已碰撞拾取', () => {
        const item = new MagnetItem(100, 100);
        // 玩家圓心在 (100, 110)，半徑 10px，兩者距離為 10px < playerRadius (10) + itemRadius (8)，判定碰撞
        expect(item.isCollected(100, 110, 10)).toBe(true);
        // 玩家圓心在 (100, 130)，半徑 10px，距離 30px > 18px，判定未碰撞
        expect(item.isCollected(100, 130, 10)).toBe(false);
    });
});

import { PlayerCore } from '../js/playerCore.js';

describe('Player magnetTimer', () => {
    it('應該能正確初始化且隨時間遞減，不會低於 0', () => {
        const core = new PlayerCore(0, 0);
        expect(core.magnetTimer).toBe(0);

        core.magnetTimer = 5;
        core.update(1, {}); // 更新 1 秒
        expect(core.magnetTimer).toBe(4);

        core.update(5, {}); // 再更新 5 秒，此時應降至 0，且不會為負值
        expect(core.magnetTimer).toBe(0);
    });
});

