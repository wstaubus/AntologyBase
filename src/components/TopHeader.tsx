import React, { useState } from 'react';
import { NovelProject, TopSubTab, AutoSaveStatus, NavigationTab } from '../types';
import { AutoSaveIndicator } from './AutoSaveIndicator';

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
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAuthorProfile?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  autoSaveStatus?: AutoSaveStatus;
  lastSavedAt?: Date | null;
  onForceSave?: () => void;
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
  searchQuery,
  onSearchChange,
  isDarkMode = false,
  autoSaveStatus = 'saved',
  lastSavedAt = null,
  onForceSave = () => {},
  onToggleMobileMenu,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header
      id="top-app-bar"
      className={`${
        isDarkMode
          ? 'bg-[#0d1420] border-[#1e293b] text-[#f1f5f9]'
          : 'bg-[#f6fafe] border-[#cbd5e1] text-[#0f172a]'
      } flex justify-between items-center w-full px-3 sm:px-6 lg:px-10 py-2 sticky top-0 z-30 border-b h-14 sm:h-16 shrink-0 transition-colors duration-200`}
    >
      <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-6 min-w-0">
        {/* Mobile Hamburger Menu Toggle Button (< lg) */}
        {onToggleMobileMenu && (
          <button
            id="btn-mobile-menu-toggle"
            onClick={onToggleMobileMenu}
            className={`lg:hidden p-2 rounded-lg transition-colors cursor-pointer active:scale-95 ${
              isDarkMode
                ? 'text-[#cbd5e1] hover:text-white hover:bg-[#16202f]'
                : 'text-[#1e293b] hover:text-[#04162e] hover:bg-[#eaeef2]'
            }`}
            title="Abrir menu de navegação"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        )}

        {/* Brand Logo */}
        <div
          id="brand-logo"
          className={`font-headline-md text-headline-md font-extrabold tracking-tight ${
            isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'
          } text-base sm:text-lg lg:text-xl cursor-default flex items-center shrink-0`}
        >
          <span>Antology Base</span>
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
                : 'text-[#1e293b] hover:text-[#04162e] hover:opacity-100 border-b-2 border-transparent font-medium'
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
                : 'text-[#1e293b] hover:text-[#04162e] hover:opacity-100 border-b-2 border-transparent font-medium'
            }`}
            title="Inspetor: Sinopse, POV, Personagens e Estilo [Ctrl+I]"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">view_sidebar</span>
            <span>Inspetor</span>
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3">
        {/* Search Bar on desktop */}
        <div className="relative hidden lg:block">
          <span
            className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-[#94a3b8]' : 'text-[#475569]'
            } text-base pointer-events-none`}
          >
            search
          </span>
          <input
            id="search-input-header"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Pesquisar..."
            className={`pl-9 pr-4 py-1.5 ${
              isDarkMode
                ? 'bg-[#16202f] border-[#253347] text-[#f8fafc] placeholder-[#94a3b8] focus:border-[#60a5fa] focus:ring-1 focus:ring-[#60a5fa]'
                : 'bg-[#eaeef2] border-[#cbd5e1] text-[#0f172a] placeholder-[#475569] focus:border-[#04162e] focus:ring-1 focus:ring-[#04162e]'
            } border rounded font-interface-sm text-interface-sm focus:outline-none transition-all text-xs lg:text-sm ${
              isSearchFocused ? 'w-52 lg:w-60' : 'w-36 lg:w-44'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
                isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-[#04162e]'
              }`}
              title="Limpar busca"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Mobile Search Toggle Icon (< md) */}
        <button
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className={`md:hidden p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDarkMode
              ? 'text-[#cbd5e1] hover:text-white hover:bg-[#16202f]'
              : 'text-[#1e293b] hover:text-[#04162e] hover:bg-[#eaeef2]'
          }`}
          title="Pesquisar"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>

        {/* Auto Save Status Badge */}
        <div className="hidden sm:block">
          <AutoSaveIndicator
            status={autoSaveStatus}
            lastSavedAt={lastSavedAt}
            onForceSave={onForceSave}
            isDarkEffective={isDarkMode}
            compact={false}
          />
        </div>

        {/* Compact Auto Save version on very small screens */}
        <div className="block sm:hidden">
          <AutoSaveIndicator
            status={autoSaveStatus}
            lastSavedAt={lastSavedAt}
            onForceSave={onForceSave}
            isDarkEffective={isDarkMode}
            compact={true}
          />
        </div>

        {/* Icon Action: History (Hidden on smallest mobile, visible on sm+) */}
        <button
          id="btn-header-history"
          onClick={onOpenHistory}
          className={`hidden sm:flex p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer active:scale-95 ${
            isDarkMode
              ? 'text-[#cbd5e1] hover:text-white hover:bg-[#16202f]'
              : 'text-[#1e293b] hover:text-[#04162e] hover:bg-[#eaeef2]'
          }`}
          title="Histórico de Revisões"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">history</span>
        </button>

        {/* Trailing Action: Modo Foco */}
        <button
          id="btn-modo-foco"
          onClick={onOpenFocusMode}
          className={`font-interface-sm text-interface-sm ${
            isDarkMode
              ? 'bg-[#16202f] hover:bg-[#1e293b] text-[#93c5fd] border-[#253347]'
              : 'bg-[#e4e9ed] hover:bg-[#d8e0e7] text-[#04162e] border-[#cbd5e1]'
          } border rounded-lg px-2.5 sm:px-3.5 py-1.5 active:scale-95 transition-all text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs`}
          title="Abrir Modo Foco / Zen de Escrita"
        >
          <span className="material-symbols-outlined text-[16px] sm:text-[18px]">center_focus_strong</span>
          <span className="hidden sm:inline">Modo Foco</span>
        </button>
      </div>

      {/* Expandable Mobile Search Dropdown (< md) */}
      {isMobileSearchOpen && (
        <div
          className={`md:hidden absolute top-full left-0 right-0 p-3 border-b shadow-lg z-50 flex items-center gap-2 ${
            isDarkMode ? 'bg-[#0d1420] border-[#1e293b]' : 'bg-[#f6fafe] border-[#c5c6ce]'
          }`}
        >
          <span className="material-symbols-outlined text-[#94a3b8] text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar cenas, personagens ou locais..."
            autoFocus
            className={`flex-1 px-3 py-1.5 rounded text-xs border ${
              isDarkMode
                ? 'bg-[#16202f] border-[#253347] text-white placeholder-gray-500'
                : 'bg-white border-[#c5c6ce] text-[#171c1f] placeholder-gray-400'
            } focus:outline-none`}
          />
          <button
            onClick={() => setIsMobileSearchOpen(false)}
            className="p-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            Fechar
          </button>
        </div>
      )}
    </header>
  );
};

