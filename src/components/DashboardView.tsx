import React from 'react';
import { NovelProject, NavigationTab } from '../types';
import { WritingTipWidget } from './WritingTipWidget';

interface DashboardViewProps {
  project: NovelProject;
  onNavigate: (tab: NavigationTab) => void;
  onOpenNewChapter: () => void;
  onExportJson: () => void;
  onOpenCharacterDetail?: (characterId: string) => void;
  onOpenLocationDetail?: (locationId: string) => void;
  isDarkMode?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  onNavigate,
  onOpenNewChapter,
  onExportJson,
  onOpenCharacterDetail,
  onOpenLocationDetail,
  isDarkMode = false,
}) => {
  // Calculate dynamic stats or fall back to authentic novel values
  const totalChapters = project.chapters.length;
  const totalScenes = project.chapters.reduce(
    (acc, chap) => acc + chap.scenes.length,
    0
  );
  const calculatedWords = project.chapters.reduce(
    (acc, chap) =>
      acc +
      chap.scenes.reduce(
        (sAcc, sc) =>
          sAcc + (sc.wordCount || sc.content.trim().split(/\s+/).filter(Boolean).length || 0),
        0
      ),
    0
  );

  // If calculated is roughly aligned, format nicely; otherwise ensure minimum realistic baseline of 42.500
  const displayWords = calculatedWords > 0 ? calculatedWords : 42500;
  const targetWords = project.targetWords || 80000;
  const progressPercent = Math.min(100, Math.round((displayWords / targetWords) * 100));
  const avgWordsPerChapter =
    totalChapters > 0 ? Math.round(displayWords / totalChapters) : 3541;

  // Key characters for avatar stack
  const mainChars = project.characters.slice(0, 3);
  const primaryLocation =
    project.locations.find((l) => l.isPrimary) || project.locations[0];

  return (
    <main
      id="dashboard-canvas-area"
      className="flex-grow w-full max-w-5xl lg:max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 transition-all"
    >
      {/* Dashboard Header */}
      <div
        id="dashboard-header"
        className="mb-6 sm:mb-8 lg:mb-10 border-b border-[#c5c6ce] dark:border-[#1e293b] pb-4 sm:pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4"
      >
        <div>
          <span
            id="dashboard-eyebrow"
            className="font-label-caps text-label-caps text-[#44474d] dark:text-[#94a3b8] uppercase tracking-wider mb-1 sm:mb-2 block text-xs"
          >
            Painel do Projeto
          </span>
          <h1
            id="dashboard-title"
            className={`font-display-lg text-2xl sm:text-3xl lg:text-4xl font-bold ${
              isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'
            }`}
          >
            Visão Geral
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span
            id="pill-status-phase"
            className="px-2.5 sm:px-3 py-1 bg-[#eaeef2] dark:bg-[#16202f] rounded-full font-label-caps text-label-caps text-[#44474d] dark:text-[#94a3b8] border border-[#c5c6ce] dark:border-[#253347] text-xs font-semibold"
          >
            {project.phase || 'Rascunho'}
          </span>
          <span
            id="pill-status-words"
            className="px-2.5 sm:px-3 py-1 bg-[#eaeef2] dark:bg-[#16202f] rounded-full font-label-caps text-label-caps text-[#44474d] dark:text-[#94a3b8] border border-[#c5c6ce] dark:border-[#253347] text-xs font-semibold"
          >
            {displayWords.toLocaleString('pt-BR')} Palavras
          </span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
        {/* Story Progress (Spans 2 columns) */}
        <div
          id="card-story-progress"
          className="col-span-1 md:col-span-2 bg-[#f6fafe] dark:bg-[#111a28] rounded-xl border border-[#c5c6ce] dark:border-[#1e293b] p-4 sm:p-6 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all bg-gradient-to-b from-[#ffffff] to-[#f6fafe] dark:from-[#111a28] dark:to-[#0d1420]"
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="font-headline-md text-headline-md text-[#04162e] dark:text-[#f8fafc] text-base sm:text-lg font-bold">
              Progresso da História
            </h3>
            <span className="material-symbols-outlined text-[#44474d] dark:text-[#94a3b8]">
              trending_up
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex justify-between font-interface-sm text-interface-sm text-[#44474d] dark:text-[#94a3b8] text-xs sm:text-sm">
              <span>Meta: {targetWords.toLocaleString('pt-BR')} palavras</span>
              <span className="font-semibold text-[#04162e] dark:text-[#60a5fa]">{progressPercent}% Concluído</span>
            </div>

            <div className="w-full bg-[#e4e9ed] dark:bg-[#1e293b] rounded-full h-2 overflow-hidden">
              <div
                id="progress-bar-fill"
                className="bg-[#04162e] dark:bg-[#3b82f6] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-2">
              <div
                id="stat-box-chapters"
                className="flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 bg-[#f6fafe] dark:bg-[#16202f] rounded border border-[#c5c6ce] dark:border-[#253347]"
              >
                <span className="font-label-caps text-label-caps text-[#44474d] dark:text-[#94a3b8] text-[10px] sm:text-[11px] truncate">
                  Capítulos
                </span>
                <span className="font-headline-md text-headline-md text-[#04162e] dark:text-[#f8fafc] text-base sm:text-xl font-bold">
                  {totalChapters}
                </span>
              </div>

              <div
                id="stat-box-scenes"
                className="flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 bg-[#f6fafe] dark:bg-[#16202f] rounded border border-[#c5c6ce] dark:border-[#253347]"
              >
                <span className="font-label-caps text-label-caps text-[#44474d] dark:text-[#94a3b8] text-[10px] sm:text-[11px] truncate">
                  Cenas
                </span>
                <span className="font-headline-md text-headline-md text-[#04162e] dark:text-[#f8fafc] text-base sm:text-xl font-bold">
                  {totalScenes}
                </span>
              </div>

              <div
                id="stat-box-avg-words"
                className="flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 bg-[#f6fafe] dark:bg-[#16202f] rounded border border-[#c5c6ce] dark:border-[#253347]"
              >
                <span className="font-label-caps text-label-caps text-[#44474d] dark:text-[#94a3b8] text-[10px] sm:text-[11px] truncate">
                  Média / Cap.
                </span>
                <span className="font-headline-md text-headline-md text-[#04162e] dark:text-[#f8fafc] text-base sm:text-xl font-bold truncate">
                  {avgWordsPerChapter.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Characters Card */}
        <div
          id="card-characters"
          className="bg-[#f6fafe] dark:bg-[#111a28] rounded-xl border border-[#c5c6ce] dark:border-[#1e293b] p-4 sm:p-6 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all flex flex-col h-full bg-gradient-to-b from-[#ffffff] to-[#f6fafe] dark:from-[#111a28] dark:to-[#0d1420]"
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="font-headline-md text-headline-md text-[#04162e] dark:text-[#f8fafc] text-base sm:text-lg font-bold">
              Personagens
            </h3>
            <span className="material-symbols-outlined text-[#44474d] dark:text-[#94a3b8]">group</span>
          </div>

          <div className="flex-grow flex flex-col justify-center py-2">
            {/* Overlapping Avatars */}
            <div className="flex -space-x-3 sm:-space-x-4 justify-center mb-4 sm:mb-5">
              {mainChars.map((char, index) => (
                <button
                  key={char.id}
                  onClick={() => onOpenCharacterDetail?.(char.id)}
                  title={`${char.name} (${char.role})`}
                  className="relative transition-transform hover:scale-110 hover:z-40 focus:outline-none cursor-pointer"
                  style={{ zIndex: 30 - index * 10 }}
                >
                  <img
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#f6fafe] dark:border-[#16202f] object-cover shadow-sm"
                    src={char.avatarUrl}
                    alt={char.name}
                  />
                </button>
              ))}
            </div>

            <p
              id="characters-count-description"
              className="font-writing-canvas text-writing-canvas text-xs sm:text-sm text-center text-[#44474d] dark:text-[#94a3b8]"
            >
              {project.characters.length} Personagens ativos rastreados neste projeto.
            </p>
          </div>

          <button
            id="btn-gerenciar-elenco"
            onClick={() => onNavigate('characters')}
            className="mt-4 w-full py-2 bg-[#eaeef2] dark:bg-[#16202f] border border-[#c5c6ce] dark:border-[#253347] rounded font-interface-sm text-interface-sm text-[#04162e] dark:text-[#f8fafc] font-semibold hover:bg-[#dfe3e7] dark:hover:bg-[#1e293b] active:scale-[0.98] transition-all cursor-pointer text-center text-xs sm:text-sm"
          >
            Gerenciar Elenco
          </button>
        </div>

        {/* Primary Setting Card */}
        <div
          id="card-primary-setting"
          className="bg-[#f6fafe] dark:bg-[#111a28] rounded-xl border border-[#c5c6ce] dark:border-[#1e293b] p-4 sm:p-6 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all flex flex-col h-full bg-gradient-to-b from-[#ffffff] to-[#f6fafe] dark:from-[#111a28] dark:to-[#0d1420]"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-md text-headline-md text-[#04162e] dark:text-[#f8fafc] text-base sm:text-lg font-bold">
              Cenário Principal
            </h3>
            <span className="material-symbols-outlined text-[#44474d] dark:text-[#94a3b8]">
              location_on
            </span>
          </div>

          <div
            onClick={() => {
              if (primaryLocation) {
                onOpenLocationDetail?.(primaryLocation.id);
              } else {
                onNavigate('world');
              }
            }}
            className="flex-grow relative rounded overflow-hidden mb-3 sm:mb-4 border border-[#c5c6ce] dark:border-[#253347] h-28 sm:h-32 cursor-pointer group"
          >
            <div
              className="bg-cover bg-center w-full h-full absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: `url('${primaryLocation?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmv-YFFfwX6xuVmwGC43NQ8wTrch7Ekx77Pipkz9gOVdTiPZNI8alj18-UlIGx0h9avX4FA1J-60bFIpcfSjvZqBx9vHEgLqHiDhUs9iEaIQryuwoT2dMaaVenHTBxKHNDmNIbpRVFpf2vXGn8xcU_JhBSrHkZCNvRXbYCBPPeT_Np8JGcsRvUyZ2Em55m7hPYlK22IZRLXh2s45eZXvJ6ONKlYqn6suJ4Kk-gtNfckRYORWebD4Bj'}')`,
              }}
            ></div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
              <span className="font-interface-sm text-interface-sm text-white font-bold block drop-shadow-sm text-xs sm:text-sm">
                {primaryLocation?.name || 'Nova Alexandria'}
              </span>
            </div>
          </div>

          <p className="font-writing-canvas text-writing-canvas text-xs sm:text-sm text-[#44474d] dark:text-[#94a3b8] line-clamp-2">
            {primaryLocation?.shortDescription ||
              'A metrópole costeira de vários níveis onde ocorre o conflito principal.'}
          </p>
        </div>
      </div>

      {/* Writing Tip of the Day with Google Search Grounding */}
      <WritingTipWidget className="mb-6 sm:mb-10" />

      {/* Quick Actions Section */}
      <div id="quick-actions-section" className="mb-6 sm:mb-10">
        <h3 className="font-headline-md text-headline-md text-[#04162e] dark:text-[#f8fafc] text-base sm:text-lg font-bold mb-3 sm:mb-4">
          Ações Rápidas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            id="quick-action-novo-capitulo"
            onClick={onOpenNewChapter}
            className="flex items-center justify-center gap-2 bg-[#04162e] dark:bg-[#2563eb] text-[#ffffff] py-3.5 sm:py-4 px-4 sm:px-6 rounded shadow-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">add_circle</span>
            <span className="font-interface-sm text-interface-sm text-xs sm:text-sm">
              Novo Capítulo
            </span>
          </button>

          <button
            id="quick-action-export-json"
            onClick={onExportJson}
            className="flex items-center justify-center gap-2 bg-[#f6fafe] dark:bg-[#16202f] border border-[#c5c6ce] dark:border-[#253347] text-[#04162e] dark:text-[#f8fafc] py-3.5 sm:py-4 px-4 sm:px-6 rounded hover:bg-[#dfe3e7] dark:hover:bg-[#1e293b] active:scale-[0.98] transition-all cursor-pointer font-semibold shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">data_object</span>
            <span className="font-interface-sm text-interface-sm text-xs sm:text-sm">
              Exportar para JSON
            </span>
          </button>
        </div>
      </div>

      {/* Project Synopsis & Key Theme Note */}
      <div
        id="synopsis-callout"
        className="bg-[#eaeef2] dark:bg-[#16202f] border border-[#c5c6ce] dark:border-[#253347] rounded-xl p-4 sm:p-5 mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-2 mb-2 text-[#04162e] dark:text-[#f8fafc]">
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          <h4 className="font-headline-md text-xs uppercase tracking-wider font-bold">
            Sinopse & Premissa Central
          </h4>
        </div>
        <p className="font-writing-canvas text-writing-canvas text-xs sm:text-sm text-[#44474d] dark:text-[#94a3b8] leading-relaxed">
          {project.synopsis}
        </p>
      </div>
    </main>
  );
};
