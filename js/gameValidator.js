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
        if (this.game.projectilePool.getActiveObjects().length > 0 && this.game.enemies.length > 0) {
            const nearby = this.game.enemyGrid.getNearby(
                this.game.player.x,
                this.game.player.y,
                this.game.player.attackRange
            );
            
            if (nearby.length === 0 && this.game.enemies.length > 0) {
                throw new Error('Phase 3 失敗：getNearby 返回空陣列，碰撞檢測失效');
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