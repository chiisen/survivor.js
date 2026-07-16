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

            const t = Date.now() / 1000;
            const { x, y, radius } = core;

            // 外層旋轉虛線圈（3 層）
            for (let i = 0; i < 3; i++) {
                const ringRadius = radius + 6 + i * 5;
                const ringAlpha = 0.15 - i * 0.04;
                const rotation = t * (0.5 + i * 0.3) * (i % 2 === 0 ? 1 : -1);

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                ctx.beginPath();
                ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(52, 152, 219, ${ringAlpha})`;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([5, 7]);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }

            // 扭曲波紋（脈動擴散）
            for (let i = 0; i < 2; i++) {
                const ripplePhase = (t * 1.5 + i * 0.8) % 2;
                const rippleRadius = radius + 4 + ripplePhase * 10;
                const rippleAlpha = (1 - ripplePhase / 2) * 0.12;
                ctx.beginPath();
                ctx.arc(x, y, rippleRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(52, 152, 219, ${rippleAlpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
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
        
        const id = this.getTypeId();

        if (id === 'splitter' || id === '分裂') {
            this.drawSplitterDecoration(ctx, core);
        }

        if (id === 'explosive' || id === '爆炸') {
            this.drawExplosiveDecoration(ctx, core);
        }

        if (id === 'tank' || id === '坦克') {
            this.drawTankDecoration(ctx, core);
        }

        if (id === 'fast' || id === '快速') {
            this.drawFastDecoration(ctx, core);
        }

        if (id === 'ranged' || id === '遠程') {
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
     * 繪製分裂敵人裝飾（分裂核心 + 旋轉碎片）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawSplitterDecoration(ctx, core) {
        const { x, y, radius } = core;
        const t = Date.now() / 1000;

        // 裂痕紋路（從中心向外輻射）
        const cracks = [
            { angle: 0.3, len: 0.85, branches: 2 },
            { angle: 1.2, len: 0.7, branches: 1 },
            { angle: 2.1, len: 0.9, branches: 2 },
            { angle: 3.0, len: 0.6, branches: 1 },
            { angle: 3.8, len: 0.8, branches: 2 },
            { angle: 4.9, len: 0.65, branches: 1 },
            { angle: 5.5, len: 0.75, branches: 2 }
        ];

        cracks.forEach(crack => {
            const endX = x + Math.cos(crack.angle) * radius * crack.len;
            const endY = y + Math.sin(crack.angle) * radius * crack.len;

            // 主裂痕
            ctx.beginPath();
            ctx.moveTo(x, y);
            // 中間加一個折點讓裂痕更自然
            const midX = x + Math.cos(crack.angle + 0.15) * radius * crack.len * 0.5;
            const midY = y + Math.sin(crack.angle + 0.15) * radius * crack.len * 0.5;
            ctx.lineTo(midX, midY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = 'rgba(22, 160, 133, 0.6)';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // 分支裂痕
            for (let b = 0; b < crack.branches; b++) {
                const branchPos = 0.4 + b * 0.25;
                const branchX = x + Math.cos(crack.angle) * radius * crack.len * branchPos;
                const branchY = y + Math.sin(crack.angle) * radius * crack.len * branchPos;
                const branchAngle = crack.angle + (b % 2 === 0 ? 0.8 : -0.8);
                const branchLen = radius * 0.3;
                const branchEndX = branchX + Math.cos(branchAngle) * branchLen;
                const branchEndY = branchY + Math.sin(branchAngle) * branchLen;

                ctx.beginPath();
                ctx.moveTo(branchX, branchY);
                ctx.lineTo(branchEndX, branchEndY);
                ctx.strokeStyle = 'rgba(22, 160, 133, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        });

        // 中心裂縫核心（發光）
        const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.3);
        coreGrad.addColorStop(0, 'rgba(26, 188, 156, 0.6)');
        coreGrad.addColorStop(0.5, 'rgba(22, 160, 133, 0.3)');
        coreGrad.addColorStop(1, 'rgba(22, 160, 133, 0)');
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // 中心裂縫（十字形）
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.2, y);
        ctx.lineTo(x + radius * 0.2, y);
        ctx.moveTo(x, y - radius * 0.2);
        ctx.lineTo(x, y + radius * 0.2);
        ctx.strokeStyle = '#16a085';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 旋轉分裂碎片（4 片，沿裂痕末端）
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i + t * 1.5;
            const dist = radius * 0.75;
            const fx = x + Math.cos(angle) * dist;
            const fy = y + Math.sin(angle) * dist;

            const fragGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 4);
            fragGrad.addColorStop(0, 'rgba(26, 188, 156, 0.8)');
            fragGrad.addColorStop(1, 'rgba(26, 188, 156, 0)');
            ctx.beginPath();
            ctx.arc(fx, fy, 4, 0, Math.PI * 2);
            ctx.fillStyle = fragGrad;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(fx, fy, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#1abc9c';
            ctx.fill();
        }
    }
    
    /**
     * 繪製爆炸敵人裝飾（炸彈引信 + 脈動危險環）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawExplosiveDecoration(ctx, core) {
        const { x, y, radius } = core;
        const t = Date.now() / 1000;

        // 脈動危險環
        const pulse = Math.sin(t * 5) * 0.2 + 0.8;
        ctx.beginPath();
        ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(243, 156, 18, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 外層光暈
        const auraGrad = ctx.createRadialGradient(x, y, radius, x, y, radius * 1.4);
        auraGrad.addColorStop(0, `rgba(243, 156, 18, ${0.15 * pulse})`);
        auraGrad.addColorStop(1, 'rgba(243, 156, 18, 0)');
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // 引信路徑點（從頭頂到末端）
        const fuseStartX = x;
        const fuseStartY = y - radius;
        const fuseCtrl1X = x + radius * 0.3;
        const fuseCtrl1Y = y - radius * 1.3;
        const fuseCtrl2X = x - radius * 0.2;
        const fuseCtrl2Y = y - radius * 1.5;
        const fuseEndX = x + radius * 0.4;
        const fuseEndY = y - radius * 1.4;

        // 引信本體（粗麻繩紋理）
        ctx.beginPath();
        ctx.moveTo(fuseStartX, fuseStartY);
        ctx.bezierCurveTo(fuseCtrl1X, fuseCtrl1Y, fuseCtrl2X, fuseCtrl2Y, fuseEndX, fuseEndY);
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 引信內側亮線
        ctx.beginPath();
        ctx.moveTo(fuseStartX, fuseStartY);
        ctx.bezierCurveTo(fuseCtrl1X, fuseCtrl1Y - 1, fuseCtrl2X, fuseCtrl2Y - 1, fuseEndX, fuseEndY);
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 燃燒 ember（沿引信移動）
        const burnProgress = (t * 0.8) % 1;
        const burnT = burnProgress;
        // 三次貝塞爾曲線上的點
        const mt = 1 - burnT;
        const emberX = mt * mt * mt * fuseStartX + 3 * mt * mt * burnT * fuseCtrl1X + 3 * mt * burnT * burnT * fuseCtrl2X + burnT * burnT * burnT * fuseEndX;
        const emberY = mt * mt * mt * fuseStartY + 3 * mt * mt * burnT * fuseCtrl1Y + 3 * mt * burnT * burnT * fuseCtrl2Y + burnT * burnT * burnT * fuseEndY;

        // ember 外發光
        const emberGlow = ctx.createRadialGradient(emberX, emberY, 0, emberX, emberY, 8);
        emberGlow.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
        emberGlow.addColorStop(0.4, 'rgba(255, 120, 0, 0.5)');
        emberGlow.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.beginPath();
        ctx.arc(emberX, emberY, 8, 0, Math.PI * 2);
        ctx.fillStyle = emberGlow;
        ctx.fill();

        // ember 核心
        const emberPulse = Math.sin(t * 15) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(emberX, emberY, 3 * emberPulse, 0, Math.PI * 2);
        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(emberX, emberY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // 煙霧粒子（從 ember 位置飄出）
        for (let i = 0; i < 3; i++) {
            const smokeT = (t * 2 + i * 0.7) % 2;
            if (smokeT < 1) {
                const smokeX = emberX + Math.sin(t * 3 + i * 2) * 4;
                const smokeY = emberY - smokeT * 15;
                const smokeAlpha = (1 - smokeT) * 0.3;
                const smokeSize = 2 + smokeT * 3;
                ctx.beginPath();
                ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(150, 150, 150, ${smokeAlpha})`;
                ctx.fill();
            }
        }

        // 已燃燒過的引信痕跡（ ember 後方的暗色路徑）
        ctx.beginPath();
        ctx.moveTo(fuseStartX, fuseStartY);
        ctx.bezierCurveTo(
            fuseStartX + (fuseCtrl1X - fuseStartX) * burnProgress,
            fuseStartY + (fuseCtrl1Y - fuseStartY) * burnProgress,
            fuseStartX + (fuseCtrl2X - fuseStartX) * burnProgress,
            fuseStartY + (fuseCtrl2Y - fuseStartY) * burnProgress,
            emberX, emberY
        );
        ctx.strokeStyle = '#2c1810';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    /**
     * 繪製坦克敵人裝飾（裝甲板 + 鉚釘）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawTankDecoration(ctx, core) {
        const { x, y, radius } = core;
        const t = Date.now() / 1000;

        // 外層裝甲光暈
        const armorGrad = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.25);
        armorGrad.addColorStop(0, 'rgba(127, 140, 141, 0.15)');
        armorGrad.addColorStop(1, 'rgba(127, 140, 141, 0)');
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.25, 0, Math.PI * 2);
        ctx.fillStyle = armorGrad;
        ctx.fill();

        // 裝甲外環
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 鉚釘（8 顆均勻分佈）
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const rx = x + Math.cos(angle) * (radius + 3);
            const ry = y + Math.sin(angle) * (radius + 3);
            ctx.beginPath();
            ctx.arc(rx, ry, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#bdc3c7';
            ctx.fill();
            ctx.strokeStyle = '#95a5a6';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // 胸口裝甲板
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.5, y + radius * 0.3);
        ctx.lineTo(x + radius * 0.5, y + radius * 0.3);
        ctx.lineTo(x + radius * 0.3, y + radius * 0.7);
        ctx.lineTo(x - radius * 0.3, y + radius * 0.7);
        ctx.closePath();
        ctx.fillStyle = 'rgba(127, 140, 141, 0.25)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(127, 140, 141, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * 繪製快速敵人裝飾（速度線 + 尾焰）
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawFastDecoration(ctx, core) {
        const { x, y, radius } = core;
        const t = Date.now() / 1000;

        // 速度線（左右各 3 條）
        [-1, 1].forEach(dir => {
            for (let i = -1; i <= 1; i++) {
                const lineY = y + i * radius * 0.3;
                const lineLen = radius * 1.2 + Math.sin(t * 8 + i + dir) * radius * 0.3;
                const lineAlpha = 0.4 - Math.abs(i) * 0.1;

                ctx.beginPath();
                ctx.moveTo(x + dir * radius * 0.8, lineY);
                ctx.lineTo(x + dir * (radius * 0.8 + lineLen), lineY);
                ctx.strokeStyle = `rgba(46, 204, 113, ${lineAlpha})`;
                ctx.lineWidth = 2 - Math.abs(i) * 0.5;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        });

        // 頂部速度翼
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.4, y - radius * 0.6);
        ctx.lineTo(x, y - radius * 1.3);
        ctx.lineTo(x + radius * 0.4, y - radius * 0.6);
        ctx.closePath();
        const wingGrad = ctx.createLinearGradient(x, y - radius * 1.3, x, y - radius * 0.6);
        wingGrad.addColorStop(0, '#2ecc71');
        wingGrad.addColorStop(1, '#27ae60');
        ctx.fillStyle = wingGrad;
        ctx.fill();
        ctx.strokeStyle = '#1e8449';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 尾焰（左右各一）
        const flamePulse = Math.sin(t * 10) * 0.3 + 0.7;
        [-1, 1].forEach(dir => {
            const fx = x + dir * radius * 0.9;
            const flameGrad = ctx.createRadialGradient(fx, y, 0, fx, y, radius * 0.5);
            flameGrad.addColorStop(0, `rgba(46, 204, 113, ${0.4 * flamePulse})`);
            flameGrad.addColorStop(1, 'rgba(46, 204, 113, 0)');
            ctx.beginPath();
            ctx.arc(fx, y, radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = flameGrad;
            ctx.fill();
        });
    }
    
    /**
     * 繪製遠程敵人裝飾
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {object} core - 敵人核心屬性
     * @returns {void}
     */
    drawRangedDecoration(ctx, core) {
        const { x, y, radius } = core;
        const t = Date.now() / 1000;
        const barrelLen = radius * 1.6;
        const barrelH = radius * 0.2;

        // 中央機身（連接左右炮管）
        const bodyGrad = ctx.createLinearGradient(x, y - radius * 0.3, x, y + radius * 0.3);
        bodyGrad.addColorStop(0, '#757575');
        bodyGrad.addColorStop(0.5, '#9e9e9e');
        bodyGrad.addColorStop(1, '#616161');
        ctx.beginPath();
        ctx.ellipse(x, y, radius * 0.35, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 中央裝飾圓環
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.18, 0, Math.PI * 2);
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = '#263238';
        ctx.fill();

        // 左炮管
        this.drawBarrel(ctx, x - radius * 0.35, y, barrelLen, barrelH, t, -1);
        // 右炮管
        this.drawBarrel(ctx, x + radius * 0.35, y, barrelLen, barrelH, t, 1);
    }

    /**
     * 繪製單側炮管
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {number} baseX - 炮管根部 X
     * @param {number} baseY - 炮管根部 Y
     * @param {number} len - 炮管長度
     * @param {number} h - 炮管半高
     * @param {number} t - 時間
     * @param {number} dir - 方向（-1 左 / 1 右）
     * @returns {void}
     */
    drawBarrel(ctx, baseX, baseY, len, h, t, dir) {
        const tipX = baseX + len * dir;
        const tipY = baseY;

        // 炮管主體
        const barrelGrad = ctx.createLinearGradient(baseX, baseY - h, baseX, baseY + h);
        barrelGrad.addColorStop(0, '#757575');
        barrelGrad.addColorStop(0.3, '#9e9e9e');
        barrelGrad.addColorStop(0.5, '#bdbdbd');
        barrelGrad.addColorStop(0.7, '#9e9e9e');
        barrelGrad.addColorStop(1, '#616161');
        ctx.beginPath();
        ctx.rect(baseX, baseY - h * 0.5, len * dir, h);
        ctx.fillStyle = barrelGrad;
        ctx.fill();
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 炮口加粗
        const muzzleX = tipX - 4 * dir;
        ctx.beginPath();
        ctx.rect(muzzleX, baseY - h * 0.7, 8 * dir, h * 1.4);
        ctx.fillStyle = '#546e7a';
        ctx.fill();
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 炮口內部
        ctx.beginPath();
        ctx.arc(tipX, baseY, h * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();

        // 炮口火焰
        const firePulse = Math.sin(t * 8 + dir * 2) * 0.3 + 0.7;
        const fireGrad = ctx.createRadialGradient(tipX + 6 * dir, baseY, 0, tipX + 6 * dir, baseY, 5);
        fireGrad.addColorStop(0, `rgba(255, 200, 50, ${0.5 * firePulse})`);
        fireGrad.addColorStop(0.5, `rgba(255, 100, 0, ${0.25 * firePulse})`);
        fireGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.beginPath();
        ctx.arc(tipX + 6 * dir, baseY, 5, 0, Math.PI * 2);
        ctx.fillStyle = fireGrad;
        ctx.fill();

        // 散熱孔
        for (let i = 0; i < 2; i++) {
            const hx = baseX + (len * 0.3 + i * len * 0.25) * dir;
            ctx.beginPath();
            ctx.rect(hx, baseY - h * 0.5 - 2, 3 * dir, 3);
            ctx.fillStyle = '#37474f';
            ctx.fill();
        }
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

        const { x, y, radius } = core;
        const r = parseInt(this.color.slice(1, 3), 16);
        const g = parseInt(this.color.slice(3, 5), 16);
        const b = parseInt(this.color.slice(5, 7), 16);

        // 雙腳（身體下方）
        this.drawLegs(ctx, x, y, radius, this.color, this.strokeColor);

        // 外層微光暈
        const auraGrad = ctx.createRadialGradient(x, y, radius * 0.7, x, y, radius * 1.2);
        auraGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.12)`);
        auraGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // 主體漸層
        const bodyGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
        bodyGrad.addColorStop(0, this.color);
        bodyGrad.addColorStop(0.6, this.strokeColor);
        bodyGrad.addColorStop(1, this.darkenColor(this.strokeColor, 0.6));
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // 外框
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.darkenColor(this.strokeColor, 0.5);
        ctx.lineWidth = 2;
        ctx.stroke();

        // 外框高光
        ctx.beginPath();
        ctx.arc(x, y, radius, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.strokeStyle = `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)}, 0.35)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    /**
     * 繪製怪物雙腳
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {number} x - 中心 X
     * @param {number} y - 中心 Y
     * @param {number} radius - 半徑
     * @param {string} color - 主色
     * @param {string} strokeColor - 邊框色
     * @returns {void}
     */
    drawLegs(ctx, x, y, radius, color, strokeColor) {
        const legLen = radius * 0.6;
        const legW = radius * 0.25;
        const footW = radius * 0.35;
        const legTopY = y + radius * 0.85;
        const legBotY = y + radius * 0.85 + legLen;
        const darkColor = this.darkenColor(strokeColor, 0.7);

        [-1, 1].forEach(dir => {
            const legX = x + dir * radius * 0.3;

            // 腿部
            ctx.beginPath();
            ctx.moveTo(legX - legW * 0.5, legTopY);
            ctx.lineTo(legX + legW * 0.5, legTopY);
            ctx.lineTo(legX + legW * 0.4, legBotY);
            ctx.lineTo(legX - legW * 0.4, legBotY);
            ctx.closePath();
            const legGrad = ctx.createLinearGradient(legX - legW, legTopY, legX + legW, legTopY);
            legGrad.addColorStop(0, darkColor);
            legGrad.addColorStop(0.5, color);
            legGrad.addColorStop(1, darkColor);
            ctx.fillStyle = legGrad;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            // 腳掌
            ctx.beginPath();
            ctx.ellipse(legX, legBotY + 2, footW * 0.5, legW * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = darkColor;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    /**
     * 將顏色加深
     * @param {string} hex - 色碼
     * @param {number} factor - 加深比例 (0-1)
     * @returns {string} 加深後色碼
     */
    darkenColor(hex, factor) {
        const r = Math.floor(parseInt(hex.slice(1, 3), 16) * factor);
        const g = Math.floor(parseInt(hex.slice(3, 5), 16) * factor);
        const b = Math.floor(parseInt(hex.slice(5, 7), 16) * factor);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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

        // 雙腳
        this.drawLegs(ctx, x, y, radius, b0, b2);

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

        // 雙腳
        this.drawLegs(ctx, x, y, radius, th.body[0], th.body[2]);

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