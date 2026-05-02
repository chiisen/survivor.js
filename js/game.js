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
            
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (this.isRunning && !this.ui.isUpgradeModalOpen()) {
                    this.togglePause();
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

    setupRestart() {
        this.ui.onRestart(() => {
            this.restart();
        });
    }

start() {
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.enemies = [];
        this.projectilePool.releaseAll();
        this.explosionPool.releaseAll();
        this.enemyProjectiles = [];
        this.expOrbs = [];
        this.damageNumbers = [];
        this.chainKillDisplay.clear();
        this.waveManager.reset();
        this.bossesKilled = 0;
        this.isRunning = true;
        this.isPaused = false;
        this.pauseScreen.classList.add('hidden');
        this.audioStarted = false;
        this.ui.updateHp(this.player.hp, this.player.maxHp);
        this.ui.updateExp(0, this.expToLevel);
        this.ui.updateLevel(this.level);
        
        this.lastTime = performance.now();
        this.loop();
    }

    restart() {
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
        
        this.decorationManager.update(dt, this.gameTime);
        this.waveManager.update(dt, this.gameTime);
        
        if (!this.audioStarted && this.hasPlayerInput()) {
            this.audioStarted = true;
            this.audio.audioStarted = true;
            this.audio.resumeContext();
            this.audio.startBGM();
        }
        
        this.enemyGrid.clear();
        this.projectileGrid.clear();
        
        for (const enemy of this.enemies) {
            this.enemyGrid.insert(enemy);
        }
        
        for (const projectile of this.projectilePool.getActiveObjects()) {
            if (projectile.active) {
                this.projectileGrid.insert(projectile);
            }
        }
        
        this.player.update(dt, this.keys, this.canvas.width, this.canvas.height);
        
        this.spawnTimer += dt;
        const spawnInterval = this.waveManager.getSpawnInterval();
        if (this.spawnTimer >= spawnInterval) {
            this.spawnTimer = 0;
            if (this.waveManager.shouldSpawnEnemy(this.enemies.length)) {
                this.spawnEnemy(false);
            }
        }
        
        if (this.waveManager.shouldSpawnBoss()) {
            this.spawnEnemy(true);
            this.audio.playChainKill();
        }
        
        this.autoFire();
        
        for (const enemy of this.enemies) {
            const shootData = enemy.update(dt, this.player.x, this.player.y);
            
            if (shootData) {
                this.enemyProjectiles.push(shootData);
            }
        }
        
        const nearbyEnemies = this.enemyGrid.getNearby(this.player.x, this.player.y, this.player.radius + 50);
        for (const enemy of nearbyEnemies) {
            if (!this.enemies.includes(enemy)) continue;
            
            const distSq = distanceSquared(enemy.x, enemy.y, this.player.x, this.player.y);
            const radiusSum = enemy.radius + this.player.radius;
            if (distSq < radiusSum * radiusSum) {
                if (this.player.takeDamage(enemy.damage)) {
                    this.audio.playDamage();
                    this.ui.updateHp(this.player.hp, this.player.maxHp);
                    
                    if (this.player.hp <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }
        
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const proj = this.enemyProjectiles[i];
            proj.x += proj.vx * dt;
            proj.y += proj.vy * dt;
            
            if (proj.x < -100 || proj.x > this.canvas.width + 100 ||
                proj.y < -100 || proj.y > this.canvas.height + 100) {
                this.enemyProjectiles.splice(i, 1);
                continue;
            }
            
            const dist = distance(proj.x, proj.y, this.player.x, this.player.y);
            if (dist < proj.radius + this.player.radius) {
                if (this.player.takeDamage(proj.damage)) {
                    this.audio.playDamage();
                    this.ui.updateHp(this.player.hp, this.player.maxHp);
                    this.enemyProjectiles.splice(i, 1);
                    
                    if (this.player.hp <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }
        
        const projectiles = this.projectilePool.getActiveObjects();
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            if (!projectile.active) continue;
            
            projectile.update(dt);
            
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
                        }
                    }
                    
                    if (actualDamage > 0) {
                        enemy.hp -= actualDamage;
                    }
                    
                    this.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.radius, projectile.damage, damageColor));
                    this.audio.playHit();
                    this.projectilePool.release(projectile);
                    
                    if (enemy.hp <= 0) {
                        this.audio.playKill();
                        if (enemy.type.isBoss) {
                            this.bossesKilled++;
                            this.audio.playChainKill();
                        }
                        
                        if (enemy.explosive) {
                            this.createExplosiveDeath(enemy);
                        }
                        
                        this.explosionPool.get(enemy.x, enemy.y);
                        this.expOrbs.push(new ExperienceOrb(enemy.x, enemy.y, enemy.expValue));
                        
                        if (enemy.canSplit) {
                            this.createSplitEnemies(enemy);
                        }
                        
                        let chainKills = 1;
                        const chainRadius = 40;
                        const chainNearby = this.enemyGrid.getNearby(enemy.x, enemy.y, chainRadius);
                        
                        for (const nearbyEnemy of chainNearby) {
                            if (nearbyEnemy === enemy) continue;
                            if (!this.enemies.includes(nearbyEnemy)) continue;
                            
                            const chainDistSq = distanceSquared(enemy.x, enemy.y, nearbyEnemy.x, nearbyEnemy.y);
                            if (chainDistSq <= chainRadius * chainRadius) {
                                this.explosionPool.get(nearbyEnemy.x, nearbyEnemy.y);
                                this.expOrbs.push(new ExperienceOrb(nearbyEnemy.x, nearbyEnemy.y, nearbyEnemy.expValue));
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
                                this.ui.showBuffNotification('連殺！攻擊速度 +30%', 5);
                            }
                        }
                    }
                    break;
                }
            }
        }
        
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
            orb.update(dt, this.player.x, this.player.y, this.player.pickupRange);
            
            if (orb.isCollected(this.player.x, this.player.y, this.player.radius)) {
                this.audio.playPickup();
                this.exp += orb.value;
                this.expOrbs.splice(i, 1);
                
                this.checkLevelUp();
            }
        }
        
        this.ui.updateTimer(this.gameTime);
    }

    spawnEnemy(isBoss = false) {
        const hpMultiplier = this.waveManager.getEnemyHpMultiplier();
        const enemy = Enemy.spawn(
            this.canvas.width,
            this.canvas.height,
            this.player.x,
            this.player.y,
            this.gameTime,
            isBoss,
            hpMultiplier
        );
        this.enemies.push(enemy);
    }

    createSplitEnemies(parentEnemy) {
        const splitCount = 2;
        const splitRadius = parentEnemy.radius * 0.6;
        const splitSpeed = parentEnemy.speed * 1.2;
        
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
            if (this.player.takeDamage(enemy.explosionDamage)) {
                this.audio.playDamage();
                this.ui.updateHp(this.player.hp, this.player.maxHp);
                
                if (this.player.hp <= 0) {
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
                
                this.projectilePool.get(
                    this.player.x,
                    this.player.y,
                    targetX,
                    targetY,
                    this.player.projectileSpeed,
                    this.player.damage
                );
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
            this.isPaused = false;
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
        
        const newRecords = this.storageManager.update(gameStats);
        const historicalStats = this.storageManager.getFormattedStats();
        
        this.ui.showGameOver(gameStats, historicalStats, newRecords);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.decorationManager.draw(this.ctx);
        
        this.drawGrid();
        
        for (const orb of this.expOrbs) {
            orb.draw(this.ctx);
        }
        
        for (const enemy of this.enemies) {
            enemy.draw(this.ctx);
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
            this.ctx.beginPath();
            this.ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = proj.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#8e44ad';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.restore();
        }
        
        this.player.draw(this.ctx);
        
        this.chainKillDisplay.draw(this.ctx, this.canvas.width / 2, this.canvas.height / 2);
        
        this.waveManager.drawAnnouncement(this.ctx, this.canvas.width / 2, this.canvas.height / 2);
        this.waveManager.drawWaveInfo(this.ctx, 20, this.canvas.height - 60);
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
        } else {
            this.pauseScreen.classList.add('hidden');
        }
    }
}