const STORAGE_KEY = 'survivor_js_stats';
const LEADERBOARD_KEY = 'survivor_js_leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;

export class StorageManager {
    constructor() {
        this.stats = this.load();
        this.leaderboard = this.loadLeaderboard();
    }

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

    save(stats) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        } catch (e) {
            console.warn('Failed to save stats to localStorage:', e);
        }
    }

    saveLeaderboard(leaderboard) {
        try {
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
        } catch (e) {
            console.warn('Failed to save leaderboard to localStorage:', e);
        }
    }

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

    getLeaderboard() {
        return this.leaderboard.map(entry => ({
            ...entry,
            formattedTime: this.formatTime(entry.time)
        }));
    }

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

    getStats() {
        return this.stats;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}分${secs}秒`;
    }

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
}