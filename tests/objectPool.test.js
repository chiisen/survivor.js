import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectPool } from '../js/objectPool.js';

describe('objectPool.js', () => {
    let pool;

    beforeEach(() => {
        pool = new ObjectPool(
            () => ({ id: Math.random(), _pooled: false, _active: false, reset() {} }),
            (obj, x = 0) => { obj.x = x; },
            5  // initialSize = 5
        );
    });

    describe('基本生命週期', () => {
        it('初始 pool 有 initialSize 個物件', () => {
            expect(pool.getPoolCount()).toBe(5);
        });

        it('get() 從 pool 取出一個物件並標記為 active', () => {
            const obj = pool.get(10);
            expect(obj).toHaveProperty('_active', true);
            expect(obj).toHaveProperty('x', 10);
        });

        it('get() 後 active 陣列包含該物件', () => {
            const obj = pool.get();
            expect(pool.getActiveObjects()).toContain(obj);
        });

        it('release() 將物件歸還 pool', () => {
            const obj = pool.get();
            pool.release(obj);
            expect(pool.getPoolCount()).toBe(5); // 回到初始大小
            expect(pool.getActiveCount()).toBe(0);
        });

        it('同一物件不能被 release 兩次', () => {
            const obj = pool.get();
            pool.release(obj);
            pool.release(obj); // 第二次應該無效
            expect(pool.getPoolCount()).toBe(5); // 不會變成 6
        });
    });

    describe('autoExpansion', () => {
        it('pool 為空且未達 maxSize 時自動擴張', () => {
            // 消耗完初始 5 個
            const objs = [];
            for (let i = 0; i < 5; i++) objs.push(pool.get());

            // 這次 get 會觸發 autoExpansion
            pool.get();

            // autoExpansion 直接進 active，不放回 pool
            expect(pool.getPoolCount()).toBe(0);
            expect(pool.getActiveCount()).toBe(6);
            expect(pool.stats.autoExpansions).toBe(1);
        });

        it('已達 maxSize 時不會再扩张', () => {
            const smallPool = new ObjectPool(
                () => ({ id: Math.random() }),
                () => {},
                2,
                3  // maxSize = 3
            );

            for (let i = 0; i < 3; i++) smallPool.get();

            expect(() => {
                // 第 4 次調用不應拋錯，但會超過 maxSize
                const obj = smallPool.get();
                // _pooled 為 false 表示沒有被 pool 管理
                expect(obj._pooled).toBe(false);
            }).not.toThrow();
        });
    });

    describe('stats 追蹤', () => {
        it('get() 一次 totalGets +1', () => {
            pool.get();
            expect(pool.stats.totalGets).toBe(1);
        });

        it('release() 一次 totalReleases +1', () => {
            const obj = pool.get();
            pool.release(obj);
            expect(pool.stats.totalReleases).toBe(1);
        });

        it('pool hit 時 poolHits +1', () => {
            pool.get();
            pool.get();
            expect(pool.stats.poolHits).toBe(2);
        });

        it('pool miss 時 poolMisses +1', () => {
            // 消耗完 pool
            for (let i = 0; i < 5; i++) pool.get();
            pool.get(); // 觸發 autoExpansion，這次算 miss
            expect(pool.stats.poolMisses).toBe(1);
        });

        it('getHitRate() 回傳百分比數值（無 % 符號）', () => {
            pool.get();
            pool.get();
            pool.get();
            // getHitRate() 回傳 "100.00"，% 是 getStats() 包裝時加的
            expect(pool.getHitRate()).toBe('100.00');
        });
        
        it('getStats() 的 hitRate 有 % 符號', () => {
            pool.get();
            pool.get();
            expect(pool.getStats().hitRate).toBe('100.00%');
        });
    });

    describe('releaseAll / cleanInactive', () => {
        it('releaseAll() 一次釋放所有物件', () => {
            pool.get();
            pool.get();
            pool.releaseAll();
            expect(pool.getActiveCount()).toBe(0);
            expect(pool.getPoolCount()).toBeGreaterThan(0); // 回到 pool 而非丟棄
        });
    });

    describe('getStats()', () => {
        it('回傳完整統計物件', () => {
            const stats = pool.getStats();
            expect(stats).toHaveProperty('currentActive');
            expect(stats).toHaveProperty('currentPool');
            expect(stats).toHaveProperty('hitRate');
            expect(stats).toHaveProperty('efficiency');
        });
    });
});