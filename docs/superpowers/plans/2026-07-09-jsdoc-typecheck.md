# JSDoc 型別標註 + TypeScript checkJs 工具鏈 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 為 10 個核心模組加 JSDoc 型別標註,並引入 TypeScript `checkJs` 進行靜態型別驗證。

**Architecture:**
- 使用 `// @ts-check` 逐檔宣告 (而非 `jsconfig.json` 全域 `checkJs: true`),**避免修改 28 個非目標檔案**。這是相對於 spec 的小幅設計精修 — 精神一致(只檢查目標檔),但更乾淨。
- 漸進式 5 Phase 交付,每 Phase 1 個 commit,跑三層驗證 (`tsc` + `vitest` + 瀏覽器 smoke test)
- 維持現有 runtime 不變 (`noEmit: true`,TypeScript 純 dev 工具)

**Tech Stack:** TypeScript 5.6 (dev 工具) + Vitest 4.1 + Node.js + ES2022 模組

---

## 設計精修說明

相對於已 commit 的 spec (`docs/superpowers/specs/2026-07-09-jsdoc-typecheck-design.md` § 2.2),本計畫調整:

- **spec 原案**: `jsconfig.json` 設 `checkJs: true`,需對 28 個非目標檔加 `// @ts-nocheck`
- **本計畫修正**: `checkJs: false` 全域,只對 10 個目標檔加 `// @ts-check`(opt-in)

效果相同(只檢查 10 個核心檔),但**不需動 28 個非目標檔**,更符合「微創異動」。

---

## 檔案結構

### 新增
- `jsconfig.json` — TypeScript checkJs 配置
- `docs/superpowers/TODO-typescript-fixes.md` — 過程中發現的既有 bug 追蹤清單(可能為空)

### 修改
- `package.json` — 新增 typescript devDependency + typecheck scripts
- `js/utils.js` — 加 `// @ts-check` + 9 個函式 JSDoc
- `js/spatialGrid.js` — 加 `// @ts-check` + 1 個 class JSDoc
- `js/objectPool.js` — 加 `// @ts-check` + class JSDoc
- `js/projectile.js` — 加 `// @ts-check` + class JSDoc
- `js/player.js` — 加 `// @ts-check` + 委派方法 JSDoc
- `js/enemy.js` — 加 `// @ts-check` + 委派方法 JSDoc
- `js/playerCore.js` — 加 `// @ts-check` + class JSDoc
- `js/playerCombat.js` — 加 `// @ts-check` + class JSDoc
- `js/enemyCore.js` — 加 `// @ts-check` + class JSDoc
- `js/game.js` — 加 `// @ts-check` + 主要方法 JSDoc
- `CHANGELOG.md` — 新增本次變更記錄

---

## Task 0: 工具鏈建置 (Toolchain Setup)

**Files:**
- Modify: `package.json` (新增 typescript devDep 與 typecheck scripts)
- Create: `jsconfig.json`

- [ ] **Step 1: 安裝 typescript devDependency**

Run: `npm install --save-dev typescript@^5.6.0`
Expected: 安裝完成,`package.json` 的 `devDependencies` 出現 `"typescript": "^5.6.0"`

- [ ] **Step 2: 確認 tsc 可用**

Run: `npx tsc --version`
Expected: `Version 5.6.x`

- [ ] **Step 3: 建立 jsconfig.json**

Create file `jsconfig.json`:
```json
{
    "compilerOptions": {
        "checkJs": false,
        "allowJs": true,
        "noEmit": true,
        "target": "ES2022",
        "module": "ES2022",
        "moduleResolution": "bundler",
        "strict": false,
        "lib": ["ES2022", "DOM"]
    },
    "include": ["js/**/*.js", "tests/**/*.js"],
    "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 驗證 tsc 對無 `// @ts-check` 的檔不報錯**

Run: `npx tsc --noEmit`
Expected: 無輸出(代表 0 errors,因為 `checkJs: false` + 沒有任何檔 opt-in)

- [ ] **Step 5: 在 package.json 新增 typecheck scripts**

Modify `package.json` `scripts` 區塊,在 `test:watch` 後新增:
```json
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch"
```

- [ ] **Step 6: 確認 scripts 生效**

Run: `npm run typecheck`
Expected: 無錯誤輸出,exit code 0

- [ ] **Step 7: Commit**

```bash
git add package.json jsconfig.json
git commit -m "chore(typed): Phase 0 - install typescript and add jsconfig.json

- typescript 5.6 作為 dev 工具,不影響 runtime
- jsconfig.json 採用 // @ts-check 逐檔 opt-in 模式
- 新增 npm run typecheck 與 typecheck:watch scripts
- checkJs: false 全域,避免檢查未標註的非目標檔"
```

---

## Task 1: Phase 1 - utils.js (先鋒)

**Files:**
- Modify: `js/utils.js` (加 `// @ts-check` + 9 個函式 JSDoc)

- [ ] **Step 1: 加上 `// @ts-check` 並跑 typecheck 確認報錯**

Modify `js/utils.js` 第 1 行(檔案最頂端),加:
```js
// @ts-check
```

Run: `npm run typecheck`
Expected: 報錯 (例如 `Parameter 'x1' implicitly has an 'any' type` 等),確認 `// @ts-check` 生效

- [ ] **Step 2: 為 9 個 export 函式加 JSDoc**

Replace entire `js/utils.js` content with:
```js
// @ts-check

/**
 * 計算兩點間歐氏距離
 * @param {number} x1 - 點1 X 座標
 * @param {number} y1 - 點1 Y 座標
 * @param {number} x2 - 點2 X 座標
 * @param {number} y2 - 點2 Y 座標
 * @returns {number} 兩點距離
 */
export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 計算兩點距離平方(避免 Math.sqrt 運算,用於距離比較)
 * @param {number} x1 - 點1 X 座標
 * @param {number} y1 - 點1 Y 座標
 * @param {number} x2 - 點2 X 座標
 * @param {number} y2 - 點2 Y 座標
 * @returns {number} 兩點距離平方
 */
export function distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * 向量正規化
 * @param {number} x - 向量 X 分量
 * @param {number} y - 向量 Y 分量
 * @returns {{x: number, y: number}} 長度為 1 的單位向量(若原向量為 0 則回傳 {x:0, y:0})
 */
export function normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

/**
 * 取得 [min, max) 範圍內的隨機浮點數
 * @param {number} min - 下界(包含)
 * @param {number} max - 上界(不包含)
 * @returns {number} 隨機浮點數
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 取得 [min, max] 範圍內的隨機整數
 * @param {number} min - 下界(包含)
 * @param {number} max - 上界(包含)
 * @returns {number} 隨機整數
 */
export function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

/**
 * 將秒數格式化為 mm:ss 字串
 * @param {number} seconds - 秒數
 * @returns {string} mm:ss 格式字串
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 將值限制在 [min, max] 範圍內
 * @param {number} value - 輸入值
 * @param {number} min - 下界
 * @param {number} max - 上界
 * @returns {number} 限制後的值
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * 線性插值
 * @param {number} a - 起點
 * @param {number} b - 終點
 * @param {number} t - 插值參數(0=a, 1=b)
 * @returns {number} 插值結果
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * 取得經驗值等級倍率
 * @param {number} level - 玩家等級
 * @param {number} [growthRate=1.5] - 成長率
 * @returns {number} 等級倍率
 */
export function getExpLevelMultiplier(level, growthRate = 1.5) {
    return Math.pow(growthRate, level - 1);
}
```

- [ ] **Step 3: 跑 typecheck 確認零錯**

Run: `npm run typecheck`
Expected: 無錯誤輸出

- [ ] **Step 4: 跑 vitest 確認既有測試未受影響**

Run: `npm test`
Expected: 既有測試 (utils.test.js 等) 100% 通過

- [ ] **Step 5: Commit**

```bash
git add js/utils.js
git commit -m "feat(typed): Phase 1 - utils.js JSDoc 型別標註

- 加上 // @ts-check opt-in 檢查
- 為 9 個 export 函式加 JSDoc (@param/@returns)
- tsc 結果: 0 errors
- Vitest: 既有測試 100% 通過"
```

---

## Task 2: Phase 1 - spatialGrid.js (先鋒) + 整合驗證

**Files:**
- Modify: `js/spatialGrid.js` (加 `// @ts-check` + SpatialGrid class JSDoc)

- [ ] **Step 1: 加上 `// @ts-check` 並跑 typecheck 確認報錯**

Modify `js/spatialGrid.js` 第 1 行,加:
```js
// @ts-check
```

Run: `npm run typecheck`
Expected: 報錯(隱式 any),確認 opt-in 生效

- [ ] **Step 2: 為 SpatialGrid class 與方法加 JSDoc**

Replace entire `js/spatialGrid.js` content with:
```js
// @ts-check

/**
 * 空間網格,用於碰撞檢測的空間分割(從 O(n×m) 降至 O(n×k))
 */
export class SpatialGrid {
    /**
     * @param {number} cellSize - 網格格子大小(px)
     */
    constructor(cellSize) {
        this.cellSize = cellSize;
        /** @type {Map<string, Array<{x: number, y: number}>>} */
        this.grid = new Map();
    }

    /**
     * 清空網格
     * @returns {void}
     */
    clear() {
        this.grid.clear();
    }

    /**
     * 計算座標對應的網格 key
     * @param {number} x - 世界 X 座標
     * @param {number} y - 世界 Y 座標
     * @returns {string} 格式為 "cellX,cellY" 的 key
     */
    getKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    /**
     * 將實體插入對應的網格格子
     * @param {{x: number, y: number}} entity - 需含 x, y 屬性的實體
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
     * 取得座標附近半徑內的所有實體
     * @param {number} x - 中心 X 座標
     * @param {number} y - 中心 Y 座標
     * @param {number} radius - 搜尋半徑(px)
     * @returns {Array<{x: number, y: number}>} 半徑內的實體陣列
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
     * 取得目前有實體的格子數
     * @returns {number} 格子數
     */
    getCellCount() {
        return this.grid.size;
    }

    /**
     * 取得網格中所有實體的總數
     * @returns {number} 實體總數
     */
    getTotalEntities() {
        let total = 0;
        for (const entities of this.grid.values()) {
            total += entities.length;
        }
        return total;
    }
}
```

- [ ] **Step 3: 跑 typecheck 確認零錯**

Run: `npm run typecheck`
Expected: 無錯誤輸出

- [ ] **Step 4: 跑 vitest 確認既有測試未受影響**

Run: `npm test`
Expected: 既有測試 100% 通過

- [ ] **Step 5: 瀏覽器 smoke test (Phase 1 結束閘門)**

Run: `npm run dev`(另開終端)
然後在瀏覽器開 http://localhost:3000,新遊戲,玩 30 秒,確認:
- 無 console error
- 玩家可正常移動、攻擊
- 敵人正常生成與擊殺
- FPS ≥ 50

若失敗,先修正再繼續。

- [ ] **Step 6: Phase 1 整合 commit**

```bash
git add js/spatialGrid.js
git commit -m "feat(typed): Phase 1 - spatialGrid.js JSDoc 型別標註

- 加上 // @ts-check opt-in 檢查
- 為 SpatialGrid class 與 7 個方法加 JSDoc
- 為 this.grid 加顯式 @type (Map<string, Array<{x, y}>>)
- tsc 結果: 0 errors
- Vitest: 既有測試 100% 通過
- Smoke test: 30 秒無 console error, FPS 正常"
```

---

## Task 3: Phase 2 - objectPool.js (基礎模組)

**Files:**
- Modify: `js/objectPool.js` (加 `// @ts-check` + ObjectPool class JSDoc)

- [ ] **Step 1: 加上 `// @ts-check` 並跑 typecheck 確認報錯**

Modify `js/objectPool.js` 第 1 行,加:
```js
// @ts-check
```

Run: `npm run typecheck`
Expected: 報錯(隱式 any)

- [ ] **Step 2: 為 ObjectPool class 與方法加 JSDoc**

Replace entire `js/objectPool.js` content with:
```js
// @ts-check

/**
 * 泛型物件池,用於重複使用物件以降低 GC 壓力
 * @template {object} T
 */
export class ObjectPool {
    /**
     * @param {() => T} createFn - 建立新物件的函式
     * @param {(obj: T, ...args: any[]) => void} resetFn - 重置物件狀態的函式
     * @param {number} [initialSize=20] - 預先建立的物件數量
     * @param {number} [maxSize=100] - 池的最大容量
     */
    constructor(createFn, resetFn, initialSize = 20, maxSize = 100) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        /** @type {T[]} */
        this.pool = [];
        /** @type {T[]} */
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
     * 從池中取得一個物件(若池空且未達 maxSize 會自動擴容)
     * @param {...any} args - 傳遞給 resetFn 的參數
     * @returns {T} 取得並重置後的物件
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
     * 釋放單一物件回池
     * @param {T} obj - 要釋放的物件
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
     * 釋放所有 active 物件
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
     * 清理 active 陣列中已非活躍的物件
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
     * 取得目前活躍的物件數
     * @returns {number} 活躍物件數
     */
    getActiveCount() {
        return this.active.filter(obj => obj._active).length;
    }

    /**
     * 取得池中閒置的物件數
     * @returns {number} 閒置物件數
     */
    getPoolCount() {
        return this.pool.length;
    }

    /**
     * 取得池中總物件數(閒置+活躍)
     * @returns {number} 總物件數
     */
    getTotalCount() {
        return this.pool.length + this.getActiveCount();
    }

    /**
     * 取得命中率(百分比字串)
     * @returns {string|number} 命中率字串
     */
    getHitRate() {
        return this.stats.totalGets > 0
            ? (this.stats.poolHits / this.stats.totalGets * 100).toFixed(2)
            : 0;
    }

    /**
     * 取得物件池統計資料
     * @returns {object} 統計物件(包含 hitRate、efficiency 等)
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
     * 取得所有活躍物件
     * @returns {T[]} 活躍物件陣列
     */
    getActiveObjects() {
        return this.active.filter(obj => obj._active);
    }

    /**
     * 更新所有活躍物件
     * @param {number} dt - 時間差(秒)
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
     * 修剪池中過多閒置物件
     * @param {number} [maxPoolSize=30] - 池保留的最大數量
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
     * 根據歷史使用量自動擴容池
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
     * 將統計資料輸出至 console
     * @param {string} [name='ObjectPool'] - 池的名稱
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
```

- [ ] **Step 3: 跑 typecheck 確認零錯**

Run: `npm run typecheck`
Expected: 無錯誤輸出

- [ ] **Step 4: 跑 vitest 確認既有測試未受影響**

Run: `npm test`
Expected: 既有測試(含 `tests/objectPool.test.js`)100% 通過

- [ ] **Step 5: Commit**

```bash
git add js/objectPool.js
git commit -m "feat(typed): Phase 2 - objectPool.js JSDoc 型別標註

- 加上 // @ts-check opt-in 檢查
- 為 ObjectPool class 與 16 個方法加 JSDoc
- 使用 @template T 泛型(基本嚴格度下唯一允許的泛型)
- 為 this.pool/this.active 加顯式 @type
- tsc 結果: 0 errors
- Vitest: 既有測試 100% 通過"
```

---

## Task 4: Phase 2 - projectile.js + 整合驗證

**Files:**
- Modify: `js/projectile.js` (加 `// @ts-check` + Projectile class JSDoc)

- [ ] **Step 1: 加上 `// @ts-check` 並跑 typecheck 確認報錯**

Modify `js/projectile.js` 第 1 行(在 `import` 之前),加:
```js
// @ts-check
```

Run: `npm run typecheck`
Expected: 報錯(隱式 any)

- [ ] **Step 2: 為 Projectile class 與方法加 JSDoc**

Replace entire `js/projectile.js` content with:
```js
// @ts-check
import { normalize, distance } from './utils.js';

/**
 * 魔法彈物件,負責飛行軌跡、命中判定與繪製
 */
export class Projectile {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 8;
        this.vx = 0;
        this.vy = 0;
        this.damage = 1;
        this.color = '#f39c12';
        /** @type {Array<{x: number, y: number}>} */
        this.trail = [];
        this.maxTrailLength = 10;
        this.active = false;
        this.isCrit = false;
    }

    /**
     * 初始化魔法彈位置與飛行方向
     * @param {number} x - 起始 X
     * @param {number} y - 起始 Y
     * @param {number} targetX - 目標 X
     * @param {number} targetY - 目標 Y
     * @param {number} speed - 飛行速度(px/秒)
     * @param {number} damage - 傷害值
     * @returns {void}
     */
    init(x, y, targetX, targetY, speed, damage) {
        this.x = x;
        this.y = y;
        const dir = normalize(targetX - x, targetY - y);
        this.vx = dir.x * speed;
        this.vy = dir.y * speed;
        this.damage = damage;
        this.trail = [];
        this.active = true;
        this.isCrit = false;
    }

    /**
     * 重置魔法彈至初始狀態
     * @returns {void}
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.damage = 1;
        this.trail = [];
        this.active = false;
        this.isCrit = false;
    }

    /**
     * 更新魔法彈位置與拖尾
     * @param {number} dt - 時間差(秒)
     * @returns {void}
     */
    update(dt) {
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    /**
     * 繪製魔法彈與拖尾
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D 繪製上下文
     * @returns {void}
     */
    draw(ctx) {
        ctx.save();

        const baseColor = this.isCrit ? '#e74c3c' : '#f39c12';
        const trailColor = this.isCrit ? 'rgba(231, 76, 60,' : 'rgba(243, 156, 18,';

        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (1 - i / this.trail.length) * 0.3;
            const radius = this.radius * (1 - i / this.trail.length * 0.5);
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `${trailColor} ${alpha})`;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();

        if (this.isCrit) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        const gradient = ctx.createRadialGradient(
            this.x - 2, this.y - 2, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, baseColor);
        gradient.addColorStop(1, this.isCrit ? '#c0392b' : '#e67e22');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
    }

    /**
     * 判斷魔法彈是否已飛出畫面外
     * @param {number} canvasWidth - 畫布寬度
     * @param {number} canvasHeight - 畫布高度
     * @returns {boolean} 是否超出邊界(含 100px margin)
     */
    isOutOfBounds(canvasWidth, canvasHeight) {
        const margin = 100;
        return (
            this.x < -margin ||
            this.x > canvasWidth + margin ||
            this.y < -margin ||
            this.y > canvasHeight + margin
        );
    }
}
```

- [ ] **Step 3: 跑 typecheck 確認零錯**

Run: `npm run typecheck`
Expected: 無錯誤輸出

- [ ] **Step 4: 跑 vitest 確認既有測試未受影響**

Run: `npm test`
Expected: 既有測試 100% 通過

- [ ] **Step 5: Phase 2 commit**

```bash
git add js/projectile.js
git commit -m "feat(typed): Phase 2 - projectile.js JSDoc 型別標註

- 加上 // @ts-check opt-in 檢查
- 為 Projectile class 與 5 個方法加 JSDoc
- 為 this.trail 加顯式 @type (Array<{x, y}>)
- 標註 ctx 為 CanvasRenderingContext2D
- tsc 結果: 0 errors
- Vitest: 既有測試 100% 通過"
```

---

## Task 5: Phase 3 - player.js (組合根模組)

**Files:**
- Modify: `js/player.js` (加 `// @ts-check` + Player class JSDoc,委派方法加回傳型別)

- [ ] **Step 1: 加上 `// @ts-check` 並跑 typecheck 確認報錯**

Modify `js/player.js` 第 1 行(在 `import` 之前),加:
```js
// @ts-check
```

Run: `npm run typecheck`
Expected: 報錯(隱式 any)

- [ ] **Step 2: 為 Player class 與關鍵方法加 JSDoc**

Modify `js/player.js`,在 `export class Player {` 前加 class JSDoc,並為每個**非 getter/setter 的方法**加 JSDoc:

```js
// @ts-check
import { PlayerCore } from './playerCore.js';
import { PlayerCombat } from './playerCombat.js';
import { PlayerRenderer } from './playerRenderer.js';

/**
 * 玩家物件,組合 PlayerCore(位置/移動)、PlayerCombat(射擊/技能)、PlayerRenderer(繪製)
 * 對外提供統一介面,內部以 Getter/Setter 委派至子模組
 */
export class Player {
    /**
     * @param {number} x - 起始 X 座標
     * @param {number} y - 起始 Y 座標
     */
    constructor(x, y) {
        this.core = new PlayerCore(x, y);
        this.combat = new PlayerCombat(this.core);
        this.renderer = new PlayerRenderer();
    }
    
    // (保留所有既有 getter/setter 不變)
    
    /**
     * 取得玩家升級後的總加成(core + combat 合併)
     * @returns {object} 升級加成物件
     */
    get upgradeStats() {
        return {
            ...this.core.upgradeStats,
            ...this.combat.upgradeStats
        };
    }
    
    /**
     * 更新玩家狀態(移動 + 戰鬥)
     * @param {number} dt - 時間差(秒)
     * @param {Object.<string, boolean>} keys - 按鍵狀態物件
     * @param {number} canvasWidth - 畫布寬度
     * @param {number} canvasHeight - 畫布高度
     * @returns {void}
     */
    update(dt, keys, canvasWidth, canvasHeight) {
        this.core.update(dt, keys, canvasWidth, canvasHeight);
        this.combat.update(dt);
    }
    
    /**
     * 繪製玩家
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D 繪製上下文
     * @returns {void}
     */
    draw(ctx) {
        this.renderer.draw(ctx, this.core, this.combat);
    }
    
    /**
     * 套用升級效果(委派至對應的子模組)
     * @param {{type: string, value: number}} upgrade - 升級物件
     * @returns {void}
     */
    applyUpgrade(upgrade) {
        if (this.core.upgradeStats.hasOwnProperty(upgrade.type)) {
            this.core.applyUpgrade(upgrade);
        } else if (this.combat.upgradeStats.hasOwnProperty(upgrade.type)) {
            this.combat.applyUpgrade(upgrade);
        }
    }
    
    /**
     * 委派至 combat 模組
     * @returns {boolean} 是否可射擊
     */
    canFire() {
        return this.combat.canFire();
    }
    
    /**
     * 委派至 combat 模組
     * @param {number} targetX - 目標 X
     * @param {number} targetY - 目標 Y
     * @returns {void}
     */
    fire(targetX, targetY) {
        this.combat.fire(targetX, targetY);
    }
    
    /**
     * 啟動攻擊速度 buff(連殺觸發)
     * @returns {void}
     */
    activateFireRateBuff() {
        this.combat.activateFireRateBuff();
    }
    
    /**
     * 擲骰暴擊
     * @returns {number} 暴擊傷害倍率(未暴擊回傳 1)
     */
    rollCrit() {
        return this.combat.rollCrit();
    }
    
    /**
     * 治療玩家(委派至 combat 模組)
     * @param {number} amount - 治療量
     * @returns {void}
     */
    heal(amount) {
        this.combat.heal(amount);
    }
    
    /**
     * @returns {boolean} 終極技能是否可用
     */
    canUseSkill() {
        return this.combat.canUseSkill();
    }
    
    /**
     * 使用終極技能(Q 鍵)
     * @returns {void}
     */
    useSkill() {
        this.combat.useSkill();
    }
    
    /**
     * 更新終極技能冷卻
     * @param {number} dt - 時間差(秒)
     * @returns {void}
     */
    updateSkillCooldown(dt) {
        this.combat.updateSkillCooldown(dt);
    }
    
    /**
     * 玩家受到傷害(委派至 combat 處理護盾/無敵/HP 邏輯)
     * @param {number} rawDamage - 原始傷害值
     * @returns {{hpChanged: boolean, isDead: boolean}} 傷害結果
     */
    takeDamage(rawDamage) {
        return this.combat.takeDamage(rawDamage);
    }
}
```

> 註:getter/setter 委派方法因語意明確,不加個別 JSDoc(讀者可從命名推知行為)。

- [ ] **Step 3: 跑 typecheck 確認零錯**

Run: `npm run typecheck`
Expected: 無錯誤輸出

- [ ] **Step 4: 跑 vitest 確認既有測試未受影響**

Run: `npm test`
Expected: 既有測試 100% 通過

- [ ] **Step 5: Commit**

```bash
git add js/player.js
git commit -m "feat(typed): Phase 3 - player.js JSDoc 型別標註

- 加上 // @ts-check opt-in 檢查
- 為 Player class 與 12 個關鍵方法加 JSDoc
- Getter/Setter 委派保持精簡(語意明確)
- 標註 update() 的 keys 為 Object.<string, boolean>
- 標註 takeDamage() 回傳 {hpChanged, isDead}
- tsc 結果: 0 errors
- Vitest: 既有測試 100% 通過"
```

---

## Task 6: Phase 3 - enemy.js + 整合驗證

**Files:**
- Modify: `js/enemy.js` (加 `// @ts-check` + Enemy class JSDoc)

- [ ] **Step 1: 加上 `// @ts-check` 並跑 typecheck 確認報錯**

Modify `js/enemy.js` 第 1 行(在 `import` 之前),加:
```js
// @ts-check
```

Run: `npm run typecheck`
Expected: 報錯(隱式 any)

- [ ] **Step 2: 為 Enemy class 與關鍵方法加 JSDoc**

Modify `js/enemy.js`,在 `export class Enemy {` 前加 class JSDoc,並為關鍵方法加 JSDoc:

```js
// @ts-check
import { normalize, distance, randomRange } from './utils.js';
import { EnemyCore } from './enemyCore.js';
import { EnemyBehaviors } from './enemyBehaviors.js';
import { BossPhaseManager } from './bossPhaseManager.js';
import { EnemyRenderer } from './enemyRenderer.js';

// (保留 EnemyTypes const 區塊不變,共 9 種敵人類型)

/**
 * 敵人物件,組合 EnemyCore(位置/移動)、EnemyBehaviors(射擊/分裂/隱形)、EnemyRenderer(繪製)
 * Boss 時額外掛載 BossPhaseManager(多階段狂暴)
 */
export class Enemy {
    /**
     * @param {number} x - 起始 X 座標
     * @param {number} y - 起始 Y 座標
     * @param {object} type - 敵人類型設定(來自 EnemyTypes)
     */
    constructor(x, y, type) {
        this.type = type;
        this.core = new EnemyCore(type, x, y);
        this.behaviors = new EnemyBehaviors(this.core);
        this.renderer = new EnemyRenderer();
        this.phaseManager = type.isBoss ? new BossPhaseManager(this.core) : null;
    }
    
    // (保留所有既有 getter/setter 不變)
    
    /**
     * 更新敵人狀態(移動 + 行為)
     * @param {number} dt - 時間差(秒)
     * @param {number} playerX - 玩家 X
     * @param {number} playerY - 玩家 Y
     * @param {number} [playerAttackRange=300] - 玩家攻擊範圍(用於敵人加速判定)
     * @returns {object|null} 若敵人有動作(射擊等)回傳動作物件,否則 null
     */
    update(dt, playerX, playerY, playerAttackRange = 300) {
        // (保留既有實作不變)
    }
    
    /**
     * 隱形敵人被揭露
     * @returns {void}
     */
    reveal() {
        this.core.reveal();
    }
    
    /**
     * 繪製敵人
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D 繪製上下文
     * @returns {void}
     */
    draw(ctx) {
        this.renderer.draw(ctx, this.core, this.behaviors, this.phaseManager);
    }
    
    /**
     * 從畫面外隨機生成敵人(包含類型權重選擇)
     * @param {number} canvasWidth - 畫布寬度
     * @param {number} canvasHeight - 畫布高度
     * @param {number} playerX - 玩家 X(用於 Boss 出場位置)
     * @param {number} playerY - 玩家 Y
     * @param {number} gameTime - 遊戲時間(秒,影響類型權重)
     * @param {boolean} [isBoss=false] - 是否生成 Boss
     * @param {number} [hpMultiplier=1] - HP 倍率
     * @returns {Enemy} 生成的敵人物件
     */
    static spawn(canvasWidth, canvasHeight, playerX, playerY, gameTime, isBoss = false, hpMultiplier = 1) {
        // (保留既有實作不變)
    }
}

export { EnemyTypes };
```

> 註:getter/setter 與 EnemyTypes 各型別不需個別 JSDoc。

- [ ] **Step 3: 跑 typecheck 確認零錯**

Run: `npm run typecheck`
Expected: 無錯誤輸出

- [ ] **Step 4: 跑 vitest 確認既有測試未受影響**

Run: `npm test`
Expected: 既有測試 100% 通過

- [ ] **Step 5: 瀏覽器 smoke test (Phase 3 結束閘門)**

Run: `npm run dev`(另開終端)
瀏覽器開 http://localhost:3000,新遊戲,玩 30 秒:
- 確認玩家可正常移動、攻擊
- 確認多種敵人(普通/快速/坦克/遠程)正常出現
- 確認升級介面正常顯示
- 確認無 console error,FPS ≥ 50

- [ ] **Step 6: Phase 3 commit**

```bash
git add js/enemy.js
git commit -m "feat(typed): Phase 3 - enemy.js JSDoc 型別標註

- 加上 // @ts-check opt-in 檢查
- 為 Enemy class 與 4 個關鍵方法(update/draw/reveal/spawn)加 JSDoc
- spawn() 標記為 static factory method
- 保留 EnemyTypes 9 種敵人型別常數不變
- tsc 結果: 0 errors
- Vitest: 既有測試 100% 通過
- Smoke test: 30 秒無 console error, 敵人多樣性正常"
```

---

## Task 7: Phase 4 - playerCore.js (子模組)

**Files:**
- Modify: `js/playerCore.js` (加 `// @ts-check` + PlayerCore class JSDoc)

- [ ] **Step 1: 加上 `// @ts-check` 並跑 typecheck 確認報錯**

Modify `js/playerCore.js` 第 1 行(在 `import` 之前),加:
```js
// @ts-check
```

Run: `npm run typecheck`
Expected: 報錯

- [ ] **Step 2: 為 PlayerCore class 與方法加 JSDoc**

Modify `js/playerCore.js`,在 `export class PlayerCore {` 前加 class JSDoc,並為方法加 JSDoc:

```js
// @ts-check
import { normalize, clamp } from './utils.js';

/**
 * 玩家核心狀態:位置/移動/血量/護盾/升級基礎屬性
 * 由 Player 組合根模組委派呼叫
 */
export class PlayerCore {
    /**
     * @param {number} x - 起始 X 座標
     * @param {number} y - 起始 Y 座標
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 200;
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.shield = 0;
        this.maxShield = 0;
        this.armor = 0;
        this.invincibleTime = 0;
        this.flashTime = 0;
        this.pickupRange = 80;
        this.baseAttackRange = 300;
        this.attackRange = this.baseAttackRange;
        this.facingAngle = 0;
        this.magnetTimer = 0;
        
        this.upgradeStats = {
            maxHp: 0,
            speed: 0,
            pickupRange: 0,
            attackRange: 0,
            armor: 0,
            shield: 0
        };
    }
    
    /**
     * 更新玩家位置(根據按鍵)、無敵時間、磁鐵計時
     * @param {number} dt - 時間差(秒)
     * @param {Object.<string, boolean>} keys - 按鍵狀態
     * @param {number} canvasWidth - 畫布寬度(用於邊界限制)
     * @param {number} canvasHeight - 畫布高度(用於邊界限制)
     * @returns {void}
     */
    update(dt, keys, canvasWidth, canvasHeight) {
        // (保留既有實作不變)
    }
    
    /**
     * 套用升級效果至基礎屬性
     * @param {{type: string, value: number}} upgrade - 升級物件
     * @returns {void}
     */
    applyUpgrade(upgrade) {
        // (保留既有實作不變)
    }
}
```

- [ ] **Step 3: 跑 typecheck 確認零錯**

Run: `npm run typecheck`
Expected: 無錯誤輸出

- [ ] **Step 4: 跑 vitest 確認既有測試未受影響**

Run: `npm test`
Expected: 既有測試 100% 通過

- [ ] **Step 5: Commit**

```bash
git add js/playerCore.js
git commit -m "feat(typed): Phase 4 - playerCore.js JSDoc 型別標註

- 加上 // @ts-check opt-in 檢查
- 為 PlayerCore class 與 2 個方法加 JSDoc
- 標註 keys 為 Object.<string, boolean>
- tsc 結果: 0 errors
- Vitest: 既有測試 100% 通過"
```

---

## Task 8: Phase 4 - playerCombat.js (子模組)

**Files:**
- Modify: `js/playerCombat.js` (加 `// @ts-check` + PlayerCombat class JSDoc)

- [ ] **Step 1: 加上 `// @ts-check` 並跑 typecheck 確認報錯**

Modify `js/playerCombat.js` 第 1 行,加:
```js
// @ts-check
```

Run: `npm run typecheck`
Expected: 報錯

- [ ] **Step 2: 為 PlayerCombat class 與方法加 JSDoc**

Modify `js/playerCombat.js`,在 `export class PlayerCombat {` 前加 class JSDoc,並為方法加 JSDoc:

```js
// @ts-check

/**
 * 玩家戰鬥邏輯:射擊冷卻/暴擊/吸血/終極技能/升級戰鬥屬性
 * 由 Player 組合根模組委派呼叫
 */
export class PlayerCombat {
    /**
     * @param {import('./playerCore.js').PlayerCore} core - 玩家核心參考
     */
    constructor(core) {
        this.core = core;
        // (保留所有既有屬性初始化不變)
    }
    
    /**
     * 更新射擊冷卻與攻擊動畫計時
     * @param {number} dt - 時間差(秒)
     * @returns {void}
     */
    update(dt) {
        // (保留既有實作不變)
    }
    
    /**
     * @returns {boolean} 射擊冷卻是否結束
     */
    canFire() {
        return this.fireCooldown <= 0;
    }
    
    /**
     * 開火(重置冷卻、設定攻擊動畫時間與角度)
     * @param {number} targetX - 目標 X
     * @param {number} targetY - 目標 Y
     * @returns {void}
     */
    fire(targetX, targetY) {
        // (保留既有實作不變)
    }
    
    /**
     * 啟動攻擊速度 buff(連殺觸發,持續 5 秒)
     * @returns {void}
     */
    activateFireRateBuff() {
        // (保留既有實作不變)
    }
    
    /**
     * 擲骰暴擊判定
     * @returns {number} 暴擊傷害倍率(未暴擊回傳 1)
     */
    rollCrit() {
        // (保留既有實作不變)
    }
    
    /**
     * 治療玩家
     * @param {number} amount - 治療量
     * @returns {void}
     */
    heal(amount) {
        this.core.hp = Math.min(this.core.maxHp, this.core.hp + amount);
    }
    
    /**
     * @returns {boolean} 終極技能是否可用
     */
    canUseSkill() {
        return this.skillCooldown <= 0;
    }
    
    /**
     * 使用終極技能(進入冷卻)
     * @returns {void}
     */
    useSkill() {
        this.skillCooldown = this.skillCooldownDuration;
    }
    
    /**
     * 更新終極技能冷卻
     * @param {number} dt - 時間差(秒)
     * @returns {void}
     */
    updateSkillCooldown(dt) {
        // (保留既有實作不變)
    }
    
    /**
     * 玩家受到傷害(護盾優先 → 無敵 → HP)
     * @param {number} rawDamage - 原始傷害值
     * @returns {{hpChanged: boolean, isDead: boolean}} 傷害結果
     */
    takeDamage(rawDamage) {
        // (保留既有實作不變)
    }
    
    /**
     * 套用升級效果至戰鬥屬性
     * @param {{type: string, value: number}} upgrade - 升級物件
     * @returns {void}
     */
    applyUpgrade(upgrade) {
        // (保留既有實作不變)
    }
}
```

- [ ] **Step 3: 跑 typecheck 確認零錯**

Run: `npm run typecheck`
Expected: 無錯誤輸出

- [ ] **Step 4: 跑 vitest 確認既有測試未受影響**

Run: `npm test`
Expected: 既有測試 100% 通過

- [ ] **Step 5: Commit**

```bash
git add js/playerCombat.js
git commit -m "feat(typed): Phase 4 - playerCombat.js JSDoc 型別標註

- 加上 // @ts-check opt-in 檢查
- 為 PlayerCombat class 與 11 個方法加 JSDoc
- 使用 import('./playerCore.js').PlayerCore 標註 core 參數型別
- 標註 takeDamage() 回傳 {hpChanged, isDead}
- tsc 結果: 0 errors
- Vitest: 既有測試 100% 通過"
```

---

## Task 9: Phase 4 - enemyCore.js + 整合驗證

**Files:**
- Modify: `js/enemyCore.js` (加 `// @ts-check` + EnemyCore class JSDoc)

- [ ] **Step 1: 加上 `// @ts-check` 並跑 typecheck 確認報錯**

Modify `js/enemyCore.js` 第 1 行(在 `import` 之前),加:
```js
// @ts-check
```

Run: `npm run typecheck`
Expected: 報錯

- [ ] **Step 2: 為 EnemyCore class 與方法加 JSDoc**

Modify `js/enemyCore.js`,在 `export class EnemyCore {` 前加 class JSDoc,並為方法加 JSDoc:

```js
// @ts-check
import { normalize, randomRange } from './utils.js';

/**
 * 敵人核心狀態:位置/移動/血量/護盾/特殊屬性(精英/分裂/爆炸/隱形)
 * 由 Enemy 組合根模組委派呼叫
 */
export class EnemyCore {
    /**
     * @param {object} type - 敵人類型設定(來自 EnemyTypes)
     * @param {number} x - 起始 X
     * @param {number} y - 起始 Y
     */
    constructor(type, x, y) {
        // (保留既有實作不變)
    }
    
    /**
     * 更新敵人位置(朝玩家移動,在玩家攻擊範圍內會加速)
     * @param {number} dt - 時間差(秒)
     * @param {number} playerX - 玩家 X
     * @param {number} playerY - 玩家 Y
     * @param {number} [playerAttackRange=300] - 玩家攻擊範圍
     * @returns {void}
     */
    updatePosition(dt, playerX, playerY, playerAttackRange = 300) {
        // (保留既有實作不變)
    }
    
    /**
     * 隱形敵人被揭露(2 秒可見時間)
     * @returns {void}
     */
    reveal() {
        if (this.isStealth) {
            this.revealTime = 2;
        }
    }
    
    /**
     * 敵人受到傷害(護盾優先 → HP)
     * @param {number} damage - 傷害值
     * @returns {{hpChanged: boolean, isDead: boolean, shieldBroken: boolean}} 傷害結果
     */
    takeDamage(damage) {
        // (保留既有實作不變)
    }
}
```

- [ ] **Step 3: 跑 typecheck 確認零錯**

Run: `npm run typecheck`
Expected: 無錯誤輸出

- [ ] **Step 4: 跑 vitest 確認既有測試未受影響**

Run: `npm test`
Expected: 既有測試 100% 通過

- [ ] **Step 5: Phase 4 commit**

```bash
git add js/enemyCore.js
git commit -m "feat(typed): Phase 4 - enemyCore.js JSDoc 型別標註

- 加上 // @ts-check opt-in 檢查
- 為 EnemyCore class 與 3 個方法加 JSDoc
- 標註 takeDamage() 回傳 {hpChanged, isDead, shieldBroken}
- tsc 結果: 0 errors
- Vitest: 既有測試 100% 通過"
```

---

## Task 10: Phase 5 - game.js (整合層)

**Files:**
- Modify: `js/game.js` (加 `// @ts-check` + 主要 public 方法 JSDoc)

- [ ] **Step 1: 加上 `// @ts-check` 並跑 typecheck 確認報錯**

Modify `js/game.js` 第 1 行(在 `import` 之前),加:
```js
// @ts-check
```

Run: `npm run typecheck`
Expected: 報錯(可能很多 — 隱式 any)

- [ ] **Step 2: 為 Game class 與主要方法加 JSDoc**

Modify `js/game.js`,在 `export class Game {` 前加 class JSDoc,並為主要 public 方法加 JSDoc。

**在第 28 行 `export class Game {` 改為:**
```js
/**
 * 遊戲主控制器,管理四階段 Update Loop:
 * Phase 1 清理 → Phase 2 狀態更新 → Phase 3 系統邏輯 → Phase 4 UI 更新
 */
export class Game {
```

**為以下方法加 JSDoc(其他私有輔助方法可省略):**

```js
/**
 * 建構遊戲,初始化 Canvas、玩家、敵人、波次、UI 等所有子系統
 * @param {HTMLCanvasElement} canvas - 遊戲主畫布
 */
constructor(canvas) {
```

```js
/**
 * 主迴圈入口(每秒 60 次呼叫)
 * @param {number} dt - 距離上一幀的時間差(秒)
 * @returns {void}
 */
update(dt) {
```

```js
/**
 * 碰撞檢測:子彈 vs 敵人、敵人 vs 玩家、玩家 vs 經驗球/道具
 * @param {number} dt - 時間差(秒)
 * @returns {void}
 */
checkCollisions(dt) {
```

```js
/**
 * 自動射擊邏輯:在攻擊範圍內尋找最近敵人並發射子彈
 * @returns {void}
 */
autoFire() {
```

```js
/**
 * 生成敵人(從畫面外)
 * @param {boolean} [isBoss=false] - 是否生成 Boss
 * @returns {void}
 */
spawnEnemy(isBoss = false) {
```

```js
/**
 * 生成召喚小怪(Boss 或分裂敵人使用)
 * @param {number} x - 中心 X
 * @param {number} y - 中心 Y
 * @param {number} count - 數量
 * @param {boolean} [spawnElite=false] - 是否生成精英
 * @returns {void}
 */
spawnMinionEnemies(x, y, count, spawnElite = false) {
```

```js
/**
 * 在指定位置生成經驗球
 * @param {number} x - X
 * @param {number} y - Y
 * @param {number} value - 經驗值
 * @returns {void}
 */
spawnExpOrbs(x, y, value) {
```

```js
/**
 * 繪製整個遊戲畫面
 * @returns {void}
 */
render() {
```

```js
/**
 * 繪製 Boss 血量條(螢幕上方)
 * @returns {void}
 */
drawBossHealthBar() {
```

```js
/**
 * 除錯用:繪製空間網格
 * @returns {void}
 */
drawGrid() {
```

- [ ] **Step 3: 跑 typecheck 處理剩餘錯誤**

Run: `npm run typecheck`
Expected: 可能仍有些隱式 any 警告

若仍有錯誤,採以下優先順序處理:
1. **明確可推導的**: 加 `@param`/`@returns` 補上
2. **複雜內部狀態**: 加 `// @ts-expect-error` 局部註解(附 comment 說明)
3. **過程中發現的既有 bug**: 記錄至 `docs/superpowers/TODO-typescript-fixes.md` 後跳過

最終目標:`npm run typecheck` 0 errors。

- [ ] **Step 4: 跑 vitest 確認既有測試未受影響**

Run: `npm test`
Expected: 既有測試 100% 通過

- [ ] **Step 5: 瀏覽器 smoke test (Phase 5 結束閘門)**

Run: `npm run dev`(另開終端)
瀏覽器開 http://localhost:3000,新遊戲,玩 60 秒:
- 確認所有敵人類型正常出現
- 確認升級、Boss 戰、波次系統、Q 鍵終極技能、磁鐵道具正常運作
- 確認無 console error,FPS ≥ 50

- [ ] **Step 6: Phase 5 commit**

```bash
git add js/game.js docs/superpowers/TODO-typescript-fixes.md 2>/dev/null
git commit -m "feat(typed): Phase 5 - game.js JSDoc 型別標註

- 加上 // @ts-check opt-in 檢查
- 為 Game class 與 10 個主要 public 方法加 JSDoc
- 涵蓋四階段 Update Loop 主要入口
- 部分深層內部方法以局部 // @ts-expect-error 處理
- TODO-typescript-fixes.md 記錄過程中發現的既有 bug(可能為空)
- tsc 結果: 0 errors
- Vitest: 既有測試 100% 通過
- Smoke test: 60 秒無 console error, 所有主要系統正常"
```

---

## Task 11: 最終驗證 + CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`
- Verify: 全專案

- [ ] **Step 1: 跑全部三層驗證**

Run:
```bash
npm run typecheck
npm test
```

Expected: 兩者皆 0 錯誤 / 100% 通過

- [ ] **Step 2: 確認 10 個目標檔皆有 `// @ts-check`**

Run:
```bash
head -1 js/utils.js js/spatialGrid.js js/objectPool.js js/projectile.js js/player.js js/enemy.js js/playerCore.js js/playerCombat.js js/enemyCore.js js/game.js
```

Expected: 全部 10 個檔案第 1 行皆為 `// @ts-check`

- [ ] **Step 3: 確認其他 28 個非目標檔未被異動**

Run:
```bash
git status --short
```

Expected: 應只看到本次提交的檔案(10 個 JS + jsconfig.json + package.json + CHANGELOG.md),非目標檔不應出現

- [ ] **Step 4: 更新 CHANGELOG.md**

Read `CHANGELOG.md` 確認最新版本,然後在最頂端新增條目:

```markdown
## [Unreleased]

### Added
- **JSDoc 型別標註工具鏈**: 為 10 個核心模組加 JSDoc `@param`/`@returns`/`@type` 標註
  - `js/utils.js`、`js/spatialGrid.js`、`js/objectPool.js`、`js/projectile.js`
  - `js/player.js`、`js/enemy.js`、`js/playerCore.js`、`js/playerCombat.js`、`js/enemyCore.js`、`js/game.js`
- **TypeScript checkJs 驗證**: 引入 typescript@^5.6 devDependency,透過 `// @ts-check` 逐檔 opt-in
- **新 npm scripts**:
  - `npm run typecheck`: 執行 `tsc --noEmit` 進行型別檢查
  - `npm run typecheck:watch`: 監看模式
- **`jsconfig.json`**: TypeScript 配置(checkJs: false 全域,僅目標檔 opt-in 檢查)

### Changed
- 為 10 個核心模組加上 `// @ts-check` 標頭
- 為既有函式/類別補上 JSDoc 型別註解(不修改既有邏輯)

### Notes
- 本次為靜態型別工具鏈導入,**不影響 runtime**
- 為未來 TypeScript 化或嚴格度升級保留路徑
```

- [ ] **Step 5: Commit CHANGELOG**

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): 記錄 JSDoc + TypeScript checkJs 工具鏈新增"
```

- [ ] **Step 6: 確認最終 git 狀態**

Run: `git log --oneline -8`
Expected: 看到本次 6 個新 commits(Task 0 + Phase 1/2/3/4/5 + CHANGELOG)

- [ ] **Step 7: DoD 最終檢查**

對照 spec § 5 DoD:
- [x] 10 個核心檔皆加 JSDoc
- [x] `jsconfig.json` 配置完成
- [x] `npm run typecheck` 零錯誤
- [x] `npm test` 既有測試 100% 通過
- [x] 至少 1 次手動 smoke test(Phase 1/3/5)
- [x] `CHANGELOG.md` 已更新
- [x] 6 個 commit(Task 0 + 5 Phase + CHANGELOG)
- [x] 設計文件已 commit(spec 已於前次 commit)

所有項目皆完成,本次任務結束。

---

## 自我審查結果 (Self-Review)

### 1. Spec 涵蓋度
- spec § 3.1 列出 5 個 Phase ↔ Task 1-10 對應 ✓
- spec § 3.3 處理特殊點(組合委派、泛型、整合層)↔ Task 5/6/10 涵蓋 ✓
- spec § 4 開發流程 ↔ 每 Task 的 Steps 對應 ✓
- spec § 5 DoD ↔ Task 11 對應 ✓

### 2. 佔位符掃描
- 無 "TBD"、"TODO" 留空(僅 `TODO-typescript-fixes.md` 是刻意定義的追蹤檔)
- 無 "implement later" 或 "fill in details"
- 步驟中的「保留既有實作不變」是 commit diff 指引,非佔位符

### 3. 型別一致性
- `takeDamage` 回傳 `{hpChanged, isDead}` — 在 player.js、playerCombat.js、enemyCore.js 一致
- `// @ts-check` 統一加在第 1 行(import 之前)
- 委派方法的回傳型別在根模組與子模組一致

### 4. 設計精修處理
- `checkJs: false` + `// @ts-check` opt-in 模型已在文件開頭明確說明
- 理由:避免修改 28 個非目標檔,符合「微創異動」

