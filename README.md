# survivor.js

網頁版生存遊戲 - 類倖存者 (Survivor-like) 遊戲 Demo

## 遊戲特色

- 純 JavaScript + HTML5 Canvas 實現
- 自動戰鬥系統：玩家專注走位，小女巫自動索敵射擊
- 割草體驗：高頻率敵人生成與流暢擊殺回饋
- 成長循環：擊殺 → 掉落經驗球 → 升級 → 三選一隨機天賦強化

## 操作方式

- **WASD** 或 **方向鍵**：移動角色

## 系統需求

- 現代瀏覽器（支援 ES6+ JavaScript）
- 建議使用 Chrome、Firefox、Edge 最新版本

## 快速開始

1. 直接開啟 `index.html` 或使用本地伺服器
2. 使用 WASD 移動避開敵人
3. 自動攻擊最近的敵人
4. 收集經驗球升級
5. 選擇強化天賦讓角色更強

## 技術架構

- **渲染引擎**：HTML5 Canvas API
- **遊戲迴圈**：requestAnimationFrame
- **模組化**：ES6 Modules

## 專案結構

```
survivor.js/
├── index.html          # 遊戲主頁面
├── css/
│   └── style.css       # 遊戲樣式
├── js/
│   ├── main.js         # 入口檔案
│   ├── game.js         # 遊戲主邏輯
│   ├── player.js       # 玩家類別
│   ├── enemy.js        # 敵人類別
│   ├── projectile.js   # 魔法彈類別
│   ├── experience.js   # 經驗值類別
│   ├── talent.js       # 天賦系統
│   ├── ui.js           # UI 管理
│   └── utils.js        # 工具函數
└── PRD.md              # 產品需求文件
```

## 授權

MIT License