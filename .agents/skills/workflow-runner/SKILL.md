---
name: workflow-runner
description: "在 Claude Code / OpenClaw / Cursor 中直接執行 agency-orchestrator YAML 工作流——無需 API key，使用當前會話的 LLM 作為執行引擎。當用戶提供 .yaml 工作流檔案或要求多角色協作完成任務時觸發。"
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [execution, workflow]
---

# 工作流執行器：在 AI 工具內執行多角色編排

直接在當前會話中執行 agency-orchestrator 的 YAML 工作流，無需配置 API key。當前 LLM 就是執行引擎——依次扮演每個角色完成任務。

## 適用場景

- 使用者提供了一個 `.yaml` 工作流檔案（如 `執行 workflows/story-creation.yaml`）
- 使用者要求多個角色協作完成任務（如"用產品經理和架構師一起評審這個 PRD"）
- 使用者安裝了 `agency-agents-zh` 並希望直接在 AI 工具內編排多角色

## 執行流程（5 步）

按以下順序執行，不要跳步：

### 第 1 步：解析工作流

用 Read 工具讀取使用者指定的 YAML 檔案，提取以下欄位：

```yaml
name: "工作流名稱"
agents_dir: "agency-agents-zh"    # 角色定義目錄
inputs:                            # 輸入變數
  - name: xxx
    required: true/false
    default: "預設值"
steps:                             # 執行步驟
  - id: step_id
    role: "category/agent-name"    # 角色路徑
    task: "任務描述 {{變數}}"       # 支援模板變數
    output: variable_name          # 輸出變數名
    depends_on: [other_step_id]    # 相依性關係
```

**忽略 `llm`、`concurrency`、`timeout`、`retry` 配置**——Skill 模式使用當前會話的 LLM，這些欄位僅用於 CLI 模式。

**定位角色目錄**：用 Bash `test -d` 按以下順序檢查，用第一個存在的：
1. 當前工作目錄下的 `{agents_dir}/`（如 `./agency-agents-zh/`）
2. `../{agents_dir}/`（上級目錄）
3. 相對於 YAML 檔案所在目錄的 `{agents_dir}/`
4. `node_modules/agency-agents-zh/`

如果全部找不到，**停止執行**並提示使用者：
```
找不到角色目錄。請先安裝：
  git clone --depth 1 https://github.com/jnMetaCode/agency-agents-zh.git
  或：npm install agency-agents-zh
```

### 第 2 步：收集輸入

- 對每個 `required: true` 的輸入，檢查使用者訊息中是否已提供值
- 未提供的必填輸入：**立即向用戶詢問**，不要猜測或用空值
- 有 `default` 的可選輸入：使用預設值
- 無預設值的可選輸入：設為空字串

### 第 3 步：構建執行順序

根據 `depends_on` 進行拓撲排序，將步驟分成多個層級：

- **無 depends_on 的步驟** → 第 1 層
- **depends_on 全部在第 N 層或之前的步驟** → 第 N+1 層
- **同一層內的步驟**互不相依性，可並行

在回覆中展示執行計劃：
```
執行計劃（共 N 步）：
  第 1 層: [step_id] — 角色名
  第 2 層: [step_a, step_b] — 並行
  第 3 層: [step_id] — 角色名
```

### 第 4 步：逐層執行

對每一層：

#### 4a. 預讀角色檔案

用 Read 工具讀取該層所有步驟的角色 `.md` 檔案：`{角色目錄}/{role}.md`

從檔案中提取：
- **角色名**：frontmatter 中的 `name` 欄位
- **角色 system prompt**：第二個 `---` 之後的全部 markdown 內容

#### 4b. 渲染 task 模板

將 task 中的 `{{變數名}}` 替換為：
- 來自 inputs 的使用者輸入值
- 來自前序步驟 output 的結果文本

#### 4c. 執行

**單步驟層**：直接在主會話中扮演該角色執行。格式：

```
### Step N/Total: step_id（角色名）

[以該角色身份完成 task，使用角色的專業知識和溝通風格]
```

**多步驟層（並行）**：使用 Agent 工具為每個步驟啟動子代理。每個子代理的 prompt 必須包含：
- 角色檔案的**完整文本內容**（不是路徑——子代理可能無法讀檔案）
- 渲染後的 task 文本
- 指令："以上是你的角色定義，請以該角色身份完成以下任務，直接輸出結果"

#### 4d. 儲存輸出到脈絡 (Context)

如果 step 有 `output` 欄位，將該步驟的輸出文本存入變數脈絡 (Context)，供後續步驟的 `{{變數}}` 使用。

### 第 5 步：儲存結果並展示

用 Write 工具將結果儲存到檔案：

```
.ao-output/{工作流名稱}-{YYYY-MM-DD}/
├── steps/
│   ├── 1-{step_id}.md       # 每步的輸出
│   ├── 2-{step_id}.md
│   └── ...
├── summary.md                # 最後一步的完整輸出（最終成果）
└── metadata.json             # 基本後設資料
```

metadata.json 格式：
```json
{
  "name": "工作流名稱",
  "date": "2026-03-22",
  "success": true,
  "steps": [
    {"id": "step_id", "role": "category/agent", "status": "completed"},
    ...
  ]
}
```

執行完畢後，向用戶展示：
1. 最終成果（summary.md 的內容）
2. 檔案儲存位置
3. 執行了幾個步驟

## 重要規則

<HARD-GATE>
- 每個步驟都必須真正扮演對應角色，使用該角色的專業知識和溝通風格，不能泛泛回答
- 角色切換必須明確——每步開始時標註角色名
- 不要跳過步驟或合併步驟，嚴格按 DAG 層級順序執行
- 如果角色檔案找不到，告知使用者並建議安裝 agency-agents-zh
- 不要在沒有讀取角色 .md 檔案的情況下執行步驟——必須先 Read 再執行
</HARD-GATE>

## 沒有 YAML 檔案時的快捷模式

如果使用者沒有指定 YAML 檔案，但描述了需要多角色協作的任務：

1. 根據使用者描述，**自動生成** YAML 工作流定義
2. 展示給使用者確認
3. 確認後按上述流程執行

示例：
- 使用者說"幫我用敘事學家和心理學家寫個故事" → 生成 story-creation 類似的工作流
- 使用者說"讓產品經理和架構師評審這個 PRD" → 生成 product-review 類似的工作流

## 故障處理

- **角色檔案不存在**：提示使用者執行 `ao init` 或 `npm install agency-agents-zh`
- **模板變數未定義**：檢查脈絡 (Context)，如果是必填輸入則向用戶詢問
- **步驟執行失敗**：標記該步驟為失敗，跳過所有相依性它的下游步驟，繼續執行其他獨立步驟
