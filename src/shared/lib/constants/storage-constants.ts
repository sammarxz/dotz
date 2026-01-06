/**
 * Storage-related constants
 */
export const STORAGE_KEYS = {
  JOURNAL_ENTRIES: "journal-entries",
  FS_DIRECTORY_HANDLE: "fs-directory-handle",
} as const;

export const STORAGE_CONFIG = {
  INDEXED_DB_NAME: "JournalFS",
  INDEXED_DB_VERSION: 1,
  OBJECT_STORE_NAME: "handles",
  DIRECTORY_HANDLE_ID: "directory",
  JOURNAL_FILE_NAME: "journal.json",
} as const;

export const STORAGE_MESSAGES = {
  NO_DIRECTORY_SELECTED: "No directory selected",
} as const;
