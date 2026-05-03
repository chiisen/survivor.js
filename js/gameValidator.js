export class GameValidator {
    constructor(game) {
        this.game = game;
        this.lastFireCooldown = 0;
        this.lastProjectileCount = 0;
        this.enabled = false;
    }
    
    validatePhase1() {
        const gridEntities = this.game.enemyGrid.getTotalEntities();
        const enemyCount = this.game.enemies.length;
        
        if (gridEntities !== enemyCount) {
            throw new Error(`Phase 1 失敗：Grid 實體數 ${gridEntities} ≠ 敵人數 ${enemyCount}`);
        }
        
        return true;
    }
    
    validatePhase2() {
        const currentFireCooldown = this.game.player.fireCooldown;
        
        if (currentFireCooldown > 0 && currentFireCooldown === this.lastFireCooldown) {
            throw new Error('Phase 2 失敗：fireCooldown 未減少，player.update() 未執行');
        }
        
        this.lastFireCooldown = currentFireCooldown;
        return true;
    }
    
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
    
    enable() {
        this.enabled = true;
        console.log('✅ GameValidator 已啟用（硬斷言檢查）');
    }
    
    disable() {
        this.enabled = false;
        console.log('❌ GameValidator 已禁用');
    }
}