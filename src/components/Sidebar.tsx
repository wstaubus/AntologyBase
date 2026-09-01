import React from 'react';
import { NovelProject, NavigationTab } from '../types';

interface SidebarProps {
  project: NovelProject;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onOpenSync: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  project,
  activeTab,
  onSelectTab,
  onOpenExport,
  onOpenSettings,
  onOpenSync,
  isDarkMode = false,
  onToggleDarkMode,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <nav
      id="sidebar-nav"
      className={`${
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      } h-screen fixed left-0 top-0 border-r ${
        isDarkMode
          ? 'bg-[#0b111a] border-[#1e293b] text-[#e2e8f0]'
          : 'bg-[#eaeef2] border-[#c5c6ce] text-[#171c1f]'
      } flex flex-col py-4 z-50 select-none transition-all duration-200 ease-in-out`}
    >
      {/* Header Area with Toggle Button & Book Cover */}
      <div className={`mb-6 flex flex-col ${isCollapsed ? 'px-2 items-center' : 'px-5'}`}>
        {/* Toggle Expand/Collapse Row */}
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center w-full mb-3' : 'justify-between w-full mb-4'
          }`}
        >
          {!isCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#44474d] dark:text-[#94a3b8] opacity-70">
              Projeto Ativo
            </span>
          )}
          {onToggleCollapse && (
            <button
              id="btn-toggle-sidebar"
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
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
        </div>

        {/* Book Cover and Title */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <button
              id="btn-export-project-collapsed"
              onClick={onOpenExport}
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
                  isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'
                } text-xs block mt-1 truncate`}
              >
                {project.subtitle || `Fase de ${project.phase}`}
              </span>
            </div>

            <button
              id="btn-export-project"
              onClick={onOpenExport}
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
      <ul className={`flex flex-col flex-grow w-full space-y-1 ${isCollapsed ? 'px-2' : ''}`}>
        {/* Painel / Dashboard */}
        <li>
          <button
            id="nav-tab-dashboard"
            onClick={() => onSelectTab('dashboard')}
            title="Painel de Controle (Dashboard)"
            className={`w-full flex items-center transition-all cursor-pointer ${
              isCollapsed
                ? `justify-center h-11 w-11 mx-auto rounded-xl ${
                    activeTab === 'dashboard'
                      ? isDarkMode
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : 'bg-[#04162e] text-white shadow-sm'
                      : isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                  }`
                : `gap-3 px-5 py-3 text-left ${
                    activeTab === 'dashboard'
                      ? isDarkMode
                        ? 'text-[#60a5fa] border-l-2 border-[#60a5fa] bg-[#16202f] font-bold shadow-[inset_2px_0_0_#60a5fa]'
                        : 'text-[#04162e] border-l-2 border-[#04162e] bg-[#e4e9ed] font-bold opacity-100 shadow-[inset_2px_0_0_#04162e]'
                      : isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
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
            {!isCollapsed && <span className="font-interface-sm text-interface-sm">Painel</span>}
          </button>
        </li>

        {/* Personagens */}
        <li>
          <button
            id="nav-tab-characters"
            onClick={() => onSelectTab('characters')}
            title={`Personagens (${project.characters.length})`}
            className={`w-full flex items-center transition-all cursor-pointer relative ${
              isCollapsed
                ? `justify-center h-11 w-11 mx-auto rounded-xl ${
                    activeTab === 'characters'
                      ? isDarkMode
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : 'bg-[#04162e] text-white shadow-sm'
                      : isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                  }`
                : `gap-3 px-5 py-3 text-left ${
                    activeTab === 'characters'
                      ? isDarkMode
                        ? 'text-[#60a5fa] border-l-2 border-[#60a5fa] bg-[#16202f] font-bold shadow-[inset_2px_0_0_#60a5fa]'
                        : 'text-[#04162e] border-l-2 border-[#04162e] bg-[#e4e9ed] font-bold opacity-100 shadow-[inset_2px_0_0_#04162e]'
                      : isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
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
                <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-[#0b111a]">
                  {project.characters.length}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <>
                <span className="font-interface-sm text-interface-sm">Personagens</span>
                <span
                  className={`ml-auto text-[11px] font-semibold ${
                    isDarkMode ? 'bg-[#1e293b] text-[#94a3b8]' : 'bg-[#dfe3e7] text-[#44474d]'
                  } px-2 py-0.5 rounded-full`}
                >
                  {project.characters.length}
                </span>
              </>
            )}
          </button>
        </li>

        {/* Construção de Mundo */}
        <li>
          <button
            id="nav-tab-world"
            onClick={() => onSelectTab('world')}
            title="Construção de Mundo (Worldbuilding)"
            className={`w-full flex items-center transition-all cursor-pointer ${
              isCollapsed
                ? `justify-center h-11 w-11 mx-auto rounded-xl ${
                    activeTab === 'world'
                      ? isDarkMode
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : 'bg-[#04162e] text-white shadow-sm'
                      : isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                  }`
                : `gap-3 px-5 py-3 text-left ${
                    activeTab === 'world'
                      ? isDarkMode
                        ? 'text-[#60a5fa] border-l-2 border-[#60a5fa] bg-[#16202f] font-bold shadow-[inset_2px_0_0_#60a5fa]'
                        : 'text-[#04162e] border-l-2 border-[#04162e] bg-[#e4e9ed] font-bold opacity-100 shadow-[inset_2px_0_0_#04162e]'
                      : isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
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
            {!isCollapsed && (
              <span className="font-interface-sm text-interface-sm">Construção de Mundo</span>
            )}
          </button>
        </li>

        {/* Estúdio de Escrita */}
        <li>
          <button
            id="nav-tab-writing"
            onClick={() => onSelectTab('writing')}
            title="Estúdio de Escrita (Editor)"
            className={`w-full flex items-center transition-all cursor-pointer ${
              isCollapsed
                ? `justify-center h-11 w-11 mx-auto rounded-xl ${
                    activeTab === 'writing'
                      ? isDarkMode
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : 'bg-[#04162e] text-white shadow-sm'
                      : isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                  }`
                : `gap-3 px-5 py-3 text-left ${
                    activeTab === 'writing'
                      ? isDarkMode
                        ? 'text-[#60a5fa] border-l-2 border-[#60a5fa] bg-[#16202f] font-bold shadow-[inset_2px_0_0_#60a5fa]'
                        : 'text-[#04162e] border-l-2 border-[#04162e] bg-[#e4e9ed] font-bold opacity-100 shadow-[inset_2px_0_0_#04162e]'
                      : isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
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
            {!isCollapsed && (
              <span className="font-interface-sm text-interface-sm">Estúdio de Escrita</span>
            )}
          </button>
        </li>
      </ul>

      {/* Footer Navigation Area */}
      <ul
        className={`flex flex-col w-full mt-auto mb-0 border-t ${
          isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]'
        } pt-2 space-y-1 ${isCollapsed ? 'px-2 items-center' : ''}`}
      >
        {onToggleDarkMode && (
          <li>
            <button
              id="sidebar-btn-theme-toggle"
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Alternar para Modo Diurno' : 'Alternar para Modo Noturno'}
              className={`flex items-center transition-colors cursor-pointer ${
                isCollapsed
                  ? `justify-center h-10 w-10 rounded-xl ${
                      isDarkMode
                        ? 'text-amber-300 hover:bg-[#131b26]'
                        : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
                  : `w-full gap-3 px-5 py-2 text-left ${
                      isDarkMode
                        ? 'text-amber-300 hover:bg-[#131b26]'
                        : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                    }`
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
              {!isCollapsed && (
                <span className="font-interface-sm text-interface-sm">
                  {isDarkMode ? 'Modo Diurno' : 'Modo Noturno'}
                </span>
              )}
            </button>
          </li>
        )}

        <li>
          <button
            id="nav-btn-settings"
            onClick={onOpenSettings}
            title="Configurações do Projeto"
            className={`flex items-center transition-colors cursor-pointer ${
              isCollapsed
                ? `justify-center h-10 w-10 rounded-xl ${
                    isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                  }`
                : `w-full gap-3 px-5 py-2 text-left ${
                    isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                  }`
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            {!isCollapsed && (
              <span className="font-interface-sm text-interface-sm">Configurações</span>
            )}
          </button>
        </li>

        <li>
          <button
            id="nav-btn-sync"
            onClick={onOpenSync}
            title="Sincronização & Backup Local"
            className={`flex items-center transition-colors cursor-pointer relative ${
              isCollapsed
                ? `justify-center h-10 w-10 rounded-xl ${
                    isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                  }`
                : `w-full gap-3 px-5 py-2 text-left ${
                    isDarkMode
                      ? 'text-[#94a3b8] hover:bg-[#131b26] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#dfe3e7] hover:text-[#04162e]'
                  }`
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
              {isCollapsed && (
                <span
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0b111a]"
                  title="Sincronizado"
                />
              )}
            </div>
            {!isCollapsed && (
              <>
                <span className="font-interface-sm text-interface-sm">Sincronizar</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" title="Sincronizado" />
              </>
            )}
          </button>
        </li>

        {/* Expand button at bottom when collapsed */}
        {isCollapsed && onToggleCollapse && (
          <li className="pt-2 border-t border-[#c5c6ce]/50 dark:border-[#1e293b] w-full flex justify-center">
            <button
              onClick={onToggleCollapse}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isDarkMode
                  ? 'hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc]'
                  : 'hover:bg-[#dfe3e7] text-[#44474d] hover:text-[#04162e]'
              }`}
              title="Expandir menu lateral (Ctrl+B)"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};


