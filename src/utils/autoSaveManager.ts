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
    return JSON.parse(raw);
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
