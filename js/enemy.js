// @ts-check

import { normalize, distance, randomRange } from './utils.js';
import { EnemyCore } from './enemyCore.js';
import { EnemyBehaviors } from './enemyBehaviors.js';
import { BossPhaseManager } from './bossPhaseManager.js';
import { EnemyRenderer } from './enemyRenderer.js';
import { loadConfig } from './configLoader.js';

// 預設敵人類型（JSON 載入後會覆蓋）
let EnemyTypes = {
    NORMAL: { name: 'normal', radius: 15, speed: 60, maxHp: 1, damage: 10, expValue: 10, color: '#e74c3c', strokeColor: '#c0392b', eyeColor: '#fff', mouthStyle: 'angry', canShoot: false, shootInterval: 0 },
    FAST: { name: 'fast', radius: 12, speed: 100, maxHp: 1, damage: 8, expValue: 12, color: '#27ae60', strokeColor: '#229954', eyeColor: '#fff', mouthStyle: 'neutral', canShoot: false, shootInterval: 0 },
    TANK: { name: 'tank', radius: 22, speed: 35, maxHp: 3, damage: 20, expValue: 25, color: '#7f8c8d', strokeColor: '#5d6d7e', eyeColor: '#e74c3c', mouthStyle: 'wide', canShoot: false, shootInterval: 0 },
    RANGED: { name: 'ranged', radius: 14, speed: 40, maxHp: 2, damage: 10, expValue: 15, color: '#9b59b6', strokeColor: '#8e44ad', eyeColor: '#f1c40f', mouthStyle: 'shooter', canShoot: true, shootInterval: 2.0 },
    BOSS: { name: 'boss', radius: 160, speed: 18, maxHp: 200, damage: 50, expValue: 300, color: '#c0392b', strokeColor: '#922b21', eyeColor: '#f1c40f', mouthStyle: 'boss', canShoot: true, shootInterval: 1.0, isBoss: true },
    ELITE: { name: 'elite', radius: 25, speed: 45, maxHp: 8, damage: 25, expValue: 50, color: '#e67e22', strokeColor: '#d35400', eyeColor: '#fff', mouthStyle: 'elite', canShoot: false, shootInterval: 0, isElite: true, shieldHp: 5, shieldMaxHp: 5 },
    SPLITTER: { name: 'splitter', radius: 18, speed: 50, maxHp: 2, damage: 10, expValue: 15, color: '#16a085', strokeColor: '#138d75', eyeColor: '#fff', mouthStyle: 'split', canShoot: false, shootInterval: 0, canSplit: true },
    EXPLOSIVE: { name: 'explosive', radius: 16, speed: 55, maxHp: 2, damage: 15, expValue: 20, color: '#d35400', strokeColor: '#bf4a1a', eyeColor: '#f39c12', mouthStyle: 'explosive', canShoot: false, shootInterval: 0, explosive: true, explosionRadius: 60, explosionDamage: 20 },
    STEALTH: { name: 'stealth', radius: 13, speed: 80, maxHp: 1, damage: 15, expValue: 18, color: '#5d6d7e', strokeColor: '#4a5a6a', eyeColor: '#3498db', mouthStyle: 'stealth', canShoot: false, shootInterval: 0, isStealth: true, baseAlpha: 0.3 }
};

// 從 JSON 載入怪物設定
loadConfig('./config/enemies.json').then(config => {
    EnemyTypes = config.enemies;
});

export class Enemy {
    constructor(x, y, type = EnemyTypes.NORMAL) {
        this.type = type;
        this.core = new EnemyCore(type, x, y);
        this.behaviors = new EnemyBehaviors(type, this.core);
        this.renderer = new EnemyRenderer(type);
        
        if (type.isBoss) {
            this.phaseManager = new BossPhaseManager(this.core, this.behaviors);
        }
        
        this.projectiles = [];
    }
    
    get x() { return this.core.x; }
    set x(value) { this.core.x = value; }
    
    get y() { return this.core.y; }
    set y(value) { this.core.y = value; }
    
    get radius() { return this.core.radius; }
    get speed() { return this.core.speed; }
    set speed(value) { this.core.speed = value; }
    
    get maxHp() { return this.core.maxHp; }
    get hp() { return this.core.hp; }
    set hp(value) { this.core.hp = value; }
    
    get damage() { return this.core.damage; }
    set damage(value) { this.core.damage = value; }
    
    get expValue() { return this.core.expValue; }
    set expValue(value) { this.core.expValue = value; }
    
    get color() { return this.core.type.color; }
    get strokeColor() { return this.core.type.strokeColor; }
    get eyeColor() { return this.core.type.eyeColor; }
    get mouthStyle() { return this.core.type.mouthStyle; }
    
    get isElite() { return this.core.isElite; }
    get canSplit() { return this.core.canSplit; }
    get splitTriggered() { return this.core.splitTriggered; }
    set splitTriggered(value) { this.core.splitTriggered = value; }
    
    get explosive() { return this.core.explosive; }
    get explosionRadius() { return this.core.explosionRadius; }
    get explosionDamage() { return this.core.explosionDamage; }
    
    get isStealth() { return this.core.isStealth; }
    get baseAlpha() { return this.core.baseAlpha; }
    get currentAlpha() { return this.core.currentAlpha; }
    
    get hasShield() { return this.core.hasShield; }
    set hasShield(value) { this.core.hasShield = value; }
    
    get shieldHp() { return this.core.shieldHp; }
    set shieldHp(value) { this.core.shieldHp = value; }
    
    get shieldMaxHp() { return this.core.shieldMaxHp; }
    set shieldMaxHp(value) { this.core.shieldMaxHp = value; }
    
    get phase() { return this.phaseManager ? this.phaseManager.phase : 1; }
    get rageMode() { return this.phaseManager ? this.phaseManager.rageMode : false; }
    
    update(dt, playerX, playerY, playerAttackRange = 300) {
        this.core.updatePosition(dt, playerX, playerY, playerAttackRange);
        
        const behaviorActions = this.behaviors.update(dt, playerX, playerY);
        
        let bossActions = null;
        if (this.phaseManager) {
            bossActions = this.phaseManager.update(dt);
            
            if (this.behaviors.canShoot && this.behaviors.shootCooldown <= 0) {
                const bossShootResult = this.phaseManager.shoot(playerX, playerY);
                if (bossShootResult) {
                    return bossShootResult;
                }
            }
        }
        
        if (bossActions) {
            return bossActions[0];
        }
        
        if (behaviorActions && behaviorActions.length > 0) {
            return behaviorActions[0];
        }
        
        return null;
    }
    
    reveal() {
        this.core.reveal();
    }
    
    draw(ctx) {
        this.renderer.draw(ctx, this.core, this.behaviors, this.phaseManager);
    }
    
    static spawn(canvasWidth, canvasHeight, playerX, playerY, gameTime, isBoss = false, hpMultiplier = 1) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        const margin = 50;
        
        switch (side) {
            case 0:
                x = randomRange(-margin, canvasWidth + margin);
                y = -margin;
                break;
            case 1:
                x = canvasWidth + margin;
                y = randomRange(-margin, canvasHeight + margin);
                break;
            case 2:
                x = randomRange(-margin, canvasWidth + margin);
                y = canvasHeight + margin;
                break;
            case 3:
                x = -margin;
                y = randomRange(-margin, canvasHeight + margin);
                break;
        }
        
        let type;
        
        if (isBoss) {
            type = EnemyTypes.BOSS;
        } else {
            const typeWeights = [
                { type: EnemyTypes.NORMAL, weight: 40 },
                { type: EnemyTypes.FAST, weight: gameTime > 30 ? 20 : 10 },
                { type: EnemyTypes.TANK, weight: gameTime > 60 ? 15 : 5 },
                { type: EnemyTypes.RANGED, weight: gameTime > 45 ? 12 : 0 },
                { type: EnemyTypes.ELITE, weight: gameTime > 90 ? 10 : 0 },
                { type: EnemyTypes.SPLITTER, weight: gameTime > 60 ? 12 : 0 },
                { type: EnemyTypes.EXPLOSIVE, weight: gameTime > 45 ? 10 : 0 },
                { type: EnemyTypes.STEALTH, weight: gameTime > 75 ? 8 : 0 }
            ];
            
            const totalWeight = typeWeights.reduce((sum, t) => sum + t.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const tw of typeWeights) {
                random -= tw.weight;
                if (random <= 0) {
                    type = tw.type;
                    break;
                }
            }
        }
        
        if (!type) type = EnemyTypes.NORMAL;
        
        const enemy = new Enemy(x, y, type);
        
        if (!isBoss && hpMultiplier > 1) {
            enemy.core.maxHp = Math.ceil(enemy.core.maxHp * hpMultiplier);
            enemy.core.hp = enemy.core.maxHp;
        }
        
        return enemy;
    }
}

export { EnemyTypes };
