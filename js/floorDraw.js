// @ts-check

const TILE = 64;

/**
 * 地板快取狀態
 * @returns {{ mode: ('image'|'fallback'|null), width: number, height: number, layer: any, builds: number }}
 */
export function createFloorCache() {
    return {
        mode: null,
        width: 0,
        height: 0,
        layer: null,
        builds: 0,
    };
}

/**
 * 以快取圖層畫地板。地磚與後備漸層只在快取重建時畫到離屏 canvas，
 * 主 context 每幀只貼一次。
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<typeof createFloorCache>} cache
 * @param {number} width
 * @param {number} height
 * @param {CanvasImageSource|null} image
 * @param {boolean} loaded
 * @param {(w: number, h: number) => HTMLCanvasElement} createCanvas
 * @returns {void}
 */
export function drawFloor(ctx, cache, width, height, image, loaded, createCanvas) {
    const mode = loaded ? 'image' : 'fallback';
    const stale = !cache.layer
        || cache.mode !== mode
        || cache.width !== width
        || cache.height !== height;

    if (stale) {
        const layerW = width + 20;
        const layerH = height + 20;
        const layer = createCanvas(layerW, layerH);
        layer.width = layerW;
        layer.height = layerH;
        const layerCtx = layer.getContext('2d');
        if (!layerCtx) return;

        if (loaded && image) {
            const cols = Math.ceil(layerW / TILE);
            const rows = Math.ceil(layerH / TILE);
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    layerCtx.drawImage(image, col * TILE, row * TILE, TILE, TILE);
                }
            }
        } else {
            const gradient = layerCtx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, width / 2
            );
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            layerCtx.fillStyle = gradient;
            layerCtx.fillRect(0, 0, layerW, layerH);
        }

        cache.layer = layer;
        cache.mode = mode;
        cache.width = width;
        cache.height = height;
        cache.builds++;
    }

    ctx.drawImage(cache.layer, -10, -10);
}
