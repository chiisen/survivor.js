// @ts-check

// BOSS 隨機造型主題
const BOSS_THEMES = [
    { name: '暗紅魔王', body: ['#e74c3c', '#c0392b', '#922b21', '#5a1a14'], aura: [180, 30, 20], crown: ['#ffd700', '#daa520', '#b8860b'], eye: '#ff2200', glow: [255, 100, 50], rage: '#e74c3c' },
    { name: '暗紫亡靈', body: ['#9b59b6', '#7d3c98', '#5b2c6f', '#2c1338'], aura: [120, 40, 160], crown: ['#d4ac0d', '#b7950b', '#7d6608'], eye: '#bb8fce', glow: [180, 80, 220], rage: '#8e44ad' },
    { name: '暗綠毒龍', body: ['#27ae60', '#1e8449', '#145a32', '#0b2e1a'], aura: [30, 140, 60], crown: ['#f39c12', '#d68910', '#b9770e'], eye: '#58d68d', glow: [50, 200, 100], rage: '#2ecc71' },
    { name: '暗金龍王', body: ['#f1c40f', '#d4ac0d', '#9a7d0a', '#5d4e0a'], aura: [200, 170, 20], crown: ['#e74c3c', '#c0392b', '#922b21'], eye: '#ff4444', glow: [255, 200, 50], rage: '#f39c12' },
    { name: '暗藍深淵', body: ['#2980b9', '#1f6fa5', '#154360', '#0a2342'], aura: [30, 100, 180], crown: ['#1abc9c', '#16a085', '#0e6655'], eye: '#5dade2', glow: [50, 150, 255], rage: '#3498db' },
    { name: '暗黑虛空', body: ['#37474f', '#263238', '#1a1a2e', '#0d0d1a'], aura: [60, 60, 80], crown: ['#e74c3c', '#ff4444', '#ff6666'], eye: '#ff0044', glow: [200, 50, 80], rage: '#c0392b' }
];

// 精英怪隨機造型主題
const ELITE_THEMES = [
    { name: '金甲戰士', body: ['#f39c12', '#e67e22', '#d35400'], ring: '#f1c40f', shield: '#3498db', glow: [241, 196, 15], accent: '#fff' },
    { name: '碧綠守護', body: ['#2ecc71', '#27ae60', '#1e8449'], ring: '#2ecc71', shield: '#1abc9c', glow: [46, 204, 113], accent: '#a3e4d7' },
    { name: '深藍術士', body: ['#3498db', '#2980b9', '#1f6fa5'], ring: '#3498db', shield: '#9b59b6', glow: [52, 152, 219], accent: '#d6eaf8' },
    { name: '暗紫刺客', body: ['#9b59b6', '#8e44ad', '#6c3483'], ring: '#9b59b6', shield: '#e74c3c', glow: [155, 89, 182], accent: '#d2b4de' },
    { name: '赤紅狂戰', body: ['#e74c3c', '#c0392b', '#922b21'], ring: '#e74c3c', shield: '#f39c12', glow: [231, 76, 60], accent: '#fadbd8' },
    { name: '銀白騎士', body: ['#ecf0f1', '#bdc3c7', '#95a5a6'], ring: '#ecf0f1', shield: '#bdc3c7', glow: [236, 240, 241], accent: '#ffffff' }
];

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
        this.bossTheme = null;
    }

    /**
     * 取得敵人類型識別碼（優先 key，其次 name）
     * @returns {string} 類型識別碼
     */
    getTypeId() {
        return this.type.key || this.type.name;
    }

    /**
     * 設定 Boss 隨機造型主題
     * @param {object} theme - BOSS 主題物件
     * @returns {void}
     */
    setBossTheme(theme) {
        this.bossTheme = theme;
    }

    /**
     * 取得目前 BOSS 主題（若無則回傳預設暗紅）
     * @returns {object} BOSS 主題
     */
    getBossTheme() {
        return this.bossTheme || BOSS_THEMES[0];
    }

    /**
     * 隨機選取一個 BOSS 造型主題
     * @returns {object} 隨機主題
     */
    static randomBossTheme() {
        return BOSS_THEMES[Math.floor(Math.random() * BOSS_THEMES.length)];
    }

    /**
     * 依索引取得 BOSS 造型主題
     * @param {number} index - 主題索引
     * @returns {object} 主題物件
     */
    static getBossTheme(index) {
        return BOSS_THEMES[index] || BOSS_THEMES[0];
    }

    /**
     * 取得所有 BOSS 主題名稱（供 UI 顯示）
     * @returns {string[]} 主題名稱陣列
     */
    static getBossThemeNames() {
        return BOSS_THEMES.map(t => t.name);
    }

    /**
     * 設定精英怪隨機造型主題
     * @param {object} theme - 精英主題物件
     * @returns {void}
     */
    setEliteTheme(theme) {
        this.eliteTheme = theme;
    }

    /**
     * 取得目前精英主題（若無則回傳預設金甲）
     * @returns {object} 精英主題
     */
    getEliteTheme() {
        return this.eliteTheme || ELITE_THEMES[0];
    }

    /**
     * 隨機選取一個精英怪造型主題
     * @returns {object} 隨機主題
     */
    static randomEliteTheme() {
        return ELITE_THEMES[Math.floor(Math.random() * ELITE_THEMES.length)];
    }

    /**
     * 依索引取得精英怪造型主題
     * @param {number} index - 主題索引
     * @returns {object} 主題物件
     */
    static getEliteTheme(index) {
        return ELITE_THEMES[index] || ELITE_THEMES[0];
    }

    /**
     * 取得所有精英主題名稱（供 UI 顯示）
     * @returns {string[]} 主題名稱陣列
     */
    static getEliteThemeNames() {
        return ELITE_THEMES.map(t => t.name);
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
        
        if (this.getTypeId() === 'splitter') {
            this.drawSplitterDecoration(ctx, core);
        }

        if (this.getTypeId() === 'explosive') {
            this.drawExplosiveDecoration(ctx, core);
        }

        if (this.getTypeId() === 'tank') {
            this.drawTankDecoration(ctx, core);
        }

        if (this.getTypeId() === 'fast') {
            this.drawFastDecoration(ctx, core);
        }

        if (this.getTypeId() === 'ranged') {
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
        const th = this.getBossTheme();
        const [ar, ag, ab] = th.aura;

        // 旋轉能量環（非狂怒時也有的常駐裝飾）
        if (!rageMode) {
            ctx.save();
            ctx.translate(core.x, core.y);
            ctx.rotate(t * 0.5);
            ctx.beginPath();
            ctx.ellipse(0, 0, core.radius + 12, core.radius + 6, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, ${0.15 + Math.sin(t * 2) * 0.1})`;
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
        const th = this.getBossTheme();
        const [gr, gg, gb] = th.glow;

        // 脈動能量環（使用主題色）
        for (let ring = 0; ring < 3; ring++) {
            const ringRadius = radius + 18 + ring * 8;
            const ringAlpha = (0.4 - ring * 0.1) * (Math.sin(t * 4 + ring) * 0.3 + 0.7);
            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${gr}, ${gg}, ${gb}, ${ringAlpha})`;
            ctx.lineWidth = 3 - ring;
            ctx.stroke();
        }

        // 外層火焰粒子（12顆）
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i + t * 2;
            const dist = radius + 15 + Math.sin(t * 6 + i * 1.5) * 8;
            const fx = x + Math.cos(angle) * dist;
            const fy = y + Math.sin(angle) * dist;
            const fSize = 3 + Math.sin(t * 8 + i * 2) * 2;

            const flameGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fSize * 2);
            flameGrad.addColorStop(0, `rgba(${Math.min(255, gr + 55)}, ${Math.min(255, gg + 100)}, ${Math.min(255, gb + 50)}, 0.9)`);
            flameGrad.addColorStop(0.4, `rgba(${gr}, ${gg}, ${gb}, 0.7)`);
            flameGrad.addColorStop(1, `rgba(${gr * 0.6 | 0}, ${gg * 0.3 | 0}, ${gb * 0.2 | 0}, 0)`);
            ctx.beginPath();
            ctx.arc(fx, fy, fSize * 2, 0, Math.PI * 2);
            ctx.fillStyle = flameGrad;
            ctx.fill();
        }

        // 內層小火焰（8顆）
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + t * 3;
            const dist = radius + 8 + Math.sin(t * 10 + i) * 3;
            const fx = x + Math.cos(angle) * dist;
            const fy = y + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = th.crown[0];
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
        const th = this.getBossTheme();
        const crownY = y - radius - 5;
        const crownW = radius * 0.5;
        const spikeH = radius * 0.35;
        const [c0, c1, c2] = th.crown;

        // 皇冠底座光暈
        const glowPulse = Math.sin(t * 4) * 0.2 + 0.8;
        ctx.beginPath();
        ctx.ellipse(x, crownY + 5, crownW + 10, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${parseInt(c0.slice(1, 3), 16)}, ${parseInt(c0.slice(3, 5), 16)}, ${parseInt(c0.slice(5, 7), 16)}, ${0.15 * glowPulse})`;
        ctx.fill();

        // 皇冠主體（五尖刺）
        ctx.beginPath();
        const baseY = crownY + 8;
        const tipY = crownY - spikeH;
        ctx.moveTo(x - crownW - 8, baseY);
        ctx.lineTo(x - crownW, tipY + 8);
        ctx.lineTo(x - crownW * 0.5, baseY - 2);
        ctx.lineTo(x - crownW * 0.3, tipY);
        ctx.lineTo(x, baseY - 5);
        ctx.lineTo(x + crownW * 0.3, tipY);
        ctx.lineTo(x + crownW * 0.5, baseY - 2);
        ctx.lineTo(x + crownW, tipY + 8);
        ctx.lineTo(x + crownW + 8, baseY);
        ctx.closePath();

        // 皇冠漸層
        const crownGrad = ctx.createLinearGradient(x, tipY, x, baseY);
        if (rageMode) {
            crownGrad.addColorStop(0, th.rage);
            crownGrad.addColorStop(0.5, th.body[1]);
            crownGrad.addColorStop(1, th.body[2]);
        } else {
            crownGrad.addColorStop(0, c0);
            crownGrad.addColorStop(0.5, c1);
            crownGrad.addColorStop(1, c2);
        }
        ctx.fillStyle = crownGrad;
        ctx.fill();
        ctx.strokeStyle = rageMode ? th.body[2] : c2;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 皇冠寶石（三顆，使用主題色）
        const jewelColors = rageMode
            ? [th.rage, c0, th.rage]
            : [th.body[0], th.eye, c0];
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
            ctx.fillStyle = rageMode ? th.rage : c0;
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
        const th = this.getEliteTheme();
        const t = Date.now() / 1000;
        const { x, y, radius } = core;
        const [gr, gg, gb] = th.glow;

        // 外層脈衝光暈
        const pulse = Math.sin(t * 3) * 0.15 + 0.85;
        const auraGrad = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.5);
        auraGrad.addColorStop(0, `rgba(${gr}, ${gg}, ${gb}, ${0.25 * pulse})`);
        auraGrad.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // 雙層裝飾環
        ctx.beginPath();
        ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = th.ring;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${gr}, ${gg}, ${gb}, ${0.4 + Math.sin(t * 4) * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 旋轉能量節點（6 顆）
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i + t * 2;
            const dx = x + Math.cos(angle) * (radius + 8);
            const dy = y + Math.sin(angle) * (radius + 8);
            const nodeGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, 4);
            nodeGrad.addColorStop(0, `rgba(${gr}, ${gg}, ${gb}, 0.9)`);
            nodeGrad.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
            ctx.beginPath();
            ctx.arc(dx, dy, 4, 0, Math.PI * 2);
            ctx.fillStyle = nodeGrad;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(dx, dy, 2, 0, Math.PI * 2);
            ctx.fillStyle = th.ring;
            ctx.fill();
        }

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
        const th = this.getEliteTheme();
        const { x, y, radius } = core;
        const t = Date.now() / 1000;
        const sr = parseInt(th.shield.slice(1, 3), 16);
        const sg = parseInt(th.shield.slice(3, 5), 16);
        const sb = parseInt(th.shield.slice(5, 7), 16);
        const shieldPct = core.shieldHp / core.shieldMaxHp;

        // 護盾脈動光暈
        const pulse = Math.sin(t * 4) * 0.1 + 0.9;
        const auraGrad = ctx.createRadialGradient(x, y, radius + 10, x, y, radius + 28);
        auraGrad.addColorStop(0, `rgba(${sr}, ${sg}, ${sb}, ${0.15 * pulse})`);
        auraGrad.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, radius + 28, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // 護盾本體
        const shieldAlpha = 0.3 + shieldPct * 0.35;
        ctx.beginPath();
        ctx.arc(x, y, radius + 16, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${shieldAlpha * pulse})`;
        ctx.fill();
        ctx.strokeStyle = th.shield;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 護盾高光
        ctx.beginPath();
        ctx.arc(x, y, radius + 16, -Math.PI * 0.7, -Math.PI * 0.1);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * pulse})`;
        ctx.lineWidth = 2;
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
        const th = this.getEliteTheme();
        const { x, y, radius } = core;
        const barWidth = radius * 1.5;
        const barHeight = 5;
        const barY = y - radius - 20;
        const barX = x - barWidth / 2;
        const shieldPct = core.shieldHp / core.shieldMaxHp;

        // 外框
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // 背景
        ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 護盾量漸層
        const barGrad = ctx.createLinearGradient(barX, barY, barX + barWidth * shieldPct, barY);
        barGrad.addColorStop(0, th.shield);
        barGrad.addColorStop(1, th.accent);
        ctx.fillStyle = barGrad;
        ctx.fillRect(barX, barY, barWidth * shieldPct, barHeight);

        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(barX, barY, barWidth * shieldPct, barHeight * 0.4);

        // 邊框
        ctx.strokeStyle = th.shield;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
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
        const { x, y, radius } = core;
        const bowX = x + radius * 0.9;
        const bowY = y;
        const bowH = radius * 1.2;

        // 弓臂（弧形）
        ctx.beginPath();
        ctx.arc(bowX, bowY, bowH, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 弓臂內側（較淺色）
        ctx.beginPath();
        ctx.arc(bowX, bowY, bowH - 2, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 弓弦（上下兩段）
        const stringTop = bowY - bowH * Math.cos(Math.PI * 0.4);
        const stringBot = bowY + bowH * Math.cos(Math.PI * 0.4);
        const stringX = bowX + bowH * Math.sin(Math.PI * 0.4);

        ctx.beginPath();
        ctx.moveTo(stringX, stringTop);
        ctx.lineTo(bowX - bowH * 0.1, bowY);
        ctx.lineTo(stringX, stringBot);
        ctx.strokeStyle = '#bcaaa4';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 箭桿（搭在弦上，指向右方）
        const arrowLen = radius * 1.8;
        const arrowTipX = bowX + arrowLen * 0.3;
        const arrowTipY = bowY;
        const arrowTailX = bowX + arrowLen * 0.3 - arrowLen;
        const arrowTailY = bowY;

        ctx.beginPath();
        ctx.moveTo(arrowTailX, arrowTailY);
        ctx.lineTo(arrowTipX, arrowTipY);
        ctx.strokeStyle = '#795548';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 箭頭（三角形，指向右）
        ctx.beginPath();
        ctx.moveTo(arrowTipX + 6, arrowTipY);
        ctx.lineTo(arrowTipX - 2, arrowTipY - 4);
        ctx.lineTo(arrowTipX - 2, arrowTipY + 4);
        ctx.closePath();
        ctx.fillStyle = '#90a4ae';
        ctx.fill();
        ctx.strokeStyle = '#546e7a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 箭羽（末端三片，指向左）
        const featherX = arrowTailX;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(featherX, arrowTailY);
            ctx.lineTo(featherX - 8, arrowTailY + i * 5);
            ctx.strokeStyle = i === 0 ? '#e74c3c' : '#ecf0f1';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // 弓身裝飾寶石
        ctx.beginPath();
        ctx.arc(bowX + bowH * 0.3, bowY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();
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
        if (this.type.isElite) {
            this.drawEliteBody(ctx, core);
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
     * 繪製精英怪身體（漸層 + 內發光 + 外框）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawEliteBody(ctx, core) {
        const { x, y, radius } = core;
        const th = this.getEliteTheme();
        const [b0, b1, b2] = th.body;
        const [gr, gg, gb] = th.glow;

        // 外層光暈
        const auraGrad = ctx.createRadialGradient(x, y, radius * 0.7, x, y, radius * 1.3);
        auraGrad.addColorStop(0, `rgba(${gr}, ${gg}, ${gb}, 0.15)`);
        auraGrad.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // 主體漸層
        const bodyGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
        bodyGrad.addColorStop(0, b0);
        bodyGrad.addColorStop(0.5, b1);
        bodyGrad.addColorStop(1, b2);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // 內層發光
        const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.5);
        coreGrad.addColorStop(0, `rgba(${gr}, ${gg}, ${gb}, 0.2)`);
        coreGrad.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // 外框
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = b2;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 外框高光
        ctx.beginPath();
        ctx.arc(x, y, radius, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.strokeStyle = `rgba(${gr}, ${gg}, ${gb}, 0.4)`;
        ctx.lineWidth = 1.5;
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
        const th = this.getBossTheme();

        // 外層脈衝光暈
        const pulse = Math.sin(t * 3) * 0.15 + 0.85;
        const [ar, ag, ab] = th.aura;
        const auraGrad = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.6);
        auraGrad.addColorStop(0, `rgba(${ar}, ${ag}, ${ab}, ${0.3 * pulse})`);
        auraGrad.addColorStop(0.5, `rgba(${ar * 0.6 | 0}, ${ag * 0.3 | 0}, ${ab * 0.3 | 0}, ${0.15 * pulse})`);
        auraGrad.addColorStop(1, `rgba(${ar * 0.3 | 0}, 0, ${ab * 0.2 | 0}, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // 主體漸層（4 色，模擬 3D 球體）
        const [b0, b1, b2, b3] = th.body;
        const bodyGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
        bodyGrad.addColorStop(0, b0);
        bodyGrad.addColorStop(0.3, b1);
        bodyGrad.addColorStop(0.7, b2);
        bodyGrad.addColorStop(1, b3);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // 內層發光核心
        const [gr, gg, gb] = th.glow;
        const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.5);
        coreGrad.addColorStop(0, `rgba(${gr}, ${gg}, ${gb}, 0.25)`);
        coreGrad.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // 外框
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = b3;
        ctx.lineWidth = 4;
        ctx.stroke();

        // 外框高光
        ctx.beginPath();
        ctx.arc(x, y, radius, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.strokeStyle = `rgba(${gr}, ${gg}, ${gb}, 0.4)`;
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
        if (this.type.isElite) {
            this.drawEliteEyes(ctx, core);
            return;
        }
        ctx.beginPath();
        ctx.arc(core.x - core.radius * 0.3, core.y - core.radius * 0.2, core.radius * 0.2, 0, Math.PI * 2);
        ctx.arc(core.x + core.radius * 0.3, core.y - core.radius * 0.2, core.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = this.eyeColor;
        ctx.fill();
    }

    /**
     * 繪製精英怪眼睛（發光瞳孔 + 眼窩）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawEliteEyes(ctx, core) {
        const { x, y, radius } = core;
        const th = this.getEliteTheme();
        const eyeSpacing = radius * 0.3;
        const eyeY = y - radius * 0.15;
        const eyeRadius = radius * 0.18;

        // 眼窩
        [-1, 1].forEach(dir => {
            const ex = x + dir * eyeSpacing;
            ctx.beginPath();
            ctx.ellipse(ex, eyeY, eyeRadius * 1.3, eyeRadius * 1.1, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fill();
        });

        // 眼白
        [-1, 1].forEach(dir => {
            const ex = x + dir * eyeSpacing;
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#f5e6c8';
            ctx.fill();
        });

        // 瞳孔（主題色）
        [-1, 1].forEach(dir => {
            const ex = x + dir * eyeSpacing;

            // 瞳孔外發光
            const pupilGlow = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, eyeRadius * 0.7);
            pupilGlow.addColorStop(0, `rgba(${th.glow[0]}, ${th.glow[1]}, ${th.glow[2]}, 0.4)`);
            pupilGlow.addColorStop(1, `rgba(${th.glow[0]}, ${th.glow[1]}, ${th.glow[2]}, 0)`);
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = pupilGlow;
            ctx.fill();

            // 瞳孔本體
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = th.ring;
            ctx.fill();

            // 瞳孔核心
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0a0a';
            ctx.fill();

            // 高光
            ctx.beginPath();
            ctx.arc(ex - eyeRadius * 0.15, eyeY - eyeRadius * 0.15, eyeRadius * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        });

        // 怒眉
        [-1, 1].forEach(dir => {
            const ex = x + dir * eyeSpacing;
            ctx.beginPath();
            ctx.moveTo(ex - eyeRadius * 1.2, eyeY - eyeRadius * 1.8);
            ctx.lineTo(ex + eyeRadius * 0.8, eyeY - eyeRadius * 1.2);
            ctx.strokeStyle = th.body[2];
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();
        });
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
        const th = this.getBossTheme();
        const eyeSpacing = radius * 0.28;
        const eyeY = y - radius * 0.15;
        const eyeRadius = radius * 0.15;
        const [gr, gg, gb] = th.glow;

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

        // 瞳孔（主題色發光）
        const glowPulse = Math.sin(t * 5) * 0.3 + 0.7;
        [-1, 1].forEach(dir => {
            const ex = x + dir * eyeSpacing;

            // 瞳孔外發光
            const pupilGlow = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, eyeRadius * 0.8);
            pupilGlow.addColorStop(0, `rgba(${gr}, ${gg}, ${gb}, ${0.6 * glowPulse})`);
            pupilGlow.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = pupilGlow;
            ctx.fill();

            // 瞳孔本體
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = th.eye;
            ctx.fill();

            // 瞳孔核心（黑色）
            ctx.beginPath();
            ctx.arc(ex, eyeY, eyeRadius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0a0a';
            ctx.fill();

            // 高光
            ctx.beginPath();
            ctx.arc(ex - eyeRadius * 0.15, eyeY - eyeRadius * 0.15, eyeRadius * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        });

        // 眉毛（怒眉，使用主題暗色）
        [-1, 1].forEach(dir => {
            const ex = x + dir * eyeSpacing;
            ctx.beginPath();
            ctx.moveTo(ex - eyeRadius * 1.2, eyeY - eyeRadius * 1.8);
            ctx.lineTo(ex + eyeRadius * 0.8, eyeY - eyeRadius * 1.2);
            ctx.strokeStyle = th.body[2];
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();
        });
    }
    
    /**
     * 繪製精英怪嘴巴（鋸齒獠牙）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawEliteMouth(ctx, core) {
        const { x, y, radius } = core;
        const th = this.getEliteTheme();
        const mouthY = y + radius * 0.35;
        const mouthW = radius * 0.4;
        const mouthH = radius * 0.2;

        // 嘴巴內部
        ctx.beginPath();
        ctx.ellipse(x, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
        const mouthGrad = ctx.createRadialGradient(x, mouthY, 0, x, mouthY, mouthW);
        mouthGrad.addColorStop(0, th.body[2]);
        mouthGrad.addColorStop(1, '#1a0a0a');
        ctx.fillStyle = mouthGrad;
        ctx.fill();

        // 上排獠牙（3顆）
        for (let i = 0; i < 3; i++) {
            const fx = x - mouthW * 0.5 + (mouthW * 1 / 2) * i;
            ctx.beginPath();
            ctx.moveTo(fx - 3, mouthY - mouthH * 0.3);
            ctx.lineTo(fx, mouthY + mouthH * 0.5);
            ctx.lineTo(fx + 3, mouthY - mouthH * 0.3);
            ctx.closePath();
            ctx.fillStyle = th.accent;
            ctx.fill();
        }

        // 嘴巴邊框
        ctx.beginPath();
        ctx.ellipse(x, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
        ctx.strokeStyle = th.body[2];
        ctx.lineWidth = 2;
        ctx.stroke();
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
        if (this.mouthStyle === 'elite') {
            this.drawEliteMouth(ctx, core);
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