// @ts-check

const EnemyTypes = {
    NORMAL: { color: '#e74c3c', strokeColor: '#c0392b', eyeColor: '#fff', mouthStyle: 'angry' },
    FAST: { color: '#27ae60', strokeColor: '#229954', eyeColor: '#fff', mouthStyle: 'neutral' },
    TANK: { color: '#7f8c8d', strokeColor: '#5d6d7e', eyeColor: '#e74c3c', mouthStyle: 'wide' },
    RANGED: { color: '#9b59b6', strokeColor: '#8e44ad', eyeColor: '#f1c40f', mouthStyle: 'shooter' },
    BOSS: { color: '#c0392b', strokeColor: '#922b21', eyeColor: '#f1c40f', mouthStyle: 'boss', isBoss: true },
    ELITE: { color: '#e67e22', strokeColor: '#d35400', eyeColor: '#fff', mouthStyle: 'elite', isElite: true },
    SPLITTER: { color: '#16a085', strokeColor: '#138d75', eyeColor: '#fff', mouthStyle: 'split' },
    EXPLOSIVE: { color: '#d35400', strokeColor: '#bf4a1a', eyeColor: '#f39c12', mouthStyle: 'explosive' },
    STEALTH: { color: '#5d6d7e', strokeColor: '#4a5a6a', eyeColor: '#3498db', mouthStyle: 'stealth' }
};

export class EnemyRenderer {
    /**
     * 敵人渲染器
     * @param {object} type - 敵人類型配置
     * @returns {void}
     */
    constructor(type) {
        this.type = type;
        this.color = type.color;
        this.strokeColor = type.strokeColor;
        this.eyeColor = type.eyeColor;
        this.mouthStyle = type.mouthStyle;
    }
    
    /**
     * 繪製敵人
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @param {object} behaviors - 敵人行為控制器
     * @param {object|null} phaseManager - Boss 階段管理器（可選）
     * @returns {void}
     */
    draw(ctx, core, behaviors, phaseManager = null) {
        ctx.save();
        
        this.drawStealthEffect(ctx, core);
        this.drawTypeSpecificDecorations(ctx, core, behaviors, phaseManager);
        this.drawBody(ctx, core);
        this.drawEyes(ctx, core);
        this.drawMouth(ctx, core);
        this.drawHealthBar(ctx, core);
        
        ctx.restore();
    }
    
    /**
     * 繪製隱身效果
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawStealthEffect(ctx, core) {
        if (core.isStealth) {
            if (core.revealTime > 0) {
                const flashRate = Math.sin(core.revealTime * 10) * 0.3 + 0.7;
                ctx.globalAlpha = flashRate;
            } else {
                ctx.globalAlpha = core.baseAlpha;
            }
        }
    }
    
    /**
     * 繪製敵人類型特定裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @param {object} behaviors - 敵人行為控制器
     * @param {object|null} phaseManager - Boss 階段管理器（可選）
     * @returns {void}
     */
    drawTypeSpecificDecorations(ctx, core, behaviors, phaseManager) {
        if (this.type.isBoss) {
            this.drawBossDecorations(ctx, core, phaseManager);
        }
        
        if (this.type.isElite) {
            this.drawEliteDecorations(ctx, core);
        }
        
        if (this.type.name === 'splitter') {
            this.drawSplitterDecoration(ctx, core);
        }
        
        if (this.type.name === 'explosive') {
            this.drawExplosiveDecoration(ctx, core);
        }
        
        if (this.type.name === 'tank') {
            this.drawTankDecoration(ctx, core);
        }
        
        if (this.type.name === 'fast') {
            this.drawFastDecoration(ctx, core);
        }
        
        if (this.type.name === 'ranged') {
            this.drawRangedDecoration(ctx, core);
        }
    }
    
    /**
     * 繪製 Boss 裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @param {object|null} phaseManager - Boss 階段管理器
     * @returns {void}
     */
    drawBossDecorations(ctx, core, phaseManager) {
        const rageMode = phaseManager ? phaseManager.rageMode : false;
        
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius + 10, 0, Math.PI * 2);
        ctx.fillStyle = rageMode ? 'rgba(231, 76, 60, 0.4)' : 'rgba(192, 57, 43, 0.2)';
        ctx.fill();
        
        if (rageMode) {
            this.drawRageFlames(ctx, core);
        }
        
        this.drawBossCrown(ctx, core, rageMode);
    }
    
    /**
     * 繪製 Boss 狂怒火焰
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawRageFlames(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius + 20, 0, Math.PI * 2);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        for (let i = 0; i < 8; i++) {
            const flameAngle = (Math.PI * 2 / 8) * i + Math.sin(Date.now() / 100) * 0.2;
            const flameX = core.x + Math.cos(flameAngle) * (core.radius + 15);
            const flameY = core.y + Math.sin(flameAngle) * (core.radius + 15);
            ctx.beginPath();
            ctx.arc(flameX, flameY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#f39c12';
            ctx.fill();
        }
    }
    
    /**
     * 繪製 Boss 皇冠
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @param {boolean} rageMode - 是否為狂怒模式
     * @returns {void}
     */
    drawBossCrown(ctx, core, rageMode) {
        ctx.beginPath();
        ctx.moveTo(core.x - 15, core.y - core.radius - 25);
        ctx.lineTo(core.x, core.y - core.radius - 35);
        ctx.lineTo(core.x + 15, core.y - core.radius - 25);
        ctx.lineTo(core.x + 10, core.y - core.radius - 25);
        ctx.lineTo(core.x, core.y - core.radius - 30);
        ctx.lineTo(core.x - 10, core.y - core.radius - 25);
        ctx.closePath();
        ctx.fillStyle = rageMode ? '#e74c3c' : '#f1c40f';
        ctx.fill();
        ctx.strokeStyle = rageMode ? '#c0392b' : '#e67e22';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    /**
     * 繪製精英敵人裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawEliteDecorations(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        if (core.hasShield && core.shieldHp > 0) {
            this.drawShield(ctx, core);
        }
    }
    
    /**
     * 繪製護盾
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawShield(ctx, core) {
        const shieldAlpha = 0.4 + (core.shieldHp / core.shieldMaxHp) * 0.3;
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius + 18, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 152, 219, ${shieldAlpha})`;
        ctx.fill();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        this.drawShieldBar(ctx, core);
    }
    
    /**
     * 繪製護盾血條
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawShieldBar(ctx, core) {
        const barWidth = core.radius * 1.5;
        const barHeight = 4;
        const barY = core.y - core.radius - 18;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(core.x - barWidth / 2, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#3498db';
        ctx.fillRect(core.x - barWidth / 2, barY, barWidth * (core.shieldHp / core.shieldMaxHp), barHeight);
    }
    
    /**
     * 繪製分裂敵人裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawSplitterDecoration(ctx, core) {
        ctx.beginPath();
        ctx.moveTo(core.x - core.radius * 0.3, core.y - core.radius * 1.2);
        ctx.lineTo(core.x + core.radius * 0.3, core.y - core.radius * 1.2);
        ctx.lineTo(core.x, core.y - core.radius * 0.8);
        ctx.closePath();
        ctx.fillStyle = '#1abc9c';
        ctx.fill();
    }
    
    /**
     * 繪製爆炸敵人裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawExplosiveDecoration(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    /**
     * 繪製坦克敵人裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawTankDecoration(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(127, 140, 141, 0.3)';
        ctx.fill();
    }
    
    /**
     * 繪製快速敵人裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawFastDecoration(ctx, core) {
        ctx.beginPath();
        ctx.moveTo(core.x - core.radius * 0.5, core.y - core.radius * 0.8);
        ctx.lineTo(core.x, core.y - core.radius * 1.5);
        ctx.lineTo(core.x + core.radius * 0.5, core.y - core.radius * 0.8);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    
    /**
     * 繪製遠程敵人裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawRangedDecoration(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y - core.radius * 0.5, core.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#8e44ad';
        ctx.fill();
        ctx.strokeStyle = '#7d3c98';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * 繪製敵人身體
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawBody(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.type.isBoss ? 4 : 2;
        ctx.stroke();
    }
    
    /**
     * 繪製敵人眼睛
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawEyes(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x - core.radius * 0.3, core.y - core.radius * 0.2, core.radius * 0.2, 0, Math.PI * 2);
        ctx.arc(core.x + core.radius * 0.3, core.y - core.radius * 0.2, core.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = this.eyeColor;
        ctx.fill();
    }
    
    /**
     * 繪製敵人嘴巴
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawMouth(ctx, core) {
        ctx.beginPath();
        
        switch (this.mouthStyle) {
            case 'angry':
                ctx.moveTo(core.x - core.radius * 0.35, core.y + core.radius * 0.35);
                ctx.lineTo(core.x + core.radius * 0.35, core.y + core.radius * 0.35);
                break;
            case 'neutral':
                ctx.arc(core.x, core.y + core.radius * 0.3, core.radius * 0.15, 0, Math.PI);
                break;
            case 'wide':
                ctx.arc(core.x, core.y + core.radius * 0.3, core.radius * 0.4, 0, Math.PI);
                break;
            case 'shooter':
                ctx.arc(core.x, core.y + core.radius * 0.35, core.radius * 0.25, Math.PI * 0.2, Math.PI * 0.8);
                break;
            case 'boss':
                ctx.arc(core.x, core.y + core.radius * 0.35, core.radius * 0.5, Math.PI, 0, true);
                break;
            case 'elite':
                ctx.moveTo(core.x - core.radius * 0.4, core.y + core.radius * 0.3);
                ctx.lineTo(core.x - core.radius * 0.2, core.y + core.radius * 0.5);
                ctx.lineTo(core.x + core.radius * 0.2, core.y + core.radius * 0.5);
                ctx.lineTo(core.x + core.radius * 0.4, core.y + core.radius * 0.3);
                break;
            case 'split':
                ctx.moveTo(core.x - core.radius * 0.3, core.y + core.radius * 0.25);
                ctx.lineTo(core.x, core.y + core.radius * 0.5);
                ctx.lineTo(core.x + core.radius * 0.3, core.y + core.radius * 0.25);
                break;
            case 'explosive':
                ctx.arc(core.x, core.y + core.radius * 0.35, core.radius * 0.35, 0, Math.PI);
                ctx.closePath();
                ctx.fillStyle = '#f39c12';
                ctx.fill();
                break;
            case 'stealth':
                ctx.moveTo(core.x - core.radius * 0.25, core.y + core.radius * 0.3);
                ctx.lineTo(core.x + core.radius * 0.25, core.y + core.radius * 0.3);
                break;
        }
        
        if (this.mouthStyle !== 'explosive') {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.type.isBoss ? 4 : 2;
            ctx.stroke();
        }
    }
    
    /**
     * 繪製敵人血條
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawHealthBar(ctx, core) {
        if (core.maxHp > 1) {
            const hpPercentage = core.hp / core.maxHp;
            const barWidth = this.type.isBoss ? core.radius * 2.5 : core.radius * 1.5;
            const barHeight = this.type.isBoss ? 6 : 4;
            const barY = core.y - core.radius - (this.type.isBoss ? 12 : 8);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(core.x - barWidth / 2, barY, barWidth, barHeight);
            
            const hpColor = this.type.isBoss 
                ? (hpPercentage > 0.5 ? '#e74c3c' : '#922b21')
                : (hpPercentage > 0.5 ? '#2ecc71' : '#e74c3c');
            ctx.fillStyle = hpColor;
            ctx.fillRect(core.x - barWidth / 2, barY, barWidth * hpPercentage, barHeight);
            
            if (this.type.isBoss) {
                ctx.strokeStyle = '#922b21';
                ctx.lineWidth = 1;
                ctx.strokeRect(core.x - barWidth / 2, barY, barWidth, barHeight);
            }
        }
    }
}