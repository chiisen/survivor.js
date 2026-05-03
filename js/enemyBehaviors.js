import { normalize } from './utils.js';

export class EnemyBehaviors {
    constructor(type, core) {
        this.core = core;
        this.type = type;
        
        this.canShoot = type.canShoot;
        this.shootInterval = type.shootInterval;
        this.shootCooldown = 0;
        
        this.isStealth = type.isStealth || false;
        this.revealTime = 0;
    }
    
    update(dt, playerX, playerY) {
        const actions = [];
        
        if (this.isStealth) {
            if (this.core.revealTime > 0) {
                this.core.revealTime -= dt;
                this.core.currentAlpha = 1;
            } else {
                this.core.currentAlpha = this.core.baseAlpha;
            }
        }
        
        if (this.canShoot) {
            this.shootCooldown -= dt;
            if (this.shootCooldown <= 0) {
                this.shootCooldown = this.shootInterval;
                const shootResult = this.shoot(playerX, playerY);
                if (shootResult) {
                    actions.push(shootResult);
                }
            }
        }
        
        return actions.length > 0 ? actions : null;
    }
    
    shoot(targetX, targetY) {
        const dx = targetX - this.core.x;
        const dy = targetY - this.core.y;
        const normalized = normalize(dx, dy);
        
        const projectileData = {
            x: this.core.x,
            y: this.core.y,
            vx: normalized.x * 150,
            vy: normalized.y * 150,
            damage: 5,
            radius: 5,
            color: '#9b59b6',
            trail: [],
            maxTrailLength: 10
        };
        
        return projectileData;
    }
    
    reveal() {
        if (this.isStealth) {
            this.core.revealTime = 2;
        }
    }
}