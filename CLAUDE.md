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

## 工作模式：Claude Code (監督) + Pi (實作)

採雙 harness 分工。Claude Code 擔任監督者，不做實際 coding；Pi (pi.dev) 透過 `pi -p "..."` 接收任務並執行實作。

### 核心原則：省 token 第一

**所有 Pi 派發決策 (旗標、prompt 長度、進度觀察方式) 以最小化 token 為最高權重**,体驗/可觀測性次之。Pi 是「黑箱執行者」,Claude Code 只看**結果** (檔案 diff + 測試),不讀 Pi 過程。

### 派發流程 (省 token 版)

1. Claude Code 寫最短可行 Pi prompt (規範封裝在 `AGENTS.md`,prompt 不重複)
2. 派發指令 (核心:用 `--append-system-prompt` 強制 Pi 寫進度檔,**不靠 AGENTS.md 軟性規範**):
   ```
   pi -p -ns --approve \
     --append-system-prompt "每個工具呼叫(讀檔/寫檔/bash)完成後,立即執行 echo '<step 繁中簡短>' >> pi-progress.log" \
     "<prompt>" > pi.log 2>&1
   ```
   背景跑,stdout 丟 log,**Claude Code 不主動讀**。
3. Claude Code 用 `tail -5 pi-progress.log` 掌握進度 (~30 token/次)
4. Pi 結束後 → `git status --short` + `git diff <target>` + `npm test` 由 Claude Code 自跑驗證
5. 通過後由 Claude Code 撰寫繁中 commit (依上一節 Git Commit 規範)

### 進度觀察 (不花大量 token 的機制) — 已實測驗證 2026-07-11

Pi stdout (含 minimax-m3 內建 thinking block) 是最大 token 黑洞,**Claude Code 不讀**。改用檔案信號機制:

**機制 — 檔案信號 + `--append-system-prompt` 強制 (實測有效)**

Pi 透過 `--append-system-prompt` 被強制要求「每個工具呼叫後 echo 進度到 `pi-progress.log`」。
Claude Code 定期 `tail -5 pi-progress.log` 看進度,**每次 ~30 token**。
Pi 端每步驟成本 ~20 token (一行 echo),比完整 stdout 報告 (~幾千 token) 省 97%+。

**⚠️ 實測結論 (2026-07-11 五輪驗證)**:

| 測試 | 任務 | echo 進度 | 主任務 |
|------|------|----------|--------|
| v1 (只寫 AGENTS.md) | 4 步純讀 | ❌ 失敗 | N/A |
| v2 (`--append-system-prompt`) | 4 步純讀 | ✅ 4 步齊全 | ✅ |
| v3 (system-prompt) | objectPool.js 169 行 JSDoc | ❌ 未建立 | ✅ (中止時剛好完成) |
| v4 (system-prompt + `@typedef`) | talent.js 24 行 JSDoc | ❌ 未建立 | ❌ timeout 130s 完全沒產出 |
| v5 (system-prompt 簡化) | talent.js 24 行 JSDoc | ❌ 未建立 | ❌ timeout 200s 完全沒產出 |

**四個關鍵教訓**:

1. **AGENTS.md 對 Pi 是「參考用」**,強制行為必須靠 `--append-system-prompt`
2. **`--append-system-prompt` 在複雜任務下也不可靠** — pi-progress.log 機制僅供參考,**最終仍以 `git diff` 為真相**
3. **Pi 處理時間預估要保守**:169 行 JSDoc 約需 2-3 分鐘,1.5 分鐘中止剛好錯過完成點。**預估公式 = 任務行數 × 1 秒 + 60 秒緩衝,timeout 設預估的 1.5 倍**
4. **Pi 處理 JSDoc 補註任務不穩定** (5 次測試僅 1 次完全成功 = 20%) — 簡化 prompt 與延長 timeout 都無效,根因在 minimax-m3 model 端 (API 不穩 / 限流 / regional latency),**正式 JSDoc 工程建議由 Claude Code 自己做**

**pi.log / stdout 不可信**:

- Pi 把 stdout 緩衝到整個任務結束才一次輸出
- 中止 Pi = stdout 全部遺失 (`pi.log` 0 bytes **不代表** Pi 沒產出)
- **唯一可靠進度來源是檔案系統**:`git status --short` + `git diff <target>`
- 結論:**派發後耐心等 timeout,不要中途看 log 判斷 Pi 是否卡住**

**失敗才 debug**:

Pi 跑完後先 `git status --short` 看有沒有改動:
- **有改動** → 直接驗證,log 不讀 (省)
- **沒改動** → `cat pi.log` 付 debug token 看卡在哪

### Pi 指令必加旗標

| 旗標 | 作用 |
|------|------|
| `-ns` / `--no-skills` | 停用 superpowers 套件載入 (跟 Claude Code 技能重疊,且拖慢) |
| `--approve` | 跳過專案本地檔案信任確認 |
| `-p` / `--print` | Print mode,非互動 (不加會進 TUI) |

### 已知 Pi 環境限制 (本機設定)

- **Provider/Model**: `bailian` (直打 `api.minimax.io/v1`) / `minimax-m3`
- **minimax-m3 內建 thinking block**:`--thinking off` 無效,輸出含 `<think>...</think>`,屬正常非卡住
- **superpowers 全域套件** (`~/.pi/agent/git/github.com/obra/superpowers/`):必加 `-ns` 停用

### 不適用 Pi 的情境
- **Update Loop 四階段邏輯** (`js/game.js` 的 `update(dt)`)
- **跨檔重構 / 新增依賴 / 修改建構設定**
- **需要技能紀律的任務** (TDD / systematic-debugging / verification-before-completion)
- **影響組合模式介面** (`Player.js` / `Enemy.js` 對外 getter/setter)

### Pi 設定檔
- 根目錄 `AGENTS.md` 為 Pi 預設讀取的專案指令檔 (摘自本檔的最小子集)
- `.agents/AGENTS.md` 為其他 AI 工具 (Codex/Cursor) 用,內容為 superpowers 技能導覽,與 Pi 不衝突

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
