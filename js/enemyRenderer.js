// @ts-check

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
     * 繪製 Boss 裝飾（暗黑魔王風：能量環 + 皇冠）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @param {object|null} phaseManager - Boss 階段管理器
     * @returns {void}
     */
    drawBossDecorations(ctx, core, phaseManager) {
        const rageMode = phaseManager ? phaseManager.rageMode : false;
        const t = Date.now() / 1000;

        // 旋轉能量環（非狂怒時也有的常駐裝飾）
        if (!rageMode) {
            ctx.save();
            ctx.translate(core.x, core.y);
            ctx.rotate(t * 0.5);
            ctx.beginPath();
            ctx.ellipse(0, 0, core.radius + 12, core.radius + 6, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(192, 57, 43, ${0.15 + Math.sin(t * 2) * 0.1})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 12]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        if (rageMode) {
            this.drawRageFlames(ctx, core);
        }

        this.drawBossCrown(ctx, core, rageMode);
    }
    
    /**
     * 繪製 Boss 狂怒火焰（增強版：多層火焰 + 粒子 + 脈動能量環）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawRageFlames(ctx, core) {
        const { x, y, radius } = core;
        const t = Date.now() / 1000;

        // 脈動能量環
        for (let ring = 0; ring < 3; ring++) {
            const ringRadius = radius + 18 + ring * 8;
            const ringAlpha = (0.4 - ring * 0.1) * (Math.sin(t * 4 + ring) * 0.3 + 0.7);
            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(231, 76, 60, ${ringAlpha})`;
            ctx.lineWidth = 3 - ring;
            ctx.stroke();
        }

        // 外層火焰粒子（12顆，隨機大小和距離）
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i + t * 2;
            const dist = radius + 15 + Math.sin(t * 6 + i * 1.5) * 8;
            const fx = x + Math.cos(angle) * dist;
            const fy = y + Math.sin(angle) * dist;
            const fSize = 3 + Math.sin(t * 8 + i * 2) * 2;

            // 火焰漸層
            const flameGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fSize * 2);
            flameGrad.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
            flameGrad.addColorStop(0.4, 'rgba(255, 100, 0, 0.7)');
            flameGrad.addColorStop(1, 'rgba(200, 30, 0, 0)');
            ctx.beginPath();
            ctx.arc(fx, fy, fSize * 2, 0, Math.PI * 2);
            ctx.fillStyle = flameGrad;
            ctx.fill();
        }

        // 內層小火焰（8顆，更靠近身體）
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + t * 3;
            const dist = radius + 8 + Math.sin(t * 10 + i) * 3;
            const fx = x + Math.cos(angle) * dist;
            const fy = y + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffd700';
            ctx.fill();
        }
    }
    
    /**
     * 繪製 Boss 皇冠（暗黑魔王風：五尖刺 + 寶石 + 發光）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @param {boolean} rageMode - 是否為狂怒模式
     * @returns {void}
     */
    drawBossCrown(ctx, core, rageMode) {
        const { x, y, radius } = core;
        const t = Date.now() / 1000;
        const crownY = y - radius - 5;
        const crownW = radius * 0.5;
        const spikeH = radius * 0.35;

        // 皇冠底座光暈
        const glowPulse = Math.sin(t * 4) * 0.2 + 0.8;
        ctx.beginPath();
        ctx.ellipse(x, crownY + 5, crownW + 10, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 196, 15, ${0.15 * glowPulse})`;
        ctx.fill();

        // 皇冠主體（五尖刺）
        ctx.beginPath();
        const baseY = crownY + 8;
        const tipY = crownY - spikeH;
        // 左側底
        ctx.moveTo(x - crownW - 8, baseY);
        // 左一尖刺
        ctx.lineTo(x - crownW, tipY + 8);
        ctx.lineTo(x - crownW * 0.5, baseY - 2);
        // 中央尖刺（最高）
        ctx.lineTo(x - crownW * 0.3, tipY);
        ctx.lineTo(x, baseY - 5);
        ctx.lineTo(x + crownW * 0.3, tipY);
        // 右一尖刺
        ctx.lineTo(x + crownW * 0.5, baseY - 2);
        ctx.lineTo(x + crownW, tipY + 8);
        // 右側底
        ctx.lineTo(x + crownW + 8, baseY);
        ctx.closePath();

        // 皇冠漸層
        const crownGrad = ctx.createLinearGradient(x, tipY, x, baseY);
        if (rageMode) {
            crownGrad.addColorStop(0, '#ff4444');
            crownGrad.addColorStop(0.5, '#cc2222');
            crownGrad.addColorStop(1, '#881111');
        } else {
            crownGrad.addColorStop(0, '#ffd700');
            crownGrad.addColorStop(0.5, '#daa520');
            crownGrad.addColorStop(1, '#b8860b');
        }
        ctx.fillStyle = crownGrad;
        ctx.fill();
        ctx.strokeStyle = rageMode ? '#aa1111' : '#8b6914';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 皇冠寶石（三顆）
        const jewelColors = rageMode
            ? ['#ff0000', '#ff4444', '#ff0000']
            : ['#e74c3c', '#3498db', '#2ecc71'];
        const jewelX = [-crownW * 0.5, 0, crownW * 0.5];
        jewelX.forEach((offset, i) => {
            const jx = x + offset;
            const jy = baseY - 8;
            ctx.beginPath();
            ctx.arc(jx, jy, 4, 0, Math.PI * 2);
            ctx.fillStyle = jewelColors[i];
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // 皇冠尖端寶石
        const tipJewelX = [-crownW * 0.3, crownW * 0.3];
        tipJewelX.forEach(offset => {
            ctx.beginPath();
            ctx.arc(x + offset, tipY + 6, 3, 0, Math.PI * 2);
            ctx.fillStyle = rageMode ? '#ff6666' : '#ffd700';
            ctx.fill();
        });
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
        if (this.type.isBoss) {
            this.drawBossBody(ctx, core);
            return;
        }
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * 繪製 Boss 暗黑魔王身體（漸層 + 內發光 + 外框）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawBossBody(ctx, core) {
        const { x, y, radius } = core;
        const t = Date.now() / 1000;

        // 外層脈衝光暈
        const pulse = Math.sin(t * 3) * 0.15 + 0.85;
        const auraGrad = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.6);
        auraGrad.addColorStop(0, `rgba(180, 30, 20, ${0.3 * pulse})`);
        auraGrad.addColorStop(0.5, `rgba(120, 10, 5, ${0.15 * pulse})`);
        auraGrad.addColorStop(1, 'rgba(60, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // 主體漸層（深紅到暗紅，模擬 3D 球體）
        const bodyGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
        bodyGrad.addColorStop(0, '#e74c3c');
        bodyGrad.addColorStop(0.3, '#c0392b');
        bodyGrad.addColorStop(0.7, '#922b21');
        bodyGrad.addColorStop(1, '#5a1a14');
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // 內層發光核心
        const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.5);
        coreGrad.addColorStop(0, 'rgba(255, 100, 50, 0.25)');
        coreGrad.addColorStop(1, 'rgba(255, 50, 20, 0)');
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // 外框
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#6b1a12';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 外框高光
        ctx.beginPath();
        ctx.arc(x, y, radius, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.strokeStyle = 'rgba(255, 150, 100, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    /**
     * 繪製敵人眼睛
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawEyes(ctx, core) {
        if (this.type.isBoss) {
            this.drawBossEyes(ctx, core);
            return;
        }
        ctx.beginPath();
        ctx.arc(core.x - core.radius * 0.3, core.y - core.radius * 0.2, core.radius * 0.2, 0, Math.PI * 2);
        ctx.arc(core.x + core.radius * 0.3, core.y - core.radius * 0.2, core.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = this.eyeColor;
        ctx.fill();
    }

    /**
     * 繪製 Boss 暗黑魔王眼睛（發光瞳孔 + 眼窩陰影 + 悍怒眼神）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawBossEyes(ctx, core) {
        const { x, y, radius } = core;
        const t = Date.now() / 1000;
        const eyeSpacing = radius * 0.28;
        const eyeY = y - radius * 0.15;
        const eyeRadius = radius * 0.15;

        // 眼窩陰影
        [-1, 1].forEach(dir => {
            const ex = x + dir * eyeSpacing;
            ctx.beginPath();
            ctx.ellipse(ex, eyeY, eyeRadius * 1.4, eyeRadius * 1.1, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fill();
        });

        // 眼白（微黃，暗黑風格）
        [-1, 1].forEach(dir => {
            const ex = x + dir * eyeSpacing;
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#f5e6c8';
            ctx.fill();
        });

        // 瞳孔（紅色發光）
        const glowPulse = Math.sin(t * 5) * 0.3 + 0.7;
        [-1, 1].forEach(dir => {
            const ex = x + dir * eyeSpacing;

            // 瞳孔外發光
            const pupilGlow = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, eyeRadius * 0.8);
            pupilGlow.addColorStop(0, `rgba(255, 50, 0, ${0.6 * glowPulse})`);
            pupilGlow.addColorStop(1, 'rgba(255, 30, 0, 0)');
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = pupilGlow;
            ctx.fill();

            // 瞳孔本體
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = '#ff2200';
            ctx.fill();

            // 瞳孔核心（黑色）
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = '#1a0000';
            ctx.fill();

            // 高光
            ctx.beginPath();
            ctx.arc(ex - eyeRadius * 0.15, eyeY - eyeRadius * 0.15, eyeRadius * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        });

        // 眉毛（怒眉，向內傾斜增添威壓感）
        [-1, 1].forEach(dir => {
            const ex = x + dir * eyeSpacing;
            ctx.beginPath();
            ctx.moveTo(ex - eyeRadius * 1.2, eyeY - eyeRadius * 1.8);
            ctx.lineTo(ex + eyeRadius * 0.8, eyeY - eyeRadius * 1.2);
            ctx.strokeStyle = '#5a1a14';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();
        });
    }
    
    /**
     * 繪製敵人嘴巴
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawMouth(ctx, core) {
        if (this.mouthStyle === 'boss') {
            this.drawBossMouth(ctx, core);
            return;
        }

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
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    /**
     * 繪製 Boss 暗黑魔王嘴巴（裂口獠牙 + 內部發光）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawBossMouth(ctx, core) {
        const { x, y, radius } = core;
        const mouthY = y + radius * 0.3;
        const mouthW = radius * 0.5;
        const mouthH = radius * 0.25;

        // 嘴巴內部（深紅發光）
        ctx.beginPath();
        ctx.ellipse(x, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
        const mouthGrad = ctx.createRadialGradient(x, mouthY, 0, x, mouthY, mouthW);
        mouthGrad.addColorStop(0, '#440000');
        mouthGrad.addColorStop(0.7, '#220000');
        mouthGrad.addColorStop(1, '#110000');
        ctx.fillStyle = mouthGrad;
        ctx.fill();

        // 上排獠牙（4顆）
        const fangs = 4;
        for (let i = 0; i < fangs; i++) {
            const fx = x - mouthW * 0.6 + (mouthW * 1.2 / (fangs - 1)) * i;
            const fTop = mouthY - mouthH * 0.3;
            const fBottom = mouthY + mouthH * 0.6 + (i % 2 === 0 ? mouthH * 0.2 : 0);
            ctx.beginPath();
            ctx.moveTo(fx - 4, fTop);
            ctx.lineTo(fx, fBottom);
            ctx.lineTo(fx + 4, fTop);
            ctx.closePath();
            ctx.fillStyle = '#f0e6d2';
            ctx.fill();
        }

        // 下排獠牙（4顆，較短）
        for (let i = 0; i < fangs; i++) {
            const fx = x - mouthW * 0.6 + (mouthW * 1.2 / (fangs - 1)) * i;
            const fBottom = mouthY + mouthH * 0.3;
            const fTop = mouthY - mouthH * 0.4 - (i % 2 === 0 ? mouthH * 0.15 : 0);
            ctx.beginPath();
            ctx.moveTo(fx - 3, fBottom);
            ctx.lineTo(fx, fTop);
            ctx.lineTo(fx + 3, fBottom);
            ctx.closePath();
            ctx.fillStyle = '#e8dcc8';
            ctx.fill();
        }

        // 嘴巴邊框
        ctx.beginPath();
        ctx.ellipse(x, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#3a0a0a';
        ctx.lineWidth = 3;
        ctx.stroke();
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

            if (this.type.isBoss) {
                this.drawBossHealthBar(ctx, core, hpPercentage);
                return;
            }

            const barWidth = core.radius * 1.5;
            const barHeight = 4;
            const barY = core.y - core.radius - 8;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(core.x - barWidth / 2, barY, barWidth, barHeight);
            
            const hpColor = hpPercentage > 0.5 ? '#2ecc71' : '#e74c3c';
            ctx.fillStyle = hpColor;
            ctx.fillRect(core.x - barWidth / 2, barY, barWidth * hpPercentage, barHeight);
        }
    }

    /**
     * 繪製 Boss 專屬血條（雙層邊框 + 漸層 + 百分比數字）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @param {number} hpPercentage - 血量百分比
     * @returns {void}
     */
    drawBossHealthBar(ctx, core, hpPercentage) {
        const { x, y, radius } = core;
        const barWidth = radius * 2.5;
        const barHeight = 8;
        const barY = y - radius - 14;
        const barX = x - barWidth / 2;

        // 外框（深色）
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

        // 內框背景
        ctx.fillStyle = 'rgba(40, 10, 10, 0.8)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 血量漸層
        const hpGrad = ctx.createLinearGradient(barX, barY, barX + barWidth * hpPercentage, barY);
        if (hpPercentage > 0.5) {
            hpGrad.addColorStop(0, '#ff4444');
            hpGrad.addColorStop(1, '#cc2222');
        } else if (hpPercentage > 0.25) {
            hpGrad.addColorStop(0, '#ff8800');
            hpGrad.addColorStop(1, '#cc4400');
        } else {
            hpGrad.addColorStop(0, '#ff2200');
            hpGrad.addColorStop(1, '#aa0000');
        }
        ctx.fillStyle = hpGrad;
        ctx.fillRect(barX, barY, barWidth * hpPercentage, barHeight);

        // 高光條
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(barX, barY, barWidth * hpPercentage, barHeight * 0.4);

        // 邊框
        ctx.strokeStyle = '#6b1a12';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // 百分比文字
        const pctText = Math.ceil(hpPercentage * 100) + '%';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(pctText, x, barY + barHeight / 2);
    }
}