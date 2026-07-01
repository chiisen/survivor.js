# Graph Report - .  (2026-07-02)

## Corpus Check
- 66 files · ~418,635 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 579 nodes · 706 edges · 56 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Player` - 46 edges
2. `Game` - 36 edges
3. `Enemy` - 32 edges
4. `AudioManager` - 22 edges
5. `EnemyRenderer` - 20 edges
6. `UI` - 17 edges
7. `ObjectPool` - 16 edges
8. `DebugOverlay` - 14 edges
9. `StorageManager` - 14 edges
10. `PlayerCombat` - 13 edges

## Surprising Connections (you probably didn't know these)
- `shieldHp/hasShield Setter 缺失修復` --conceptually_related_to--> `Enemy 組合模式拆分`  [INFERRED]
  CHANGELOG.md → docs/TECHNICAL_SPECS.md
- `survivor.js CLAUDE.md` --references--> `文件中心導覽`  [EXTRACTED]
  CLAUDE.md → README.md
- `Update Loop 四階段慣例` --shares_data_with--> `Phase 4 UI 更新`  [EXTRACTED]
  CLAUDE.md → docs/AGENT_GUIDELINES.md
- `Task 5: 手動 Playtest` --references--> `Debug 工具熱鍵`  [EXTRACTED]
  docs/superpowers/plans/2026-07-01-exp-level-scaling.md → CLAUDE.md
- `連殺通知經驗值加成顯示修復` --shares_data_with--> `歷史 Bug: chainKills 未定義`  [INFERRED]
  CHANGELOG.md → CLAUDE.md

## Hyperedges (group relationships)
- **Update Loop 四階段 Pipeline** — agentgl_phase1_cleanup, agentgl_phase2_state, agentgl_phase3_system, agentgl_phase4_ui [EXTRACTED 1.00]
- **Debug 三工具 (Overlay/Logger/Validator)** — techspecs_debug_overlay, techspecs_gamelogger, techspecs_gamevalidator [EXTRACTED 0.95]
- **經驗加權實作流程 (Spec→Plan→CHANGELOG)** — expdesign_background, expdesign_decision_growth_rate, expplan_task1_getexp, expplan_task2_calc_helper, expplan_task3_kill_paths, changelog_exp_level_weighting [EXTRACTED 0.90]

## Communities

### Community 0 - "Player Class API"
Cohesion: 0.04
Nodes (1): Player

### Community 1 - "Update Loop & Bug History"
Cohesion: 0.08
Nodes (44): Update Loop Checklist, 錯誤案例 #1: chainKills 未定義, 錯誤案例 #2: enemyGrid 未更新, 錯誤案例 #3: player.update() 未調用, Phase 1 清理與準備, Phase 2 狀態更新, Phase 3 系統邏輯, Phase 4 UI 更新 (+36 more)

### Community 2 - "Game Main Loop"
Cohesion: 0.1
Nodes (1): Game

### Community 3 - "Enemy Class API"
Cohesion: 0.06
Nodes (1): Enemy

### Community 4 - "Background Decoration"
Cohesion: 0.12
Nodes (3): DecorationManager, EnvironmentParticle, GroundDecoration

### Community 5 - "Engine Choice Analysis"
Cohesion: 0.11
Nodes (25): 專案特性複雜度表, 完全控制權理由, Kontra.js 引擎比較, 學習價值理由, 輕量化理由, Phaser.js 引擎比較, PixiJS 引擎比較, 純 Canvas API 選擇 (+17 more)

### Community 6 - "Audio Manager"
Cohesion: 0.15
Nodes (1): AudioManager

### Community 7 - "Enemy Renderer"
Cohesion: 0.18
Nodes (1): EnemyRenderer

### Community 8 - "UI Management"
Cohesion: 0.12
Nodes (1): UI

### Community 9 - "Exp Level Scaling Design"
Cohesion: 0.16
Nodes (18): 經驗值等級加權條目, 經驗值失衡分析, 決策2: 套用位置 (kill-time only), 決策4: 重用 expGrowthRate, 決策1: 倍率公式 1.5^(level-1), 決策3: Minion 一致套用, 實作規格 (helper + 修改3處), 不在撿取時套用理由 (+10 more)

### Community 10 - "Object Pool"
Cohesion: 0.16
Nodes (1): ObjectPool

### Community 11 - "Debug Overlay"
Cohesion: 0.22
Nodes (1): DebugOverlay

### Community 12 - "Storage Manager"
Cohesion: 0.22
Nodes (1): StorageManager

### Community 13 - "Player Combat"
Cohesion: 0.14
Nodes (1): PlayerCombat

### Community 14 - "Wave Manager"
Cohesion: 0.17
Nodes (1): WaveManager

### Community 15 - "Tile Manager"
Cohesion: 0.21
Nodes (1): TileManager

### Community 16 - "Achievement System"
Cohesion: 0.25
Nodes (1): AchievementManager

### Community 17 - "Tileset Cleaner Tool"
Cohesion: 0.22
Nodes (1): TilesetCleaner

### Community 18 - "Game Logger"
Cohesion: 0.2
Nodes (1): GameLogger

### Community 19 - "Utils Functions"
Cohesion: 0.22
Nodes (2): randomInt(), randomRange()

### Community 20 - "Boss Spawn Effect"
Cohesion: 0.22
Nodes (1): BossSpawnEffect

### Community 21 - "Game Validator"
Cohesion: 0.31
Nodes (1): GameValidator

### Community 22 - "Player Renderer"
Cohesion: 0.39
Nodes (1): PlayerRenderer

### Community 23 - "Spatial Grid"
Cohesion: 0.25
Nodes (1): SpatialGrid

### Community 24 - "Visibility Mask"
Cohesion: 0.25
Nodes (1): VisibilityMask

### Community 25 - "Boss Death Effect"
Cohesion: 0.25
Nodes (1): BossDeathEffect

### Community 26 - "Explosion Effect"
Cohesion: 0.25
Nodes (1): Explosion

### Community 27 - "Projectile"
Cohesion: 0.25
Nodes (1): Projectile

### Community 28 - "Shield Break Effect"
Cohesion: 0.25
Nodes (1): ShieldBreakEffect

### Community 29 - "Split Effect"
Cohesion: 0.25
Nodes (1): SplitEffect

### Community 30 - "Chain Kill Display"
Cohesion: 0.29
Nodes (1): ChainKillDisplay

### Community 31 - "Damage Number"
Cohesion: 0.33
Nodes (1): DamageNumber

### Community 32 - "Enemy Behaviors"
Cohesion: 0.4
Nodes (1): EnemyBehaviors

### Community 33 - "Enemy Core"
Cohesion: 0.33
Nodes (1): EnemyCore

### Community 34 - "Experience Orb"
Cohesion: 0.33
Nodes (1): ExperienceOrb

### Community 35 - "Boss Phase Manager"
Cohesion: 0.4
Nodes (1): BossPhaseManager

### Community 36 - "Player Core"
Cohesion: 0.4
Nodes (1): PlayerCore

### Community 37 - "Floor Tileset Art"
Cohesion: 0.4
Nodes (5): Dirt Floor Tile, Floor Texture Art Asset, Grass Floor Tile, Stone Floor Tile, Floor Tileset

### Community 38 - "Decoration Sprites"
Cohesion: 1.0
Nodes (4): Flower Sprite, Grass Tuft Sprite, Mushroom Sprite, Rock Sprite

### Community 39 - "Main Entry Point"
Cohesion: 0.67
Nodes (0): 

### Community 40 - "Debug Tools Requirements"
Cohesion: 0.67
Nodes (3): Debug 工具要求, DebugOverlay (可視化調試), GameLogger (Console 日誌)

### Community 41 - "Talent System"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "ObjectPool Tests"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Boss & Visibility Systems"
Cohesion: 1.0
Nodes (2): Boss 多階段系統, 波次系統

### Community 44 - "GameLogger Specs"
Cohesion: 1.0
Nodes (2): GameLogger 提案, GameLogger 日誌等級

### Community 45 - "Vitest Config"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Talent Tests"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Utils Tests"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Project README"
Cohesion: 1.0
Nodes (1): survivor.js README

### Community 49 - "Talent System Spec"
Cohesion: 1.0
Nodes (1): 天賦系統 (14 種)

### Community 50 - "Difficulty System Spec"
Cohesion: 1.0
Nodes (1): 階段性難度系統

### Community 51 - "Achievement System Spec"
Cohesion: 1.0
Nodes (1): 成就系統 (19 個)

### Community 52 - "Web Audio System Spec"
Cohesion: 1.0
Nodes (1): Web Audio 音效系統

### Community 53 - "localStorage Save Spec"
Cohesion: 1.0
Nodes (1): localStorage 存檔系統

### Community 54 - "Chain Kill System Spec"
Cohesion: 1.0
Nodes (1): 視野遮罩系統

### Community 55 - "P1 Game Screenshot"
Cohesion: 1.0
Nodes (1): Game Screenshot (P1)

## Ambiguous Edges - Review These
- `Floor Tileset` → `Grass Floor Tile`  [AMBIGUOUS]
  images/floor_tileset.png · relation: references
- `Floor Tileset` → `Stone Floor Tile`  [AMBIGUOUS]
  images/floor_tileset.png · relation: references
- `Floor Tileset` → `Dirt Floor Tile`  [AMBIGUOUS]
  images/floor_tileset.png · relation: references

## Knowledge Gaps
- **36 isolated node(s):** `Player/Enemy 組合模式`, `survivor.js README`, `動態難度平衡`, `shieldHp/hasShield Setter 缺失修復`, `GameLogger (Console 日誌)` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Talent System`** (2 nodes): `talent.js`, `getRandomUpgrades()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ObjectPool Tests`** (2 nodes): `objectPool.test.js`, `reset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Boss & Visibility Systems`** (2 nodes): `Boss 多階段系統`, `波次系統`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GameLogger Specs`** (2 nodes): `GameLogger 提案`, `GameLogger 日誌等級`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vitest Config`** (1 nodes): `vitest.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Talent Tests`** (1 nodes): `talent.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Utils Tests`** (1 nodes): `utils.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project README`** (1 nodes): `survivor.js README`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Talent System Spec`** (1 nodes): `天賦系統 (14 種)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Difficulty System Spec`** (1 nodes): `階段性難度系統`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Achievement System Spec`** (1 nodes): `成就系統 (19 個)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Web Audio System Spec`** (1 nodes): `Web Audio 音效系統`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `localStorage Save Spec`** (1 nodes): `localStorage 存檔系統`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chain Kill System Spec`** (1 nodes): `視野遮罩系統`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `P1 Game Screenshot`** (1 nodes): `Game Screenshot (P1)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Floor Tileset` and `Grass Floor Tile`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Floor Tileset` and `Stone Floor Tile`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Floor Tileset` and `Dirt Floor Tile`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `文件中心導覽` connect `Engine Choice Analysis` to `Update Loop & Bug History`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `CHANGELOG Unreleased 段` connect `Update Loop & Bug History` to `Exp Level Scaling Design`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `Player/Enemy 組合模式`, `survivor.js README`, `動態難度平衡` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Player Class API` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._