import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NovelProject, NavigationTab, TopSubTab, AutoSaveStatus, AutoSaveSettings } from './types';
import { INITIAL_PROJECT_DATA } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { CharactersView } from './components/CharactersView';
import { WorldView } from './components/WorldView';
import { WritingStudioView } from './components/WritingStudioView';
import { FocusModeModal } from './components/FocusModeModal';
import { NewChapterModal } from './components/NewChapterModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { ShareModal } from './components/ShareModal';
import { SyncModal } from './components/SyncModal';
import {
  saveProjectToStorage,
  loadProjectFromStorage,
  saveBackupSnapshot,
  DEFAULT_AUTOSAVE_SETTINGS,
} from './utils/autoSaveManager';

const DARK_MODE_STORAGE_KEY = 'digital_study_novel_dark_mode_v1';

export default function App() {
  // Load initial project from storage or default data
  const [project, setProject] = useState<NovelProject>(() => {
    return loadProjectFromStorage(INITIAL_PROJECT_DATA);
  });

  // Dark mode state for comfortable night writing sessions
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(DARK_MODE_STORAGE_KEY);
      if (savedTheme !== null) {
        return savedTheme === 'true';
      }
    } catch (e) {
      console.warn('Erro ao carregar preferência de tema:', e);
    }
    return false;
  });

  // Collapsible sidebar state (persisted)
  const SIDEBAR_COLLAPSED_KEY = 'digital_study_novel_sidebar_collapsed_v1';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch (e) {
        console.warn('Erro ao salvar preferência do menu lateral:', e);
      }
      return next;
    });
  }, []);

  // Toggle and persist Dark Mode
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(DARK_MODE_STORAGE_KEY, String(next));
      } catch (e) {
        console.warn('Erro ao salvar preferência de tema:', e);
      }
      return next;
    });
  };

  // Auto-Save Management State
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(() => new Date());
  const [toastMessage, setToastMessage] = useState<{ id: number; text: string; type: 'success' | 'info' } | null>(null);

  const autoSaveSettings: AutoSaveSettings = project.autoSaveSettings || DEFAULT_AUTOSAVE_SETTINGS;
  const isFirstRender = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectRef = useRef<NovelProject>(project);

  // Keep projectRef up-to-date
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Show a temporary toast message
  const showToast = useCallback((text: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setToastMessage({ id, text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.id === id ? null : cur));
    }, 2800);
  }, []);

  // Force immediate save (e.g. from Ctrl+S, manual buttons, or header click)
  const handleForceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setAutoSaveStatus('saving');
    const success = saveProjectToStorage(projectRef.current);

    if (success) {
      if (autoSaveSettings.createBackupSnapshots) {
        saveBackupSnapshot(projectRef.current, 'manual');
      }
      setTimeout(() => {
        setAutoSaveStatus('saved');
        setLastSavedAt(new Date());
        showToast('Manuscrito salvo com sucesso!');
      }, 250);
    } else {
      setAutoSaveStatus('error');
      showToast('Erro ao salvar localmente (armazenamento cheio)', 'info');
    }
  }, [autoSaveSettings.createBackupSnapshots, showToast]);

  // Debounced auto-save effect on project changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!autoSaveSettings.enabled) {
      return;
    }

    setAutoSaveStatus('unsaved');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const debounceTime = autoSaveSettings.debounceMs || 1000;
    saveTimeoutRef.current = setTimeout(() => {
      setAutoSaveStatus('saving');
      const success = saveProjectToStorage(project);
      if (success) {
        if (autoSaveSettings.createBackupSnapshots) {
          saveBackupSnapshot(project, 'autosave');
        }
        setAutoSaveStatus('saved');
        setLastSavedAt(new Date());
      } else {
        setAutoSaveStatus('error');
      }
    }, debounceTime);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [project, autoSaveSettings]);

  // Global keyboard shortcuts (Ctrl+S to save, Ctrl+B to toggle sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleForceSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleForceSave, handleToggleSidebar]);

  // Save before unload to prevent accidental data loss
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProjectToStorage(projectRef.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Main navigation tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  // Top sub navigation (Fichário, Tela, Inspetor)
  const [subTab, setSubTab] = useState<TopSubTab>('binder');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [focusSceneId, setFocusSceneId] = useState<string | undefined>(undefined);
  const [isNewChapterOpen, setIsNewChapterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  // Selected item filters for direct deep-linking across views
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const handleUpdateProject = (updated: NovelProject) => {
    setProject(updated);
  };

  const handleRestoreDefaults = () => {
    setProject(INITIAL_PROJECT_DATA);
    localStorage.removeItem('digital_study_novel_project_v1');
    showToast('Dados de demonstração restaurados com sucesso!', 'info');
  };

  const handleOpenFocusMode = (sceneId?: string) => {
    setFocusSceneId(sceneId);
    setIsFocusModeOpen(true);
  };

  // Top header subTab switch handler
  const handleSelectSubTab = (newSubTab: TopSubTab) => {
    setSubTab(newSubTab);
    // If user clicks on Fichário, Tela, or Inspetor, automatically navigate to Writing Studio if not already there
    if (activeTab !== 'writing') {
      setActiveTab('writing');
    }
  };

  // Filter search results across the entire novel project
  const searchResults = searchQuery.trim()
    ? {
        scenes: project.chapters.flatMap((c) =>
          c.scenes
            .filter(
              (s) =>
                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.synopsis.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((s) => ({ ...s, chapterTitle: c.title }))
        ),
        characters: project.characters.filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.traits.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
        locations: project.locations.filter(
          (l) =>
            l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }
    : null;

  return (
    <div
      className={`min-h-screen flex selection:bg-[#3b82f6]/40 selection:text-white transition-colors duration-200 ${
        isDarkMode ? 'bg-[#090d16] text-[#e2e8f0]' : 'bg-[#f6fafe] text-[#171c1f]'
      }`}
    >
      {/* 1. Left Fixed Sidebar (260px expanded / 72px collapsed) */}
      <Sidebar
        project={project}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSync={() => setIsSyncOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* 2. Main Area (Fluid, offset dynamically by sidebar width) */}
      <div
        className={`${
          isSidebarCollapsed ? 'ml-[72px] w-[calc(100%-72px)]' : 'ml-[260px] w-[calc(100%-260px)]'
        } min-h-screen flex flex-col transition-all duration-200 ease-in-out`}
      >
        {/* Top Header */}
        <TopHeader
          project={project}
          currentSubTab={subTab}
          onSelectSubTab={handleSelectSubTab}
          onOpenFocusMode={() => handleOpenFocusMode()}
          onOpenNewChapter={() => setIsNewChapterOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAuthorProfile={() => setIsSettingsOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          autoSaveStatus={autoSaveStatus}
          lastSavedAt={lastSavedAt}
          onForceSave={handleForceSave}
        />

        {/* Global Search Results Overlay if search query exists */}
        {searchResults && searchQuery.trim().length > 0 && (
          <div
            className={`px-6 lg:px-12 py-6 border-b shadow-md z-30 ${
              isDarkMode
                ? 'bg-[#111827] border-[#1e293b] text-[#f1f5f9]'
                : 'bg-[#eaeef2] border-[#c5c6ce] text-[#171c1f]'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-headline-md text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>
                <span className="material-symbols-outlined text-[18px]">search</span>
                Resultados para "{searchQuery}"
              </h3>
              <button
                onClick={() => setSearchQuery('')}
                className={`text-xs font-semibold ${isDarkMode ? 'text-[#94a3b8] hover:text-white' : 'text-[#44474d] hover:text-[#04162e]'}`}
              >
                Limpar busca
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Scenes found */}
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#182232] border-[#223147]' : 'bg-white border-[#c5c6ce]'}`}>
                <h4 className={`font-bold mb-2 flex items-center justify-between ${isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>
                  <span>Cenas / Manuscrito</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${isDarkMode ? 'bg-[#223147] text-[#93c5fd]' : 'bg-[#eaeef2]'}`}>
                    {searchResults.scenes.length}
                  </span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.scenes.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveTab('writing');
                        setSearchQuery('');
                      }}
                      className={`p-2 rounded cursor-pointer ${
                        isDarkMode ? 'bg-[#111a28] hover:bg-[#1d2b40]' : 'bg-[#f6fafe] hover:bg-[#dfe3e7]'
                      }`}
                    >
                      <p className={`font-semibold ${isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>{s.title}</p>
                      <p className={`text-[11px] truncate ${isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>{s.chapterTitle}</p>
                    </div>
                  ))}
                  {searchResults.scenes.length === 0 && (
                    <p className={`italic py-2 ${isDarkMode ? 'text-[#64748b]' : 'text-[#75777e]'}`}>Nenhuma cena encontrada.</p>
                  )}
                </div>
              </div>

              {/* Characters found */}
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#182232] border-[#223147]' : 'bg-white border-[#c5c6ce]'}`}>
                <h4 className={`font-bold mb-2 flex items-center justify-between ${isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>
                  <span>Personagens</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${isDarkMode ? 'bg-[#223147] text-[#93c5fd]' : 'bg-[#eaeef2]'}`}>
                    {searchResults.characters.length}
                  </span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.characters.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveTab('characters');
                        setSelectedCharacterId(c.id);
                        setSearchQuery('');
                      }}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                        isDarkMode ? 'bg-[#111a28] hover:bg-[#1d2b40]' : 'bg-[#f6fafe] hover:bg-[#dfe3e7]'
                      }`}
                    >
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className={`font-semibold truncate ${isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>{c.name}</p>
                        <p className={`text-[10px] ${isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>{c.role}</p>
                      </div>
                    </div>
                  ))}
                  {searchResults.characters.length === 0 && (
                    <p className={`italic py-2 ${isDarkMode ? 'text-[#64748b]' : 'text-[#75777e]'}`}>Nenhum personagem encontrado.</p>
                  )}
                </div>
              </div>

              {/* Locations found */}
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-[#182232] border-[#223147]' : 'bg-white border-[#c5c6ce]'}`}>
                <h4 className={`font-bold mb-2 flex items-center justify-between ${isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>
                  <span>Cenários & Lore</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${isDarkMode ? 'bg-[#223147] text-[#93c5fd]' : 'bg-[#eaeef2]'}`}>
                    {searchResults.locations.length}
                  </span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.locations.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => {
                        setActiveTab('world');
                        setSelectedLocationId(l.id);
                        setSearchQuery('');
                      }}
                      className={`p-2 rounded cursor-pointer ${
                        isDarkMode ? 'bg-[#111a28] hover:bg-[#1d2b40]' : 'bg-[#f6fafe] hover:bg-[#dfe3e7]'
                      }`}
                    >
                      <p className={`font-semibold ${isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>{l.name}</p>
                      <p className={`text-[10px] truncate ${isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>{l.shortDescription}</p>
                    </div>
                  ))}
                  {searchResults.locations.length === 0 && (
                    <p className={`italic py-2 ${isDarkMode ? 'text-[#64748b]' : 'text-[#75777e]'}`}>Nenhum cenário encontrado.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <DashboardView
            project={project}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewChapter={() => setIsNewChapterOpen(true)}
            onExportJson={() => setIsExportOpen(true)}
            onOpenCharacterDetail={(id) => {
              setSelectedCharacterId(id);
              setActiveTab('characters');
            }}
            onOpenLocationDetail={(id) => {
              setSelectedLocationId(id);
              setActiveTab('world');
            }}
          />
        )}

        {activeTab === 'characters' && (
          <CharactersView
            project={project}
            onUpdateProject={handleUpdateProject}
            selectedCharId={selectedCharacterId}
            onSelectChar={setSelectedCharacterId}
          />
        )}

        {activeTab === 'world' && (
          <WorldView
            project={project}
            onUpdateProject={handleUpdateProject}
            selectedLocationId={selectedLocationId}
          />
        )}

        {activeTab === 'writing' && (
          <WritingStudioView
            project={project}
            onUpdateProject={handleUpdateProject}
            subTab={subTab}
            onSelectSubTab={setSubTab}
            onOpenFocusMode={handleOpenFocusMode}
            onOpenNewChapter={() => setIsNewChapterOpen(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            autoSaveStatus={autoSaveStatus}
            lastSavedAt={lastSavedAt}
            onForceSave={handleForceSave}
          />
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#04162e] text-white px-4 py-2.5 rounded-lg shadow-xl border border-blue-500/30 text-xs font-semibold animate-bounce"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Modals */}
      {isFocusModeOpen && (
        <FocusModeModal
          project={project}
          initialSceneId={focusSceneId}
          onClose={() => setIsFocusModeOpen(false)}
          onUpdateProject={handleUpdateProject}
          autoSaveStatus={autoSaveStatus}
          lastSavedAt={lastSavedAt}
          onForceSave={handleForceSave}
        />
      )}

      {isNewChapterOpen && (
        <NewChapterModal
          project={project}
          onClose={() => setIsNewChapterOpen(false)}
          onUpdateProject={handleUpdateProject}
        />
      )}

      {isExportOpen && (
        <ExportModal project={project} onClose={() => setIsExportOpen(false)} />
      )}

      {isSettingsOpen && (
        <SettingsModal
          project={project}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateProject={handleUpdateProject}
        />
      )}

      {isHistoryOpen && (
        <HistoryModal project={project} onClose={() => setIsHistoryOpen(false)} />
      )}

      {isShareOpen && (
        <ShareModal project={project} onClose={() => setIsShareOpen(false)} />
      )}

      {isSyncOpen && (
        <SyncModal
          project={project}
          onClose={() => setIsSyncOpen(false)}
          onRestoreDefaults={handleRestoreDefaults}
          onForceSave={handleForceSave}
        />
      )}
    </div>
  );
}
