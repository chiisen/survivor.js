// @ts-check

/**
 * 遊戲驗證器 — 在執行期檢查 Update Loop 四階段是否正確執行
 */
export class GameValidator {
    /**
     * @param {object} game - 遊戲主物件(含 enemyGrid, enemies, player, projectilePool)
     */
    constructor(game) {
        this.game = game;
        this.lastFireCooldown = 0;
        this.lastProjectileCount = 0;
        this.enabled = false;
    }
    
    /**
     * 驗證 Phase 1 — Grid 實體數是否與敵人數量一致
     * @returns {boolean} 驗證通過回傳 true
     * @throws {Error} Grid 實體數 ≠ 敵人數時丟出錯誤
     */
    validatePhase1() {
        const gridEntities = this.game.enemyGrid.getTotalEntities();
        const enemyCount = this.game.enemies.length;
        
        if (gridEntities !== enemyCount) {
            throw new Error(`Phase 1 失敗：Grid 實體數 ${gridEntities} ≠ 敵人數 ${enemyCount}`);
        }
        
        return true;
    }
    
    /**
     * 驗證 Phase 2 — fireCooldown 是否持續遞減(player.update() 已執行)
     * @returns {boolean} 驗證通過回傳 true
     * @throws {Error} fireCooldown 未減少時丟出錯誤
     */
    validatePhase2() {
        const currentFireCooldown = this.game.player.fireCooldown;
        
        if (currentFireCooldown > 0 && currentFireCooldown === this.lastFireCooldown) {
            throw new Error('Phase 2 失敗：fireCooldown 未減少，player.update() 未執行');
        }
        
        this.lastFireCooldown = currentFireCooldown;
        return true;
    }
    
    /**
     * 驗證 Phase 3 — 空間格網是否正確回傳附近敵人
     * @returns {boolean} 驗證通過回傳 true
     * @throws {Error} 附近有敵人但 Grid 回傳空陣列時丟出錯誤
     */
    validatePhase3() {
        const projectiles = this.game.projectilePool.getActiveObjects().filter(p => p.active);
        
        if (projectiles.length > 0 && this.game.enemies.length > 0) {
            let nearbyEnemyExists = false;
            
            for (const enemy of this.game.enemies) {
                const dist = Math.sqrt(
                    Math.pow(enemy.x - this.game.player.x, 2) +
                    Math.pow(enemy.y - this.game.player.y, 2)
                );
                
                if (dist <= this.game.player.attackRange + 50) {
                    nearbyEnemyExists = true;
                    break;
                }
            }
            
            if (nearbyEnemyExists) {
                const nearbyFromGrid = this.game.enemyGrid.getNearby(
                    this.game.player.x,
                    this.game.player.y,
                    this.game.player.attackRange + 50
                );
                
                if (nearbyFromGrid.length === 0) {
                    throw new Error('Phase 3 失敗：附近有敵人但 Grid 返回空陣列');
                }
            }
        }
        
        return true;
    }
    
    /**
     * 依序執行所有階段驗證
     * @returns {boolean} 全部通過回傳 true,任一失敗回傳 false
     */
    validateAll() {
        if (!this.enabled) return true;
        
        try {
            this.validatePhase1();
            this.validatePhase2();
            this.validatePhase3();
            return true;
        } catch (error) {
            console.error('⚠️ GameValidator 檢測到錯誤:', error.message);
            return false;
        }
    }
    
    /**
     * 啟用驗證器
     */
    enable() {
        this.enabled = true;
        console.log('✅ GameValidator 已啟用（硬斷言檢查）');
    }
    
    /**
     * 停用驗證器
     */
    disable() {
        this.enabled = false;
        console.log('❌ GameValidator 已禁用');
    }
}