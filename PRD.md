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

### 核心遊戲功能
- [x] 基礎 Canvas 畫布與玩家移動控制（WASD / 方向鍵）。
- [x] 盔甲戰士外觀渲染（頭盔、盔甲、劍）。
- [x] 攻擊範圍限制與雙圈顯示（藍色基礎 + 綠色升級）。
- [x] 自動索敵射擊邏輯（範圍內最近敵人）。
- [x] 揮劍動畫與特效（揮動軌跡 + 劍尖閃光）。
- [x] 怪物波次生成器（難度隨時間遞增）。
- [x] 敵人類型多樣化（9種類型）。
- [x] 遠程型敵人射擊系統（紫色追蹤子彈）。
- [x] 坦克型敵人血量條顯示。
- [x] 爆炸特效（粒子爆散 + 中心閃光）。
- [x] 背景裝飾（石頭/草叢/灌木/裂痕 + 環境粒子）。
- [x] 傷害數字顯示（浮動數字 + 放大漸隱動畫）。
- [x] 經驗值拾取與升級 UI 彈窗。
- [x] 天賦系統（14種強化選項：暴击率、暴击伤害、吸血、护盾、经验加成、护甲等）。
- [x] 連殺系統與攻擊速度 buff + 經驗加成（最高+150%）。
- [x] 連殺顯示系統（DOUBLE/TRIPLE/QUAD/MEGA/ULTRA/GODLIKE 大字動畫）。
- [x] 波次系統（每60秒一波 + 5秒休息時間 + Boss戰機制）。
- [x] Boss敵人（皇冠 + 光環 + 大血量條 + 多階段狂暴模式 + 多方向子彈 +召喚精英小怪）。
- [x] 存檔功能（localStorage 储存最高紀錄）。
- [x] 音效系統（揮劍/命中/擊殺/連殺/升級/受傷/拾取/結束）。
- [x] 背景音樂（三角波 oscillator + LFO 調變）。
- [x] 暫停功能（ESC/P 鍵暫停遊戲）。
- [x] Buff 通知 UI（倒計時 + 滑入滑出動畫）。
- [x] 遊戲結束畫面與重新開始功能。

### 新增功能（詳細）
- [x] **視野遮罩系統**：玩家周圍清晰可見，視野外深色模糊（戰爭迷霧效果）。
- [x] **護盾系統**：藍色護盾 UI（HP 條上方）+ 護盾吸收傷害 + 護盾破碎特效 + 休息時間自動回復。
- [x] **技能狀態顯示**：左上方顯示已升級技能 + 右上角顯示技能冷卻（Q鍵终极技能）。
- [x] **成就系統**：19個成就（首殺/百殺/千殺/存活時間/Boss擊殺/波次/等級/遊戲次數/地狱模式）。
- [x] **排行榜 TOP 10**：本地排行榜顯示前10名最高成绩（預設關閉，點擊展開）。
- [x] **難度系統**：普通/困難/地狱模式（影響敵人生成速度、血量、傷害）。
- [x] **遊戲開始畫面**：標題、操作說明、難度選擇、開始按鈕、設定選單。
- [x] **遊戲內音量設定**：暫停畫面可調整主音量/音效/背景音量。
- [x] **Q键终极技能**：按Q键釋放全屏攻擊（傷害=玩家攻擊力×10，冷卻30秒）。
- [x] **暴击系统**：暴击子弹显示红色 + 金色光环 + 暴击傷害倍率。
- [x] **連殺經驗加成**：連殺數越高獲得額外經驗加成（最高+150%）。

### 敵人類型擴展
- [x] **精英敵人**：金色光環、藍色護盾（需先破盾才能傷害本體）、護盾破碎特效。
- [x] **分裂敵人**：死亡時分裂成2個小型敵人、觸發周圍80px內分裂敵人鏈式分裂、分裂特效。
- [x] **爆炸敵人**：死亡時對範圍內玩家造成爆炸傷害（範圍60px）。
- [x] **隱形敵人**：半透明狀態（alpha 0.3）、受擊後短暫現形閃爍（1秒）。
- [x] **敵人類型權重系統**：根據遊戲時間動態調整出現機率。

### Boss 多階段系統
- [x] **Boss 出場特效**：紅色光環擴散、警告公告、震動效果。
- [x] **Boss 放大**：radius 160 + UI 血量條标注（屏幕上方显示 BOSS 血量）。
- [x] **Boss 多階段**：血量低時進入狂暴模式（速度加快、射擊加快、召喚小怪）。
- [x] **Boss 狂暴技能**：第二階段射出4方向子彈，第三階段射出8方向子彈並召喚精英小怪。
- [x] **Boss 死亡特效**：多重粒子爆散、光環擴散、閃電效果。

### Tileset 系統
- [x] **TileManager 系統**：從素材圖集裁切 tiles，支援地板拼接與環境物件（待圖集裁切完成後使用）。
- [x] **TilesetCleaner 工具**：手動框選素材區域，生成乾淨圖集（避開設計稿文字說明）。
- [x] **TILESET_GUIDE.md**：Canvas drawImage() 裁切原理、素材定位表、與 DecorationManager 分工說明。
- [x] **TILESET_FIX_GUIDE.md**：設計稿文字說明問題的4種解決方案對比。

### 重構完成（Phase 1-3）
- [x] **Phase 1**：Update Loop 四個 Phase（清理 → 狀態 → 系統 → UI）+ GameLogger + DebugOverlay。
- [x] **Phase 2**：
    - Player 拆分（PlayerCore + PlayerCombat + PlayerRenderer）。
    - Enemy 拆分（EnemyCore + EnemyBehaviors + BossPhaseManager + EnemyRenderer）。
- [x] **Phase 3**：
    - GameValidator.js（硬斷言檢查）。
    - DebugOverlay FPS/内存/實體統計（P/E/Exp/EP/DN）。
    - 自動警告系統（FPS過低、Memory過高、Grid空、冷卻未更新、敵人過多）。
    - 日誌等級切換（Ctrl+Shift+L 循環切換 ERROR → INFO → DEBUG）。

### 效能優化
- [x] **ObjectPool 全面優化**：
    - 預分配大小調整：ProjectilePool 50→200，其他池按需調整。
    - 對象狀態標記（_active）避免 indexOf 性能损耗。
    - 自動扩容：池用完后自动扩容 50%（限制 maxSize）。
    - 統計监控：peakActiveCount、hitRate、efficiency、autoExpansions。
    - 清理优化：cleanInactive() 定期清理无效对象。
    - 自动调整：autoAdjust() 根据峰值使用量自动扩容。
    - 调试热键：Ctrl+Shift+P 查看 ObjectPool 统计。
- [x] **空間網格分割（SpatialGrid）**：格子大小 100px，優化碰撞檢測從 O(n×m) 降至 O(n×k)。
- [x] **距離平方比較**：新增 distanceSquared() 函數避免 Math.sqrt 運算。
- [x] **網格緩存**：每幀清空重建，僅檢測鄰近格子內物件。

### Bug 修復
- [x] **修復 chainKills 變數未定義錯誤**：移動變數定義至使用前（Commit: 6350085）。
- [x] **修復敵人無法被子彈命中**：每幀更新前將敵人插入 SpatialGrid（Commit: f5926c7）。
- [x] **修復主角射擊一次就停止**：在 update() 中調用 player.update() 更新 fireCooldown（Commit: 8b79a6e）。
- [x] **HP 條同步問題**：护盾吸收傷害時 UI 即時更新，避免玩家突然死亡無預警。

## 13. TileManager 系統規格

### A. 系統概述
TileManager 用於從素材圖集裁切 tiles，支援地板拼接與環境物件渲染。與 DecorationManager 分工：TileManager 畫底層地板，DecorationManager 畫頂層動態裝飾。

### B. Canvas drawImage() 裁切原理
```javascript
ctx.drawImage(
    image,            // 原圖
    sx, sy,           // 裁切起始座標（在原圖上的位置）
    sWidth, sHeight,  // 裁切尺寸
    dx, dy,           // 繪製目標座標（在 Canvas 上的位置）
    dWidth, dHeight   // 繪製尺寸（可放大/縮小）
);
```

**範例：取出第一格草地**
```javascript
ctx.drawImage(
    tilesetImage,
    0, 0, 32, 32,     // 裁切原圖 (0,0) 位置的 32x32區塊
    100, 100, 32, 32  // 繪製到 Canvas (100,100) 位置
);
```

### C. 素材定位表

#### 地板類（32x32）
| 素材名稱 | 定位座標 | 尺寸 |
|---------|---------|------|
| grass | (0, 0) | 32x32 |
| grass2 | (32, 0) | 32x32 |
| grass3 | (64, 0) | 32x32 |
| dirt | (0, 32) | 32x32 |
| dirt2 | (32, 32) | 32x32 |
| stone | (0, 64) | 32x32 |
| stone2 | (32, 64) | 32x32 |
| water | (0, 96) | 32x32 |
| water2 | (32, 96) | 32x32 |

#### 環境物件
| 素材名稱 | 定位座標 | 尺寸 |
|---------|---------|------|
| tree | (160, 0) | 64x96 |
| bush | (224, 0) | 32x32 |
| flower | (256, 0) | 32x32 |
| flower2 | (288, 0) | 32x32 |
| rock | (160, 96) | 48x48 |
| mushroom | (224, 32) | 32x32 |

#### 其他
| 素材名稱 | 定位座標 | 尺寸 |
|---------|---------|------|
| fence_h | (320, 0) | 水平圍欄 |
| fence_v | (352, 0) | 垂直圍欄 |
| fence_corner | (384, 0) | 圍欄轉角 |

### D. TileManager 與 DecorationManager 分工

| 功能 | TileManager | DecorationManager |
|------|-------------|-------------------|
| 地板拼接 | ✅ 草地、泥土、水面 | ❌ |
| 靜態物件 | ✅ 樹木、石頭、圍欄 | ❌ |
| 動態裝飾 | ❌ | ✅ 搖擺的草、發光水晶 |
| 粒子效果 | ❌ | ✅ 螢火虫、落叶、星光 |
| 地圖生成 | ✅ 隨機地板 | ❌ |

**建議**：兩者並存，TileManager 畫底層地板，DecorationManager 畫頂層動態裝飾。

### E. 使用方式

#### 1. 在 game.js 中引入
```javascript
import { TileManager } from './tileManager.js';

export class Game {
    constructor(canvas) {
        this.tileManager = new TileManager();
    }
    
    async start() {
        await this.tileManager.load();  // 載入素材圖集
        this.generateMap();
    }
}
```

#### 2. 生成地板地圖
```javascript
generateMap() {
    this.groundMap = this.tileManager.generateRandomGround(
        this.canvas.width * 2,  // 地圖比畫面大
        this.canvas.height * 2
    );
    this.tileManager.addDecorations(this.groundMap, 100);
}
```

#### 3. 在 render() 中繪製
```javascript
render() {
    // 1. 先畫地板（底層）
    this.tileManager.drawMap(this.ctx, this.groundMap);
    
    // 2. 畫玩家和敵人（中層）
    this.player.draw(this.ctx);
    for (const enemy of this.enemies) {
        enemy.draw(this.ctx);
    }
    
    // 3. 畫動態裝飾（頂層）
    this.decorationManager.draw(this.ctx);
}
```

### F. 下一步優化
1. **地圖捲動**：隨玩家移動調整 offsetX/offsetY
2. **碰撞檢測**：部分 tile（水、石頭）可設為障礙物
3. **多層渲染**：地板 → 物件 → 玩家 → 敵人 → 特效
4. **動態載入**：大地圖只渲染視野範圍內的 tiles

## 14. TilesetCleaner 工具規格

### A. 工具用途
設計稿通常包含 **素材 + 設計說明文字 + 尺寸標註**，文字說明會導致自動裁切錯亂。TilesetCleaner 可手動框選純素材區域，生成乾淨的 tileset.png。

### B. 啟動方式
```bash
npm run dev
# 瀏覽器打開 http://localhost:3000/tilesetCleaner.html
```

### C. 操作流程
1. **調整素材尺寸**（預設 32px，可改為 16/64/128）
2. **選擇尺寸處理模式**：
   - 🔒 **保留原始尺寸**（推薦）：保持每個素材的原始大小
   - 📐 **縮放為統一尺寸**：強制縮放為 32x32
3. **點擊「➕ 新增素材位置」**
4. **在設計稿上框選純素材區域**（避開文字說明）
5. **手動調整 X Y W H 輸入框**（精確控制裁切範圍）
6. **框選錯誤時**：
   - 點擊已框選區域（紅色高亮）
   - 點擊「❌ 删除选中」或「↩️ 撤销」
7. **選擇布局模式**：
   - 🎯 **最優布局**（推薦）：自動計算最小空白格數
   - ⬜ **強制正方形**：適合需要正方形圖集的場合
   - ⚙️ **自定義尺寸**：手動設定列數/行數
8. **點擊「👀 预览图集」**
9. **檢查預覽是否正確**
10. **確認無誤後點擊「⬇️ 確認下載」**

### D. 功能特色

| 功能 | 說明 |
|------|------|
| **手動框選** | 避開設計稿文字說明，只選取純素材 |
| **手動調整** | X Y W H 四個輸入框，精確控制裁切範圍 |
| **浮點誤差修正** | 自動計算圖片缩放比例，避免坐標偏移 |
| **預覽功能** | 先預覽生成的圖集，確認無誤後再下載 |
| **多種布局** | 最優布局、強制正方形、水平/垂直排列、自定義尺寸 |
| **格子間距** | 可關閉生成完美正方形，或啟用 2px 間距 |
| **尺寸處理** | 保留原始尺寸或縮放為統一尺寸 |

### E. 設計稿文字說明問題的解決方案

| 方案 | 適用對象 | 優點 | 缺點 |
|------|---------|------|------|
| **方案1：手動框選工具** | 進階使用者 | 可視化操作、自動生成乾淨圖集 | 需要操作工具 |
| **方案2：圖片編輯軟體** | 新手 | 最簡單、最可靠 | 需要圖片編輯技能 |
| **方案3：修改定義** | 快速修復 | 不需修改原始圖片 | 需手動測量每個素材位置 |
| **方案4：自動化腳本** | 專業使用者 | 全自動處理、批量處理 | 需圖像處理知識 |

**推薦方案**：
- 新手 → 方案 2（圖片編輯軟體）
- 進階 → 方案 1（手動框選工具）
- 專業 → 方案 4（自動化腳本）

## 15. 專業切圖工具推薦

### A. 工具對比表

| 工具 | 用途 | 優點 | 缺點 | 適用場景 |
|------|------|------|------|---------|
| **TexturePacker** | Sprite Sheet/Tileset 自動排列 | 專為遊戲設計、自動優化空白、多格式导出、去除透明邊框 | 付费版才有高级功能 | 專業遊戲開發、批量處理 |
| **Tiled Map Editor** | Tilemap 地圖編輯 | 免費開源、專業地圖編輯、多層支持、多格式导出 | 不會自動生成 tileset | 已有 tileset、需設計地圖 |
| **Aseprite** | 像素藝術 + Sprite Sheet | 專為像素風格、動畫編輯、便宜（$20） | 主要用於像素風格 | 像素風格遊戲、動畫編輯 |
| **SpriteForge** | 線上 Sprite Sheet 工具 | 免費線上、簡單易用、拖放操作 | 功能較簡單 | 快速處理、不想安裝軟體 |

### B. 推薦選擇

| 求 | 推薦工具 |
|------|---------|
| **專業遊戲開發** | TexturePacker（自動優化、多格式导出） |
| **已有 tileset，需設計地圖** | Tiled Map Editor（免費、專業地圖編輯） |
| **像素風格遊戲** | Aseprite（像素編輯、動畫、 sprite sheet） |
| **快速簡單處理** | SpriteForge（線上免費） |
| **手動裁切設計稿** | TilesetCleaner（避開文字說明） |

### C. 最佳實踐：組合使用流程
```
設計稿（含文字說明）
↓
TilesetCleaner（手動框選、生成乾淨圖集）
↓
TexturePacker（自動優化排列、去除透明邊框）
↓
Tiled Map Editor（設計地圖、設定碰撞）
↓
遊戲引擎渲染
```

### D. TexturePacker 設定建議
```
Algorithm: MaxRects（最小空白）
Padding: 2px（避免素材相連）
Trim: Enable（去除透明邊框）
Extrude: 1px（避免渲染缝隙）
Format: JSON-Array（通用格式）
```

### E. 官網連結
- **TexturePacker**: https://www.codeandweb.com/texturepacker
- **Tiled Map Editor**: https://www.mapeditor.org/
- **Aseprite**: https://www.aseprite.org/
- **SpriteForge**: https://spriteforge.com/

## 16. 視野遮罩系統

### A. 系統概述
玩家周圍清晰可見，視野外深色模糊，營造戰爭迷霧效果。

### B. 實作方式
- **遮罩範圍**：玩家位置為中心，半徑可調整
- **渲染順序**：所有遊戲物件 → 視野遮罩（最後繪製）
- **模糊效果**：視野外區域降低透明度 + 深色覆蓋

### C. 技術實作
```javascript
// visibilityMask.js
class VisibilityMask {
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = 200;  // 可視半徑
    }
    
    draw(ctx, playerX, playerY) {
        ctx.save();
        
        // 繪製遮罩（視野外深色）
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 清除玩家周圍區域（可視範圍）
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(playerX, playerY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
```

## 17. 成就系統

### A. 成就列表（19個）

| 成就名稱 | 觸發條件 | 描述 |
|---------|---------|------|
| 首殺 | 擊殺 1隻敵人 | 第一次擊殺敵人 |
| 百殺 | 擊殺 100隻敵人 | 擊殺100隻敵人 |
| 千殺 | 擊殺 1000隻敵人 | 擊殺1000隻敵人 |
| 存活時間 5分 | 存活 5分鐘 | 存活5分鐘 |
| 存活時間 10分 | 存活 10分鐘 | 存活10分鐘 |
| 存活時間 20分 | 存活 20分鐘 | 存活20分鐘 |
| Boss擊殺 1 | 擊殺 1隻Boss | 第一次擊殺Boss |
| Boss擊殺 5 | 擊殺 5隻Boss | 擊殺5隻Boss |
| Boss擊殺 10 | 擊殺 10隻Boss | 擊殺10隻Boss |
| 波次 5 | 完成第5波 | 完成第5波 |
| 波次 10 | 完成第10波 | 完成第10波 |
| 波次 20 | 完成第20波 | 完成第20波 |
| 等級 5 |達到等級5 |達到等級5 |
| 等級 10 |達到等級10 |達到等級10 |
| 等級 20 |達到等級20 |達到等級20 |
| 游戲次数 10 | 游玩 10次 | 游玩10次 |
| 游戲次数 50 | 游玩 50次 | 游玩50次 |
| 地狱模式存活 5分 | 地狱模式存活 5分鐘 |地狱模式存活5分鐘 |
| 地狱模式波次 10 | 地狱模式完成第10波 |地狱模式完成第10波 |

### B. 成就顯示
- **位置**：遊戲結束畫面
- **新成就標記**：金色標籤 + ⭐ 符號
- **通知動畫**：達成成就時彈出通知（2秒後消失）

### C. 技術實作
```javascript
// achievement.js
class Achievement {
    constructor(storage) {
        this.storage = storage;
        this.achievements = this.initAchievements();
    }
    
    check(type, value) {
        const achievement = this.achievements.find(a => 
            a.type === type && value >= a.threshold
        );
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.showNotification(achievement);
            this.storage.saveAchievements(this.achievements);
        }
    }
}
```

## 18. 排行榜系統

### A. 排行榜功能
- **TOP 10 排行榜**：顯示前10名最高成绩
- **預設關閉**：点击按钮展開
- **排序依據**：存活時間 + 等級 + 擊殺數

### B. 排行榜顯示
| 排名 | 等級 | 存活時間 | 擊殺數 | Boss擊殺 |
|------|------|---------|-------|---------|
| 1 | Lv.20 | 20分30秒 | 500 | 5 |
| 2 | Lv.15 | 15分20秒 | 300 | 3 |
| ... | ... | ... | ... | ... |

### C. 技術實作
```javascript
// storage.js
class StorageManager {
    getLeaderboard() {
        const records = this.getAllRecords();
        return records
            .sort((a, b) => b.time - a.time || b.level - a.level)
            .slice(0, 10);
    }
}
```

## 19. 階段性難度系統

### A. 难度模式

| 难度 | 敵人生成速度 | 敵人血量倍率 | 敵人傷害倍率 | 描述 |
|------|-------------|-------------|-------------|------|
| **普通** | 1.0x | 1.0x | 1.0x | 預設難度 |
| **困難** | 1.5x | 1.5x | 1.5x | 敵人更快更強 |
| **地狱** | 2.0x | 2.0x | 2.0x | 极限挑戰 |

### B. 难度選擇
- **位置**：遊戲開始畫面
- **按鈕**：三個難度選項（普通/困難/地狱）
- **標籤**：地狱模式標記 🔥 符號

### C. 技術實作
```javascript
// game.js
class Game {
    constructor(canvas, difficulty = 'normal') {
        this.difficulty = difficulty;
        this.setDifficultyParams();
    }
    
    setDifficultyParams() {
        switch (this.difficulty) {
            case 'hard':
                this.spawnRateMultiplier = 1.5;
                this.hpMultiplier = 1.5;
                this.damageMultiplier = 1.5;
                break;
            case 'hell':
                this.spawnRateMultiplier = 2.0;
                this.hpMultiplier = 2.0;
                this.damageMultiplier = 2.0;
                break;
            default:
                this.spawnRateMultiplier = 1.0;
                this.hpMultiplier = 1.0;
                this.damageMultiplier = 1.0;
        }
    }
}
```

## 20. 敵人類型擴展

### A. 精英敵人 (Elite)
*   **外觀**：金色光環 + 藍色護盾（需先破盾才能傷害本體）。
*   **屬性**：血量 5、速度 60px/秒、傷害 15、經驗值 50。
*   **護盾**：藍色護盾（HP 20），護盾破碎特效（藍色碎片爆散）。
*   **出現時間**：90秒後開始出現。

### B. 分裂敵人 (Split)
*   **外觀**：綠色圓形怪物 + 分裂標記。
*   **屬性**：血量 2、速度 70px/秒、傷害 10、經驗值 20。
*   **特殊**：死亡時分裂成2個小型敵人（半徑 10px），觸發周圍80px內分裂敵人鏈式分裂。
*   **分裂特效**：綠色光環擴散 + 粒子爆散。
*   **出現時間**：120秒後開始出現。

### C. 爆炸敵人 (Explosive)
*   **外觀**：橙色圓形怪物 + 爆炸標記。
*   **屬性**：血量 1、速度 50px/秒、傷害 5（爆炸傷害 30）、經驗值 15。
*   **特殊**：死亡時對範圍內玩家造成爆炸傷害（範圍 60px）。
*   **出現時間**：150秒後開始出現。

### D.隱形敵人 (Invisible)
*   **外觀**：半透明灰色怪物，受擊後短暫現形閃爍。
*   **屬性**：血量 2、速度 80px/秒、傷害 12、經驗值 25。
*   **特殊**：初始半透明（alpha 0.3），受擊後現形（alpha 1.0）1秒。
*   **出現時間**：180秒後開始出現。

### E. 敵人類型權重系統
根據遊戲時間動態調整各類型出現機率（詳見 waveManager.js）。

## 21. 护盾系統規格

### A. 系統概述
玩家擁有藍色護盾，可吸收傷害。護盾歸零後才能傷害本體 HP。

### B. 护盾属性
- **初始护盾**：0（需透過天賦「护盾强化」獲得）
- **护盾上限**：50（可透過天賦提升）
- **护盾回復**：休息時間自動回復至满值

### C. 护盾 UI
- **位置**：HP 條上方
- **顏色**：藍色半透明
- **顯示**：「护盾: 20/50」
- **护盾歸零**：半透明顯示（提示護盾已失效）

### D. 护盾變化
- **护盾吸收傷害**：UI 即時更新
- **护盾恢復**：休息時間自動回復，UI 即時更新

### E. 技術實作
```javascript
// player.js
class Player {
    constructor(x, y) {
        this.shield = 0;
        this.maxShield = 50;
    }
    
    takeDamage(damage) {
        if (this.shield > 0) {
            const shieldDamage = Math.min(damage, this.shield);
            this.shield -= shieldDamage;
            damage -= shieldDamage;
        }
        this.hp -= damage;
    }
    
    recoverShield() {
        if (this.shield < this.maxShield) {
            this.shield = this.maxShield;
        }
    }
}
```

## 22. 技能狀態顯示系統

### A. 技能狀態 UI
- **位置**：畫面左上方
- **顯示內容**：已升級技能（未升級不顯示）
- **格式**：圖示 + 技能名稱 + 數值

### B. 技能冷卻 UI
- **位置**：右上角
- **顯示內容**：Q键终极技能狀態
- **格式**：「Q技能: 就緒」或「Q技能: 冷卻 15秒」
- **冷卻時間**：30秒

### C. 技術實作
```javascript
// ui.js
class UI {
    drawSkills(ctx, player) {
        const skills = player.getUpgradedSkills();
        ctx.font = '16px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('已升級技能:', 10, 30);
        
        skills.forEach((skill, i) => {
            ctx.fillText(`${skill.icon} ${skill.name}: ${skill.value}`, 10, 50 + i * 20);
        });
    }
    
    drawSkillCooldown(ctx, player) {
        const cooldown = player.skillCooldown;
        const status = cooldown > 0 ? `冷卻 ${cooldown.toFixed(1)}秒` : '就緒';
        ctx.fillText(`Q技能: ${status}`, this.canvas.width - 120, 30);
    }
}
```

## 23. 重構後的物件架構

### A. Player 拆分（組合模式）

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

### B. Enemy 拆分（組合模式）

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
**職責**：繪製敵人外觀（240行繪製邏輯，支援 9種敵人類型）
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

## 24. 调试機制完善

### A. DebugOverlay 功能

| 功能 | 熱鍵 | 描述 |
|------|------|------|
| **開啟調試** | Ctrl+D |顯示 Grid、fireCooldown、警告 |
| **FPS顯示** | Ctrl+D |顯示 FPS、Memory、實體數量 |
| **硬斷言** | Ctrl+Shift+V |啟用 GameValidator 檢查 |

#### DebugOverlay顯示內容
- **Grid 狀態**：格子數、實體數、⚠ Grid空警告
- **Player 狀態**：fireCooldown、canFire、⚠ 冷卻未更新警告
- **FPS/Memory**：FPS數值、Memory使用量、⚠ FPS過低警告
- **實體統計**：P（玩家）、E（敵人）、Exp（經驗球）、EP（投射物）、DN（傷害數字）

### B. GameLogger 日誌等級切換

| 等級 | 熱鍵 | 描述 |
|------|------|------|
| **ERROR** | Ctrl+Shift+L | 只顯示錯誤 |
| **INFO** | Ctrl+Shift+L |顯示重要資訊 + 錯誤 |
| **DEBUG** | Ctrl+Shift+L |顯示所有日誌（包含每個Phase） |

#### 日誌內容
- **Phase 日誌**：每個 Phase 的執行狀態
- **關鍵變數**：Grid 實體數、fireCooldown、projectiles數量
- **錯誤警告**：Grid空、冷卻未更新、敵人過多

### C. GameValidator 硬斷言

| 檢查項目 | 描述 | 錯誤訊息 |
|---------|------|---------|
| **validatePhase1** | Grid 實體數 = 敵人數 | Phase 1失敗：Grid實體數 ≠ 敵人數 |
| **validatePhase2** | fireCooldown 已減少 | Phase 2失敗：fireCooldown未減少 |
| **validatePhase3** | getNearby返回非空陣列 | Phase 3失敗：碰撞檢測失效 |

### D. ObjectPool 統計

| 功能 | 熱鍵 | 描述 |
|------|------|------|
| **統計顯示** | Ctrl+Shift+P |顯示 ObjectPool 使用率、峰值、命中率 |

#### ObjectPool 統計內容
- **peakActiveCount**：峰值使用量
- **hitRate**：命中率（reuse /total requests）
- **efficiency**：效率（active / poolSize）
- **autoExpansions**：自動扩容次數

## 25. 檔案結構（更新版）
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
│   ├── enemyRenderer.js    # 敵人繪製（240行，9種敵人）
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
│   ├── tileManager.js      # Tileset 管理器（待圖集裁切完成後使用）
│   ├── tilesetCleaner.js   # Tileset 清理工具
│   ├── bossSpawnEffect.js  # Boss 出場特效
│   ├── bossDeathEffect.js  # Boss 死亡特效
│   ├── shieldBreakEffect.js# 精英護盾破碎特效
│   ├── splitEffect.js      # 分裂敵人分裂特效
│   └── utils.js            # 工具函數（含 distanceSquared）
├── PRD.md                  # 產品需求文件
├── TILESET_GUIDE.md        # Tileset 使用指南
├── TILESET_FIX_GUIDE.md    # Tileset 問題解決方案
├── REFACTOR_PLAN.md        # 重構計畫（已完成）
├── CHANGELOG.md            # 更新日誌
├── README.md               # 專案說明
└── .agent_task_state.md    # 任務狀態快照
```