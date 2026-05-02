# Changelog

本專案所有重要變更都將記錄於此文件。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
並且專案遵守 [Semantic Versioning](https://semver.org/lang/zh-TW/) 版本號規則。

## [Unreleased]

### 新增
- 傷害數字顯示系統：浮動數字 + 放大漸隱動畫，高傷害顯示金色外框
- 敵人類型多樣化：新增快速型、坦克型、遠程型敵人
- 敵人類型權重系統：根據遊戲時間動態調整出現機率
- 坦克型敵人血量條顯示
- 遠程型敵人射擊系統：紫色子彈追踪玩家
- 連殺顯示系統：DOUBLE/TRIPLE/QUAD/MEGA/ULTRA/GODLIKE 大字動畫
- 音效系統：Web Audio API 合成音效（揮劍/命中/擊殺/連殺/升級/受傷/拾取/結束）
- 背景音樂：三角波 oscillator + LFO 調變（80Hz + 0.5Hz LFO）
- 音量控制：masterVolume/sfxVolume/bgmVolume 可動態調整
- 暫停功能：ESC/P 鍵暫停遊戲，顯示暫停畫面

### 效能優化
- 空間網格分割（SpatialGrid）：格子大小 100px，優化碰撞檢測從 O(n×m) 降至 O(n×k)
- 距離平方比較：新增 distanceSquared() 函數避免 Math.sqrt 運算
- 網格緩存：每幀清空重建，僅檢測鄰近格子內物件
- 物件池化（ObjectPool）：重用 Projectile 和 Explosion 物件，減少 GC 壓力（池大小 30/20）
- Projectile/Explosion 類別支援 init/reset 方法，預先建立粒子結構

## [0.1.0] - 2026-05-02

### 新增
- 初始版本發布
- 基礎 Canvas 畫布與玩家移動控制（WASD / 方向鍵）
- 自動索敵射擊邏輯
- 怪物波次生成器（難度隨時間遞增）
- 經驗值拾取與升級 UI 彈窗
- 三選一隨機天賦系統（7 種強化選項）
- 玩家受擊閃爍效果
- 遊戲結束畫面與重新開始功能
- 計時器與狀態列 UI

### 技術
- 純 JavaScript (ES6+) 模組化架構
- HTML5 Canvas 渲染引擎
- requestAnimationFrame 驅動遊戲主迴圈

[Unreleased]: https://github.com/chiisen/survivor.js/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/chiisen/survivor.js/releases/tag/v0.1.0