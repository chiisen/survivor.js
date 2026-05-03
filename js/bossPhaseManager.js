export class BossPhaseManager {
    constructor(core, behaviors) {
        this.core = core;
        this.behaviors = behaviors;
        this.phase = 1;
        this.rageMode = false;
        this.spawnCooldown = 0;
    }
    
    update(dt) {
        const actions = [];
        
        const hpPercentage = this.core.hp / this.core.maxHp;
        
        if (hpPercentage <= 0.3 && !this.rageMode) {
            this.rageMode = true;
            this.phase = 3;
            this.core.speed *= 1.5;
            this.behaviors.shootInterval *= 0.5;
        } else if (hpPercentage <= 0.6 && this.phase < 2) {
            this.phase = 2;
            this.behaviors.shootInterval *= 0.7;
        }
        
        if (this.phase >= 2 && this.spawnCooldown <= 0) {
            this.spawnCooldown = 5;
            actions.push({ type: 'spawn_minion', x: this.core.x, y: this.core.y });
        }
        
        if (this.spawnCooldown > 0) {
            this.spawnCooldown -= dt;
        }
        
        return actions.length > 0 ? actions : null;
    }
    
    shoot(targetX, targetY) {
        const projectiles = [];
        const bulletCount = this.phase >= 3 ? 8 : 4;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = (Math.PI * 2 / bulletCount) * i;
            const speed = 150 + (this.phase * 20);
            
            projectiles.push({
                x: this.core.x,
                y: this.core.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                damage: this.phase >= 3 ? 10 : 5,
                radius: 5,
                color: '#e74c3c',
                trail: [],
                maxTrailLength: 10
            });
        }
        
        return { type: 'multi_projectile', projectiles };
    }
}