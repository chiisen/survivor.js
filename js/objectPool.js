// @ts-check

/**
 * 泛用物件池 — 透過復用物件減少 GC 壓力,內建自動擴充、修剪、清理與統計追蹤
 */
export class ObjectPool {
    /**
     * 建立物件池並預先建立 initialSize 個物件
     * @param {() => object} createFn - 物件工廠函式 (無參數,回傳新物件)
     * @param {(obj: object, ...args: any[]) => void} resetFn - 重置函式 (obj, ...args) => void,在 get() 時會被呼叫以重置物件狀態
     * @param {number} [initialSize=20] - 預先建立的物件數量
     * @param {number} [maxSize=100] - 物件總數上限 (含 pool + active)
     */
    constructor(createFn, resetFn, initialSize = 20, maxSize = 100) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        this.maxSize = maxSize;

        this.stats = {
            peakActiveCount: 0,
            totalCreated: initialSize,
            poolHits: 0,
            poolMisses: 0,
            totalGets: 0,
            totalReleases: 0,
            autoExpansions: 0
        };

        for (let i = 0; i < initialSize; i++) {
            const obj = this.createFn();
            obj._pooled = true;
            obj._active = false;
            this.pool.push(obj);
        }
    }

    /**
     * 從池中取得一個 active 物件 (優先復用 pool,不足時擴充或新建),並呼叫 resetFn 重置其狀態
     * @param {...any} args - 傳遞給 resetFn 的參數
     * @returns {object} 取得並已重置的物件 (標記 _active = true)
     */
    get(...args) {
        this.stats.totalGets++;

        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.stats.poolHits++;
        } else {
            if (this.getTotalCount() < this.maxSize) {
                obj = this.createFn();
                obj._pooled = true;
                this.stats.totalCreated++;
                this.stats.autoExpansions++;
            } else {
                obj = this.createFn();
                obj._pooled = false;
                this.stats.totalCreated++;
            }
            this.stats.poolMisses++;
        }

        obj._active = true;
        this.resetFn(obj, ...args);
        this.active.push(obj);

        if (this.active.length > this.stats.peakActiveCount) {
            this.stats.peakActiveCount = this.active.length;
        }

        return obj;
    }

    /**
     * 將物件歸還池中 (若 _pooled 則回收,否則僅標記 inactive);同一物件重複 release 為無效操作
     * @param {object} obj - 要歸還的物件
     * @returns {void}
     */
    release(obj) {
        if (!obj || !obj._active) return;

        obj._active = false;
        this.stats.totalReleases++;

        if (obj._pooled) {
            this.pool.push(obj);
        }
    }

    /**
     * 將所有 active 物件一次歸還池中並清空 active 陣列
     * @returns {void}
     */
    releaseAll() {
        for (const obj of this.active) {
            obj._active = false;
            if (obj._pooled) {
                this.pool.push(obj);
            }
        }
        this.active = [];
    }

    /**
     * 清理 active 陣列中 _active 為 false 的項目 (外部已手動標記為非 active 的物件會被移除)
     * @returns {void}
     */
    cleanInactive() {
        const trulyActive = [];
        for (const obj of this.active) {
            if (obj._active) {
                trulyActive.push(obj);
            }
        }
        this.active = trulyActive;
    }

    /**
     * 取得目前實際 active 物件數量 (過濾後)
     * @returns {number} active 物件數量
     */
    getActiveCount() {
        return this.active.filter(obj => obj._active).length;
    }

    /**
     * 取得 pool 中可復用物件數量
     * @returns {number} pool 物件數量
     */
    getPoolCount() {
        return this.pool.length;
    }

    /**
     * 取得 pool + active 的物件總數
     * @returns {number} 物件總數
     */
    getTotalCount() {
        return this.pool.length + this.getActiveCount();
    }

    /**
     * 取得池命中率 (poolHits / totalGets * 100,字串百分比),無任何 get 時回傳 0
     * @returns {string|number} 命中率字串 (含兩位小數) 或 0
     */
    getHitRate() {
        return this.stats.totalGets > 0
            ? (this.stats.poolHits / this.stats.totalGets * 100).toFixed(2)
            : 0;
    }

    /**
     * 取得完整統計快照 (含原始計數、目前狀態、命中率與效率)
     * @returns {{peakActiveCount: number, totalCreated: number, poolHits: number, poolMisses: number, totalGets: number, totalReleases: number, autoExpansions: number, currentActive: number, currentPool: number, hitRate: string, efficiency: string}} 統計物件
     */
    getStats() {
        return {
            ...this.stats,
            currentActive: this.getActiveCount(),
            currentPool: this.pool.length,
            hitRate: this.getHitRate() + '%',
            efficiency: this.stats.poolHits > 0
                ? (this.stats.poolHits / this.stats.totalCreated * 100).toFixed(2) + '%'
                : '0%'
        };
    }

    /**
     * 取得所有目前實際 active 的物件陣列 (過濾後)
     * @returns {object[]} active 物件陣列
     */
    getActiveObjects() {
        return this.active.filter(obj => obj._active);
    }

    /**
     * 對所有 active 物件呼叫其 update 方法 (若存在)
     * @param {number} dt - 時間增量 (秒)
     * @returns {void}
     */
    updateActive(dt) {
        for (const obj of this.active) {
            if (obj._active && obj.update) {
                obj.update(dt);
            }
        }
    }

    /**
     * 修剪 pool 直到不超過 maxPoolSize,釋出多餘物件的建立配額 (totalCreated 遞減)
     * @param {number} [maxPoolSize=30] - pool 保留上限
     * @returns {void}
     */
    prune(maxPoolSize = 30) {
        while (this.pool.length > maxPoolSize) {
            const obj = this.pool.pop();
            if (obj._pooled) {
                this.stats.totalCreated--;
            }
        }
    }

    /**
     * 依歷史尖峰自動擴充 pool (當尖峰 70% 大於目前 pool 且未達 maxSize 時,一次性補齊差距,最多 20 個)
     * @returns {void}
     */
    autoAdjust() {
        const avgActive = this.stats.peakActiveCount * 0.7;
        const currentPool = this.pool.length;

        if (avgActive > currentPool && this.getTotalCount() < this.maxSize) {
            const expandSize = Math.min(Math.ceil(avgActive - currentPool), 20);
            for (let i = 0; i < expandSize; i++) {
                const obj = this.createFn();
                obj._pooled = true;
                obj._active = false;
                this.pool.push(obj);
                this.stats.totalCreated++;
                this.stats.autoExpansions++;
            }
        }
    }

    /**
     * 將統計資訊輸出至 console (Active / Pool / Peak / Created / HitRate / Efficiency / Expansions)
     * @param {string} [name='ObjectPool'] - 顯示用的池名稱
     * @returns {void}
     */
    logStats(name = 'ObjectPool') {
        const stats = this.getStats();
        console.log(`[${name}] Stats:`, {
            'Active': stats.currentActive,
            'Pool': stats.currentPool,
            'Peak': stats.peakActiveCount,
            'Created': stats.totalCreated,
            'HitRate': stats.hitRate,
            'Efficiency': stats.efficiency,
            'Expansions': stats.autoExpansions
        });
    }
}
