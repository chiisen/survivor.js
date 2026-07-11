// @ts-check

/**
 * 除錯覆蓋層 — 顯示 FPS、記憶體、實體數量、管線狀態等除錯資訊
 */
export class DebugOverlay {
    /**
     * @param {object} game - 遊戲主物件(含 player, canvas, projectilePool, enemies, expOrbs 等)
     */
    constructor(game) {
        this.game = game;
        this.enabled = false;
        this.lastFireCooldown = 0;
        this.projectilePositions = [];
        this.warnings = [];
        
        this.fpsHistory = [];
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.currentFPS = 0;
    }
    
    /**
     * 切換除錯覆蓋層的顯示/隱藏
     */
    toggle() {
        this.enabled = !this.enabled;
    }
    
    /**
     * 收集最新遊戲狀態數據供繪製使用
     */
    update() {
        this.lastFireCooldown = this.game.player.fireCooldown;
        this.projectilePositions = this.game.projectilePool.getActiveObjects()
            .filter(p => p.active)
            .map(p => ({ x: p.x, y: p.y }));
        
        this.updateFPS();
    }
    
    /**
     * 計算並記錄每秒幀數
     */
    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        if (deltaTime >= 1000) {
            this.currentFPS = Math.round((this.frameCount * 1000) / deltaTime);
            this.fpsHistory.push(this.currentFPS);
            
            if (this.fpsHistory.length > 60) {
                this.fpsHistory.shift();
            }
            
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
        }
    }
    
    /**
     * 繪製除錯覆蓋層(若已啟用)
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    draw(ctx) {
        if (!this.enabled) return;
        
        const boxWidth = 500;
        const boxHeight = 280;
        const x = (this.game.canvas.width - boxWidth) / 2;
        const y = this.game.canvas.height - boxHeight - 50;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(x, y, boxWidth, boxHeight);
        
        ctx.font = '21px monospace';
        ctx.fillStyle = '#2ecc71';
        ctx.fillText('=== DEBUG OVERLAY (按Ctrl+Shift+D 鍵關閉) ===', x + 10, y + 25);
        
        this.drawFPS(ctx, y + 50, x);
        this.drawMemory(ctx, y + 75, x);
        this.drawEntityCounts(ctx, y + 100, x);
        this.drawGridStatus(ctx, y + 125, x);
        this.drawUpdatePipeline(ctx, y + 150, x);
        this.drawPlayerStatus(ctx, y + 175, x);
        this.drawWarnings(ctx, y + 200, x);
        
        ctx.restore();
    }
    
    /**
     * 繪製 FPS 資訊
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     * @param {number} y - 繪製 Y 座標
     * @param {number} x - 繪製 X 座標
     */
    drawFPS(ctx, y, x) {
        const avgFPS = this.fpsHistory.length > 0 
            ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
            : 0;
        
        let fpsColor = '#2ecc71';
        if (this.currentFPS < 30) fpsColor = '#e74c3c';
        else if (this.currentFPS < 50) fpsColor = '#f39c12';
        
        ctx.fillStyle = fpsColor;
        ctx.fillText(`FPS: ${this.currentFPS} (avg: ${avgFPS})`, x + 10, y);
        
        if (this.fpsHistory.length >= 10) {
            ctx.fillStyle = '#95a5a6';
            ctx.fillText(`[${this.fpsHistory.slice(-10).join(', ')}]`, x + 150, y);
        }
    }
    
    /**
     * 繪製記憶體使用量
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     * @param {number} y - 繪製 Y 座標
     * @param {number} x - 繪製 X 座標
     */
    drawMemory(ctx, y, x) {
        if (performance.memory) {
            const usedMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            const totalMB = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
            const limitMB = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
            const usagePercent = Math.round((usedMB / totalMB) * 100);
            
            let memColor = '#2ecc71';
            if (usagePercent > 80) memColor = '#e74c3c';
            else if (usagePercent > 60) memColor = '#f39c12';
            
            ctx.fillStyle = memColor;
            ctx.fillText(`Memory: ${usedMB}/${totalMB}MB (${usagePercent}% used, limit: ${limitMB}MB)`, x + 10, y);
        } else {
            ctx.fillStyle = '#95a5a6';
            ctx.fillText('Memory: (not available in this browser)', x + 10, y);
        }
    }
    
    /**
     * 繪製實體數量統計
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     * @param {number} y - 繪製 Y 座標
     * @param {number} x - 繪製 X 座標
     */
    drawEntityCounts(ctx, y, x) {
        const projectiles = this.game.projectilePool.getActiveObjects().filter(p => p.active).length;
        const enemies = this.game.enemies.length;
        const expOrbs = this.game.expOrbs.length;
        const enemyProjectiles = this.game.enemyProjectiles.length;
        const damageNumbers = this.game.damageNumbers.length;
        
        ctx.fillStyle = '#3498db';
        ctx.fillText(`Entities: P:${projectiles} E:${enemies} Exp:${expOrbs} EP:${enemyProjectiles} DN:${damageNumbers}`, x + 10, y);
    }
    
    /**
     * 繪製空間格網同步狀態
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     * @param {number} y - 繪製 Y 座標
     * @param {number} x - 繪製 X 座標
     */
    drawGridStatus(ctx, y, x) {
        const gridEntities = this.game.enemyGrid.getTotalEntities();
        const enemies = this.game.enemies.length;
        const color = gridEntities === enemies ? '#2ecc71' : '#e74c3c';
        
        ctx.fillStyle = color;
        ctx.fillText(`Grid: ${gridEntities} entities / ${enemies} enemies`, x + 10, y);
        
        if (gridEntities === 0 && enemies > 0) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('⚠ Grid 未填充！', x + 220, y);
        }
    }
    
    /**
     * 繪製 Update Loop 管線四階段執行狀態
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     * @param {number} y - 繪製 Y 座標
     * @param {number} x - 繪製 X 座標
     */
    drawUpdatePipeline(ctx, y, x) {
        const phases = [
            { name: 'Phase1', executed: this.game.logger.phaseExecuted.phase1, label: 'Grid' },
            { name: 'Phase2', executed: this.game.logger.phaseExecuted.phase2, label: 'State' },
            { name: 'Phase3', executed: this.game.logger.phaseExecuted.phase3, label: 'System' },
            { name: 'Phase4', executed: this.game.logger.phaseExecuted.phase4, label: 'UI' }
        ];
        
        const statusLine = phases.map(p => {
            const icon = p.executed ? '✓' : '✗';
            const color = p.executed ? '#2ecc71' : '#e74c3c';
            return `${p.label}:${icon}`;
        }).join(' ');
        
        ctx.fillStyle = '#f39c12';
        ctx.fillText(`Pipeline: ${statusLine}`, x + 10, y);
    }
    
    /**
     * 繪製玩家射擊冷卻狀態
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     * @param {number} y - 繪製 Y 座標
     * @param {number} x - 繪製 X 座標
     */
    drawPlayerStatus(ctx, y, x) {
        const fireCooldown = this.game.player.fireCooldown.toFixed(2);
        const canFire = this.game.player.canFire();
        const color = canFire ? '#2ecc71' : '#f39c12';
        
        ctx.fillStyle = color;
        ctx.fillText(`fireCooldown: ${fireCooldown}s, canFire: ${canFire}`, x + 10, y);
        
        if (!canFire && this.game.player.fireCooldown > 0.6) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('⚠ 冷卻過長！', x + 220, y);
        }
        
        if (this.lastFireCooldown === this.game.player.fireCooldown && this.game.player.fireCooldown > 0) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('⚠ 未減少！', x + 320, y);
        }
    }
    
    /**
     * 繪製實體數量統計(簡化版)
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     * @param {number} y - 繪製 Y 座標
     * @param {number} x - 繪製 X 座標
     */
    drawEntityCounts(ctx, y, x) {
        const projectiles = this.game.projectilePool.getActiveObjects().filter(p => p.active).length;
        const enemies = this.game.enemies.length;
        const expOrbs = this.game.expOrbs.length;
        
        ctx.fillStyle = '#3498db';
        ctx.fillText(`Projectiles: ${projectiles}, Enemies: ${enemies}, ExpOrbs: ${expOrbs}`, x + 10, y);
    }
    
    /**
     * 繪製系統警告訊息
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     * @param {number} y - 繪製 Y 座標
     * @param {number} x - 繪製 X 座標
     */
    drawWarnings(ctx, y, x) {
        this.detectWarnings();
        
        if (this.warnings.length === 0) {
            ctx.fillStyle = '#2ecc71';
            ctx.fillText('✓ 系統正常', x + 10, y);
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(this.warnings.join(' | '), x + 10, y);
        }
    }
    
    /**
     * 偵測並收集系統警告(FPS、記憶體、格網、冷卻、子彈、敵人數量)
     */
    detectWarnings() {
        this.warnings = [];
        
        if (this.currentFPS < 30) {
            this.warnings.push('⚠ FPS過低');
        }
        
        if (performance.memory) {
            const usagePercent = Math.round((performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100);
            if (usagePercent > 80) {
                this.warnings.push('⚠ Memory過高');
            }
        }
        
        if (this.game.enemyGrid.getTotalEntities() === 0 && this.game.enemies.length > 0) {
            this.warnings.push('⚠ Grid空');
        }
        
        if (this.lastFireCooldown === this.game.player.fireCooldown && this.game.player.fireCooldown > 0) {
            this.warnings.push('⚠ 冷卻未更新');
        }
        
        const projectiles = this.game.projectilePool.getActiveObjects().filter(p => p.active);
        if (projectiles.length > 0) {
            const notMoving = projectiles.some(p => {
                const pos = this.projectilePositions.find(pp => pp.x === p.x && pp.y === p.y);
                return pos;
            });
            if (notMoving) {
                this.warnings.push('⚠ 子彈未移動');
            }
        }
        
        if (this.game.enemies.length > 50) {
            this.warnings.push('⚠ 敵人過多');
        }
        
        if (this.game.enemyProjectiles.length > 20) {
            this.warnings.push('⚠ EP過多');
        }
    }
}