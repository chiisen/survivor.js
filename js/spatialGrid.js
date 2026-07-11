// @ts-check

/**
 * 空間分割網格 — 以 cell 為單位將實體分桶,加速半徑查詢的碰撞檢測
 */
export class SpatialGrid {
    /**
     * 建立空間網格
     * @param {number} cellSize - 每格邊長(像素)
     */
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    /**
     * 清空所有儲存的實體
     * @returns {void}
     */
    clear() {
        this.grid.clear();
    }

    /**
     * 根據座標計算所在 cell 的字串鍵值
     * @param {number} x - 世界座標 X
     * @param {number} y - 世界座標 Y
     * @returns {string} cell 鍵值(格式為 "cellX,cellY")
     */
    getKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    /**
     * 將實體加入其座標對應的 cell
     * @param {Object} entity - 欲加入的實體(須含 x, y 屬性)
     * @returns {void}
     */
    insert(entity) {
        const key = this.getKey(entity.x, entity.y);
        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        this.grid.get(key).push(entity);
    }

    /**
     * 從其座標對應的 cell 中移除實體
     * @param {Object} entity - 欲移除的實體(須含 x, y 屬性)
     * @returns {void}
     */
    remove(entity) {
        const key = this.getKey(entity.x, entity.y);
        const cell = this.grid.get(key);
        if (!cell) return;
        const index = cell.indexOf(entity);
        if (index !== -1) {
            cell.splice(index, 1);
        }
    }

    /**
     * 取得指定座標半徑範圍內的所有實體(以 cell 為單位掃描,故可能包含半徑外的實體,呼叫端需自行做精確距離檢查)
     * @param {number} x - 中心點世界座標 X
     * @param {number} y - 中心點世界座標 Y
     * @param {number} radius - 查詢半徑(像素)
     * @returns {Array<Object>} 半徑涵蓋範圍內所有 cell 的實體陣列
     */
    getNearby(x, y, radius) {
        const nearby = [];
        const cellRadius = Math.ceil(radius / this.cellSize);
        const centerCellX = Math.floor(x / this.cellSize);
        const centerCellY = Math.floor(y / this.cellSize);

        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            for (let dy = -cellRadius; dy <= cellRadius; dy++) {
                const key = `${centerCellX + dx},${centerCellY + dy}`;
                if (this.grid.has(key)) {
                    nearby.push(...this.grid.get(key));
                }
            }
        }

        return nearby;
    }

    /**
     * 取得目前有存放實體的 cell 數量
     * @returns {number} 非空 cell 數量
     */
    getCellCount() {
        return this.grid.size;
    }

    /**
     * 取得所有 cell 中實體的總數
     * @returns {number} 所有實體總和
     */
    getTotalEntities() {
        let total = 0;
        for (const entities of this.grid.values()) {
            total += entities.length;
        }
        return total;
    }
}