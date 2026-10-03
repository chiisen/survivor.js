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
export function rebuildEnemyGrid(grid, enemies) {
    grid.clear();
    for (let i = 0; i < enemies.length; i++) {
        grid.insert(enemies[i]);
    }
}
