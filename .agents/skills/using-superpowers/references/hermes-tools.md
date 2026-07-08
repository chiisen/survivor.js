# Hermes Agent 工具對映

技能使用 Claude Code 的工具名稱。當你在技能中遇到這些工具時，使用你平臺的等價工具：

| 技能中引用的工具 | Hermes Agent 等價工具 |
|-----------------|----------------------|
| `Read`（讀取檔案） | `read_file` |
| `Write`（建立檔案） | `write_file` |
| `Edit`（編輯檔案） | `patch` |
| `Bash`（執行命令） | `terminal` |
| `Grep`（搜尋檔案內容） | `search_files` |
| `Glob`（按名稱搜尋檔案） | `search_files` |
| `Skill` 工具（呼叫技能） | `skill_view` |
| `WebFetch` | `web_extract` |
| `WebSearch` | `web_search` |
| `Task` 工具（分派子智慧體） | `delegate_task` |
| 多個 `Task` 呼叫（並行） | 多個 `delegate_task` 呼叫 |
| `TodoWrite`（任務跟蹤） | `todo` |
| `EnterPlanMode` / `ExitPlanMode` | 無等價工具 — 留在主會話中 |

## 技能管理

Hermes Agent 使用三級漸進式技能載入：

| 操作 | 工具 |
|------|------|
| 列出所有可用技能 | `skills_list` |
| 檢視技能完整內容 | `skill_view(name)` |
| 檢視技能的引用檔案 | `skill_view(name, path)` |
| 管理技能（安裝/更新） | `skill_manage` |

## 額外的 Hermes Agent 工具

| 工具 | 用途 |
|------|---------|
| `memory` | 持久化知識供未來會話使用 |
| `session_search` | 搜尋歷史會話記錄 |
| `execute_code` | 在沙箱中執行程式碼 |
| `process` | 後臺程序管理 |
| `vision_analyze` | 影像分析 |
| `image_generate` | 影像生成 |
| `clarify` | 向用戶提出澄清性問題 |
| `browser_*` | 瀏覽器自動化工具集 |
| `mixture_of_agents` | 多智慧體高階推理 |
