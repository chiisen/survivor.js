# Changelog

本專案所有重要變更都將記錄於此文件。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
並且專案遵守 [Semantic Versioning](https://semver.org/lang/zh-TW/) 版本號規則。

## [Unreleased]

### 新增
- 傷害數字顯示系統：浮動數字 + 放大漸隱動畫，高傷害顯示金色外框

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