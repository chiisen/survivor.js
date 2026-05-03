# 解決設計稿文字說明導致切圖錯亂的方法

## 問題分析

設計稿通常包含：
- ✅ **素材本身**（tiles、環境物件）
- ❌ **設計說明文字**（「草地板」、「石頭」、「尺寸標註」等）
- ❌ **設計師注释**
- ❌ **分類標籤**

自動裁切時會誤把文字區域當成素材，導致：
- 切出來的圖片包含文字說明
- 素材位置定位錯亂
- 尺寸計算錯誤

---

## 解決方案 1：手動框選工具（推薦）

**檔案**：`tilesetCleaner.html`

**操作流程**：
1. 打開 `tilesetCleaner.html`
2. 點擊「➕ 新增素材位置」
3. 在設計稿上**框選**純素材區域（避開文字）
4. 重複框選所有素材
5. 點擊「💾 生成乾淨圖集」
6. 自動下載 `clean_tileset.png`

**優點**：
- ✅ 完全避開文字說明
- ✅ 可精確控制裁切範圍
- ✅ 生成的圖集自動對齊 32x32 格子
- ✅ 可視化框選過程，即時预览

---

## 解決方案 2：圖片編輯軟體裁切（最簡單）

**工具**：Photoshop、GIMP、線上工具（如 Photopea）

**操作**：
1. 打開原始設計稿
2. 手動裁切純素材區域
3. 刪除文字說明、標註
4. 將乾淨素材拼接成新圖集
5. 導出為 `clean_tileset.png`

**優點**：
- ✅ 精確控制素材品質
- ✅ 可調整素材大小、顏色
- ✅ 無需寫代碼

**缺點**：
- ❌ 需要圖片編輯技能
- ❌ 手動拼接耗時

---

## 解決方案 3：修改 tileDefinitions 定義（快速修復）

**方法**：手動測量實際素材位置，避開文字區域

**範例**：

```javascript
// 原本的錯誤定義（包含文字說明）
this.tileDefinitions = {
    grass: { x: 0, y: 0, width: 32, height: 32 },  // ❌ 可能切到「草地」文字
};

// 修改為避開文字的精確位置
this.tileDefinitions = {
    grass: { x: 150, y: 200, width: 32, height: 32 },  // ✅ 只切純素材
};
```

**測量工具**：
- 用瀏覽器打開設計稿
- 開啟開發者工具 Console
- 使用 `tileManager.drawTilesetGrid(ctx)` 查看網格線和座標

**優點**：
- ✅ 不需修改原始圖片
- ✅ 快速調整定義

**缺點**：
- ❌ 需手動測量每個素材位置
- ❌ 容易出錯

---

## 解決方案 4：自動化裁切腳本（進階）

**原理**：分析圖片特徵，自動識別素材區域

**判斷邏輯**：
- 純色區域 = 素材
- 文字區域 = 有多種顏色、筆畫特徵
- 透明度分析 = 素材通常有透明邊框

**範例代碼**：

```javascript
// 自動識別素材區域（簡化版）
function autoDetectTiles(imageData) {
    const tiles = [];
    
    for (let y = 0; y < imageData.height; y += 32) {
        for (let x = 0; x < imageData.width; x += 32) {
            const region = analyzeRegion(imageData, x, y, 32, 32);
            
            // 如果區域顏色單一，判定為素材
            if (region.colorVariety < threshold) {
                tiles.push({ x, y, width: 32, height: 32 });
            }
        }
    }
    
    return tiles;
}
```

**優點**：
- ✅ 全自動處理
- ✅ 可批量處理多張設計稿

**缺點**：
- ❌ 需圖像處理知識
- ❌ 演算法可能判

---

## 推薦方案

### 新手 → 方案 2（圖片編輯軟體）
最簡單、最可靠，無需編程

### 進階 → 方案 1（手動框選工具）
可視化操作、自動生成乾淨圖集

### 專業 → 方案 4（自動化腳本）
批量處理、整合到開發流程

---

## 使用建議

1. **先用方案 1（手動框選工具）生成乾淨圖集**
2. 將生成的 `clean_tileset.png` 替換原始設計稿
3. 更新 `tileManager.js` 的素材路徑：
   ```javascript
   img.src = 'images/clean_tileset.png';
   ```
4. 使用新的乾淨圖集進行遊戲開發

---

## 範例：完整的清理流程

```bash
# 1. 打開清理工具
npm run dev
# 瀏覽器打開 http://localhost:3000/tilesetCleaner.html

# 2. 框選素材
# 在設計稿上框選所有純素材區域（約 10-20 個）

# 3. 生成乾淨圖集
# 點擊「生成乾淨圖集」按鈕

# 4. 下載結果
# clean_tileset.png 自動下載

# 5. 替換原始檔案
mv clean_tileset.png images/clean_tileset.png

# 6. 更新 tileManager.js
# img.src = 'images/clean_tileset.png';
```

---

## 常見問題

**Q：框選時如何避開文字？**
A：只框選純色區域，文字通常有筆畫、多種顏色，視覺上容易識別。

**Q：生成的圖集尺寸不對？**
A：清理工具會自動將所有素材統一為 32x32，如有特殊尺寸素材，需修改 `tileSize` 參數。

**Q：如何確認切圖結果正確？**
A：使用 `tilePreview.html` 预览生成的乾淨圖集，確認每個 tile 都是純素材。

**Q：能否保留原始設計稿？**
A：可以，清理後生成新檔案 `clean_tileset.png`，原始檔案不受影響。