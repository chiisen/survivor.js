// @ts-check

import { normalize } from './utils.js';

export class EnemyBehaviors {
    /**
     * 敵人行為控制器
     * @param {object} type - 敵人類型配置
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    constructor(type, core) {
        this.core = core;
        this.type = type;
        
        this.canShoot = type.canShoot;
        this.shootInterval = type.shootInterval;
        this.shootCooldown = 0;
        
        this.isStealth = type.isStealth || false;
        this.revealTime = 0;
    }
    
    /**
     * 更新敵人行為
     * @param {number} dt - 時間差（秒）
     * @param {number} playerX - 玩家 X 座標
     * @param {number} playerY - 玩家 Y 座標
     * @returns {Array|null} 執行的動作列表，若無則回傳 null
     */
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
    
    /**
     * 發射投射物
     * @param {number} targetX - 目標 X 座標
     * @param {number} targetY - 目標 Y 座標
     * @returns {object} 投射物資料
     */
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
    
    /**
     * 顯露隱身敵人
     * @returns {void}
     */
    reveal() {
        if (this.isStealth) {
            this.core.revealTime = 2;
        }
    }
}