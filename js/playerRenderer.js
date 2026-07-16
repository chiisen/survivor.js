// @ts-check

// 盔甲顏色設定
const ARMOR_COLORS = {
    default: { main: '#78909c', dark: '#546e7a', light: '#b0bec5', blade: '#b0bec5', glow: '#90a4ae' },
    gold: { main: '#f1c40f', dark: '#f39c12', light: '#f9e547', blade: '#f9e547', glow: '#ffd700' },
    blue: { main: '#3498db', dark: '#2980b9', light: '#5dade2', blade: '#5dade2', glow: '#3498db' },
    red: { main: '#e74c3c', dark: '#c0392b', light: '#ec7063', blade: '#ec7063', glow: '#e74c3c' },
    pink: { main: '#e91e63', dark: '#c2185b', light: '#f06292', blade: '#f06292', glow: '#e91e63' },
    green: { main: '#27ae60', dark: '#1e8449', light: '#52be80', blade: '#52be80', glow: '#2ecc71' },
    purple: { main: '#8e44ad', dark: '#6c3483', light: '#bb8fce', blade: '#bb8fce', glow: '#9b59b6' },
    cyan: { main: '#00bcd4', dark: '#0097a7', light: '#4dd0e1', blade: '#4dd0e1', glow: '#00e5ff' },
    orange: { main: '#ff9800', dark: '#e65100', light: '#ffb74d', blade: '#ffb74d', glow: '#ff9800' },
    black: { main: '#37474f', dark: '#1a1a2e', light: '#607d8b', blade: '#78909c', glow: '#546e7a' },
    white: { main: '#eceff1', dark: '#b0bec5', light: '#ffffff', blade: '#ffffff', glow: '#eceff1' }
};

export class PlayerRenderer {
    constructor() {
        this.armorColor = 'default';
    }

    /**
     * 設定盔甲顏色
     * @param {string} color - 顏色名稱
     */
    setArmorColor(color) {
        this.armorColor = color;
    }

    /**
     * 取得目前盔甲顏色設定
     * @returns {object} 顏色設定
     */
    getColors() {
        return ARMOR_COLORS[this.armorColor] || ARMOR_COLORS.default;
    }

    /**
     * 繪製玩家角色
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 玩家核心屬性
     * @param {object} combat - 玩家戰鬥屬性
     * @returns {void}
     */
    draw(ctx, core, combat) {
        ctx.save();

        if (core.flashTime > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(core.flashTime * 50) * 0.5;
        }

        this.drawAttackRange(ctx, core);

        if (core.magnetTimer > 0) {
            ctx.save();
            const t = (Date.now() / 1000) % 1;
            const radius = 20 + t * 60;
            const alpha = (1 - t) * 0.4;

            ctx.beginPath();
            ctx.arc(core.x, core.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(52, 152, 219, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(core.x, core.y, 25, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(52, 152, 219, 0.08)';
            ctx.fill();
            ctx.restore();
        }

        ctx.translate(core.x, core.y);
        ctx.rotate(-core.facingAngle);
        ctx.translate(-core.x, -core.y);

        this.drawBody(ctx, core);
        this.drawShoulderPads(ctx, core);
        this.drawArms(ctx, core, combat);
        this.drawHelmet(ctx, core);
        this.drawSword(ctx, core, combat);

        ctx.restore();
    }

    /**
     * 繪製攻擊範圍指示器
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} core
     */
    drawAttackRange(ctx, core) {
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.baseAttackRange, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (core.attackRange > core.baseAttackRange) {
            ctx.beginPath();
            ctx.arc(core.x, core.y, core.attackRange, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(46, 204, 113, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            const extraRange = core.attackRange - core.baseAttackRange;
            ctx.beginPath();
            ctx.arc(core.x, core.y, core.baseAttackRange + extraRange / 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(46, 204, 113, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    /**
     * 繪製頭盔 — 帶面罩反射與裝飾
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} core
     */
    drawHelmet(ctx, core) {
        const r = core.radius * 0.95;
        const colors = this.getColors();

        // 頭盔本體
        ctx.beginPath();
        ctx.arc(core.x, core.y - 4, r, 0, Math.PI * 2);
        const helmGrad = ctx.createRadialGradient(
            core.x - 4, core.y - 10, 0,
            core.x, core.y - 4, r
        );
        helmGrad.addColorStop(0, colors.light);
        helmGrad.addColorStop(0.3, colors.main);
        helmGrad.addColorStop(0.7, colors.dark);
        helmGrad.addColorStop(1, '#37474f');
        ctx.fillStyle = helmGrad;
        ctx.fill();
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 頭盔高光
        ctx.beginPath();
        ctx.arc(core.x - 3, core.y - 10, r * 0.45, 0, Math.PI * 2);
        const highlight = ctx.createRadialGradient(
            core.x - 3, core.y - 10, 0,
            core.x - 3, core.y - 10, r * 0.45
        );
        highlight.addColorStop(0, 'rgba(255,255,255,0.35)');
        highlight.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = highlight;
        ctx.fill();

        // 頂部尖角
        ctx.beginPath();
        ctx.moveTo(core.x - r * 0.25, core.y - r * 0.85);
        ctx.lineTo(core.x, core.y - r * 1.45);
        ctx.lineTo(core.x + r * 0.25, core.y - r * 0.85);
        ctx.closePath();
        const hornGrad = ctx.createLinearGradient(core.x, core.y - r * 1.45, core.x, core.y - r * 0.85);
        hornGrad.addColorStop(0, colors.main);
        hornGrad.addColorStop(1, colors.dark);
        ctx.fillStyle = hornGrad;
        ctx.fill();
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 面罩 V 形
        ctx.beginPath();
        ctx.moveTo(core.x - r * 0.55, core.y - 8);
        ctx.lineTo(core.x - r * 0.15, core.y + 4);
        ctx.lineTo(core.x + r * 0.15, core.y + 4);
        ctx.lineTo(core.x + r * 0.55, core.y - 8);
        ctx.closePath();
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 眼睛 — 發光紅眼
        ctx.save();
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(core.x - r * 0.28, core.y - 4, 2.5, 0, Math.PI * 2);
        ctx.arc(core.x + r * 0.28, core.y - 4, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff5252';
        ctx.fill();
        ctx.restore();

        // 面罩通氣孔
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.arc(core.x + i * 5, core.y + 2, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = '#263238';
            ctx.fill();
        }

        // 頭盔底部邊緣
        ctx.beginPath();
        ctx.arc(core.x, core.y - 4, r, Math.PI * 0.8, Math.PI * 0.2, true);
        ctx.strokeStyle = '#455a64';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    /**
     * 繪製身體 — 盔甲胸板
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} core
     */
    drawBody(ctx, core) {
        const bw = core.radius * 1.0;
        const bh = core.radius * 1.3;

        // 身體陰影
        ctx.beginPath();
        ctx.ellipse(core.x, core.y + 10, bw + 2, bh + 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fill();

        // 身體本體
        ctx.beginPath();
        ctx.ellipse(core.x, core.y + 8, bw, bh, 0, 0, Math.PI * 2);
        const colors = this.getColors();
        const bodyGrad = ctx.createLinearGradient(core.x - bw, core.y, core.x + bw, core.y);
        bodyGrad.addColorStop(0, colors.dark);
        bodyGrad.addColorStop(0.3, colors.main);
        bodyGrad.addColorStop(0.5, colors.light);
        bodyGrad.addColorStop(0.7, colors.main);
        bodyGrad.addColorStop(1, colors.dark);
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 胸甲中線
        ctx.beginPath();
        ctx.moveTo(core.x, core.y - 2);
        ctx.lineTo(core.x, core.y + bh + 4);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 胸甲水平線
        ctx.beginPath();
        ctx.moveTo(core.x - bw * 0.7, core.y + 4);
        ctx.lineTo(core.x + bw * 0.7, core.y + 4);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 腰帶
        ctx.beginPath();
        ctx.rect(core.x - bw * 0.85, core.y + bh * 0.6, bw * 1.7, 4);
        ctx.fillStyle = '#5d4037';
        ctx.fill();
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 腰帶扣
        ctx.beginPath();
        ctx.arc(core.x, core.y + bh * 0.6 + 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#f39c12';
        ctx.fill();
    }

    /**
     * 繪製肩甲
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} core
     */
    drawShoulderPads(ctx, core) {
        const colors = this.getColors();
        const side = [-1, 1];
        for (const s of side) {
            const sx = core.x + s * core.radius * 1.15;
            const sy = core.y + 2;

            // 肩甲陰影
            ctx.beginPath();
            ctx.ellipse(sx + 1, sy + 1, core.radius * 0.55, core.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.fill();

            // 肩甲本體
            ctx.beginPath();
            ctx.ellipse(sx, sy, core.radius * 0.55, core.radius * 0.4, 0, 0, Math.PI * 2);
            const spGrad = ctx.createRadialGradient(sx - 2, sy - 3, 0, sx, sy, core.radius * 0.55);
            spGrad.addColorStop(0, colors.light);
            spGrad.addColorStop(0.5, colors.main);
            spGrad.addColorStop(1, colors.dark);
            ctx.fillStyle = spGrad;
            ctx.fill();
            ctx.strokeStyle = '#263238';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 肩甲高光
            ctx.beginPath();
            ctx.ellipse(sx - s * 2, sy - 3, core.radius * 0.2, core.radius * 0.12, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fill();
        }
    }

    /**
     * 繪製手臂
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} core
     * @param {object} combat
     */
    drawArms(ctx, core, combat) {
        const attacking = combat.attackAnimationTime > 0;

        // 左手臂
        ctx.beginPath();
        ctx.moveTo(core.x - core.radius * 0.9, core.y + 4);
        ctx.lineTo(core.x - core.radius * 1.35, core.y + 18);
        ctx.strokeStyle = '#607d8b';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 右手臂 (持劍側)
        if (!attacking) {
            ctx.beginPath();
            ctx.moveTo(core.x + core.radius * 0.9, core.y + 4);
            ctx.lineTo(core.x + core.radius * 1.35, core.y + 18);
            ctx.strokeStyle = '#607d8b';
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    /**
     * 繪製劍 — 含劍身光效與握把
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} core
     * @param {object} combat
     */
    drawSword(ctx, core, combat) {
        const colors = this.getColors();
        const swordBaseAngle = -Math.PI / 4;
        const swordSwingRange = Math.PI / 2;
        let currentSwordAngle = swordBaseAngle;

        if (combat.attackAnimationTime > 0) {
            const progress = combat.attackAnimationTime / combat.attackDuration;
            currentSwordAngle = swordBaseAngle + (1 - progress) * swordSwingRange;

            // 揮砍弧線（使用劍色光效）
            ctx.beginPath();
            ctx.arc(
                core.x + core.radius * 1.8,
                core.y,
                core.radius * 2.5,
                currentSwordAngle - 0.3,
                currentSwordAngle + 0.3
            );
            ctx.strokeStyle = `rgba(${this._hexToRgb(colors.glow)}, 0.5)`;
            ctx.lineWidth = 4;
            ctx.stroke();

            // 弧線外層光暈
            ctx.beginPath();
            ctx.arc(
                core.x + core.radius * 1.8,
                core.y,
                core.radius * 2.5,
                currentSwordAngle - 0.4,
                currentSwordAngle + 0.4
            );
            ctx.strokeStyle = `rgba(${this._hexToRgb(colors.glow)}, 0.15)`;
            ctx.lineWidth = 8;
            ctx.stroke();
        }

        ctx.save();
        ctx.translate(core.x + core.radius * 1.3, core.y + 10);
        ctx.rotate(currentSwordAngle);

        const bladeLen = core.radius * 2.8;

        // 劍身（使用盔甲配色）
        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.lineTo(-1, -bladeLen);
        ctx.lineTo(0, -bladeLen - 5);
        ctx.lineTo(4, -bladeLen);
        ctx.lineTo(5, 0);
        ctx.closePath();
        const swordGrad = ctx.createLinearGradient(-2, 0, 4, 0);
        swordGrad.addColorStop(0, colors.dark);
        swordGrad.addColorStop(0.3, colors.light);
        swordGrad.addColorStop(0.5, '#ffffff');
        swordGrad.addColorStop(0.7, colors.light);
        swordGrad.addColorStop(1, colors.dark);
        ctx.fillStyle = swordGrad;
        ctx.fill();
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 劍身中線
        ctx.beginPath();
        ctx.moveTo(1.5, -5);
        ctx.lineTo(1.5, -bladeLen + 5);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 劍格
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(9, 0);
        ctx.lineTo(9, 4);
        ctx.lineTo(-6, 4);
        ctx.closePath();
        const guardGrad = ctx.createLinearGradient(-6, 0, 9, 0);
        guardGrad.addColorStop(0, '#f39c12');
        guardGrad.addColorStop(0.5, '#f1c40f');
        guardGrad.addColorStop(1, '#e67e22');
        ctx.fillStyle = guardGrad;
        ctx.fill();
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 劍柄
        ctx.beginPath();
        ctx.rect(-1, 4, 5, 8);
        ctx.fillStyle = '#5d4037';
        ctx.fill();

        // 劍柄纏繞
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-1, 5 + i * 3);
            ctx.lineTo(4, 6 + i * 3);
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // 劍尖發光（攻擊時，使用劍色）
        if (combat.attackAnimationTime > 0) {
            ctx.save();
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(1.5, -bladeLen - 5, 3, 0, Math.PI * 2);
            ctx.fillStyle = colors.glow;
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    /**
     * 將 hex 色碼轉為 RGB 字串
     * @param {string} hex - 色碼 (如 '#ff0000')
     * @returns {string} RGB 字串 (如 '255,0,0')
     */
    _hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    }
}
