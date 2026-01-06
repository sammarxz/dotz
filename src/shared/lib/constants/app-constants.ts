/**
 * Application-wide constants
 */
export const AUTO_SAVE_DELAY_MS = 1000;

export const CALENDAR = {
  DAYS_IN_YEAR: 365,
} as const;

export const FILE_SYSTEM = {
  DIRECTORY_PICKER_MODE: "readwrite" as const,
  DIRECTORY_PICKER_START_IN: "documents" as const,
} as const;
