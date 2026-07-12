// @ts-check
const STORAGE_KEY = 'survivor_js_stats';
const LEADERBOARD_KEY = 'survivor_js_leaderboard';
const SAVE_KEY = 'survivor_js_save';
const SAVE_VERSION = 1;
const MAX_LEADERBOARD_ENTRIES = 10;

export class StorageManager {
    /**
     * 建立儲存管理器實例，載入既有統計資料與排行榜
     */
    constructor() {
        this.stats = this.load();
        this.leaderboard = this.loadLeaderboard();
    }

    /**
     * 從 localStorage 載入遊戲統計資料
     * @returns {{ highestLevel: number, longestTime: number, totalKills: number, highestWave: number, totalGames: number, bossesKilled: number }} 遊戲統計資料
     */
    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load stats from localStorage:', e);
        }
        
        return {
            highestLevel: 0,
            longestTime: 0,
            totalKills: 0,
            highestWave: 0,
            totalGames: 0,
            bossesKilled: 0
        };
    }

    /**
     * 從 localStorage 載入排行榜資料
     * @returns {Array<{ level: number, kills: number, time: number, wave: number, bossesKilled: number, date: string }>} 排行榜陣列
     */
    loadLeaderboard() {
        try {
            const data = localStorage.getItem(LEADERBOARD_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load leaderboard from localStorage:', e);
        }
        return [];
    }

    /**
     * 將遊戲統計資料存入 localStorage
     * @param {{ highestLevel: number, longestTime: number, totalKills: number, highestWave: number, totalGames: number, bossesKilled: number }} stats - 要儲存的統計資料
     */
    save(stats) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        } catch (e) {
            console.warn('Failed to save stats to localStorage:', e);
        }
    }

    /**
     * 將排行榜資料存入 localStorage
     * @param {Array} leaderboard - 排行榜陣列
     */
    saveLeaderboard(leaderboard) {
        try {
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
        } catch (e) {
            console.warn('Failed to save leaderboard to localStorage:', e);
        }
    }

    /**
     * 用本次遊戲結果更新統計資料與排行榜
     * @param {{ level: number, time: number, kills: number, wave: number, bossesKilled?: number }} gameStats - 本次遊戲統計
     * @returns {Array<{ type: string, value: number, isNew: boolean }>} 新紀錄列表
     */
    update(gameStats) {
        const newStats = {
            highestLevel: Math.max(this.stats.highestLevel, gameStats.level),
            longestTime: Math.max(this.stats.longestTime, gameStats.time),
            totalKills: this.stats.totalKills + gameStats.kills,
            highestWave: Math.max(this.stats.highestWave, gameStats.wave),
            totalGames: this.stats.totalGames + 1,
            bossesKilled: this.stats.bossesKilled + (gameStats.bossesKilled || 0)
        };
        
        this.stats = newStats;
        this.save(newStats);
        
        this.addToLeaderboard(gameStats);
        
        return this.checkNewRecords(gameStats);
    }

    /**
     * 將本次遊戲結果加入排行榜並排序（依等級 > 擊殺 > 時間）
     * @param {{ level: number, kills: number, time: number, wave: number, bossesKilled?: number }} gameStats - 本次遊戲統計
     */
    addToLeaderboard(gameStats) {
        const entry = {
            level: gameStats.level,
            kills: gameStats.kills,
            time: gameStats.time,
            wave: gameStats.wave,
            bossesKilled: gameStats.bossesKilled || 0,
            date: new Date().toLocaleDateString('zh-TW')
        };
        
        this.leaderboard.push(entry);
        
        this.leaderboard.sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            if (b.kills !== a.kills) return b.kills - a.kills;
            return b.time - a.time;
        });
        
        this.leaderboard = this.leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
        
        this.saveLeaderboard(this.leaderboard);
    }

    /**
     * 取得排行榜資料（含格式化時間）
     * @returns {Array<{ level: number, kills: number, time: number, wave: number, bossesKilled: number, date: string, formattedTime: string }>} 排行榜陣列
     */
    getLeaderboard() {
        return this.leaderboard.map(entry => ({
            ...entry,
            formattedTime: this.formatTime(entry.time)
        }));
    }

    /**
     * 檢查本次遊戲是否創下新紀錄
     * @param {{ level: number, time: number, wave: number }} gameStats - 本次遊戲統計
     * @returns {Array<{ type: string, value: number, isNew: boolean }>} 新紀錄列表
     */
    checkNewRecords(gameStats) {
        const records = [];
        
        if (gameStats.level > this.stats.highestLevel - gameStats.level) {
            records.push({ type: 'level', value: gameStats.level, isNew: true });
        }
        
        if (gameStats.time > this.stats.longestTime - gameStats.time) {
            records.push({ type: 'time', value: gameStats.time, isNew: true });
        }
        
        if (gameStats.wave > this.stats.highestWave - gameStats.wave) {
            records.push({ type: 'wave', value: gameStats.wave, isNew: true });
        }
        
        return records;
    }

    /**
     * 取得原始遊戲統計資料
     * @returns {{ highestLevel: number, longestTime: number, totalKills: number, highestWave: number, totalGames: number, bossesKilled: number }} 統計資料
     */
    getStats() {
        return this.stats;
    }

    /**
     * 將秒數格式化為「X分Y秒」字串
     * @param {number} seconds - 秒數
     * @returns {string} 格式化的時間字串
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}分${secs}秒`;
    }

    /**
     * 取得格式化後的遊戲統計資料（時間已轉為字串）
     * @returns {{ highestLevel: number, longestTime: string, longestTimeSec: number, totalKills: number, highestWave: number, totalGames: number, bossesKilled: number }} 格式化統計資料
     */
    getFormattedStats() {
        return {
            highestLevel: this.stats.highestLevel,
            longestTime: this.formatTime(this.stats.longestTime),
            longestTimeSec: this.stats.longestTime,
            totalKills: this.stats.totalKills,
            highestWave: this.stats.highestWave,
            totalGames: this.stats.totalGames,
            bossesKilled: this.stats.bossesKilled
        };
    }

    /**
     * 重置所有統計資料與排行榜為初始狀態
     */
    reset() {
        this.stats = {
            highestLevel: 0,
            longestTime: 0,
            totalKills: 0,
            highestWave: 0,
            totalGames: 0,
            bossesKilled: 0
        };
        this.leaderboard = [];
        this.save(this.stats);
        this.saveLeaderboard(this.leaderboard);
    }

    /**
     * 儲存遊戲狀態到 localStorage
     * @param {object} gameState - 完整遊戲狀態物件
     * @returns {boolean} 儲存是否成功
     */
    saveGame(gameState) {
        try {
            const saveData = {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                state: gameState
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.warn('Failed to save game:', e);
            return false;
        }
    }

    /**
     * 從 localStorage 載入遊戲狀態
     * @returns {object|null} 遊戲狀態物件，無存檔時回傳 null
     */
    loadGame() {
        try {
            const data = localStorage.getItem(SAVE_KEY);
            if (data) {
                const saveData = JSON.parse(data);
                if (saveData.version === SAVE_VERSION) {
                    return saveData.state;
                }
            }
        } catch (e) {
            console.warn('Failed to load game:', e);
        }
        return null;
    }

    /**
     * 檢查是否有遊戲存檔
     * @returns {boolean} 是否存在存檔
     */
    hasSave() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }

    /**
     * 清除遊戲存檔
     */
    clearSave() {
        localStorage.removeItem(SAVE_KEY);
    }

    /**
     * 取得存檔的摘要資訊（用於顯示）
     * @returns {{ level: number, wave: number, time: string, timestamp: string }|null} 存檔摘要
     */
    getSaveInfo() {
        try {
            const data = localStorage.getItem(SAVE_KEY);
            if (data) {
                const saveData = JSON.parse(data);
                const state = saveData.state;
                const mins = Math.floor(state.gameTime / 60);
                const secs = Math.floor(state.gameTime % 60);
                const date = new Date(saveData.timestamp);
                return {
                    level: state.level,
                    wave: state.waveManager.currentWave,
                    time: `${mins}分${secs}秒`,
                    timestamp: date.toLocaleString('zh-TW')
                };
            }
        } catch (e) {
            console.warn('Failed to get save info:', e);
        }
        return null;
    }
}