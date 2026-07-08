# AI 開發成本優化與 Agent 工作流實戰 教學課程實作計劃

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推薦）或 superpowers:executing-plans 逐任務實現此計劃。步驟使用核取方塊（`- [ ]`）語法來跟蹤進度。

**目標：** 在專案中建立一份精緻、詳盡的 Markdown 教學課程文件 `docs/tutorials/ai-cost-optimization-course.md`，仿照多奇教育訓練的課程結構，教導開發者如何在 AI Agent 協作開發中實踐「Token 省錢術」與「快取優化技術」，並在 `README.md` 中新增課程入口。

**架構：**
1. 建立教學目錄 `docs/tutorials/`，並寫入 `ai-cost-optimization-course.md`。
2. 撰寫單元一至三：看懂 Token 計費原理、快取命中（CLAUDE.md/AGENTS.md）省錢技術、個人實戰省錢問法。
3. 撰寫單元四至六：子任務工作流與對話壓縮（/compact/checkpoint）、MCP 工具輸出限流、LiteLLM 與監控治理架構。
4. 修改 `README.md` 導入此教學。

**技術棧：** Markdown 排版規範、GitHub Flavored Markdown、Mermaid 流程圖、AI Token 成本計算模型。

---

## 檔案結構與變更

* **[NEW] [ai-cost-optimization-course.md](file:///d:/github/chiisen/survivor.js/docs/tutorials/ai-cost-optimization-course.md)**：教學課程主體。
* **[MODIFY] [README.md](file:///d:/github/chiisen/survivor.js/README.md)**：新增課程入口連結與說明。

---

## 任務列表

### 任務 1：建立教學課程主體並撰寫單元 1 ~ 3

**檔案：**
- 建立：`docs/tutorials/ai-cost-optimization-course.md`

- [ ] **步驟 1：建立教學課程檔案並撰寫前言與單元 1 (AI 用量計費時代)**
  * 內容需包含：Token 計費的新現實、為什麼 AI 寫程式比聊天更容易燒 Token、隱性成本分析。

- [ ] **步驟 2：撰寫單元 2 (Token 成本結構與快取快省錢原理)**
  * 內容需包含：input/output/cached tokens 差異、快取命中規則、AGENTS.md 與 CLAUDE.md 的成本影響、Agent Skills 如何節省 Token。

- [ ] **步驟 3：撰寫單元 3 (降低 Token 浪費的個人實戰技巧)**
  * 內容需包含：任務拆小原則、不隨意掃描全專案、不盲貼大日誌、模型分級調配策略。

- [ ] **步驟 4：Commit 任務 1**
  ```bash
  git add docs/tutorials/ai-cost-optimization-course.md
  git commit -m "docs(course): 新增 AI 開發成本優化課程與單元 1~3"
  ```

---

### 任務 2：撰寫教學課程單元 4 ~ 6

**檔案：**
- 修改：`docs/tutorials/ai-cost-optimization-course.md`

- [ ] **步驟 1：撰寫單元 4 (子任務分工、分支探索與上下文控管)**
  * 內容需包含：子任務隔離主上下文、/fork、/side、/btw 的使用時機、/compact 壓縮技巧與 checkpoint 設計。

- [ ] **步驟 2：撰寫單元 5 (MCP 成本黑洞與工具輸出控管)**
  * 內容需包含：MCP 為什麼是 Token 黑洞、工具輸出五大限流原則、回傳「下一步需要的資訊」而非全文。

- [ ] **步驟 3：撰寫單元 6 (用量監控與團隊成本治理架構)**
  * 內容需包含：LiteLLM 的架設與 API 轉接、OpenTelemetry 監控、用量報表與治理規範。

- [ ] **步驟 4：Commit 任務 2**
  ```bash
  git add docs/tutorials/ai-cost-optimization-course.md
  git commit -m "docs(course): 完成課程單元 4~6 特效與治理實戰內容"
  ```

---

### 任務 3：在 README 中新增課程入口

**檔案：**
- 修改：`README.md`

- [ ] **步驟 1：修改 README.md 加入課程說明與連結**
  * 在顯眼處加入課程推薦標題、課程大綱簡介，並連結至 `docs/tutorials/ai-cost-optimization-course.md`。

- [ ] **步驟 2：Commit 任務 3**
  ```bash
  git add README.md
  git commit -m "docs: 於 README 新增 AI 成本優化課程學習入口"
  ```
