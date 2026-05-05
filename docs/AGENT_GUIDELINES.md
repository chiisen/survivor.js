# AI Agent 開發規範 (AI Agent Development Guidelines)

以下規範基於實際開發過程中遇到的問題，建議 AI Agent 遵守以避免類似錯誤。

## 1. Update Loop 四個 Phase

**問題根因**: Update Loop 缺少明確的執行順序，導致必要步驟遺漏。

建議將 `game.update(dt)` 分為四個 Phase，每個 Phase 有明確的職責：

```
Phase 1: 清理與準備
  - 清空 SpatialGrid
  - 插入所有活著的實體到 Grid

Phase 2: 狀態更新
  - 更新玩家狀態（player.update()）
  - 更新敵人狀態（enemy.update()）
  - 更新投射物狀態（projectile.update()）

Phase 3: 系統邏輯
  - 自動射擊（autoFire()）
  - 碰撞檢測（checkCollisions()）
  - 清理死亡實體

Phase 4: UI 更新
  - 更新 UI 狀態
  - 更新特效
```

**執行順序**: Phase 1 → Phase 2 → Phase 3 → Phase 4，不可跳過或逆序。

## 2. 必要步驟 Checklist

**問題根因**: 缺少必要步驟的檢查機制，導致核心更新被遺漏。

建議 AI Agent 在完成 Update Loop 時，逐一檢核以下步驟：

### Phase 1 Checklist:
- [ ] enemyGrid.clear() 已執行
- [ ] 所有敵人已插入 enemyGrid.insert(enemy)
- [ ] enemyGrid.getTotalEntities() === enemies.length

### Phase 2 Checklist:
- [ ] player.update(dt, keys, canvasWidth, canvasHeight) 已執行
- [ ] 所有敵人 update() 已執行
- [ ] 所有投射物 update() 已執行

### Phase 3 Checklist:
- [ ] autoFire() 已執行（依賴 player.fireCooldown 已更新）
- [ ] checkCollisions() 已執行（依賴 Grid 已填充）
- [ ] 死亡實體已從陣列中移除

### Phase 4 Checklist:
- [ ] UI 狀態已更新
- [ ] 特效已更新

## 3. Debug 工具要求

**問題根因**: 缺少 Debug 工具快速定位問題，導致問題發生時無法快速發現。

建議實作以下 Debug 工具：

### 1. GameLogger（Console 日誌）
- 記錄每個 Phase 的執行狀態
- 記錄關鍵變數（Grid 體數、fireCooldown 等）
- 錯誤時 Console 顯示警告

### 2. DebugOverlay（可視化調試工具）
- 按 Ctrl+D 鍵開啟
- 顯示 Grid 狀態（格子數、實體數）
- 顯示 Player 狀態（fireCooldown、canFire）
- 顯示 Pipeline 狀態（四個 Phase 是否執行）
- 自動檢測異常並顯示 ⚠ 警告

**異常檢測範例:**
```
⚠ Grid空 → Phase 1 未執行
⚠ 冷卻未更新 → Phase 2 未執行
⚠ 子彈未移動 → Projectile update() 未執行
```

## 4. 代碼流程規範

**問題根因**: 代碼流程混亂，變數在使用前未定義。

建議遵守以下規範：

1. **變數定義順序**
   - 所有變數必須在使用前定義
   - 建議使用 ESLint 或 Biome 檢查 `no-use-before-define`

2. **函數拆分原則**
   - update() 方法職責過重時，拆分為多個子方法
   - 每個子方法只做一件事（單一職責）

3. **SpatialGrid 更新**
   - Grid 必須在碰撞檢測前更新
   - 每幀開始時 clear() + insert() 所有實體

## 5. 錯誤案例與根因分析（警示）

以下錯誤來自實際開發過程，建議 AI Agent 避免相同錯誤：

---

### 錯誤案例 #1: chainKills 未定義

**問題**: 主角只攻擊一次就停止，子彈打不到怪物

**根因**: `game.js:448` 引用了在第 456 行才定義的 `chainKills` 變數

**影響**: ReferenceError 打斷遊戲循環，後續攻擊失效

**錯誤代碼:**
```javascript
// 第 448 行 - 引用 chainKills 但尚未定義
const chainKillExpBonus = this.getChainKillExpBonus(chainKills);  // BUG!

// 第 456 行才定義
let chainKills = 1;
```

**修復方案**: 移動 `let chainKills = 1;` 到第 448 行之前

**防堵措施**: 使用 ESLint `no-use-before-define` 檢查，變數必須在使用前定義

---

### 錯誤案例 #2: enemyGrid 未更新

**問題**: 子彈射出後無法命中敵人（敵人血量不下降）

**根因**: `enemyGrid` 未在每幀更新，導致 `getNearby()` 返回空陣列，碰撞檢測失效

**影響**: 所有子彈無法命中敵人，遊戲無法進行

**錯誤代碼:**
```javascript
// game.js 中缺少 enemyGrid 更新
update(dt) {
    // ... 狀態更新
    
    this.autoFire();  // 自動射擊
    
    // ⚠缺少 enemyGrid.clear() 和 enemyGrid.insert()
    
    const nearbyEnemies = this.enemyGrid.getNearby(...);  //返回空陣列！
}
```

**修復方案**: 每幀開始時 `enemyGrid.clear()` + `enemyGrid.insert(enemy)` 所有敵人

**防堵措施**: Phase 1 必須包含 Grid 更新，DebugOverlay 檢測 Grid 空時顯示 ⚠ 警告

---

### 錯誤案例 #3: player.update() 未調用

**問題**: 主角射擊一次後就停止射擊

**根因**: `player.update(dt, keys, canvasWidth, canvasHeight)` 未被調用，導致 `fireCooldown` 不減少，`canFire()` 永遠返回 false

**影響**: 主角只能射擊一次，之後無法繼續攻擊

**錯誤代碼:**
```javascript
update(dt) {
    this.gameTime += dt;
    
    // ⚠ 缺少 player.update()！
    
    this.autoFire();  // autoFire() 檢查 canFire()，但 fireCooldown 未更新
    
    // player.update() 在這裡才調用（錯誤位置）
    this.player.update(dt, this.keys, this.canvas.width, this.canvas.height);
}
```

**修復方案**: 在 Phase 2（狀態更新）時調用 `player.update()`，且必須在 `autoFire()` 之前

**防堵措施**: Phase 2 必須包含 player.update()，DebugOverlay 檢測 fireCooldown 未更新時顯示 ⚠ 警告

---

### 錯誤案例共同根因:

1. **Update Loop 缺少明確的執行順序**
2. **缺少必要步驟的檢查機制**
3. **缺少 Debug 工具快速定位問題**

**建議 AI Agent:**
- 遵守 Update Loop 四個 Phase
- 使用 Checklist 檢核必要步驟
- 實作 GameLogger 和 DebugOverlay
- 變數必須在使用前定義
- Grid 必須在碰撞檢測前更新

## 6. 測試檢核表

每個功能完成後，建議測試以下項目：

### Update Loop 測試:
- [ ] Phase 1: Grid 已清空並填充所有實體
- [ ] Phase 2: 所有實體狀態已更新（player.update、enemy.update）
- [ ] Phase 3: 系統邏輯已執行（autoFire、checkCollisions）
- [ ] Phase 4: UI 已更新

### Debug 工具測試:
- [ ] GameLogger: Console 日誌正常輸出
- [ ] DebugOverlay: 按 Ctrl+D 鍵開啟
- [ ] Grid 狀態可視化（格子數、實體數）
- [ ] Player 狀態可視化（fireCooldown、canFire）
- [ ] 錯誤警告自動顯示

### 功能測試:
- [ ] 主角能持續自動射擊
- [ ] 子彈能正常命中敵人
- [ ] 敵人死亡後能正常消失
- [ ] 經驗值能正常拾取
- [ ] 升級彈窗能正常顯示
