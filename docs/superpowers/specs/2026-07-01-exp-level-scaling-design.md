# 設計文件：經驗值隨等級加權

**日期**：2026-07-01
**狀態**：待實作
**動機**：補償敵人 HP 隨玩家等級線性放大 (+80%/級) 造成的擊殺時間增加，避免中後期升級曲線塌掉。

## 1. 背景與問題

### 目前經驗值系統

- **基礎值**：`enemy.expValue` 為固定值 (一般小怪 5–15、精英 minion 15、Boss 較高)
- **套用路徑**：
  - 投射物擊殺 (`game.js:642`)：`enemy.expValue × (1 + chainKillExpBonus)`
  - 連鎖擊殺 (`game.js:662`)：`nearbyEnemy.expValue × (1 + nearbyExpBonus)`
  - Q 技能擊殺 (`game.js:968`)：`enemy.expValue × (1 + player.expBonus)`
  - 撿取時 (`game.js:469`)：`orb.value × (1 + player.expBonus)` (再加天賦加成)
- **升級曲線**：`expToLevel` 起始 100，每次升級 × 1.5 (`expGrowthRate`)

### 失衡分析

| 等級 | 敵 HP 倍率 | expToLevel | 單殺 exp | 升級所需殺數 | 升級耗時 (相對 L1) |
|------|----------|-----------|---------|------------|------------------|
| L1 | 1× | 100 | 10 | 10 | 1× |
| L5 | 4.2× | 506 | 10 | ~50 | ~15× |
| L10 | 8.2× | 3,844 | 10 | ~384 | ~138× |

敵人 HP 隨等級放大，但單殺經驗固定，後期升級嚴重減速。

## 2. 設計決策

### 決策 1：倍率公式

**採用**：`exp × 1.5^(level-1)`，與 `expToLevel` 成長率同步。

| 等級 | 倍率 | 套用後單殺 exp |
|------|------|--------------|
| L1 | 1× | 10 |
| L5 | 5.06× | 51 |
| L10 | 38.4× | 384 |
| L15 | 292× | 2,919 |
| L20 | 2,219× | 22,189 |

由於倍率成長率與 `expToLevel` 完全相同，每級**所需擊殺數維持 ~10 不變**。雖然單次擊殺耗時仍會隨 HP 放大而增加，但至少不會「打半天還升不了一級」。

**未採用方案**：
- 對稱 HP 公式 `1 + (level-1) × 0.8`：升級耗時仍會成長 3–4×，補償不足。
- 平方根 `sqrt(level)`：太柔和。
- 係數可調 `1 + (level-1) × k`：保留但留待日後微調；目前先與 `expToLevel` 完全同步以避免雙曲線偏移。

### 決策 2：套用位置

僅在 **kill-time** 套用，3 個地方。**不在**撿取時間或分裂敵人 spawn 時套用。

**不在撿取時套用的原因**：orb.value 在生成時即決定，避免玩家升級後地表所有 orb 被重新計算；也避免 double-count。

**不在分裂 spawn 時套用的原因**：子敵人 `expValue` 是基礎值，會在子敵人死亡時透過 kill path 套用。先乘會造成 double-apply。

### 決策 3：Minion 範圍

**採用 A：一致套用**。所有敵人 (含 Boss 召喚的 minion、分裂敵人) 都套用 levelMult。

理由：設計簡單一致；boss 戰快速升級符合類倖存者「Boss 戰 = 進度爆發」的節奏；minion 數量有限不會變成純農場。

### 決策 4：常數重用

重用既有的 `this.expGrowthRate = 1.5` (`game.js:113`) 作為倍率成長率，未來調整一個常數即可同步改變 `expToLevel` 與 `levelMult`。

## 3. 實作規格

### 3.1 新增工具函式 (`js/utils.js`)

```js
export function getExpLevelMultiplier(level, growthRate = 1.5) {
    return Math.pow(growthRate, level - 1);
}
```

### 3.2 新增 Game 類別 helper method

```js
import { getExpLevelMultiplier } from './utils.js';

// 在 Game 類別中
calculateExpValue(baseExpValue, bonus = 0) {
    const levelMult = getExpLevelMultiplier(this.level, this.expGrowthRate);
    return Math.floor(baseExpValue * levelMult * (1 + bonus));
}
```

### 3.3 修改 3 個 kill-time 路徑

| 行號 | 修改前 | 修改後 |
|------|--------|--------|
| `game.js:642` | `Math.floor(enemy.expValue * (1 + chainKillExpBonus))` | `this.calculateExpValue(enemy.expValue, chainKillExpBonus)` |
| `game.js:662` | `Math.floor(nearbyEnemy.expValue * (1 + nearbyExpBonus))` | `this.calculateExpValue(nearbyEnemy.expValue, nearbyExpBonus)` |
| `game.js:968` | `Math.floor(enemy.expValue * (1 + this.player.expBonus))` | `this.calculateExpValue(enemy.expValue, this.player.expBonus)` |

### 3.4 不修改的位置

- `game.js:469` (撿取)：保持 `orb.value × (1 + player.expBonus)`
- `game.js:773, 818` (分裂子敵人 `expValue` 定義)：保持 fraction-of-parent
- `game.js:877, 896` (minion `expValue` 定義)：保持固定值

### 3.5 測試 (`tests/utils.test.js`)

新增 `getExpLevelMultiplier` 測試：

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
        expect(getExpLevelMultiplier(3, 2)).toBe(4); // 2^2
    });
});
```

### 3.6 CHANGELOG

於 `CHANGELOG.md` `[Unreleased] / 新增` 加入條目：

> **經驗值等級加權**：擊殺敵人獲得的經驗值現在會隨玩家等級以 `1.5^(level-1)` 倍率放大，與 `expToLevel` 升級曲線同步，補償敵人 HP 隨等級線性增加造成的擊殺時間上升；每級所需擊殺數維持 ~10 不變。

## 4. 影響範圍

| 檔案 | 異動類型 |
|------|---------|
| `js/utils.js` | 新增 `getExpLevelMultiplier` 函式 |
| `js/game.js` | 新增 import、新增 `calculateExpValue` method、修改 3 處擊殺經驗計算 |
| `tests/utils.test.js` | 新增 `getExpLevelMultiplier` 測試區塊 |
| `CHANGELOG.md` | 新增條目 |

## 5. 風險與後續觀察

- **數值膨脹視覺問題**：L15+ 時單顆 orb 經驗破千，UI 上「Exp +2919」可能顯得突兀。可於後續觀察玩家感受再決定是否格式化 (e.g. 2.9k)。
- **Boss 戰升級速度**：minion 也吃倍率，Boss 戰可能一波升好幾級。實測後若過頭，可改用決策 B (排除 minion)。
- **傷害輸出不對稱**：本設計僅補償「擊殺數 per level」，未補償「擊殺耗時」。實際升級耗時仍會隨等級緩慢增加 (約 L20 比 L1 慢 5–6×)。若需完全補償需另案調整 damage 曲線，本規格不處理。
