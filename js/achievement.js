// @ts-check

/**
 * 成就定義清單 — 每項包含 id, name, description, icon, condition 回呼函式
 * @type {Array<{id: string, name: string, description: string, icon: string, condition: function(object): boolean}>}
 */
export const ACHIEVEMENTS = [
    { id: 'first_kill', name: '初戰告捷', description: '首次擊殺敵人', icon: '⚔️', condition: (stats) => stats.totalKills >= 1 },
    { id: 'kill_50', name: '戰場老兵', description: '擊殺 50 名敵人', icon: '🎯', condition: (stats) => stats.totalKills >= 50 },
    { id: 'kill_100', name: '百人斩', description: '擊殺 100 名敵人', icon: '💀', condition: (stats) => stats.totalKills >= 100 },
    { id: 'kill_500', name: '死神降臨', description: '擊殺 500 名敵人', icon: '😈', condition: (stats) => stats.totalKills >= 500 },
    { id: 'survive_5min', name: '堅持不懈', description: '存活 5 分鐘', icon: '⏱️', condition: (stats) => stats.longestTime >= 300 },
    { id: 'survive_10min', name: '生存专家', description: '存活 10 分鐘', icon: '🌟', condition: (stats) => stats.longestTime >= 600 },
    { id: 'survive_20min', name: '不死传说', description: '存活 20 分鐘', icon: '🏆', condition: (stats) => stats.longestTime >= 1200 },
    { id: 'boss_first', name: 'Boss猎手', description: '首次擊殺 Boss', icon: '👹', condition: (stats) => stats.bossesKilled >= 1 },
    { id: 'boss_5', name: 'Boss终结者', description: '擊殺 5 名 Boss', icon: '👑', condition: (stats) => stats.bossesKilled >= 5 },
    { id: 'boss_10', name: 'Boss王者', description: '擊殺 10 名 Boss', icon: '🔥', condition: (stats) => stats.bossesKilled >= 10 },
    { id: 'wave_5', name: '波次达人', description: '達到第 5 波', icon: '🌊', condition: (stats) => stats.highestWave >= 5 },
    { id: 'wave_10', name: '波次大师', description: '達到第 10 波', icon: '🌊', condition: (stats) => stats.highestWave >= 10 },
    { id: 'wave_20', name: '波次传奇', description: '達到第 20 波', icon: '🌊', condition: (stats) => stats.highestWave >= 20 },
    { id: 'level_10', name: '升级达人', description: '達到等級 10', icon: '📈', condition: (stats) => stats.highestLevel >= 10 },
    { id: 'level_20', name: '升级大师', description: '達到等級 20', icon: '📈', condition: (stats) => stats.highestLevel >= 20 },
    { id: 'level_30', name: '升级传奇', description: '達到等級 30', icon: '📈', condition: (stats) => stats.highestLevel >= 30 },
    { id: 'games_10', name: '游戏爱好者', description: '遊玩 10 次', icon: '🎮', condition: (stats) => stats.totalGames >= 10 },
    { id: 'games_50', name: '游戏狂热者', description: '遊玩 50 次', icon: '🎮', condition: (stats) => stats.totalGames >= 50 },
    { id: 'hell_mode', name: '地狱征服者', description: '在地狱模式存活 5 分鐘', icon: '😈', condition: (stats) => stats.hellSurvive >= 300 },
];

/**
 * 成就管理器 — 負責成就的解鎖判定、持久化儲存與進度查詢
 */
export class AchievementManager {
    /**
     * @param {string} [storageKey='survivor_js_achievements'] - localStorage 儲存鍵名
     */
    constructor() {
        this.storageKey = 'survivor_js_achievements';
        this.unlocked = this.load();
        this.newAchievements = [];
    }
    
    /**
     * 從 localStorage 載入已解鎖成就 ID 清單
     * @returns {string[]} 已解鎖的成就 ID 陣列
     */
    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }
    
    /**
     * 將已解鎖成就 ID 清單持久化至 localStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.unlocked));
        } catch (e) {
            console.warn('无法保存成就数据');
        }
    }
    
    /**
     * 檢查是否解鎖新成就(比對 stats 與所有成就條件)
     * @param {object} stats - 遊戲統計資料(含 totalKills, longestTime, bossesKilled, highestWave, highestLevel, totalGames, time)
     * @param {string} [difficulty='normal'] - 遊戲難度
     * @returns {Array<object>} 本次新解鎖的成就陣列
     */
    check(stats, difficulty = 'normal') {
        const statsWithHell = { ...stats };
        if (difficulty === 'hell' && stats.time >= 300) {
            statsWithHell.hellSurvive = stats.time;
        } else {
            statsWithHell.hellSurvive = this.getHellSurviveTime();
        }
        
        this.newAchievements = [];
        
        for (const achievement of ACHIEVEMENTS) {
            if (!this.unlocked.includes(achievement.id) && achievement.condition(statsWithHell)) {
                this.unlocked.push(achievement.id);
                this.newAchievements.push(achievement);
            }
        }
        
        if (this.newAchievements.length > 0) {
            this.save();
        }
        
        return this.newAchievements;
    }
    
    /**
     * 取得地獄模式最高存活時間
     * @returns {number} 存活秒數
     */
    getHellSurviveTime() {
        try {
            const data = localStorage.getItem('survivor_js_hell_survive');
            return data ? parseInt(data) : 0;
        } catch (e) {
            return 0;
        }
    }
    
    /**
     * 儲存地獄模式存活時間(僅在打破紀錄時更新)
     * @param {number} time - 本次存活秒數
     * @param {string} difficulty - 遊戲難度
     */
    saveHellSurviveTime(time, difficulty) {
        if (difficulty === 'hell') {
            const current = this.getHellSurviveTime();
            if (time > current) {
                try {
                    localStorage.setItem('survivor_js_hell_survive', time.toString());
                } catch (e) {
                    console.warn('无法保存地狱模式时间');
                }
            }
        }
    }
    
    /**
     * 取得已解鎖的成就完整物件陣列
     * @returns {Array<object>} 已解鎖成就陣列
     */
    getUnlockedAchievements() {
        return ACHIEVEMENTS.filter(a => this.unlocked.includes(a.id));
    }
    
    /**
     * 取得所有成就並標記解鎖狀態
     * @returns {Array<object & {unlocked: boolean}>} 含 unlocked 欄位的成就陣列
     */
    getAllAchievements() {
        return ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: this.unlocked.includes(a.id)
        }));
    }
    
    /**
     * 取得成就進度統計
     * @returns {{unlocked: number, total: number, percentage: number}} 已解鎖數、總數、完成百分比
     */
    getProgress() {
        return {
            unlocked: this.unlocked.length,
            total: ACHIEVEMENTS.length,
            percentage: Math.floor((this.unlocked.length / ACHIEVEMENTS.length) * 100)
        };
    }
}