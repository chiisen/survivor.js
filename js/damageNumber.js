// @ts-check

export class DamageNumber {
    /**
     * 建立傷害數字實例
     * @param {number} x - 顯示位置 X 座標
     * @param {number} y - 顯示位置 Y 座標
     * @param {number} value - 傷害數值
     * @param {string|null} color - 自訂顏色，null 則依傷害值自動判斷
     */
    constructor(x, y, value, color = null) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.startTime = performance.now();
        this.duration = 0.8;
        this.time = this.duration;
        this.alpha = 1;
        this.scale = 1;
        this.vy = -60;
        this.baseY = y;
        this.color = color || (value >= 5 ? '#f39c12' : '#fff');
        this.fontSize = 16 + Math.min(value * 2, 20);
    }

    /**
     * 更新傷害數字的透明度、縮放與位置（向上飄動）
     * @param {number} dt - 與上一幀的時間差（秒）
     */
    update(dt) {
        this.time -= dt;
        
        const progress = this.time / this.duration;
        this.alpha = Math.max(0, progress);
        
        if (this.time > this.duration * 0.6) {
            this.scale = 1 + (1 - progress) * 0.5;
        } else {
            this.scale = Math.max(0.8, progress * 1.3);
        }
        
        this.y = this.baseY - (1 - progress) * 40;
    }

    /**
     * 繪製傷害數字（含陰影與高傷害描邊）
     * @param {CanvasRenderingContext2D} ctx - Canvas 繪圖上下文
     */
    draw(ctx) {
        if (this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = `bold ${this.fontSize * this.scale}px 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(Math.floor(this.value), this.x + 2, this.y + 2);
        
        ctx.fillStyle = this.color;
        ctx.fillText(Math.floor(this.value), this.x, this.y);
        
        if (this.value >= 5) {
            ctx.strokeStyle = '#e67e22';
            ctx.lineWidth = 1;
            ctx.strokeText(Math.floor(this.value), this.x, this.y);
        }
        
        ctx.restore();
    }

    /**
     * 判斷傷害數字動畫是否已播放完畢
     * @returns {boolean} 是否已結束
     */
    isFinished() {
        return this.time <= 0;
    }
}