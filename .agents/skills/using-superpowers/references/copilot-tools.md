# Copilot CLI 工具對映

技能使用 Claude Code 的工具名稱。當你在技能中遇到這些工具時，使用你平臺的等價工具：

| 技能中引用的工具 | Copilot CLI 等價工具 |
|-----------------|----------------------|
| `Read`（讀取檔案） | `view` |
| `Write`（建立檔案） | `create` |
| `Edit`（編輯檔案） | `edit` |
| `Bash`（執行命令） | `bash` |
| `Grep`（搜尋檔案內容） | `grep` |
| `Glob`（按名稱搜尋檔案） | `glob` |
| `Skill` 工具（呼叫技能） | `skill` |
| `WebFetch` | `web_fetch` |
| `Task` 工具（分派子智慧體） | `task`（參見[智慧體型別](#智慧體型別)） |
| 多個 `Task` 呼叫（並行） | 多個 `task` 呼叫 |
| Task 狀態/輸出 | `read_agent`、`list_agents` |
| `TodoWrite`（任務跟蹤） | `sql` 配合內建 `todos` 表 |
| `WebSearch` | 無等價工具 — 使用 `web_fetch` 配合搜尋引擎 URL |
| `EnterPlanMode` / `ExitPlanMode` | 無等價工具 — 留在主會話中 |

## 智慧體型別

Copilot CLI 的 `task` 工具接受 `agent_type` 引數：

| Claude Code 智慧體 | Copilot CLI 等價 |
|-------------------|----------------------|
| `general-purpose` | `"general-purpose"` |
| `Explore` | `"explore"` |
| 命名的外掛智慧體（如 `superpowers:code-reviewer`） | 從已安裝的外掛中自動發現 |

## 非同步 Shell 會話

Copilot CLI 支援持久化的非同步 shell 會話，這在 Claude Code 中沒有直接等價物：

| 工具 | 用途 |
|------|---------|
| `bash` 配合 `async: true` | 在後臺啟動長時間執行的命令 |
| `write_bash` | 向執行中的非同步會話傳送輸入 |
| `read_bash` | 讀取非同步會話的輸出 |
| `stop_bash` | 終止非同步會話 |
| `list_bash` | 列出所有活躍的 shell 會話 |

## 額外的 Copilot CLI 工具

| 工具 | 用途 |
|------|---------|
| `store_memory` | 持久化程式碼庫相關事實供未來會話使用 |
| `report_intent` | 更新 UI 狀態行顯示當前意圖 |
| `sql` | 查詢會話的 SQLite 資料庫（待辦、後設資料） |
| `fetch_copilot_cli_documentation` | 查閱 Copilot CLI 文件 |
| GitHub MCP 工具（`github-mcp-server-*`） | 原生 GitHub API 訪問（issue、PR、程式碼搜尋） |
