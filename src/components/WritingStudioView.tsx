import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NovelProject, Chapter, Scene, TopSubTab, ContentStatus, StudioTheme, StudioFontSize, StyleCheckerSettings, AutoSaveStatus } from '../types';
import { analyzeProseStyle, DEFAULT_STYLE_SETTINGS, StyleAnalysisResult } from '../utils/styleChecker';
import { StyleCheckerPanel } from './StyleCheckerPanel';
import { StyleHighlightedViewer } from './StyleHighlightedViewer';
import { AutoSaveIndicator } from './AutoSaveIndicator';

interface WritingStudioViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
  subTab: TopSubTab;
  onSelectSubTab: (subTab: TopSubTab) => void;
  onOpenFocusMode: (activeSceneId?: string) => void;
  onOpenNewChapter: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  autoSaveStatus?: AutoSaveStatus;
  lastSavedAt?: Date | null;
  onForceSave?: () => void;
}

export const WritingStudioView: React.FC<WritingStudioViewProps> = ({
  project,
  onUpdateProject,
  subTab,
  onSelectSubTab,
  onOpenFocusMode,
  onOpenNewChapter,
  isDarkMode = false,
  onToggleDarkMode,
  autoSaveStatus = 'saved',
  lastSavedAt = null,
  onForceSave = () => {},
}) => {
  // Active Chapter & Scene selection
  const [activeChapterId, setActiveChapterId] = useState<string>(
    project.chapters[0]?.id || ''
  );
  const [activeSceneId, setActiveSceneId] = useState<string>(
    project.chapters[0]?.scenes[0]?.id || ''
  );

  // Inspector toggle state & Tab (Scene meta vs Style Checker)
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [inspectorTab, setInspectorTab] = useState<'scene' | 'style'>('scene');

  // Canvas Mode: Direct Editing or Visual Style Highlights
  const [canvasViewMode, setCanvasViewMode] = useState<'edit' | 'checker'>('edit');

  // Style Checker Settings
  const styleSettings: StyleCheckerSettings = useMemo(() => {
    return project.styleSettings || DEFAULT_STYLE_SETTINGS;
  }, [project.styleSettings]);

  // Studio Theme State (defaults to dark-slate if global dark mode is active)
  const [studioTheme, setStudioTheme] = useState<StudioTheme>(() => {
    return isDarkMode ? 'night-slate' : 'paper-light';
  });

  // Keep studio theme in sync with global dark mode toggle
  useEffect(() => {
    if (isDarkMode && studioTheme === 'paper-light') {
      setStudioTheme('night-slate');
    } else if (!isDarkMode && (studioTheme === 'night-slate' || studioTheme === 'oled' || studioTheme === 'sepia-dark')) {
      setStudioTheme('paper-light');
    }
  }, [isDarkMode]);

  // Font Size and Line Height for comfortable nocturnal sessions
  const [fontSize, setFontSize] = useState<StudioFontSize>('base');
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'spacious'>('relaxed');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Sync with subTab changes
  useEffect(() => {
    if (subTab === 'inspector') {
      setIsInspectorOpen((prev) => !prev);
    }
  }, [subTab]);

  const activeChapter =
    project.chapters.find((c) => c.id === activeChapterId) || project.chapters[0];
  const activeScene =
    activeChapter?.scenes.find((s) => s.id === activeSceneId) ||
    activeChapter?.scenes[0] ||
    project.chapters[0]?.scenes[0];

  // Textarea ref for auto-sizing or cursor focus
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Real-time Style Analysis for the active scene
  const styleAnalysis: StyleAnalysisResult = useMemo(() => {
    return analyzeProseStyle(activeScene?.content || '', styleSettings);
  }, [activeScene?.content, styleSettings]);

  const totalStyleAlerts =
    styleAnalysis.avoidedTermsCount + styleAnalysis.echoCount + (styleSettings.highlightRepeatedWords ? styleAnalysis.frequentWordsCount : 0);

  // Update style settings in project
  const handleUpdateStyleSettings = (newSettings: StyleCheckerSettings) => {
    onUpdateProject({
      ...project,
      styleSettings: newSettings,
    });
  };

  // Replace term or occurrence in the scene content
  const handleReplaceTerm = (
    oldTerm: string,
    replacement: string,
    startIndex?: number,
    endIndex?: number
  ) => {
    if (!activeScene) return;
    let nextContent = activeScene.content;
    if (typeof startIndex === 'number' && typeof endIndex === 'number' && startIndex >= 0 && endIndex <= nextContent.length) {
      nextContent = nextContent.slice(0, startIndex) + replacement + nextContent.slice(endIndex);
    } else {
      nextContent = nextContent.replace(new RegExp(oldTerm, 'i'), replacement);
    }
    handleContentChange(nextContent);
  };

  // Handle scene text change
  const handleContentChange = (newContent: string) => {
    if (!activeScene) return;
    const words = newContent.trim() ? newContent.trim().split(/\s+/).filter(Boolean).length : 0;

    const updatedChapters = project.chapters.map((chap) => {
      if (chap.id !== activeChapter?.id) return chap;
      return {
        ...chap,
        scenes: chap.scenes.map((sc) =>
          sc.id === activeScene.id
            ? { ...sc, content: newContent, wordCount: words, updatedAt: new Date().toISOString() }
            : sc
        ),
      };
    });

    onUpdateProject({
      ...project,
      chapters: updatedChapters,
    });
  };

  // Handle scene metadata updates (synopsis, POV, location, notes, status)
  const handleSceneMetaUpdate = (partial: Partial<Scene>) => {
    if (!activeScene) return;
    const updatedChapters = project.chapters.map((chap) => {
      if (chap.id !== activeChapter?.id) return chap;
      return {
        ...chap,
        scenes: chap.scenes.map((sc) =>
          sc.id === activeScene.id ? { ...sc, ...partial } : sc
        ),
      };
    });

    onUpdateProject({
      ...project,
      chapters: updatedChapters,
    });
  };

  // Add new scene to current chapter
  const handleAddNewScene = () => {
    if (!activeChapter) return;
    const newSceneNumber = activeChapter.scenes.length + 1;
    const newSc: Scene = {
      id: `sc-${Date.now()}`,
      chapterId: activeChapter.id,
      title: `Cena ${newSceneNumber}: Nova Cena`,
      content: '',
      synopsis: 'Breve descrição dos acontecimentos desta cena...',
      status: 'Rascunho',
      wordCount: 0,
      characterIds: [],
      notes: '',
    };

    const updatedChapters = project.chapters.map((chap) => {
      if (chap.id !== activeChapter.id) return chap;
      return {
        ...chap,
        scenes: [...chap.scenes, newSc],
      };
    });

    onUpdateProject({
      ...project,
      chapters: updatedChapters,
    });

    setActiveSceneId(newSc.id);
  };

  // Insert markdown styling or scene break
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = el.value.substring(start, end) || 'texto';
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newFullText = el.value.substring(0, start) + replacement + el.value.substring(end);
    handleContentChange(newFullText);
  };

  const insertSceneBreak = () => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const breakText = '\n\n* * *\n\n';
    const newFullText = el.value.substring(0, start) + breakText + el.value.substring(start);
    handleContentChange(newFullText);
  };

  const insertDialogueDash = () => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const dashText = '— ';
    const newFullText = el.value.substring(0, start) + dashText + el.value.substring(start);
    handleContentChange(newFullText);
  };

  // Characters in current scene
  const povChar = project.characters.find((c) => c.id === activeScene?.povCharacterId);
  const locObj = project.locations.find((l) => l.id === activeScene?.locationId);

  // Theme styling definitions for high ergonomic contrast
  const canvasThemeStyles = {
    'night-slate': {
      bgOuter: 'bg-[#0b1019]',
      cardBg: 'bg-[#121b28]',
      cardBorder: 'border-[#223147]',
      cardShadow: 'shadow-[0_4px_25px_rgba(0,0,0,0.4)]',
      textColor: 'text-[#e6edf8]',
      headerBorder: 'border-[#223147]',
      titleColor: 'text-[#f8fafc]',
      subtitleColor: 'text-[#93c5fd]',
      metaColor: 'text-[#94a3b8]',
      selectBg: 'bg-[#1b2637] text-[#e2e8f0] border-[#2e405b]',
      selectionClass: 'selection:bg-[#3b82f6]/40 selection:text-white',
      name: 'Slate Escuro (Padrão)',
      icon: 'dark_mode',
    },
    'oled': {
      bgOuter: 'bg-[#000000]',
      cardBg: 'bg-[#0a0a0a]',
      cardBorder: 'border-[#262626]',
      cardShadow: 'shadow-[0_4px_30px_rgba(0,0,0,0.8)]',
      textColor: 'text-[#f5f5f5]',
      headerBorder: 'border-[#262626]',
      titleColor: 'text-[#ffffff]',
      subtitleColor: 'text-[#60a5fa]',
      metaColor: 'text-[#a3a3a3]',
      selectBg: 'bg-[#171717] text-[#f5f5f5] border-[#333333]',
      selectionClass: 'selection:bg-white selection:text-black',
      name: 'OLED Puro (Preto Total)',
      icon: 'contrast',
    },
    'sepia-dark': {
      bgOuter: 'bg-[#17130f]',
      cardBg: 'bg-[#221c17]',
      cardBorder: 'border-[#3b3127]',
      cardShadow: 'shadow-[0_4px_25px_rgba(0,0,0,0.45)]',
      textColor: 'text-[#f3e6d3]',
      headerBorder: 'border-[#3b3127]',
      titleColor: 'text-[#fef3c7]',
      subtitleColor: 'text-[#fde68a]',
      metaColor: 'text-[#d6c4b2]',
      selectBg: 'bg-[#2e261f] text-[#f3e6d3] border-[#4d3f32]',
      selectionClass: 'selection:bg-[#d97706]/40 selection:text-white',
      name: 'Sépia Noturno (Âmbar Suave)',
      icon: 'auto_stories',
    },
    'paper-light': {
      bgOuter: 'bg-[#f6fafe]',
      cardBg: 'bg-[#ffffff]',
      cardBorder: 'border-[#c5c6ce]',
      cardShadow: 'shadow-[0_2px_15px_rgba(0,0,0,0.03)]',
      textColor: 'text-[#171c1f]',
      headerBorder: 'border-[#eaeef2]',
      titleColor: 'text-[#04162e]',
      subtitleColor: 'text-[#44474d]',
      metaColor: 'text-[#75777e]',
      selectBg: 'bg-[#eaeef2] text-[#04162e] border-[#c5c6ce]',
      selectionClass: 'selection:bg-[#d5e3ff] selection:text-[#04162e]',
      name: 'Papel Claro (Diurno)',
      icon: 'light_mode',
    },
  }[studioTheme];

  const fontSizeClass = {
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
  }[fontSize];

  const lineSpacingStyle = {
    normal: '1.6',
    relaxed: '1.9',
    spacious: '2.25',
  }[lineSpacing];

  const isDarkEffective = studioTheme !== 'paper-light' || isDarkMode;

  // If subTab is "canvas" (Storyboard/Board Mode)
  if (subTab === 'canvas') {
    return (
      <main className={`flex-grow w-full max-w-[1200px] mx-auto px-6 py-8 ${isDarkEffective ? 'text-[#e2e8f0]' : 'text-[#171c1f]'}`}>
        <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkEffective ? 'border-[#1e293b]' : 'border-[#c5c6ce]'}`}>
          <div>
            <span className={`font-label-caps text-xs ${isDarkEffective ? 'text-[#94a3b8]' : 'text-[#44474d]'} uppercase tracking-wider block`}>
              Modo Tela / Quadro de Cenas
            </span>
            <h1 className={`font-display-lg text-2xl sm:text-3xl ${isDarkEffective ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>
              Estrutura & Storyboard
            </h1>
          </div>
          <button
            onClick={() => onSelectSubTab('binder')}
            className={`${
              isDarkEffective ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]' : 'bg-[#04162e] text-white hover:opacity-90'
            } px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm`}
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            Voltar ao Editor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.chapters.map((chap) => (
            <div
              key={chap.id}
              className={`${
                isDarkEffective ? 'bg-[#111827] border-[#1e293b]' : 'bg-[#ffffff] border-[#c5c6ce]'
              } rounded-xl border p-4 flex flex-col shadow-xs`}
            >
              <div className={`flex justify-between items-center mb-3 pb-2 border-b ${isDarkEffective ? 'border-[#1e293b]' : 'border-[#eaeef2]'}`}>
                <h3 className={`font-headline-md text-sm font-bold ${isDarkEffective ? 'text-[#f8fafc]' : 'text-[#04162e]'} truncate`}>
                  {chap.title}
                </h3>
                <span className={`text-[10px] ${isDarkEffective ? 'bg-[#1e293b] text-[#94a3b8]' : 'bg-[#eaeef2] text-[#44474d]'} px-2 py-0.5 rounded font-bold`}>
                  {chap.scenes.length} cenas
                </span>
              </div>

              <div className="space-y-2.5 flex-1">
                {chap.scenes.map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => {
                      setActiveChapterId(chap.id);
                      setActiveSceneId(sc.id);
                      onSelectSubTab('binder');
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                      isDarkEffective
                        ? 'bg-[#182232] border-[#223147] hover:border-[#60a5fa] hover:bg-[#1e2b40]'
                        : 'bg-[#f6fafe] border-[#c5c6ce]/70 hover:border-[#04162e] hover:shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-semibold text-xs ${isDarkEffective ? 'text-[#f1f5f9]' : 'text-[#04162e]'} group-hover:underline`}>
                        {sc.title}
                      </h4>
                      <span className={`text-[10px] font-mono ${isDarkEffective ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>
                        {sc.wordCount || 0} pal.
                      </span>
                    </div>
                    <p className={`text-[11px] ${isDarkEffective ? 'text-[#94a3b8]' : 'text-[#44474d]'} line-clamp-2 italic`}>
                      {sc.synopsis || 'Sem sinopse cadastrada'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <div id="writing-studio-container" className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* 1. The Binder / Outline (Left Pane) */}
      <aside
        id="studio-binder-pane"
        className={`w-64 shrink-0 border-r flex flex-col h-full overflow-hidden transition-colors ${
          isDarkEffective
            ? 'bg-[#0d1420] border-[#1e293b] text-[#e2e8f0]'
            : 'bg-[#f0f4f8] border-[#c5c6ce] text-[#171c1f]'
        }`}
      >
        <div
          className={`p-3.5 border-b flex items-center justify-between ${
            isDarkEffective ? 'bg-[#111a28] border-[#1e293b]' : 'bg-[#eaeef2] border-[#c5c6ce]'
          }`}
        >
          <div className={`flex items-center gap-1.5 ${isDarkEffective ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>
            <span className="material-symbols-outlined text-[18px]">folder_open</span>
            <span className="font-label-caps text-xs font-bold uppercase tracking-wider">
              Fichário
            </span>
          </div>
          <button
            onClick={onOpenNewChapter}
            title="Criar novo capítulo"
            className={`p-1 rounded transition-colors ${
              isDarkEffective ? 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]' : 'text-[#04162e] hover:bg-[#dfe3e7]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
          </button>
        </div>

        {/* Chapter & Scene Tree */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {project.chapters.map((chap) => {
            const isChapActive = chap.id === activeChapter?.id;
            return (
              <div key={chap.id} className="space-y-1">
                <div
                  onClick={() => {
                    setActiveChapterId(chap.id);
                    if (chap.scenes.length > 0) {
                      setActiveSceneId(chap.scenes[0].id);
                    }
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-bold cursor-pointer transition-colors ${
                    isChapActive
                      ? isDarkEffective
                        ? 'bg-[#1c293d] text-[#60a5fa]'
                        : 'bg-[#dfe3e7] text-[#04162e]'
                      : isDarkEffective
                      ? 'text-[#94a3b8] hover:bg-[#131d2b] hover:text-[#f8fafc]'
                      : 'text-[#44474d] hover:bg-[#eaeef2] hover:text-[#04162e]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[16px]">
                      {isChapActive ? 'expand_more' : 'chevron_right'}
                    </span>
                    <span className="truncate">{chap.title}</span>
                  </div>
                  <span className={`text-[10px] shrink-0 font-normal ${isDarkEffective ? 'text-[#64748b]' : 'text-[#75777e]'}`}>
                    {chap.scenes.length}
                  </span>
                </div>

                {/* Scenes List */}
                {isChapActive && (
                  <div className={`pl-4 space-y-0.5 border-l-2 ${isDarkEffective ? 'border-[#24334a]' : 'border-[#c5c6ce]'} ml-3.5 my-1`}>
                    {chap.scenes.map((sc) => {
                      const isScActive = sc.id === activeScene?.id;
                      return (
                        <button
                          key={sc.id}
                          onClick={() => setActiveSceneId(sc.id)}
                          className={`w-full text-left px-2 py-1.5 rounded text-xs transition-all flex items-center justify-between gap-1 cursor-pointer ${
                            isScActive
                              ? isDarkEffective
                                ? 'bg-[#2563eb] text-white font-semibold shadow-xs'
                                : 'bg-[#04162e] text-white font-semibold shadow-xs'
                              : isDarkEffective
                              ? 'text-[#94a3b8] hover:bg-[#15202f] hover:text-[#f8fafc]'
                              : 'text-[#44474d] hover:bg-[#eaeef2] hover:text-[#04162e]'
                          }`}
                        >
                          <span className="truncate">{sc.title}</span>
                          <span
                            className={`text-[10px] font-mono ${
                              isScActive
                                ? 'text-blue-100 font-bold'
                                : isDarkEffective
                                ? 'text-[#64748b]'
                                : 'text-gray-400'
                            }`}
                          >
                            {sc.wordCount || 0}
                          </span>
                        </button>
                      );
                    })}

                    <button
                      onClick={handleAddNewScene}
                      className={`w-full text-left px-2 py-1 text-[11px] rounded font-semibold flex items-center gap-1 mt-1 cursor-pointer transition-colors ${
                        isDarkEffective
                          ? 'text-[#60a5fa] hover:bg-[#16202f]'
                          : 'text-[#04162e] hover:bg-[#dfe3e7]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Adicionar Cena
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* 2. The Writing Editor (Center Fluid Canvas) */}
      <section
        id="studio-canvas-center"
        className={`flex-1 flex flex-col h-full ${canvasThemeStyles.bgOuter} overflow-hidden transition-colors duration-200`}
      >
        {/* Formatting & Studio Atmosphere Toolbar */}
        <div
          id="editor-toolbar"
          className={`h-11 border-b px-4 flex items-center justify-between shrink-0 select-none text-xs ${
            isDarkEffective
              ? 'bg-[#0d1420] border-[#1e293b] text-[#e2e8f0]'
              : 'bg-[#ffffff] border-[#c5c6ce] text-[#171c1f]'
          }`}
        >
          {/* Left toolbar formatting buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => insertFormatting('**', '**')}
              className={`p-1.5 rounded transition-colors ${
                isDarkEffective
                  ? 'text-[#94a3b8] hover:text-white hover:bg-[#1a2536]'
                  : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Negrito (**texto**)"
            >
              <span className="material-symbols-outlined text-[18px]">format_bold</span>
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className={`p-1.5 rounded transition-colors ${
                isDarkEffective
                  ? 'text-[#94a3b8] hover:text-white hover:bg-[#1a2536]'
                  : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Itálico (*texto*)"
            >
              <span className="material-symbols-outlined text-[18px]">format_italic</span>
            </button>
            <button
              onClick={() => insertFormatting('## ', '\n')}
              className={`p-1.5 rounded transition-colors ${
                isDarkEffective
                  ? 'text-[#94a3b8] hover:text-white hover:bg-[#1a2536]'
                  : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Subtítulo de Cena"
            >
              <span className="material-symbols-outlined text-[18px]">title</span>
            </button>
            <button
              onClick={() => insertFormatting('> ', '\n')}
              className={`p-1.5 rounded transition-colors ${
                isDarkEffective
                  ? 'text-[#94a3b8] hover:text-white hover:bg-[#1a2536]'
                  : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Citação / Pensamento"
            >
              <span className="material-symbols-outlined text-[18px]">format_quote</span>
            </button>
            <div className={`w-px h-5 mx-1 ${isDarkEffective ? 'bg-[#1e293b]' : 'bg-[#c5c6ce]'}`}></div>
            <button
              onClick={insertDialogueDash}
              className={`px-2 py-1 rounded font-semibold flex items-center gap-1 text-[11px] transition-colors ${
                isDarkEffective
                  ? 'text-[#93c5fd] hover:bg-[#1a2536]'
                  : 'text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Travessão de Diálogo (—)"
            >
              <span className="font-serif font-bold text-sm leading-none">—</span>
              Diálogo
            </button>
            <button
              onClick={insertSceneBreak}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                isDarkEffective
                  ? 'text-[#93c5fd] hover:bg-[#1a2536]'
                  : 'text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Quebra de Cena (* * *)"
            >
              * * *
            </button>
            <div className={`w-px h-5 mx-1 ${isDarkEffective ? 'bg-[#1e293b]' : 'bg-[#c5c6ce]'}`}></div>

            {/* View Mode Toggle: Editor vs Visual Style Checker */}
            <div className="flex items-center rounded p-0.5 border border-current/10 bg-current/5">
              <button
                onClick={() => setCanvasViewMode('edit')}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  canvasViewMode === 'edit'
                    ? isDarkEffective
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'bg-[#04162e] text-white shadow-xs'
                    : isDarkEffective
                    ? 'text-[#94a3b8] hover:text-white'
                    : 'text-[#44474d] hover:text-[#04162e]'
                }`}
                title="Modo de Edição de Texto"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Editor</span>
              </button>

              <button
                onClick={() => {
                  setCanvasViewMode('checker');
                  if (!isInspectorOpen) setIsInspectorOpen(true);
                  setInspectorTab('style');
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  canvasViewMode === 'checker'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : isDarkEffective
                    ? 'text-amber-400 hover:text-amber-300'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
                title="Verificador de Estilo & Repetições"
              >
                <span className="material-symbols-outlined text-[14px]">spellcheck</span>
                <span>Verificador</span>
                {totalStyleAlerts > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                    {totalStyleAlerts}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right toolbar controls: Dark Mode & Theme Picker & Font Scale */}
          <div className="flex items-center gap-2 relative">
            {/* Quick Auto-Save Indicator in Writing Toolbar */}
            <div className="hidden lg:block">
              <AutoSaveIndicator
                status={autoSaveStatus}
                lastSavedAt={lastSavedAt}
                onForceSave={onForceSave}
                isDarkEffective={isDarkEffective}
                compact={true}
              />
            </div>

            {/* Quick Style Inspector Trigger */}
            <button
              onClick={() => {
                setIsInspectorOpen(true);
                setInspectorTab('style');
              }}
              className={`hidden md:flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border transition-all ${
                totalStyleAlerts > 0
                  ? isDarkEffective
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/50'
                    : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                  : isDarkEffective
                  ? 'bg-[#15202f] border-[#253347] text-emerald-400'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}
              title="Abrir Verificador de Estilo e Repetições"
            >
              <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
              <span>Estilo ({totalStyleAlerts})</span>
            </button>
            {/* Font Size & Spacing Controls */}
            <div className="hidden sm:flex items-center gap-0.5 mr-1">
              <button
                onClick={() => {
                  const sizes: StudioFontSize[] = ['sm', 'base', 'lg', 'xl'];
                  const curIdx = sizes.indexOf(fontSize);
                  const nextIdx = (curIdx + 1) % sizes.length;
                  setFontSize(sizes[nextIdx]);
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-0.5 border ${
                  isDarkEffective
                    ? 'border-[#253347] bg-[#16202f] text-[#cbd5e1] hover:text-white'
                    : 'border-[#c5c6ce] bg-[#eaeef2] text-[#04162e] hover:bg-[#dfe3e7]'
                }`}
                title={`Alterar Tamanho da Fonte (Atual: ${fontSize})`}
              >
                <span className="text-[10px]">A</span>
                <span className="text-xs font-bold">A+</span>
              </button>

              <button
                onClick={() => {
                  const next = lineSpacing === 'normal' ? 'relaxed' : lineSpacing === 'relaxed' ? 'spacious' : 'normal';
                  setLineSpacing(next);
                }}
                className={`p-1 rounded border ${
                  isDarkEffective
                    ? 'border-[#253347] bg-[#16202f] text-[#cbd5e1] hover:text-white'
                    : 'border-[#c5c6ce] bg-[#eaeef2] text-[#04162e] hover:bg-[#dfe3e7]'
                }`}
                title={`Espaçamento de Linha (Atual: ${lineSpacing})`}
              >
                <span className="material-symbols-outlined text-[16px]">format_line_spacing</span>
              </button>
            </div>

            {/* Atmosphere / Theme Selector Button */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu((p) => !p)}
                className={`px-2.5 py-1 rounded font-semibold text-xs flex items-center gap-1.5 border transition-all ${
                  isDarkEffective
                    ? 'bg-[#1b2637] border-[#2e405b] text-amber-300 hover:bg-[#233147]'
                    : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e] hover:bg-[#dfe3e7]'
                }`}
                title="Personalizar Tema & Ambiente de Escrita Noturno"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400">
                  {canvasThemeStyles.icon}
                </span>
                <span className="hidden md:inline">{canvasThemeStyles.name.split(' ')[0]}</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              {/* Theme Dropdown Menu */}
              {showThemeMenu && (
                <div
                  className={`absolute right-0 top-full mt-1.5 w-60 rounded-xl border shadow-xl z-50 p-2 text-xs space-y-1 ${
                    isDarkEffective
                      ? 'bg-[#111827] border-[#2a3a50] text-[#f1f5f9]'
                      : 'bg-[#ffffff] border-[#c5c6ce] text-[#171c1f]'
                  }`}
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] border-b border-gray-700/50 pb-1 mb-1">
                    Ambiente Noturno & Conforto
                  </div>

                  <button
                    onClick={() => {
                      setStudioTheme('night-slate');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-colors ${
                      studioTheme === 'night-slate'
                        ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/50'
                        : 'hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#121b28] border border-blue-400 shrink-0"></span>
                    <div className="flex-1">
                      <p className="font-semibold">Slate Escuro</p>
                      <p className="text-[10px] text-gray-400">Contraste equilibrado anti-fadiga</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setStudioTheme('oled');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-colors ${
                      studioTheme === 'oled'
                        ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/50'
                        : 'hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-black border border-gray-600 shrink-0"></span>
                    <div className="flex-1">
                      <p className="font-semibold">OLED Puro</p>
                      <p className="text-[10px] text-gray-400">Preto absoluto sem reflexos</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setStudioTheme('sepia-dark');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-colors ${
                      studioTheme === 'sepia-dark'
                        ? 'bg-amber-600/30 text-amber-200 font-bold border border-amber-500/50'
                        : 'hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#221c17] border border-amber-400 shrink-0"></span>
                    <div className="flex-1">
                      <p className="font-semibold">Sépia Noturno</p>
                      <p className="text-[10px] text-gray-400">Luz âmbar suave para madrugadas</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setStudioTheme('paper-light');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-colors ${
                      studioTheme === 'paper-light'
                        ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/50'
                        : 'hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-white border border-gray-400 shrink-0"></span>
                    <div className="flex-1">
                      <p className="font-semibold">Papel Claro</p>
                      <p className="text-[10px] text-gray-400">Contraste clássico diurno</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Word count live pill */}
            <span
              className={`text-[11px] font-mono px-2.5 py-1 rounded border ${
                isDarkEffective
                  ? 'bg-[#15202f] border-[#253347] text-[#93c5fd]'
                  : 'bg-[#eaeef2] border-[#c5c6ce] text-[#44474d]'
              }`}
            >
              <strong>{activeScene?.wordCount || 0}</strong> pal.
            </span>

            {/* Focus Mode button */}
            <button
              onClick={() => onOpenFocusMode(activeScene?.id)}
              className={`px-2.5 py-1 font-semibold rounded text-xs flex items-center gap-1 transition-all border ${
                isDarkEffective
                  ? 'bg-[#15202f] hover:bg-[#1f2e42] border-[#28384f] text-[#cbd5e1]'
                  : 'bg-[#eaeef2] hover:bg-[#dfe3e7] border-[#c5c6ce] text-[#04162e]'
              }`}
              title="Tela Cheia Sem Distrações"
            >
              <span className="material-symbols-outlined text-[16px]">fullscreen</span>
              <span className="hidden sm:inline">Foco</span>
            </button>

            {/* Toggle Inspector */}
            <button
              onClick={() => setIsInspectorOpen((prev) => !prev)}
              className={`p-1.5 rounded transition-colors ${
                isInspectorOpen
                  ? isDarkEffective
                    ? 'bg-[#2563eb] text-white'
                    : 'bg-[#04162e] text-white'
                  : isDarkEffective
                  ? 'hover:bg-[#1a2536] text-[#94a3b8] hover:text-white'
                  : 'hover:bg-[#eaeef2] text-[#44474d] hover:text-[#04162e]'
              }`}
              title="Painel do Inspetor"
            >
              <span className="material-symbols-outlined text-[18px]">view_sidebar</span>
            </button>
          </div>
        </div>

        {/* Scrollable Center Manuscript Canvas */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 flex justify-center ${canvasThemeStyles.bgOuter} transition-colors duration-200`}
        >
          <div
            className={`w-full max-w-[780px] ${canvasThemeStyles.cardBg} border ${canvasThemeStyles.cardBorder} ${canvasThemeStyles.cardShadow} rounded-xl p-6 sm:p-10 lg:p-14 flex flex-col transition-colors duration-200 ${canvasThemeStyles.selectionClass}`}
          >
            {/* Scene Header */}
            <div className={`mb-6 pb-4 border-b ${canvasThemeStyles.headerBorder}`}>
              <div className={`flex items-center justify-between gap-2 text-xs ${canvasThemeStyles.subtitleColor} mb-2`}>
                <span className="font-semibold">{activeChapter?.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] opacity-80">Status:</span>
                  <select
                    value={activeScene?.status || 'Rascunho'}
                    onChange={(e) =>
                      handleSceneMetaUpdate({ status: e.target.value as ContentStatus })
                    }
                    className={`rounded px-2.5 py-1 text-xs font-semibold ${canvasThemeStyles.selectBg} transition-colors cursor-pointer`}
                  >
                    <option value="Rascunho">Rascunho</option>
                    <option value="Revisado">Revisado</option>
                    <option value="Final">Final</option>
                  </select>
                </div>
              </div>

              <input
                type="text"
                value={activeScene?.title || ''}
                onChange={(e) => handleSceneMetaUpdate({ title: e.target.value })}
                className={`font-headline-md text-xl sm:text-2xl font-bold ${canvasThemeStyles.titleColor} w-full bg-transparent focus:outline-none border-b border-transparent focus:border-blue-500/50 pb-1`}
                placeholder="Título da Cena..."
              />
            </div>

            {/* The Literary Writing Textarea or Interactive Style Highlight Viewer */}
            {canvasViewMode === 'checker' ? (
              <StyleHighlightedViewer
                content={activeScene?.content || ''}
                styleAnalysis={styleAnalysis}
                onReplaceTerm={handleReplaceTerm}
                onSwitchToEditor={() => setCanvasViewMode('edit')}
                fontSizeClass={fontSizeClass}
                lineSpacingStyle={lineSpacingStyle}
                isDarkEffective={isDarkEffective}
                textColor={canvasThemeStyles.textColor}
              />
            ) : (
              <textarea
                ref={textareaRef}
                value={activeScene?.content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Comece a escrever sua cena aqui... Use parágrafos fluidos, diálogos e descrições ricas para dar vida à narrativa."
                className={`w-full flex-1 min-h-[460px] font-writing-canvas text-writing-canvas ${fontSizeClass} ${canvasThemeStyles.textColor} bg-transparent focus:outline-none resize-none`}
                style={{
                  lineHeight: lineSpacingStyle,
                  letterSpacing: '0.01em',
                }}
              />
            )}

            {/* Footer Canvas Meta */}
            <div
              className={`mt-8 pt-4 border-t ${canvasThemeStyles.headerBorder} flex flex-wrap items-center justify-between gap-3 text-xs ${canvasThemeStyles.metaColor}`}
            >
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>
                  {Math.ceil((activeScene?.wordCount || 0) / 250)} min de leitura estimada
                </span>
                <span>•</span>
                <span>{activeScene?.wordCount || 0} palavras</span>
                <span>•</span>
                <span>{(activeScene?.content || '').length} caracteres</span>
              </div>
              <div className="flex items-center gap-2">
                <AutoSaveIndicator
                  status={autoSaveStatus}
                  lastSavedAt={lastSavedAt}
                  onForceSave={onForceSave}
                  isDarkEffective={isDarkEffective}
                  compact={false}
                  showShortcutHint={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Inspector (Right Pane) */}
      {isInspectorOpen && (
        <aside
          id="studio-inspector-pane"
          className={`w-80 shrink-0 border-l flex flex-col h-full overflow-hidden transition-colors duration-200 ${
            isDarkEffective
              ? 'bg-[#0d1420] border-[#1e293b] text-[#e2e8f0]'
              : 'bg-[#ffffff] border-[#c5c6ce] text-[#171c1f]'
          }`}
        >
          {/* Inspector Header with Tab Pills */}
          <div
            className={`p-2.5 border-b flex items-center justify-between gap-2 shrink-0 ${
              isDarkEffective ? 'bg-[#111a28] border-[#1e293b]' : 'bg-[#eaeef2] border-[#c5c6ce]'
            }`}
          >
            <div className="flex items-center gap-1 bg-black/10 p-0.5 rounded border border-current/10 flex-1 min-w-0">
              <button
                onClick={() => setInspectorTab('scene')}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                  inspectorTab === 'scene'
                    ? isDarkEffective
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'bg-[#04162e] text-white shadow-xs'
                    : isDarkEffective
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>Cena</span>
              </button>

              <button
                onClick={() => setInspectorTab('style')}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                  inspectorTab === 'style'
                    ? isDarkEffective
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'bg-[#04162e] text-white shadow-xs'
                    : isDarkEffective
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                <span>Estilo</span>
                {totalStyleAlerts > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                    {totalStyleAlerts}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => setIsInspectorOpen(false)}
              className={`p-1 rounded transition-colors shrink-0 ${
                isDarkEffective ? 'text-[#94a3b8] hover:text-white' : 'text-[#75777e] hover:text-[#04162e]'
              }`}
              title="Ocultar Inspetor"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1 text-xs">
            {inspectorTab === 'style' ? (
              <StyleCheckerPanel
                styleAnalysis={styleAnalysis}
                styleSettings={styleSettings}
                onUpdateSettings={handleUpdateStyleSettings}
                onReplaceTerm={handleReplaceTerm}
                isDarkEffective={isDarkEffective}
              />
            ) : (
              <div className="space-y-5">
                {/* Synopsis */}
                <div>
                  <label className={`font-label-caps block mb-1.5 ${isDarkEffective ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>
                    Sinopse / Objetivos da Cena
                  </label>
                  <textarea
                    rows={3}
                    value={activeScene?.synopsis || ''}
                    onChange={(e) => handleSceneMetaUpdate({ synopsis: e.target.value })}
                    placeholder="Qual o objetivo e ponto de virada dramático desta cena?"
                    className={`w-full p-2.5 rounded font-writing-canvas text-xs leading-relaxed border transition-colors ${
                      isDarkEffective
                        ? 'bg-[#141e2c] border-[#24334a] text-[#f1f5f9] placeholder-gray-500 focus:border-blue-400'
                        : 'bg-[#f6fafe] border-[#c5c6ce] text-[#171c1f] focus:border-[#04162e]'
                    }`}
                  />
                </div>

                {/* POV Character */}
                <div>
                  <label className={`font-label-caps block mb-1.5 ${isDarkEffective ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>
                    Ponto de Vista (POV)
                  </label>
                  <select
                    value={activeScene?.povCharacterId || ''}
                    onChange={(e) => handleSceneMetaUpdate({ povCharacterId: e.target.value })}
                    className={`w-full p-2 rounded text-xs mb-2 border transition-colors ${
                      isDarkEffective
                        ? 'bg-[#141e2c] border-[#24334a] text-[#f1f5f9] focus:border-blue-400'
                        : 'bg-[#f6fafe] border-[#c5c6ce] text-[#171c1f] focus:border-[#04162e]'
                    }`}
                  >
                    <option value="">Selecione o narrador/POV</option>
                    {project.characters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role})
                      </option>
                    ))}
                  </select>

                  {povChar && (
                    <div
                      className={`flex items-center gap-2.5 p-2 rounded border ${
                        isDarkEffective
                          ? 'bg-[#141e2c] border-[#24334a]'
                          : 'bg-[#eaeef2] border-[#c5c6ce]'
                      }`}
                    >
                      <img
                        src={povChar.avatarUrl}
                        alt={povChar.name}
                        className={`w-8 h-8 rounded-full object-cover border ${
                          isDarkEffective ? 'border-[#334155]' : 'border-[#c5c6ce]'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className={`font-bold truncate ${isDarkEffective ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>
                          {povChar.name}
                        </p>
                        <p className={`text-[10px] truncate ${isDarkEffective ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>
                          {povChar.tagline}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className={`font-label-caps block mb-1.5 ${isDarkEffective ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>
                    Cenário / Localização
                  </label>
                  <select
                    value={activeScene?.locationId || ''}
                    onChange={(e) => handleSceneMetaUpdate({ locationId: e.target.value })}
                    className={`w-full p-2 rounded text-xs mb-2 border transition-colors ${
                      isDarkEffective
                        ? 'bg-[#141e2c] border-[#24334a] text-[#f1f5f9] focus:border-blue-400'
                        : 'bg-[#f6fafe] border-[#c5c6ce] text-[#171c1f] focus:border-[#04162e]'
                    }`}
                  >
                    <option value="">Selecione o local</option>
                    {project.locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>

                  {locObj && (
                    <div className={`relative rounded overflow-hidden h-20 border mb-1 ${isDarkEffective ? 'border-[#24334a]' : 'border-[#c5c6ce]'}`}>
                      <img
                        src={locObj.imageUrl}
                        alt={locObj.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex items-end">
                        <span className="text-white font-bold text-[11px] truncate">
                          {locObj.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Characters Present in Scene */}
                <div>
                  <label className={`font-label-caps block mb-1.5 ${isDarkEffective ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>
                    Personagens em Cena
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {project.characters.map((char) => {
                      const isPresent = activeScene?.characterIds.includes(char.id);
                      return (
                        <button
                          key={char.id}
                          onClick={() => {
                            const nextIds = isPresent
                              ? activeScene.characterIds.filter((id) => id !== char.id)
                              : [...(activeScene?.characterIds || []), char.id];
                            handleSceneMetaUpdate({ characterIds: nextIds });
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                            isPresent
                              ? isDarkEffective
                                ? 'bg-[#2563eb] text-white shadow-xs'
                                : 'bg-[#04162e] text-white shadow-xs'
                              : isDarkEffective
                              ? 'bg-[#141e2c] text-[#94a3b8] hover:bg-[#1e2a3c] border border-[#24334a]'
                              : 'bg-[#eaeef2] text-[#44474d] hover:bg-[#dfe3e7] border border-[#c5c6ce]'
                          }`}
                        >
                          {char.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scratchpad & Notes */}
                <div>
                  <label className={`font-label-caps block mb-1.5 ${isDarkEffective ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>
                    Notas & Ideias de Pesquisa
                  </label>
                  <textarea
                    rows={3}
                    value={activeScene?.notes || ''}
                    onChange={(e) => handleSceneMetaUpdate({ notes: e.target.value })}
                    placeholder="Rascunhos de diálogos, detalhes sensoriais a incluir..."
                    className={`w-full p-2.5 rounded font-mono text-xs border transition-colors ${
                      isDarkEffective
                        ? 'bg-[#141e2c] border-[#24334a] text-[#f1f5f9] placeholder-gray-500 focus:border-blue-400'
                        : 'bg-[#f6fafe] border-[#c5c6ce] text-[#171c1f] focus:border-[#04162e]'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

