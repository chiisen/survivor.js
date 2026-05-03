export class GameLogger {
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
    
    setLogLevel(level) {
        this.logLevel = level;
    }
    
    cycleLogLevel() {
        const currentIndex = this.logLevels.indexOf(this.logLevel);
        const nextIndex = (currentIndex + 1) % this.logLevels.length;
        this.logLevel = this.logLevels[nextIndex];
        console.log(`[GameLogger] Log level changed to: ${this.logLevel.toUpperCase()}`);
        return this.logLevel;
    }
    
    phase(phaseName, details) {
        if (this.logLevel === 'debug') {
            console.log(`[${phaseName}]`, details);
        }
        this.phaseExecuted[phaseName] = true;
    }
    
    error(message, details) {
        console.error(`[ERROR] ${message}`, details);
    }
    
    warning(message, details) {
        if (this.logLevel === 'info' || this.logLevel === 'debug') {
            console.warn(`[WARNING] ${message}`, details);
        }
    }
    
    info(message, details) {
        if (this.logLevel === 'info' || this.logLevel === 'debug') {
            console.log(`[INFO] ${message}`, details);
        }
    }
    
    reset() {
        this.phaseExecuted = {
            phase1: false,
            phase2: false,
            phase3: false,
            phase4: false
        };
    }
}