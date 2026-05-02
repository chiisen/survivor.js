import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Projectile } from './projectile.js';
import { ExperienceOrb } from './experience.js';
import { Explosion } from './explosion.js';
import { DamageNumber } from './damageNumber.js';
import { ChainKillDisplay } from './chainKillDisplay.js';
import { SpatialGrid } from './spatialGrid.js';
import { ObjectPool } from './objectPool.js';
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
        this.enemyGrid = new SpatialGrid(100);
        this.projectileGrid = new SpatialGrid(100);
        
        this.keys = {};
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.gameTime = 0;
        
        this.spawnTimer = 0;
        this.spawnInterval = 1.5;
        this.minSpawnInterval = 0.3;
        this.spawnIntervalDecrease = 0.02;
        
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
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
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
        this.isRunning = true;
        this.isPaused = false;
        this.gameTime = 0;
        this.level = 1;
        this.exp = 0;
        this.expToLevel = 100;
        this.kills = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 1.5;
        
        this.ui.hideGameOver();
        this.ui.clearBuffNotifications();
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
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
            this.spawnInterval = Math.max(
                this.minSpawnInterval,
                this.spawnInterval - this.spawnIntervalDecrease
            );
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
                    enemy.hp -= projectile.damage;
                    this.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.radius, projectile.damage));
                    this.projectilePool.release(projectile);
                    
                    if (enemy.hp <= 0) {
                        this.explosionPool.get(enemy.x, enemy.y);
                        this.expOrbs.push(new ExperienceOrb(enemy.x, enemy.y, enemy.expValue));
                        
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
                this.exp += orb.value;
                this.expOrbs.splice(i, 1);
                
                this.checkLevelUp();
            }
        }
        
        this.ui.updateTimer(this.gameTime);
    }

    spawnEnemy() {
        const enemy = Enemy.spawn(
            this.canvas.width,
            this.canvas.height,
            this.player.x,
            this.player.y,
            this.gameTime
        );
        this.enemies.push(enemy);
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
        this.ui.showGameOver(this.level, this.kills, this.gameTime);
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
}