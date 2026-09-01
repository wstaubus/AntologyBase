import React, { useState } from 'react';
import { NovelProject, TopSubTab, AutoSaveStatus } from '../types';
import { AutoSaveIndicator } from './AutoSaveIndicator';

interface TopHeaderProps {
  project: NovelProject;
  currentSubTab: TopSubTab;
  onSelectSubTab: (subTab: TopSubTab) => void;
  onOpenFocusMode: () => void;
  onOpenNewChapter: () => void;
  onOpenHistory: () => void;
  onOpenShare: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAuthorProfile: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  autoSaveStatus?: AutoSaveStatus;
  lastSavedAt?: Date | null;
  onForceSave?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  project,
  currentSubTab,
  onSelectSubTab,
  onOpenFocusMode,
  onOpenNewChapter,
  onOpenHistory,
  onOpenShare,
  searchQuery,
  onSearchChange,
  onOpenAuthorProfile,
  isDarkMode = false,
  autoSaveStatus = 'saved',
  lastSavedAt = null,
  onForceSave = () => {},
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header
      id="top-app-bar"
      className={`${
        isDarkMode
          ? 'bg-[#0d1420] border-[#1e293b] text-[#e2e8f0]'
          : 'bg-[#f6fafe] border-[#c5c6ce] text-[#171c1f]'
      } flex justify-between items-center w-full px-4 sm:px-6 lg:px-12 py-2 sticky top-0 z-40 border-b h-16 shrink-0 transition-colors duration-200`}
    >
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 min-w-0">
        {/* Brand Logo */}
        <div
          id="brand-logo"
          className={`font-headline-md text-headline-md font-extrabold tracking-tight ${
            isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'
          } text-xl lg:text-2xl cursor-default flex items-center shrink-0`}
        >
          <span>Antology Base</span>
        </div>

        {/* Navigation Sub-Links */}
        <nav id="top-sub-nav" className="flex items-center gap-3 sm:gap-5 lg:gap-6 mt-0.5 shrink-0">
          <button
            id="subtab-binder"
            onClick={() => onSelectSubTab('binder')}
            className={`pb-1 font-interface-sm text-interface-sm transition-all cursor-pointer ${
              currentSubTab === 'binder'
                ? isDarkMode
                  ? 'text-[#60a5fa] border-b-2 border-[#60a5fa] font-semibold opacity-100'
                  : 'text-[#04162e] border-b-2 border-[#04162e] font-semibold opacity-100'
                : isDarkMode
                ? 'text-[#94a3b8] hover:text-[#f8fafc] opacity-80 hover:opacity-100 border-b-2 border-transparent'
                : 'text-[#44474d] hover:text-[#04162e] opacity-80 hover:opacity-100 border-b-2 border-transparent'
            }`}
          >
            Fichário
          </button>

          <button
            id="subtab-canvas"
            onClick={() => onSelectSubTab('canvas')}
            className={`pb-1 font-interface-sm text-interface-sm transition-all cursor-pointer ${
              currentSubTab === 'canvas'
                ? isDarkMode
                  ? 'text-[#60a5fa] border-b-2 border-[#60a5fa] font-semibold opacity-100'
                  : 'text-[#04162e] border-b-2 border-[#04162e] font-semibold opacity-100'
                : isDarkMode
                ? 'text-[#94a3b8] hover:text-[#f8fafc] opacity-80 hover:opacity-100 border-b-2 border-transparent'
                : 'text-[#44474d] hover:text-[#04162e] opacity-80 hover:opacity-100 border-b-2 border-transparent'
            }`}
          >
            Tela
          </button>

          <button
            id="subtab-inspector"
            onClick={() => onSelectSubTab('inspector')}
            className={`pb-1 font-interface-sm text-interface-sm transition-all cursor-pointer ${
              currentSubTab === 'inspector'
                ? isDarkMode
                  ? 'text-[#60a5fa] border-b-2 border-[#60a5fa] font-semibold opacity-100'
                  : 'text-[#04162e] border-b-2 border-[#04162e] font-semibold opacity-100'
                : isDarkMode
                ? 'text-[#94a3b8] hover:text-[#f8fafc] opacity-80 hover:opacity-100 border-b-2 border-transparent'
                : 'text-[#44474d] hover:text-[#04162e] opacity-80 hover:opacity-100 border-b-2 border-transparent'
            }`}
          >
            Inspetor
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <span
            className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'
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
            placeholder="Pesquisar projeto..."
            className={`pl-9 pr-4 py-1.5 ${
              isDarkMode
                ? 'bg-[#16202f] border-[#253347] text-[#f1f5f9] placeholder-[#64748b] focus:border-[#60a5fa] focus:ring-1 focus:ring-[#60a5fa]'
                : 'bg-[#eaeef2] border-[#c5c6ce] text-[#171c1f] placeholder-gray-500 focus:border-[#04162e] focus:ring-1 focus:ring-[#04162e]'
            } border rounded font-interface-sm text-interface-sm focus:outline-none transition-all text-xs lg:text-sm ${
              isSearchFocused ? 'w-56' : 'w-40 lg:w-48'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Limpar busca"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

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

        {/* Compact version on very small screens */}
        <div className="block sm:hidden">
          <AutoSaveIndicator
            status={autoSaveStatus}
            lastSavedAt={lastSavedAt}
            onForceSave={onForceSave}
            isDarkEffective={isDarkMode}
            compact={true}
          />
        </div>

        {/* Icon Action: History */}
        <button
          id="btn-header-history"
          onClick={onOpenHistory}
          className={`p-2 rounded-lg transition-colors cursor-pointer active:scale-95 ${
            isDarkMode
              ? 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#16202f]'
              : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
          }`}
          title="Histórico de Revisões"
        >
          <span className="material-symbols-outlined text-[20px]">history</span>
        </button>

        {/* Icon Action: Share */}
        <button
          id="btn-header-share"
          onClick={onOpenShare}
          className={`p-2 rounded-lg transition-colors cursor-pointer active:scale-95 ${
            isDarkMode
              ? 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#16202f]'
              : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
          }`}
          title="Compartilhar Projeto"
        >
          <span className="material-symbols-outlined text-[20px]">share</span>
        </button>

        <div
          className={`w-px h-6 mx-0.5 ${isDarkMode ? 'bg-[#1e293b]' : 'bg-[#c5c6ce]'}`}
        ></div>

        {/* Trailing Action: Modo Foco */}
        <button
          id="btn-modo-foco"
          onClick={onOpenFocusMode}
          className={`font-interface-sm text-interface-sm ${
            isDarkMode
              ? 'text-[#cbd5e1] hover:text-white border-[#2e3e54] hover:bg-[#16202f]'
              : 'text-[#44474d] hover:text-[#04162e] border-[#c5c6ce] hover:bg-[#eaeef2]'
          } border rounded-lg px-3 py-1.5 hover:opacity-90 active:scale-95 transition-all text-xs font-semibold cursor-pointer flex items-center gap-1.5`}
        >
          <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
          <span className="hidden sm:inline">Modo Foco</span>
        </button>

        {/* Trailing Action: Novo Capítulo */}
        <button
          id="btn-novo-capitulo"
          onClick={onOpenNewChapter}
          className={`font-interface-sm text-interface-sm ${
            isDarkMode
              ? 'bg-[#2563eb] text-[#ffffff] hover:bg-[#1d4ed8]'
              : 'bg-[#04162e] text-[#ffffff] hover:opacity-90'
          } rounded-lg px-3.5 py-1.5 active:scale-95 transition-all text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm`}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Novo Capítulo</span>
        </button>

        {/* Author Profile */}
        <button
          id="btn-author-profile"
          onClick={onOpenAuthorProfile}
          className="cursor-pointer ml-1 active:scale-95 transition-transform"
          title={`${project.author.name} (Autor)`}
        >
          <img
            id="author-avatar"
            className={`w-8 h-8 rounded-full border ${
              isDarkMode ? 'border-[#334155] hover:ring-2 hover:ring-[#60a5fa]' : 'border-[#c5c6ce] hover:ring-2 hover:ring-[#04162e]'
            } object-cover transition-all`}
            alt={project.author.name}
            src={project.author.avatarUrl}
          />
        </button>
      </div>
    </header>
  );
};

