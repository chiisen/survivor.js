---
name: requesting-code-review
description: 完成任務、實現重要功能或合併前使用，用於驗證工作成果是否符合要求
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [code-review]
---

# 請求程式碼審查

派遣程式碼審查子代理，在問題擴散之前發現它們。審查者獲得的是精心組織的評估脈絡 (Context)——絕不是你的會話歷史。這樣可以讓審查者專注於工作成果而非你的思考過程，同時保留你自己的脈絡 (Context)以便繼續工作。

**核心原則：** 早審查，勤審查。

## 何時請求審查

**必須審查：**
- 子代理驅動開發中每個任務完成後
- 完成重要功能後
- 合併到 main 之前

**可選但有價值：**
- 卡住時（換個視角）
- 重構之前（建立基線）
- 修復複雜 bug 之後

## 如何請求

**1. 獲取 git SHA：**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # 或 origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. 派遣程式碼審查子代理：**

使用 Task 工具，指定 `general-purpose` 型別，填寫 `code-reviewer.md` 中的模板

**佔位符說明：**
- `{DESCRIPTION}` - 你剛完成的內容簡要說明
- `{PLAN_OR_REQUIREMENTS}` - 預期功能
- `{BASE_SHA}` - 起始提交
- `{HEAD_SHA}` - 結束提交

**3. 處理反饋：**
- Critical 問題立即修復
- Important 問題在繼續之前修復
- Minor 問題記錄下來稍後處理
- 如果審查者有誤，用技術理由反駁

## 示例

```
[剛完成任務 2：新增驗證功能]

你：讓我在繼續之前請求程式碼審查。

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[派遣程式碼審查子代理]
  DESCRIPTION: 添加了 verifyIndex() 和 repairIndex()，支援 4 種問題型別
  PLAN_OR_REQUIREMENTS: docs/superpowers/plans/deployment-plan.md 中的任務 2
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[子代理返回]:
  優點：架構清晰，測試真實
  問題：
    Important：缺少進度指示器
    Minor：報告間隔使用了魔法數字 (100)
  評估：可以繼續

你：[修復進度指示器]
[繼續任務 3]
```

## 與工作流的整合

**子代理驅動開發：**
- 每個任務完成後審查
- 在問題疊加之前發現它們
- 修復後再進入下一個任務

**執行計劃：**
- 每個任務完成後或在自然 checkpoint 審查
- 獲取反饋，應用，繼續

**臨時開發：**
- 合併前審查
- 卡住時審查

## 紅線

**絕不要：**
- 因為"很簡單"就跳過審查
- 忽略 Critical 問題
- 帶著未修復的 Important 問題繼續推進
- 對合理的技術反饋進行爭辯

**如果審查者有誤：**
- 用技術理由反駁
- 展示證明其可行的程式碼/測試
- 要求澄清

參見模板：requesting-code-review/code-reviewer.md
