# 📋 survivor.js - 戰鬥 MVP 產品需求文件 (PRD)

## 1. 專案願景
打造一個輕量化、純 JavaScript 驅動的類倖存者 (Survivor-like) 網頁遊戲 Demo，復刻《小女巫倖存者》的核心割草體驗。玩家扮演盔甲戰士，使用劍與魔法彈消滅敵人。

## 2. 核心戰鬥機制 (The MVP Loop)
*   **自動戰鬥**：玩家負責走位避開碰撞，盔甲戰士自動鎖定範圍內最近敵人並揮劍發射魔法彈。
*   **攻擊範圍**：基礎攻擊範圍 300px，僅對範圍內敵人發動攻擊。
*   **割草感**：高頻率的敵人生成與流暢的擊殺回饋，配合爆炸特效。
*   **成長循環**：擊殺 -> 掉落經驗球 -> 拾取 -> 升級 -> 三選一隨機技能強化。
*   **連殺獎勵**：一次擊殺多隻重疊怪物可獲得攻擊速度加成。

## 3. 實體規格 (Entity Specs)

### A. 盔甲戰士 (Player)
*   **外觀**：銀色盔甲頭盔 + 盔甲身體 + 金色劍柄護手 + 藍色長劍。
*   **移動**：WASD 或方向鍵四向控制，移動時角色面向移動方向。
*   **屬性**：
    - 血量 (HP)：100
    - 移速 (Speed)：200
    - 拾取半徑 (Pickup Range)：80
    - 攻擊範圍 (Attack Range)：300（基礎）+ 可升級
    - 射擊間隔 (Fire Rate)：0.5秒
    - 傷害 (Damage)：1
    - 子彈速度 (Projectile Speed)：400
    - 多重射擊 (Projectile Count)：3
*   **動作**：
    - 受擊時短暫閃爍紅光，1秒無敵時間。
    - 攻擊時揮劍動畫（劍從 -45° 揮至 +45°），0.15秒動畫時間。
    - 揮劍時劍尖白光閃爍 + 藍色軌跡光效。
*   **範圍顯示**：
    - 內圈（基礎）：藍色半透明圓圈
    - 外圈（升級）：綠色半透明圓圈（升級後顯示）
    - 中圈：綠色漸層（連接基礎與升級範圍）

### B. 怪物 (Enemies)
實作四種敵人類型，隨遊戲時間逐步出現：

#### 1. 普通型 (Normal)
*   **外觀**：紅色圓形怪物，白色眼睛 + 生氣表情。
*   **屬性**：血量 1、速度 50-70 px/秒、傷害 10、經驗值 10。
*   **出現時間**：遊戲開始。

#### 2. 快速型 (Fast)
*   **外觀**：綠色圓形怪物，體型較小，頭頂三角尖角。
*   **屬性**：血量 1、速度 90-110 px/秒、傷害 8、經驗值 12。
*   **出現時間**：30秒後權重增加。

#### 3. 坦克型 (Tank)
*   **外觀**：灰色大型怪物，紅色眼睛 + 大嘴，外層光環。
*   **屬性**：血量 3、速度 25-45 px/秒、傷害 20、經驗值 25。
*   **特殊**：頭頂顯示血量條。
*   **出現時間**：60秒後權重增加。

#### 4. 遠程型 (Ranged)
*   **外觀**：紫色圓形怪物，黃色眼睛 + 弧形嘴，頭頂圓形標記。
*   **屬性**：血量 2、速度 30-50 px/秒、傷害 10、經驗值 15。
*   **特殊**：每 2 秒向玩家發射紫色子彈（傷害 5）。
*   **出現時間**：45秒後開始出現。

#### 共同機制
*   **生成**：生成於螢幕外，直線追蹤玩家座標。
*   **連殺**：連鎖範圍 40px，被擊殺時範圍內其他怪物連帶消滅。
*   **權重系統**：根據遊戲時間動態調整各類型出現機率。

### C. 魔法彈 (Projectiles)
*   **外觀**：橙色圓形彈體 + 白色高光 + 拖尾光效。
*   **行為**：直線飛行，碰撞敵人後消失並銷毀敵人。
*   **多重射擊**：升級後可同時發射多顆（扇形散布 ±22.5°）。

### D. 經驗球 (Experience Orbs)
*   **外觀**：綠色圓形 + 脈動動畫 + 白色高光 + 外層光暈。
*   **行為**：進入拾取範圍後自動飛向玩家（磁吸效果）。
*   **屬性**：每顆價值 10 經驗值。

### E. 傷害數字 (Damage Numbers)
*   **外觀**：浮動數字，高傷害（≥5）顯示金色 + 外框描邊。
*   **動畫**：放大 → 向上漂浮 → 漸隱消失（0.8秒）。
*   **字體大小**：16px + 傷害值 × 2（上限 36px）。

### F. 連殺顯示 (Chain Kill Display)
*   **觸發條件**：一次擊殺 2隻以上怪物（含連鎖）。
*   **顯示文字**：
    - 2 kills: "DOUBLE KILL!"（金色）
    - 3 kills: "TRIPLE KILL!"（橙色）
    - 4 kills: "QUAD KILL!"（紅色）
    - 5 kills: "MEGA KILL!"（深紅）
    - 6-9 kills: "ULTRA KILL!"（紫色）
    - 10+ kills: "GODLIKE!"（深紫）
*   **動畫效果**：
    - 放大縮放（scale 1.2 ~ 2.5）
    - 向上漂浮 30px
    - 光暈效果（shadowBlur 20）
    - 漸隱消失（1.5秒）

## 4. 連殺系統 (Chain Kill System)
*   **觸發條件**：一次擊殺 2隻以上怪物（含連鎖）。
*   **獎勵效果**：
    - 攻擊速度 +30%（射擊間隔 × 0.7）
    - 持續時間：5秒
    - 限制：buff期間不再叠加新的攻擊速度增益
*   **UI 提示**：
    - 頂部顯示綠色通知框："⚡ 連殺！攻擊速度 +30%"
    - 附帶倒計時進度條（5秒倒數）
    - 消失時滑出動畫

## 5. 視覺特效 (Visual Effects)
### A. 爆炸特效 (Explosion)
*   **中心閃光**：白→黃色快速擴散光圈（30px → 擴展）。
*   **粒子爆散**：12顆紅/橙色粒子向外飛射（速度 80-140 px/秒）。
*   **核心粒子**：6顆較大紅色粒子（速度 30-50 px/秒）。
*   **持續時間**：0.5秒，粒子逐漸消失。

### B. 揮劍特效
*   **軌跡光效**：藍色半透明揮劍弧線。
*   **劍尖閃光**：攻擊時劍尖白光閃爍。
*   **劍身漸層**：白→灰→銀色金屬質感。

### C. 範圍圈特效
*   **基礎圈**：藍色 rgba(52, 152, 219, 0.3)，2px 線宽。
*   **升級圈**：綠色 rgba(46, 204, 113, 0.3)，2px 線宽。
*   **漸層圈**：綠色 rgba(46, 204, 113, 0.15)，1px 線宽（中間位置）。

### D. 背景裝飾 (Ground Decoration)
隨機生成地面裝飾物與環境粒子，豐富視覺效果。

#### 裝飾物類型
| 類型 | 數量 | 特性 |
|------|------|------|
| 石頭 | 25% | 灰色不規則形狀，靜止 |
| 草叢 | 35% | 綠色草葉，左右微幅搖擺 |
|灌木 | 20% | 深綠圓形組合，靜止 |
|裂痕 | 20% | 細線條裂縫，靜止 |

#### 環境粒子
*   **數量**：20顆漂浮粒子。
*   **顏色**：白色半透明（alpha 0.1~0.25）。
*   **大小**：1~3px。
*   **運動**：向右下漂移（vx 10~30, vy 5~15），循環重生。
*   **透明度**：裝飾物 alpha 0.3~0.5，粒子 alpha 0.1~0.25。

## 6. 音效系統 (Audio System)
使用 Web Audio API 實作合成音效與背景音樂。

### A. 音效列表 (Sound Effects)
| 音效名稱 | 觸發時機 | 音色 | 特性 |
|---------|---------|------|------|
| swing | 玩家揮劍攻擊 | square wave | 200Hz, 0.15s |
| hit | 子彈命中敵人 | sine wave | 400Hz, 0.1s |
| kill | 敵人死亡 | square wave | 800→400Hz, 0.3s (下降) |
| chainKill | 連殺觸發 | sine wave | 1000→1500Hz, 0.5s (上升) |
| levelUp | 玩家升級 | sine wave | 600→1800Hz, 0.8s (漸升) |
| damage | 玩家受傷 | square wave | 150Hz, 0.2s |
| pickup | 拾取經驗球 | sine wave | 500Hz, 0.1s |
| gameOver | 遊戲結束 | sine wave | 100Hz, 1.0s |

### B. 背景音樂 (BGM)
*   **類型**：三角波 oscillator + LFO 調變。
*   **頻率**：基頻 80Hz，LFO 0.5Hz 調變幅度 20Hz。
*   **音量**：0.1 × bgmVolume × masterVolume。
*   **控制**：遊戲開始時啟動，結束時停止。

### C. 音量控制
*   **主音量**：0.5（預設）。
*   **音效音量**：0.7（預設）。
*   **背景音量**：0.3（預設）。
*   **可動態調整**：透過 setMasterVolume/setSfxVolume/setBgmVolume。

## 7. 天賦系統 (Talent System)
升級時隨機提供 3 項強化選項（8 種天賦池）：

| 天賦名稱 | 效果 | 圖示 |
|---------|------|------|
| 生命強化 | 最大生命值 +20 | ❤️ |
| 疾風步 | 移動速度 +30 | 💨 |
| 磁力手套 | 拾取範圍 +30 | 🧲 |
| 鹰眼 | 攻擊範圍 +50 | 👁️ |
| 急速射擊 | 射擊間隔 -0.08秒 | ⚡ |
| 魔力增幅 | 傷害 +1 | ✨ |
| 子彈加速 | 子彈速度 +100 | 🚀 |
| 多重射擊 | 同時發射 +1 顆子彈 | 🎯 |

## 8. 波次系統 (Wave System)
每 60 秒一波，波次間有 5 秒休息時間，每 5 波出現 Boss。

### A. 波次機制
*   **波次周期**：60秒戰鬥 + 5秒休息。
*   **敵人數量**：每波基礎 10隻，隨波次增加（×1.3）。
*   **生成間隔**：基礎 1.5秒，隨波次減少（每波 -0.05秒，最小 0.3秒）。
*   **敵人血量**：每 3波增加 50%（hpMultiplier）。

### B. Boss戰機制
*   **觸發條件**：第 5、10、15...波（每 5波）。
*   **Boss屬性**：
    - 體型：半徑 35px（最大）
    - 血量：50HP
    - 移速：25 px/秒
    - 傷害：30
    - 經驗值：100
    - 射擊：每 1.5秒發射紫色子彈
*   **Boss外觀**：
    - 深紅色主體 + 金色皇冠
    - 紅色光環效果
    - 大型血量條（紅色顯示）
    - 不悅嘴型（倒弧線）
*   **生成時間**：波次進行 50%（30秒）時生成。
*   **Boss波敵人數**：減少 50%（集中戰鬥）。

### C. 波次UI
*   **波次公告**：
    - 新波次：「第 N 波開始！」（橙色）
    - Boss波：「BOSS 波！第 N 波」（紅色）
    - 波次結束：「波次結束！休息時間」（綠色）
    - 漸隱動畫：2秒後消失
*   **波次信息**：
    - 左下角顯示「波次: N」
    - Boss波標記「BOSS 波！」
    - 休息時間標記「休息時間」

## 9. 技術架構
*   **語言**：純 JavaScript (ES6+)。
*   **渲染**：HTML5 Canvas API。
*   **循環**：`requestAnimationFrame` 驅動遊戲主迴圈。
*   **音效**：Web Audio API 實作音效與背景音樂。
*   **模組化**：ES6 Modules（Player、Enemy、Projectile、ExperienceOrb、Explosion、DamageNumber、ChainKillDisplay、SpatialGrid、ObjectPool、AudioManager、DecorationManager、WaveManager、StorageManager、UI、Game）。
*   **碰撞檢測**：空間網格分割（SpatialGrid），格子大小 100px，僅檢測鄰近格子內物件。
*   **效能優化**：使用距離平方比較避免 Math.sqrt 運算。
*   **物件池化**：ObjectPool 重用 Projectile 和 Explosion 物件，減少 GC 壓力（池大小 30/20）。

### 9.1 引擎選擇分析

本專案使用「純 Canvas API」而非現成引擎，以下分析原因與各引擎優缺點。

#### 專案特性分析

| 特性 |需求 | 複雜度 |
|-----|-----|--------|
| 實體數量 | Player、9種Enemy、Projectile、ExpOrb等 | 中等 |
| 碰撞檢測 | SpatialGrid 空間分割 | 中等 |
| 特效系統 | 粒子爆散、光環、揮劍軌跡 | 中等 |
| 音效系統 | Web Audio API 合成音效 | 簡單 |
| 存檔系統 | localStorage | 簡單 |
| 遊戲邏輯 | Boss多階段、連殺、波次 | 中等 |

**總複雜度：中等**

#### 常見 2D 引擎比較

| 引擎 |體積 | Physics | 物件池化 | 粒子系統 | 音效 |學習曲線 |
|-----|-----|---------|----------|----------|------|----------|
| **Phaser.js** | ~1MB |✅內建 | ✅內建 | ✅內建 | ✅內建 | 中等 |
| **PixiJS** | ~250KB | ❌需插件 | ❌需手動 | ✅內建 | ❌需插件 | 簡單 |
| **Kontra.js** | ~10KB | ❌需手動 | ❌需手動 | ❌需手動 | ❌需手動 | 非常簡單 |
| **純 Canvas** | 0KB | ❌需手動 | ❌需手動 | ❌需手動 | ❌需手動 | 簡單 |

#### 引擎詳細分析

**1. Phaser.js（功能最完整）**

優點：
- 內建 Arcade Physics（碰撞檢測）
- 內建 GameObjects.SpritePool（物件池化）
- 內建 Particle Manager（粒子系統）
- 內建 Sound Manager（音效管理）
- 文檔豐富、社群活躍
- 適合複雜遊戲

缺點：
-體積較大（~1MB），不符合「輕量化」需求
- 學習曲線中等（需要理解 Scene、GameObject等概念）
- 自定義邏輯可能受限制（如9種敵人類型多樣化）

適用場景：
- 複雜遊戲（多種實體、複雜 Physics）
- 商業遊戲（需要完整功能）
- 團隊開發（需要規範架構）

---

**2. PixiJS（渲染效能最佳）**

優點：
-渲染效能優秀（WebGL + Canvas fallback）
- 輕量級（~250KB），符合「輕量化」需求
- 易於學習（API 簡潔）
- 適合注重渲染效能的遊戲

缺點：
-不內建 Physics（需額外插件如 PixiPhysics）
- 不內建物件池化（需手動實作）
- 不內建音效（需手動使用 Web Audio API）
- 不內建粒子系統（需額外插件）

適用場景：
- 注重渲染效能的遊戲（大量 Sprite）
- 輕量化專案
- 需要自定義邏輯的遊戲

---

**3. Kontra.js（最輕量）**

優點：
-非常輕量（~10KB），完全符合「輕量化」需求
- 極簡 API（Sprite、GameLoop、Keyboard）
- 易於學習（非常簡單）
- 適合小遊戲

缺點：
- 功能最少（不內建 Physics、物件池化、粒子、音效）
- 需要手動實作所有系統
- 適合小型專案

適用場景：
- 小型遊戲（少於5種實體）
- 學習專案（理解遊戲開發基礎）
-極輕量化專案

---

**4. 純 Canvas API（本專案選擇）**

優點：
- 完全輕量化（0KB額外依賴）
- 完全控制權（可自定義所有邏輯）
- 符合專案願景「輕量化、純 JavaScript 驅動」
- 易於理解（直接操作 Canvas API）
- 適合學習底層原理

缺點：
- 需手動實作所有系統（Physics、物件池化、粒子、音效）
- 容易犯錯（如 Update Loop 遺漏步驟）
-需要規範（如 PRD.md 的「AI Agent開發規範」）

適用場景：
- 輕量化專案（無額外依賴）
-學習專案（理解底層原理）
- 完全自定義邏輯的遊戲

---

#### 本專案選擇「純 Canvas API」的原因

根據專案願景：
> 「打造一個輕量化、純 JavaScript 髸動的類倖存者網頁遊戲 Demo」

選擇純 Canvas API 的理由：

1. **符合「輕量化」需求**
   -無額外依賴（Phaser.js ~1MB、PixiJS ~250KB）
   - 專案體積最小化

2. **符合「純 JavaScript」需求**
   - 直接使用 ES6 Modules
   - 不需要引擎 API

3. **學習價值**
   - 理解 Update Loop、SpatialGrid、ObjectPool 底層原理
   - 可作為教學範例

4. **完全控制權**
   - 可自定義9種敵人類型、Boss多階段系統
   - 不受引擎限制

5. **專案複雜度中等**
   - 實體數量不多（Phaser.js 適合複雜遊戲）
   -手動實作可行

---

#### 引擎選擇建議（給未來專案）

|專案特性 | 建議引擎 |
|---------|----------|
| 輕量化 + 中等複雜度 | **純 Canvas + PRD規範** |
| 輕量化 + 高渲染效能 | **PixiJS + 手動實作其他功能** |
| 複雜遊戲 +完整功能 | **Phaser.js** |
| 小型遊戲 +極輕量 | **Kontra.js** |

**給 AI Agent 的建議：**
- 如果專案願景強調「輕量化」，選擇純 Canvas + PRD規範
- 如果專案願景強調「完整功能」，選擇 Phaser.js
- 如果專案願景強調「渲染效能」，選擇 PixiJS
- 如果專案願景強調「極輕量」，選擇 Kontra.js

---

#### 使用引擎的注意事項

如果選擇使用引擎，仍可能遇到代碼流程錯誤（如變數未定義），建議：

1.遵守 PRD.md 的「AI Agent開發規範」（Update Loop 四個 Phase）
2. 實作 GameLogger（Console 日誌）
3. 實作 DebugOverlay（可視化調試工具）

**引擎不會完全解決代碼規範問題，仍需要遵守規範。**

### AI Agent 開發規範（建議執行）

以下規範基於實際開發過程中遇到的問題，建議 AI Agent 遵守以避免類似錯誤。

#### A. Update Loop 四個 Phase（建議執行）

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

#### B. 必要步驟 Checklist（建議執行）

**問題根因**: 缺少必要步驟的檢查機制，導致核心更新被遺漏。

建議 AI Agent 在完成 Update Loop 時，逐一檢核以下步驟：

**Phase 1 Checklist:**
- [ ] enemyGrid.clear() 已執行
- [ ] 所有敵人已插入 enemyGrid.insert(enemy)
- [ ] enemyGrid.getTotalEntities() === enemies.length

**Phase 2 Checklist:**
- [ ] player.update(dt, keys, canvasWidth, canvasHeight) 已執行
- [ ] 所有敵人 update() 已執行
- [ ] 所有投射物 update() 已執行

**Phase 3 Checklist:**
- [ ] autoFire() 已執行（依賴 player.fireCooldown 已更新）
- [ ] checkCollisions() 已執行（依賴 Grid 已填充）
- [ ] 死亡實體已從陣列中移除

**Phase 4 Checklist:**
- [ ] UI 狀態已更新
- [ ] 特效已更新

#### C. Debug 工具要求（建議執行）

**問題根因**: 缺少 Debug 工具快速定位問題，導致問題發生時無法快速發現。

建議實作以下 Debug 工具：

1. **GameLogger（Console 日誌）**
   - 記錄每個 Phase 的執行狀態
   - 記錄關鍵變數（Grid 體數、fireCooldown 等）
   - 錯誤時 Console 顯示警告

2. **DebugOverlay（可視化調試工具）**
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

#### D. 代碼流程規範（建議執行）

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

#### E. 錯誤案例與根因分析（警示）

以下錯誤來自實際開發過程，建議 AI Agent 避免相同錯誤：

---

**錯誤案例 #1: chainKills 未定義**

**問題**: 主角只攻擊一次就停止，子彈打不到怪物

**根因**: `game.js:448` 引用了在第 456 行才定義的 `chainKills`變數

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

**錯誤案例 #2: enemyGrid 未更新**

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

**錯誤案例 #3: player.update() 未調用**

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

**錯誤案例共同根因:**

1. **Update Loop 缺少明確的執行順序**
2. **缺少必要步驟的檢查機制**
3. **缺少 Debug 工具快速定位問題**

**建議 AI Agent:**

- 遵守 Update Loop 四個 Phase
- 使用 Checklist 檢核必要步驟
-實作 GameLogger 和 DebugOverlay
- 變數必須在使用前定義
- Grid 必須在碰撞檢測前更新

#### F. 測試檢核表（建議執行）

每個功能完成後，建議測試以下項目：

**Update Loop 測試:**
- [ ] Phase 1: Grid 已清空並填充所有實體
- [ ] Phase 2: 所有實體狀態已更新（player.update、enemy.update）
- [ ] Phase 3: 系統邏輯已執行（autoFire、checkCollisions）
- [ ] Phase 4: UI 已更新

**Debug 工具測試:**
- [ ] GameLogger: Console 日誌正常輸出
- [ ] DebugOverlay: 按 Ctrl+D 鍵開啟
- [ ] Grid 狀態可視化（格子數、實體數）
- [ ] Player 狀態可視化（fireCooldown、canFire）
- [ ] 錯誤警告自動顯示

**功能測試:**
- [ ] 主角能持續自動射擊
- [ ] 子彈能正常命中敵人
- [ ] 敵人死亡後能正常消失
- [ ] 經驗值能正常拾取
- [ ] 升級彈窗能正常顯示

## 10. UI 系統規格
### A. 狀態列 (Stats Bar)
*   **血量條**：200px 寬，紅色漸層 fill，顯示 "當前/最大"。
*   **經驗條**：200px 寬，橙色漸層 fill，顯示 "當前/升級需求"。
*   **等級顯示**：金色字體 "Lv. N"。
*   **計時器**：右上角，白色 "MM:SS" 格式。

### B. 升級彈窗
*   **標題**："升級！選擇一項強化"。
*   **選項卡片**：藍色漸層背景，hover 時上浮 + 金色邊框。
*   **卡片內容**：圖示 + 名稱 + 描述。

### C. Buff 通知
*   **位置**：頂部中央偏下（距狀態列 40px）。
*   **外觀**：綠色漸層背景 + 白色邊框 + 陰影。
*   **內容**：圖示 + 文字 + 倒計時條。
*   **動畫**：滑入（0.3秒）→ 滑出（0.3秒）。

### D. 遊戲結束畫面
*   **本次成績**：
    - 等級（新紀錄標記 🏆）
    - 擊殺數
    - Boss擊殺數
    - 最高波次（新紀錄標記 🏆）
    - 存活時間（新紀錄標記 🏆）
*   **歷史紀錄**：
    - 最高等級
    - 最長存活時間
    - 總擊殺數
    - 最高波次
    - Boss擊殺總數
    - 總遊戲次數
*   **重新開始按鈕**：綠色漸層，hover 放大 + 陰影。

### E. 暫停畫面
*   **觸發方式**：ESC 或 P 鍵。
*   **外觀**：深灰漸層背景 + 藍色邊框。
*   **顯示內容**：「遊戲暫停」標題 + 操作提示。
*   **背景半透明**：rgba(0, 0, 0, 0.7) 覆蓋遊戲畫面。
*   **限制**：升級彈窗開啟時無法暫停。

## 11. 存檔系統 (Storage System)
使用 localStorage 儲存玩家遊戲紀錄，持久化保存歷史最佳成績。

### A. 儲存項目
| 項目 | 描述 | 類型 |
|------|------|------|
| highestLevel | 最高達成等級 | 整數 |
| longestTime | 最長存活時間（秒） | 整數 |
| totalKills | 總擊殺數（累積所有遊戲） | 整數 |
| highestWave | 最高波次 | 整數 |
| totalGames | 總遊戲次數 | 整數 |
| bossesKilled | Boss擊殺總數 | 整數 |

### B. 更新時機
*   **遊戲結束時**：自動更新並儲存統計資料。
*   **新紀錄檢測**：比對歷史紀錄，破紀錄項目標記 🏆 符號。
*   **累積統計**：總擊殺數、Boss擊殺數、遊戲次數持續累加。

### C. 技術實作
*   **StorageManager 類別**：管理 localStorage 存取邏輯。
*   **JSON 序列化**：統計資料以 JSON 格式儲存（key: `survivor_js_stats`）。
*   **錯誤處理**：localStorage 失效時靜默失敗，console.warn 提示，不影響遊戲運行。
*   **格式化輸出**：`formatTime()` 轉換秒數為「N分M秒」格式。

## 12. 已開發功能清單 (Completed Features)
- [x] 基礎 Canvas 畫布與玩家移動控制（WASD / 方向鍵）。
- [x] 盔甲戰士外觀渲染（頭盔、盔甲、劍）。
- [x] 攻擊範圍限制與雙圈顯示（藍色基礎 + 綠色升級）。
- [x] 自動索敵射擊邏輯（範圍內最近敵人）。
- [x] 揮劍動畫與特效（揮動軌跡 + 劍尖閃光）。
- [x] 怪物波次生成器（難度隨時間遞增）。
- [x] 敵人類型多樣化（普通型、快速型、坦克型、遠程型）。
- [x] 遠程型敵人射擊系統（紫色追蹤子彈）。
- [x] 坦克型敵人血量條顯示。
- [x] 爆炸特效（粒子爆散 + 中心閃光）。
- [x] 背景裝飾（石頭/草叢/灌木/裂痕 + 環境粒子）。
- [x] 傷害數字顯示（浮動數字 + 放大漸隱動畫）。
- [x] 經驗值拾取與升級 UI 彈窗。
- [x] 三選一隨機天賦系統（8種強化選項）。
- [x] 連殺系統與攻擊速度 buff。
- [x] 連殺顯示系統（DOUBLE/TRIPLE/QUAD/MEGA/ULTRA/GODLIKE 大字動畫）。
- [x] 波次系統（每60秒一波 + Boss戰機制）。
- [x] Boss敵人（皇冠 + 光環 + 大血量條 + 射擊）。
- [x] 存檔功能（localStorage 儲存最高紀錄）。
- [x] 音效系統（揮劍/命中/擊殺/連殺/升級/受傷/拾取/結束）。
- [x] 背景音樂（三角波 oscillator + LFO 調變）。
- [x] 暫停功能（ESC/P 鍵暫停遊戲）。
- [x] Buff 通知 UI（倒計時 + 滑入滑出動畫）。
- [x] 遊戲結束畫面與重新開始功能。

## 13. 檔案結構
```
survivor.js/
├── index.html          # 遊戲主頁面
├── css/
│   └── style.css       # 遊戲樣式（含動畫）
├── js/
│   ├── main.js         # 入口檔案
│   ├── game.js         # 遊戲主邏輯
│   ├── player.js       # 玩家類別（盔甲戰士）
│   ├── enemy.js        # 敵人類別
│   ├── projectile.js   # 魔法彈類別
│   ├── experience.js   # 經驗值類別
│   ├── explosion.js    # 爆炸特效類別
│   ├── damageNumber.js # 傷害數字類別
│   ├── chainKillDisplay.js # 連殺顯示類別
│   ├── spatialGrid.js  # 空間網格分割（碰撞優化）
│   ├── objectPool.js   # 物件池化（GC 優化）
│   ├── audio.js        # 音效管理（Web Audio API）
│   ├── decoration.js   # 背景裝飾（地面裝飾物 + 環境粒子）
│   ├── waveManager.js  # 波次管理（波次機制 + Boss戰）
│   ├── storage.js      # 存檔管理（localStorage 紀錄）
│   ├── talent.js       # 天賦系統
│   ├── ui.js           # UI 管理（含 Buff 通知）
│   └── utils.js        # 工具函數（含 distanceSquared）
├── PRD.md              # 產品需求文件
├── CHANGELOG.md        # 更新日誌
└── README.md           # 專案說明
```