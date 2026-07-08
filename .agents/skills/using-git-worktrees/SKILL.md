---
name: using-git-worktrees
description: 當需要開始與當前工作區隔離的功能開發，或在執行實現計劃之前使用——通過原生工具或 git worktree 回退機制確保隔離工作區存在
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [git, workflow]
---

# 使用 Git 工作樹

## 概述

確保工作發生在隔離的工作區中。優先使用你的平臺的原生 worktree 工具。僅在沒有原生工具可用時，再回退到手動 git worktree。

**核心原則：** 先檢測現有隔離。然後用原生工具。再回退到 git。絕不與 harness 對抗。

**開始時宣佈：** "我正在使用 using-git-worktrees 技能來建立一個隔離的工作區。"

## 步驟 0：檢測現有隔離

**建立任何東西之前，先檢查你是否已經在一個隔離的工作區裡。**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule 守衛：** 在 git submodule 內 `GIT_DIR != GIT_COMMON` 也為真。在判定"已經在 worktree 內"之前，先確認你不在 submodule 裡：

```bash
# 如果這條命令返回路徑，說明你在 submodule 裡，不是 worktree —— 按普通倉庫處理
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**如果 `GIT_DIR != GIT_COMMON`（且不是 submodule）：** 你已經在一個 linked worktree 內。跳到步驟 2（專案設定）。**不要**再建立一個 worktree。

按分支狀態報告：

- 在某個分支上："已經在隔離工作區 `<path>`，分支 `<name>`。"
- 分離 HEAD："已經在隔離工作區 `<path>`（分離 HEAD，由外部管理）。完成時需要建立分支。"

**如果 `GIT_DIR == GIT_COMMON`（或在 submodule 內）：** 你在一個普通的倉庫檢出裡。

使用者是否已經在你的 instructions 裡表明過 worktree 偏好？如果沒有，建立 worktree 之前先徵求同意：

> "你希望我搭一個隔離的 worktree 嗎？它能保護你當前分支不被改動。"

如果使用者已宣告過偏好，直接遵循，不再詢問。如果使用者拒絕同意，原地工作並跳到步驟 2。

## 步驟 1：建立隔離工作區

**你有兩種機制。按這個順序嘗試。**

### 1a. 原生 Worktree 工具（首選）

使用者已經請求隔離工作區（步驟 0 已獲同意）。你是否已經有建立 worktree 的方法？可能是名為 `EnterWorktree`、`WorktreeCreate` 的工具、`/worktree` 命令，或 `--worktree` 標誌。如果有，用它，然後跳到步驟 2。

原生工具自動處理目錄放置、分支建立和清理。在你已經有原生工具的情況下使用 `git worktree add`，會建立你的 harness 看不到也無法管理的"幻影狀態"。

只有在沒有原生 worktree 工具可用時，才進入步驟 1b。

### 1b. Git Worktree 回退

**只在步驟 1a 不適用時使用** —— 你沒有可用的原生 worktree 工具。手動用 git 建立 worktree。

#### 目錄選擇

按以下優先順序。明確的使用者偏好始終優先於觀察到的檔案系統狀態。

1. **檢查你的 instructions 裡是否宣告過 worktree 目錄偏好。** 如果使用者已指定，不再詢問直接用。

2. **檢查是否存在專案本地的 worktree 目錄：**

   ```bash
   ls -d .worktrees 2>/dev/null     # 首選（隱藏目錄）
   ls -d worktrees 2>/dev/null      # 備選
   ```

   找到就用。如果兩者都存在，`.worktrees` 優先。

3. **如果沒有其他可參考的資訊**，預設用專案根目錄下的 `.worktrees/`。

#### 安全驗證（僅專案本地目錄）

**建立 worktree 前必須驗證目錄已被忽略：**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**如果未被忽略：** 新增到 .gitignore，提交該改動，然後繼續。

**為什麼關鍵：** 防止 worktree 內容被意外提交到倉庫。

#### 建立工作樹

```bash
# 根據選定位置確定路徑
path="$LOCATION/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**沙盒回退：** 如果 `git worktree add` 因許可權錯誤（沙盒拒絕）失敗，告訴使用者沙盒阻止了 worktree 建立，你將在當前目錄原地工作。然後原地執行 setup 和基線測試。

## 步驟 2：專案設定

自動檢測並執行相應的設定命令：

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## 步驟 3：驗證基線乾淨

執行測試確保工作區初始狀態乾淨：

```bash
# 使用專案對應的命令
npm test / cargo test / pytest / go test ./...
```

**如果測試失敗：** 報告失敗，詢問是繼續還是排查。

**如果測試通過：** 報告就緒。

### 報告

```
工作樹已就緒：<full-path>
測試通過（<N> 個測試，0 個失敗）
準備實現 <feature-name>
```

## 快速參考

| 情況 | 操作 |
|------|------|
| 已在 linked worktree 內 | 跳過建立（步驟 0） |
| 在 submodule 內 | 按普通倉庫處理（步驟 0 守衛） |
| 有原生 worktree 工具 | 用它（步驟 1a） |
| 沒有原生工具 | git worktree 回退（步驟 1b） |
| `.worktrees/` 存在 | 用它（驗證已忽略） |
| `worktrees/` 存在 | 用它（驗證已忽略） |
| 兩者都存在 | 用 `.worktrees/` |
| 都不存在 | 檢查 instructions 檔案，再預設 `.worktrees/` |
| 目錄未被忽略 | 新增到 .gitignore + 提交 |
| 建立時許可權錯誤 | 沙盒回退，原地工作 |
| 基線測試失敗 | 報告失敗 + 詢問 |
| 無 package.json/Cargo.toml | 跳過相依性安裝 |

## 常見錯誤

### 與 harness 對抗

- **問題：** 平臺已經提供隔離的情況下還在用 `git worktree add`
- **修復：** 步驟 0 檢測現有隔離。步驟 1a 讓位給原生工具。

### 跳過檢測

- **問題：** 在已有的 worktree 內巢狀建立另一個 worktree
- **修復：** 建立任何東西之前都先跑步驟 0

### 跳過忽略驗證

- **問題：** worktree 內容被跟蹤，汙染 git status
- **修復：** 建立專案本地 worktree 前始終使用 `git check-ignore`

### 假設目錄位置

- **問題：** 造成不一致、違反專案約定
- **修復：** 遵循優先順序：明確 instructions > 現有專案本地目錄 > 預設

### 帶著失敗的測試繼續

- **問題：** 無法區分新 bug 和已有問題
- **修復：** 報告失敗，獲得明確許可後再繼續

## 紅線

**絕不：**

- 步驟 0 已檢測到現有隔離時還建立 worktree
- 在已有原生 worktree 工具（如 `EnterWorktree`）的情況下還用 `git worktree add`。這是 #1 錯誤——有就用。
- 跳過步驟 1a 直接跳到步驟 1b 的 git 命令
- 不驗證已忽略就建立專案本地 worktree
- 跳過基線測試驗證
- 不詢問就帶著失敗的測試繼續

**始終：**

- 先跑步驟 0 檢測
- 優先原生工具，其次 git 回退
- 遵循目錄優先順序：明確 instructions > 現有專案本地目錄 > 預設
- 專案本地目錄驗證已忽略
- 自動檢測並執行專案設定
- 驗證測試基線乾淨

## 整合

**被以下技能呼叫：**

- **brainstorming**（階段 4）- 設計通過且需要實現時必需
- **subagent-driven-development** - 執行任何任務前必需
- **executing-plans** - 執行任何任務前必需
- 任何需要隔離工作區的技能

**配合使用：**

- **finishing-a-development-branch** - 工作完成後清理時必需
