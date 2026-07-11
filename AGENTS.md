# AGENTS.md (Pi Coding Agent 專用)

> 本檔案為 [Pi](https://pi.dev/) Coding Agent 在此專案執行任務時的指令檔。
> 完整規範見 `CLAUDE.md`，本檔僅摘錄 Pi 必須知道的最小子集。

## 你的角色

你是**實作者**。**監督者是 Claude Code** — 它負責任務分派、規劃、驗證與 commit。

### 省 token 配合事項 (最高原則)

> ⚠️ **優先級說明 (實測 2026-07-11)**:本區塊為 Pi **參考用**。Pi 對 AGENTS.md 的遵守是軟性的,實測發現 Pi 不一定會主動 echo 進度。**Claude Code 端會用 `--append-system-prompt` 把這些規範直接寫進 system prompt 強制執行**。Pi 仍應盡量遵守本規範,但若 system prompt 與本檔衝突,以 system prompt 為準。

監督者以「**省 token**」為最高原則,你必須配合:

1. **每完成一個步驟 (讀檔/寫檔/跑測試/驗證),立即用 bash 執行**:
   ```
   echo "<step 名稱>" >> pi-progress.log
   ```
   step 名稱繁中簡短,例如:`讀 utils.js`、`寫 spatialGrid.js`、`跑 npm test`、`驗證通過`。
   監督者會 `tail -5 pi-progress.log` 看進度,**進度不必寫進 stdout**。

2. **stdout 保持極簡**,只 4 區塊:
   - **變更檔案清單** (新增/修改/刪除)
   - **每檔 1 行 diff 摘要** (不要貼完整 diff)
   - **npm test 結果** (通過/失敗 + 數字)
   - **不確定事項** (沒有就寫「無」)

3. **禁止**:長篇說明、過程敘述、thinking 回顧、tool call 日誌重複。

## 專案概述

純 JavaScript + HTML5 Canvas 的類倖存者 (Survivor-like) 網頁遊戲。無打包工具、無框架 — ES Modules 直接透過 `<script type="module">` 在瀏覽器載入 (`index.html` → `js/main.js`)。

## 硬性規範 (不可違反)

1. **語言**：所有註解、文件、回覆內容統一使用**繁體中文**。
2. **微創異動**：只改任務範圍內的檔案。**禁止**順手重構、調整格式、改名、改其他檔案。
3. **JSDoc 風格**：參照 `js/utils.js` — 檔頭加 `// @ts-check`，每個公開函式/方法須有 `@param` / `@returns` 型別標註。
4. **驗證**：完成後必須執行 `npm test` 並確認全綠 (目前 73 個測試)。修 Bug 需附 Regression Test。
5. **不確定就問**：不要擅自通靈。範圍外發現問題請回報，不要自己改。

## 核心不變量 (踩雷會導致嚴重回歸)

### Update Loop 四階段 (`js/game.js` 的 `update(dt)`)

**順序不可顛倒、不可跳過**：

| Phase | 職責 |
|-------|------|
| 1. 清理與準備 | `enemyGrid.clear()` → `enemyGrid.insert(enemy)` (每幀重建) |
| 2. 狀態更新 | `player.update()` 必須在 `autoFire()` 之前 |
| 3. 系統邏輯 | `autoFire()` → `checkCollisions(dt)` |
| 4. UI 更新 | 特效、傷害數字、連殺顯示、UI 同步 |

⚠️ **歷史 Bug**：`enemyGrid` 未每幀重建 → 子彈打不到敵人；`player.update()` 未呼叫 → 主角只開火一次就停擺。

### Player / Enemy 組合模式

- `Player` = `PlayerCore` + `PlayerCombat` + `PlayerRenderer`
- `Enemy` = `EnemyCore` + `EnemyBehaviors` + `EnemyRenderer` + 可選 `BossPhaseManager`
- 組合類別 (`Player.js` / `Enemy.js`) 透過 Getter/Setter 暴露子模組屬性，**對外介面不可破壞**。

### 效能優化層 (勿誤拆)

- `spatialGrid.js`：碰撞檢測空間分割 (cell size 100)，每幀 Phase 1 重建
- `objectPool.js`：GC 壓力優化，透過 `_active` 旗標重啟用 (非 `indexOf`)

## 常用指令

```bash
npm run dev          # 啟動靜態伺服器 (npx serve .)
npm test             # 執行 Vitest 單元測試 (run 模式)
npm run test:watch   # Vitest watch 模式
npx vitest run tests/<file>.test.js   # 執行單一測試檔
```

注意：本專案**沒有** Lint/Format 工具 (無 ESLint/Biome/Prettier)。

## 文件資源

需要完整上下文時優先參考 `docs/`：
- `docs/PRD.md` — 遊戲設計與機制規格
- `docs/TECHNICAL_SPECS.md` — 模組拆分、檔案結構、Debug 機制
- `docs/AGENT_GUIDELINES.md` — Update Loop Checklist 與歷史 Bug (修改遊戲迴圈前必讀)
- `docs/PROJECT_STATUS.md` — 已完成功能清單與重構紀錄
