// @ts-check

/**
 * 就地壓縮存活敵人。以寫入指標覆蓋，避免逐個 splice 搬移尾端。
 * @param {Array<{ _alive: boolean }>} enemies
 * @returns {Array<{ _alive: boolean }>}
 */
export function removeDeadEnemies(enemies) {
    let write = 0;
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i]._alive) {
            enemies[write++] = enemies[i];
        }
    }
    enemies.length = write;
    return enemies;
}

/**
 * 清空空間網格後只插入目前列表中的敵人。
 * @param {{ clear: () => void, insert: (enemy: object) => void }} grid
 * @param {object[]} enemies
 * @returns {void}
 */
/**
 * 計數符合條件的元素，不配置 filter 陣列。
 * @param {Array<any>} list
 * @param {(item: any) => boolean} predicate
 * @returns {number}
 */
export function countIf(list, predicate) {
    let count = 0;
    for (let i = 0; i < list.length; i++) {
        if (predicate(list[i])) count++;
    }
    return count;
}

export function rebuildEnemyGrid(grid, enemies) {
    grid.clear();
    for (let i = 0; i < enemies.length; i++) {
        grid.insert(enemies[i]);
    }
}
