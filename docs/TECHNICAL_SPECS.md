# 遊戲技術架構與規格 (Technical Specifications)

本文件詳述 `survivor.js` 的程式架構、調試機制與檔案結構。

## 1. 重構後的物件架構（組合模式）

### A. Player 拆分

#### 1. PlayerCore.js
**職責**：位置、移動、碰撞
- **屬性**：x, y, radius, speed, hp, shield
- **方法**：update(), move(), takeDamage()

#### 2. PlayerCombat.js
**職責**：射擊、技能、傷害計算
- **屬性**：fireRate, fireCooldown, damage, critChance, skillCooldown
- **方法**：canFire(), shoot(), useSkill()

#### 3. PlayerRenderer.js
**職責**：繪製盔甲戰士
- **方法**：draw(), drawHelmet(), drawBody(), drawLegs(), drawArms(), drawSword()

#### 4. Player.js（組合類別）
```javascript
class Player {
    constructor(x, y) {
        this.core = new PlayerCore(x, y);
        this.combat = new PlayerCombat(this.core);
        this.renderer = new PlayerRenderer();
    }
    
    // 使用 Getter/Setter 暴露所有原有屬性（保持接口兼容）
    get x() { return this.core.x; }
    get y() { return this.core.y; }
    get hp() { return this.core.hp; }
    get fireCooldown() { return this.combat.fireCooldown; }
    
    update(dt, keys, canvasWidth, canvasHeight) {
        this.core.update(dt, keys, canvasWidth, canvasHeight);
        this.combat.update(dt);
    }
    
    draw(ctx) {
        this.renderer.draw(ctx, this.core, this.combat);
    }
}
```

### B. Enemy 拆分

#### 1. EnemyCore.js
**職責**：位置、移動、碰撞、傷害計算
- **屬性**：x, y, radius, speed, hp, damage, type
- **方法**：update(), move(), takeDamage()

#### 2. EnemyBehaviors.js
**職責**：射擊、分裂、隱形行為
- **屬性**：shootCooldown, canShoot, canSplit, isInvisible
- **方法**：update(), shoot(), split(), reveal()

#### 3. BossPhaseManager.js
**職責**：Boss 多階段管理（狂暴模式、召喚小怪）
- **屬性**：phase, phaseThresholds, isEnraged
- **方法**：update(), enterNextPhase(), summonMinions()

#### 4. EnemyRenderer.js
**職責**：繪製敵人外觀（支援 9種敵人類型）
- **方法**：draw(), drawNormal(), drawFast(), drawTank(), drawRanged(), drawBoss()

#### 5. Enemy.js（組合類別）
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

## 2. 調試機制 (Debugging)

### A. DebugOverlay 功能

| 功能 | 熱鍵 | 描述 |
|------|------|------|
| **開啟調試** | Ctrl+D | 顯示 Grid、fireCooldown、警告 |
| **FPS顯示** | Ctrl+D | 顯示 FPS、Memory、實體數量 |
| **硬斷言** | Ctrl+Shift+V | 啟用 GameValidator 檢查 |

#### DebugOverlay 顯示內容
- **Grid 狀態**：格子數、實體數、⚠ Grid空警告
- **Player 狀態**：fireCooldown、canFire、⚠ 冷卻未更新警告
- **FPS/Memory**：FPS數值、Memory使用量、⚠ FPS過低警告
- **實體統計**：P（玩家）、E（敵人）、Exp（經驗球）、EP（投射物）、DN（傷害數字）

### B. GameLogger 日誌等級切換

| 等級 | 熱鍵 | 描述 |
|------|------|------|
| **ERROR** | Ctrl+Shift+L | 只顯示錯誤 |
| **INFO** | Ctrl+Shift+L | 顯示重要資訊 + 錯誤 |
| **DEBUG** | Ctrl+Shift+L | 顯示所有日誌（包含每個Phase） |

#### 日誌內容
- **Phase 日誌**：每個 Phase 的執行狀態
- **關鍵變數**：Grid 實體數、fireCooldown、projectiles 數量
- **錯誤警告**：Grid空、冷卻未更新、敵人過多

### C. GameValidator 硬斷言

| 檢查項目 | 描述 | 錯誤訊息 |
|---------|------|---------|
| **validatePhase1** | Grid 實體數 = 敵人數 | Phase 1失敗：Grid實體數 ≠ 敵人數 |
| **validatePhase2** | fireCooldown 已減少 | Phase 2失敗：fireCooldown 未減少 |
| **validatePhase3** | getNearby 返回非空陣列 | Phase 3失敗：碰撞檢測失效 |

### D. ObjectPool 統計

| 功能 | 熱鍵 | 描述 |
|------|------|------|
| **統計顯示** | Ctrl+Shift+P | 顯示 ObjectPool 使用率、峰值、命中率 |

#### ObjectPool 統計內容
- **peakActiveCount**：峰值使用量
- **hitRate**：命中率（reuse / total requests）
- **efficiency**：效率（active / poolSize）
- **autoExpansions**：自動扩容次數

## 3. 檔案結構

```
survivor.js/
├── index.html              # 遊戲主頁面
├── tilesetCleaner.html     # Tileset 清理工具
├── css/
│   └── style.css           # 遊戲樣式（含動畫）
├── js/
│   ├── main.js             # 入口檔案
│   ├── game.js             # 遊戲主邏輯
│   ├── gameLogger.js       # Console 日誌（ERROR/INFO/DEBUG）
│   ├── debugOverlay.js     # 可視化調試工具（Ctrl+D）
│   ├── gameValidator.js    # 硬斷言檢查（Ctrl+Shift+V）
│   ├── player.js           # 玩家類別（組合模式）
│   ├── playerCore.js       # 玩家核心（位置、移動）
│   ├── playerCombat.js     # 玩家戰鬥（射擊、技能）
│   ├── playerRenderer.js   # 玩家繪製
│   ├── enemy.js            # 敵人類別（組合模式）
│   ├── enemyCore.js        # 敵人核心（位置、移動）
│   ├── enemyBehaviors.js   # 敵人行为（射擊、分裂、隱形）
│   ├── bossPhaseManager.js # Boss 阶段管理
│   ├── enemyRenderer.js    # 敵人繪製（支援 9種敵人）
│   ├── projectile.js       # 魔法彈類別
│   ├── experience.js       # 經驗值類別
│   ├── explosion.js        # 爆炸特效類別
│   ├── damageNumber.js     # 傷害數字類別
│   ├── chainKillDisplay.js # 連殺顯示類別
│   ├── spatialGrid.js      # 空間網格分割（碰撞優化）
│   ├── objectPool.js       # 物件池化（GC 優化）
│   ├── audio.js            # 音效管理（Web Audio API）
│   ├── decoration.js       # 背景裝飾（地面裝飾物 + 環境粒子）
│   ├── waveManager.js      # 波次管理（波次機制 + Boss戰）
│   ├── storage.js          # 存檔管理 + 排行榜 TOP 10
│   ├── talent.js           # 天賦系統（14種技能）
│   ├── achievement.js      # 成就系統（19個成就）
│   ├── ui.js               # UI 管理（含 Buff 通知 + 技能狀態）
│   ├── visibilityMask.js   # 視野遮罩（戰爭迷霧）
│   ├── tileManager.js      # Tileset 管理器
│   ├── tilesetCleaner.js   # Tileset 清理工具
│   ├── bossSpawnEffect.js  # Boss 出場特效
│   ├── bossDeathEffect.js  # Boss 死亡特效
│   ├── shieldBreakEffect.js# 精英護盾破碎特效
│   ├── splitEffect.js      # 分裂敵人分裂特效
│   └── utils.js            # 工具函數（含 distanceSquared）
├── docs/                   # 📚 專案文件中心
│   ├── PRD.md              # 產品需求文件
│   ├── TECHNICAL_SPECS.md  # 技術架構與規格
│   ├── AGENT_GUIDELINES.md # AI Agent 開發規範
│   ├── TOOL_SPECS.md       # 遊戲開發工具規格
│   ├── PROJECT_STATUS.md   # 專案開發進度
│   ├── ENGINE_ANALYSIS.md  # 引擎選擇分析
│   ├── TILESET_GUIDE.md    # Tileset 使用指南
│   ├── TILESET_FIX_GUIDE.md# Tileset 問題解決方案
│   └── REFACTOR_PLAN.md    # 重構計畫
├── CHANGELOG.md            # 更新日誌
├── README.md               # 專案說明
└── .agent_task_state.md    # 任務狀態快照
```
