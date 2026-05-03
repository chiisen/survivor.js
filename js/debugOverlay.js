export class DebugOverlay {
    constructor(game) {
        this.game = game;
        this.enabled = false;
        this.lastFireCooldown = 0;
        this.projectilePositions = [];
        this.warnings = [];
    }
    
    toggle() {
        this.enabled = !this.enabled;
    }
    
    update() {
        this.lastFireCooldown = this.game.player.fireCooldown;
        this.projectilePositions = this.game.projectilePool.getActiveObjects()
            .filter(p => p.active)
            .map(p => ({ x: p.x, y: p.y }));
    }
    
    draw(ctx) {
        if (!this.enabled) return;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, 400, 200);
        
        ctx.font = '14px monospace';
        ctx.fillStyle = '#2ecc71';
        ctx.fillText('=== DEBUG OVERLAY (按Ctrl+Shift+D 鍵關閉) ===', 10, 20);
        
        this.drawGridStatus(ctx, 40);
        this.drawUpdatePipeline(ctx, 70);
        this.drawPlayerStatus(ctx, 100);
        this.drawEntityCounts(ctx, 130);
        this.drawWarnings(ctx, 160);
        
        ctx.restore();
    }
    
    drawGridStatus(ctx, y) {
        const gridEntities = this.game.enemyGrid.getTotalEntities();
        const enemies = this.game.enemies.length;
        const color = gridEntities === enemies ? '#2ecc71' : '#e74c3c';
        
        ctx.fillStyle = color;
        ctx.fillText(`Grid: ${gridEntities} entities / ${enemies} enemies`, 10, y);
        
        if (gridEntities === 0 && enemies > 0) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('⚠ Grid 未填充！', 220, y);
        }
    }
    
    drawUpdatePipeline(ctx, y) {
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
        ctx.fillText(`Pipeline: ${statusLine}`, 10, y);
    }
    
    drawPlayerStatus(ctx, y) {
        const fireCooldown = this.game.player.fireCooldown.toFixed(2);
        const canFire = this.game.player.canFire();
        const color = canFire ? '#2ecc71' : '#f39c12';
        
        ctx.fillStyle = color;
        ctx.fillText(`fireCooldown: ${fireCooldown}s, canFire: ${canFire}`, 10, y);
        
        if (!canFire && this.game.player.fireCooldown > 0.6) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('⚠ 冷卻過長！', 220, y);
        }
        
        if (this.lastFireCooldown === this.game.player.fireCooldown && this.game.player.fireCooldown > 0) {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('⚠ 未減少！', 320, y);
        }
    }
    
    drawEntityCounts(ctx, y) {
        const projectiles = this.game.projectilePool.getActiveObjects().filter(p => p.active).length;
        const enemies = this.game.enemies.length;
        const expOrbs = this.game.expOrbs.length;
        
        ctx.fillStyle = '#3498db';
        ctx.fillText(`Projectiles: ${projectiles}, Enemies: ${enemies}, ExpOrbs: ${expOrbs}`, 10, y);
    }
    
    drawWarnings(ctx, y) {
        this.detectWarnings();
        
        if (this.warnings.length === 0) {
            ctx.fillStyle = '#2ecc71';
            ctx.fillText('✓ 系統正常', 10, y);
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(this.warnings.join(' | '), 10, y);
        }
    }
    
    detectWarnings() {
        this.warnings = [];
        
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
    }
}