import { JournalEntry } from "../types";

export class JournalStorage {
  private static readonly ENTRIES_KEY = "journal-entries";
  private static readonly TEMPLATE_KEY = "journal-template";

  static getEntries(): Record<string, JournalEntry> {
    if (typeof window === "undefined") return {};

    const stored = localStorage.getItem(this.ENTRIES_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  static saveEntries(entries: Record<string, JournalEntry>): void {
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(entries));
  }

  static getTemplate(): string {
    if (typeof window === "undefined") return "";

    return localStorage.getItem(this.TEMPLATE_KEY) || "";
  }

  static saveTemplate(template: string): void {
    localStorage.setItem(this.TEMPLATE_KEY, template);
  }

  static saveEntry(key: string, entry: JournalEntry): void {
    const entries = this.getEntries();
    entries[key] = entry;
    this.saveEntries(entries);
  }

  static deleteEntry(key: string): void {
    const entries = this.getEntries();
    delete entries[key];
    this.saveEntries(entries);
  }
}
