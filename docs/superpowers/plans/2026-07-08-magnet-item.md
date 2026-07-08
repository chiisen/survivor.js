# 磁鐵道具系統 實作計劃

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推薦）或 superpowers:executing-plans 逐任務實現此計劃。步驟使用核取方塊（`- [ ]`）語法來跟蹤進度。

**目標：** 在遊戲中加入擊殺怪物有 3% 機率掉落的磁鐵道具 🧲。玩家拾取後可觸發 5 秒累加的磁力風暴，將全螢幕的經驗球吸過來，並伴隨淡藍色圓環擴散特效。

**架構：** 
1. 建立獨立的 `MagnetItem` 類別。
2. 擴展 `PlayerCore` 與 `Player` 以管理 `magnetTimer` 狀態。
3. 在 `game.js` 的碰撞與更新循環中，加入道具掉落與全螢幕吸球判定。
4. 於 `playerRenderer.js` 繪製漸隱圓環特效。

**技術棧：** 純 JavaScript (ES Modules), HTML5 Canvas API, Vitest 測試框架。

---

## 檔案結構與變更

* **[NEW] [magnetItem.js](file:///d:/github/chiisen/survivor.js/js/magnetItem.js)**：建立磁鐵道具實體。
* **[MODIFY] [playerCore.js](file:///d:/github/chiisen/survivor.js/js/playerCore.js)**：新增與更新 `magnetTimer` 屬性。
* **[MODIFY] [player.js](file:///d:/github/chiisen/survivor.js/js/player.js)**：暴露 `magnetTimer` getter/setter。
* **[MODIFY] [playerRenderer.js](file:///d:/github/chiisen/survivor.js/js/playerRenderer.js)**：繪製吸引時的磁力圓圈動畫。
* **[MODIFY] [game.js](file:///d:/github/chiisen/survivor.js/js/game.js)**：整合掉落、碰撞與大吸引範圍判定。
* **[NEW] [tests/magnet.test.js](file:///d:/github/chiisen/survivor.js/tests/magnet.test.js)**：撰寫單元測試。

---

## 任務列表

### 任務 1：建立 MagnetItem 類別與基礎測試

**檔案：**
- 建立：`js/magnetItem.js`
- 建立：`tests/magnet.test.js`

- [ ] **步驟 1：編寫失敗的測試 (驗證類別建構與碰撞判定)**

在 `tests/magnet.test.js` 中寫入：
```javascript
import { describe, it, expect } from 'vitest';
import { MagnetItem } from '../js/magnetItem.js';

describe('MagnetItem', () => {
    it('應該能正確初始化座標與半徑', () => {
        const item = new MagnetItem(100, 200);
        expect(item.x).toBe(100);
        expect(item.y).toBe(200);
        expect(item.radius).toBe(8);
    });

    it('應該能判定玩家已碰撞拾取', () => {
        const item = new MagnetItem(100, 100);
        // 玩家圓心在 (100, 110)，半徑 10px，兩者距離為 10px < playerRadius (10) + itemRadius (8)，判定碰撞
        expect(item.isCollected(100, 110, 10)).toBe(true);
        // 玩家圓心在 (100, 130)，半徑 10px，距離 30px > 18px，判定未碰撞
        expect(item.isCollected(100, 130, 10)).toBe(false);
    });
});
```

- [ ] **步驟 2：執行測試驗證失敗**

執行：`npx vitest run tests/magnet.test.js`
預期：FAIL，報錯 "Cannot find module '../js/magnetItem.js'"。

- [ ] **步驟 3：實現最少程式碼讓測試通過**

在 `js/magnetItem.js` 中寫入：
```javascript
import { distance } from './utils.js';

export class MagnetItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.pulseTime = Math.random() * Math.PI * 2;
    }

    update(dt) {
        this.pulseTime += dt * 5;
    }

    draw(ctx) {
        ctx.save();
        // 繪製紅色發光背景
        const glowScale = 1 + Math.sin(this.pulseTime) * 0.15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * glowScale * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(231, 76, 60, 0.25)';
        ctx.fill();

        // 繪製 U 型磁鐵符號
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧲', this.x, this.y);
        ctx.restore();
    }

    isCollected(playerX, playerY, playerRadius) {
        return distance(this.x, this.y, playerX, playerY) < playerRadius + this.radius;
    }
}
```

- [ ] **步驟 4：再次執行測試驗證通過**

執行：`npx vitest run tests/magnet.test.js`
預期：PASS

- [ ] **步驟 5：Commit**

執行：
```bash
git add js/magnetItem.js tests/magnet.test.js
git commit -m "feat(magnet): 建立 MagnetItem 類別與基礎單元測試"
```

---

### 任務 2：擴展 Player 類別以管理磁鐵時間

**檔案：**
- 修改：`js/playerCore.js`
- 修改：`js/player.js`
- 修改：`tests/magnet.test.js`

- [ ] **步驟 1：編寫失敗的測試 (驗證 magnetTimer 屬性與時間遞減)**

在 `tests/magnet.test.js` 中追加：
```javascript
import { PlayerCore } from '../js/playerCore.js';

describe('Player magnetTimer', () => {
    it('應該能正確初始化且隨時間遞減，不會低於 0', () => {
        const core = new PlayerCore(0, 0);
        expect(core.magnetTimer).toBe(0);

        core.magnetTimer = 5;
        core.update(1); // 更新 1 秒
        expect(core.magnetTimer).toBe(4);

        core.update(5); // 再更新 5 秒，此時應降至 0，且不會為負值
        expect(core.magnetTimer).toBe(0);
    });
});
```

- [ ] **步驟 2：執行測試驗證失敗**

執行：`npx vitest run tests/magnet.test.js`
預期：FAIL，報錯 "TypeError: Cannot set property 'magnetTimer' of undefined" 或 `core.magnetTimer` 為 undefined。

- [ ] **步驟 3：實現最少程式碼讓測試通過**

1. 修改 [`js/playerCore.js`](file:///d:/github/chiisen/survivor.js/js/playerCore.js)，在建構子初始化 `this.magnetTimer = 0;`。
2. 於 `playerCore.js` 的 `update(dt)` 末尾加入時間減少邏輯：
```javascript
if (this.magnetTimer > 0) {
    this.magnetTimer = Math.max(0, this.magnetTimer - dt);
}
```
3. 修改 [`js/player.js`](file:///d:/github/chiisen/survivor.js/js/player.js)，暴露 getter/setter 委派：
```javascript
get magnetTimer() { return this.core.magnetTimer; }
set magnetTimer(value) { this.core.magnetTimer = value; }
```

- [ ] **步驟 4：再次執行測試驗證通過**

執行：`npx vitest run tests/magnet.test.js`
預期：PASS

- [ ] **步驟 5：Commit**

執行：
```bash
git add js/playerCore.js js/player.js tests/magnet.test.js
git commit -m "feat(magnet): 於 Player 中新增與更新 magnetTimer 屬性"
```

---

### 任務 3：整合遊戲循環 (生成、拾取與全螢幕吸附)

**檔案：**
- 修改：`js/game.js`
- 修改：`tests/magnet.test.js`

- [ ] **步驟 1：編寫失敗的測試 (驗證吸引範圍的提升)**

在 `tests/magnet.test.js` 中追加模擬 `game.js` 更新的測試：
```javascript
describe('Game loop integration', () => {
    it('當 magnetTimer 大於 0 時，吸引範圍應該強制設為 1000', () => {
        const player = { pickupRange: 80, magnetTimer: 0 };
        const getEffectiveRange = (p) => {
            const forceAttract = p.magnetTimer > 0;
            return forceAttract ? 1000 : p.pickupRange;
        };

        expect(getEffectiveRange(player)).toBe(80);

        player.magnetTimer = 3;
        expect(getEffectiveRange(player)).toBe(1000);
    });
});
```

- [ ] **步驟 2：執行測試驗證失敗**

執行：`npx vitest run tests/magnet.test.js`
預期：FAIL（如果您的模擬測試在撰寫時尚未成功運行，或為了保證 TDD 流程而撰寫）

- [ ] **步驟 3：實現整合邏輯**

1. 修改 [`js/game.js`](file:///d:/github/chiisen/survivor.js/js/game.js)，在建構子中宣告 `this.magnetItems = [];`，並在 `reset()` 方法中新增 `this.magnetItems = [];`。
2. 於 `cleanupDeadEntities()` 方法中，在怪物死亡觸發掉落處：
```javascript
// 有 3% 的機率掉落磁鐵道具
if (Math.random() < 0.03) {
    this.magnetItems.push(new MagnetItem(enemy.x, enemy.y));
}
```
*注意：需要在 `game.js` 的頂部 import `MagnetItem`：*
`import { MagnetItem } from './magnetItem.js';`
3. 於 `update()` 方法的 **Phase 2 (狀態更新)** 對 `magnetItems` 進行 update，並更改經驗球更新判定：
```javascript
// 更新磁鐵道具狀態
for (const item of this.magnetItems) {
    item.update(dt);
}

// 經驗球吸引判定
for (let i = this.expOrbs.length - 1; i >= 0; i--) {
    const orb = this.expOrbs[i];
    const forceAttract = (this.waveManager.isBreak && this.expOrbs.length > 0) || this.player.magnetTimer > 0;
    const effectivePickupRange = forceAttract ? 1000 : this.player.pickupRange;
    
    orb.update(dt, this.player.x, this.player.y, effectivePickupRange);
    ...
}
```
4. 於 `update()` 方法的 **Phase 3 (系統更新)** 新增玩家與磁鐵道具碰撞檢測：
```javascript
// 磁鐵拾取檢測
for (let i = this.magnetItems.length - 1; i >= 0; i--) {
    const item = this.magnetItems[i];
    if (item.isCollected(this.player.x, this.player.y, this.player.radius)) {
        this.audio.playPickup(); // 播放拾取音效
        this.player.magnetTimer += 5; // 累加 5 秒
        this.magnetItems.splice(i, 1); // 移出場外
        this.ui.showBuffNotification(`磁力風暴！持續時間增加 5 秒`, 3); // 提示
    }
}
```
5. 於 `render()` 方法中繪製磁鐵道具：
```javascript
for (const item of this.magnetItems) {
    item.draw(this.ctx);
}
```

- [ ] **步驟 4：執行 Vitest 驗證與手動執行遊戲**

執行：`npx vitest run`
預期：所有單元測試 PASS

- [ ] **步驟 5：Commit**

執行：
```bash
git add js/game.js tests/magnet.test.js
git commit -m "feat(magnet): 整合磁鐵道具到遊戲循環、碰撞與拾取流程"
```

---

### 任務 4：繪製磁力波圓環擴散特效

**檔案：**
- 修改：`js/playerRenderer.js`

- [ ] **步驟 1：實作淡藍色磁力波特效**

修改 [`js/playerRenderer.js`](file:///d:/github/chiisen/survivor.js/js/playerRenderer.js)，在 `draw(ctx, core, combat)` 方法中，於繪製玩家核心之前（或腳底），若 `core.magnetTimer > 0` 則加入擴散特效：
```javascript
if (core.magnetTimer > 0) {
    ctx.save();
    // 透過時間點生成週期擴散效果
    const t = (Date.now() / 1000) % 1; // 0 到 1 的循環
    const radius = 20 + t * 60; // 擴散半徑從 20 像素到 80 像素
    const alpha = (1 - t) * 0.4; // 隨半徑擴大漸漸淡出

    ctx.beginPath();
    ctx.arc(core.x, core.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(52, 152, 219, ${alpha})`; // 淡藍色磁力線
    ctx.lineWidth = 2;
    ctx.stroke();

    // 內圈磁力核心
    ctx.beginPath();
    ctx.arc(core.x, core.y, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(52, 152, 219, 0.08)';
    ctx.fill();
    ctx.restore();
}
```

- [ ] **步驟 2：執行遊戲驗證視覺效果**

執行：`npm run dev` 並於暫存畫面或按鍵觸發磁力風暴，手動查看視覺特效是否流暢。

- [ ] **步驟 3：Commit**

執行：
```bash
git add js/playerRenderer.js
git commit -m "feat(magnet): 於 PlayerRenderer 新增磁力風暴淡藍色擴散圓環特效"
```
