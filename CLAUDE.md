@.claude/skills/using-superpowers/SKILL.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概覽

純 JavaScript + HTML5 Canvas 的類倖存者 (Survivor-like) 網頁遊戲。無打包工具、無框架 — ES Modules 直接透過 `<script type="module">` 在瀏覽器載入 (`index.html` → `js/main.js`)。所有程式碼皆為繁體中文註解與命名風格。

## 常用指令

```bash
npm run dev          # 啟動靜態伺服器 (npx serve .)，瀏覽器開 http://localhost:3000
npm test             # 執行 Vitest 單元測試 (run 模式，跑完即退出)
npm run test:watch   # Vitest watch 模式

# 執行單一測試檔
npx vitest run tests/utils.test.js

# 執行單一測試案例 (by 名稱片段)
npx vitest run -t "計算兩點間歐氏距離"
```

Vitest 設定見 `vitest.config.js` (`globals: true`, `environment: 'node'`)。測試檔位於 `tests/`，目前涵蓋 `utils.js`、`talent.js`、`objectPool.js`。

注意：本專案**沒有** Lint/Format 工具設定 (無 ESLint/Biome/Prettier)。全域 CLAUDE.md 中提及的 Pint/Biome 不適用於此專案。

## 架構：Update Loop 四階段 (核心慣例)

`js/game.js` 的 `update(dt)` 嚴格遵循四個 Phase，**順序不可顛倒、不可跳過**。詳見 `docs/AGENT_GUIDELINES.md`。

| Phase | 職責 | 關鍵呼叫 |
|-------|------|---------|
| 1. 清理與準備 | 清空 `enemyGrid` 並重新插入所有敵人 | `enemyGrid.clear()` → `enemyGrid.insert(enemy)` |
| 2. 狀態更新 | 依序更新 player / enemy / projectile 狀態 | `player.update()` 必須在 `autoFire()` 之前 |
| 3. 系統邏輯 | 自動射擊、碰撞檢測、清理死亡實體 | `autoFire()` → `checkCollisions(dt)` |
| 4. UI 更新 | 特效、傷害數字、連殺顯示、UI 同步 | `explosion.update()`、`chainKillDisplay.update()` |

### 必避免的歷史 Bug 模式

`docs/AGENT_GUIDELINES.md` §5 記錄了三個曾發生過的回歸 Bug，修改 Update Loop 時務必警覺：

1. **變數使用前未定義**：`chainKills`曾被在第 448 行引用、第 456 行才定義，導致 `ReferenceError` 中斷整個遊戲循環。
2. **`enemyGrid` 未每幀重建**：`getNearby()` 會回傳空陣列，子彈永遠打不到敵人。Phase 1 必須 `clear() + insert()`。
3. **`player.update()` 未被呼叫**：`fireCooldown` 不會減少，`canFire()` 永遠為 false，主角只會開火一次就停擺。

## 架構：Player / Enemy 組合模式

`Player` 與 `Enemy` 採組合模式拆分，以保持單一職責並讓單元測試更容易：

- **Player** = `PlayerCore` (位置/移動) + `PlayerCombat` (射擊/技能) + `PlayerRenderer` (繪製)
- **Enemy** = `EnemyCore` (位置/移動) + `EnemyBehaviors` (射擊/分裂/隱形) + `EnemyRenderer` (9 種敵人外觀) + 可選 `BossPhaseManager` (Boss 多階段)

組合類別 (`Player.js`、`Enemy.js`) 透過 Getter/Setter 暴露子模組屬性，**保持向後相容的對外介面** — 外部呼叫者不需要知道拆分細節。修改時注意：在組合類別加上新的 getter 時，記得 delegating 到正確的子模組。

## 效能優化層

- **`spatialGrid.js`**：碰撞檢測的空間分割 (cell size 100)，必須每幀 Phase 1 重建。
- **`objectPool.js`**：GC 壓力優化，物件重啟用透過 `_active` 旗標而非 `indexOf`。`game.js` 同時管理多個 pool (`projectilePool`、`explosionPool`、`bossSpawnPool`、`shieldBreakPool`、`bossDeathPool`、`splitEffectPool`)。

## Debug 工具 (開發驗證用)

修改遊戲邏輯後建議在瀏覽器中驗證，可利用以下熱鍵：

| 熱鍵 | 功能 |
|------|------|
| `Ctrl+D` | DebugOverlay：顯示 Grid / fireCooldown / FPS / Memory / 實體計數 (P/E/Exp/EP/DN) |
| `Ctrl+Shift+V` | GameValidator：Phase 1-3 硬斷言 |
| `Ctrl+Shift+L` | 循環切換 GameLogger 等級 (ERROR → INFO → DEBUG) |
| `Ctrl+Shift+P` | ObjectPool 統計 (hit rate / peak / efficiency) |

DebugOverlay 會自動顯示 ⚠ 警告 (Grid 空、冷卻未更新、FPS 過低等)，是快速驗證 Update Loop 是否正確的第一線工具。

## 文件資源

修改前後若需要完整上下文，優先參考 `docs/`：

- `docs/PRD.md` — 遊戲設計與機制規格
- `docs/TECHNICAL_SPECS.md` — 完整模組拆分、檔案結構、Debug 機制細節
- `docs/AGENT_GUIDELINES.md` — Update Loop Checklist 與歷史 Bug 分析 (修改遊戲迴圈前必讀)
- `docs/PROJECT_STATUS.md` — 已完成功能清單與重構紀錄
- `docs/TOOL_SPECS.md` — TileManager / TilesetCleaner 工具手冊

## 慣例

- **語言**：所有使用者可見的 UI 文字、Commit 訊息、CHANGELOG、回覆內容統一使用**繁體中文** (依全域 CLAUDE.md)。
- **Git Commit**：`<type>(<scope>): <subject>` 格式，主旨與內容皆繁體中文。變更需同步更新 `CHANGELOG.md` (Keep a Changelog 格式)。提交流程須先詢問使用者核准。
- **任務狀態**：`.agent_task_state.md` 為跨對話記憶快照 (≤50 行)，啟動時靜默讀取；被詢問時以 3-bullet 閃電報回報 (🚩目標 / ✅進展 / 🚀下一步)。

## 工作模式：Claude Code (主架構師) + Pi (敏捷工兵)

本專案同時使用 Claude Code 與 pi-mono (`@earendil-works/pi-coding-agent`) 進行協作,嚴格遵守以下分工。

### 🤖 角色分工

| 角色 | 職責 |
|------|------|
| **Claude Code (主架構師)** | 跨多檔大型功能重構、複雜核心演算法與商業邏輯、深層語意理解與 codebase 檢視 |
| **Pi (敏捷工兵)** | 單檔單元測試撰寫與執行、修復 Linter/TypeScript 型別錯誤、微小 Bug 修復、本機 Bash 指令、套件安裝、簡單自動化指令碼 |

### 🔄 協作工作流 (強制紀律)

1. **無論是誰修改了代碼,完成後必須自動執行 `git status` 與 `git diff`** — 確認變更範圍
2. **進行下一個任務前,必須確認前一個工具已經將變更 commit**,或在環境中留下明確的修改紀錄 (Context)
3. **跨工具交接時,Context 必須完整** — 含任務範圍、規範要求、驗證標準

### Pi 派發指令 (pi-mono)

```bash
npx @earendil-works/pi-coding-agent --task "<任務描述>"
```

執行完畢後 Claude Code 必須檢查 `git status` + `git diff` 並向使用者匯報 Pi 的修改結果。

### Pi 適用任務 (敏捷工兵角色)

- ✅ 單一檔案的單元測試撰寫
- ✅ Linter / TypeScript 型別錯誤修復
- ✅ 微小 Bug 修復 (單檔範圍)
- ✅ 本機 Bash 指令、套件安裝、簡單自動化

### 不適用 Pi 的情境 (交回 Claude Code)

- **跨檔重構 / 新增依賴 / 修改建構設定**
- **Update Loop 四階段邏輯** (`js/game.js` 的 `update(dt)`)
- **核心演算法與商業邏輯**
- **需要技能紀律的任務** (TDD / systematic-debugging / verification-before-completion)
- **影響組合模式介面** (`Player.js` / `Enemy.js` 對外 getter/setter)

### Pi 設定檔

- 根目錄 `AGENTS.md` 為 pi-mono 與其他相容工具預設讀取的專案指令檔
- `.agents/AGENTS.md` 為其他 AI 工具 (Codex/Cursor) 用,內容為 superpowers 技能導覽,與 pi-mono 不衝突

### 附錄:pi.dev 舊版實測經驗 (非 pi-mono)

> ⚠️ 本節為 2026-07-11 使用 **pi.dev** (`pi` CLI, obra 開發,`bailian` provider + `minimax-m3` model) 的實測經驗。**pi-mono (`@earendil-works/pi-coding-agent`) 是不同工具**,以下結論不一定適用,僅供參考。

5 輪測試 (v1~v5) 結果:

| 測試 | 任務 | echo 進度 | 主任務 |
|------|------|----------|--------|
| v1 (只寫 AGENTS.md) | 4 步純讀 | ❌ 失敗 | N/A |
| v2 (`--append-system-prompt`) | 4 步純讀 | ✅ 4 步齊全 | ✅ |
| v3 | objectPool.js 169 行 JSDoc | ❌ | ✅ (中止時剛好完成) |
| v4 + `@typedef` | talent.js 24 行 | ❌ | ❌ timeout 130s |
| v5 簡化 | talent.js 24 行 | ❌ | ❌ timeout 200s |

**pi.dev 結論**:在本機 minimax-m3 model 下,JSDoc 補註任務成功率 20% (1/5),不適合穩定生產。**pi-mono 是否更穩定需另行實測**。

通用教訓 (跨工具適用):

- **stdout/log 不可信** — 無論 pi.dev 或 pi-mono,agent stdout 可能被緩衝,中止即遺失。**唯一可靠進度來源是檔案系統** (`git status` + `git diff`)
- **派發後耐心等 timeout,不中途判斷卡住**
- **`AGENTS.md` 是軟性規範,不能依賴 agent 自動遵守進度回報**

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
