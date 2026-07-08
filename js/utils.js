// @ts-check

/**
 * 計算兩點間歐氏距離
 * @param {number} x1 - 點1 X 座標
 * @param {number} y1 - 點1 Y 座標
 * @param {number} x2 - 點2 X 座標
 * @param {number} y2 - 點2 Y 座標
 * @returns {number} 兩點距離
 */
export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 計算兩點距離平方(避免 Math.sqrt 運算,用於距離比較)
 * @param {number} x1 - 點1 X 座標
 * @param {number} y1 - 點1 Y 座標
 * @param {number} x2 - 點2 X 座標
 * @param {number} y2 - 點2 Y 座標
 * @returns {number} 兩點距離平方
 */
export function distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * 向量正規化
 * @param {number} x - 向量 X 分量
 * @param {number} y - 向量 Y 分量
 * @returns {{x: number, y: number}} 長度為 1 的單位向量(若原向量為 0 則回傳 {x:0, y:0})
 */
export function normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

/**
 * 取得 [min, max) 範圍內的隨機浮點數
 * @param {number} min - 下界(包含)
 * @param {number} max - 上界(不包含)
 * @returns {number} 隨機浮點數
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 取得 [min, max] 範圍內的隨機整數
 * @param {number} min - 下界(包含)
 * @param {number} max - 上界(包含)
 * @returns {number} 隨機整數
 */
export function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

/**
 * 將秒數格式化為 mm:ss 字串
 * @param {number} seconds - 秒數
 * @returns {string} mm:ss 格式字串
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 將值限制在 [min, max] 範圍內
 * @param {number} value - 輸入值
 * @param {number} min - 下界
 * @param {number} max - 上界
 * @returns {number} 限制後的值
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * 線性插值
 * @param {number} a - 起點
 * @param {number} b - 終點
 * @param {number} t - 插值參數(0=a, 1=b)
 * @returns {number} 插值結果
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * 取得經驗值等級倍率
 * @param {number} level - 玩家等級
 * @param {number} [growthRate=1.5] - 成長率
 * @returns {number} 等級倍率
 */
export function getExpLevelMultiplier(level, growthRate = 1.5) {
    return Math.pow(growthRate, level - 1);
}
