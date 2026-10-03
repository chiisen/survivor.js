import { describe, it, expect } from 'vitest';
import { removeDeadEnemies, rebuildEnemyGrid } from '../js/enemyList.js';

describe('死亡敵人列表壓縮', () => {
    it('移除死亡者後只留存活者，且不呼叫 splice', () => {
        const enemies = [
            { id: 1, _alive: true },
            { id: 2, _alive: false },
            { id: 3, _alive: true },
            { id: 4, _alive: false },
            { id: 5, _alive: false },
        ];
        const originalSplice = Array.prototype.splice;
        let splices = 0;
        Array.prototype.splice = function (...args) {
            splices++;
            return originalSplice.apply(this, args);
        };

        try {
            removeDeadEnemies(enemies);
        } finally {
            Array.prototype.splice = originalSplice;
        }

        expect(splices).toBe(0);
        expect(enemies).toHaveLength(2);
        expect(enemies.every((enemy) => enemy._alive)).toBe(true);
        expect(enemies.map((enemy) => enemy.id)).toEqual([1, 3]);
    });

    it('重建網格時只插入壓縮後的存活者', () => {
        const enemies = [
            { id: 'a', _alive: true },
            { id: 'b', _alive: false },
        ];
        removeDeadEnemies(enemies);

        /** @type {object[]} */
        const inserted = [];
        const grid = {
            cleared: false,
            clear() {
                this.cleared = true;
            },
            insert(enemy) {
                inserted.push(enemy);
            },
        };

        rebuildEnemyGrid(grid, enemies);

        expect(grid.cleared).toBe(true);
        expect(inserted).toEqual([{ id: 'a', _alive: true }]);
    });
});
