// @ts-check

/**
 * Boss 階段管理器 — 根據 HP 百分比切換攻擊階段與狂暴模式
 */
export class BossPhaseManager {
    /**
     * @param {object} core - Boss 核心物件(含 x, y, hp, maxHp, speed)
     * @param {object} behaviors - Boss 行為物件(含 shootInterval)
     */
    constructor(core, behaviors) {
        this.core = core;
        this.behaviors = behaviors;
        this.phase = 1;
        this.rageMode = false;
        this.spawnCooldown = 0;
    }
    
    /**
     * 更新階段判定並回傳待執行的動作
     * @param {number} dt - 幀間隔時間(秒)
     * @returns {Array<{type: string, x: number, y: number}>|null} 待執行動作陣列,無動作回傳 null
     */
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
    
    /**
     * 向四周發射多方向子彈(彈幕)
     * @param {number} targetX - 目標 X 座標(未使用,保留介面)
     * @param {number} targetY - 目標 Y 座標(未使用,保留介面)
     * @returns {{type: string, projectiles: Array<object>}} 多發射擊結果
     */
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