# Gemini CLI 工具對映

Skills 使用 Claude Code 的工具名稱。在 Gemini CLI 中遇到這些名稱時，請使用對應的平臺等價工具：

| Skill 中的引用 | Gemini CLI 等價工具 |
|---------------|-------------------|
| `Read`（讀取檔案） | `read_file` |
| `Write`（建立檔案） | `write_file` |
| `Edit`（編輯檔案） | `replace` |
| `Bash`（執行命令） | `run_shell_command` |
| `Grep`（搜尋檔案內容） | `grep_search` |
| `Glob`（按名稱搜尋檔案） | `glob` |
| `TodoWrite`（任務跟蹤） | `write_todos` |
| `Skill` 工具（呼叫 skill） | `activate_skill` |
| `WebSearch` | `google_web_search` |
| `WebFetch` | `web_fetch` |
| `Task` 工具（派遣子 agent） | 無等價工具——Gemini CLI 不支援子 agent |

## 不支援子 Agent

Gemini CLI 沒有 Claude Code `Task` 工具的等價物。相依性子 agent 派遣的 skills（`subagent-driven-development`、`dispatching-parallel-agents`）將退化為通過 `executing-plans` 進行單會話執行。

## Gemini CLI 額外工具

以下工具在 Gemini CLI 中可用，但 Claude Code 中沒有對應工具：

| 工具 | 用途 |
|------|------|
| `list_directory` | 列出檔案和子目錄 |
| `save_memory` | 將資訊持久化到 GEMINI.md，跨會話保留 |
| `ask_user` | 向用戶請求結構化輸入 |
| `tracker_create_task` | 豐富的任務管理（建立、更新、列表、視覺化） |
| `enter_plan_mode` / `exit_plan_mode` | 切換到只讀研究模式，在修改前先調研 |
