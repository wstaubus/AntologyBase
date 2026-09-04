import React from 'react';
import { NovelProject, NavigationTab } from '../types';

interface SidebarProps {
  project: NovelProject;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onOpenSync: () => void;
  onOpenShare?: () => void;
  onOpenAuthorProfile?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  project,
  activeTab,
  onSelectTab,
  onOpenExport,
  onOpenSettings,
  onOpenSync,
  onOpenShare,
  onOpenAuthorProfile,
  isDarkMode = false,
  onToggleDarkMode,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const handleTabClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleExportClick = () => {
    onOpenExport();
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleSettingsClick = () => {
    onOpenSettings();
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleSyncClick = () => {
    onOpenSync();
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleShareClick = () => {
    if (onOpenShare) {
      onOpenShare();
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleAuthorProfileClick = () => {
    if (onOpenAuthorProfile) {
      onOpenAuthorProfile();
    } else {
      onOpenSettings();
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const totalScenes = project.chapters.reduce((acc, c) => acc + c.scenes.length, 0);

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Navigation: Fixed off-canvas on mobile/tablet (<lg), persistent on desktop (>=lg) */}
      <nav
        id="sidebar-nav"
        className={`${
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'
        } w-[280px] sm:w-[300px] h-screen fixed left-0 top-0 border-r ${
          isDarkMode
            ? 'bg-[#0b111a] border-[#1e293b] text-[#e2e8f0]'
            : 'bg-[#eaeef2] border-[#c5c6ce] text-[#171c1f]'
        } flex flex-col py-4 z-50 select-none transition-all duration-300 ease-in-out ${
          isMobileOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Area with Toggle / Close Button & Book Cover */}
        <div className={`mb-4 sm:mb-6 flex flex-col ${isCollapsed ? 'lg:px-2 lg:items-center px-4' : 'px-4 sm:px-5'}`}>
          {/* Toggle Expand/Collapse & Mobile Close Row */}
          <div
            className={`flex items-center ${
              isCollapsed ? 'lg:justify-center justify-between w-full mb-3' : 'justify-between w-full mb-3 sm:mb-4'
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider text-[#44474d] dark:text-[#94a3b8] opacity-70 ${isCollapsed ? 'lg:hidden' : ''}`}>
              Projeto Ativo
            </span>

            <div className="flex items-center gap-1">
              {/* Desktop toggle button */}
              {onToggleCollapse && (
                <button
                  id="btn-toggle-sidebar"
                  onClick={onToggleCollapse}
                  className={`hidden lg:flex p-1.5 rounded-lg transition-all cursor-pointer ${
                    isDarkMode
                      ? 'hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc]'
                      : 'hover:bg-[#dfe3e7] text-[#44474d] hover:text-[#04162e]'
                  }`}
                  title={
                    isCollapsed
                      ? 'Expandir menu lateral (Ctrl+B)'
                      : 'Recolher menu lateral (Ctrl+B)'
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isCollapsed ? 'dock_to_left' : 'menu_open'}
                  </span>
                </button>
              )}

              {/* Mobile Close Drawer Button */}
              {onCloseMobile && (
                <button
                  id="btn-close-mobile-sidebar"
                  onClick={onCloseMobile}
                  className={`lg:hidden p-1.5 rounded-lg transition-all cursor-pointer ${
                    isDarkMode
                      ? 'hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc]'
                      : 'hover:bg-[#dfe3e7] text-[#44474d] hover:text-[#04162e]'
                  }`}
                  title="Fechar menu"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Book Cover and Title */}
          {isCollapsed ? (
            <>
              {/* Collapsed desktop view */}
              <div className="hidden lg:flex flex-col items-center gap-2 w-full">
                <button
                  id="btn-export-project-collapsed"
                  onClick={handleExportClick}
                  title={`Exportar Projeto: ${project.title}`}
                  className={`w-10 h-10 rounded-lg ${
                    isDarkMode
                      ? 'bg-[#2563eb] text-[#ffffff] hover:bg-[#1d4ed8]'
                      : 'bg-[#04162e] text-[#ffffff] hover:opacity-90'
                  } flex items-center justify-center transition-all shadow-sm cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                </button>
              </div>

              {/* Expanded on mobile drawer even if collapsed on desktop */}
              <div className="flex lg:hidden flex-col gap-3">
                <div className="min-w-0">
                  <h2
                    className={`font-headline-md text-headline-md ${
                      isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'
                    } font-bold text-base leading-tight truncate`}
                    title={project.title}
                  >
                    {project.title}
                  </h2>
                  <span
                    className={`font-interface-sm text-interface-sm ${
                      isDarkMode ? 'text-[#cbd5e1]' : 'text-[#334155]'
                    } text-xs block mt-1 truncate font-medium`}
                  >
                    {project.subtitle || `Fase de ${project.phase}`}
                  </span>
                </div>

                <button
                  onClick={handleExportClick}
                  className={`w-full ${
                    isDarkMode
                      ? 'bg-[#2563eb] text-[#ffffff] hover:bg-[#1d4ed8]'
                      : 'bg-[#04162e] text-[#ffffff] hover:opacity-90'
                  } font-interface-sm text-interface-sm text-xs font-semibold py-2 px-4 rounded active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  Exportar Projeto
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="min-w-0">
                <h2
                  id="sidebar-book-title"
                  className={`font-headline-md text-headline-md ${
                    isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'
                  } font-bold text-base lg:text-lg leading-tight truncate`}
                  title={project.title}
                >
                  {project.title}
                </h2>
                <span
                  id="sidebar-book-phase"
                  className={`font-interface-sm text-interface-sm ${
                    isDarkMode ? 'text-[#cbd5e1]' : 'text-[#334155]'
                  } text-xs block mt-1 truncate font-medium`}
                >
                  {project.subtitle || `Fase de ${project.phase}`}
                </span>
              </div>

              <button
                id="btn-export-project"
                onClick={handleExportClick}
                className={`w-full ${
                  isDarkMode
                    ? 'bg-[#2563eb] text-[#ffffff] hover:bg-[#1d4ed8]'
                    : 'bg-[#04162e] text-[#ffffff] hover:opacity-90'
                } font-interface-sm text-interface-sm text-xs font-semibold py-2 px-4 rounded active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer`}
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                Exportar Projeto
              </button>
            </div>
          )}
        </div>

        {/* Main Navigation Tabs */}
        <ul className={`flex flex-col flex-grow w-full space-y-1 overflow-y-auto ${isCollapsed ? 'lg:px-2 px-3' : 'px-3 sm:px-0'}`}>
          {/* Painel / Dashboard */}
          <li>
            <button
              id="nav-tab-dashboard"
              onClick={() => handleTabClick('dashboard')}
              title="Painel de Controle (Dashboard)"
              className={`w-full flex items-center transition-all cursor-pointer ${
                isCollapsed
                  ? `lg:justify-center lg:h-11 lg:w-11 lg:mx-auto lg:rounded-xl gap-3 px-4 py-2.5 sm:px-5 sm:py-3 text-left rounded-lg ${
                      activeTab === 'dashboard'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
                  : `gap-3 px-4 py-2.5 sm:px-5 sm:py-3 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'dashboard'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-2 sm:border-[#04162e] bg-[#e4e9ed] font-bold opacity-100 sm:shadow-[inset_2px_0_0_#04162e]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{
                  fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                dashboard
              </span>
              <span className={`font-interface-sm text-interface-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                Painel
              </span>
            </button>
          </li>

          {/* Estrutura & Storyboard */}
          <li>
            <button
              id="nav-tab-storyboard"
              onClick={() => handleTabClick('storyboard')}
              title={`Estrutura & Storyboard (${project.chapters.length} cap., ${totalScenes} cenas)`}
              className={`w-full flex items-center transition-all cursor-pointer relative ${
                isCollapsed
                  ? `lg:justify-center lg:h-11 lg:w-11 lg:mx-auto lg:rounded-xl gap-3 px-4 py-2.5 sm:px-5 sm:py-3 text-left rounded-lg ${
                      activeTab === 'storyboard'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
                  : `gap-3 px-4 py-2.5 sm:px-5 sm:py-3 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'storyboard'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-2 sm:border-[#04162e] bg-[#e4e9ed] font-bold opacity-100 sm:shadow-[inset_2px_0_0_#04162e]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings: activeTab === 'storyboard' ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  grid_view
                </span>
                {isCollapsed && project.chapters.length > 0 && (
                  <span className="hidden lg:flex absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full items-center justify-center border border-white dark:border-[#0b111a]">
                    {project.chapters.length}
                  </span>
                )}
              </div>
              <div className={`flex items-center justify-between w-full ${isCollapsed ? 'lg:hidden' : ''}`}>
                <span className="font-interface-sm text-interface-sm">Estrutura & Storyboard</span>
                <span
                  className={`text-[11px] font-bold ${
                    isDarkMode ? 'bg-[#1e293b] text-[#cbd5e1]' : 'bg-[#cbd5e1] text-[#0f172a]'
                  } px-2 py-0.5 rounded-full`}
                >
                  {project.chapters.length} cap.
                </span>
              </div>
            </button>
          </li>

          {/* Personagens */}
          <li>
            <button
              id="nav-tab-characters"
              onClick={() => handleTabClick('characters')}
              title={`Personagens (${project.characters.length})`}
              className={`w-full flex items-center transition-all cursor-pointer relative ${
                isCollapsed
                  ? `lg:justify-center lg:h-11 lg:w-11 lg:mx-auto lg:rounded-xl gap-3 px-4 py-2.5 sm:px-5 sm:py-3 text-left rounded-lg ${
                      activeTab === 'characters'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
                  : `gap-3 px-4 py-2.5 sm:px-5 sm:py-3 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'characters'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-2 sm:border-[#04162e] bg-[#e4e9ed] font-bold opacity-100 sm:shadow-[inset_2px_0_0_#04162e]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings: activeTab === 'characters' ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  group
                </span>
                {isCollapsed && project.characters.length > 0 && (
                  <span className="hidden lg:flex absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full items-center justify-center border border-white dark:border-[#0b111a]">
                    {project.characters.length}
                  </span>
                )}
              </div>
              <div className={`flex items-center justify-between w-full ${isCollapsed ? 'lg:hidden' : ''}`}>
                <span className="font-interface-sm text-interface-sm">Personagens</span>
                <span
                  className={`text-[11px] font-bold ${
                    isDarkMode ? 'bg-[#1e293b] text-[#cbd5e1]' : 'bg-[#cbd5e1] text-[#0f172a]'
                  } px-2 py-0.5 rounded-full`}
                >
                  {project.characters.length}
                </span>
              </div>
            </button>
          </li>

          {/* Construção de Mundo */}
          <li>
            <button
              id="nav-tab-world"
              onClick={() => handleTabClick('world')}
              title="Construção de Mundo (Worldbuilding)"
              className={`w-full flex items-center transition-all cursor-pointer ${
                isCollapsed
                  ? `lg:justify-center lg:h-11 lg:w-11 lg:mx-auto lg:rounded-xl gap-3 px-4 py-2.5 sm:px-5 sm:py-3 text-left rounded-lg ${
                      activeTab === 'world'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
                  : `gap-3 px-4 py-2.5 sm:px-5 sm:py-3 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'world'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-2 sm:border-[#04162e] bg-[#e4e9ed] font-bold opacity-100 sm:shadow-[inset_2px_0_0_#04162e]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{
                  fontVariationSettings: activeTab === 'world' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                public
              </span>
              <span className={`font-interface-sm text-interface-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                Construção de Mundo
              </span>
            </button>
          </li>

          {/* Estúdio de Escrita */}
          <li>
            <button
              id="nav-tab-writing"
              onClick={() => handleTabClick('writing')}
              title="Estúdio de Escrita (Editor)"
              className={`w-full flex items-center transition-all cursor-pointer ${
                isCollapsed
                  ? `lg:justify-center lg:h-11 lg:w-11 lg:mx-auto lg:rounded-xl gap-3 px-4 py-2.5 sm:px-5 sm:py-3 text-left rounded-lg ${
                      activeTab === 'writing'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
                  : `gap-3 px-4 py-2.5 sm:px-5 sm:py-3 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'writing'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-2 sm:border-[#04162e] bg-[#e4e9ed] font-bold opacity-100 sm:shadow-[inset_2px_0_0_#04162e]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{
                  fontVariationSettings: activeTab === 'writing' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                edit_note
              </span>
              <span className={`font-interface-sm text-interface-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                Estúdio de Escrita
              </span>
            </button>
          </li>
        </ul>

        {/* Footer Navigation Area */}
        <ul
          className={`flex flex-col w-full mt-auto mb-0 border-t ${
            isDarkMode ? 'border-[#1e293b]' : 'border-[#cbd5e1]'
          } pt-2 space-y-1 ${isCollapsed ? 'lg:px-2 lg:items-center px-3' : 'px-3 sm:px-0'}`}
        >
          {onToggleDarkMode && (
            <li>
              <button
                id="sidebar-btn-theme-toggle"
                onClick={onToggleDarkMode}
                title={isDarkMode ? 'Alternar para Modo Diurno' : 'Alternar para Modo Noturno'}
                className={`flex items-center transition-colors cursor-pointer ${
                  isCollapsed
                    ? `lg:justify-center lg:h-10 lg:w-10 lg:rounded-xl w-full gap-3 px-4 py-2 text-left rounded-lg ${
                        isDarkMode
                          ? 'text-amber-300 hover:bg-[#131b26]'
                          : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                      }`
                    : `w-full gap-3 px-4 py-2 sm:px-5 sm:py-2 text-left rounded-lg sm:rounded-none ${
                        isDarkMode
                          ? 'text-amber-300 hover:bg-[#131b26]'
                          : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                      }`
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
                <span className={`font-interface-sm text-interface-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                  {isDarkMode ? 'Modo Diurno' : 'Modo Noturno'}
                </span>
              </button>
            </li>
          )}

          {onOpenShare && (
            <li>
              <button
                id="nav-btn-share"
                onClick={handleShareClick}
                title="Compartilhar Projeto"
                className={`flex items-center transition-colors cursor-pointer ${
                  isCollapsed
                    ? `lg:justify-center lg:h-10 lg:w-10 lg:rounded-xl w-full gap-3 px-4 py-2 text-left rounded-lg ${
                        isDarkMode
                          ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                          : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                      }`
                    : `w-full gap-3 px-4 py-2 sm:px-5 sm:py-2 text-left rounded-lg sm:rounded-none ${
                        isDarkMode
                          ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                          : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                      }`
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
                <span className={`font-interface-sm text-interface-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                  Compartilhar
                </span>
              </button>
            </li>
          )}

          <li>
            <button
              id="nav-btn-settings"
              onClick={handleSettingsClick}
              title="Configurações do Projeto"
              className={`flex items-center transition-colors cursor-pointer ${
                isCollapsed
                  ? `lg:justify-center lg:h-10 lg:w-10 lg:rounded-xl w-full gap-3 px-4 py-2 text-left rounded-lg ${
                      isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
                  : `w-full gap-3 px-4 py-2 sm:px-5 sm:py-2 text-left rounded-lg sm:rounded-none ${
                      isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className={`font-interface-sm text-interface-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                Configurações
              </span>
            </button>
          </li>

          <li>
            <button
              id="nav-btn-sync"
              onClick={handleSyncClick}
              title="Sincronização & Backup Local"
              className={`flex items-center transition-colors cursor-pointer relative ${
                isCollapsed
                  ? `lg:justify-center lg:h-10 lg:w-10 lg:rounded-xl w-full gap-3 px-4 py-2 text-left rounded-lg ${
                      isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
                  : `w-full gap-3 px-4 py-2 sm:px-5 sm:py-2 text-left rounded-lg sm:rounded-none ${
                      isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#1e293b] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
                {isCollapsed && (
                  <span
                    className="hidden lg:block absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0b111a]"
                    title="Sincronizado"
                  />
                )}
              </div>
              <div className={`flex items-center justify-between w-full ${isCollapsed ? 'lg:hidden' : ''}`}>
                <span className="font-interface-sm text-interface-sm">Sincronizar</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Sincronizado" />
              </div>
            </button>
          </li>

          {/* Expand button at bottom when collapsed on desktop */}
          {isCollapsed && onToggleCollapse && (
            <li className="hidden lg:flex pt-2 border-t border-[#cbd5e1] dark:border-[#1e293b] w-full justify-center">
              <button
                onClick={onToggleCollapse}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isDarkMode
                    ? 'hover:bg-[#1e293b] text-[#cbd5e1] hover:text-[#f8fafc]'
                    : 'hover:bg-[#dfe3e7] text-[#1e293b] hover:text-[#04162e]'
                }`}
                title="Expandir menu lateral (Ctrl+B)"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </li>
          )}
        </ul>

        {/* Author Avatar & Profile Row */}
        <div
          className={`mt-2 pt-2.5 border-t ${
            isDarkMode ? 'border-[#1e293b]' : 'border-[#cbd5e1]'
          } ${isCollapsed ? 'lg:px-2 px-3' : 'px-3 sm:px-4'}`}
        >
          <button
            id="sidebar-author-profile"
            onClick={handleAuthorProfileClick}
            title={`${project.author.name} (Autor) - Abrir Perfil do Autor`}
            className={`w-full flex items-center transition-all cursor-pointer group ${
              isCollapsed
                ? 'lg:justify-center lg:p-1 lg:rounded-xl gap-3 p-2 rounded-xl text-left hover:bg-[#dfe3e7] dark:hover:bg-[#16202f]'
                : 'gap-3 p-2 rounded-xl text-left hover:bg-[#dfe3e7] dark:hover:bg-[#16202f]'
            }`}
          >
            <div className="relative shrink-0 flex items-center justify-center">
              <img
                id="sidebar-author-avatar"
                src={project.author.avatarUrl}
                alt={project.author.name}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[#cbd5e1] dark:border-[#334155] group-hover:ring-2 group-hover:ring-[#2563eb] transition-all"
              />
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0b111a]"
                title="Online"
              />
            </div>

            <div className={`min-w-0 flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] truncate leading-tight group-hover:text-[#2563eb] dark:group-hover:text-[#60a5fa] transition-colors">
                {project.author.name}
              </p>
              <p className="text-[11px] font-medium text-[#334155] dark:text-[#cbd5e1] truncate">
                Autor &bull; Perfil
              </p>
            </div>

            <span
              className={`material-symbols-outlined text-[18px] text-[#334155] dark:text-[#cbd5e1] group-hover:translate-x-0.5 transition-transform ${
                isCollapsed ? 'lg:hidden' : ''
              }`}
            >
              person
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};



