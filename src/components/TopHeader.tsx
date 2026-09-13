import React from 'react';
import { NovelProject, TopSubTab, AutoSaveStatus, NavigationTab } from '../types';

interface TopHeaderProps {
  project: NovelProject;
  currentSubTab: TopSubTab;
  onSelectSubTab: (subTab: TopSubTab) => void;
  activeTab?: NavigationTab;
  onNavigateTab?: (tab: NavigationTab) => void;
  isBinderOpen?: boolean;
  onToggleBinder?: () => void;
  onSelectEditor?: () => void;
  isInspectorOpen?: boolean;
  onToggleInspector?: () => void;
  isStoryboardOpen?: boolean;
  onToggleStoryboard?: () => void;
  isReadingMode?: boolean;
  onToggleReadingMode?: () => void;
  onOpenFocusMode: () => void;
  onOpenNewChapter?: () => void;
  onOpenHistory: () => void;
  onOpenShare?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenAuthorProfile?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  autoSaveStatus?: AutoSaveStatus;
  lastSavedAt?: Date | null;
  onForceSave?: () => void;
  isSidebarOpen?: boolean;
  isMobileOpen?: boolean;
  onToggleSidebar?: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  project,
  currentSubTab,
  onSelectSubTab,
  activeTab,
  onNavigateTab,
  isBinderOpen,
  onToggleBinder,
  onSelectEditor,
  isInspectorOpen,
  onToggleInspector,
  isStoryboardOpen = false,
  onToggleStoryboard,
  onOpenFocusMode,
  onOpenHistory,
  isDarkMode = false,
  isSidebarOpen = true,
  isMobileOpen = false,
  onToggleSidebar,
  onToggleMobileMenu,
}) => {
  const handleSidebarToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (onToggleMobileMenu) {
        onToggleMobileMenu();
      } else if (onToggleSidebar) {
        onToggleSidebar();
      }
    } else {
      if (onToggleSidebar) {
        onToggleSidebar();
      }
    }
  };

  return (
    <header
      id="top-app-bar"
      className={`${
        isDarkMode
          ? 'bg-[#0d1420] border-[#1e293b] text-[#f1f5f9]'
          : 'bg-white border-[#c5c6ce] text-[#04162e]'
      } flex justify-between items-center w-full px-3 sm:px-6 lg:px-10 py-3.5 sm:py-4.5 lg:py-5 sticky top-0 z-30 border-b min-h-[64px] sm:min-h-[76px] lg:min-h-[80px] shrink-0 transition-colors duration-200`}
    >
      <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-6 min-w-0">
        {/* Sidebar Menu Toggle Button (Desktop & Mobile) */}
        {handleSidebarToggle && (
          <button
            id="btn-sidebar-toggle"
            onClick={handleSidebarToggle}
            className={`p-2 rounded-lg transition-colors cursor-pointer active:scale-95 flex items-center justify-center ${
              isDarkMode
                ? 'text-[#cbd5e1] hover:text-white hover:bg-[#16202f]'
                : 'text-[#334155] hover:text-[#04162e] hover:bg-[#eaeef2]'
            }`}
            title="Alternar menu lateral"
            aria-label="Alternar menu lateral"
          >
            <span className="material-symbols-outlined text-[24px] flex items-center justify-center">
              menu
            </span>
          </button>
        )}

        {/* Book Title & Subtitle (swapped from sidebar) */}
        <div
          id="topheader-book-info"
          className="flex flex-col min-w-0 max-w-[170px] sm:max-w-[280px] md:max-w-[360px] lg:max-w-[440px] pr-1 cursor-default justify-center"
        >
          <span
            id="topheader-book-title"
            className={`font-headline-md font-bold text-sm sm:text-base leading-tight truncate ${
              isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'
            }`}
            title={project.title}
          >
            {project.title}
          </span>
          <span
            id="topheader-book-subtitle"
            className={`font-interface-sm text-[11px] sm:text-xs truncate font-medium ${
              isDarkMode ? 'text-[#94a3b8]' : 'text-[#334155]'
            }`}
            title={project.subtitle || `Fase de ${project.phase}`}
          >
            {project.subtitle || `Fase de ${project.phase}`}
          </span>
        </div>

        {/* Navigation Sub-Links: Ficheiro & Inspetor */}
        <nav id="top-sub-nav" className="hidden sm:flex items-center flex-wrap gap-2 sm:gap-4 mt-0.5 shrink-0">
          {/* 1. Ficheiro */}
          <button
            id="subtab-binder"
            onClick={() => {
              if (activeTab && activeTab !== 'writing' && onNavigateTab) {
                onNavigateTab('writing');
              }
              if (onToggleBinder) {
                onToggleBinder();
              } else {
                onSelectSubTab('binder');
              }
            }}
            className={`pb-1 font-interface-sm text-interface-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'writing' && (isBinderOpen !== undefined ? isBinderOpen : currentSubTab === 'binder')
                ? isDarkMode
                  ? 'text-[#60a5fa] border-b-2 border-[#60a5fa] font-bold opacity-100'
                  : 'text-[#04162e] border-b-2 border-[#04162e] font-bold opacity-100'
                : isDarkMode
                ? 'text-[#cbd5e1] hover:text-white hover:opacity-100 border-b-2 border-transparent font-medium'
                : 'text-[#334155] hover:text-[#04162e] hover:opacity-100 border-b-2 border-transparent font-medium'
            }`}
            title="Ficheiro: Capítulos & Cenas no Inspetor [Ctrl+B]"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">folder_open</span>
            <span>Ficheiro</span>
          </button>

          {/* 2. Inspetor */}
          <button
            id="subtab-inspector"
            onClick={() => {
              if (activeTab && activeTab !== 'writing' && onNavigateTab) {
                onNavigateTab('writing');
              }
              if (onToggleInspector) {
                onToggleInspector();
              } else {
                onSelectSubTab('inspector');
              }
            }}
            className={`pb-1 font-interface-sm text-interface-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'writing' && (isInspectorOpen !== undefined ? isInspectorOpen : currentSubTab === 'inspector')
                ? isDarkMode
                  ? 'text-[#60a5fa] border-b-2 border-[#60a5fa] font-bold opacity-100'
                  : 'text-[#04162e] border-b-2 border-[#04162e] font-bold opacity-100'
                : isDarkMode
                ? 'text-[#cbd5e1] hover:text-white hover:opacity-100 border-b-2 border-transparent font-medium'
                : 'text-[#334155] hover:text-[#04162e] hover:opacity-100 border-b-2 border-transparent font-medium'
            }`}
            title="Inspetor: Sinopse, POV, Personagens e Estilo [Ctrl+I]"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">view_sidebar</span>
            <span>Inspetor</span>
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3">
        {/* Icon Action: History */}
        <button
          id="btn-header-history"
          onClick={onOpenHistory}
          className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 ${
            isDarkMode
              ? 'text-[#cbd5e1] hover:text-white hover:bg-[#16202f]'
              : 'text-[#334155] hover:text-[#04162e] hover:bg-[#eaeef2]'
          }`}
          title="Histórico de Revisões"
          aria-label="Histórico de Revisões"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">history</span>
          <span className="hidden md:inline text-xs font-medium">Revisões</span>
        </button>

        {/* Trailing Action: Modo Foco */}
        <button
          id="btn-modo-foco"
          onClick={onOpenFocusMode}
          className={`font-interface-sm text-interface-sm ${
            isDarkMode
              ? 'bg-[#16202f] hover:bg-[#1e293b] text-[#93c5fd] border-[#253347]'
              : 'bg-[#e4e9ed] hover:bg-[#d8e0e7] text-[#04162e] border-[#c5c6ce]'
          } border rounded-lg px-2.5 sm:px-3.5 py-1.5 active:scale-95 transition-all text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs`}
          title="Abrir Modo Foco / Zen de Escrita"
        >
          <span className="material-symbols-outlined text-[16px] sm:text-[18px]">center_focus_strong</span>
          <span className="hidden sm:inline">Modo Foco</span>
        </button>
      </div>
    </header>
  );
};

