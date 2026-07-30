// @ts-check

const isNode = typeof window === 'undefined';

/**
 * 載入 JSON 設定檔（瀏覽器用 fetch，Node.js 用 fs）
 * @param {string} path - JSON 檔案路徑
 * @returns {Promise<object>} 解析後的 JSON 物件
 */
export async function loadConfig(path) {
    if (isNode) {
        const { readFileSync } = await import('node:fs');
        const { fileURLToPath } = await import('node:url');
        const { dirname, resolve } = await import('node:path');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const fullPath = resolve(__dirname, '..', path);
        return JSON.parse(readFileSync(fullPath, 'utf-8'));
    }
    const res = await fetch(path);
    return res.json();
}

/**
 * 從角度設定建立 DIR_TO_ANGLE Map
 * @param {object} anglesConfig - angles.json 的 directions 物件
 * @returns {Map<string, number>} "dx,dy" → 弧度
 */
export function buildDirToAngle(anglesConfig) {
    const map = new Map();
    for (const [, info] of Object.entries(anglesConfig)) {
        const key = `${info.dx},${info.dy}`;
        map.set(key, info.angle * Math.PI / 180);
    }
    return map;
}
