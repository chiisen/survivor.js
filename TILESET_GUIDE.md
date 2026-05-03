# Tileset 使用指南

## 什麼是 Tileset（素材圖集）？

Tileset 是將多個小素材（tiles）打包成一張大圖，優點：
- 減少 HTTP請求（1張圖 vs 多張小圖）
- 統一管理素材
- 方便批量渲染

## 如何使用 TileManager

### 1. 在 game.js 中引入

```javascript
import { TileManager } from './tileManager.js';

export class Game {
    constructor(canvas) {
        // ... 其他初始化
        this.tileManager = new TileManager();
    }
    
    async start() {
        await this.tileManager.load();  // 載入素材圖集
        this.generateMap();
        // ... 啟動遊戲
    }
}
```

### 2. 生成地板地圖

```javascript
generateMap() {
    // 自動生成隨機地板
    this.groundMap = this.tileManager.generateRandomGround(
        this.canvas.width * 2,  // 地圖比畫面大
        this.canvas.height * 2
    );
    
    // 加入裝飾物件
    this.tileManager.addDecorations(this.groundMap, 100);
}
```

### 3. 在 render() 中繪製

```javascript
render() {
    this.ctx.save();
    
    // 1. 先畫地板（底層）
    this.tileManager.drawMap(this.ctx, this.groundMap);
    
    // 2. 畫玩家和敵人（中層）
    this.player.draw(this.ctx);
    for (const enemy of this.enemies) {
        enemy.draw(this.ctx);
    }
    
    // 3. 畫動態裝飾（頂層） - 使用現有的 DecorationManager
    this.decorationManager.draw(this.ctx);
    
    this.ctx.restore();
}
```

### 4. 自定義地圖

```javascript
customMap() {
    const mapData = [
        {
            tiles: [
                { name: 'grass', x: 0, y: 0 },
                { name: 'dirt', x: 32, y: 0 },
                { name: 'water', x: 64, y: 0 }
            ]
        },
        {
            tiles: [
                { name: 'grass2', x: 0, y: 32 },
                { name: 'stone', x: 32, y: 32 },
                { name: 'bush', x: 64, y: 32 }
            ]
        }
    ];
    
    return mapData;
}
```

## Canvas drawImage() 裁切原理

```javascript
ctx.drawImage(
    image,         // 原圖
    sx, sy,        // 裁切起始座標（在原圖上的位置）
    sWidth, sHeight,  // 裁切尺寸
    dx, dy,        // 繪製目標座標（在 Canvas 上的位置）
    dWidth, dHeight   // 繪製尺寸（可放大/縮小）
);
```

**範例：取出第一格草地**

```javascript
ctx.drawImage(
    tilesetImage,
    0, 0, 32, 32,  // 裁切原圖 (0,0) 位置的 32x32區塊
    100, 100, 32, 32  // 繪製到 Canvas (100,100) 位置
);
```

## 素材定位表

### 地板類（32x32）
- `grass`: (0, 0)
- `grass2`: (32, 0)
- `grass3`: (64, 0)
- `dirt`: (0, 32)
- `dirt2`: (32, 32)
- `stone`: (0, 64)
- `stone2`: (32, 64)
- `water`: (0, 96)
- `water2`: (32, 96)

### 環境物件
- `tree`: (160, 0) - 64x96（大物件）
- `bush`: (224, 0) - 32x32
- `flower`: (256, 0) - 32x32
- `flower2`: (288, 0) - 32x32
- `rock`: (160, 96) - 48x48
- `mushroom`: (224, 32) - 32x32

### 其他
- `fence_h`: (320, 0) - 水平圍欄
- `fence_v`: (352, 0) - 垂直圍欄
- `fence_corner`: (384, 0) - 圍欄轉角

## 與現有 DecorationManager 的分工

| 功能 | TileManager | DecorationManager |
|------|-------------|-------------------|
| 地板拼接 | ✅ 草地、泥土、水面 | ❌ |
| 靜態物件 | ✅ 樹木、石頭、圍欄 | ❌ |
| 動態裝飾 | ❌ | ✅ 搖擺的草、發光水晶 |
| 粒子效果 | ❌ | ✅ 螢火虫、落叶、星光 |
| 地圖生成 | ✅ 隨機地板 | ❌ |

**建議**：兩者並存，TileManager 畫底層地板，DecorationManager 畫頂層動態裝飾。

## 下一步優化

1. **地圖捲動**：隨玩家移動調整 offsetX/offsetY
2. **碰撞檢測**：部分 tile（水、石頭）可設為障礙物
3. **多層渲染**：地板 → 物件 → 玩家 → 敵人 → 特效
4. **動態載入**：大地圖只渲染視野範圍內的 tiles