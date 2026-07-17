import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Projectile } from './projectile.js';
import { ExperienceOrb } from './experience.js';
import { Explosion } from './explosion.js';
import { DamageNumber } from './damageNumber.js';
import { ChainKillDisplay } from './chainKillDisplay.js';
import { SpatialGrid } from './spatialGrid.js';
import { ObjectPool } from './objectPool.js';
import { AudioManager } from './audio.js';
import { DecorationManager } from './decoration.js';
import { WaveManager } from './waveManager.js';
import { StorageManager } from './storage.js';
import { getRandomUpgrades, UPGRADES, MAX_LEVEL } from './talent.js';
import { UI } from './ui.js';
import { distance, distanceSquared, getExpLevelMultiplier } from './utils.js';
import { BossSpawnEffect } from './bossSpawnEffect.js';
import { ShieldBreakEffect } from './shieldBreakEffect.js';
import { BossDeathEffect } from './bossDeathEffect.js';
import { SplitEffect } from './splitEffect.js';
import { AchievementManager } from './achievement.js';
import { GameLogger } from './gameLogger.js';
import { DebugOverlay } from './debugOverlay.js';
import { GameValidator } from './gameValidator.js';
import { VisibilityMask } from './visibilityMask.js';
import { MagnetItem } from './magnetItem.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        
        this.player = null;
        this.enemies = [];
        this.projectilePool = new ObjectPool(
            () => new Projectile(),
            (obj, x, y, targetX, targetY, speed, damage) => obj.init(x, y, targetX, targetY, speed, damage),
            50,
            200
        );
        this.explosionPool = new ObjectPool(
            () => new Explosion(),
            (obj, x, y) => obj.init(x, y),
            20,
            50
        );
        this.enemyProjectiles = [];
        this.expOrbs = [];
        this.magnetItems = [];
        this.damageNumbers = [];
        this.chainKillDisplay = new ChainKillDisplay();
        this.ui = new UI();
        this.audio = new AudioManager();
        this.pauseScreen = document.getElementById('pause-screen');
        this.decorationManager = new DecorationManager(this.canvas.width, this.canvas.height);
        this.waveManager = new WaveManager();
        this.storageManager = new StorageManager();
        this.skipCountdown = false;
        this.bossesKilled = 0;
        this.enemyGrid = new SpatialGrid(100);
        this.projectileGrid = new SpatialGrid(100);
        
        this.bossSpawnPool = new ObjectPool(
            () => new BossSpawnEffect(),
            (obj, x, y) => obj.init(x, y),
            3,
            10
        );
        this.shieldBreakPool = new ObjectPool(
            () => new ShieldBreakEffect(),
            (obj, x, y) => obj.init(x, y),
            5,
            15
        );
        this.bossDeathPool = new ObjectPool(
            () => new BossDeathEffect(),
            (obj, x, y) => obj.init(x, y),
            2,
            10
        );
        this.splitEffectPool = new ObjectPool(
            () => new SplitEffect(),
            (obj, x, y) => obj.init(x, y),
            10,
            30
        );
        this.achievementManager = new AchievementManager();
        this.screenShake = { x: 0, y: 0 };
        this.achievementNotifications = [];
        
        this.floorImage = new Image();
        this.floorImage.src = 'images/floor_tileset.png';
        this.floorImageLoaded = false;
        this.floorImage.onload = () => {
            this.floorImageLoaded = true;
        };
        
        this.logger = new GameLogger();
        this.debugOverlay = new DebugOverlay(this);
        this.gameValidator = new GameValidator(this);
        this.visibilityMask = new VisibilityMask();
        
        this.keys = {};
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.gameTime = 0;
        
        this.spawnTimer = 0;
        
        this.level = 1;
        this.exp = 0;
        this.expToLevel = 100;
        this.kills = 0;
        
        this.expGrowthRate = 1.5;
        
        this.difficulty = 'normal';
        this.difficultySettings = {
            easy: {
                enemySpawnMultiplier: 0.7,
                enemyHpMultiplier: 0.7,
                enemyDamageMultiplier: 0.7,
                playerHpMultiplier: 1.3,
                bossHpMultiplier: 0.8,
                name: '簡單'
            },
            normal: {
                enemySpawnMultiplier: 1,
                enemyHpMultiplier: 1,
                enemyDamageMultiplier: 1,
                playerHpMultiplier: 1,
                bossHpMultiplier: 1,
                name: '普通'
            },
            hard: {
                enemySpawnMultiplier: 1.5,
                enemyHpMultiplier: 1.5,
                enemyDamageMultiplier: 1.3,
                playerHpMultiplier: 0.8,
                bossHpMultiplier: 2,
                name: '困難'
            },
            hell: {
                enemySpawnMultiplier: 2,
                enemyHpMultiplier: 3,
                enemyDamageMultiplier: 1.5,
                playerHpMultiplier: 0.8,
                bossHpMultiplier: 4,
                name: '地獄'
            },
            nightmare: {
                enemySpawnMultiplier: 2.5,
                enemyHpMultiplier: 5,
                enemyDamageMultiplier: 2,
                playerHpMultiplier: 0.6,
                bossHpMultiplier: 6,
                name: '噩夢'
            }
        };

        this.currentStage = 'forest';
        this.stageSettings = {
            forest: { bgColor: '#1a3a1a', name: '翡翠森林', enemyTypes: ['normal', 'fast', 'splitter'], bossHpBonus: 1 },
            desert: { bgColor: '#3a2a1a', name: '炙熱沙漠', enemyTypes: ['normal', 'tank', 'explosive'], bossHpBonus: 1.3 },
            ice: { bgColor: '#1a2a3a', name: '冰封雪原', enemyTypes: ['fast', 'ranged', 'flyer'], bossHpBonus: 1.6 },
            volcano: { bgColor: '#3a1a0a', name: '熔岩火山', enemyTypes: ['tank', 'explosive', 'rage'], bossHpBonus: 2 }
        };
        
        this.setupInput();
        this.setupRestart();
        this.setupSaveButton();
        this.setupToggleMaxSkills();

        this.dirToAngle = new Map();
        this.defaultAngle = 0;
    }

    setAngleConfig(dirToAngle, defaultAngle) {
        this.dirToAngle = dirToAngle;
        this.defaultAngle = defaultAngle;
        if (this.player) {
            this.player.setAngleConfig(dirToAngle, defaultAngle);
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.decorationManager) {
            this.decorationManager.resize(this.canvas.width, this.canvas.height);
        }
    }

    setArmorColor(color) {
        this.armorColor = color;
        if (this.player && this.player.renderer) {
            this.player.renderer.setArmorColor(color);
        }
    }

    setSkipCountdown(value) {
        this.skipCountdown = value;
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === 'd' || e.key === 'D') {
                if (e.ctrlKey && e.shiftKey) {
                    this.debugOverlay.toggle();
                    this.keys['d'] = false;
                    this.keys['D'] = false;
                    e.preventDefault();
                    return;
                }
            }
            
            if (e.key === 'v' || e.key === 'V') {
                if (e.ctrlKey && e.shiftKey) {
                    this.gameValidator.toggle();
                    this.keys['v'] = false;
                    this.keys['V'] = false;
                    e.preventDefault();
                    return;
                }
            }
            
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (this.isRunning && !this.ui.isUpgradeModalOpen()) {
                    this.togglePause();
                }
            }
            
            if ((e.key === 'q' || e.key === 'Q') && this.isRunning && !this.isPaused && this.player.canUseSkill()) {
                this.useUltimateSkill();
            }
            
            if (e.key === 'm' || e.key === 'M') {
                if (e.ctrlKey && e.shiftKey) {
                    if (this.player) {
                        this.player.magnetTimer += 5;
                        this.ui.showBuffNotification("開發者模式：啟動 5 秒磁力風暴", 3);
                    }
                    this.keys['m'] = false;
                    this.keys['M'] = false;
                    e.preventDefault();
                    return;
                }
            }
            
            if (e.key === 'p' || e.key === 'P') {
                if (e.ctrlKey && e.shiftKey) {
                    this.logPoolStats();
                    this.keys['p'] = false;
                    this.keys['P'] = false;
                    e.preventDefault();
                    return;
                }
            }
            
            if (e.key === 'l' || e.key === 'L') {
                if (e.ctrlKey && e.shiftKey) {
                    this.logger.cycleLogLevel();
                    this.keys['l'] = false;
                    this.keys['L'] = false;
                    e.preventDefault();
                    return;
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        window.addEventListener('resize', () => {
            this.resize();
            if (this.player) {
                this.player.x = Math.min(this.player.x, this.canvas.width - this.player.radius);
                this.player.y = Math.min(this.player.y, this.canvas.height - this.player.radius);
            }
        });
    }

    hasPlayerInput() {
        return this.keys['w'] || this.keys['W'] || this.keys['ArrowUp'] ||
               this.keys['s'] || this.keys['S'] || this.keys['ArrowDown'] ||
               this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft'] ||
               this.keys['d'] || this.keys['D'] || this.keys['ArrowRight'];
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        const settings = this.difficultySettings[difficulty];
        const display = document.getElementById('difficulty-display');
        if (display) {
            display.textContent = settings.name;
            const colors = { easy: '#2ecc71', normal: '#f39c12', hard: '#e67e22', hell: '#c0392b', nightmare: '#9b59b6' };
            display.style.color = colors[difficulty] || '#f39c12';
        }
    }

    setStage(stage) {
        this.currentStage = stage;
    }

    setupRestart() {
        this.ui.onRestart(() => {
            this.restart();
        });
    }

    setupSaveButton() {
        const saveBtn = document.getElementById('save-btn');
        const saveMessage = document.getElementById('save-message');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (this.isRunning && this.isPaused) {
                    const success = this.saveGame();
                    if (success && saveMessage) {
                        saveMessage.classList.remove('hidden');
                        setTimeout(() => {
                            saveMessage.classList.add('hidden');
                        }, 2000);
                    }
                }
            });
        }
    }

    setupToggleMaxSkills() {
        const toggleBtn = document.getElementById('toggle-max-skills');
        const skillStats = document.getElementById('skill-stats');
        if (toggleBtn && skillStats) {
            toggleBtn.addEventListener('click', () => {
                const hidden = skillStats.classList.toggle('hide-max');
                toggleBtn.textContent = hidden ? '▶ 顯示 MAX 技能' : '▼ 隱藏 MAX 技能';
            });
        }
    }

start() {
        if (!this.difficulty) {
            this.difficulty = 'normal';
        }
        if (!this.currentStage) {
            this.currentStage = 'forest';
        }
        const difficultySettings = this.difficultySettings[this.difficulty];
        const stageSettings = this.stageSettings[this.currentStage];

        // 設定畫布背景色
        if (stageSettings) {
            this.canvas.style.background = stageSettings.bgColor;
        }
        
        this.level = 1;
        this.exp = 0;
        this.expToLevel = 100;
        this.kills = 0;
        this.gameTime = 0;
        this.spawnTimer = 0;
        
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.player.setAngleConfig(this.dirToAngle, this.defaultAngle);
        if (this.armorColor) {
            this.player.setArmorColor(this.armorColor);
        }

        // 玩家 HP = 100 + (level-1) × 20，再乘以難度倍率
        const levelHpBonus = 100 + (this.level - 1) * 20;
        this.player.maxHp = Math.floor(levelHpBonus * difficultySettings.playerHpMultiplier);
        this.player.hp = this.player.maxHp;
        
        this.enemies = [];
        this.projectilePool.releaseAll();
        this.explosionPool.releaseAll();
        this.bossSpawnPool.releaseAll();
        this.shieldBreakPool.releaseAll();
        this.bossDeathPool.releaseAll();
        this.splitEffectPool.releaseAll();
        this.enemyProjectiles = [];
        this.expOrbs = [];
        this.magnetItems = [];
        this.damageNumbers = [];
        this.chainKillDisplay.clear();
        this.waveManager.reset();
        this.bossesKilled = 0;
        this.isRunning = true;
        this.isPaused = false;
        this.pauseScreen.classList.add('hidden');
        this.ui.hideGameOver();
        this.ui.clearBuffNotifications();
        this.audioStarted = false;
        this.screenShake = { x: 0, y: 0 };
        this.ui.updateHp(this.player.hp, this.player.maxHp);
        this.ui.updateShield(this.player.shield, this.player.maxShield);
        this.ui.updateExp(0, this.expToLevel);
        this.ui.updateLevel(this.level);
        this.updateSkillStats();
        
        this.audio.audioStarted = true;
        this.audio.resumeContext();
        this.audio.startBGM();
        
        this.lastTime = performance.now();
        this.loop();
    }

    restart() {
        this.ui.hideGameOver();
        this.ui.clearBuffNotifications();
        this.start();
    }

    loop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        if (!this.isPaused) {
            this.update(dt);
        }
        
        this.render();
        requestAnimationFrame(() => this.loop());
    }

update(dt) {
        this.gameTime += dt;
        this.logger.reset();
        
        // ==================== Phase 1: 清理與準備 ====================
        this.logger.phase('phase1', { enemies: this.enemies.length });
        this.enemyGrid.clear();
        for (const enemy of this.enemies) {
            this.enemyGrid.insert(enemy);
        }
        
        // ==================== Phase 2: 狀態更新 ====================
this.logger.phase('phase2', { fireCooldown: this.player.fireCooldown });
        
        this.player.update(dt, this.keys, this.canvas.width, this.canvas.height);
        
        this.gameValidator.validatePhase2();
        
        // 2.2 敵人狀態（生成後立即插入 Grid）
        this.decorationManager.update(dt, this.gameTime);
        const normalEnemyCount = this.enemies.filter(e => !e.type.isBoss).length;
        this.waveManager.update(dt, this.gameTime, normalEnemyCount);
        
        if (this.waveManager.isBreak && this.player.maxShield > 0) {
            this.player.shield = this.player.maxShield;
            this.ui.updateShield(this.player.shield, this.player.maxShield);
        }
        
        this.spawnTimer += dt;
        const difficultySettings = this.difficultySettings[this.difficulty];
        const spawnInterval = this.waveManager.getSpawnInterval() / difficultySettings.enemySpawnMultiplier;
        
        const spawnCount = difficultySettings.enemySpawnMultiplier > 1.5 ? 2 : 1;
        
        if (this.spawnTimer >= spawnInterval) {
            this.spawnTimer = 0;
            if (this.waveManager.shouldSpawnEnemy(this.enemies.length)) {
                for (let i = 0; i < spawnCount; i++) {
                    if (this.waveManager.shouldSpawnEnemy(this.enemies.length)) {
                        const enemy = this.spawnEnemy(false);
                        this.enemyGrid.insert(enemy);
                    }
                }
            }
        }
        
        if (this.waveManager.shouldSpawnBoss()) {
            const boss = this.spawnEnemy(true);
            if (boss) {
                this.enemyGrid.insert(boss);
                this.bossSpawnPool.get(boss.x, boss.y);
                this.audio.playChainKill();
            }
        }
        
        for (const enemy of this.enemies) {
            const wasRage = enemy.rageMode;
            const shootData = enemy.update(dt, this.player.x, this.player.y, this.player.attackRange);

            // BOSS 進入狂暴時觸發畫面震撼
            if (enemy.type.isBoss && !wasRage && enemy.rageMode) {
                this.screenShake.x = (Math.random() - 0.5) * 20;
                this.screenShake.y = (Math.random() - 0.5) * 20;
            }

            if (shootData) {
                if (shootData.type === 'spawn_minion') {
                    const spawnCount = enemy.phase >= 3 ? 3 : 2;
                    const spawnElite = enemy.phase >= 3;
                    this.spawnMinionEnemies(shootData.x, shootData.y, spawnCount, spawnElite);
                } else if (shootData.type === 'multi_projectile') {
                    for (const proj of shootData.projectiles) {
                        this.enemyProjectiles.push(proj);
                    }
                } else {
                    this.enemyProjectiles.push(shootData);
                }
            }
        }
        
        // 2.3 投射物狀態
        const projectiles = this.projectilePool.getActiveObjects();
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            if (!projectile.active) continue;
            projectile.update(dt);
        }
        
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const proj = this.enemyProjectiles[i];
            
            if (proj.trail) {
                proj.trail.unshift({ x: proj.x, y: proj.y });
                if (proj.trail.length > proj.maxTrailLength) {
                    proj.trail.pop();
                }
            }
            
            proj.x += proj.vx * dt;
            proj.y += proj.vy * dt;
        }
        
        // ==================== Phase 3: 系統更新 ====================
        this.logger.phase('phase3', { canFire: this.player.canFire() });
        
        // 3.1 自動射擊（依賴 player.fireCooldown 已更新）
this.autoFire();
        
        this.checkCollisions(dt);
        
        this.gameValidator.validatePhase3();
        
        // ==================== Phase 4: UI 更新 ====================
        this.logger.phase('phase4', { kills: this.kills, exp: this.exp });
        
        this.updateSkillCooldownUI();
        
        const explosions = this.explosionPool.getActiveObjects();
        for (let i = explosions.length - 1; i >= 0; i--) {
            const explosion = explosions[i];
            if (!explosion.active) continue;
            
            explosion.update(dt);
            
            if (explosion.isFinished()) {
                this.explosionPool.release(explosion);
            }
        }
        
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const damageNumber = this.damageNumbers[i];
            damageNumber.update(dt);
            
            if (damageNumber.isFinished()) {
                this.damageNumbers.splice(i, 1);
            }
        }
        
        this.chainKillDisplay.update(dt);

        // 處理敵人狀態效果（灼燒/冰凍）
        for (const enemy of this.enemies) {
            // 灼燒DOT
            if (enemy.isBurning) {
                enemy.burnTime -= dt;
                enemy.hp -= enemy.burnDps * dt;
                if (enemy.burnTime <= 0) {
                    enemy.isBurning = false;
                }
                if (enemy.hp <= 0) {
                    this.handleEnemyDeath(enemy, null);
                }
            }

            // 冰凍解凍
            if (enemy.isFrozen) {
                enemy.freezeTime -= dt;
                if (enemy.freezeTime <= 0) {
                    enemy.isFrozen = false;
                    enemy.speed = enemy.originalSpeed || enemy.speed;
                }
            }
        }

        for (const item of this.magnetItems) {
            item.update(dt);
        }
        
        for (let i = this.expOrbs.length - 1; i >= 0; i--) {
            const orb = this.expOrbs[i];
            
            const forceAttract = (this.waveManager.isBreak && this.expOrbs.length > 0) || this.player.magnetTimer > 0;
            const effectivePickupRange = forceAttract ? 1000 : this.player.pickupRange;
            
            orb.update(dt, this.player.x, this.player.y, effectivePickupRange);
            
            if (orb.isCollected(this.player.x, this.player.y, this.player.radius)) {
                this.audio.playPickup();
                const expValue = Math.floor(orb.value * (1 + this.player.expBonus));
                this.exp += expValue;
                this.expOrbs.splice(i, 1);
                
                this.checkLevelUp();
            }
        }
        
        this.ui.updateTimer(this.gameTime);
        
        this.updateEffects(dt);
        
        this.projectilePool.cleanInactive();
        
        if (Math.floor(this.gameTime) % 30 === 0 && Math.floor(this.gameTime) !== Math.floor(this.gameTime - dt)) {
            this.projectilePool.autoAdjust();
        }
        
        this.projectilePool.cleanInactive();
        
        if (this.gameTime % 30 < dt) {
            this.projectilePool.autoAdjust();
        }
        
        this.screenShake = { x: 0, y: 0 };
        for (const spawnEffect of this.bossSpawnPool.getActiveObjects()) {
            if (spawnEffect.active) {
                const shake = spawnEffect.getShakeOffset();
                this.screenShake.x += shake.x;
                this.screenShake.y += shake.y;
            }
        }
        
        // 更新 DebugOverlay
        this.debugOverlay.update();
    }
    
    checkCollisions(dt) {
        // 敵人與玩家碰撞
        const nearbyEnemies = this.enemyGrid.getNearby(this.player.x, this.player.y, this.player.radius + 50);
        for (const enemy of nearbyEnemies) {
            if (!this.enemies.includes(enemy)) continue;
            
            const distSq = distanceSquared(enemy.x, enemy.y, this.player.x, this.player.y);
            const radiusSum = enemy.radius + this.player.radius;
            if (distSq < radiusSum * radiusSum) {
                const result = this.player.takeDamage(enemy.damage);
                if (result.hpChanged) {
                    this.audio.playDamage();
                    this.ui.updateHp(this.player.hp, this.player.maxHp);
                    this.ui.updateShield(this.player.shield, this.player.maxShield);

                    // 荊棘反傷
                    if (this.player.thorns > 0) {
                        const thornsDmg = Math.max(1, Math.floor(enemy.damage * this.player.thorns));
                        enemy.hp -= thornsDmg;
                        this.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.radius, thornsDmg, '#1abc9c'));
                        this.limitDamageNumbers();
                        if (enemy.hp <= 0) {
                            this.handleEnemyDeath(enemy, null);
                        }
                    }

                    // 吸血型回血
                    if (enemy.type.isLeech && enemy.type.healOnHit) {
                        enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.type.healOnHit);
                        this.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.radius - 15, enemy.type.healOnHit, '#ff4444'));
                        this.limitDamageNumbers();
                    }

                    if (result.isDead) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }
        
        // 敵人投射物與玩家碰撞
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const proj = this.enemyProjectiles[i];
            
            if (proj.x < -100 || proj.x > this.canvas.width + 100 ||
                proj.y < -100 || proj.y > this.canvas.height + 100) {
                this.enemyProjectiles.splice(i, 1);
                continue;
            }
            
            const dist = distance(proj.x, proj.y, this.player.x, this.player.y);
            if (dist < proj.radius + this.player.radius) {
                const result = this.player.takeDamage(proj.damage);
                if (result.hpChanged) {
                    this.audio.playDamage();
                    this.ui.updateHp(this.player.hp, this.player.maxHp);
                    this.ui.updateShield(this.player.shield, this.player.maxShield);
                }
                this.enemyProjectiles.splice(i, 1);
                
                if (result.isDead) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // 玩家投射物與敵人碰撞
        const projectiles = this.projectilePool.getActiveObjects();
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            if (!projectile.active) continue;
            
            if (projectile.isOutOfBounds(this.canvas.width, this.canvas.height)) {
                this.projectilePool.release(projectile);
                continue;
            }
            
            const nearbyEnemies = this.enemyGrid.getNearby(projectile.x, projectile.y, projectile.radius + 30);
            
            for (const enemy of nearbyEnemies) {
                if (!this.enemies.includes(enemy)) continue;
                
                const distSq = distanceSquared(projectile.x, projectile.y, enemy.x, enemy.y);
                const radiusSum = projectile.radius + enemy.radius;
                
                if (distSq < radiusSum * radiusSum) {
                    if (enemy.isStealth) {
                        enemy.reveal();
                    }
                    
                    let actualDamage = projectile.damage;
                    let damageColor = null;
                    
                    if (enemy.hasShield && enemy.shieldHp > 0) {
                        if (enemy.shieldHp >= actualDamage) {
                            enemy.shieldHp -= actualDamage;
                            actualDamage = 0;
                            damageColor = '#3498db';
                        } else {
                            actualDamage -= enemy.shieldHp;
                            enemy.shieldHp = 0;
                            enemy.hasShield = false;
                            this.shieldBreakPool.get(enemy.x, enemy.y);
                        }
                    }
                    
                    if (actualDamage > 0) {
                        // 裝甲型減傷
                        if (enemy.type.isArmored && enemy.type.damageReduction) {
                            actualDamage = Math.max(1, Math.floor(actualDamage * (1 - enemy.type.damageReduction)));
                        }
                        enemy.hp -= actualDamage;

                        // 狂暴型受擊加速
                        if (enemy.type.isRaging && enemy.type.speedIncreasePerHit) {
                            enemy.speed += enemy.type.speedIncreasePerHit;
                        }
                    }
                    
                    if (projectile.isCrit) {
                        damageColor = '#e74c3c';
                    }
                    
                    this.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.radius, projectile.damage, damageColor));
                    this.limitDamageNumbers();
                    this.audio.playHit();

                    // 灼燒效果
                    if (this.player.burnDamage > 0 && !enemy.isBurning) {
                        enemy.isBurning = true;
                        enemy.burnTime = 3;
                        enemy.burnDps = this.player.burnDamage;
                    }

                    // 冰凍效果
                    if (this.player.freezeChance > 0 && !enemy.isFrozen && Math.random() < this.player.freezeChance) {
                        enemy.isFrozen = true;
                        enemy.freezeTime = 1.5;
                        enemy.originalSpeed = enemy.speed;
                        enemy.speed = 0;
                    }

                    // 穿透邏輯
                    if (this.player.penetrate > 0 && projectile.penetrateCount === undefined) {
                        projectile.penetrateCount = 0;
                    }
                    if (this.player.penetrate > 0 && projectile.penetrateCount < this.player.penetrate) {
                        projectile.penetrateCount++;
                        projectile.active = true;
                    } else {
                        this.projectilePool.release(projectile);
                    }
                    
                    if (enemy.hp <= 0) {
                        this.handleEnemyDeath(enemy, projectile);
                    }
                    break;
                }
            }
        }

        // 磁鐵拾取檢測
        for (let i = this.magnetItems.length - 1; i >= 0; i--) {
            const item = this.magnetItems[i];
            if (item.isCollected(this.player.x, this.player.y, this.player.radius)) {
                this.audio.playPickup(); // 播放拾取音效
                this.player.magnetTimer += 5; // 增加 5 秒持續時間 (時間累加)
                this.magnetItems.splice(i, 1); // 自陣列移除
                this.ui.showBuffNotification(`磁力風暴！持續時間增加 5 秒`, 3); // 提示
            }
        }
    }
    
    handleEnemyDeath(enemy, projectile) {
        this.audio.playKill();
        
        if (this.player.lifesteal > 0) {
            this.player.heal(this.player.lifesteal);
            this.ui.updateHp(this.player.hp, this.player.maxHp);
            this.ui.updateShield(this.player.shield, this.player.maxShield);
        }
        
        if (enemy.type.isBoss) {
            this.bossesKilled++;
            this.bossDeathPool.get(enemy.x, enemy.y);
            this.audio.playChainKill();
        }
        
        if (enemy.explosive) {
            this.createExplosiveDeath(enemy);
        }
        
        if (!enemy.type.isBoss) {
            this.explosionPool.get(enemy.x, enemy.y);
        }
        
        let chainKills = 1;
        const chainKillExpBonus = this.getChainKillExpBonus(chainKills);
        const expValue = this.calculateExpValue(enemy.expValue, chainKillExpBonus);
        this.spawnExpOrbs(enemy.x, enemy.y, expValue);
        
        // 3% 機率掉落磁鐵道具
        if (Math.random() < 0.03) {
            this.magnetItems.push(new MagnetItem(enemy.x, enemy.y));
        }
        
        if (enemy.canSplit) {
            this.createSplitEnemies(enemy);
        }
        
        const chainRadius = 40;
        const chainNearby = this.enemyGrid.getNearby(enemy.x, enemy.y, chainRadius);
        
        const initialExpBonus = this.getChainKillExpBonus(1);
        
        for (const nearbyEnemy of chainNearby) {
            if (nearbyEnemy === enemy) continue;
            if (!this.enemies.includes(nearbyEnemy)) continue;
            
            const chainDistSq = distanceSquared(enemy.x, enemy.y, nearbyEnemy.x, nearbyEnemy.y);
            if (chainDistSq <= chainRadius * chainRadius) {
                this.explosionPool.get(nearbyEnemy.x, nearbyEnemy.y);
                const nearbyExpBonus = this.getChainKillExpBonus(chainKills + 1);
                const nearbyExpValue = this.calculateExpValue(nearbyEnemy.expValue, nearbyExpBonus);
                this.expOrbs.push(new ExperienceOrb(nearbyEnemy.x, nearbyEnemy.y, nearbyExpValue));
                this.damageNumbers.push(new DamageNumber(nearbyEnemy.x, nearbyEnemy.y - nearbyEnemy.radius, projectile.damage));
                this.limitDamageNumbers();
                const idx = this.enemies.indexOf(nearbyEnemy);
                if (idx !== -1) {
                    this.enemies.splice(idx, 1);
                }
                chainKills++;
            }
        }
        
        const enemyIdx = this.enemies.indexOf(enemy);
        if (enemyIdx !== -1) {
            this.enemies.splice(enemyIdx, 1);
        }
        this.kills += chainKills;
        this.checkAchievementsRealtime();

        if (chainKills >= 2) {
            this.audio.playChainKill();
            this.chainKillDisplay.trigger(chainKills);
            
            const finalExpBonus = this.getChainKillExpBonus(chainKills);
            if (!this.player.hasFireRateBuff) {
                this.player.activateFireRateBuff();
                this.ui.showBuffNotification(`連殺！攻擊速度 +30% | 經驗 +${Math.floor(finalExpBonus * 100)}%`, 5);
            } else {
                this.ui.showBuffNotification(`連殺！經驗 +${Math.floor(finalExpBonus * 100)}%`, 5);
            }
        }
    }

    updateEffects(dt) {
        for (const effect of this.bossSpawnPool.getActiveObjects()) {
            if (!effect.active) continue;
            effect.update(dt);
            if (effect.isFinished()) {
                this.bossSpawnPool.release(effect);
            }
        }
        
        for (const effect of this.shieldBreakPool.getActiveObjects()) {
            if (!effect.active) continue;
            effect.update(dt);
            if (effect.isFinished()) {
                this.shieldBreakPool.release(effect);
            }
        }
        
        for (const effect of this.bossDeathPool.getActiveObjects()) {
            if (!effect.active) continue;
            effect.update(dt);
            if (effect.isFinished()) {
                this.bossDeathPool.release(effect);
            }
        }
        
        for (const effect of this.splitEffectPool.getActiveObjects()) {
            if (!effect.active) continue;
            effect.update(dt);
            if (effect.isFinished()) {
                this.splitEffectPool.release(effect);
            }
        }
    }

    spawnEnemy(isBoss = false) {
        const difficultySettings = this.difficultySettings[this.difficulty];
        const waveHpMultiplier = this.waveManager.getEnemyHpMultiplier();
        const playerLevelMultiplier = 1 + (this.level - 1) * 0.8; // 每級增加 80% HP 以對抗玩家攻擊力提升
        const hpMultiplier = waveHpMultiplier * difficultySettings.enemyHpMultiplier * playerLevelMultiplier;
        const bossHpMultiplier = waveHpMultiplier * difficultySettings.bossHpMultiplier * playerLevelMultiplier;

        // 傷害加成：波次每波 +5%，等級每級 +30%
        const waveDamageBonus = 1 + (this.waveManager.currentWave - 1) * 0.05;
        const levelDamageBonus = 1 + (this.level - 1) * 0.3;
        const damageMultiplier = waveDamageBonus * levelDamageBonus;

        const enemy = Enemy.spawn(
            this.canvas.width,
            this.canvas.height,
            this.player.x,
            this.player.y,
            this.gameTime,
            isBoss,
            isBoss ? bossHpMultiplier : hpMultiplier
        );

        if (!isBoss) {
            enemy.damage = Math.floor(enemy.damage * difficultySettings.enemyDamageMultiplier * damageMultiplier);
        } else {
            enemy.damage = Math.floor(enemy.damage * difficultySettings.enemyDamageMultiplier * 1.5 * damageMultiplier);
        }

        this.enemies.push(enemy);
        return enemy;
    }

    createSplitEnemies(parentEnemy) {
        const splitCount = 2;
        const splitRadius = parentEnemy.radius * 0.6;
        const splitSpeed = parentEnemy.speed * 1.2;
        
        this.splitEffectPool.get(parentEnemy.x, parentEnemy.y);
        
        for (let i = 0; i < splitCount; i++) {
            const angle = (Math.PI * 2 / splitCount) * i + Math.random() * 0.5;
            const offset = 20;
            const x = parentEnemy.x + Math.cos(angle) * offset;
            const y = parentEnemy.y + Math.sin(angle) * offset;
            
            const splitEnemy = new Enemy(x, y, {
                name: 'split',
                radius: splitRadius,
                speed: splitSpeed,
                maxHp: 1,
                damage: parentEnemy.damage * 0.5,
                expValue: Math.floor(parentEnemy.expValue * 0.4),
                color: '#1abc9c',
                strokeColor: '#16a085',
                eyeColor: '#fff',
                mouthStyle: 'angry',
                canShoot: false,
                shootInterval: 0
            });
            this.enemies.push(splitEnemy);
            this.enemyGrid.insert(splitEnemy);
        }

        const chainSplitRadius = 80;
        const nearbySplitters = this.enemyGrid.getNearby(parentEnemy.x, parentEnemy.y, chainSplitRadius);
        
        for (const nearbyEnemy of nearbySplitters) {
            if (nearbyEnemy === parentEnemy) continue;
            if (!this.enemies.includes(nearbyEnemy)) continue;
            if (!nearbyEnemy.canSplit) continue;
            if (nearbyEnemy.splitTriggered) continue;
            
            const chainDistSq = distanceSquared(parentEnemy.x, parentEnemy.y, nearbyEnemy.x, nearbyEnemy.y);
            if (chainDistSq <= chainSplitRadius * chainSplitRadius) {
                nearbyEnemy.splitTriggered = true;
                this.triggerChainSplit(nearbyEnemy);
            }
        }
    }

    triggerChainSplit(enemy) {
        const splitCount = 2;
        const splitRadius = enemy.radius * 0.5;
        const splitSpeed = enemy.speed * 1.3;
        
        for (let i = 0; i < splitCount; i++) {
            const angle = (Math.PI * 2 / splitCount) * i + Math.random() * 0.5;
            const offset = 15;
            const x = enemy.x + Math.cos(angle) * offset;
            const y = enemy.y + Math.sin(angle) * offset;
            
            const splitEnemy = new Enemy(x, y, {
                name: 'split',
                radius: splitRadius,
                speed: splitSpeed,
                maxHp: 1,
                damage: Math.floor(enemy.damage * 0.4),
                expValue: Math.floor(enemy.expValue * 0.3),
                color: '#1abc9c',
                strokeColor: '#16a085',
                eyeColor: '#fff',
                mouthStyle: 'angry',
                canShoot: false,
                shootInterval: 0
            });
            this.enemies.push(splitEnemy);
            this.enemyGrid.insert(splitEnemy);
        }

        this.explosionPool.get(enemy.x, enemy.y);
        this.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.radius, 0, '#1abc9c'));
        this.limitDamageNumbers();
    }

    createExplosiveDeath(enemy) {
        const dist = distance(enemy.x, enemy.y, this.player.x, this.player.y);
        if (dist < enemy.explosionRadius + this.player.radius) {
            const result = this.player.takeDamage(enemy.explosionDamage);
            if (result.hpChanged) {
                this.audio.playDamage();
                this.ui.updateHp(this.player.hp, this.player.maxHp);
                
                if (result.isDead) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const expX = enemy.x + Math.cos(angle) * 15;
            const expY = enemy.y + Math.sin(angle) * 15;
            this.explosionPool.get(expX, expY);
        }
        
        this.damageNumbers.push(new DamageNumber(
            enemy.x,
            enemy.y - enemy.radius - 20,
            enemy.explosionDamage,
            '#f39c12'
        ));
        this.limitDamageNumbers();
    }

    spawnMinionEnemies(x, y, count, spawnElite = false) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const offset = 30;
            const minionX = x + Math.cos(angle) * offset;
            const minionY = y + Math.sin(angle) * offset;
            
            if (spawnElite) {
                const eliteMinion = new Enemy(minionX, minionY, {
                    name: 'elite_minion',
                    radius: 12,
                    speed: 60,
                    maxHp: 3,
                    damage: 10,
                    expValue: 15,
                    color: '#e67e22',
                    strokeColor: '#d35400',
                    eyeColor: '#fff',
                    mouthStyle: 'elite',
                    canShoot: false,
                    shootInterval: 0,
                    isElite: true,
                    shieldHp: 2,
                    shieldMaxHp: 2
                });
                this.enemies.push(eliteMinion);
                this.enemyGrid.insert(eliteMinion);
            } else {
                const minion = new Enemy(minionX, minionY, {
                    name: 'minion',
                    radius: 10,
                    speed: 70,
                    maxHp: 1,
                    damage: 5,
                    expValue: 5,
                    color: '#e74c3c',
                    strokeColor: '#c0392b',
                    eyeColor: '#fff',
                    mouthStyle: 'angry',
                    canShoot: false,
                    shootInterval: 0
                });
                this.enemies.push(minion);
                this.enemyGrid.insert(minion);
            }
        }
    }

    spawnExpOrbs(x, y, value) {
        const rand = Math.random();
        let count = 1;
        
        if (rand < 0.1) {
            count = 3;
        } else if (rand < 0.3) {
            count = 2;
        }
        
        const spreadDistance = 15;
        
        for (let i = 0; i < count; i++) {
            let orbX = x;
            let orbY = y;
            
            if (count > 1) {
                const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
                orbX = x + Math.cos(angle) * spreadDistance;
                orbY = y + Math.sin(angle) * spreadDistance;
            }
            
            this.expOrbs.push(new ExperienceOrb(orbX, orbY, value));
        }
    }

    calculateExpValue(baseExpValue, bonus = 0) {
        const levelMult = getExpLevelMultiplier(this.level, this.expGrowthRate);
        return Math.floor(baseExpValue * levelMult * (1 + bonus));
    }

    getChainKillExpBonus(chainKills) {
        if (chainKills >= 10) return 1.5;
        if (chainKills >= 6) return 1.0;
        if (chainKills >= 5) return 0.8;
        if (chainKills >= 4) return 0.6;
        if (chainKills >= 3) return 0.4;
        if (chainKills >= 2) return 0.2;
        return 0;
    }

    getChainKillDamageBonus(chainKills) {
        if (chainKills >= 10) return 2.0;
        if (chainKills >= 6) return 1.5;
        if (chainKills >= 5) return 1.3;
        if (chainKills >= 4) return 1.2;
        if (chainKills >= 3) return 1.1;
        if (chainKills >= 2) return 1.05;
        return 1;
    }

    useUltimateSkill() {
        this.player.useSkill();
        this.audio.playChainKill();
        
        const skillDamage = this.player.damage * 10;
        const killedCount = this.enemies.filter(e => e.hp > 0).length;
        
        for (const enemy of this.enemies) {
            enemy.hp -= skillDamage;
            this.explosionPool.get(enemy.x, enemy.y);
            this.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.radius, skillDamage, '#f1c40f'));
            this.limitDamageNumbers();
            
            if (enemy.hp <= 0) {
                const expValue = this.calculateExpValue(enemy.expValue, this.player.expBonus);
                this.expOrbs.push(new ExperienceOrb(enemy.x, enemy.y, expValue));
            }
        }
        
        this.enemies = this.enemies.filter(e => e.hp > 0);
        const nowKilledCount = killedCount - this.enemies.length;
        this.kills += nowKilledCount;
        
        this.ui.showBuffNotification('終極技能！全屏攻擊', 2);
    }

    updateSkillCooldownUI() {
        const skillDisplay = document.getElementById('skill-cooldown');
        if (!skillDisplay) return;
        
        if (this.player.skillCooldown <= 0) {
            skillDisplay.textContent = '技能: 就绪 (Q)';
            skillDisplay.style.color = '#2ecc71';
            skillDisplay.style.borderColor = 'rgba(46, 204, 113, 0.5)';
        } else {
            const remaining = Math.ceil(this.player.skillCooldown);
            skillDisplay.textContent = `技能: ${remaining}秒`;
            skillDisplay.style.color = '#e74c3c';
            skillDisplay.style.borderColor = 'rgba(231, 76, 60, 0.5)';
        }
    }

    autoFire() {
        if (!this.player.canFire() || this.enemies.length === 0) return;
        
        let closestEnemy = null;
        let closestDist = Infinity;
        
        for (const enemy of this.enemies) {
            const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist <= this.player.attackRange && dist < closestDist) {
                closestDist = dist;
                closestEnemy = enemy;
            }
        }
        
        if (closestEnemy) {
            this.player.fire(closestEnemy.x, closestEnemy.y);
            this.audio.playSwing();
            
            const count = this.player.projectileCount;
            const spreadAngle = Math.PI / 8;
            
            for (let i = 0; i < count; i++) {
                const angle = Math.atan2(
                    closestEnemy.y - this.player.y,
                    closestEnemy.x - this.player.x
                );
                
                const offsetAngle = count === 1 ? 0 : 
                    (i - (count - 1) / 2) * spreadAngle;
                
                const finalAngle = angle + offsetAngle;
                const targetX = this.player.x + Math.cos(finalAngle) * 100;
                const targetY = this.player.y + Math.sin(finalAngle) * 100;
                
                const critMultiplier = this.player.rollCrit();
                const damage = Math.floor(this.player.damage * critMultiplier);
                
                const projectile = this.projectilePool.get(
                    this.player.x,
                    this.player.y,
                    targetX,
                    targetY,
                    this.player.projectileSpeed,
                    damage
                );
                
                if (critMultiplier > 1) {
                    projectile.isCrit = true;
                }
            }
        }
    }

    checkLevelUp() {
        while (this.exp >= this.expToLevel) {
            this.exp -= this.expToLevel;
            this.level++;
            this.expToLevel = Math.floor(this.expToLevel * this.expGrowthRate);

            // 升級獎勵：攻擊力 +1, HP +20, HP 全滿
            this.player.damage += 1;
            this.player.maxHp += 20;
            this.player.hp = this.player.maxHp;
            
            this.audio.playLevelUp();
            this.ui.updateLevel(this.level);
            this.ui.updateExp(this.exp, this.expToLevel);
            this.ui.updateHp(this.player.hp, this.player.maxHp);
            this.updateSkillStats(); // 即時更新左側 UI 顯示獎勵
            
            this.showUpgradeModal();
        }
        
        this.ui.updateExp(this.exp, this.expToLevel);
    }

    showUpgradeModal() {
        this.isPaused = true;

        // 檢查是否所有技能都滿級
        const allMaxed = UPGRADES.every(u => (this.player.upgradeStats[u.type] || 0) >= MAX_LEVEL);
        if (allMaxed) {
            this.ui.showMaxLevelMessage();
            setTimeout(() => {
                this.isPaused = false;
            }, 2000);
            return;
        }

        const upgrades = getRandomUpgrades(3, this.player.upgradeStats);

        // 如果設定跳過倒數，直接隨機選一個
        if (this.skipCountdown) {
            const randomIndex = Math.floor(Math.random() * upgrades.length);
            this.ui.showUpgradeModal(upgrades, (selectedUpgrade) => {
                this.player.applyUpgrade(selectedUpgrade);
                this.ui.updateHp(this.player.hp, this.player.maxHp);
                this.ui.updateShield(this.player.shield, this.player.maxShield);
                this.updateSkillStats();
                this.isPaused = false;
            });
            setTimeout(() => {
                this.ui.highlightUpgradeOption(randomIndex);
                setTimeout(() => {
                    this.ui.hideUpgradeModal();
                    this.player.applyUpgrade(upgrades[randomIndex]);
                    this.ui.updateHp(this.player.hp, this.player.maxHp);
                    this.ui.updateShield(this.player.shield, this.player.maxShield);
                    this.updateSkillStats();
                    this.isPaused = false;
                }, 200);
            }, 100);
            return;
        }

        // 5 秒倒數 + 自動隨機選
        clearInterval(this._upgradeInterval);
        clearTimeout(this._upgradeTimer);
        let remaining = 5;
        this.ui.updateUpgradeTimer(remaining);
        this._upgradeInterval = setInterval(() => {
            remaining--;
            this.ui.updateUpgradeTimer(remaining);
        }, 1000);
        this._upgradeTimer = setTimeout(() => {
            clearInterval(this._upgradeInterval);
            if (this.ui.isUpgradeModalOpen()) {
                const randomIndex = Math.floor(Math.random() * upgrades.length);
                this.ui.highlightUpgradeOption(randomIndex);
                setTimeout(() => {
                    this.ui.hideUpgradeModal();
                    this.player.applyUpgrade(upgrades[randomIndex]);
                    this.ui.updateHp(this.player.hp, this.player.maxHp);
                    this.ui.updateShield(this.player.shield, this.player.maxShield);
                    this.updateSkillStats();
                    this.isPaused = false;
                }, 500);
            }
        }, 5000);

        this.ui.showUpgradeModal(upgrades, (selectedUpgrade) => {
            clearInterval(this._upgradeInterval);
            clearTimeout(this._upgradeTimer);
            this.player.applyUpgrade(selectedUpgrade);
            this.ui.updateHp(this.player.hp, this.player.maxHp);
            this.ui.updateShield(this.player.shield, this.player.maxShield);
            this.updateSkillStats();
            this.isPaused = false;
        });
    }
    
    updateSkillStats() {
        if (!this.player) return;

        const stats = this.player.upgradeStats;
        const skillItems = document.querySelectorAll('.skill-item');
        const toggleBtn = document.getElementById('toggle-max-skills');
        let hasMaxed = false;

        skillItems.forEach(item => {
            const skillType = item.dataset.skill;
            const valueSpan = item.querySelector('.skill-value');
            const level = stats[skillType] || 0;
            const isMaxed = level >= MAX_LEVEL;
            if (isMaxed) hasMaxed = true;

            item.classList.remove('active', 'maxed');

            if (skillType === 'projectileCount') {
                valueSpan.textContent = this.player.projectileCount;
                if (this.player.projectileCount > 3) {
                    item.classList.add('active');
                }
                if (isMaxed) item.classList.add('maxed');
            } else if (skillType === 'critChance') {
                const chance = Math.floor(this.player.critChance * 100);
                valueSpan.textContent = `${chance}%`;
                if (level > 0) {
                    item.classList.add('active');
                }
                if (isMaxed) item.classList.add('maxed');
            } else if (skillType === 'critDamage') {
                const damage = Math.floor(this.player.critDamage * 100);
                valueSpan.textContent = `${damage}%`;
                if (level > 0) {
                    item.classList.add('active');
                }
                if (isMaxed) item.classList.add('maxed');
            } else if (skillType === 'shield') {
                valueSpan.textContent = isMaxed ? `MAX (${this.player.shield}/${this.player.maxShield})` : `Lv.${level} (${this.player.shield}/${this.player.maxShield})`;
                if (level > 0) {
                    item.classList.add('active');
                }
                if (isMaxed) item.classList.add('maxed');
            } else if (skillType === 'expBonus') {
                const bonus = Math.floor(this.player.expBonus * 100);
                valueSpan.textContent = `+${bonus}%`;
                if (level > 0) {
                    item.classList.add('active');
                }
                if (isMaxed) item.classList.add('maxed');
            } else if (skillType === 'lifesteal') {
                valueSpan.textContent = `${this.player.lifesteal}HP`;
                if (level > 0) {
                    item.classList.add('active');
                }
                if (isMaxed) item.classList.add('maxed');
            } else if (skillType === 'armor') {
                valueSpan.textContent = `${this.player.armor}`;
                if (level > 0) {
                    item.classList.add('active');
                }
                if (isMaxed) item.classList.add('maxed');
            } else if (skillType === 'damage') {
                valueSpan.textContent = isMaxed ? `MAX (${this.player.damage})` : `${this.player.damage}`;
                item.classList.add('active');
                if (isMaxed) item.classList.add('maxed');
            } else if (skillType === 'maxHp') {
                const hp = Math.floor(this.player.maxHp);
                valueSpan.textContent = isMaxed ? `MAX (${hp})` : `${hp}`;
                item.classList.add('active');
                if (isMaxed) item.classList.add('maxed');
            } else {
                valueSpan.textContent = isMaxed ? 'MAX' : `Lv.${level}`;
                if (level > 0) {
                    item.classList.add('active');
                }
            }
        });

        // 顯示/隱藏 MAX 技能切換按鈕
        if (toggleBtn) {
            toggleBtn.style.display = hasMaxed ? 'block' : 'none';
            toggleBtn.textContent = document.getElementById('skill-stats').classList.contains('hide-max') ? '▶ 顯示 MAX 技能' : '▼ 隱藏 MAX 技能';
        }
    }

    gameOver() {
        this.isRunning = false;
        this.audio.stopBGM();
        this.audio.playGameOver();
        this.storageManager.clearSave();
        
        const gameStats = {
            level: this.level,
            kills: this.kills,
            time: this.gameTime,
            wave: this.waveManager.currentWave,
            bossesKilled: this.bossesKilled
        };
        
        this.achievementManager.saveHellSurviveTime(this.gameTime, this.difficulty);
        
        const historicalStats = this.storageManager.getFormattedStats();
        const statsForAchievements = {
            totalKills: historicalStats.totalKills + this.kills,
            longestTime: Math.max(historicalStats.longestTimeSec || 0, this.gameTime),
            bossesKilled: historicalStats.bossesKilled + this.bossesKilled,
            highestWave: Math.max(historicalStats.highestWave, this.waveManager.currentWave),
            highestLevel: Math.max(historicalStats.highestLevel, this.level),
            totalGames: historicalStats.totalGames + 1
        };
        
        const newAchievements = this.achievementManager.check(statsForAchievements, this.difficulty);
        
        const newRecords = this.storageManager.update(gameStats);
        const updatedHistoricalStats = this.storageManager.getFormattedStats();
        const leaderboard = this.storageManager.getLeaderboard();
        
        this.ui.showGameOver(gameStats, updatedHistoricalStats, newRecords, newAchievements, leaderboard);
    }

    /**
     * 將目前遊戲狀態序列化為可儲存的物件
     * @returns {object} 遊戲狀態物件
     */
    serializeState() {
        return {
            gameTime: this.gameTime,
            level: this.level,
            exp: this.exp,
            expToLevel: this.expToLevel,
            kills: this.kills,
            difficulty: this.difficulty,
            spawnTimer: this.spawnTimer,
            bossesKilled: this.bossesKilled,
            player: {
                x: this.player.x,
                y: this.player.y,
                hp: this.player.hp,
                maxHp: this.player.maxHp,
                shield: this.player.shield,
                maxShield: this.player.maxShield,
                armor: this.player.armor,
                speed: this.player.speed,
                baseAttackRange: this.player.baseAttackRange,
                attackRange: this.player.attackRange,
                facingAngle: this.player.facingAngle,
                pickupRange: this.player.pickupRange,
                magnetTimer: this.player.magnetTimer,
                baseFireRate: this.player.baseFireRate,
                fireRate: this.player.fireRate,
                fireCooldown: this.player.fireCooldown,
                damage: this.player.damage,
                projectileSpeed: this.player.projectileSpeed,
                projectileCount: this.player.projectileCount,
                critChance: this.player.critChance,
                critDamage: this.player.critDamage,
                lifesteal: this.player.lifesteal,
                expBonus: this.player.expBonus,
                skillCooldown: this.player.skillCooldown,
                skillCooldownDuration: this.player.skillCooldownDuration,
                upgradeStats: { ...this.player.upgradeStats }
            },
            enemies: this.enemies.map(enemy => ({
                x: enemy.x,
                y: enemy.y,
                hp: enemy.hp,
                maxHp: enemy.maxHp,
                type: enemy.type.name,
                speed: enemy.speed,
                damage: enemy.damage,
                expValue: enemy.expValue,
                shieldHp: enemy.shieldHp,
                shieldMaxHp: enemy.shieldMaxHp,
                isElite: enemy.isElite,
                canSplit: enemy.canSplit,
                splitTriggered: enemy.splitTriggered,
                explosive: enemy.explosive,
                explosionRadius: enemy.explosionRadius,
                explosionDamage: enemy.explosionDamage,
                isStealth: enemy.isStealth,
                baseAlpha: enemy.baseAlpha,
                phase: enemy.phase,
                rageMode: enemy.rageMode
            })),
            waveManager: {
                currentWave: this.waveManager.currentWave,
                waveTimer: this.waveManager.waveTimer,
                isBreak: this.waveManager.isBreak,
                isBossWave: this.waveManager.isBossWave,
                bossSpawned: this.waveManager.bossSpawned,
                enemiesSpawned: this.waveManager.enemiesSpawned
            }
        };
    }

    /**
     * 從存檔狀態恢復遊戲
     * @param {object} state - 序列化的遊戲狀態
     */
    loadState(state) {
        this.gameTime = state.gameTime;
        this.level = state.level;
        this.exp = state.exp;
        this.expToLevel = state.expToLevel;
        this.kills = state.kills;
        this.difficulty = state.difficulty;
        this.spawnTimer = state.spawnTimer;
        this.bossesKilled = state.bossesKilled;

        const ps = state.player;
        this.player = new Player(ps.x, ps.y);
        this.player.setAngleConfig(this.dirToAngle, this.defaultAngle);
        if (this.armorColor) {
            this.player.setArmorColor(this.armorColor);
        }
        this.player.hp = ps.hp;
        this.player.maxHp = ps.maxHp;
        this.player.shield = ps.shield;
        this.player.maxShield = ps.maxShield;
        this.player.armor = ps.armor;
        this.player.speed = ps.speed;
        this.player.core.baseAttackRange = ps.baseAttackRange;
        this.player.attackRange = ps.attackRange;
        this.player.facingAngle = ps.facingAngle;
        this.player.pickupRange = ps.pickupRange;
        this.player.magnetTimer = ps.magnetTimer;
        this.player.combat.baseFireRate = ps.baseFireRate;
        this.player.fireRate = ps.fireRate;
        this.player.fireCooldown = ps.fireCooldown;
        this.player.damage = ps.damage;
        this.player.projectileSpeed = ps.projectileSpeed;
        this.player.projectileCount = ps.projectileCount;
        this.player.critChance = ps.critChance;
        this.player.critDamage = ps.critDamage;
        this.player.lifesteal = ps.lifesteal;
        this.player.expBonus = ps.expBonus;
        this.player.skillCooldown = ps.skillCooldown;
        this.player.combat.skillCooldownDuration = ps.skillCooldownDuration;
        this.player.core.upgradeStats = { ...ps.upgradeStats };
        this.player.combat.upgradeStats = {
            fireRate: ps.upgradeStats.fireRate || 0,
            damage: ps.upgradeStats.damage || 0,
            projectileSpeed: ps.upgradeStats.projectileSpeed || 0,
            projectileCount: ps.upgradeStats.projectileCount || 0,
            critChance: ps.upgradeStats.critChance || 0,
            critDamage: ps.upgradeStats.critDamage || 0,
            lifesteal: ps.upgradeStats.lifesteal || 0,
            expBonus: ps.upgradeStats.expBonus || 0
        };

        this.enemies = [];
        for (const ed of state.enemies) {
            const enemy = Enemy.spawn(
                this.canvas.width,
                this.canvas.height,
                this.player.x,
                this.player.y,
                this.gameTime,
                ed.type === 'boss',
                1
            );
            enemy.x = ed.x;
            enemy.y = ed.y;
            enemy.hp = ed.hp;
            enemy.core.maxHp = ed.maxHp;
            enemy.core.speed = ed.speed;
            enemy.damage = ed.damage;
            enemy.expValue = ed.expValue;
            enemy.shieldHp = ed.shieldHp;
            enemy.shieldMaxHp = ed.shieldMaxHp;
            enemy.hasShield = ed.shieldHp > 0;
            enemy.core.isElite = ed.isElite;
            enemy.core.canSplit = ed.canSplit;
            enemy.splitTriggered = ed.splitTriggered;
            enemy.core.explosive = ed.explosive;
            enemy.core.explosionRadius = ed.explosionRadius;
            enemy.core.explosionDamage = ed.explosionDamage;
            enemy.core.isStealth = ed.isStealth;
            enemy.core.baseAlpha = ed.baseAlpha;
            enemy.core.currentAlpha = ed.baseAlpha;
            if (enemy.phaseManager) {
                enemy.phaseManager.phase = ed.phase;
                enemy.phaseManager.rageMode = ed.rageMode;
            }
            this.enemies.push(enemy);
        }

        const wm = state.waveManager;
        this.waveManager.currentWave = wm.currentWave;
        this.waveManager.waveTimer = wm.waveTimer;
        this.waveManager.isBreak = wm.isBreak;
        this.waveManager.isBossWave = wm.isBossWave;
        this.waveManager.bossSpawned = wm.bossSpawned;
        this.waveManager.enemiesSpawned = wm.enemiesSpawned;
    }

    /**
     * 儲存目前遊戲狀態
     * @returns {boolean} 儲存是否成功
     */
    saveGame() {
        const state = this.serializeState();
        return this.storageManager.saveGame(state);
    }

    /**
     * 從存檔恢復並開始遊戲
     * @returns {boolean} 載入是否成功
     */
    loadFromSave() {
        const state = this.storageManager.loadGame();
        if (!state) return false;

        this.loadState(state);
        this.projectilePool.releaseAll();
        this.explosionPool.releaseAll();
        this.bossSpawnPool.releaseAll();
        this.shieldBreakPool.releaseAll();
        this.bossDeathPool.releaseAll();
        this.splitEffectPool.releaseAll();
        this.enemyProjectiles = [];
        this.expOrbs = [];
        this.magnetItems = [];
        this.damageNumbers = [];
        this.chainKillDisplay.clear();

        this.isRunning = true;
        this.isPaused = false;
        this.pauseScreen.classList.add('hidden');
        this.ui.hideGameOver();
        this.ui.clearBuffNotifications();
        this.audioStarted = false;
        this.screenShake = { x: 0, y: 0 };
        this.ui.updateHp(this.player.hp, this.player.maxHp);
        this.ui.updateShield(this.player.shield, this.player.maxShield);
        this.ui.updateExp(this.exp, this.expToLevel);
        this.ui.updateLevel(this.level);
        this.updateSkillStats();

        this.audio.audioStarted = true;
        this.audio.resumeContext();
        this.audio.startBGM();

        this.lastTime = performance.now();
        this.loop();
        return true;
    }

    render() {
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        this.ctx.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
        
        if (this.floorImageLoaded) {
            const tileSize = 64;
            const cols = Math.ceil(this.canvas.width / tileSize) + 1;
            const rows = Math.ceil(this.canvas.height / tileSize) + 1;
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = col * tileSize - 10;
                    const y = row * tileSize - 10;
                    this.ctx.drawImage(this.floorImage, x, y, tileSize, tileSize);
                }
            }
        } else {
            const gradient = this.ctx.createRadialGradient(
                this.canvas.width / 2, this.canvas.height / 2, 0,
                this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
            );
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
        }
        
        this.decorationManager.draw(this.ctx);
        
        this.drawGrid();
        
        for (const orb of this.expOrbs) {
            orb.draw(this.ctx);
        }
        
        for (const item of this.magnetItems) {
            item.draw(this.ctx);
        }
        
        for (const effect of this.bossSpawnPool.getActiveObjects()) {
            if (effect.active) {
                effect.draw(this.ctx);
            }
        }
        
        const margin = 80;
        for (const enemy of this.enemies) {
            if (enemy.x + enemy.radius < -margin || enemy.x - enemy.radius > this.canvas.width + margin ||
                enemy.y + enemy.radius < -margin || enemy.y - enemy.radius > this.canvas.height + margin) {
                continue;
            }
            enemy.draw(this.ctx);
        }
        
        for (const effect of this.bossDeathPool.getActiveObjects()) {
            if (effect.active) {
                effect.draw(this.ctx);
            }
        }
        
        for (const effect of this.shieldBreakPool.getActiveObjects()) {
            if (effect.active) {
                effect.draw(this.ctx);
            }
        }
        
        for (const effect of this.splitEffectPool.getActiveObjects()) {
            if (effect.active) {
                effect.draw(this.ctx);
            }
        }
        
        for (const explosion of this.explosionPool.getActiveObjects()) {
            if (explosion.active) {
                explosion.draw(this.ctx);
            }
        }
        
        for (const damageNumber of this.damageNumbers) {
            damageNumber.draw(this.ctx);
        }
        
        for (const projectile of this.projectilePool.getActiveObjects()) {
            if (projectile.active) {
                projectile.draw(this.ctx);
            }
        }
        
        for (const proj of this.enemyProjectiles) {
            if (!isFinite(proj.x) || !isFinite(proj.y) || !isFinite(proj.radius)) continue;
            this.ctx.save();
            
            if (proj.trail && proj.trail.length > 0) {
                for (let i = 0; i < proj.trail.length; i++) {
                    const alpha = (1 - i / proj.trail.length) * 0.3;
                    const radius = proj.radius * (1 - i / proj.trail.length * 0.5);
                    this.ctx.beginPath();
                    this.ctx.arc(proj.trail[i].x, proj.trail[i].y, radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(155, 89, 182, ${alpha})`;
                    this.ctx.fill();
                }
            }
            
            this.ctx.beginPath();
            this.ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = proj.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#8e44ad';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            const gradient = this.ctx.createRadialGradient(
                proj.x - 1, proj.y - 1, 0,
                proj.x, proj.y, proj.radius
            );
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.3, proj.color);
            gradient.addColorStop(1, '#6c3483');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        this.player.draw(this.ctx);
        
        this.chainKillDisplay.draw(this.ctx, this.canvas.width / 2, this.canvas.height / 2);
        
        this.waveManager.drawAnnouncement(this.ctx, this.canvas.width / 2, this.canvas.height / 2);
        this.waveManager.drawWaveInfo(this.ctx, this.canvas.width - 180, this.canvas.height * 0.75);
        
        this.drawBossHealthBar();

        this.debugOverlay.draw(this.ctx);

        this.visibilityMask.draw(this.ctx, this.canvas.width, this.canvas.height, this.player.x, this.player.y);

        this.drawAchievementNotifications();

        this.ctx.restore();
    }

    /**
     * 限制傷害數字數量（防止掉幀）
     */
    limitDamageNumbers() {
        const max = 50;
        while (this.damageNumbers.length > max) {
            this.damageNumbers.shift();
        }
    }

    /**
     * 遊戲中即時成就檢查（非 game over 時）
     */
    checkAchievementsRealtime() {
        const stats = {
            kills: this.kills,
            bossesKilled: this.bossesKilled,
            highestWave: this.waveManager.currentWave,
            highestLevel: this.level,
            survivedTime: this.gameTime,
            totalGames: 1
        };
        const newAchievements = this.achievementManager.check(stats, this.difficulty);
        for (const ach of newAchievements) {
            this.showAchievementNotification(ach);
        }
    }

    /**
     * 顯示成就解鎖通知
     * @param {object} achievement - 成就物件
     */
    showAchievementNotification(achievement) {
        this.achievementNotifications.push({
            icon: achievement.icon,
            name: achievement.name,
            description: achievement.description,
            time: 0,
            duration: 3
        });
    }

    /**
     * 繪製成就解鎖通知（從頂部滑入 + 淡出）
     */
    drawAchievementNotifications() {
        const now = performance.now() / 1000;

        for (let i = this.achievementNotifications.length - 1; i >= 0; i--) {
            const notif = this.achievementNotifications[i];
            notif.time += 1 / 60;

            if (notif.time > notif.duration) {
                this.achievementNotifications.splice(i, 1);
                continue;
            }

            const progress = notif.time / notif.duration;
            let alpha, slideY;

            if (notif.time < 0.4) {
                alpha = notif.time / 0.4;
                slideY = -50 + (notif.time / 0.4) * 50;
            } else if (notif.time > notif.duration - 0.5) {
                alpha = (notif.duration - notif.time) / 0.5;
                slideY = 0;
            } else {
                alpha = 1;
                slideY = 0;
            }

            this.ctx.save();
            this.ctx.globalAlpha = alpha;

            const x = this.canvas.width / 2;
            const y = 80 + slideY;
            const boxW = 320;
            const boxH = 70;

            // 背景框
            const bgGrad = this.ctx.createLinearGradient(x - boxW / 2, y, x + boxW / 2, y);
            bgGrad.addColorStop(0, 'rgba(30, 30, 50, 0.9)');
            bgGrad.addColorStop(0.5, 'rgba(40, 40, 60, 0.95)');
            bgGrad.addColorStop(1, 'rgba(30, 30, 50, 0.9)');
            this.ctx.fillStyle = bgGrad;
            this.ctx.beginPath();
            this.ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 12);
            this.ctx.fill();

            // 邊框
            this.ctx.strokeStyle = '#f1c40f';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // 圖標
            this.ctx.font = '28px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText(notif.icon, x - boxW / 2 + 30, y);

            // 標題
            this.ctx.font = 'bold 16px "Segoe UI", sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.fillText('成就解鎖！', x - boxW / 2 + 55, y - 10);

            // 名稱
            this.ctx.font = 'bold 14px "Segoe UI", sans-serif';
            this.ctx.fillStyle = '#ecf0f1';
            this.ctx.fillText(notif.name, x - boxW / 2 + 55, y + 12);

            // 描述
            this.ctx.font = '11px "Segoe UI", sans-serif';
            this.ctx.fillStyle = '#95a5a6';
            this.ctx.fillText(notif.description, x - boxW / 2 + 55, y + 28);

            this.ctx.restore();
        }
    }

    drawBossHealthBar() {
        const boss = this.enemies.find(e => e.type && e.type.isBoss);
        if (!boss) return;
        
        const barWidth = this.canvas.width * 0.6;
        const barHeight = 24;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = this.canvas.height * 0.25;
        
        this.ctx.save();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(barX - 5, barY - 50, barWidth + 10, barHeight + 70);
        
        this.ctx.strokeStyle = '#f1c40f';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX - 5, barY - 50, barWidth + 10, barHeight + 70);
        
        this.ctx.font = 'bold 36px "Segoe UI", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillText('⚠ BOSS ⚠', this.canvas.width / 2, barY - 15);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const hpPercentage = boss.hp / boss.maxHp;
        const hpColor = hpPercentage > 0.5 ? '#e74c3c' : (hpPercentage > 0.25 ? '#c0392b' : '#922b21');
        this.ctx.fillStyle = hpColor;
        this.ctx.fillRect(barX, barY, barWidth * hpPercentage, barHeight);
        
        this.ctx.strokeStyle = '#922b21';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        this.ctx.font = '28px "Segoe UI", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`${boss.hp} / ${boss.maxHp}`, this.canvas.width / 2, barY + barHeight + 30);
        
        this.ctx.restore();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseScreen.classList.remove('hidden');
            this.setupPauseVolumeControls();
        } else {
            this.pauseScreen.classList.add('hidden');
        }
    }
    
    setupPauseVolumeControls() {
        const masterSlider = document.getElementById('pause-master-volume');
        const sfxSlider = document.getElementById('pause-sfx-volume');
        const bgmSlider = document.getElementById('pause-bgm-volume');
        
        if (masterSlider) {
            masterSlider.value = Math.floor(this.audio.masterVolume * 100);
            masterSlider.addEventListener('input', () => {
                this.audio.setMasterVolume(masterSlider.value / 100);
                this.updatePauseVolumeDisplays();
            });
        }
        
        if (sfxSlider) {
            sfxSlider.value = Math.floor(this.audio.sfxVolume * 100);
            sfxSlider.addEventListener('input', () => {
                this.audio.setSfxVolume(sfxSlider.value / 100);
                this.updatePauseVolumeDisplays();
            });
        }
        
        if (bgmSlider) {
            bgmSlider.value = Math.floor(this.audio.bgmVolume * 100);
            bgmSlider.addEventListener('input', () => {
                this.audio.setBgmVolume(bgmSlider.value / 100);
                this.updatePauseVolumeDisplays();
            });
        }
        
        this.updatePauseVolumeDisplays();
    }
    
    updatePauseVolumeDisplays() {
        const displays = document.querySelectorAll('.pause-volume-value');
        const masterSlider = document.getElementById('pause-master-volume');
        const sfxSlider = document.getElementById('pause-sfx-volume');
        const bgmSlider = document.getElementById('pause-bgm-volume');
        
        if (displays.length >= 3 && masterSlider && sfxSlider && bgmSlider) {
            displays[0].textContent = masterSlider.value + '%';
            displays[1].textContent = sfxSlider.value + '%';
            displays[2].textContent = bgmSlider.value + '%';
        }
    }
}