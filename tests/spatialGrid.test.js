import { describe, it, expect, beforeEach } from 'vitest';
import { SpatialGrid } from '../js/spatialGrid.js';

describe('SpatialGrid', () => {
    let grid;

    beforeEach(() => {
        grid = new SpatialGrid(100);
    });

    describe('constructor', () => {
        it('儲存 cellSize 並初始化空 grid', () => {
            expect(grid.cellSize).toBe(100);
            expect(grid.grid.size).toBe(0);
        });
    });

    describe('getKey', () => {
        it('原點 (0, 0) 映射至 "0,0"', () => {
            expect(grid.getKey(0, 0)).toBe('0,0');
        });

        it('cellSize 內的座標映射至同一 cell', () => {
            expect(grid.getKey(50, 50)).toBe('0,0');
            expect(grid.getKey(99, 99)).toBe('0,0');
        });

        it('cellSize 邊界座標歸屬下一格 cell (Math.floor)', () => {
            expect(grid.getKey(100, 100)).toBe('1,1');
            expect(grid.getKey(200, 0)).toBe('2,0');
        });

        it('負座標正確映射 (Math.floor 負向無窮)', () => {
            expect(grid.getKey(-50, -50)).toBe('-1,-1');
            expect(grid.getKey(-100, -1)).toBe('-1,-1');
            expect(grid.getKey(-101, -101)).toBe('-2,-2');
        });
    });

    describe('insert + getNearby', () => {
        it('空 grid 查詢返回空陣列', () => {
            expect(grid.getNearby(50, 50, 100)).toEqual([]);
        });

        it('插入單一實體後可被鄰近查詢找到', () => {
            const enemy = { x: 50, y: 50 };
            grid.insert(enemy);

            const nearby = grid.getNearby(50, 50, 100);
            expect(nearby).toHaveLength(1);
            expect(nearby[0]).toBe(enemy);
        });

        it('同一 cell 內多個實體都能被找到', () => {
            const e1 = { x: 10, y: 10 };
            const e2 = { x: 20, y: 20 };
            const e3 = { x: 90, y: 90 };
            grid.insert(e1);
            grid.insert(e2);
            grid.insert(e3);

            const nearby = grid.getNearby(50, 50, 50);
            expect(nearby).toHaveLength(3);
        });

        it('radius=0 僅查詢中心 cell', () => {
            const center = { x: 50, y: 50 };
            const adjacent = { x: 150, y: 50 };
            grid.insert(center);
            grid.insert(adjacent);

            const nearby = grid.getNearby(50, 50, 0);
            expect(nearby).toEqual([center]);
        });

        it('跨 cell 查詢能彙集鄰近格內所有實體', () => {
            const inCenter = { x: 50, y: 50 };
            const inRightCell = { x: 150, y: 50 };
            const inUpperCell = { x: 50, y: -50 };
            grid.insert(inCenter);
            grid.insert(inRightCell);
            grid.insert(inUpperCell);

            const nearby = grid.getNearby(50, 50, 100);
            expect(nearby).toHaveLength(3);
        });

        it('getNearby 不過濾實際距離（粗略 cell 範圍查詢）', () => {
            // 設計特性：getNearby 返回 cell 範圍內所有實體，
            // 呼叫端需自行做距離過濾（例如碰撞檢測前的粗篩）
            const close = { x: 50, y: 50 };
            const farButSameCell = { x: 99, y: 99 }; // 同 cell 但距離 ~69px
            grid.insert(close);
            grid.insert(farButSameCell);

            const nearby = grid.getNearby(50, 50, 10); // radius=10 仍涵蓋整個 cell
            expect(nearby).toHaveLength(2);
        });
    });

    describe('clear', () => {
        it('清空後 grid.size 歸零', () => {
            grid.insert({ x: 50, y: 50 });
            grid.insert({ x: 150, y: 150 });
            expect(grid.grid.size).toBe(2);

            grid.clear();
            expect(grid.grid.size).toBe(0);
        });

        it('清空後 getNearby 返回空陣列', () => {
            grid.insert({ x: 50, y: 50 });
            grid.clear();

            expect(grid.getNearby(50, 50, 100)).toEqual([]);
        });

        it('清空後 cellSize 保留不變', () => {
            grid.clear();
            expect(grid.cellSize).toBe(100);
        });
    });

    describe('getCellCount', () => {
        it('空 grid 返回 0', () => {
            expect(grid.getCellCount()).toBe(0);
        });

        it('同 cell 內多個實體僅計為 1 個 cell', () => {
            grid.insert({ x: 10, y: 10 });
            grid.insert({ x: 20, y: 20 });
            grid.insert({ x: 90, y: 90 });
            expect(grid.getCellCount()).toBe(1);
        });

        it('跨 cell 插入時正確反映 cell 數', () => {
            grid.insert({ x: 50, y: 50 });   // cell (0,0)
            grid.insert({ x: 150, y: 50 });  // cell (1,0)
            grid.insert({ x: 50, y: 150 });  // cell (0,1)
            expect(grid.getCellCount()).toBe(3);
        });
    });

    describe('getTotalEntities', () => {
        it('空 grid 返回 0', () => {
            expect(grid.getTotalEntities()).toBe(0);
        });

        it('累計所有實體（跨 cell）', () => {
            grid.insert({ x: 50, y: 50 });
            grid.insert({ x: 150, y: 50 });
            grid.insert({ x: 250, y: 50 });
            expect(grid.getTotalEntities()).toBe(3);
        });

        it('同 cell 內多個實體完整累計', () => {
            grid.insert({ x: 10, y: 10 });
            grid.insert({ x: 20, y: 20 });
            expect(grid.getTotalEntities()).toBe(2);
        });
    });

    describe('remove', () => {
        it('移除已插入的實體後 getNearby 不再返回它', () => {
            const target = { x: 50, y: 50 };
            const other = { x: 60, y: 60 };
            grid.insert(target);
            grid.insert(other);

            grid.remove(target);

            const nearby = grid.getNearby(50, 50, 100);
            expect(nearby).not.toContain(target);
            expect(nearby).toContain(other);
        });

        it('移除不存在的實體時安全無錯（cell 存在但無該 entity）', () => {
            const inserted = { x: 50, y: 50 };
            const notInserted = { x: 60, y: 60 };
            grid.insert(inserted);

            expect(() => grid.remove(notInserted)).not.toThrow();
            expect(grid.getTotalEntities()).toBe(1);
        });

        it('移除時 cell 不存在也不拋錯（座標未被 insert 過）', () => {
            const orphan = { x: 500, y: 500 };
            expect(() => grid.remove(orphan)).not.toThrow();
        });

        it('移除後 getTotalEntities 正確遞減', () => {
            const a = { x: 50, y: 50 };
            const b = { x: 150, y: 50 };
            const c = { x: 250, y: 50 };
            grid.insert(a);
            grid.insert(b);
            grid.insert(c);
            expect(grid.getTotalEntities()).toBe(3);

            grid.remove(b);
            expect(grid.getTotalEntities()).toBe(2);

            grid.remove(a);
            grid.remove(c);
            expect(grid.getTotalEntities()).toBe(0);
        });
    });
});
