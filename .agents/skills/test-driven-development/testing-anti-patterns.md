# 測試反模式

**在以下情況載入此參考：** 編寫或修改測試、新增 mock、或想在生產程式碼中新增僅測試用方法時。

## 概述

測試必須驗證真實行為，而非 mock 行為。Mock 是隔離的手段，不是被測試的物件。

**核心原則：** 測試程式碼做了什麼，而非 mock 做了什麼。

**嚴格遵循 TDD 可以防止這些反模式。**

## 鐵律

```
1. 絕不測試 mock 行為
2. 絕不在生產類中新增僅測試用的方法
3. 絕不在不理解相依性的情況下使用 mock
```

## 反模式 1：測試 Mock 行為

**違規做法：**
```typescript
// ❌ 差：測試 mock 是否存在
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

**為什麼這是錯誤的：**
- 你在驗證 mock 能工作，而非元件能工作
- mock 存在時測試通過，不存在時失敗
- 對真實行為一無所知

**你的人類夥伴的糾正：** "我們是在測試 mock 的行為嗎？"

**正確做法：**
```typescript
// ✅ 好：測試真實元件或不要 mock 它
test('renders sidebar', () => {
  render(<Page />);  // 不要 mock sidebar
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});

// 或者如果必須 mock sidebar 來隔離：
// 不要對 mock 做斷言——測試 Page 在 sidebar 存在時的行為
```

### 門控函式

```
在對任何 mock 元素做斷言之前：
  問："我是在測試真實元件行為還是僅僅測試 mock 的存在？"

  如果是測試 mock 的存在：
    停下——刪除斷言或取消 mock

  改為測試真實行為
```

## 反模式 2：在生產程式碼中新增僅測試用方法

**違規做法：**
```typescript
// ❌ 差：destroy() 僅在測試中使用
class Session {
  async destroy() {  // 看起來像生產 API！
    await this._workspaceManager?.destroyWorkspace(this.id);
    // ... 清理
  }
}

// 在測試中
afterEach(() => session.destroy());
```

**為什麼這是錯誤的：**
- 生產類被僅測試用的程式碼汙染
- 如果在生產環境中意外呼叫會很危險
- 違反 YAGNI 和關注點分離
- 混淆了物件生命週期和實體生命週期

**正確做法：**
```typescript
// ✅ 好：測試工具處理測試清理
// Session 沒有 destroy()——它在生產中是無狀態的

// 在 test-utils/ 中
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}

// 在測試中
afterEach(() => cleanupSession(session));
```

### 門控函式

```
在向生產類新增任何方法之前：
  問："這隻被測試使用嗎？"

  如果是：
    停下——不要新增
    放到測試工具中

  問："這個類是否擁有此資源的生命週期？"

  如果否：
    停下——這個方法不屬於這個類
```

## 反模式 3：不理解相依性就使用 Mock

**違規做法：**
```typescript
// ❌ 差：Mock 破壞了測試邏輯
test('detects duplicate server', () => {
  // Mock 阻止了測試相依性的配置寫入！
  vi.mock('ToolCatalog', () => ({
    discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
  }));

  await addServer(config);
  await addServer(config);  // 應該拋異常——但不會！
});
```

**為什麼這是錯誤的：**
- 被 mock 的方法有測試相依性的副作用（寫入配置）
- "保險起見"過度 mock 破壞了實際行為
- 測試因錯誤的原因通過或莫名其妙地失敗

**正確做法：**
```typescript
// ✅ 好：在正確的層級 mock
test('detects duplicate server', () => {
  // Mock 慢的部分，保留測試需要的行為
  vi.mock('MCPServerManager'); // 只 mock 慢的伺服器啟動

  await addServer(config);  // 配置被寫入
  await addServer(config);  // 檢測到重複 ✓
});
```

### 門控函式

```
在 mock 任何方法之前：
  停下——先不要 mock

  1. 問："真實方法有什麼副作用？"
  2. 問："這個測試是否相依性這些副作用？"
  3. 問："我完全理解這個測試需要什麼嗎？"

  如果相依性副作用：
    在更底層 mock（實際的慢操作/外部操作）
    或使用保留必要行為的測試替身
    而非測試相依性的高層方法

  如果不確定測試相依性什麼：
    先用真實實現執行測試
    觀察實際需要發生什麼
    然後在正確的層級新增最少的 mock

  危險訊號：
    - "我 mock 一下保險"
    - "這可能慢，還是 mock 掉吧"
    - 不理解相依性鏈就 mock
```

## 反模式 4：不完整的 Mock

**違規做法：**
```typescript
// ❌ 差：部分 mock——只包含你認為需要的欄位
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' }
  // 缺失：下游程式碼使用的 metadata
};

// 之後：程式碼訪問 response.metadata.requestId 時崩潰
```

**為什麼這是錯誤的：**
- **部分 mock 隱藏了結構假設** — 你只 mock 了你知道的欄位
- **下游程式碼可能相依性你沒包含的欄位** — 靜默失敗
- **測試通過但整合失敗** — mock 不完整，真實 API 完整
- **虛假的信心** — 測試對真實行為什麼也沒證明

**鐵律：** Mock 真實存在的完整資料結構，而非只包含你當前測試用到的欄位。

**正確做法：**
```typescript
// ✅ 好：映象真實 API 的完整性
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
  // 真實 API 返回的所有欄位
};
```

### 門控函式

```
在建立 mock 響應之前：
  檢查："真實 API 響應包含哪些欄位？"

  操作：
    1. 從文件/示例中檢視實際 API 響應
    2. 包含系統下游可能消費的所有欄位
    3. 驗證 mock 完全匹配真實響應的結構

  關鍵：
    如果你在建立 mock，你必須理解完整的結構
    部分 mock 在程式碼相依性遺漏欄位時會靜默失敗

  不確定時：包含所有文件記錄的欄位
```

## 反模式 5：整合測試作為事後補充

**違規做法：**
```
✅ 實現完成
❌ 沒寫測試
"準備好測試了"
```

**為什麼這是錯誤的：**
- 測試是實現的一部分，不是可選的後續
- TDD 本可以防止這種情況
- 沒有測試就不能聲稱完成

**正確做法：**
```
TDD 迴圈：
1. 編寫失敗的測試
2. 實現使其通過
3. 重構
4. 然後才聲稱完成
```

## 當 Mock 變得過於複雜時

**警告訊號：**
- Mock 的 setup 比測試邏輯還長
- 為了讓測試通過而 mock 一切
- Mock 缺少真實元件擁有的方法
- Mock 變更時測試就壞了

**你的人類夥伴的問題：** "我們這裡真的需要用 mock 嗎？"

**考慮：** 使用真實元件的整合測試往往比複雜的 mock 更簡單

## TDD 如何防止這些反模式

**TDD 有幫助的原因：**
1. **先寫測試** → 迫使你思考你到底在測什麼
2. **看它失敗** → 確認測試測的是真實行為，不是 mock
3. **最少實現** → 僅測試用方法不會混入
4. **真實相依性** → 你在 mock 之前看到測試實際需要什麼

**如果你在測試 mock 行為，你違反了 TDD** — 你在沒有先用真實程式碼讓測試失敗的情況下就加了 mock。

## 快速參考

| 反模式 | 修復方式 |
|--------|----------|
| 對 mock 元素做斷言 | 測試真實元件或取消 mock |
| 生產程式碼中的僅測試用方法 | 移到測試工具中 |
| 不理解就 mock | 先理解相依性，最少 mock |
| 不完整的 mock | 完整映象真實 API |
| 測試作為事後補充 | TDD——先寫測試 |
| 過於複雜的 mock | 考慮整合測試 |

## 危險訊號

- 斷言檢查 `*-mock` test ID
- 方法僅在測試檔案中被呼叫
- Mock setup 佔測試的 >50%
- 移除 mock 測試就失敗
- 無法解釋為什麼需要 mock
- "保險起見" mock 掉

## 底線

**Mock 是隔離的工具，不是被測試的物件。**

如果 TDD 揭示你在測試 mock 行為，你已經走偏了。

修復方法：測試真實行為，或質疑為什麼要 mock。
