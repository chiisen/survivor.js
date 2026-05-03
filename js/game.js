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
import { getRandomUpgrades } from './talent.js';
import { UI } from './ui.js';
import { distance, distanceSquared } from './utils.js';
import { BossSpawnEffect } from './bossSpawnEffect.js';
import { ShieldBreakEffect } from './shieldBreakEffect.js';
import { BossDeathEffect } from './bossDeathEffect.js';
import { SplitEffect } from './splitEffect.js';
import { AchievementManager } from './achievement.js';
import { GameLogger } from './gameLogger.js';
import { DebugOverlay } from './debugOverlay.js';
import { VisibilityMask } from './visibilityMask.js';

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
            30
        );
        this.explosionPool = new ObjectPool(
            () => new Explosion(),
            (obj, x, y) => obj.init(x, y),
            20
        );
        this.enemyProjectiles = [];
        this.expOrbs = [];
        this.damageNumbers = [];
        this.chainKillDisplay = new ChainKillDisplay();
        this.ui = new UI();
        this.audio = new AudioManager();
        this.pauseScreen = document.getElementById('pause-screen');
        this.decorationManager = new DecorationManager(this.canvas.width, this.canvas.height);
        this.waveManager = new WaveManager();
        this.storageManager = new StorageManager();
        this.bossesKilled = 0;
        this.enemyGrid = new SpatialGrid(100);
        this.projectileGrid = new SpatialGrid(100);
        
        this.bossSpawnPool = new ObjectPool(
            () => new BossSpawnEffect(),
            (obj, x, y) => obj.init(x, y),
            3
        );
        this.shieldBreakPool = new ObjectPool(
            () => new ShieldBreakEffect(),
            (obj, x, y) => obj.init(x, y),
            5
        );
        this.bossDeathPool = new ObjectPool(
            () => new BossDeathEffect(),
            (obj, x, y) => obj.init(x, y),
            2
        );
        this.splitEffectPool = new ObjectPool(
            () => new SplitEffect(),
            (obj, x, y) => obj.init(x, y),
            10
        );
        this.achievementManager = new AchievementManager();
        this.screenShake = { x: 0, y: 0 };
        
        this.logger = new GameLogger();
        this.debugOverlay = new DebugOverlay(this);
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
            }
        };
        
        this.setupInput();
        this.setupRestart();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.decorationManager) {
            this.decorationManager.resize(this.canvas.width, this.canvas.height);
        }
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
            
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (this.isRunning && !this.ui.isUpgradeModalOpen()) {
                    this.togglePause();
                }
            }
            
            if ((e.key === 'q' || e.key === 'Q') && this.isRunning && !this.isPaused && this.player.canUseSkill()) {
                this.useUltimateSkill();
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
            if (difficulty === 'hard') {
                display.style.color = '#e67e22';
                display.style.borderColor = 'rgba(230, 126, 22, 0.5)';
            } else if (difficulty === 'hell') {
                display.style.color = '#c0392b';
                display.style.borderColor = 'rgba(192, 57, 43, 0.5)';
            } else {
                display.style.color = '#f39c12';
                display.style.borderColor = 'rgba(243, 156, 18, 0.5)';
            }
        }
    }

    setupRestart() {
        this.ui.onRestart(() => {
            this.restart();
        });
    }

start() {
        if (!this.difficulty) {
            this.difficulty = 'normal';
        }
        const difficultySettings = this.difficultySettings[this.difficulty];
        
        this.level = 1;
        this.exp = 0;
        this.expToLevel = 100;
        this.kills = 0;
        this.gameTime = 0;
        this.spawnTimer = 0;
        
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        
        this.player.maxHp = Math.floor(100 * difficultySettings.playerHpMultiplier);
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
        
        // 2.1 玩家狀態（必須最先更新）
        this.player.update(dt, this.keys, this.canvas.width, this.canvas.height);
        
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
                        this.spawnEnemy(false);
                    }
                }
            }
        }
        
        if (this.waveManager.shouldSpawnBoss()) {
            const boss = this.spawnEnemy(true);
            if (boss) {
                this.bossSpawnPool.get(boss.x, boss.y);
                this.audio.playChainKill();
            }
        }
        
        for (const enemy of this.enemies) {
            const shootData = enemy.update(dt, this.player.x, this.player.y, this.player.attackRange);
            
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
        
        // 3.2 碰撞檢測（依賴 Grid 已填充）
        this.checkCollisions(dt);
        
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
        
        for (let i = this.expOrbs.length - 1; i >= 0; i--) {
            const orb = this.expOrbs[i];
            
            const forceAttract = this.waveManager.isBreak && this.expOrbs.length > 0;
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
                        enemy.hp -= actualDamage;
                    }
                    
                    if (projectile.isCrit) {
                        damageColor = '#e74c3c';
                    }
                    
                    this.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.radius, projectile.damage, damageColor));
                    this.audio.playHit();
                    this.projectilePool.release(projectile);
                    
                    if (enemy.hp <= 0) {
                        this.handleEnemyDeath(enemy, projectile);
                    }
                    break;
                }
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
        const expValue = Math.floor(enemy.expValue * (1 + chainKillExpBonus));
        this.expOrbs.push(new ExperienceOrb(enemy.x, enemy.y, expValue));
        
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
                const nearbyExpValue = Math.floor(nearbyEnemy.expValue * (1 + nearbyExpBonus));
                this.expOrbs.push(new ExperienceOrb(nearbyEnemy.x, nearbyEnemy.y, nearbyExpValue));
                this.damageNumbers.push(new DamageNumber(nearbyEnemy.x, nearbyEnemy.y - nearbyEnemy.radius, projectile.damage));
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
        
        if (chainKills >= 2) {
            this.audio.playChainKill();
            this.chainKillDisplay.trigger(chainKills);
            
            if (!this.player.hasFireRateBuff) {
                this.player.activateFireRateBuff();
                this.ui.showBuffNotification(`連殺！攻擊速度 +30% | 經驗 +${Math.floor(chainKillExpBonus * 100)}%`, 5);
            } else {
                this.ui.showBuffNotification(`連殺！經驗 +${Math.floor(chainKillExpBonus * 100)}%`, 5);
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
        const hpMultiplier = waveHpMultiplier * difficultySettings.enemyHpMultiplier;
        const bossHpMultiplier = waveHpMultiplier * difficultySettings.bossHpMultiplier;
        
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
            enemy.damage = Math.floor(enemy.damage * difficultySettings.enemyDamageMultiplier);
        } else {
            enemy.damage = Math.floor(enemy.damage * difficultySettings.enemyDamageMultiplier * 1.5);
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
        }
        
        this.explosionPool.get(enemy.x, enemy.y);
        this.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.radius, 0, '#1abc9c'));
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
            }
        }
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
            
            if (enemy.hp <= 0) {
                const expValue = Math.floor(enemy.expValue * (1 + this.player.expBonus));
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
            
            this.audio.playLevelUp();
            this.ui.updateLevel(this.level);
            this.ui.updateExp(this.exp, this.expToLevel);
            
            this.showUpgradeModal();
        }
        
        this.ui.updateExp(this.exp, this.expToLevel);
    }

    showUpgradeModal() {
        this.isPaused = true;
        const upgrades = getRandomUpgrades(3);
        
        this.ui.showUpgradeModal(upgrades, (selectedUpgrade) => {
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
        
        skillItems.forEach(item => {
            const skillType = item.dataset.skill;
            const valueSpan = item.querySelector('.skill-value');
            
            if (skillType === 'projectileCount') {
                valueSpan.textContent = this.player.projectileCount;
                if (this.player.projectileCount > 3) {
                    item.classList.add('active');
                }
            } else if (skillType === 'critChance') {
                const chance = Math.floor(this.player.critChance * 100);
                valueSpan.textContent = `${chance}%`;
                if (stats[skillType] > 0) {
                    item.classList.add('active');
                }
            } else if (skillType === 'critDamage') {
                const damage = Math.floor(this.player.critDamage * 100);
                valueSpan.textContent = `${damage}%`;
                if (stats[skillType] > 0) {
                    item.classList.add('active');
                }
            } else if (skillType === 'shield') {
                valueSpan.textContent = `${this.player.shield}/${this.player.maxShield}`;
                if (stats[skillType] > 0) {
                    item.classList.add('active');
                }
            } else if (skillType === 'expBonus') {
                const bonus = Math.floor(this.player.expBonus * 100);
                valueSpan.textContent = `+${bonus}%`;
                if (stats[skillType] > 0) {
                    item.classList.add('active');
                }
            } else if (skillType === 'lifesteal') {
                valueSpan.textContent = `${this.player.lifesteal}HP`;
                if (stats[skillType] > 0) {
                    item.classList.add('active');
                }
            } else if (skillType === 'armor') {
                valueSpan.textContent = `${this.player.armor}`;
                if (stats[skillType] > 0) {
                    item.classList.add('active');
                }
            } else {
                const level = stats[skillType] || 0;
                valueSpan.textContent = `Lv.${level}`;
                if (stats[skillType] > 0) {
                    item.classList.add('active');
                }
            }
        });
    }

    gameOver() {
        this.isRunning = false;
        this.audio.stopBGM();
        this.audio.playGameOver();
        
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

    render() {
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        this.ctx.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
        
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
        
        this.decorationManager.draw(this.ctx);
        
        this.drawGrid();
        
        for (const orb of this.expOrbs) {
            orb.draw(this.ctx);
        }
        
        for (const effect of this.bossSpawnPool.getActiveObjects()) {
            if (effect.active) {
                effect.draw(this.ctx);
            }
        }
        
        for (const enemy of this.enemies) {
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
        
        this.ctx.restore();
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