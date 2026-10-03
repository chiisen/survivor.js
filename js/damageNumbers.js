// @ts-check

import { ObjectPool } from './objectPool.js';
import { DamageNumber } from './damageNumber.js';

/**
 * 將 active 數量壓到 limit 以下，優先歸還最舊的一筆。
 * @param {ObjectPool} pool
 * @param {number} limit
 * @returns {void}
 */
export function capActive(pool, limit) {
    const active = pool.getActiveObjects();
    let guard = active.length + 1;
    while (pool.getActiveCount() > limit && guard-- > 0) {
        let oldest = null;
        for (let i = 0; i < active.length; i++) {
            if (active[i]._active) {
                oldest = active[i];
                break;
            }
        }
        if (!oldest) break;
        pool.release(oldest);
    }
    pool.cleanInactive();
}

/**
 * @returns {ObjectPool}
 */
export function createDamageNumberPool() {
    return new ObjectPool(
        () => new DamageNumber(0, 0, 0),
        (obj, x, y, value, color) => /** @type {DamageNumber} */ (obj).init(x, y, value, color),
        20,
        200
    );
}

/**
 * @param {ObjectPool} pool
 * @param {number} x
 * @param {number} y
 * @param {number} value
 * @param {string|null} color
 * @returns {DamageNumber}
 */
export function spawnDamageNumber(pool, x, y, value, color = null) {
    const number = /** @type {DamageNumber} */ (pool.get(x, y, value, color));
    capActive(pool, 50);
    return number;
}
