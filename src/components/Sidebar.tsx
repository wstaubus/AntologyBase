import React, { useRef, useState } from 'react';
import { NovelProject, NavigationTab } from '../types';
import { uploadProjectImage, readFileAsDataUrl } from '../utils/imageService';

interface SidebarProps {
  project: NovelProject;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onUpdateProject?: (updated: NovelProject) => void;
  onOpenSync?: () => void;
  onOpenShare?: () => void;
  onOpenAuthorProfile?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isOpen?: boolean;
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
  onUpdateProject,
  onOpenSync,
  onOpenShare,
  onOpenAuthorProfile,
  isDarkMode = false,
  onToggleDarkMode,
  isOpen = true,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const authorFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState<string>('');

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, GIF).');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      let newAvatarUrl = '';
      try {
        const uploaded = await uploadProjectImage(file, 'Geral');
        newAvatarUrl = uploaded.url;
      } catch {
        newAvatarUrl = await readFileAsDataUrl(file);
      }

      if (!newAvatarUrl) {
        newAvatarUrl = await readFileAsDataUrl(file);
      }

      if (onUpdateProject) {
        onUpdateProject({
          ...project,
          author: {
            ...project.author,
            avatarUrl: newAvatarUrl,
          },
        });
      }
      setAvatarNotice('Foto atualizada!');
      setTimeout(() => setAvatarNotice(''), 3000);
    } catch (err) {
      console.error('Erro no upload de foto do autor:', err);
    } finally {
      setIsUploadingAvatar(false);
      if (authorFileInputRef.current) authorFileInputRef.current.value = '';
    }
  };

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

  // Close sidebar on mobile/tablet or toggle on desktop
  const handleCloseSidebar = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && onToggleCollapse) {
      onToggleCollapse();
    }
  };

  // Close mobile/tablet sidebar when Escape key is pressed
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

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

      {/* Main Sidebar Navigation: Fixed off-canvas on mobile/tablet (<lg), hideable on desktop (>=lg) */}
      <nav
        id="sidebar-nav"
        className={`w-[260px] sm:w-[280px] h-screen fixed left-0 top-0 border-r ${
          isDarkMode
            ? 'bg-[#0b111a] border-[#1e293b] text-[#e2e8f0]'
            : 'bg-[#eaeef2] border-[#c5c6ce] text-[#171c1f]'
        } flex flex-col pt-2 pb-2.5 z-50 select-none transition-transform duration-300 ease-in-out ${
          isMobileOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full'
        } ${
          isOpen
            ? 'lg:translate-x-0 lg:shadow-none'
            : 'lg:-translate-x-full'
        }`}
      >
        {/* Header Area with App Name & Minimalist Logo + Close Button */}
        <div className="pt-4 sm:pt-5 pb-3.5 sm:pb-4 flex flex-col px-3.5 sm:px-4">
          <div className="flex items-center justify-between gap-2 w-full">
            {/* Minimalist Single-Color Logo + App Name matching the provided design */}
            <div
              id="sidebar-brand-logo"
              className={`flex items-center gap-3 min-w-0 flex-1 pr-1 cursor-default select-none my-1 sm:my-1.5 ${
                isCollapsed ? 'lg:justify-center' : ''
              }`}
            >
              {/* Fountain Pen with Flowing Ink Wave (Single Color Vector from design) */}
              <svg
                viewBox="0 0 76 76"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 transition-colors ${
                  isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'
                }`}
                aria-hidden="true"
              >
                {/* Rotated Fountain Pen Nib */}
                <g transform="translate(28, 41) rotate(-42)">
                  {/* Nib Body & Collar Outline */}
                  <path
                    d="M 0 0 L -9 -16 Q -9.5 -20, -7 -25 L 7 -25 Q 9.5 -20, 9 -16 Z"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* 3 Prongs at Collar */}
                  <path
                    d="M -7 -25 L -7 -34 L -3.2 -34 L -3.2 -25 M -1.6 -25 L -1.6 -34 L 1.6 -34 L 1.6 -25 M 3.2 -25 L 3.2 -34 L 7 -34 L 7 -25"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Breather Hole */}
                  <circle cx="0" cy="-12.5" r="2.2" fill="currentColor" />
                  {/* Slit */}
                  <line
                    x1="0"
                    y1="-10.3"
                    x2="0"
                    y2="0"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                </g>

                {/* Flowing Ink Wave from Nib Tip */}
                <path
                  d="M 28 41 C 24 46, 13 49.5, 12 55.5 C 11.5 60.5, 17 63.5, 24 63 C 31 62.5, 38 66, 46 67.5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Text Layout: "Escreve Aí" on top and "AUTOR" below in typography */}
              <div
                id="sidebar-brand-text"
                className={`flex flex-col justify-center min-w-0 ${
                  isCollapsed ? 'lg:hidden' : ''
                }`}
              >
                <h2
                  id="sidebar-app-name"
                  className={`font-headline-md text-headline-md font-extrabold tracking-tight text-[18px] sm:text-[19px] leading-tight truncate ${
                    isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'
                  }`}
                >
                  Escreve Aí
                </h2>
                <span
                  id="sidebar-app-tagline"
                  className={`font-interface-sm text-interface-sm font-bold text-[10px] sm:text-[11px] tracking-[0.24em] uppercase leading-none mt-0.5 ${
                    isDarkMode ? 'text-[#cbd5e1]' : 'text-[#04162e]'
                  }`}
                >
                  AUTOR
                </span>
              </div>
            </div>

            {/* Hide / Close Sidebar Button */}
            <button
              id="btn-hide-sidebar"
              onClick={handleCloseSidebar}
              className={`p-1 -mr-1 rounded-lg transition-all cursor-pointer shrink-0 ${
                isDarkMode
                  ? 'hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc]'
                  : 'hover:bg-[#dfe3e7] text-[#334155] hover:text-[#04162e]'
              }`}
              title="Fechar menu lateral"
              aria-label="Fechar menu lateral"
            >
              <span className="material-symbols-outlined text-[19px] lg:hidden">close</span>
              <span className="material-symbols-outlined text-[19px] hidden lg:inline">dock_to_left</span>
            </button>
          </div>
        </div>

        {/* Divider line between App Name and Painel */}
        <div
          id="sidebar-header-divider"
          className={`border-b transition-colors mb-3.5 sm:mb-4 ${
            isCollapsed ? 'mx-2.5' : 'mx-3.5 sm:mx-4'
          } ${
            isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]'
          }`}
          role="separator"
        />

        {/* Main Navigation Tabs */}
        <ul className="flex flex-col flex-grow w-full space-y-0.5 sm:space-y-1 overflow-y-auto px-2.5 sm:px-0 pt-1.5 sm:pt-2">
          {/* Painel / Dashboard */}
          <li>
            <button
              id="nav-tab-dashboard"
              onClick={() => handleTabClick('dashboard')}
              title="Painel de Controle (Dashboard)"
              className={`w-full flex items-center transition-all cursor-pointer ${
                isCollapsed
                  ? `lg:justify-center lg:h-10 lg:w-10 lg:mx-auto lg:rounded-xl gap-2.5 px-3 py-2 text-left rounded-lg ${
                      activeTab === 'dashboard'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e]'
                    }`
                  : `gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'dashboard'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-[3px] sm:border-[#04162e] bg-white font-bold opacity-100 sm:shadow-[0_1px_3px_rgba(4,22,46,0.08)]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <span
                className="material-symbols-outlined text-[19px] sm:text-[20px]"
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

          {/* Storyboard */}
          <li>
            <button
              id="nav-tab-storyboard"
              onClick={() => handleTabClick('storyboard')}
              title={`Storyboard (${project.chapters.length} cap., ${totalScenes} cenas)`}
              className={`w-full flex items-center transition-all cursor-pointer relative ${
                isCollapsed
                  ? `lg:justify-center lg:h-10 lg:w-10 lg:mx-auto lg:rounded-xl gap-2.5 px-3 py-2 text-left rounded-lg ${
                      activeTab === 'storyboard'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e]'
                    }`
                  : `gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'storyboard'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-[3px] sm:border-[#04162e] bg-white font-bold opacity-100 sm:shadow-[0_1px_3px_rgba(4,22,46,0.08)]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[19px] sm:text-[20px]"
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
                <span className="font-interface-sm text-interface-sm">Storyboard</span>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold ${
                    isDarkMode ? 'bg-[#1e293b] text-[#cbd5e1]' : 'bg-[#dce3ea] text-[#04162e]'
                  } px-1.5 sm:px-2 py-0.5 rounded-full`}
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
                  ? `lg:justify-center lg:h-10 lg:w-10 lg:mx-auto lg:rounded-xl gap-2.5 px-3 py-2 text-left rounded-lg ${
                      activeTab === 'characters'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e]'
                    }`
                  : `gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'characters'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-[3px] sm:border-[#04162e] bg-white font-bold opacity-100 sm:shadow-[0_1px_3px_rgba(4,22,46,0.08)]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[19px] sm:text-[20px]"
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
                  className={`text-[10px] sm:text-[11px] font-bold ${
                    isDarkMode ? 'bg-[#1e293b] text-[#cbd5e1]' : 'bg-[#dce3ea] text-[#04162e]'
                  } px-1.5 sm:px-2 py-0.5 rounded-full`}
                >
                  {project.characters.length}
                </span>
              </div>
            </button>
          </li>

          {/* Cenários */}
          <li>
            <button
              id="nav-tab-world"
              onClick={() => handleTabClick('world')}
              title="Cenários"
              className={`w-full flex items-center transition-all cursor-pointer ${
                isCollapsed
                  ? `lg:justify-center lg:h-10 lg:w-10 lg:mx-auto lg:rounded-xl gap-2.5 px-3 py-2 text-left rounded-lg ${
                      activeTab === 'world'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e]'
                    }`
                  : `gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'world'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-[3px] sm:border-[#04162e] bg-white font-bold opacity-100 sm:shadow-[0_1px_3px_rgba(4,22,46,0.08)]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <span
                className="material-symbols-outlined text-[19px] sm:text-[20px]"
                style={{
                  fontVariationSettings: activeTab === 'world' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                public
              </span>
              <span className={`font-interface-sm text-interface-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                Cenários
              </span>
            </button>
          </li>

          {/* Escrever */}
          <li>
            <button
              id="nav-tab-writing"
              onClick={() => handleTabClick('writing')}
              title="Escrever (Editor de Texto)"
              className={`w-full flex items-center transition-all cursor-pointer ${
                isCollapsed
                  ? `lg:justify-center lg:h-10 lg:w-10 lg:mx-auto lg:rounded-xl gap-2.5 px-3 py-2 text-left rounded-lg ${
                      activeTab === 'writing'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e]'
                    }`
                  : `gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'writing'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-[3px] sm:border-[#04162e] bg-white font-bold opacity-100 sm:shadow-[0_1px_3px_rgba(4,22,46,0.08)]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <span
                className="material-symbols-outlined text-[19px] sm:text-[20px]"
                style={{
                  fontVariationSettings: activeTab === 'writing' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                edit_note
              </span>
              <span className={`font-interface-sm text-interface-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                Escrever
              </span>
            </button>
          </li>

          {/* Imagens (Pasta de Imagens) */}
          <li>
            <button
              id="nav-tab-images"
              onClick={() => handleTabClick('images')}
              title="Pasta de Imagens (/imagens)"
              className={`w-full flex items-center transition-all cursor-pointer ${
                isCollapsed
                  ? `lg:justify-center lg:h-10 lg:w-10 lg:mx-auto lg:rounded-xl gap-2.5 px-3 py-2 text-left rounded-lg ${
                      activeTab === 'images'
                        ? isDarkMode
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-[#04162e] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e]'
                    }`
                  : `gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 text-left rounded-lg sm:rounded-none ${
                      activeTab === 'images'
                        ? isDarkMode
                          ? 'text-[#60a5fa] sm:border-l-2 sm:border-[#60a5fa] bg-[#16202f] font-bold sm:shadow-[inset_2px_0_0_#60a5fa]'
                          : 'text-[#04162e] sm:border-l-[3px] sm:border-[#04162e] bg-white font-bold opacity-100 sm:shadow-[0_1px_3px_rgba(4,22,46,0.08)]'
                        : isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc] font-medium'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e] font-medium'
                    }`
              }`}
            >
              <span
                className="material-symbols-outlined text-[19px] sm:text-[20px]"
                style={{
                  fontVariationSettings: activeTab === 'images' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                photo_library
              </span>
              <span className={`font-interface-sm text-interface-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                Imagens
              </span>
            </button>
          </li>
        </ul>

        {/* Footer Navigation Area */}
        <ul
          className={`flex flex-col w-full mt-auto mb-0 border-t ${
            isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]'
          } pt-1.5 sm:pt-2 space-y-0.5 sm:space-y-1 ${isCollapsed ? 'lg:px-2 lg:items-center px-2.5' : 'px-2.5 sm:px-0'}`}
        >
          {/* Exportar Projeto (com Compartilhar Integrado) */}
          <li>
            <button
              id="nav-btn-export"
              onClick={handleExportClick}
              title="Exportar ou Compartilhar Projeto"
              className={`flex items-center transition-colors cursor-pointer ${
                isCollapsed
                  ? `lg:justify-center lg:h-10 lg:w-10 lg:rounded-xl w-full gap-2.5 px-3 py-2 text-left rounded-lg ${
                      isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e]'
                    }`
                  : `w-full gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 text-left rounded-lg sm:rounded-none ${
                      isDarkMode
                        ? 'text-[#cbd5e1] hover:bg-[#131b26] hover:text-[#f8fafc]'
                        : 'text-[#334155] hover:bg-[#dce3ea] hover:text-[#04162e]'
                    }`
              }`}
            >
              <span className="material-symbols-outlined text-[19px] sm:text-[20px]">file_download</span>
              <span className={`font-interface-sm text-interface-sm ${isCollapsed ? 'lg:hidden' : ''}`}>
                Exportar Projeto
              </span>
            </button>
          </li>

          {/* Expand button at bottom when collapsed on desktop */}
          {isCollapsed && onToggleCollapse && (
            <li className="hidden lg:flex pt-1.5 border-t border-[#c5c6ce] dark:border-[#1e293b] w-full justify-center">
              <button
                onClick={onToggleCollapse}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  isDarkMode
                    ? 'hover:bg-[#1e293b] text-[#cbd5e1] hover:text-[#f8fafc]'
                    : 'hover:bg-[#dce3ea] text-[#334155] hover:text-[#04162e]'
                }`}
                title="Expandir menu lateral (Ctrl+B)"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </li>
          )}
        </ul>

        {/* Hidden File Input for Author Avatar Upload */}
        <input
          type="file"
          ref={authorFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileChange}
        />

        {/* Author Avatar & Profile Row */}
        <div
          className={`mt-1.5 pt-2 border-t ${
            isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]'
          } ${isCollapsed ? 'lg:px-2 px-2.5' : 'px-2.5 sm:px-3.5'}`}
        >
          {avatarNotice && (
            <div className="mb-1 px-2 py-0.5 text-center text-[10px] font-bold bg-emerald-500 text-white rounded animate-fade-in">
              {avatarNotice}
            </div>
          )}

          <div
            id="sidebar-author-profile"
            className={`w-full flex items-center transition-all group ${
              isCollapsed
                ? 'lg:justify-center lg:p-1 lg:rounded-xl gap-2 p-1.5 rounded-xl hover:bg-[#dce3ea] dark:hover:bg-[#16202f]'
                : 'gap-2.5 p-1.5 sm:p-2 rounded-xl hover:bg-[#dce3ea] dark:hover:bg-[#16202f]'
            }`}
          >
            {/* Clickable Avatar to Upload File */}
            <div
              className="relative shrink-0 flex items-center justify-center cursor-pointer group/avatar"
              onClick={(e) => {
                e.stopPropagation();
                authorFileInputRef.current?.click();
              }}
              title="Fazer upload de foto do autor (Clique para carregar imagem do computador)"
            >
              {project.author.avatarUrl?.trim() ? (
                <img
                  id="sidebar-author-avatar"
                  src={project.author.avatarUrl.trim()}
                  alt={project.author.name}
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full object-cover border border-[#c5c6ce] dark:border-[#334155] group-hover/avatar:ring-2 group-hover/avatar:ring-[#2563eb] transition-all"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
                  }}
                />
              ) : (
                <div
                  id="sidebar-author-avatar-placeholder"
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#dce3ea] dark:bg-[#1e293b] border border-[#c5c6ce] dark:border-[#334155] flex items-center justify-center text-[#04162e] dark:text-[#f8fafc] font-bold text-xs"
                >
                  {project.author.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white">
                <span className="material-symbols-outlined text-[15px]">
                  {isUploadingAvatar ? 'refresh' : 'photo_camera'}
                </span>
              </div>
              <span
                className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0b111a]"
                title="Online"
              />
            </div>

            {/* Author details - clicking opens author profile */}
            <div
              onClick={handleAuthorProfileClick}
              className={`min-w-0 flex-1 cursor-pointer ${isCollapsed ? 'lg:hidden' : ''}`}
            >
              <p className="text-xs font-bold text-[#04162e] dark:text-[#f8fafc] truncate leading-tight group-hover:text-[#2563eb] dark:group-hover:text-[#60a5fa] transition-colors">
                {project.author.name}
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-[#334155] dark:text-[#cbd5e1] truncate">
                Autor • Perfil
              </p>
            </div>

            {/* Quick Upload Icon Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                authorFileInputRef.current?.click();
              }}
              title="Carregar nova foto do autor"
              className={`p-1 rounded-md text-[#64748b] hover:text-[#2563eb] dark:text-[#94a3b8] dark:hover:text-[#60a5fa] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                isCollapsed ? 'lg:hidden' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">photo_camera</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};



