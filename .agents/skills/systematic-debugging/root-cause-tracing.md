# 根因追蹤

## 概述

Bug 通常表現在呼叫棧深處（在錯誤目錄執行 git init、在錯誤位置建立檔案、用錯誤路徑開啟資料庫）。你的本能是在錯誤出現的地方修復，但那只是治標。

**核心原則：** 沿著呼叫鏈反向追蹤，直到找到最初的觸發點，然後在源頭修復。

## 何時使用

```dot
digraph when_to_use {
    "Bug 出現在呼叫棧深處？" [shape=diamond];
    "能反向追蹤嗎？" [shape=diamond];
    "在症狀處修復" [shape=box];
    "追蹤到最初的觸發點" [shape=box];
    "更好的做法：同時新增縱深防禦" [shape=box];

    "Bug 出現在呼叫棧深處？" -> "能反向追蹤嗎？" [label="是"];
    "能反向追蹤嗎？" -> "追蹤到最初的觸發點" [label="是"];
    "能反向追蹤嗎？" -> "在症狀處修復" [label="否——死衚衕"];
    "追蹤到最初的觸發點" -> "更好的做法：同時新增縱深防禦";
}
```

**適用場景：**
- 錯誤發生在執行深處（不在入口點）
- 堆疊跟蹤顯示很長的呼叫鏈
- 不清楚無效資料從哪裡來
- 需要找到是哪個測試/程式碼觸發了問題

## 追蹤流程

### 1. 觀察症狀
```
Error: git init failed in /Users/jesse/project/packages/core
```

### 2. 找到直接原因
**哪段程式碼直接導致了這個錯誤？**
```typescript
await execFileAsync('git', ['init'], { cwd: projectDir });
```

### 3. 問：誰呼叫了它？
```typescript
WorktreeManager.createSessionWorktree(projectDir, sessionId)
  → 被 Session.initializeWorkspace() 呼叫
  → 被 Session.create() 呼叫
  → 被測試中的 Project.create() 呼叫
```

### 4. 繼續向上追蹤
**傳入了什麼值？**
- `projectDir = ''`（空字串！）
- 空字串作為 `cwd` 會解析為 `process.cwd()`
- 那就是原始碼目錄！

### 5. 找到最初的觸發點
**空字串從哪裡來的？**
```typescript
const context = setupCoreTest(); // 返回 { tempDir: '' }
Project.create('name', context.tempDir); // 在 beforeEach 之前就訪問了！
```

## 新增堆疊跟蹤

當無法手動追蹤時，新增診斷埋點：

```typescript
// 在有問題的操作之前
async function gitInit(directory: string) {
  const stack = new Error().stack;
  console.error('DEBUG git init:', {
    directory,
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    stack,
  });

  await execFileAsync('git', ['init'], { cwd: directory });
}
```

**重要：** 在測試中使用 `console.error()`（而非 logger——可能不會顯示）

**執行並捕獲：**
```bash
npm test 2>&1 | grep 'DEBUG git init'
```

**分析堆疊跟蹤：**
- 找測試檔名
- 找觸發呼叫的行號
- 識別模式（同一個測試？同一個引數？）

## 找出導致汙染的測試

如果某些現象在測試期間出現，但你不知道是哪個測試造成的：

使用本目錄下的二分查詢指令碼 `find-polluter.sh`：

```bash
./find-polluter.sh '.git' 'src/**/*.test.ts'
```

逐個執行測試，在第一個"汙染者"處停止。詳見指令碼中的使用說明。

## 真實案例：空的 projectDir

**症狀：** `.git` 被建立在 `packages/core/`（原始碼目錄）中

**追蹤鏈：**
1. `git init` 在 `process.cwd()` 中執行 ← cwd 引數為空
2. WorktreeManager 被傳入空的 projectDir
3. Session.create() 傳遞了空字串
4. 測試在 beforeEach 之前訪問了 `context.tempDir`
5. setupCoreTest() 初始返回 `{ tempDir: '' }`

**根本原因：** 頂層變數初始化時訪問了空值

**修復：** 將 tempDir 改為 getter，在 beforeEach 之前訪問時丟擲異常

**同時添加了縱深防禦：**
- 第 1 層：Project.create() 校驗目錄
- 第 2 層：WorkspaceManager 校驗非空
- 第 3 層：NODE_ENV 守衛拒絕在 tmpdir 之外執行 git init
- 第 4 層：git init 前記錄堆疊跟蹤

## 關鍵原則

```dot
digraph principle {
    "找到了直接原因" [shape=ellipse];
    "能向上追蹤一層嗎？" [shape=diamond];
    "反向追蹤" [shape=box];
    "這就是源頭嗎？" [shape=diamond];
    "在源頭修復" [shape=box];
    "在每一層新增校驗" [shape=box];
    "Bug 不可能再發生" [shape=doublecircle];
    "絕不只修症狀" [shape=octagon, style=filled, fillcolor=red, fontcolor=white];

    "找到了直接原因" -> "能向上追蹤一層嗎？";
    "能向上追蹤一層嗎？" -> "反向追蹤" [label="是"];
    "能向上追蹤一層嗎？" -> "絕不只修症狀" [label="否"];
    "反向追蹤" -> "這就是源頭嗎？";
    "這就是源頭嗎？" -> "反向追蹤" [label="否——繼續追蹤"];
    "這就是源頭嗎？" -> "在源頭修復" [label="是"];
    "在源頭修復" -> "在每一層新增校驗";
    "在每一層新增校驗" -> "Bug 不可能再發生";
}
```

**絕不只在錯誤出現的地方修復。** 反向追蹤，找到最初的觸發點。

## 堆疊跟蹤技巧

**在測試中：** 使用 `console.error()` 而非 logger——logger 可能被抑制
**操作之前：** 在危險操作之前記錄日誌，而不是在失敗之後
**包含脈絡 (Context)：** 目錄、cwd、環境變數、時間戳
**捕獲堆疊：** `new Error().stack` 能顯示完整的呼叫鏈

## 實際效果

來自除錯實踐（2025-10-03）：
- 通過 5 層追蹤找到了根本原因
- 在源頭修復（getter 校驗）
- 添加了 4 層縱深防禦
- 1847 個測試通過，零汙染
