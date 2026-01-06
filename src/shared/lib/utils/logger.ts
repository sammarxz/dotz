/**
 * Centralized logging utility
 * Provides consistent logging across the application with different log levels
 */

type LogLevel = "error" | "warn" | "info" | "debug";

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
}

class Logger {
  private config: LoggerConfig = {
    enabled: true,
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
  };

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    const levels: LogLevel[] = ["error", "warn", "info", "debug"];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, context?: unknown): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Log an error message
   */
  error(message: string, error?: unknown, context?: unknown): void {
    if (!this.shouldLog("error")) return;

    const formattedMessage = this.formatMessage("error", message, context);
    
    if (error instanceof Error) {
      console.error(formattedMessage, error);
    } else if (error) {
      console.error(formattedMessage, error);
    } else {
      console.error(formattedMessage);
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: unknown): void {
    if (!this.shouldLog("warn")) return;
    console.warn(this.formatMessage("warn", message, context));
  }

  /**
   * Log an info message
   */
  info(message: string, context?: unknown): void {
    if (!this.shouldLog("info")) return;
    console.info(this.formatMessage("info", message, context));
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: unknown): void {
    if (!this.shouldLog("debug")) return;
    console.debug(this.formatMessage("debug", message, context));
  }
}

// Export singleton instance
export const logger = new Logger();
