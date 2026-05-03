# survivor.js

網頁版生存遊戲 - 類倖存者 (Survivor-like) 遊戲 Demo

![P1](images/P1.png)

![P2](images/P2.png)

![P3](images/P3.png)

## 遊戲特色

- 純 JavaScript + HTML5 Canvas 實現
- 自動戰鬥系統：玩家專注走位，主角自動索敵射擊
- 割草體驗：高頻率敵人生成與流暢擊殺回饋
- 成長循環：擊殺 → 掉落經驗球 → 升級 → 三選一隨機天賦強化

## 操作方式

- **WASD** 或 **方向鍵**：移動角色

## 系統需求

- 現代瀏覽器（支援 ES6+ JavaScript）
- 建議使用 Chrome、Firefox、Edge 最新版本

## 快速開始

### 啟動遊戲

```bash
npm run dev
# 瀏覽器打開 http://localhost:3000
```

### 遊戲流程

1. 直接開啟 `index.html` 或使用本地伺服器
2. 使用 WASD 移動避開敵人
3. 自動攻擊最近的敵人
4. 收集經驗球升級
5. 選擇強化天賦讓角色更強

---

## 🛠️ Tileset 清理工具

### 用途

設計稿通常包含 **素材 + 設計說明文字 + 尺寸標註**，文字說明會導致自動裁切錯亂。TilesetCleaner 可手動框選純素材區域，生成乾淨的 tileset.png。

### 啟動工具

```bash
npm run dev
# 瀏覽器打開 http://localhost:3000/tilesetCleaner.html
```

### 操作流程

1. **調整素材尺寸**（預設 32px，可改為 16/64/128）
2. **選擇尺寸處理模式**：
   - 🔒 **保留原始尺寸**（推薦）：保持每個素材的原始大小（72x72、64x96 等）
   - 📐 **縮放為統一尺寸**：強制縮放為 32x32（可能變形或模糊）
3. **點擊「➕ 新增素材位置」**
4. **在設計稿上框選純素材區域**（避開文字說明）
5. **手動調整 X Y W H 輸入框**（如將 72x74 改為 72x72）
6. **框選錯誤時**：
   - 點擊已框選區域（紅色高亮）
   - 點擊「❌ 删除选中」或「↩️ 撤销」
7. **選擇布局模式**：
   - 🎯 **最優布局**（推薦）：自動計算最小空白格數
   - ⬜ **強制正方形**：適合需要正方形圖集的場合
   - ⚙️ **自定義尺寸**：手動設定列數/行數（預留未來素材空間）
8. **點擊「👀 预览图集」**
9. **檢查預覽是否正確**（每個格子會顯示序號和網格線）
10. **確認無誤後點擊「⬇️ 確認下載」**

### 功能特色

| 功能 | 說明 |
|------|------|
| **手動框選** | 避開設計稿文字說明，只選取純素材 |
| **手動調整** | X Y W H 四個輸入框，精確控制裁切範圍 |
| **浮點誤差修正** | 自動計算圖片缩放比例，避免坐標偏移 |
| **預覽功能** | 先預覽生成的圖集，確認無誤後再下載 |
| **多種布局** | 最優布局、強制正方形、水平/垂直排列、自定義尺寸 |
| **格子間距** | 可關閉生成完美正方形，或啟用 2px 間距 |
| **尺寸處理** | 保留原始尺寸或縮放為統一尺寸 |

### 範例

```
框選 10 個素材：
- 最優布局 → 4x3 圖集（2 格空白）
- 強制正方形 → 4x4 圖集（6 格空白）
- 保留原始尺寸 → 每格 72px（最大素材尺寸）
- 縮放為統一尺寸 → 每格 32px
```

### 相關文件

- **TILESET_GUIDE.md**：Canvas drawImage() 裁切原理、素材定位表、與 DecorationManager 分工說明
- **TILESET_FIX_GUIDE.md**：設計稿文字說明問題的 4 種解決方案對比

---

## 🎨 專業切圖工具推薦

### 推薦工具對比

| 工具 | 用途 | 優點 | 缺點 | 適用場景 |
|------|------|------|------|---------|
| **TexturePacker** | Sprite Sheet/Tileset 自動排列 | 專為遊戲設計、自動優化空白、多格式导出、去除透明邊框 | 付费版才有高级功能 | 專業遊戲開發、批量處理 |
| **Tiled Map Editor** | Tilemap 地圖編輯 | 免費開源、專業地圖編輯、多層支持、多格式导出 | 不會自動生成 tileset | 已有 tileset、需設計地圖 |
| **Aseprite** | 像素藝術 + Sprite Sheet | 專為像素風格、動畫編輯、便宜（$20） | 主要用於像素風格 | 像素風格遊戲、動畫編輯 |
| **SpriteForge** | 線上 Sprite Sheet 工具 | 免費線上、簡單易用、拖放操作 | 功能較簡單 | 快速處理、不想安裝軟體 |

### 推薦選擇

| 需求 | 推薦工具 |
|------|---------|
| **專業遊戲開發** | TexturePacker（自動優化、多格式导出） |
| **已有 tileset，需設計地圖** | Tiled Map Editor（免費、專業地圖編輯） |
| **像素風格遊戲** | Aseprite（像素編輯、動畫、 sprite sheet） |
| **快速簡單處理** | SpriteForge（線上免費） |
| **手動裁切設計稿** | 本專案 TilesetCleaner（避開文字說明） |

### 最佳實踐：組合使用流程

```
設計稿（含文字說明）
↓
TilesetCleaner（手動框選、生成乾淨圖集）
↓
TexturePacker（自動優化排列、去除透明邊框）
↓
Tiled Map Editor（設計地圖、設定碰撞）
↓
遊戲引擎渲染
```

### TexturePacker 設定建議

```
Algorithm: MaxRects（最小空白）
Padding: 2px（避免素材相連）
Trim: Enable（去除透明邊框）
Extrude: 1px（避免渲染缝隙）
Format: JSON-Array（通用格式）
```

### 為什麼需要 TilesetCleaner？

**問題：**
- TexturePacker 等工具無法處理設計稿中的文字說明、尺寸標註
- 只能處理純素材圖片

**解決方案：**
1. 先用 **TilesetCleaner** 手動框選設計稿 → 生成乾淨圖集（不含文字）
2. 再用 **TexturePacker** 自動優化排列 → 最小化空白

### 官網連結

- **TexturePacker**: https://www.codeandweb.com/texturepacker
- **Tiled Map Editor**: https://www.mapeditor.org/
- **Aseprite**: https://www.aseprite.org/
- **SpriteForge**: https://spriteforge.com/

---

## 技術架構

- **渲染引擎**：HTML5 Canvas API
- **遊戲迴圈**：requestAnimationFrame
- **模組化**：ES6 Modules

## 專案結構

```
survivor.js/
├── index.html              # 遊戲主頁面
├── tilesetCleaner.html     # Tileset 清理工具
├── css/
│   └── style.css           # 遊戲樣式
├── js/
│   ├── main.js             # 入口檔案
│   ├── game.js             # 遊戲主邏輯
│   ├── player.js           # 玩家類別
│   ├── enemy.js            # 敵人類別
│   ├── projectile.js       # 魔法彈類別
│   ├── experience.js       # 經驗值類別
│   ├── talent.js           # 天賦系統
│   ├── tileManager.js      # Tileset 管理器（待圖集裁切完成後使用）
│   ├── tilesetCleaner.js   # Tileset 清理工具
│   ├── ui.js               # UI 管理
│   └── utils.js            # 工具函數
├── TILESET_GUIDE.md        # Tileset 使用指南
├── TILESET_FIX_GUIDE.md    # Tileset 問題解決方案
└── PRD.md                  # 產品需求文件
```

## 授權

MIT License