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
        this.attackPattern = 0;
        this.patternTimer = 0;
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
            actions.push({ type: 'rage_enter', x: this.core.x, y: this.core.y });
        } else if (hpPercentage <= 0.6 && this.phase < 2) {
            this.phase = 2;
            this.behaviors.shootInterval *= 0.7;
        }

        this.patternTimer += dt;
        if (this.patternTimer > 3) {
            this.attackPattern = (this.attackPattern + 1) % 3;
            this.patternTimer = 0;
        }

        if (this.phase >= 2 && this.spawnCooldown <= 0) {
            this.spawnCooldown = this.phase >= 3 ? 4 : 6;
            actions.push({ type: 'spawn_minion', x: this.core.x, y: this.core.y });
        }

        if (this.spawnCooldown > 0) {
            this.spawnCooldown -= dt;
        }

        return actions.length > 0 ? actions : null;
    }

    /**
     * 向四周發射多方向子彈(彈幕)
     * @param {number} targetX - 目標 X 座標
     * @param {number} targetY - 目標 Y 座標
     * @returns {{type: string, projectiles: Array<object>}} 多發射擊結果
     */
    shoot(targetX, targetY) {
        const projectiles = [];
        const t = Date.now() / 1000;

        if (this.attackPattern === 0) {
            // 環形彈幕
            const bulletCount = this.phase >= 3 ? 12 : 6;
            for (let i = 0; i < bulletCount; i++) {
                const angle = (Math.PI * 2 / bulletCount) * i + t * 0.5;
                const speed = 150 + (this.phase * 30);
                projectiles.push(this.createProjectile(angle, speed, this.phase >= 3 ? 8 : 5));
            }
        } else if (this.attackPattern === 1) {
            // 追蹤彈（指向玩家）
            const angle = Math.atan2(targetY - this.core.y, targetX - this.core.x);
            for (let i = -1; i <= 1; i++) {
                const spread = i * 0.2;
                projectiles.push(this.createProjectile(angle + spread, 200, this.phase >= 3 ? 12 : 8));
            }
        } else {
            // 螺旋彈
            const spiralCount = this.phase >= 3 ? 6 : 4;
            for (let i = 0; i < spiralCount; i++) {
                const angle = (Math.PI * 2 / spiralCount) * i + t * 2;
                const speed = 120 + (this.phase * 25);
                projectiles.push(this.createProjectile(angle, speed, this.phase >= 3 ? 7 : 4));
            }
        }

        return { type: 'multi_projectile', projectiles };
    }

    /**
     * 建立子彈物件
     * @param {number} angle - 角度
     * @param {number} speed - 速度
     * @param {number} damage - 傷害
     * @returns {object} 子彈物件
     */
    createProjectile(angle, speed, damage) {
        const t = Date.now() / 1000;
        return {
            x: this.core.x,
            y: this.core.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage,
            radius: 5,
            color: this.rageMode ? '#ff4444' : '#e74c3c',
            trail: [],
            maxTrailLength: 10
        };
    }
}