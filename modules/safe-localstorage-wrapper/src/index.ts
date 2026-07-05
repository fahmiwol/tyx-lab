const PREFIX = 'app_';

export function save(key: string, data: unknown): boolean {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('[Storage] Save failed:', key, e);
    return false;
  }
}

export function load(key: string, defaultValue: unknown = null): unknown {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.warn('[Storage] Load failed:', key, e);
    return defaultValue;
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (e) {
    console.warn('[Storage] Remove failed:', key, e);
  }
}
