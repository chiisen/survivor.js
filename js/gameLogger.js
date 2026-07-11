// @ts-check

/**
 * 遊戲日誌器 — 分級輸出日誌並追蹤 Update Loop 四階段執行狀態
 */
export class GameLogger {
    /**
     * @param {string} [level='error'] - 初始日誌等級('error'|'info'|'debug')
     */
    constructor() {
        this.logLevel = 'error';
        this.logLevels = ['error', 'info', 'debug'];
        this.phaseExecuted = {
            phase1: false,
            phase2: false,
            phase3: false,
            phase4: false
        };
    }
    
    /**
     * 設定日誌等級
     * @param {string} level - 日誌等級('error'|'info'|'debug')
     */
    setLogLevel(level) {
        this.logLevel = level;
    }
    
    /**
     * 循環切換日誌等級(error → info → debug → error)
     * @returns {string} 切換後的日誌等級
     */
    cycleLogLevel() {
        const currentIndex = this.logLevels.indexOf(this.logLevel);
        const nextIndex = (currentIndex + 1) % this.logLevels.length;
        this.logLevel = this.logLevels[nextIndex];
        console.log(`[GameLogger] Log level changed to: ${this.logLevel.toUpperCase()}`);
        return this.logLevel;
    }
    
    /**
     * 記錄階段執行(debug 模式下輸出)並標記該階段已執行
     * @param {string} phaseName - 階段名稱('phase1'|'phase2'|'phase3'|'phase4')
     * @param {*} [details] - 階段附加資訊
     */
    phase(phaseName, details) {
        if (this.logLevel === 'debug') {
            console.log(`[${phaseName}]`, details);
        }
        this.phaseExecuted[phaseName] = true;
    }
    
    /**
     * 輸出錯誤等級日誌(不受 logLevel 限制)
     * @param {string} message - 錯誤訊息
     * @param {*} [details] - 附加資訊
     */
    error(message, details) {
        console.error(`[ERROR] ${message}`, details);
    }
    
    /**
     * 輸出警告等級日誌(info 或 debug 模式下生效)
     * @param {string} message - 警告訊息
     * @param {*} [details] - 附加資訊
     */
    warning(message, details) {
        if (this.logLevel === 'info' || this.logLevel === 'debug') {
            console.warn(`[WARNING] ${message}`, details);
        }
    }
    
    /**
     * 輸出資訊等級日誌(info 或 debug 模式下生效)
     * @param {string} message - 資訊訊息
     * @param {*} [details] - 附加資訊
     */
    info(message, details) {
        if (this.logLevel === 'info' || this.logLevel === 'debug') {
            console.log(`[INFO] ${message}`, details);
        }
    }
    
    /**
     * 重設所有階段執行標記為 false
     */
    reset() {
        this.phaseExecuted = {
            phase1: false,
            phase2: false,
            phase3: false,
            phase4: false
        };
    }
}