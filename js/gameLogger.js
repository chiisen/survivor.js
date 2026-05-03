export class GameLogger {
    constructor() {
        this.logLevel = 'error';
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