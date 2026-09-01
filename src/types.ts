export type ProjectPhase = 'Rascunho' | 'Revisão' | 'Edição Final' | 'Concluído';

export type ContentStatus = 'Rascunho' | 'Revisado' | 'Final';

export interface Scene {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  synopsis: string;
  povCharacterId?: string;
  locationId?: string;
  characterIds: string[];
  status: ContentStatus;
  wordCount: number;
  notes?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  order: number;
  title: string;
  status: ContentStatus;
  scenes: Scene[];
}

export type CharacterRole = 'Protagonista' | 'Mentor' | 'Antagonista' | 'Secundário' | 'Aliado' | 'Neutro';

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  avatarUrl: string;
  tagline: string;
  description: string;
  traits: string[];
  goals: string;
  conflict: string;
  status: 'Ativo' | 'Em desenvolvimento' | 'Arquivo';
  firstAppearance?: string;
}

export type LocationCategory = 'Cidade' | 'Distrito' | 'Edifício' | 'Território Selvagem' | 'Instalação';

export interface WorldLocation {
  id: string;
  name: string;
  isPrimary?: boolean;
  imageUrl: string;
  shortDescription: string;
  fullDescription: string;
  category: LocationCategory;
  atmosphere: string;
  notableFeatures?: string[];
}

export interface LoreEntry {
  id: string;
  title: string;
  category: 'Política' | 'Tecnologia' | 'História' | 'Ciência' | 'Sociedade';
  content: string;
  relatedTags: string[];
}

export interface RevisionLog {
  id: string;
  timestamp: string;
  action: string;
  author: string;
  wordsDelta: number;
  sceneTitle?: string;
}

export interface StyleCheckerSettings {
  enabled: boolean;
  highlightRepeatedWords: boolean;
  highlightEchoes: boolean;
  highlightAvoidedTerms: boolean;
  avoidedTerms: string[];
  repeatThreshold: number; // e.g. 3 or more in scene
  echoDistance: number; // e.g. within 40 words
}

export type AutoSaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface AutoSaveSettings {
  enabled: boolean;
  debounceMs: number; // e.g. 1000ms
  createBackupSnapshots: boolean;
  showStatusBadge: boolean;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  dateIso: string;
  totalWords: number;
  chaptersCount: number;
  trigger: 'auto' | 'autosave' | 'manual' | 'focus_mode';
}

export interface NovelProject {
  id: string;
  title: string;
  subtitle: string;
  phase: ProjectPhase;
  coverUrl: string;
  author: {
    name: string;
    avatarUrl: string;
    bio: string;
  };
  targetWords: number;
  synopsis: string;
  genre: string;
  chapters: Chapter[];
  characters: Character[];
  locations: WorldLocation[];
  lore: LoreEntry[];
  history: RevisionLog[];
  styleSettings?: StyleCheckerSettings;
  autoSaveSettings?: AutoSaveSettings;
}

export type NavigationTab = 'dashboard' | 'characters' | 'world' | 'writing';
export type TopSubTab = 'binder' | 'canvas' | 'inspector';
export type StudioTheme = 'night-slate' | 'oled' | 'sepia-dark' | 'paper-light';
export type StudioFontSize = 'sm' | 'base' | 'lg' | 'xl';
