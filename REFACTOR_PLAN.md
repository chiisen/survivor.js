# 重構計畫：Survivor.js 架構優化

## 目標

1. **快速問題定位**：增加可視化調試工具，問題發生時能立即發現
2. **邏輯簡化**：每個物件只做一件事，減少耦合
3. **Update Loop 規範**：明確的執行順序與依賴關係

---

## 一、Update Loop 重構（核心問題）

### 問題根因

剛剛的三個錯誤都來自 **Update Loop 缺少規範**：
- chainKills 未定義 → 代碼流程混亂
- enemyGrid 未更新 → 缺少必要步驟
- player.update() 未調用 → 缺少核心更新

### 解決方案：明確的 Update Pipeline

**新的 `game.update(dt)` 流程：**

```javascript
update(dt) {
    // ==================== Phase 1: 清理與準備 ====================
    this.enemyGrid.clear();
    for (const enemy of this.enemies) {
        this.enemyGrid.insert(enemy);
    }
    
    // ==================== Phase 2: 狀態更新 ====================
    // 2.1 玩家狀態（必須最先更新）
    this.player.update(dt, this.keys, this.canvas.width, this.canvas.height);
    
    // 2.2 敵人狀態（生成後立即插入 Grid）
    this.waveManager.update(dt, this.gameTime, normalEnemyCount);
    for (const enemy of this.enemies) {
        enemy.update(dt, this.player.x, this.player.y);
    }
    
    // 2.3 投射物狀態
    for (const projectile of this.projectiles) {
        projectile.update(dt);
    }
    
    // ==================== Phase 3: 系統更新 ====================
    // 3.1 自動射擊（依賴 player.fireCooldown 已更新）
    this.autoFire();
    
    // 3.2 碰撞檢測（依賴 Grid 已填充）
    this.checkCollisions();
    
    // 3.3 清理死亡物件（最後執行）
    this.cleanupDeadEntities();
    
    // ==================== Phase 4: UI 更新 ====================
    this.updateUI();
}
```

### 規範

- **Phase 1 必須先執行**：清空 Grid、插入實體（否則碰撞檢測失效）
- **Phase 2 狀態更新**：所有實體的內部狀態（hp、cooldown、position）
- **Phase 3 系統邏輯**：依賴狀態已更新（射擊、碰撞）
- **Phase 4 UI**：最後更新畫面

---

## 二、物件責任重構（單一職責）

### 問題：物件職責過重

**Enemy 類別目前做的事：**
1. 移動邏輯
2. 射擊邏輯
3. Boss 階段管理
4. 精英護盾
5. 分裂邏輯
6. 隱形邏輯
7. 繪製邏輯

**Player 類別目前做的事：**
1. 移動邏輯
2. 射擊冷卻
3. 技能冷卻
4. 繪製邏輯
5. 狀態更新（hp、shield、buff）

### 解決方案：拆分職責

#### A. Player 重構

**拆分為三個類別：**

```
PlayerCore.js      → 位置、移動、碰撞
PlayerCombat.js    → 射擊、技能、傷害計算
PlayerRenderer.js  → 繪製盔甲戰士
```

**新 Player 類別（組合）：**

```javascript
class Player {
    constructor(x, y) {
        this.core = new PlayerCore(x, y);
        this.combat = new PlayerCombat(this.core);
        this.renderer = new PlayerRenderer();
    }
    
    update(dt, keys, canvasWidth, canvasHeight) {
        this.core.update(dt, keys, canvasWidth, canvasHeight);
        this.combat.update(dt);
    }
    
    draw(ctx) {
        this.renderer.draw(ctx, this.core, this.combat);
    }
}
```

#### B. Enemy 重構

**拆分策略模式：**

```
EnemyCore.js           → 位置、移動、碰撞（所有敵人共用）
EnemyBehaviors.js      → 行為策略（射擊、分裂、隱形）
EnemyRenderer.js       → 繪製敵人外觀
BossPhaseManager.js    → Boss 階段管理（獨立）
```

**新 Enemy 類別：**

```javascript
class Enemy {
    constructor(type, x, y) {
        this.core = new EnemyCore(type, x, y);
        this.behaviors = new EnemyBehaviors(type, this.core);
        this.renderer = new EnemyRenderer(type);
        
        if (type.isBoss) {
            this.phaseManager = new BossPhaseManager(this.core);
        }
    }
    
    update(dt, playerX, playerY) {
        this.core.update(dt, playerX, playerY);
        
        if (this.phaseManager) {
            this.phaseManager.update(dt, this.core.hp);
        }
        
        return this.behaviors.update(dt, playerX, playerY);
    }
    
    draw(ctx) {
        this.renderer.draw(ctx, this.core, this.behaviors);
    }
}
```

---

## 三、調試機制（快速問題定位）

### A. 可視化調試工具

**新增 `DebugOverlay.js`：**

```javascript
class DebugOverlay {
    constructor(game) {
        this.game = game;
        this.enabled = false;  // 按 D 鍵開啟
    }
    
    draw(ctx) {
        if (!this.enabled) return;
        
        // 顯示 Grid 狀態
        this.drawGridStatus(ctx);
        
        // 顯示 Update Pipeline 狀態
        this.drawUpdatePipeline(ctx);
        
        // 顯示實體計數
        this.drawEntityCounts(ctx);
        
        // 顯示玩家狀態
        this.drawPlayerStatus(ctx);
        
        // 顯示錯誤警告
        this.drawWarnings(ctx);
    }
    
    drawGridStatus(ctx) {
        // 顯示 enemyGrid 的格子數、實體數
        const gridInfo = `Grid: ${this.game.enemyGrid.getCellCount()} cells, ${this.game.enemyGrid.getTotalEntities()} entities`;
        ctx.fillText(gridInfo, 10, 10);
        
        // 如果 Grid 是空的，顯示警告
        if (this.game.enemyGrid.getTotalEntities() === 0 && this.game.enemies.length > 0) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('⚠ Grid 未更新！', 10, 30);
        }
    }
    
    drawUpdatePipeline(ctx) {
        // 顯示各 Phase 的執行狀態
        const pipeline = [
            `Phase 1 (Grid): ${this.phase1Executed ? '✓' : '✗'}`,
            `Phase 2 (State): ${this.phase2Executed ? '✓' : '✗'}`,
            `Phase 3 (System): ${this.phase3Executed ? '✓' : '✗'}`,
        ];
        ctx.fillText(pipeline.join(' | '), 10, 50);
    }
    
    drawPlayerStatus(ctx) {
        // 顯示 fireCooldown、canFire
        const status = `fireCooldown: ${this.game.player.fireCooldown.toFixed(2)}s, canFire: ${this.game.player.canFire()}`;
        ctx.fillText(status, 10, 70);
        
        // 如果 canFire 永遠是 false，顯示警告
        if (!this.game.player.canFire() && this.game.player.fireCooldown > 10) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('⚠ fireCooldown 未更新！', 10, 90);
        }
    }
    
    drawWarnings(ctx) {
        // 檢測常見錯誤並顯示警告
        const warnings = this.detectWarnings();
        warnings.forEach((warning, i) => {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(warning, 10, 110 + i * 20);
        });
    }
    
    detectWarnings() {
        const warnings = [];
        
        // Grid 空但敵人存在 → Phase 1 未執行
        if (this.game.enemyGrid.getTotalEntities() === 0 && this.game.enemies.length > 0) {
            warnings.push('⚠ Phase 1 未執行：Grid 未填充');
        }
        
        // Player canFire 永遠 false → Phase 2 未更新
        if (this.game.player.fireCooldown === this.lastFireCooldown) {
            warnings.push('⚠ Phase 2 未執行：player.update() 未調用');
        }
        
        // Projectile 停留在原地 → Phase 2 未更新
        if (this.game.projectiles.length > 0 && this.projectilesNotMoving()) {
            warnings.push('⚠ Projectile 未移動：projectile.update() 未調用');
        }
        
        return warnings;
    }
}
```

**整合到 Game：**

```javascript
// game.js
constructor() {
    this.debugOverlay = new DebugOverlay(this);
}

// keydown 事件
window.addEventListener('keydown', (e) => {
    if (e.key === 'd' || e.key === 'D') {
        this.debugOverlay.enabled = !this.debugOverlay.enabled;
    }
});

// render()
render() {
    // ...繪製遊戲
    this.debugOverlay.draw(ctx);  // 最後繪製調試層
}
```

### B. Console 日誌（關鍵點）

**新增 `GameLogger.js`：**

```javascript
class GameLogger {
    constructor() {
        this.logLevel = 'error';  // 'debug' | 'info' | 'error'
    }
    
    phase(phaseName, details) {
        if (this.logLevel === 'debug') {
            console.log(`[${phaseName}]`, details);
        }
    }
    
    error(message, details) {
        console.error(`[ERROR] ${message}`, details);
    }
    
    warning(message, details) {
        if (this.logLevel === 'info' || this.logLevel === 'debug') {
            console.warn(`[WARNING] ${message}`, details);
        }
    }
}
```

**整合到 Update Loop：**

```javascript
update(dt) {
    // Phase 1
    this.logger.phase('Phase 1', { enemies: this.enemies.length, gridEntities: this.enemyGrid.getTotalEntities() });
    this.enemyGrid.clear();
    // ...
    
    // Phase 2
    this.logger.phase('Phase 2', { fireCooldown: this.player.fireCooldown });
    this.player.update(dt, this.keys, this.canvas.width, this.canvas.height);
    
    // Phase 3
    const fired = this.autoFire();
    this.logger.phase('Phase 3', { fired: fired, projectiles: this.projectiles.length });
    
    // 檢測異常
    if (this.enemyGrid.getTotalEntities() === 0 && this.enemies.length > 0) {
        this.logger.error('Grid 未填充', { enemies: this.enemies.length });
    }
}
```

### C. 斷點檢查（硬斷言）

**新增 `GameValidator.js`：**

```javascript
class GameValidator {
    validatePhase1(game) {
        // Grid 必須已填充
        if (game.enemyGrid.getTotalEntities() !== game.enemies.length) {
            throw new Error(`Phase 1 失敗：Grid 實體數 ${game.enemyGrid.getTotalEntities()} ≠ 敵人數 ${game.enemies.length}`);
        }
    }
    
    validatePhase2(game) {
        // Player 狀態必須已更新
        if (game.player.fireCooldown > 0 && game.player.lastFireCooldown === game.player.fireCooldown) {
            throw new Error('Phase 2 失敗：fireCooldown 未減少');
        }
    }
    
    validatePhase3(game) {
        // 碰撞檢測必須正常
        if (game.projectiles.length > 0 && game.enemies.length > 0) {
            const nearby = game.enemyGrid.getNearby(game.player.x, game.player.y, 100);
            if (nearby.length === 0) {
                throw new Error('Phase 3 失敗：getNearby 返回空陣列，碰撞檢測失效');
            }
        }
    }
}
```

---

## 四、執行計畫

### Phase 1：Update Loop 重構（立即執行）

**目標：** 解決當前問題，建立規範

**步驟：**

1. 重構 `game.update()` → 四個 Phase
2. 新增 `DebugOverlay.js` → 按 D 鍵顯示調試資訊
3. 新增 `GameLogger.js` → Console 日誌
4. 測試：確認三個錯誤已修復

**預估時間：** 1-2 小時

### Phase 2：物件責任拆分（中期）

**目標：** 單一職責，減少耦合

**步驟：**

1. Player → PlayerCore + PlayerCombat + PlayerRenderer
2. Enemy → EnemyCore + EnemyBehaviors + EnemyRenderer
3. BossPhaseManager 獨立
4. 測試：確認功能正常

**預估時間：** 3-4 小時

### Phase 3：調試機制完善（長期）

**目標：** 問題快速定位

**步驟：**

1. `GameValidator.js` → 硬斷言
2. `DebugOverlay.js` → 可視化 Grid、Update Pipeline
3. 熱鍵調試（D 鍵、L 鍵切換日誌等級）
4. 效能監控（FPS、記憶體）

**預估時間：** 2-3 小時

---

## 五、預期效益

### A. 問題快速定位

- **DebugOverlay 可視化**：一眼看出 Grid 是否空、fireCooldown 是否更新
- **Console 日誌**：每個 Phase 的執行狀態
- **硬斷言**：錯誤立即拋出，不會隱藏

### B.邏輯簡化

- **單一職責**：每個類別只做一件事
- **組合而非繼承**：Player = Core + Combat + Renderer
- **策略模式**：EnemyBehaviors 可替換

### C. 未來擴展性

- **新增敵人類型**：只需新增 Behavior 策略
- **新增玩家技能**：只需修改 PlayerCombat
- **新增調試工具**：只需修改 DebugOverlay

---

## 六、立即執行的第一步

### 建議順序

1. **先修復當前問題** → Update Loop 四個 Phase
2. **新增 DebugOverlay** → 按 D 鍵顯示調試資訊
3. **測試** → 確認遊戲正常運作
4. **再進行物件拆分** → 避免一次性重構太多

---

## 七、問題檢核表（Checklist）

### Update Loop 檢核

- [ ] Phase 1：Grid 已清空並填充所有實體
- [ ] Phase 2：所有實體狀態已更新（player.update、enemy.update）
- [ ] Phase 3：系統邏輯已執行（autoFire、checkCollisions）
- [ ] Phase 4：UI 已更新

### 調試工具檢核

- [ ] DebugOverlay 按 D 鍵開啟
- [ ] Grid 狀態可視化（格子數、實體數）
- [ ] Player 狀態可視化（fireCooldown、canFire）
- [ ] 錯誤警告自動顯示

### 物件職責檢核

- [ ] PlayerCore 只處理移動與碰撞
- [ ] PlayerCombat 只處理射擊與技能
- [ ] PlayerRenderer 只處理繪製
- [ ] EnemyCore 只處理移動與碰撞
- [ ] EnemyBehaviors 只處理行為（射擊、分裂）

---

## 總結

**核心問題**：Update Loop 缺少規範 → 導致三個錯誤

**核心解決**：
1. 明確的四個 Phase（清理 → 狀態 → 系統 → UI）
2. 可視化調試工具（DebugOverlay）
3. 單一職責拆分（Player、Enemy）

**效益**：
- 問題 30 秒內定位
- 邏輯清晰易懂
- 未來擴展容易

**建議**：先執行 Phase 1 重構（Update Loop + DebugOverlay），測試成功後再進行物件拆分。