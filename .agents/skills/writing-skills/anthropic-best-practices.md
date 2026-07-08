# 技能編寫最佳實踐

> 學習如何編寫 Claude 能發現併成功使用的有效技能。

好的技能是簡潔、結構良好、並經過真實使用測試的。本指南提供實用的編寫決策，幫助你編寫 Claude 能發現並有效使用的技能。

關於技能工作原理的概念背景，請參閱[技能概述](/en/docs/agents-and-tools/agent-skills/overview)。

## 核心原則

### 簡潔是關鍵

[脈絡 (Context)視窗](https://platform.claude.com/docs/en/build-with-claude/context-windows)是公共資源。你的技能與 Claude 需要知道的所有其他內容共享脈絡 (Context)視窗，包括：

* 系統提示
* 對話歷史
* 其他技能的後設資料
* 你的實際請求

並非技能中的每個 token 都有即時成本。啟動時，只有所有技能的後設資料（name 和 description）被預載入。Claude 只在技能變得相關時才讀取 SKILL.md，並且只在需要時才讀取額外檔案。然而，在 SKILL.md 中保持簡潔仍然很重要：一旦 Claude 載入它，每個 token 都在與對話歷史和其他脈絡 (Context)競爭。

**預設假設**：Claude 已經非常聰明

只新增 Claude 還不知道的脈絡 (Context)。對每條資訊進行質疑：

* "Claude 真的需要這個解釋嗎？"
* "我能假設 Claude 知道這個嗎？"
* "這段話值得它的 token 成本嗎？"

**好的示例：簡潔**（約 50 個 token）：

````markdown  theme={null}
## 提取 PDF 文本

使用 pdfplumber 進行文本提取：

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**差的示例：太冗長**（約 150 個 token）：

```markdown  theme={null}
## 提取 PDF 文本

PDF（行動式文件格式）檔案是一種常見的檔案格式，包含文本、影像和其他內容。
要從 PDF 中提取文本，你需要使用一個庫。有很多 PDF 處理庫可用，
但我們推薦 pdfplumber，因為它易於使用且處理大多數情況都很好。
首先，你需要使用 pip 安裝它。然後你可以使用下面的程式碼……
```

簡潔版本假設 Claude 知道什麼是 PDF 以及庫是如何工作的。

### 設定適當的自由度

將具體程度與任務的脆弱性和可變性相匹配。

**高自由度**（基於文本的指令）：

適用場景：

* 多種方案都有效
* 決策取決於脈絡 (Context)
* 啟發式方法指導方案

示例：

```markdown  theme={null}
## 程式碼審查流程

1. 分析程式碼結構和組織
2. 檢查潛在的 bug 或邊界情況
3. 建議改善可讀性和可維護性
4. 驗證是否遵循專案約定
```

**中等自由度**（虛擬碼或帶引數的指令碼）：

適用場景：

* 存在首選模式
* 可以接受一些變化
* 配置影響行為

示例：

````markdown  theme={null}
## 生成報告

使用此模板並根據需要自定義：

```python
def generate_report(data, format="markdown", include_charts=True):
    # 處理資料
    # 按指定格式生成輸出
    # 可選包含視覺化
```
````

**低自由度**（具體指令碼，很少或沒有引數）：

適用場景：

* 操作脆弱且容易出錯
* 一致性至關重要
* 必須遵循特定順序

示例：

````markdown  theme={null}
## 資料庫遷移

嚴格執行此指令碼：

```bash
python scripts/migrate.py --verify --backup
```

不要修改命令或新增額外引數。
````

**類比**：把 Claude 想像成一個探索路徑的機器人：

* **兩側是懸崖的窄橋**：只有一條安全的路。提供具體的護欄和精確的指令（低自由度）。例如：必須按確切順序執行的資料庫遷移。
* **沒有障礙的開闊地**：很多路徑都能成功。給出大方向，信任 Claude 找到最佳路線（高自由度）。例如：方案取決於脈絡 (Context)的程式碼審查。

### 用你計劃使用的所有模型測試

技能作為模型的補充，因此效果取決於底層模型。用你計劃使用的所有模型測試你的技能。

**按模型的測試考慮**：

* **Claude Haiku**（快速、經濟）：技能是否提供了足夠的指導？
* **Claude Sonnet**（平衡）：技能是否清晰高效？
* **Claude Opus**（強大推理）：技能是否避免了過度解釋？

對 Opus 完美工作的內容可能對 Haiku 需要更多細節。如果你計劃跨多個模型使用技能，瞄準對所有模型都適用的指令。

## 技能結構

<Note>
  **YAML Frontmatter**：SKILL.md 的 frontmatter 支援兩個欄位：

  * `name` - 技能的可讀名稱（最多 64 個字元）
  * `description` - 技能做什麼以及何時使用的一行描述（最多 1024 個字元）

  完整的技能結構細節請參閱[技能概述](/en/docs/agents-and-tools/agent-skills/overview#skill-structure)。
</Note>

### 命名約定

使用一致的命名模式使技能更容易引用和討論。我們推薦使用**動名詞形式**（動詞 + -ing）作為技能名稱，因為這清楚地描述了技能提供的活動或能力。

**好的命名示例（動名詞形式）**：

* "Processing PDFs"
* "Analyzing spreadsheets"
* "Managing databases"
* "Testing code"
* "Writing documentation"

**可接受的替代方案**：

* 名詞短語："PDF Processing"、"Spreadsheet Analysis"
* 動作導向："Process PDFs"、"Analyze Spreadsheets"

**避免**：

* 模糊的名稱："Helper"、"Utils"、"Tools"
* 過於通用："Documents"、"Data"、"Files"
* 技能集合中命名模式不一致

一致的命名便於：

* 在文件和對話中引用技能
* 一眼就能理解技能的作用
* 組織和搜尋多個技能
* 維護專業、連貫的技能庫

### 編寫有效的描述

`description` 欄位用於技能發現，應包含技能做什麼以及何時使用。

<Warning>
  **始終用第三人稱寫**。描述被注入系統提示中，不一致的人稱視角會導致發現問題。

  * **好的：** "Processes Excel files and generates reports"
  * **避免：** "I can help you process Excel files"
  * **避免：** "You can use this to process Excel files"
</Warning>

**具體且包含關鍵術語**。同時包含技能做什麼和何時使用的具體觸發條件/脈絡 (Context)。

每個技能只有一個描述欄位。描述對技能選擇至關重要：Claude 使用它從可能 100 多個可用技能中選擇正確的技能。你的描述必須提供足夠的細節讓 Claude 知道何時選擇此技能，而 SKILL.md 的其餘部分提供實現細節。

有效的示例：

**PDF 處理技能：**

```yaml  theme={null}
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Excel 分析技能：**

```yaml  theme={null}
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.
```

**Git 提交助手技能：**

```yaml  theme={null}
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

避免模糊的描述：

```yaml  theme={null}
description: Helps with documents
```

```yaml  theme={null}
description: Processes data
```

```yaml  theme={null}
description: Does stuff with files
```

### 漸進式披露模式

SKILL.md 作為概述，按需指向詳細材料，就像入門指南中的目錄。關於漸進式披露如何工作的解釋，請參閱概述中的[技能工作原理](/en/docs/agents-and-tools/agent-skills/overview#how-skills-work)。

**實用指導：**

* SKILL.md 正文保持在 500 行以內以獲得最佳效能
* 接近此限制時將內容拆分到獨立檔案
* 使用以下模式有效地組織指令、程式碼和資源

#### 視覺化概覽：從簡單到複雜

基本技能只需一個包含後設資料和指令的 SKILL.md 檔案：

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=87782ff239b297d9a9e8e1b72ed72db9" alt="簡單的 SKILL.md 檔案，展示 YAML frontmatter 和 markdown 正文" data-og-width="2048" width="2048" data-og-height="1153" height="1153" data-path="images/agent-skills-simple-file.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=c61cc33b6f5855809907f7fda94cd80e 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=90d2c0c1c76b36e8d485f49e0810dbfd 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=ad17d231ac7b0bea7e5b4d58fb4aeabb 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=f5d0a7a3c668435bb0aee9a3a8f8c329 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=0e927c1af9de5799cfe557d12249f6e6 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=46bbb1a51dd4c8202a470ac8c80a893d 2500w" />

隨著技能增長，你可以捆綁額外的內容，Claude 只在需要時才載入：

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=a5e0aa41e3d53985a7e3e43668a33ea3" alt="捆綁額外的參考檔案如 reference.md 和 forms.md。" data-og-width="2048" width="2048" data-og-height="1327" height="1327" data-path="images/agent-skills-bundling-content.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=f8a0e73783e99b4a643d79eac86b70a2 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=dc510a2a9d3f14359416b706f067904a 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=82cd6286c966303f7dd914c28170e385 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=56f3be36c77e4fe4b523df209a6824c6 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=d22b5161b2075656417d56f41a74f3dd 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=3dd4bdd6850ffcc96c6c45fcb0acd6eb 2500w" />

完整的技能目錄結構可能如下：

```
pdf/
├── SKILL.md              # 主指令（觸發時載入）
├── FORMS.md              # 表單填寫指南（按需載入）
├── reference.md          # API 參考（按需載入）
├── examples.md           # 使用示例（按需載入）
└── scripts/
    ├── analyze_form.py   # 實用指令碼（執行，不載入）
    ├── fill_form.py      # 表單填寫指令碼
    └── validate.py       # 驗證指令碼
```

#### 模式 1：高層指南加引用

````markdown  theme={null}
---
name: PDF Processing
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---

# PDF 處理

## 快速開始

用 pdfplumber 提取文本：
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## 高階功能

**表單填寫**：參見 [FORMS.md](FORMS.md) 獲取完整指南
**API 參考**：參見 [REFERENCE.md](REFERENCE.md) 獲取所有方法
**示例**：參見 [EXAMPLES.md](EXAMPLES.md) 獲取常見模式
````

Claude 只在需要時才載入 FORMS.md、REFERENCE.md 或 EXAMPLES.md。

#### 模式 2：領域特定組織

對於有多個領域的技能，按領域組織內容以避免載入不相關的脈絡 (Context)。當用戶詢問銷售指標時，Claude 只需要讀取銷售相關的 schema，而非財務或營銷資料。這保持了 token 使用低和脈絡 (Context)聚焦。

```
bigquery-skill/
├── SKILL.md（概述和導航）
└── reference/
    ├── finance.md（收入、賬單指標）
    ├── sales.md（商機、管道）
    ├── product.md（API 使用、功能）
    └── marketing.md（營銷活動、歸因）
```

````markdown SKILL.md theme={null}
# BigQuery 資料分析

## 可用資料集

**財務**：收入、ARR、賬單 → 參見 [reference/finance.md](reference/finance.md)
**銷售**：商機、管道、客戶 → 參見 [reference/sales.md](reference/sales.md)
**產品**：API 使用、功能、採用率 → 參見 [reference/product.md](reference/product.md)
**營銷**：活動、歸因、郵件 → 參見 [reference/marketing.md](reference/marketing.md)

## 快速搜尋

使用 grep 查詢特定指標：

```bash
grep -i "revenue" reference/finance.md
grep -i "pipeline" reference/sales.md
grep -i "api usage" reference/product.md
```
````

#### 模式 3：條件性細節

展示基本內容，連結到高階內容：

```markdown  theme={null}
# DOCX 處理

## 建立文件

使用 docx-js 建立新文件。參見 [DOCX-JS.md](DOCX-JS.md)。

## 編輯文件

簡單編輯可直接修改 XML。

**修訂追蹤**：參見 [REDLINING.md](REDLINING.md)
**OOXML 細節**：參見 [OOXML.md](OOXML.md)
```

Claude 只在使用者需要這些功能時才讀取 REDLINING.md 或 OOXML.md。

### 避免深層巢狀引用

當引用來自其他被引用檔案時，Claude 可能只部分讀取檔案。遇到巢狀引用時，Claude 可能使用 `head -100` 等命令預覽內容而非讀取完整檔案，導致資訊不完整。

**從 SKILL.md 到引用保持一層深度**。所有引用檔案應直接從 SKILL.md 連結，以確保 Claude 在需要時讀取完整檔案。

**差的示例：太深**：

```markdown  theme={null}
# SKILL.md
參見 [advanced.md](advanced.md)...

# advanced.md
參見 [details.md](details.md)...

# details.md
這裡是實際資訊...
```

**好的示例：一層深度**：

```markdown  theme={null}
# SKILL.md

**基本用法**：[SKILL.md 中的指令]
**高階功能**：參見 [advanced.md](advanced.md)
**API 參考**：參見 [reference.md](reference.md)
**示例**：參見 [examples.md](examples.md)
```

### 為較長的參考檔案新增目錄

對於超過 100 行的參考檔案，在頂部包含目錄。這確保 Claude 即使在部分讀取預覽時也能看到可用資訊的完整範圍。

**示例**：

```markdown  theme={null}
# API 參考

## 目錄
- 認證和設定
- 核心方法（建立、讀取、更新、刪除）
- 高階功能（批次操作、webhooks）
- 錯誤處理模式
- 程式碼示例

## 認證和設定
...

## 核心方法
...
```

Claude 可以讀取完整檔案或按需跳轉到特定章節。

關於這種基於檔案系統的架構如何實現漸進式披露的詳細資訊，請參閱下方高階部分的[執行時環境](#runtime-environment)章節。

## 工作流和反饋迴圈

### 對複雜任務使用工作流

將複雜操作分解為清晰的順序步驟。對於特別複雜的工作流，提供一個 Claude 可以複製到響應中並在進展時逐項勾選的清單。

**示例 1：研究綜合工作流**（無程式碼的技能）：

````markdown  theme={null}
## 研究綜合工作流

複製此清單並跟蹤你的進度：

```
研究進度：
- [ ] 步驟 1：閱讀所有源文件
- [ ] 步驟 2：識別關鍵主題
- [ ] 步驟 3：交叉驗證論點
- [ ] 步驟 4：建立結構化摘要
- [ ] 步驟 5：驗證引用
```

**步驟 1：閱讀所有源文件**

審查 `sources/` 目錄中的每個文件。記錄主要論點和支援證據。

**步驟 2：識別關鍵主題**

尋找跨源的模式。哪些主題反覆出現？源之間在哪裡一致或分歧？

**步驟 3：交叉驗證論點**

對於每個主要論點，驗證它出現在源材料中。記錄哪個源支援每個要點。

**步驟 4：建立結構化摘要**

按主題組織發現。包含：
- 主要論點
- 來自源的支援證據
- 矛盾觀點（如果有）

**步驟 5：驗證引用**

檢查每個論點是否引用了正確的源文件。如果引用不完整，返回步驟 3。
````

此示例展示了工作流如何應用於不需要程式碼的分析任務。清單模式適用於任何複雜的多步驟過程。

**示例 2：PDF 表單填寫工作流**（有程式碼的技能）：

````markdown  theme={null}
## PDF 表單填寫工作流

複製此清單並在完成時逐項勾選：

```
任務進度：
- [ ] 步驟 1：分析表單（執行 analyze_form.py）
- [ ] 步驟 2：建立欄位對映（編輯 fields.json）
- [ ] 步驟 3：驗證對映（執行 validate_fields.py）
- [ ] 步驟 4：填寫表單（執行 fill_form.py）
- [ ] 步驟 5：驗證輸出（執行 verify_output.py）
```

**步驟 1：分析表單**

執行：`python scripts/analyze_form.py input.pdf`

這會提取表單欄位及其位置，儲存到 `fields.json`。

**步驟 2：建立欄位對映**

編輯 `fields.json` 為每個欄位新增值。

**步驟 3：驗證對映**

執行：`python scripts/validate_fields.py fields.json`

在繼續之前修復所有驗證錯誤。

**步驟 4：填寫表單**

執行：`python scripts/fill_form.py input.pdf fields.json output.pdf`

**步驟 5：驗證輸出**

執行：`python scripts/verify_output.py output.pdf`

如果驗證失敗，返回步驟 2。
````

清晰的步驟防止 Claude 跳過關鍵驗證。清單幫助 Claude 和你跟蹤多步驟工作流的進度。

### 實現反饋迴圈

**常見模式**：執行驗證器 → 修復錯誤 → 重複

此模式大幅提高輸出質量。

**示例 1：風格指南合規**（無程式碼的技能）：

```markdown  theme={null}
## 內容審查流程

1. 按照 STYLE_GUIDE.md 中的指南起草內容
2. 按清單審查：
   - 檢查術語一致性
   - 驗證示例遵循標準格式
   - 確認所有必需章節都存在
3. 如果發現問題：
   - 記錄每個問題及具體章節引用
   - 修改內容
   - 再次審查清單
4. 只有所有要求滿足後才繼續
5. 最終定稿並儲存文件
```

這展示了使用參考文件而非指令碼的驗證迴圈模式。"驗證器"就是 STYLE_GUIDE.md，Claude 通過閱讀和比較來執行檢查。

**示例 2：文件編輯流程**（有程式碼的技能）：

```markdown  theme={null}
## 文件編輯流程

1. 對 `word/document.xml` 進行編輯
2. **立即驗證**：`python ooxml/scripts/validate.py unpacked_dir/`
3. 如果驗證失敗：
   - 仔細審查錯誤資訊
   - 修復 XML 中的問題
   - 再次執行驗證
4. **只有驗證通過後才繼續**
5. 重新打包：`python ooxml/scripts/pack.py unpacked_dir/ output.docx`
6. 測試輸出文件
```

驗證迴圈能及早發現錯誤。

## 內容指南

### 避免時間敏感的資訊

不要包含會過時的資訊：

**差的示例：時間敏感**（會變得不正確）：

```markdown  theme={null}
如果你在 2025 年 8 月之前做這件事，使用舊 API。
2025 年 8 月之後，使用新 API。
```

**好的示例**（使用"舊模式"章節）：

```markdown  theme={null}
## 當前方法

使用 v2 API 端點：`api.example.com/v2/messages`

## 舊模式

<details>
<summary>舊版 v1 API（2025-08 棄用）</summary>

v1 API 使用：`api.example.com/v1/messages`

此端點不再支援。
</details>
```

舊模式章節提供歷史脈絡 (Context)而不會干擾主要內容。

### 使用一致的術語

選擇一個術語並在整個技能中統一使用：

**好的 - 一致**：

* 始終用"API endpoint"
* 始終用"field"
* 始終用"extract"

**差的 - 不一致**：

* 混用"API endpoint"、"URL"、"API route"、"path"
* 混用"field"、"box"、"element"、"control"
* 混用"extract"、"pull"、"get"、"retrieve"

一致性幫助 Claude 理解和遵循指令。

## 常見模式

### 模板模式

為輸出格式提供模板。將嚴格程度與你的需求匹配。

**嚴格要求時**（如 API 響應或資料格式）：

````markdown  theme={null}
## 報告結構

始終使用這個精確的模板結構：

```markdown
# [分析標題]

## 摘要
[關鍵發現的一段概述]

## 關鍵發現
- 發現 1 及支援資料
- 發現 2 及支援資料
- 發現 3 及支援資料

## 建議
1. 具體可操作的建議
2. 具體可操作的建議
```
````

**靈活指導時**（當適應性有用時）：

````markdown  theme={null}
## 報告結構

這是一個合理的預設格式，但請根據分析情況自行判斷：

```markdown
# [分析標題]

## 摘要
[概述]

## 關鍵發現
[根據你的發現調整章節]

## 建議
[根據具體脈絡 (Context)定製]
```

根據具體分析型別按需調整章節。
````

### 示例模式

對於輸出質量取決於看到示例的技能，提供輸入/輸出對，就像常規提示一樣：

````markdown  theme={null}
## 提交資訊格式

按照這些示例生成提交資訊：

**示例 1：**
輸入：添加了使用 JWT token 的使用者認證
輸出：
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**示例 2：**
輸入：修復了報告中日期顯示不正確的 bug
輸出：
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

**示例 3：**
輸入：更新了相依性並重構了錯誤處理
輸出：
```
chore: update dependencies and refactor error handling

- Upgrade lodash to 4.17.21
- Standardize error response format across endpoints
```

遵循此風格：type(scope): 簡短描述，然後詳細說明。
````

示例比純描述更能幫助 Claude 理解期望的風格和詳細程度。

### 條件工作流模式

引導 Claude 通過決策點：

```markdown  theme={null}
## 文件修改工作流

1. 確定修改型別：

   **建立新內容？** → 遵循下方"建立工作流"
   **編輯現有內容？** → 遵循下方"編輯工作流"

2. 建立工作流：
   - 使用 docx-js 庫
   - 從頭構建文件
   - 匯出為 .docx 格式

3. 編輯工作流：
   - 解壓現有文件
   - 直接修改 XML
   - 每次更改後驗證
   - 完成後重新打包
```

<Tip>
  如果工作流變得大且複雜、有很多步驟，考慮將它們推到獨立檔案中，並告訴 Claude 根據手頭的任務讀取相應的檔案。
</Tip>

## 評估和迭代

### 先建立評估

**在編寫大量文件之前建立評估。** 這確保你的技能解決的是真實問題而非想像中的問題。

**評估驅動的開發：**

1. **識別差距**：在沒有技能的情況下讓 Claude 執行代表性任務。記錄具體的失敗或缺失的脈絡 (Context)
2. **建立評估**：構建三個測試這些差距的場景
3. **建立基線**：衡量 Claude 在沒有技能時的表現
4. **編寫最小指令**：只建立足夠解決差距和通過評估的內容
5. **迭代**：執行評估，與基線對比，並最佳化

這種方法確保你解決的是實際問題而非可能永遠不會出現的預期需求。

**評估結構**：

```json  theme={null}
{
  "skills": ["pdf-processing"],
  "query": "從這個 PDF 檔案中提取所有文本並儲存到 output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "使用適當的 PDF 處理庫或命令列工具成功讀取 PDF 檔案",
    "從文件的所有頁面提取文本內容，不遺漏任何頁面",
    "將提取的文本以清晰、可讀的格式儲存到名為 output.txt 的檔案中"
  ]
}
```

<Note>
  此示例演示了帶有簡單元測試試評分標準的資料驅動評估。我們目前不提供內建的評估執行方式。使用者可以建立自己的評估系統。評估是你衡量技能有效性的真實來源。
</Note>

### 與 Claude 一起迭代開發技能

最有效的技能開發過程涉及 Claude 本身。與一個 Claude 例項（"Claude A"）一起建立技能，該技能將被其他例項（"Claude B"）使用。Claude A 幫助你設計和最佳化指令，而 Claude B 在真實任務中測試它們。這之所以有效，是因為 Claude 模型既理解如何編寫有效的智慧體指令，也理解智慧體需要什麼資訊。

**建立新技能：**

1. **不用技能完成一個任務**：用正常提示與 Claude A 一起解決問題。工作過程中，你自然會提供脈絡 (Context)、解釋偏好、分享流程知識。注意你反覆提供了什麼資訊。

2. **識別可複用的模式**：完成任務後，識別你提供的哪些脈絡 (Context)對類似的未來任務有用。

   **示例**：如果你完成了一個 BigQuery 分析，你可能提供了表名、欄位定義、過濾規則（如"始終排除測試賬戶"）和常見查詢模式。

3. **讓 Claude A 建立技能**："建立一個技能來捕獲我們剛剛使用的 BigQuery 分析模式。包含表 schema、命名約定和關於過濾測試賬戶的規則。"

   <Tip>
     Claude 模型原生理解技能的格式和結構。你不需要特殊的系統提示或"編寫技能"技能來讓 Claude 幫助建立技能。只需讓 Claude 建立技能，它就會生成結構正確的 SKILL.md 內容，包含適當的 frontmatter 和正文。
   </Tip>

4. **審查簡潔性**：檢查 Claude A 是否添加了不必要的解釋。問："去掉關於什麼是勝率的解釋——Claude 已經知道了。"

5. **改善資訊架構**：讓 Claude A 更有效地組織內容。例如："組織一下，讓表 schema 在一個獨立的參考檔案中。我們以後可能會新增更多表。"

6. **在類似任務上測試**：用 Claude B（載入了技能的全新例項）在相關案例上使用技能。觀察 Claude B 是否找到了正確的資訊、正確應用規則、成功處理了任務。

7. **基於觀察迭代**：如果 Claude B 遇到困難或遺漏了什麼，帶著具體情況回到 Claude A："當 Claude 使用這個技能時，它忘了在 Q4 按日期過濾。我們應該新增一個關於日期過濾模式的章節嗎？"

**迭代現有技能：**

改進技能時繼續同樣的層級模式。你在以下之間交替：

* **與 Claude A 合作**（幫助最佳化技能的專家）
* **用 Claude B 測試**（使用技能執行真實工作的智慧體）
* **觀察 Claude B 的行為**並將見解帶回 Claude A

1. **在真實工作流中使用技能**：給 Claude B（載入了技能的）實際任務，而非測試場景

2. **觀察 Claude B 的行為**：記錄它在哪裡遇到困難、成功或做出意外選擇

   **觀察示例**："當我讓 Claude B 做區域銷售報告時，它寫了查詢但忘了過濾測試賬戶，儘管技能提到了這條規則。"

3. **回到 Claude A 進行改進**：分享當前 SKILL.md 並描述你觀察到的。問："我注意到 Claude B 在我要求區域報告時忘了過濾測試賬戶。技能提到了過濾，但也許不夠突出？"

4. **審查 Claude A 的建議**：Claude A 可能建議重組以使規則更突出，使用更強的語言如"必須過濾"而非"始終過濾"，或重構工作流章節。

5. **應用並測試更改**：用 Claude A 的改進更新技能，然後在類似請求上再次用 Claude B 測試

6. **基於使用重複**：在遇到新場景時繼續這個觀察-最佳化-測試迴圈。每次迭代基於真實的智慧體行為而非假設來改進技能。

**收集團隊反饋：**

1. 與團隊成員分享技能並觀察他們的使用
2. 問：技能是否在預期時啟用？指令清楚嗎？缺少什麼？
3. 整合反饋以解決你自己使用模式中的盲點

**為什麼這種方法有效**：Claude A 理解智慧體需求，你提供領域專業知識，Claude B 通過真實使用揭示差距，迭代最佳化基於觀察到的行為而非假設來改進技能。

### 觀察 Claude 如何導航技能

迭代技能時，注意 Claude 在實踐中實際如何使用它們。留意：

* **意外的探索路徑**：Claude 是否以你未預期的順序讀取檔案？這可能表明你的結構不如你想的直觀
* **遺漏的連線**：Claude 是否未能跟隨到重要檔案的引用？你的連結可能需要更明確或更突出
* **過度相依性某些章節**：如果 Claude 反覆讀取同一檔案，考慮該內容是否應該放在主 SKILL.md 中
* **被忽略的內容**：如果 Claude 從不訪問某個捆綁檔案，它可能不必要或在主指令中訊號不明確

基於這些觀察而非假設來迭代。技能後設資料中的"name"和"description"尤其關鍵。Claude 使用它們來決定是否為當前任務觸發技能。確保它們清楚地描述技能做什麼以及何時使用。

## 要避免的反模式

### 避免 Windows 風格的路徑

始終在檔案路徑中使用正斜槓，即使在 Windows 上：

* ✓ **好的**：`scripts/helper.py`、`reference/guide.md`
* ✗ **避免**：`scripts\helper.py`、`reference\guide.md`

Unix 風格的路徑在所有平臺上都能工作，而 Windows 風格的路徑在 Unix 系統上會出錯。

### 避擴音供太多選項

除非必要，不要展示多種方案：

````markdown  theme={null}
**差的示例：太多選擇**（令人困惑）：
"你可以使用 pypdf，或 pdfplumber，或 PyMuPDF，或 pdf2image，或……"

**好的示例：提供預設方案**（有備用方案）：
"使用 pdfplumber 進行文本提取：
```python
import pdfplumber
```

對於需要 OCR 的掃描 PDF，改用 pdf2image 加 pytesseract。"
````

## 高階：帶可執行程式碼的技能

以下章節聚焦於包含可執行指令碼的技能。如果你的技能只使用 markdown 指令，跳到[有效技能清單](#checklist-for-effective-skills)。

### 解決問題，不要甩鍋

編寫技能的指令碼時，處理錯誤條件而不是甩給 Claude。

**好的示例：明確處理錯誤**：

```python  theme={null}
def process_file(path):
    """處理檔案，如果不存在則建立。"""
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        # 建立帶預設內容的檔案而非失敗
        print(f"檔案 {path} 未找到，正在建立預設檔案")
        with open(path, 'w') as f:
            f.write('')
        return ''
    except PermissionError:
        # 提供替代方案而非失敗
        print(f"無法訪問 {path}，使用預設值")
        return ''
```

**差的示例：甩給 Claude**：

```python  theme={null}
def process_file(path):
    # 直接失敗讓 Claude 來處理
    return open(path).read()
```

配置引數也應該有理由和文件說明，以避免"巫術常量"（Ousterhout 定律）。如果你不知道正確的值，Claude 怎麼確定？

**好的示例：自文件化**：

```python  theme={null}
# HTTP 請求通常在 30 秒內完成
# 更長的超時考慮了慢速連線
REQUEST_TIMEOUT = 30

# 三次重試平衡了可靠性和速度
# 大多數間歇性故障在第二次重試時就解決了
MAX_RETRIES = 3
```

**差的示例：魔法數字**：

```python  theme={null}
TIMEOUT = 47  # 為什麼是 47？
RETRIES = 5   # 為什麼是 5？
```

### 提供實用指令碼

即使 Claude 可以編寫指令碼，預製指令碼有其優勢：

**實用指令碼的好處**：

* 比生成的程式碼更可靠
* 節省 token（無需在脈絡 (Context)中包含程式碼）
* 節省時間（無需程式碼生成）
* 確保跨使用的一致性

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=4bbc45f2c2e0bee9f2f0d5da669bad00" alt="將可執行指令碼與指令檔案捆綁在一起" data-og-width="2048" width="2048" data-og-height="1154" height="1154" data-path="images/agent-skills-executable-scripts.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=9a04e6535a8467bfeea492e517de389f 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=e49333ad90141af17c0d7651cca7216b 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=954265a5df52223d6572b6214168c428 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=2ff7a2d8f2a83ee8af132b29f10150fd 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=48ab96245e04077f4d15e9170e081cfb 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=0301a6c8b3ee879497cc5b5483177c90 2500w" />

上圖展示了可執行指令碼如何與指令檔案協同工作。指令檔案（forms.md）引用指令碼，Claude 可以在不將其內容載入到脈絡 (Context)中的情況下執行它。

**重要區分**：在指令中明確說明 Claude 應該：

* **執行指令碼**（最常見）："執行 `analyze_form.py` 提取欄位"
* **作為參考閱讀**（用於複雜邏輯）："參見 `analyze_form.py` 瞭解欄位提取演算法"

對於大多數實用指令碼，執行是首選因為它更可靠和高效。參見下方[執行時環境](#runtime-environment)章節瞭解指令碼執行的工作原理。

**示例**：

````markdown  theme={null}
## 實用指令碼

**analyze_form.py**：從 PDF 中提取所有表單欄位

```bash
python scripts/analyze_form.py input.pdf > fields.json
```

輸出格式：
```json
{
  "field_name": {"type": "text", "x": 100, "y": 200},
  "signature": {"type": "sig", "x": 150, "y": 500}
}
```

**validate_boxes.py**：檢查邊界框是否重疊

```bash
python scripts/validate_boxes.py fields.json
# 返回："OK" 或列出衝突
```

**fill_form.py**：將欄位值應用到 PDF

```bash
python scripts/fill_form.py input.pdf fields.json output.pdf
```
````

### 使用視覺分析

當輸入可以渲染為影像時，讓 Claude 分析它們：

````markdown  theme={null}
## 表單佈局分析

1. 將 PDF 轉換為影像：
   ```bash
   python scripts/pdf_to_images.py form.pdf
   ```

2. 分析每個頁面影像以識別表單欄位
3. Claude 可以直觀地看到欄位位置和型別
````

<Note>
  在此示例中，你需要編寫 `pdf_to_images.py` 指令碼。
</Note>

Claude 的視覺能力有助於理解佈局和結構。

### 建立可驗證的中間輸出

當 Claude 執行復雜的開放性任務時，它可能會出錯。"計劃-驗證-執行"模式通過讓 Claude 首先建立結構化格式的計劃，然後用指令碼驗證該計劃再執行，來及早發現錯誤。

**示例**：想像讓 Claude 根據電子表格更新 PDF 中的 50 個表單欄位。沒有驗證的話，Claude 可能引用不存在的欄位、建立衝突的值、遺漏必填欄位或錯誤地應用更新。

**解決方案**：使用上面展示的工作流模式（PDF 表單填寫），但新增一箇中間 `changes.json` 檔案在應用更改前進行驗證。工作流變為：分析 → **建立計劃檔案** → **驗證計劃** → 執行 → 驗證。

**為什麼這個模式有效：**

* **及早發現錯誤**：驗證在更改應用前發現問題
* **機器可驗證**：指令碼提供客觀驗證
* **可逆的規劃**：Claude 可以在不觸碰原件的情況下迭代計劃
* **清晰的除錯**：錯誤訊息指向具體問題

**何時使用**：批次操作、破壞性更改、複雜驗證規則、高風險操作。

**實現提示**：讓驗證指令碼輸出詳細的具體錯誤訊息，如"欄位 'signature\_date' 未找到。可用欄位：customer\_name、order\_total、signature\_date\_signed"，以幫助 Claude 修復問題。

### 打包相依性

技能在程式碼執行環境中執行，有平臺特定的限制：

* **claude.ai**：可以從 npm 和 PyPI 安裝包，可以從 GitHub 倉庫拉取
* **Anthropic API**：沒有網路訪問，沒有執行時包安裝

在 SKILL.md 中列出所需的包，並在[程式碼執行工具文件](/en/docs/agents-and-tools/tool-use/code-execution-tool)中驗證它們是否可用。

### 執行時環境

技能在具有檔案系統訪問、bash 命令和程式碼執行能力的程式碼執行環境中執行。關於此架構的概念解釋，請參閱概述中的[技能架構](/en/docs/agents-and-tools/agent-skills/overview#the-skills-architecture)。

**這對你的編寫有什麼影響：**

**Claude 如何訪問技能：**

1. **後設資料預載入**：啟動時，所有技能的 YAML frontmatter 中的 name 和 description 被載入到系統提示中
2. **檔案按需讀取**：Claude 在需要時使用 bash Read 工具從檔案系統訪問 SKILL.md 和其他檔案
3. **指令碼高效執行**：實用指令碼可以通過 bash 執行而不將其完整內容載入到脈絡 (Context)中。只有指令碼的輸出消耗 token
4. **大檔案無脈絡 (Context)懲罰**：參考檔案、資料或文件在實際讀取之前不消耗脈絡 (Context) token

* **檔案路徑很重要**：Claude 像檔案系統一樣導航你的技能目錄。使用正斜槓（`reference/guide.md`），而非反斜槓
* **描述性檔案命名**：使用表明內容的名稱：`form_validation_rules.md`，而非 `doc2.md`
* **為發現而組織**：按領域或功能組織目錄結構
  * 好的：`reference/finance.md`、`reference/sales.md`
  * 差的：`docs/file1.md`、`docs/file2.md`
* **捆綁全面的資源**：包含完整的 API 文件、大量示例、大型資料集；在訪問之前沒有脈絡 (Context)懲罰
* **確定性操作優先使用指令碼**：編寫 `validate_form.py` 而非讓 Claude 生成驗證程式碼
* **明確執行意圖**：
  * "執行 `analyze_form.py` 提取欄位"（執行）
  * "參見 `analyze_form.py` 瞭解提取演算法"（作為參考閱讀）
* **測試檔案訪問模式**：通過真實請求測試驗證 Claude 能夠導航你的目錄結構

**示例：**

```
bigquery-skill/
├── SKILL.md（概述，指向參考檔案）
└── reference/
    ├── finance.md（收入指標）
    ├── sales.md（管道資料）
    └── product.md（使用分析）
```

當用戶詢問收入時，Claude 讀取 SKILL.md，看到對 `reference/finance.md` 的引用，並呼叫 bash 只讀取該檔案。sales.md 和 product.md 檔案留在檔案系統上，在需要之前消耗零脈絡 (Context) token。這種基於檔案系統的模型是漸進式披露的基礎。Claude 可以導航並選擇性地載入每個任務所需的內容。

完整的技術架構細節請參閱技能概述中的[技能工作原理](/en/docs/agents-and-tools/agent-skills/overview#how-skills-work)。

### MCP 工具引用

如果你的技能使用 MCP（模型脈絡 (Context)協議）工具，始終使用完全限定的工具名稱以避免"工具未找到"錯誤。

**格式**：`ServerName:tool_name`

**示例**：

```markdown  theme={null}
使用 BigQuery:bigquery_schema 工具檢索表 schema。
使用 GitHub:create_issue 工具建立 issue。
```

其中：

* `BigQuery` 和 `GitHub` 是 MCP 伺服器名稱
* `bigquery_schema` 和 `create_issue` 是這些伺服器中的工具名稱

沒有伺服器字首，Claude 可能無法定位工具，尤其是當有多個 MCP 伺服器可用時。

### 避免假設工具已安裝

不要假設包已可用：

````markdown  theme={null}
**差的示例：假設已安裝**：
"使用 pdf 庫處理檔案。"

**好的示例：明確相依性**：
"安裝所需包：`pip install pypdf`

然後使用它：
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
```"
````

## 技術說明

### YAML frontmatter 要求

SKILL.md 的 frontmatter 只包含 `name`（最多 64 字元）和 `description`（最多 1024 字元）欄位。完整的結構細節請參閱[技能概述](/en/docs/agents-and-tools/agent-skills/overview#skill-structure)。

### Token 預算

保持 SKILL.md 正文在 500 行以內以獲得最佳效能。如果內容超過此限制，使用前面描述的漸進式披露模式將其拆分到獨立檔案。架構細節請參閱[技能概述](/en/docs/agents-and-tools/agent-skills/overview#how-skills-work)。

## 有效技能清單

分享技能前，驗證：

### 核心質量

* [ ] 描述具體且包含關鍵術語
* [ ] 描述同時包含技能做什麼和何時使用
* [ ] SKILL.md 正文在 500 行以內
* [ ] 額外細節在獨立檔案中（如果需要）
* [ ] 無時間敏感資訊（或在"舊模式"章節中）
* [ ] 全文術語一致
* [ ] 示例具體，非抽象
* [ ] 檔案引用一層深度
* [ ] 適當使用漸進式披露
* [ ] 工作流有清晰的步驟

### 程式碼和指令碼

* [ ] 指令碼解決問題而非甩給 Claude
* [ ] 錯誤處理明確且有幫助
* [ ] 無"巫術常量"（所有值有理由）
* [ ] 所需包在指令中列出且已驗證可用
* [ ] 指令碼有清晰的文件
* [ ] 無 Windows 風格路徑（全部使用正斜槓）
* [ ] 關鍵操作有驗證/確認步驟
* [ ] 質量關鍵任務包含反饋迴圈

### 測試

* [ ] 至少建立三個評估
* [ ] 用 Haiku、Sonnet 和 Opus 測試過
* [ ] 用真實使用場景測試過
* [ ] 整合了團隊反饋（如適用）

## 後續步驟

<CardGroup cols={2}>
  <Card title="開始使用 Agent Skills" icon="rocket" href="/en/docs/agents-and-tools/agent-skills/quickstart">
    建立你的第一個技能
  </Card>

  <Card title="在 Claude Code 中使用技能" icon="terminal" href="/en/docs/claude-code/skills">
    在 Claude Code 中建立和管理技能
  </Card>

  <Card title="通過 API 使用技能" icon="code" href="/en/api/skills-guide">
    以程式設計方式上傳和使用技能
  </Card>
</CardGroup>
