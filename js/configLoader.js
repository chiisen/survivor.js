// @ts-check

/**
 * 載入 JSON 設定檔
 * @param {string} path - JSON 檔案路徑
 * @returns {Promise<object>} 解析後的 JSON 物件
 */
export async function loadConfig(path) {
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
