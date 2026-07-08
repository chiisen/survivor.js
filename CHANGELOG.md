# Changelog

本專案所有重要變更都將記錄於此文件。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
並且專案遵守 [Semantic Versioning](https://semver.org/lang/zh-TW/) 版本號規則。

## [Unreleased]

### 新增
- **磁鐵道具系統 (Magnet Drop Item)**：擊殺普通怪物時有 3% 低機率掉落實體 U 型磁鐵 🧲，拾取後可觸發 5 秒的「磁力風暴」全螢幕經驗球吸附。若重複拾取，剩餘時間將以「累加 (Stack)」計算。伴隨淡藍色圓環擴散漸隱特效，並提供 `Ctrl+Shift+M` 開發者調試熱鍵。
- **AI 開發成本優化與 Agent 工作流實戰教學課程**：於 `docs/tutorials/ai-cost-optimization-course.md` 新增專屬教學文件並整合至 `README.md`，內容仿照多奇教育訓練 Will 保哥的「AI 寫程式省錢術」結構，詳細說明 Token 計費機制、Prompt Caching、子任務與對話壓縮、MCP 輸出限流與 LiteLLM 團隊成本治理。
- **經驗值等級加權**：擊殺敵人獲得的經驗值現在會隨玩家等級以 `1.5^(level-1)` 倍率放大，與 `expToLevel` 升級曲線同步，補償敵人 HP 隨等級線性增加 (每級 +80%) 造成的擊殺耗時上升；每級所需擊殺數維持 ~10 不變。Boss 戰與 minion 也一併套用。
- **Git 配置**：在 `.gitignore` 中新增排除 `node_modules` 目錄，避免本地依賴檔案被納入版本控制。
- **動態難度平衡**：怪物與 Boss 的生命值現在會隨主角等級增加（每級約 +80%），以抵銷主角每級增加的攻擊力，避免中後期過於強大。
- **UI 強化回饋**：左側技能狀態欄現在會即時顯示「魔力增幅」（攻擊力）與「生命強化」（最大 HP）的實際數值，包含升級獲得的固定加成。
- **波次難度動態縮放**：基礎敵人數量增加 2 倍，採用二次方增長公式，且生成速度隨波次加快，確保每一波都感覺到敵人「越來越多」。
- **升級獎勵機制**：每次玩家升級時，攻擊力固定 +1，最大 HP 增加 10% 並將當前 HP 恢復至全滿。
- TileManager 系統：從素材圖集裁切 tiles，支援地板拼接與環境物件（待圖集裁切完成後使用）
- TilesetCleaner 工具：手動框選素材區域，生成乾淨圖集（避開設計稿文字說明）
- 編輯功能：點擊已框選區域可選中、删除、撤销，避免框選錯誤無法修正
- 多種布局模式：最優布局、強制正方形、水平排列、垂直排列、自定義尺寸
- tilesetCleaner.html：可視化框選工具，即時预览、統計資訊、自動下載
- 視野遮罩系統：玩家周圍清晰可見，視野外深色模糊，營造戰爭迷霧效果
- **Graphify 知識圖譜**：提交 `graphify-out/` 生成的程式碼知識圖譜輸出 (`GRAPH_REPORT.md` / `graph.html` / `graph.json` / `manifest.json`)，供 AI Agent 查閱架構入口與社群結構；緩存 (`cache/`) 與建置成本 (`cost.json`) 已排除於版本控制之外。

### 說明文件
- **文件架構重構**：將根目錄的所有文件移至 `docs/` 目錄，並依據職責拆分為多個專門文件
  - `docs/PRD.md`：產品需求文件
  - `docs/AGENT_GUIDELINES.md`：AI Agent 開發規範與 Checklist
  - `docs/TECHNICAL_SPECS.md`：架構、調試機制與技術規格
  - `docs/TOOL_SPECS.md`：開發工具（TilesetCleaner）操作手冊
  - `docs/PROJECT_STATUS.md`：詳細功能清單與重構紀錄
  - `docs/ENGINE_ANALYSIS.md`：遊戲引擎技術選型分析
- **README.md 更新**：新增「文件中心」導覽，連結至各個專門文件

### 優化
- **日誌等級切換**：Ctrl+Shift+L 循環切換 ERROR → INFO → DEBUG，便於開發調試
- **ObjectPool 全面優化**：
  - 預分配大小調整：ProjectilePool 50→200，其他池按需調整
  - 對象狀態標記（_active）避免 indexOf 性能损耗
  - 自動扩容：池用完后自动扩容 50%（限制 maxSize）
  - 统计监控：peakActiveCount、hitRate、efficiency、autoExpansions
  - 清理优化：cleanInactive() 定期清理无效对象
  - 自动调整：autoAdjust() 根据峰值使用量自动扩容
  - 调试热键：Ctrl+Shift+P 查看 ObjectPool 统计

### 重構
- **Phase 2（完成）**：Enemy 拆分成四個模組並整合為組合模式
  - EnemyCore.js：位置、移動、碰撞、傷害計算
  - EnemyBehaviors.js：射擊、分裂、隱形行為
  - BossPhaseManager.js：Boss 多階段管理（狂暴模式、召喚小怪）
  - EnemyRenderer.js：繪製敌人外觀（240行繪製邏輯，支援 9 種敵人類型）
  - Enemy.js：組合模式（使用 Getter/Setter 暴露所有原有屬性，保持接口兼容）
- **Phase 3（完成）**：調試機制完善
  - GameValidator.js：硬斷言檢查（Ctrl+Shift+V 鍵開啟）
  - DebugOverlay FPS顯示、内存监控、實體数量統計（P/E/Exp/EP/DN）
  - 自動警告：FPS過低、Memory過高、Grid空、冷卻未更新、敵人過多等
- 藍色護盾 UI：HP 條上方顯示護盾值，護盾歸零時半透明顯示
- 护盾变化即时同步 UI：护盾吸收伤害、护盾恢复均实时更新显示

### 修復
- HP 條同步問題：护盾吸收傷害時 UI 即時更新，避免玩家突然死亡無預警
- 傷害數字顯示系統：浮動數字 + 放大漸隱動畫，高傷害顯示金色外框，支援自訂顏色
- 敵人類型多樣化：新增快速型、坦克型、遠程型、精英、分裂、爆炸、隱形敵人
- 精英敵人：金色光環、高血量高傷害，高經驗值，藍色護盾（需先破盾才能傷害本體）
- 分裂敵人：死亡時分裂成2個小型敵人，觸發周圍80px內分裂敵人鏈式分裂
- 爆炸敵人：死亡時對範圍內玩家造成爆炸傷害
- 隱形敵人：半透明狀態，受擊後短暫現形閃爍
- 敵人類型權重系統：根據遊戲時間動態調整出現機率
- 坦克型/Boss 敵人血量條顯示
- 遠程型/Boss 敵人射擊系統：紫色流星子彈追踪玩家
- Boss 放大（radius 160）+ UI 血量条标注（屏幕上方显示 BOSS 血量）
- Boss 出場特效：紅色光環擴散、警告公告、震動效果
- Boss 多階段系統：血量低時進入狂暴模式（速度加快、射擊加快、召喚小怪）
- Boss 狂暴技能：第二階段射出4方向子彈，第三階段射出8方向子彈並召喚精英小怪
- Boss 死亡特效：多重粒子爆散、光環擴散、閃電效果
- 精英護盾破碎特效：藍色碎片爆散、光環碎裂效果
- 分裂敵人分裂動畫效果：綠色光環擴散 + 粒子爆散
- 敵人進入射擊範圍移動速度+10%
- 更多天賦選項：暴击率、暴击伤害、吸血、护盾、经验加成、护甲（共14種技能）
- 暴击系统：暴击子弹显示红色 + 金色光环
- 连杀奖励机制：连杀数越高获得额外经验加成（最高+150%）
- 护盾回复系统：休息时间自动回复护盾至满值
- 玩家主动技能：按Q键释放全屏攻击（伤害=玩家攻击力×10，冷却30秒）
- 成就系统：19个成就（首杀、百杀、千杀、存活时间、Boss击杀、波次、等级、游戏次数、地狱模式）
- 排行榜：本地排行榜显示前10名最高成绩（默认关闭，点击展开）
- 歷史紀錄：默认关闭，点击按钮展开
- 遊戲開始畫面：標題、操作說明、難度選擇、開始按鈕、設定選單
- 設定選單：主音量、音效音量、背景音量滑塊調整
- 难度系统：普通/困難/地獄模式（影响敌人生成速度、血量、伤害）
- 波次系统优化：每波杀光小怪后立即结束该波进入下一波
- 休息时间：自动回收所有经验球
- 技能状态显示：画面左上方显示已升级技能（未升级不显示）
- 技能冷却UI：右上角显示技能状态（就绪/冷却秒数）
- 波次信息显示：右侧显示波次信息
- 地形系统增强：新增花朵、蘑菇、树桩、水晶装饰
- 粒子效果增强：新增萤火虫、落叶、闪烁星光效果
- 游戏内音量设置：暂停画面可调整主音量/音效/背景音量
- 連殺顯示系統：DOUBLE/TRIPLE/QUAD/MEGA/ULTRA/GODLIKE 大字動畫
- 音效系統：Web Audio API 合成音效（揮劍/命中/擊殺/連殺/升級/受傷/拾取/結束）
- 背景音樂：三角波 oscillator + LFO 調變（80Hz + 0.5Hz LFO）
- 音量控制：masterVolume/sfxVolume/bgmVolume 可動態調整
- 暫停功能：ESC/P 鍵暫停遊戲，顯示暫停畫面
- 背景裝飾：地面裝飾物（石頭/草叢/灌木/裂痕）+ 環境漂浮粒子
- 波次系統：每60秒一波 + 5秒休息時間，隨波次增加敵人數量與血量
- Boss戰：每5波出現Boss（皇冠 + 光環 + 大血量條 + 射擊）
- 波次UI：波次公告（開始/Boss/結束）+ 左下角波次信息
- 存檔功能：localStorage 儲存歷史紀錄（最高等級/最長時間/總擊殺/最高波次/Boss擊殺）
- 結算畫面：本次成績 + 歷史紀錄對比，新紀錄標記 🏆

### 效能優化
- 空間網格分割（SpatialGrid）：格子大小 100px，優化碰撞檢測從 O(n×m) 降至 O(n×k)
- 距離平方比較：新增 distanceSquared() 函數避免 Math.sqrt 運算
- 網格緩存：每幀清空重建，僅檢測鄰近格子內物件
- 物件池化（ObjectPool）：重用 Projectile、Explosion、特效物件，減少 GC 壓力
- Projectile/Explosion 類別支援 init/reset 方法，預先建立粒子結構

### 修復
- 修復 `Enemy` 類別中 `shieldHp` 與 `hasShield` 屬性只有 Getter 而缺少 Setter 的問題，解決菁英敵人受擊時的程式崩潰。
- 修復連殺通知中經驗值加成顯示為 0% 的錯誤：改為使用最終連殺數計算正確的加成。
- 修復 `chainKills` 變數未定義錯誤：移動變數定義至使用前，解決主角只攻擊一次就停止的問題
- 修復敵人無法被子彈命中的問題：每幀更新前將敵人插入 SpatialGrid，確保碰撞檢測正常運作
- 修復主角射擊一次就停止的問題：在 update() 中調用 player.update() 更新 fireCooldown

### 重構
- Update Loop 重構：明確四個 Phase（清理 → 狀態 → 系統 → UI）
- 新增 GameLogger：Console 日誌系統，記錄每個 Phase 執行狀態
- 新增 DebugOverlay：可視化調試工具（Ctrl+D 鍵開啟），顯示 Grid、fireCooldown、警告等狀態
- 拆分 checkCollisions() 和 handleEnemyDeath() 方法，降低 update() 職責

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