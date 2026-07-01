# 經驗值隨等級加權 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在擊殺敵人時計算經驗值時加入 `1.5^(level-1)` 等級倍率，補償敵人 HP 隨等級線性放大的擊殺耗時，使每級所需擊殺數維持 ~10 不變。

**Architecture:** 新增純函式 `getExpLevelMultiplier(level, growthRate)` 到 `js/utils.js` (可單元測試)，再於 `Game` 類別加一個 `calculateExpValue(baseExpValue, bonus)` helper method 包裝它，最後把 `game.js` 中 3 處 kill-time 經驗計算改用 helper。撿取時間與分裂 spawn 不動作以避免 double-count。重用既有 `this.expGrowthRate = 1.5` 常數。

**Tech Stack:** 純 JavaScript (ES Modules)、Vitest 4.x、HTML5 Canvas。

**對應 Spec:** `docs/superpowers/specs/2026-07-01-exp-level-scaling-design.md`

---

## 檔案結構

| 檔案 | 異動 | 職責 |
|------|------|------|
| `js/utils.js` | 新增 `getExpLevelMultiplier` 函式 | 純粹的等級倍率計算，無副作用 |
| `tests/utils.test.js` | 新增 `getExpLevelMultiplier` 測試區塊 | 驗證倍率公式 |
| `js/game.js` | 新增 import、新增 `calculateExpValue` method、修改 3 處 kill path | 整合等級倍率到經驗值管線 |
| `CHANGELOG.md` | 新增條目 | 記錄變更 |

---

## Task 1: 新增 `getExpLevelMultiplier` 工具函式 (TDD)

**Files:**
- Modify: `js/utils.js` (檔尾新增)
- Modify: `tests/utils.test.js` (新增 import 與 describe 區塊)

- [ ] **Step 1: 在 `tests/utils.test.js` 新增 import**

修改檔案開頭的 import (第 2-5 行)：

```js
import {
    distance, distanceSquared, normalize, randomRange, randomInt,
    formatTime, clamp, lerp, getExpLevelMultiplier
} from '../js/utils.js';
```

- [ ] **Step 2: 在 `tests/utils.test.js` 檔尾 (最後的 `});` 之前) 新增測試區塊**

```js
    describe('getExpLevelMultiplier', () => {
        it('L1 = 1 (無加成)', () => {
            expect(getExpLevelMultiplier(1)).toBe(1);
        });

        it('L5 = 1.5^4 = 5.0625', () => {
            expect(getExpLevelMultiplier(5)).toBeCloseTo(5.0625, 5);
        });

        it('L10 = 1.5^9 ≈ 38.4434', () => {
            expect(getExpLevelMultiplier(10)).toBeCloseTo(38.4434, 4);
        });

        it('自訂 growthRate 正確套用', () => {
            expect(getExpLevelMultiplier(3, 2)).toBe(4); // 2^(3-1) = 4
        });

        it('L0 不會崩潰 (level-1 = -1)', () => {
            // 雖然遊戲中不會出現 L0，但純函式應有定義行為
            // 1.5^(-1) = 2/3 ≈ 0.6667
            expect(getExpLevelMultiplier(0)).toBeCloseTo(2 / 3, 4);
        });
    });
```

- [ ] **Step 3: 執行測試，確認失敗 (函式尚未定義)**

```bash
npx vitest run tests/utils.test.js
```

**Expected**: FAIL，錯誤訊息含 `getExpLevelMultiplier is not a function` 或 import 失敗。

- [ ] **Step 4: 在 `js/utils.js` 檔尾新增函式**

```js
export function getExpLevelMultiplier(level, growthRate = 1.5) {
    return Math.pow(growthRate, level - 1);
}
```

- [ ] **Step 5: 執行測試，確認通過**

```bash
npx vitest run tests/utils.test.js
```

**Expected**: PASS，所有 `getExpLevelMultiplier` 測試通過，既有的 utils 測試也全部維持綠燈。

- [ ] **Step 6: Commit**

依使用者全域 CLAUDE.md 規範，先詢問「是否開始 Git 提交流程？」核准後執行：

```bash
git add js/utils.js tests/utils.test.js
git commit -m "$(cat <<'EOF'
feat(utils): 新增 getExpLevelMultiplier 等級倍率工具函式

新增純函式計算 1.5^(level-1) 倍率，供經驗值系統隨玩家等級加權使用。
單元測試覆蓋 L1/L5/L10 預設成長率與自訂 growthRate 行為。
EOF
)"
```

---

## Task 2: 在 Game 類別加入 `calculateExpValue` helper

**Files:**
- Modify: `js/game.js:16` (import 行)
- Modify: `js/game.js` (新增 method — 建議放在 `getChainKillExpBonus` 旁邊，約第 935 行附近)

- [ ] **Step 1: 修改 `js/game.js:16` 的 import**

修改前：
```js
import { distance, distanceSquared } from './utils.js';
```

修改後：
```js
import { distance, distanceSquared, getExpLevelMultiplier } from './utils.js';
```

- [ ] **Step 2: 在 Game 類別中加入 `calculateExpValue` method**

建議放在 `getChainKillExpBonus` (約第 935 行) 之前。完整 method：

```js
    calculateExpValue(baseExpValue, bonus = 0) {
        const levelMult = getExpLevelMultiplier(this.level, this.expGrowthRate);
        return Math.floor(baseExpValue * levelMult * (1 + bonus));
    }
```

- [ ] **Step 3: 執行全部測試確認無回歸**

```bash
npm test
```

**Expected**: 全部 PASS (utils、talent、objectPool)。Game 類別的 method 雖然沒有單元測試 (需要 DOM/canvas)，但透過 Task 3 的修改與最終手動 playtest 驗證。

- [ ] **Step 4: 暫不 commit**

Task 2 + Task 3 + Task 4 (CHANGELOG) 會合併為一次 commit，符合專案既有風格 (如 `feat(balance): 實作升級獎勵、動態難度平衡與波次難度優化`)。

---

## Task 3: 改寫 3 處 kill-time 經驗計算

**Files:**
- Modify: `js/game.js:642` (投射物擊殺)
- Modify: `js/game.js:662` (連鎖擊殺)
- Modify: `js/game.js:968` (Q 技能擊殺)

- [ ] **Step 1: 修改第 642 行 — 投射物擊殺**

搜尋 (第 640-643 行)：
```js
        let chainKills = 1;
        const chainKillExpBonus = this.getChainKillExpBonus(chainKills);
        const expValue = Math.floor(enemy.expValue * (1 + chainKillExpBonus));
        this.spawnExpOrbs(enemy.x, enemy.y, expValue);
```

改為：
```js
        let chainKills = 1;
        const chainKillExpBonus = this.getChainKillExpBonus(chainKills);
        const expValue = this.calculateExpValue(enemy.expValue, chainKillExpBonus);
        this.spawnExpOrbs(enemy.x, enemy.y, expValue);
```

- [ ] **Step 2: 修改第 662 行 — 連鎖擊殺**

搜尋 (第 661-663 行)：
```js
                const nearbyExpBonus = this.getChainKillExpBonus(chainKills + 1);
                const nearbyExpValue = Math.floor(nearbyEnemy.expValue * (1 + nearbyExpBonus));
                this.expOrbs.push(new ExperienceOrb(nearbyEnemy.x, nearbyEnemy.y, nearbyExpValue));
```

改為：
```js
                const nearbyExpBonus = this.getChainKillExpBonus(chainKills + 1);
                const nearbyExpValue = this.calculateExpValue(nearbyEnemy.expValue, nearbyExpBonus);
                this.expOrbs.push(new ExperienceOrb(nearbyEnemy.x, nearbyEnemy.y, nearbyExpValue));
```

- [ ] **Step 3: 修改第 968 行 — Q 技能擊殺**

搜尋 (第 967-969 行)：
```js
            if (enemy.hp <= 0) {
                const expValue = Math.floor(enemy.expValue * (1 + this.player.expBonus));
                this.expOrbs.push(new ExperienceOrb(enemy.x, enemy.y, expValue));
```

改為：
```js
            if (enemy.hp <= 0) {
                const expValue = this.calculateExpValue(enemy.expValue, this.player.expBonus);
                this.expOrbs.push(new ExperienceOrb(enemy.x, enemy.y, expValue));
```

- [ ] **Step 4: 確認 3 處都已替換 (不可遺漏)**

```bash
grep -n "expValue \* (1 +" js/game.js
```

**Expected**: **無任何匹配** (空輸出)。

說明：grep pattern 為 `expValue * (1 +`，第 469 行 (撿取時間) 用的是 `orb.value * (1 + ...)` 不會被匹配。若仍有匹配，代表第 642 / 662 / 968 行有任一處未替換完成，需回到前面 Step 補上。

可用下述指令進一步確認撿取時間 (第 469 行) 確實保留原邏輯：

```bash
grep -n "orb.value \* (1 +" js/game.js
```

**Expected**: 第 469 行出現且只有這一處。

- [ ] **Step 5: 執行全部測試確認無回歸**

```bash
npm test
```

**Expected**: 全部 PASS。

- [ ] **Step 6: 暫不 commit**

併入 Task 4 一起 commit。

---

## Task 4: 更新 CHANGELOG 並提交

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: 在 `CHANGELOG.md` 的 `[Unreleased] / 新增` 段落開頭加入條目**

定位：找到 `## [Unreleased]` → 下方第一個 `### 新增` → 在現有條目最上方加入 (維持由新到舊)：

```markdown
- **經驗值等級加權**：擊殺敵人獲得的經驗值現在會隨玩家等級以 `1.5^(level-1)` 倍率放大，與 `expToLevel` 升級曲線同步，補償敵人 HP 隨等級線性增加 (每級 +80%) 造成的擊殺耗時上升；每級所需擊殺數維持 ~10 不變。Boss 戰與 minion 也一併套用。
```

- [ ] **Step 2: 詢問使用者「是否開始 Git 提交流程？」**

依全域 CLAUDE.md 規範，commit 前必須取得核准。

- [ ] **Step 3: 核准後，提交 Task 2 + 3 + 4 的變更**

```bash
git add js/game.js CHANGELOG.md
git commit -m "$(cat <<'EOF'
feat(balance): 經驗值隨玩家等級加權補償敵人 HP 放大

擊殺敵人時套用 1.5^(level-1) 倍率，與 expToLevel 同步成長。
新增 Game.calculateExpValue helper 整合 3 處 kill-time 經驗計算
(投射物/連鎖/Q技能)，撿取時間與分裂 spawn 維持原邏輯避免 double-count。
EOF
)"
```

---

## Task 5: 手動 Playtest 驗證

> **注意**：單元測試只能驗證公式正確，無法驗證遊戲感受。依全域 CLAUDE.md「For UI or frontend changes」原則，需實際玩遊戲確認。

- [ ] **Step 1: 啟動 dev server**

```bash
npm run dev
```

瀏覽器開啟 `http://localhost:3000`。

- [ ] **Step 2: 玩到 Level 5 以上，觀察經驗值數字**

預期：
- L1 擊殺小怪：經驗 orb 值維持原狀 (5-15)
- L5 擊殺相同小怪：經驗 orb 值約 25-75 (× 5.06)
- L10 擊殺相同小怪：經驗 orb 值約 190-575 (× 38.4)
- 每級所需擊殺數維持 ~10 (不會後期卡等)

- [ ] **Step 3: 開啟 DebugOverlay 觀察 exp 數值**

按 `Ctrl+D` 開啟 DebugOverlay，觀察 Phase 4 日誌的 `exp` 欄位是否隨等級放大。

按 `Ctrl+Shift+L` 切換到 DEBUG 等級，觀察 phase4 日誌：
```
phase4 { kills: X, exp: Y }
```
`exp` 增量在 L5 應該明顯比 L1 大 ~5 倍。

- [ ] **Step 4: 觀察 Boss 戰升級速度**

打到第一隻 Boss (約 L5-L7)，觀察 minion 是否也吃到倍率。若 Boss 戰一波升太多級，記錄下來作為 Spec 第 5 節「後續觀察」的回饋。

- [ ] **Step 5: 若有平衡問題，回到 Spec 討論調整**

常見調整方向 (非本計畫範圍)：
- 倍率成長過快 → 改 `expGrowthRate = 1.3` 或使用平方根
- minion 太營養 → 改用 Spec 決策 B (排除 minion)

---

## 驗收標準

- [x] Task 1: `getExpLevelMultiplier` 函式存在且單元測試通過
- [x] Task 2: `calculateExpValue` method 存在且 import 正確
- [x] Task 3: `game.js` 中第 642、662、968 行都使用 helper；第 469 行維持原狀
- [x] Task 4: CHANGELOG 已更新；commit 已建立 (經使用者核准)
- [x] Task 5: 手動 playtest 確認 L5 經驗值明顯高於 L1，無回归

## 不在範圍內

- 調整 `expGrowthRate` 預設值
- 調整敵人 HP 公式或玩家 damage 公式
- 視覺化「Exp +N」浮動數字
- minion 排除邏輯 (Spec 決策 A)
- unit test for Game class (需要 DOM/canvas，依現有測試範圍處理)
