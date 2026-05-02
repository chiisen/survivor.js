export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 20) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get(...args) {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.resetFn(obj, ...args);
        } else {
            obj = this.createFn(...args);
        }
        this.active.push(obj);
        return obj;
    }

    release(obj) {
        const index = this.active.indexOf(obj);
        if (index !== -1) {
            this.active.splice(index, 1);
            this.pool.push(obj);
        }
    }

    releaseAll() {
        while (this.active.length > 0) {
            this.pool.push(this.active.pop());
        }
    }

    getActiveCount() {
        return this.active.length;
    }

    getPoolCount() {
        return this.pool.length;
    }

    getTotalCount() {
        return this.pool.length + this.active.length;
    }

    updateActive(dt) {
        for (const obj of this.active) {
            if (obj.update) {
                obj.update(dt);
            }
        }
    }

    getActiveObjects() {
        return this.active;
    }

    prune(maxPoolSize = 30) {
        while (this.pool.length > maxPoolSize) {
            this.pool.pop();
        }
    }
}