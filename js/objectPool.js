export class ObjectPool {
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
    
    release(obj) {
        if (!obj || !obj._active) return;
        
        obj._active = false;
        this.stats.totalReleases++;
        
        if (obj._pooled) {
            this.pool.push(obj);
        }
    }
    
    releaseAll() {
        for (const obj of this.active) {
            obj._active = false;
            if (obj._pooled) {
                this.pool.push(obj);
            }
        }
        this.active = [];
    }
    
    cleanInactive() {
        const trulyActive = [];
        for (const obj of this.active) {
            if (obj._active) {
                trulyActive.push(obj);
            }
        }
        this.active = trulyActive;
    }
    
    getActiveCount() {
        return this.active.filter(obj => obj._active).length;
    }
    
    getPoolCount() {
        return this.pool.length;
    }
    
    getTotalCount() {
        return this.pool.length + this.getActiveCount();
    }
    
    getHitRate() {
        return this.stats.totalGets > 0 
            ? (this.stats.poolHits / this.stats.totalGets * 100).toFixed(2)
            : 0;
    }
    
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
    
    getActiveObjects() {
        return this.active.filter(obj => obj._active);
    }
    
    updateActive(dt) {
        for (const obj of this.active) {
            if (obj._active && obj.update) {
                obj.update(dt);
            }
        }
    }
    
    prune(maxPoolSize = 30) {
        while (this.pool.length > maxPoolSize) {
            const obj = this.pool.pop();
            if (obj._pooled) {
                this.stats.totalCreated--;
            }
        }
    }
    
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