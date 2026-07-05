/**
 * JSON File Store — Atomic
 * ACID-like file-based JSON storage with atomic writes and recovery
 * Version: 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';

export interface JsonStoreOptions {
  encoding?: BufferEncoding;
  ensureDir?: boolean;
}

/**
 * Atomic JSON file store
 * - Writes to temp file first, then atomic rename (POSIX) or copy+replace (Windows)
 * - Falls back to defaults on read error
 * - No external dependencies
 */
export class JsonStore<T = any> {
  private filePath: string;
  private defaults: T;
  private encoding: BufferEncoding;

  constructor(filePath: string, defaults: T, options?: JsonStoreOptions) {
    this.filePath = filePath;
    this.defaults = defaults;
    this.encoding = options?.encoding || 'utf8';

    if (options?.ensureDir !== false) {
      this._ensureDir();
    }

    if (!fs.existsSync(filePath)) {
      this._write(defaults);
    }
  }

  /**
   * Ensure directory exists
   */
  private _ensureDir(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Atomic write: temp file + rename
   */
  private _write(data: T): void {
    const tmp = this.filePath + '.tmp';
    try {
      // Write to temp file
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), this.encoding);
      // Atomic rename
      fs.renameSync(tmp, this.filePath);
    } catch (err) {
      // Cleanup temp file on error
      try {
        if (fs.existsSync(tmp)) {
          fs.unlinkSync(tmp);
        }
      } catch {}
      throw err;
    }
  }

  /**
   * Read with fallback to defaults
   */
  read(): T {
    try {
      const raw = fs.readFileSync(this.filePath, this.encoding);
      return JSON.parse(raw);
    } catch {
      // File missing, corrupted, or parse error — return defaults
      return JSON.parse(JSON.stringify(this.defaults));
    }
  }

  /**
   * Write data (overwrites)
   */
  write(data: T): void {
    this._write(data);
  }

  /**
   * Read → transform → write atomically
   * Returns the written (final) data
   */
  update(fn: (data: T) => T | undefined): T {
    const data = this.read();
    const updated = fn(data);
    const final = updated !== undefined ? updated : data;
    this._write(final);
    return this.read();
  }

  /**
   * Check if file exists
   */
  exists(): boolean {
    return fs.existsSync(this.filePath);
  }

  /**
   * Get file size in bytes
   */
  size(): number {
    try {
      return fs.statSync(this.filePath).size;
    } catch {
      return 0;
    }
  }

  /**
   * Delete the file
   */
  delete(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
    } catch {}
  }

  /**
   * Backup current state to .backup file
   */
  backup(): void {
    const backupPath = this.filePath + '.backup';
    try {
      if (fs.existsSync(this.filePath)) {
        fs.copyFileSync(this.filePath, backupPath);
      }
    } catch (err) {
      console.error(`[JsonStore] Backup failed for ${this.filePath}:`, err);
    }
  }

  /**
   * Restore from backup
   */
  restore(): boolean {
    const backupPath = this.filePath + '.backup';
    try {
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, this.filePath);
        return true;
      }
    } catch (err) {
      console.error(`[JsonStore] Restore failed for ${this.filePath}:`, err);
    }
    return false;
  }
}

/**
 * Convenience factory function
 */
export function createStore<T = any>(
  filePath: string,
  defaults: T,
  options?: JsonStoreOptions
): JsonStore<T> {
  return new JsonStore(filePath, defaults, options);
}
