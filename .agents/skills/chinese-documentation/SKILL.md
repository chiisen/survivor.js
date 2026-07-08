---
name: chinese-documentation
description: 中文文件排版參考——中英文空格、全半形標點、術語保留、連結格式、中文文案排版指北約定。僅在使用者顯式 /chinese-documentation 時呼叫，不要根據脈絡 (Context)自動觸發。
version: "1.0.0"
license: MIT
metadata:
  hermes:
    tags: [documentation, chinese]
---

# 中文技術文件寫作規範

## 概述

中文技術文件最常見的問題不是內容不夠，而是**讀起來彆扭**——中英文擠在一起沒有空格、全形半形混用、一股機翻味。本技能提供一套完整的中文技術文件寫作規範，讓你的文件**專業、好讀、不出戲**。

**核心原則：** 排版服務於閱讀體驗，規範服務於一致性，內容服務於讀者。

**參考標準：** [中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines)

## 中文排版規範

### 空格

**中英文之間加空格：**

```
# 好
使用 Git 進行版本管理，配合 Jenkins 實現持續整合。

# 壞
使用Git進行版本管理，配合Jenkins實現持續整合。
```

**中文與數字之間加空格：**

```
# 好
本次更新包含 3 個新功能和 12 個 Bug 修復。

# 壞
本次更新包含3個新功能和12個Bug修復。
```

**數字與單位之間加空格：**

```
# 好
檔案大小不超過 5 MB，響應時間控制在 200 ms 以內。

# 壞
檔案大小不超過5MB，響應時間控制在200ms以內。
```

**例外：度數、百分比等不加空格：**

```
# 好
今天氣溫 32°C，CPU 使用率 95%。

# 壞
今天氣溫 32 °C，CPU 使用率 95 %。
```

**連結前後加空格：**

```
# 好
請參考 [官方文件](https://example.com) 獲取更多資訊。

# 壞
請參考[官方文件](https://example.com)獲取更多資訊。
```

### 標點符號

**中文語境使用全形標點：**

```
# 好
注意：該介面需要鑑權，請先獲取 Token。

# 壞
注意:該介面需要鑑權,請先獲取 Token.
```

**全形標點與英文/數字之間不加空格：**

```
# 好
專案使用 MIT 協議，詳見 LICENSE 檔案。

# 壞
專案使用 MIT 協議 ，詳見 LICENSE 檔案 。
```

**括號的使用：**

```
# 中文語境用全形括號
請執行安裝命令（詳見下方說明）。

# 括號內有英文或數字時用半形括號
該專案基於 Spring Boot (v3.2.0) 開發。

# 純英文內容用半形括號
See the documentation (README.md) for details.
```

**引號的使用：**

```
# 中文使用直角引號（推薦）
「確定」按鈕觸發表單提交，「取消」按鈕關閉彈窗。

# 也可以使用彎引號（視團隊規範而定）
"確定"按鈕觸發表單提交，"取消"按鈕關閉彈窗。

# 巢狀引號
他說：「請點選『確定』按鈕。」
```

### 數字

```
# 阿拉伯數字（技術文件中統一使用半形數字）
支援最多 100 個併發連線。

# 不要用中文數字寫技術引數
# 壞：支援最多一百個併發連線。

# 數字使用半形字元
版本號 v2.1.0，埠號 8080，HTTP 狀態碼 200。
```

## 中英混排最佳實踐

### 術語處理原則

**保留英文的情況：**

- 專有名詞：React、Kubernetes、Redis、MySQL
- 行業通用縮寫：API、SDK、CLI、ORM、CI/CD
- 命令和程式碼：`npm install`、`git commit`
- 協議和標準：HTTP、TCP/IP、JSON、REST
- 沒有公認中文翻譯的術語：debounce、throttle、middleware

**翻譯為中文的情況：**

- 有公認翻譯的通用概念：資料庫、伺服器、瀏覽器、框架
- 描述性短語：version control → 版本控制，load balancing → 負載均衡
- 文件標題和章節名（儘量中文，技術名詞可保留英文）

### 首次出現標註翻譯

技術術語首次出現時，標註中英對照：

```
# 好
本系統採用訊息佇列（Message Queue）實現非同步通訊，
使用死信佇列（Dead Letter Queue）處理消費失敗的訊息。

# 後續出現直接使用
訊息佇列的消費者需要實現冪等性……
```

### 避免過度翻譯

```
# 好：保留業界通用英文術語
在 Controller 層做引數校驗，Service 層處理業務邏輯。

# 壞：強行翻譯反而看不懂
在控制器層做引數校驗，服務層處理業務邏輯。

# 好
使用 Redis 做 Session 快取。

# 壞
使用"遠端字典服務"做"會話"快取。
```

## API 文件中英對照格式

### 介面文件模板

```markdown
## 建立訂單 / Create Order

### 基本資訊

- **請求方式 (Method):** POST
- **請求路徑 (Path):** `/api/v1/orders`
- **鑑權方式 (Auth):** Bearer Token
- **Content-Type:** application/json

### 請求引數 (Request Parameters)

| 引數名 (Field) | 型別 (Type) | 必填 (Required) | 說明 (Description) |
|----------------|-------------|-----------------|-------------------|
| product_id | string | 是 | 商品 ID (Product ID) |
| quantity | integer | 是 | 購買數量 (Quantity)，最小值為 1 |
| address_id | string | 是 | 收貨地址 ID (Shipping address ID) |
| coupon_code | string | 否 | 優惠券碼 (Coupon code) |

### 請求示例 (Request Example)

\```json
{
  "product_id": "prod_abc123",
  "quantity": 2,
  "address_id": "addr_xyz789",
  "coupon_code": "SUMMER2024"
}
\```

### 響應引數 (Response Parameters)

| 引數名 (Field) | 型別 (Type) | 說明 (Description) |
|----------------|-------------|-------------------|
| order_id | string | 訂單 ID (Order ID) |
| status | string | 訂單狀態 (Order status): pending / paid / shipped |
| total_amount | integer | 訂單總金額，單位：分 (Total amount in cents) |
| created_at | string | 建立時間 (Created at)，ISO 8601 格式 |

### 響應示例 (Response Example)

\```json
{
  "code": 0,
  "message": "success",
  "data": {
    "order_id": "ord_20240315001",
    "status": "pending",
    "total_amount": 9900,
    "created_at": "2024-03-15T10:30:00+08:00"
  }
}
\```

### 錯誤碼 (Error Codes)

| 錯誤碼 (Code) | 說明 (Description) | 處理建議 (Suggestion) |
|---------------|--------------------|--------------------|
| 40001 | 商品不存在 (Product not found) | 檢查 product_id 是否正確 |
| 40002 | 庫存不足 (Insufficient stock) | 減少購買數量或稍後重試 |
| 40003 | 優惠券已過期 (Coupon expired) | 移除 coupon_code 或更換優惠券 |
```

### 金額表示約定

```
# 好：明確說明單位
total_amount: 9900  // 單位：分（即 99.00 元）

# 壞：不說明單位，造成歧義
total_amount: 99.00  // 是元還是分？浮點數會有精度問題
```

## README.md 中文模板

國內開源專案常用的 README 結構：

```markdown
# 專案名稱

[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

簡短一句話介紹專案是什麼、解決什麼問題。

## 特性

- 特性一：簡要描述
- 特性二：簡要描述
- 特性三：簡要描述

## 快速開始

### 環境要求

- Node.js >= 20
- MySQL >= 8.0

### 安裝

\```bash
npm install your-package
\```

### 基本用法

\```typescript
import { YourPackage } from 'your-package';

const client = new YourPackage({ apiKey: 'your-key' });
const result = await client.doSomething();
\```

## 文件

- [使用指南](./docs/guide.md)
- [API 參考](./docs/api.md)
- [常見問題](./docs/faq.md)
- [更新日誌](./CHANGELOG.md)

## 示例

更多示例請檢視 [examples](./examples) 目錄。

## 貢獻指南

歡迎提交 Issue 和 Pull Request。請先閱讀 [貢獻指南](./CONTRIBUTING.md)。

### 本地開發

\```bash
# 克隆專案
git clone https://gitee.com/your-org/your-project.git

# 安裝相依性
npm install

# 啟動開發伺服器
npm run dev

# 執行測試
npm test
\```

## 致謝

- [相依性專案一](https://example.com) — 簡要說明
- [相依性專案二](https://example.com) — 簡要說明

## 許可證

[MIT](./LICENSE)
```

## 常見問題與避坑指南

### 問題一：機翻味

**特徵：** 句式生硬、不符合中文表達習慣。

```
# 機翻味
這個函式被用來計算使用者的折扣。如果你想要獲取更多資訊，請參考文件。

# 自然中文
這個函式用於計算使用者折扣。更多資訊請參考文件。
```

**要點：**
- 避免被動語態（"被用來" → "用於"）
- 避免冗餘代詞（"你想要" → 直接說）
- 避免直譯英文句式

### 問題二：句式歐化

**特徵：** 長定語、多重從句、一句話說不完。

```
# 歐化句式
這是一個可以幫助開發者在不需要手動配置複雜的構建工具鏈的情況下
快速搭建現代化前端專案的腳手架工具。

# 正常中文
這是一個前端腳手架工具，幫助開發者快速搭建專案，免去手動配置構建工具鏈的麻煩。
```

**要點：**
- 長句拆成短句
- 把定語從句改成並列句
- 一句話只說一件事

### 問題三：過度翻譯

```
# 過度翻譯
請開啟您的"終端模擬器"，執行"節點包管理器"的安裝命令。

# 正常寫法
請開啟終端，執行 npm install。
```

### 問題四：中英標點混用

```
# 壞：中文句子用了英文逗號和句號
請先安裝相依性,然後執行測試.

# 好：中文句子用全形標點
請先安裝相依性，然後執行測試。

# 壞：英文內容用了中文標點
Run `npm install`，then `npm test`。

# 好：英文內容用半形標點
Run `npm install`, then `npm test`.
```

### 問題五：缺乏結構化

```
# 壞：一大段文字沒有分段
本系統使用 Redis 做快取提高查詢效能同時使用 MySQL 做持久化儲存
資料寫入時先寫 MySQL 再非同步更新 Redis 快取讀取時先查 Redis 如果
未命中再查 MySQL 並將結果回寫快取設定過期時間為 30 分鐘……

# 好：用列表和分段組織資訊
本系統的快取策略如下：

- **儲存層：** MySQL（持久化）+ Redis（快取）
- **寫入流程：** 先寫 MySQL，再非同步更新 Redis
- **讀取流程：** 先查 Redis → 未命中則查 MySQL → 回寫 Redis
- **快取過期：** TTL 設為 30 分鐘
```

## 寫作檢查清單

在釋出文件前，逐項檢查：

### 排版

- [ ] 中英文之間有空格
- [ ] 中文與數字之間有空格
- [ ] 中文語境使用全形標點
- [ ] 英文/程式碼部分使用半形標點
- [ ] 沒有全形半形標點混用

### 術語

- [ ] 專有名詞保留英文原文
- [ ] 首次出現的術語標註了中英對照
- [ ] 沒有過度翻譯業界通用術語
- [ ] 術語使用前後一致

### 內容

- [ ] 句子簡短，沒有歐化長句
- [ ] 沒有不必要的被動語態
- [ ] 用列表和表格組織結構化資訊
- [ ] 程式碼示例可以直接執行
- [ ] 沒有"機翻味"

### 格式

- [ ] 標題層級正確（不跳級）
- [ ] 程式碼塊標註了語言型別
- [ ] 連結可以正常訪問
- [ ] 圖片有 alt 文本
