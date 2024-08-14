// logger.js

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, 'logs');
    this.logFile = null;
    this.stream = null;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  startNewLog() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(this.logDir, `${timestamp}.log`);
    this.stream = fs.createWriteStream(this.logFile, { flags: 'a' });
  }

  log(message, type = 'INFO') {
    if (!this.stream) {
      this.startNewLog();
    }

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}\n`;
    
    this.stream.write(logEntry);
    console.log(logEntry.trim()); // Also log to console
  }

  close() {
    if (this.stream) {
      this.stream.end();
    }
  }
}

module.exports = new Logger();