/**
 * Error codes used throughout the application
 * These codes are used to identify specific error conditions
 */
export const ERROR_CODES = {
  DIRECTORY_DELETED: "DIRECTORY_DELETED",
  FILE_SYSTEM_NOT_SUPPORTED: "FILE_SYSTEM_NOT_SUPPORTED",
  NO_DIRECTORY_SELECTED: "NO_DIRECTORY_SELECTED",
  STORAGE_READ_ERROR: "STORAGE_READ_ERROR",
  STORAGE_WRITE_ERROR: "STORAGE_WRITE_ERROR",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
