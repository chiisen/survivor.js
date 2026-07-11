# Graph Report - .  (2026-07-11)

## Corpus Check
- 43 files ¡P ~431,621 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 479 nodes ¡P 563 edges ¡P 44 communities detected
- Extraction: 100% EXTRACTED ¡P 0% INFERRED ¡P 0% AMBIGUOUS
- Token cost: 0 input ¡P 0 output

## God Nodes (most connected - your core abstractions)
1. `Player` - 47 edges
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
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (1): Player

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (1): Game

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (1): Enemy

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (1): AudioManager

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (1): EnemyRenderer

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (1): UI

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (1): ObjectPool

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (1): DebugOverlay

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (1): StorageManager

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (1): PlayerCombat

### Community 10 - "Community 10"
Cohesion: 0.21
Nodes (2): DecorationManager, EnvironmentParticle

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (1): WaveManager

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (1): GroundDecoration

### Community 13 - "Community 13"
Cohesion: 0.21
Nodes (1): TileManager

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (1): AchievementManager

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (1): TilesetCleaner

### Community 16 - "Community 16"
Cohesion: 0.2
Nodes (1): GameLogger

### Community 17 - "Community 17"
Cohesion: 0.24
Nodes (1): SpatialGrid

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (2): randomInt(), randomRange()

### Community 19 - "Community 19"
Cohesion: 0.22
Nodes (1): BossSpawnEffect

### Community 20 - "Community 20"
Cohesion: 0.31
Nodes (1): GameValidator

### Community 21 - "Community 21"
Cohesion: 0.39
Nodes (1): PlayerRenderer

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (1): VisibilityMask

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (1): BossDeathEffect

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (1): Explosion

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (1): Projectile

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (1): ShieldBreakEffect

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (1): SplitEffect

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (1): ChainKillDisplay

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (1): DamageNumber

### Community 30 - "Community 30"
Cohesion: 0.4
Nodes (1): EnemyBehaviors

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (1): EnemyCore

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (1): ExperienceOrb

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (1): MagnetItem

### Community 34 - "Community 34"
Cohesion: 0.4
Nodes (1): BossPhaseManager

### Community 35 - "Community 35"
Cohesion: 0.4
Nodes (1): PlayerCore

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 37`** (2 nodes): `talent.js`, `getRandomUpgrades()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `magnet.test.js`, `getEffectiveRange()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (2 nodes): `objectPool.test.js`, `reset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `vitest.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `spatialGrid.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `talent.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `utils.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 9` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._