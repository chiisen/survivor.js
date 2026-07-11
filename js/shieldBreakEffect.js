// @ts-check
/**
 * 護盾破碎特效，用於顯示護盾破碎時的視覺效果
 */
export class ShieldBreakEffect {
    constructor() {
        /** @type {number} 特效 X 座標 */
        this.x = 0;
        /** @type {number} 特效 Y 座標 */
        this.y = 0;
        /** @type {number} 特效持續時間（秒） */
        this.duration = 0.8;
        /** @type {number} 剩餘時間（秒） */
        this.time = 0;
        /** @type {boolean} 是否活躍 */
        this.active = false;
        /** @type {Array<Object>} 碎片陣列 */
        this.shards = [];
        /** @type {number} 閃光透明度 */
        this.flashAlpha = 1;
        /** @type {number} 擴散環半徑 */
        this.ringExpanding = 0;
        
        for (let i = 0; i < 16; i++) {
            this.shards.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                rotation: 0,
                rotationSpeed: 0,
                size: 0,
                alpha: 1,
                color: '#3498db'
            });
        }
    }

    /**
     * 初始化護盾破碎特效
     * @param {number} x - 起始 X 座標
     * @param {number} y - 起始 Y 座標
     * @returns {void}
     */
    init(x, y) {
        this.x = x;
        this.y = y;
        this.time = this.duration;
        this.active = true;
        this.flashAlpha = 1;
        this.ringExpanding = 0;
        
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            const shardDistance = 18 + Math.random() * 5;
            const speed = 100 + Math.random() * 80;
            
            this.shards[i].x = x + Math.cos(angle) * shardDistance;
            this.shards[i].y = y + Math.sin(angle) * shardDistance;
            this.shards[i].vx = Math.cos(angle) * speed;
            this.shards[i].vy = Math.sin(angle) * speed;
            this.shards[i].rotation = Math.random() * Math.PI * 2;
            this.shards[i].rotationSpeed = (Math.random() - 0.5) * 10;
            this.shards[i].size = 8 + Math.random() * 6;
            this.shards[i].alpha = 1;
            this.shards[i].color = Math.random() > 0.5 ? '#3498db' : '#5dade2';
        }
    }

    /**
     * 重置護盾破碎特效
     * @returns {void}
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.time = 0;
        this.active = false;
        this.flashAlpha = 1;
        this.ringExpanding = 0;
        
        for (const shard of this.shards) {
            shard.x = 0;
            shard.y = 0;
            shard.vx = 0;
            shard.vy = 0;
            shard.rotation = 0;
            shard.rotationSpeed = 0;
            shard.size = 0;
            shard.alpha = 1;
        }
    }

    /**
     * 更新護盾破碎特效
     * @param {number} dt - 時間差（秒）
     * @returns {void}
     */
    update(dt) {
        this.time -= dt;
        
        this.flashAlpha = Math.max(0, this.time / this.duration);
        this.ringExpanding = (1 - this.time / this.duration) * 60;
        
        for (const shard of this.shards) {
            shard.x += shard.vx * dt;
            shard.y += shard.vy * dt;
            shard.vx *= 0.92;
            shard.vy *= 0.92;
            shard.rotation += shard.rotationSpeed * dt;
            shard.size *= 0.95;
            shard.alpha = Math.max(0, this.time / this.duration);
        }
    }

    /**
     * 繪製護盾破碎特效
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @returns {void}
     */
    draw(ctx) {
        ctx.save();
        
        if (this.ringExpanding > 0) {
            const ringAlpha = Math.max(0, 0.6 - this.ringExpanding / 60);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.ringExpanding + 18, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(52, 152, 219, ${ringAlpha})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.ringExpanding + 25, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(52, 152, 219, ${ringAlpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        if (this.flashAlpha > 0) {
            const flashRadius = 40 - this.ringExpanding * 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0, flashRadius), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(52, 152, 219, ${this.flashAlpha * 0.4})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0, flashRadius * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha * 0.6})`;
            ctx.fill();
        }
        
        for (const shard of this.shards) {
            if (shard.alpha <= 0 || shard.size <= 1) continue;
            
            ctx.save();
            ctx.translate(shard.x, shard.y);
            ctx.rotate(shard.rotation);
            
            ctx.beginPath();
            ctx.moveTo(-shard.size * 0.5, -shard.size * 0.3);
            ctx.lineTo(shard.size * 0.5, -shard.size * 0.3);
            ctx.lineTo(shard.size * 0.3, shard.size * 0.5);
            ctx.lineTo(-shard.size * 0.3, shard.size * 0.5);
            ctx.closePath();
            
            const shardColor = shard.color === '#3498db' 
                ? `rgba(52, 152, 219, ${shard.alpha})`
                : `rgba(93, 173, 226, ${shard.alpha})`;
            ctx.fillStyle = shardColor;
            ctx.fill();
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${shard.alpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.restore();
        }
        
        ctx.restore();
    }

    /**
     * 檢查護盾破碎特效是否已完成
     * @returns {boolean} 是否已完成
     */
    isFinished() {
        return this.time <= 0;
    }
}