# 遊戲開發工具規格 (Game Development Tool Specs)

本文件詳述 `survivor.js` 專案中所使用的開發工具及其規格。

## 1. TileManager 系統規格

### A. 系統概述
TileManager 用於從素材圖集裁切 tiles，支援地板拼接與環境物件渲染。與 DecorationManager 分工：TileManager 畫底層地板，DecorationManager 畫頂層動態裝飾。

### B. Canvas drawImage() 裁切原理
```javascript
ctx.drawImage(
    image,            // 原圖
    sx, sy,           // 裁切起始座標（在原圖上的位置）
    sWidth, sHeight,  // 裁切尺寸
    dx, dy,           // 繪製目標座標（在 Canvas 上的位置）
    dWidth, dHeight   // 繪製尺寸（可放大/縮小）
);
```

**範例：取出第一格草地**
```javascript
ctx.drawImage(
    tilesetImage,
    0, 0, 32, 32,     // 裁切原圖 (0,0) 位置的 32x32區塊
    100, 100, 32, 32  // 繪製到 Canvas (100,100) 位置
);
```

### C. 素材定位表

#### 地板類（32x32）
| 素材名稱 | 定位座標 | 尺寸 |
|---------|---------|------|
| grass | (0, 0) | 32x32 |
| grass2 | (32, 0) | 32x32 |
| grass3 | (64, 0) | 32x32 |
| dirt | (0, 32) | 32x32 |
| dirt2 | (32, 32) | 32x32 |
| stone | (0, 64) | 32x32 |
| stone2 | (32, 64) | 32x32 |
| water | (0, 96) | 32x32 |
| water2 | (32, 96) | 32x32 |

#### 環境物件
| 素材名稱 | 定位座標 | 尺寸 |
|---------|---------|------|
| tree | (160, 0) | 64x96 |
| bush | (224, 0) | 32x32 |
| flower | (256, 0) | 32x32 |
| flower2 | (288, 0) | 32x32 |
| rock | (160, 96) | 48x48 |
| mushroom | (224, 32) | 32x32 |

#### 其他
| 素材名稱 | 定位座標 | 尺寸 |
|---------|---------|------|
| fence_h | (320, 0) | 水平圍欄 |
| fence_v | (352, 0) | 垂直圍欄 |
| fence_corner | (384, 0) | 圍欄轉角 |

### D. TileManager 與 DecorationManager 分工

| 功能 | TileManager | DecorationManager |
|------|-------------|-------------------|
| 地板拼接 | ✅ 草地、泥土、水面 | ❌ |
| 靜態物件 | ✅ 樹木、石頭、圍欄 | ❌ |
| 動態裝飾 | ❌ | ✅ 搖擺的草、發光水晶 |
| 粒子效果 | ❌ | ✅ 螢火虫、落叶、星光 |
| 地圖生成 | ✅ 隨機地板 | ❌ |

**建議**：兩者並存，TileManager 畫底層地板，DecorationManager 畫頂層動態裝飾。

### E. 使用方式

#### 1. 在 game.js 中引入
```javascript
import { TileManager } from './tileManager.js';

export class Game {
    constructor(canvas) {
        this.tileManager = new TileManager();
    }
    
    async start() {
        await this.tileManager.load();  // 載入素材圖集
        this.generateMap();
    }
}
```

#### 2. 生成地板地圖
```javascript
generateMap() {
    this.groundMap = this.tileManager.generateRandomGround(
        this.canvas.width * 2,  // 地圖比畫面大
        this.canvas.height * 2
    );
    this.tileManager.addDecorations(this.groundMap, 100);
}
```

#### 3. 在 render() 中繪製
```javascript
render() {
    // 1. 先畫地板（底層）
    this.tileManager.drawMap(this.ctx, this.groundMap);
    
    // 2. 畫玩家和敵人（中層）
    this.player.draw(this.ctx);
    for (const enemy of this.enemies) {
        enemy.draw(this.ctx);
    }
    
    // 3. 畫動態裝飾（頂層）
    this.decorationManager.draw(this.ctx);
}
```

### F. 下一步優化
1. **地圖捲動**：隨玩家移動調整 offsetX/offsetY
2. **碰撞檢測**：部分 tile（水、石頭）可設為障礙物
3. **多層渲染**：地板 → 物件 → 玩家 → 敵人 → 特效
4. **動態載入**：大地圖只渲染視野範圍內的 tiles

## 2. TilesetCleaner 工具規格

### A. 工具用途
設計稿通常包含 **素材 + 設計說明文字 + 尺寸標註**，文字說明會導致自動裁切錯亂。TilesetCleaner 可手動框選純素材區域，生成乾淨的 tileset.png。

### B. 啟動方式
```bash
npm run dev
# 瀏覽器打開 http://localhost:3000/tilesetCleaner.html
```

### C. 操作流程
1. **調整素材尺寸**（預設 32px，可改為 16/64/128）
2. **選擇尺寸處理模式**：
   - 🔒 **保留原始尺寸**（推薦）：保持每個素材的原始大小
   - 📐 **縮放為統一尺寸**：強制縮放為 32x32
3. **點擊「➕ 新增素材位置」**
4. **在設計稿上框選純素材區域**（避開文字說明）
5. **手動調整 X Y W H 輸入框**（精確控制裁切範圍）
6. **框選錯誤時**：
   - 點擊已框選區域（紅色高亮）
   - 點擊「❌ 删除选中」或「↩️ 撤销」
7. **選擇布局模式**：
   - 🎯 **最優布局**（推薦）：自動計算最小空白格數
   - ⬜ **強制正方形**：適合需要正方形圖集的場合
   - ⚙️ **自定義尺寸**：手動設定列數/行數
8. **點擊「👀 预览图集」**
9. **檢查預覽是否正確**
10. **確認無誤後點擊「⬇️ 確認下載」**

### D. 功能特色

| 功能 | 說明 |
|------|------|
| **手動框選** | 避開設計稿文字說明，只選取純素材 |
| **手動調整** | X Y W H 四個輸入框，精確控制裁切範圍 |
| **浮點誤差修正** | 自動計算圖片缩放比例，避免坐標偏移 |
| **預覽功能** | 先預覽生成的圖集，確認無誤後再下載 |
| **多種布局** | 最優布局、強制正方形、水平/垂直排列、自定義尺寸 |
| **格子間距** | 可關閉生成完美正方形，或啟用 2px 間距 |
| **尺寸處理** | 保留原始尺寸或縮放為統一尺寸 |

### E. 設計稿文字說明問題的解決方案

| 方案 | 適用對象 | 優點 | 缺點 |
|------|---------|------|------|
| **方案1：手動框選工具** | 進階使用者 | 可視化操作、自動生成乾淨圖集 | 需要操作工具 |
| **方案2：圖片編輯軟體** | 新手 | 最簡單、最可靠 | 需要圖片編輯技能 |
| **方案3：修改定義** | 快速修復 | 不需修改原始圖片 | 需手動測量每個素材位置 |
| **方案4：自動化腳本** | 專業使用者 | 全自動處理、批量處理 | 需圖像處理知識 |

**推薦方案**：
- 新手 → 方案 2（圖片編輯軟體）
- 進階 → 方案 1（手動框選工具）
- 專業 → 方案 4（自動化腳本）

## 3. 專業切圖工具推薦

### A. 工具對比表

| 工具 | 用途 | 優點 | 缺點 | 適用場景 |
|------|------|------|------|---------|
| **TexturePacker** | Sprite Sheet/Tileset 自動排列 | 專為遊戲設計、自動優化空白、多格式导出、去除透明邊框 | 付费版才有高级功能 | 專業遊戲開發、批量處理 |
| **Tiled Map Editor** | Tilemap 地圖編輯 | 免費開源、專業地圖編輯、多層支持、多格式导出 | 不會自動生成 tileset | 已有 tileset、需設計地圖 |
| **Aseprite** | 像素藝術 + Sprite Sheet | 專為像素風格、動畫編輯、便宜（$20） | 主要用於像素風格 | 像素風格遊戲、動畫編輯 |
| **SpriteForge** | 線上 Sprite Sheet 工具 | 免費線上、簡單易用、拖放操作 | 功能較簡單 | 快速處理、不想安裝軟體 |

### B. 推薦選擇

| 求 | 推薦工具 |
|------|---------|
| **專業遊戲開發** | TexturePacker（自動優化、多格式导出） |
| **已有 tileset，需設計地圖** | Tiled Map Editor（免費、專業地圖編輯） |
| **像素風格遊戲** | Aseprite（像素編輯、動畫、 sprite sheet） |
| **快速簡單處理** | SpriteForge（線上免費） |
| **手動裁切設計稿** | TilesetCleaner（避開文字說明） |

### C. 最佳實踐：組合使用流程
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

### D. TexturePacker 設定建議
```
Algorithm: MaxRects（最小空白）
Padding: 2px（避免素材相連）
Trim: Enable（去除透明邊框）
Extrude: 1px（避免渲染缝隙）
Format: JSON-Array（通用格式）
```

### E. 官網連結
- **TexturePacker**: https://www.codeandweb.com/texturepacker
- **Tiled Map Editor**: https://www.mapeditor.org/
- **Aseprite**: https://www.aseprite.org/
- **SpriteForge**: https://spriteforge.com/
