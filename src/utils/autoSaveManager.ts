import { NovelProject, AutoSaveSettings, BackupSnapshot } from '../types';

export const STORAGE_KEY = 'digital_study_novel_project_v1';
export const BACKUPS_STORAGE_KEY = 'digital_study_novel_backups_v1';
export const MAX_BACKUPS = 12;

export const DEFAULT_AUTOSAVE_SETTINGS: AutoSaveSettings = {
  enabled: true,
  debounceMs: 1000,
  createBackupSnapshots: true,
  showStatusBadge: true,
};

/**
 * Saves the project safely to browser localStorage
 */
export function saveProjectToStorage(project: NovelProject): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    return true;
  } catch (err) {
    console.error('Falha ao persistir projeto no localStorage:', err);
    return false;
  }
}

/**
 * Loads the project safely from localStorage
 */
export function loadProjectFromStorage(fallback?: NovelProject): NovelProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback ?? null;
    const parsed: NovelProject = JSON.parse(raw);

    // Sanitize empty image strings so they don't cause React empty src warnings or broken browser requests
    if (fallback) {
      if (!parsed.coverUrl?.trim() && fallback.coverUrl) {
        parsed.coverUrl = fallback.coverUrl;
      }
      if (parsed.author && !parsed.author.avatarUrl?.trim() && fallback.author?.avatarUrl) {
        parsed.author.avatarUrl = fallback.author.avatarUrl;
      }
      if (Array.isArray(parsed.characters)) {
        parsed.characters = parsed.characters.map((char) => {
          if (!char.avatarUrl?.trim()) {
            const match = fallback.characters?.find((fc) => fc.id === char.id);
            return {
              ...char,
              avatarUrl:
                match?.avatarUrl?.trim() ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
            };
          }
          return char;
        });
      }
      if (Array.isArray(parsed.locations)) {
        parsed.locations = parsed.locations.map((loc) => {
          if (!loc.imageUrl?.trim()) {
            const match = fallback.locations?.find((fl) => fl.id === loc.id);
            return {
              ...loc,
              imageUrl:
                match?.imageUrl?.trim() ||
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
            };
          }
          return loc;
        });
      }
    }
    return parsed;
  } catch (err) {
    console.error('Falha ao ler projeto do localStorage:', err);
    return fallback ?? null;
  }
}

/**
 * Saves a lightweight backup snapshot of the project
 */
export function saveBackupSnapshot(
  project: NovelProject,
  trigger: 'auto' | 'autosave' | 'manual' | 'focus_mode' = 'auto'
): BackupSnapshot[] {
  try {
    const totalWords = project.chapters.reduce(
      (sum, ch) => sum + ch.scenes.reduce((scSum, sc) => scSum + (sc.wordCount || 0), 0),
      0
    );

    const now = new Date();
    const newSnapshot: BackupSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      dateIso: now.toISOString(),
      totalWords,
      chaptersCount: project.chapters.length,
      trigger,
    };

    const existingRaw = localStorage.getItem(BACKUPS_STORAGE_KEY);
    let backups: BackupSnapshot[] = existingRaw ? JSON.parse(existingRaw) : [];

    // Keep only the most recent snapshots
    backups = [newSnapshot, ...backups.slice(0, MAX_BACKUPS - 1)];
    localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(backups));
    return backups;
  } catch (err) {
    console.warn('Falha ao registrar snapshot de backup:', err);
    return [];
  }
}

/**
 * Retrieves all stored backup snapshots
 */
export function getBackupSnapshots(): BackupSnapshot[] {
  try {
    const existingRaw = localStorage.getItem(BACKUPS_STORAGE_KEY);
    return existingRaw ? JSON.parse(existingRaw) : [];
  } catch {
    return [];
  }
}

/**
 * Calculates current storage footprint in localStorage
 */
export function calculateStorageUsage(): {
  bytes: number;
  formatted: string;
  percentage: number;
} {
  try {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key);
        totalBytes += (key.length + (val ? val.length : 0)) * 2; // UTF-16 ~ 2 bytes per char
      }
    }
    const maxEstimatedBytes = 5 * 1024 * 1024; // 5MB standard browser limit
    const percentage = Math.min(100, Math.round((totalBytes / maxEstimatedBytes) * 100));

    let formatted = `${(totalBytes / 1024).toFixed(1)} KB`;
    if (totalBytes > 1024 * 1024) {
      formatted = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return {
      bytes: totalBytes,
      formatted,
      percentage,
    };
  } catch {
    return {
      bytes: 0,
      formatted: '0 KB',
      percentage: 0,
    };
  }
}

/**
 * Formats save time cleanly
 */
export function formatSaveTime(date: Date | null): string {
  if (!date) return 'Nunca';
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
