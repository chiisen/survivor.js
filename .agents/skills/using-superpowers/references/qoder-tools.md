# Qoder 工具對映

Skills 使用 Claude Code 的工具名稱。Qoder（阿里 AI IDE）大部分工具與 Claude Code **同名**，只有少數差異：

| Skill 中的引用 | Qoder 等價工具 |
|---------------|---------------|
| `Read` / `Write` / `Edit` | 同名（`Read` / `Write` / `Edit`） |
| `Bash` | 同名 |
| `Grep` / `Glob` | 同名 |
| `Task`（派遣子 agent） | 同名（`Task`） |
| `WebFetch` / `WebSearch` | 同名 |
| `AskUserQuestion` | 同名 |
| `Skill` | 同名 |
| `TodoWrite` | 同名 |
| `EnterPlanMode` / `ExitPlanMode` | **`EnterSpecMode` / `ExitSpecMode`**（Qoder 把"計劃模式"稱為"Spec 模式"）|

## Task 子 Agent 型別

| Claude Code Agent | Qoder 等價 |
|------------------|-----------|
| `general-purpose` | `general-purpose` |
| `Explore` | `explore-agent` |
| `Plan` | `plan-agent` |
| `claude-code-guide` | `qoder-guide` |

Qoder 額外有 `browser-agent`、`code-reviewer`、`design-agent` 等專用 agent，依任務匹配選用。

## Quest MCP 工具（Qoder 原生）

Qoder 內建 Quest 系統提供以下工具，Claude Code 沒有等價物，可在 skill 流程中直接呼叫：

| 工具 | 用途 |
|------|------|
| `mcp__quest__search_codebase` | 語義化程式碼搜尋（按意圖找程式碼） |
| `mcp__quest__search_symbol` | 按符號名搜尋程式碼及關係 |
| `mcp__quest__get_problems` | 獲取檔案編譯/語法錯誤 |
| `mcp__quest__run_preview` | 啟動本地 Web 伺服器預覽 |
| `mcp__quest__search_memory` / `update_memory` | 跨會話記憶管理 |
| `mcp__quest__fetch_rules` | 查詢規則檔案 |

## 載入方式

Qoder 在每個會話自動載入 `.qoder/rules/superpowers-zh.md`（`trigger: always_on`），裡面包含 skill 索引。`.qoder/skills/<name>/SKILL.md` 由模型按 description 自主呼叫，也可輸入 `/<skill-name>` 手動觸發。
