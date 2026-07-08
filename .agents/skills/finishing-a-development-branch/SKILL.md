---
name: finishing-a-development-branch
description: 當實現完成、所有測試通過、需要決定如何整合工作時使用——通過提供合併、PR 或清理等結構化選項來引導開發工作的收尾
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [git, workflow]
---

# 完成開發分支

## 概述

通過提供清晰的選項並執行所選工作流來引導開發工作的收尾。

**核心原則：** 驗證測試 → 檢測環境 → 展示選項 → 執行選擇 → 清理。

**開始時宣佈：** "我正在使用 finishing-a-development-branch 技能來完成這項工作。"

## 流程

### 步驟 1：驗證測試

**在展示選項之前，驗證測試通過：**

```bash
# 執行專案的測試套件
npm test / cargo test / pytest / go test ./...
```

**如果測試失敗：**

```
測試失敗（<N> 個失敗）。必須先修復才能繼續：

[顯示失敗資訊]

在測試通過之前無法進行合併/PR。
```

停止。不要繼續到步驟 2。

**如果測試通過：** 繼續步驟 2。

### 步驟 2：檢測環境

**在展示選項之前，先確定工作區狀態：**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

這決定了展示哪種選單、以及清理方式：

| 狀態 | 選單 | 清理 |
|------|------|------|
| `GIT_DIR == GIT_COMMON`（普通倉庫） | 標準 4 個選項 | 無 worktree 可清理 |
| `GIT_DIR != GIT_COMMON`，命名分支 | 標準 4 個選項 | 按來源判斷（見步驟 6） |
| `GIT_DIR != GIT_COMMON`，分離 HEAD | 收斂 3 個選項（無合併） | 無清理（由外部管理） |

### 步驟 3：確定基礎分支

```bash
# 嘗試常見的基礎分支
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

或者詢問："這個分支是從 main 分出來的——對嗎？"

### 步驟 4：展示選項

**普通倉庫和命名分支 worktree —— 準確展示以下 4 個選項：**

```
實現已完成。你想怎麼做？

1. 在本地合併回 <base-branch>
2. 推送並建立 Pull Request
3. 保持分支現狀（我稍後處理）
4. 丟棄這項工作

選哪個？
```

**分離 HEAD —— 準確展示以下 3 個選項：**

```
實現已完成。你在分離 HEAD 上（由外部管理的工作區）。

1. 作為新分支推送並建立 Pull Request
2. 保持現狀（我稍後處理）
3. 丟棄這項工作

選哪個？
```

**不要新增解釋** —— 保持選項簡潔。

### 步驟 5：執行選擇

#### 選項 1：本地合併

```bash
# 切到主倉庫根目錄，保證 CWD 安全
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# 先合併 —— 在刪除任何東西之前先驗證合併成功
git checkout <base-branch>
git pull
git merge <feature-branch>

# 在合併結果上驗證測試
<test command>

# 合併成功之後再：清理 worktree（步驟 6），然後刪除分支
```

然後：清理 worktree（步驟 6），再刪除分支：

```bash
git branch -d <feature-branch>
```

#### 選項 2：推送並建立 PR

```bash
# 推送分支
git push -u origin <feature-branch>

# 建立 PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## 摘要
<2-3 條變更要點>

## 測試計劃
- [ ] <驗證步驟>
EOF
)"
```

**不要清理 worktree** —— 使用者在 PR 反饋迭代時還需要它存活。

#### 選項 3：保持現狀

報告："保留分支 <name>。工作樹保留在 <path>。"

**不要清理工作樹。**

#### 選項 4：丟棄

**先確認：**

```
這將永久刪除：
- 分支 <name>
- 所有提交：<commit-list>
- 工作樹 <path>

輸入 'discard' 確認。
```

等待精確的確認。

確認後：

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

然後：清理 worktree（步驟 6），再強制刪除分支：

```bash
git branch -D <feature-branch>
```

### 步驟 6：清理工作區

**只對選項 1 和 4 執行。** 選項 2 和 3 始終保留 worktree。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**如果 `GIT_DIR == GIT_COMMON`：** 普通倉庫，無 worktree 可清理。結束。

**如果 worktree 路徑在 `.worktrees/` 或 `worktrees/` 之下：** 這是 Superpowers 建立的 worktree —— 我們負責清理。

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # 自愈：清理任何過期的註冊記錄
```

**否則：** 這個工作區由宿主環境（harness）管理。**不要**移除它。如果你的平臺提供了工作區退出工具，用它。否則原樣保留工作區。

## 快速參考

| 選項 | 合併 | 推送 | 保留工作樹 | 清理分支 |
|------|------|------|-----------|---------|
| 1. 本地合併 | ✓ | - | - | ✓ |
| 2. 建立 PR | - | ✓ | ✓ | - |
| 3. 保持現狀 | - | - | ✓ | - |
| 4. 丟棄 | - | - | - | ✓（強制） |

## 常見錯誤

**跳過測試驗證**

- **問題：** 合併損壞的程式碼、建立失敗的 PR
- **修復：** 在提供選項前始終驗證測試

**開放式問題**

- **問題：** "接下來該做什麼？" → 含糊不清
- **修復：** 準確展示 4 個結構化選項（分離 HEAD 時是 3 個）

**為選項 2 清理 worktree**

- **問題：** 刪掉使用者 PR 迭代還需要的 worktree
- **修復：** 只在選項 1 和 4 時清理

**先刪分支再刪 worktree**

- **問題：** `git branch -d` 失敗，因為 worktree 還引用著該分支
- **修復：** 先合併，再刪 worktree，最後刪分支

**在 worktree 內部跑 `git worktree remove`**

- **問題：** 當 CWD 在被刪除的 worktree 內時，命令靜默失敗
- **修復：** 跑 `git worktree remove` 前先 `cd` 到主倉庫根目錄

**清理 harness 擁有的 worktree**

- **問題：** 移除 harness 建立的 worktree 會造成幻影狀態
- **修復：** 只清理 `.worktrees/` 或 `worktrees/` 下的 worktree

**丟棄時不確認**

- **問題：** 意外刪除工作成果
- **修復：** 要求輸入 'discard' 確認

## 紅線

**絕不：**

- 在測試失敗時繼續
- 合併前不驗證合併結果上的測試
- 不確認就刪除工作成果
- 未經明確請求就強制推送
- 在確認合併成功之前移除 worktree
- 清理不是你建立的 worktree（按來源判斷）
- 在 worktree 內部跑 `git worktree remove`

**始終：**

- 在提供選項前驗證測試
- 展示選單前檢測環境
- 準確展示 4 個選項（分離 HEAD 時是 3 個）
- 選項 4 要求輸入確認
- 只在選項 1 和 4 時清理 worktree
- 移除 worktree 前 `cd` 到主倉庫根目錄
- 移除後跑 `git worktree prune`

## 整合

**被以下技能呼叫：**

- **subagent-driven-development**（步驟 7）- 所有任務完成後
- **executing-plans**（步驟 5）- 所有批次完成後

**配合使用：**

- **using-git-worktrees** - 清理由該技能建立的工作樹
