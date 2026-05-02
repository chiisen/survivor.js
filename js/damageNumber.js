export class DamageNumber {
    constructor(x, y, value) {
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
        this.color = value >= 5 ? '#f39c12' : '#fff';
        this.fontSize = 16 + Math.min(value * 2, 20);
    }

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

    isFinished() {
        return this.time <= 0;
    }
}