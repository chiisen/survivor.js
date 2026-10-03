// @ts-check
/**
 * 視野遮罩，用於顯示玩家周圍的可視區域和戰爭迷霧效果
 */
export class VisibilityMask {
    /**
     * @param {((width: number, height: number) => HTMLCanvasElement)|null} [createCanvas]
     */
    constructor(createCanvas = null) {
        /** @type {number} 可視半徑 */
        this.visibleRadius = 350;
        /** @type {number} 漸隱距離 */
        this.fadeDistance = 250;
        /** @type {number} 暗度等級 (0-1) */
        this.darkness = 0.85;
        /** @type {number} 模糊強度 */
        this.blurStrength = 15;
        /** @type {number} 靜態暗層重建次數 */
        this.staticBuilds = 0;
        this._createCanvas = createCanvas;
        /** @type {{ canvas: HTMLCanvasElement, w: number, h: number, darkness: number }|null} */
        this._staticLayer = null;
        /** @type {HTMLCanvasElement|null} */
        this._frameLayer = null;
    }

    /**
     * @param {number} width
     * @param {number} height
     * @returns {HTMLCanvasElement}
     */
    _makeCanvas(width, height) {
        if (this._createCanvas) return this._createCanvas(width, height);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    
    /**
     * 繪製視野遮罩
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {number} canvasWidth - 畫布寬度
     * @param {number} canvasHeight - 畫布高度
     * @param {number} playerX - 玩家 X 座標
     * @param {number} playerY - 玩家 Y 座標
     * @returns {void}
     */
    /**
     * 尺寸或暗度改變時才重建靜態暗層（含角落暈影）。
     * @param {number} canvasWidth
     * @param {number} canvasHeight
     * @returns {void}
     */
    _ensureStaticLayer(canvasWidth, canvasHeight) {
        const cached = this._staticLayer;
        if (cached && cached.w === canvasWidth && cached.h === canvasHeight && cached.darkness === this.darkness) {
            return;
        }

        const width = canvasWidth + 100;
        const height = canvasHeight + 100;
        const canvas = this._makeCanvas(width, height);
        canvas.width = width;
        canvas.height = height;
        const layerCtx = canvas.getContext('2d');
        if (!layerCtx) return;

        layerCtx.fillStyle = `rgba(5, 5, 20, ${this.darkness})`;
        layerCtx.fillRect(0, 0, width, height);
        this.drawVignetteCorners(layerCtx, width, height, 0, 0);

        this._staticLayer = { canvas, w: canvasWidth, h: canvasHeight, darkness: this.darkness };
        this.staticBuilds++;
    }

    draw(ctx, canvasWidth, canvasHeight, playerX, playerY) {
        this._ensureStaticLayer(canvasWidth, canvasHeight);
        if (!this._staticLayer) return;

        const width = canvasWidth + 100;
        const height = canvasHeight + 100;
        if (!this._frameLayer || this._frameLayer.width !== width || this._frameLayer.height !== height) {
            this._frameLayer = this._makeCanvas(width, height);
            this._frameLayer.width = width;
            this._frameLayer.height = height;
        }

        const frameCtx = this._frameLayer.getContext('2d');
        if (!frameCtx) return;

        frameCtx.clearRect(0, 0, width, height);
        frameCtx.drawImage(this._staticLayer.canvas, 0, 0);

        const outerRadius = this.visibleRadius + this.fadeDistance;
        frameCtx.save();
        frameCtx.globalCompositeOperation = 'destination-out';
        const gradient = frameCtx.createRadialGradient(
            playerX + 50, playerY + 50, this.visibleRadius * 0.3,
            playerX + 50, playerY + 50, outerRadius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        frameCtx.fillStyle = gradient;
        frameCtx.fillRect(0, 0, width, height);
        frameCtx.restore();

        ctx.drawImage(this._frameLayer, -50, -50);
    }
    
    /**
     * 繪製角落暈影效果
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {number} canvasWidth - 畫布寬度
     * @param {number} canvasHeight - 畫布高度
     * @param {number} playerX - 玩家 X 座標
     * @param {number} playerY - 玩家 Y 座標
     * @returns {void}
     */
    drawVignetteCorners(ctx, canvasWidth, canvasHeight, playerX, playerY) {
        const cornerSize = 200;
        const corners = [
            { x: 0, y: 0 },
            { x: canvasWidth, y: 0 },
            { x: 0, y: canvasHeight },
            { x: canvasWidth, y: canvasHeight }
        ];
        
        corners.forEach(corner => {
            const gradient = ctx.createRadialGradient(
                corner.x, corner.y, 0,
                corner.x, corner.y, cornerSize
            );
            
            gradient.addColorStop(0, 'rgba(5, 5, 20, 0.95)');
            gradient.addColorStop(0.5, 'rgba(10, 10, 30, 0.6)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                corner.x - cornerSize,
                corner.y - cornerSize,
                cornerSize * 2,
                cornerSize * 2
            );
        });
    }
    
    /**
     * 繪製戰爭迷霧效果
     * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
     * @param {number} canvasWidth - 畫布寬度
     * @param {number} canvasHeight - 畫布高度
     * @param {number} playerX - 玩家 X 座標
     * @param {number} playerY - 玩家 Y 座標
     * @param {Array<Object>} enemies - 敵人陣列
     * @returns {void}
     */
    drawFogOfWar(ctx, canvasWidth, canvasHeight, playerX, playerY, enemies) {
        ctx.save();
        
        ctx.globalCompositeOperation = 'source-over';
        
        const gradient = ctx.createRadialGradient(
            playerX, playerY, 0,
            playerX, playerY, this.visibleRadius + this.fadeDistance
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.8, 'rgba(10, 10, 30, 0.5)');
        gradient.addColorStop(1, 'rgba(5, 5, 20, 0.9)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.restore();
    }
    
    /**
     * 設定可視半徑
     * @param {number} radius - 可視半徑 (100-600)
     * @returns {void}
     */
    setVisibleRadius(radius) {
        this.visibleRadius = Math.max(100, Math.min(600, radius));
    }
    
    /**
     * 設定漸隱距離
     * @param {number} distance - 漸隱距離 (50-400)
     * @returns {void}
     */
    setFadeDistance(distance) {
        this.fadeDistance = Math.max(50, Math.min(400, distance));
    }
    
    /**
     * 設定暗度等級
     * @param {number} level - 暗度等級 (0-1)
     * @returns {void}
     */
    setDarkness(level) {
        this.darkness = Math.max(0, Math.min(1, level));
    }
}