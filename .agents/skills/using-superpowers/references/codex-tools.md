# Codex 工具對映

Skills 使用 Claude Code 的工具名稱。在 Codex 中遇到這些名稱時，請使用對應的平臺等價工具：

| Skill 中的引用 | Codex 等價工具 |
|---------------|---------------|
| `Task` 工具（派遣子 agent） | `spawn_agent` |
| 多個 `Task` 呼叫（並行） | 多個 `spawn_agent` 呼叫 |
| Task 返回結果 | `wait` |
| Task 自動完成 | `close_agent` 釋放槽位 |
| `TodoWrite`（任務跟蹤） | `update_plan` |
| `Skill` 工具（呼叫 skill） | Skills 原生載入——直接按說明操作 |
| `Read`、`Write`、`Edit`（檔案） | 使用原生檔案工具 |
| `Bash`（執行命令） | 使用原生 shell 工具 |

## 子 Agent 派遣需要多 Agent 支援

在 Codex 配置檔案（`~/.codex/config.toml`）中新增：

```toml
[features]
multi_agent = true
```

啟用後可使用 `spawn_agent`、`wait` 和 `close_agent`，支援 `dispatching-parallel-agents` 和 `subagent-driven-development` 等 skills。
