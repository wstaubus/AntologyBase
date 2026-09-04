import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NovelProject, Chapter, Scene, StyleCheckerSettings } from '../types';
import { analyzeProseStyle, DEFAULT_STYLE_SETTINGS } from '../utils/styleChecker';

interface ReadingModeViewProps {
  project: NovelProject;
  activeChapterId: string;
  activeSceneId: string;
  onSelectScene: (chapterId: string, sceneId: string) => void;
  onUpdateProject: (updated: NovelProject) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

type ReadingTheme = 'paper' | 'sepia' | 'dark' | 'oled';
type ReadingFont = 'serif' | 'sans' | 'mono';
type ReadingScope = 'scene' | 'chapter';

export const ReadingModeView: React.FC<ReadingModeViewProps> = ({
  project,
  activeChapterId,
  activeSceneId,
  onSelectScene,
  onUpdateProject,
  onClose,
  isDarkMode = false,
}) => {
  // Theme & Appearance
  const [theme, setTheme] = useState<ReadingTheme>(() => (isDarkMode ? 'dark' : 'paper'));
  const [fontFamily, setFontFamily] = useState<ReadingFont>('serif');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('lg');
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [columnWidth, setColumnWidth] = useState<'narrow' | 'normal' | 'wide'>('normal');
  const [textAlign, setTextAlign] = useState<'justify' | 'left'>('justify');

  // Reading Mode features
  const [scope, setScope] = useState<ReadingScope>('scene');
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [highlightIssues, setHighlightIssues] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [showAppearanceMenu, setShowAppearanceMenu] = useState<boolean>(false);
  const [showSceneListMenu, setShowSceneListMenu] = useState<boolean>(false);

  // Scroll container ref for reading progress
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [readingProgress, setReadingProgress] = useState<number>(0);

  // Find active chapter and scene
  const activeChapter =
    project.chapters.find((c) => c.id === activeChapterId) || project.chapters[0];
  const activeScene =
    activeChapter?.scenes.find((s) => s.id === activeSceneId) || activeChapter?.scenes[0];

  // List of all scenes in current chapter for easy navigation
  const chapterScenes = activeChapter?.scenes || [];
  const currentSceneIndex = chapterScenes.findIndex((s) => s.id === activeScene?.id);
  const hasPrevScene = currentSceneIndex > 0;
  const hasNextScene = currentSceneIndex < chapterScenes.length - 1;

  // Handle navigating scenes
  const handlePrevScene = () => {
    if (hasPrevScene) {
      const prevScene = chapterScenes[currentSceneIndex - 1];
      onSelectScene(activeChapter.id, prevScene.id);
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleNextScene = () => {
    if (hasNextScene) {
      const nextScene = chapterScenes[currentSceneIndex + 1];
      onSelectScene(activeChapter.id, nextScene.id);
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Keyboard navigation & Escape to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept navigation keys if currently typing in an editable field
      const target = e.target as HTMLElement;
      const isTyping = target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT');

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (!isTyping) {
        if (e.key === 'ArrowLeft' && e.altKey) {
          e.preventDefault();
          handlePrevScene();
        } else if (e.key === 'ArrowRight' && e.altKey) {
          e.preventDefault();
          handleNextScene();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrevScene, hasNextScene, currentSceneIndex, chapterScenes, onClose]);

  // Track reading scroll progress
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollHeight <= clientHeight) {
      setReadingProgress(100);
      return;
    }
    const progress = Math.min(100, Math.max(0, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)));
    setReadingProgress(progress);
  };

  // Style Checker Settings and Analysis (for the optional subtle style highlight)
  const styleSettings: StyleCheckerSettings = useMemo(() => {
    return project.styleSettings || DEFAULT_STYLE_SETTINGS;
  }, [project.styleSettings]);

  const styleAnalysis = useMemo(() => {
    if (!highlightIssues || !activeScene) return null;
    return analyzeProseStyle(activeScene.content || '', styleSettings);
  }, [highlightIssues, activeScene?.content, styleSettings]);

  // Compute Word Count & Reading Time
  const activeContentWords = useMemo(() => {
    if (scope === 'scene') {
      return activeScene?.wordCount || 0;
    }
    // Chapter total words
    return chapterScenes.reduce((acc, sc) => acc + (sc.wordCount || 0), 0);
  }, [scope, activeScene, chapterScenes]);

  const estimatedReadingMinutes = Math.max(1, Math.ceil(activeContentWords / 200));

  // Handle direct text revision in reading mode
  const handleUpdateActiveSceneText = (newContent: string) => {
    if (!activeScene || !activeChapter) return;
    const words = newContent.trim() ? newContent.trim().split(/\s+/).filter(Boolean).length : 0;

    const updatedChapters = project.chapters.map((chap) => {
      if (chap.id !== activeChapter.id) return chap;
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

  // Style configurations
  const themeClasses = {
    paper: {
      bg: 'bg-[#faf8f5]',
      text: 'text-[#1c1917]',
      secondary: 'text-[#78716c]',
      border: 'border-[#e7e5e4]',
      headerBg: 'bg-[#faf8f5]/90',
      cardBg: 'bg-[#ffffff]',
      highlightEcho: 'bg-amber-100 text-amber-900 border-b border-amber-300',
      highlightAvoid: 'bg-rose-100 text-rose-900 border-b border-rose-300',
    },
    sepia: {
      bg: 'bg-[#f5ede0]',
      text: 'text-[#382a1d]',
      secondary: 'text-[#856b54]',
      border: 'border-[#e3d3bd]',
      headerBg: 'bg-[#f5ede0]/90',
      cardBg: 'bg-[#ede1ce]',
      highlightEcho: 'bg-[#e2cbb0] text-[#382a1d] border-b border-[#c4a582]',
      highlightAvoid: 'bg-[#f1cdcd] text-[#5e2222] border-b border-[#e19a9a]',
    },
    dark: {
      bg: 'bg-[#0f172a]',
      text: 'text-[#e2e8f0]',
      secondary: 'text-[#94a3b8]',
      border: 'border-[#1e293b]',
      headerBg: 'bg-[#0f172a]/90',
      cardBg: 'bg-[#1e293b]',
      highlightEcho: 'bg-amber-950/60 text-amber-200 border-b border-amber-600',
      highlightAvoid: 'bg-rose-950/60 text-rose-200 border-b border-rose-600',
    },
    oled: {
      bg: 'bg-[#000000]',
      text: 'text-[#d1d5db]',
      secondary: 'text-[#6b7280]',
      border: 'border-[#1f2937]',
      headerBg: 'bg-[#000000]/90',
      cardBg: 'bg-[#111827]',
      highlightEcho: 'bg-amber-950/80 text-amber-200 border-b border-amber-500',
      highlightAvoid: 'bg-rose-950/80 text-rose-200 border-b border-rose-500',
    },
  }[theme];

  const fontClass = {
    serif: 'font-serif font-normal',
    sans: 'font-sans font-normal',
    mono: 'font-mono text-[0.95em]',
  }[fontFamily];

  const fontSizeClass = {
    sm: 'text-base sm:text-lg',
    base: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
    '2xl': 'text-3xl sm:text-4xl',
  }[fontSize];

  const lineHeightStyle = {
    normal: '1.65',
    relaxed: '1.95',
    loose: '2.3',
  }[lineHeight];

  const columnWidthClass = {
    narrow: 'max-w-xl',
    normal: 'max-w-2xl',
    wide: 'max-w-4xl',
  }[columnWidth];

  // Helper to render paragraph with clean literary styling
  const renderParagraphs = (text: string) => {
    if (!text || text.trim() === '') {
      return (
        <p className="italic opacity-60 text-center py-12">
          (Esta cena ainda não possui texto. Você pode clicar no botão de lápis acima para começar a escrever ou revisar.)
        </p>
      );
    }

    const rawParagraphs = text.split(/\n\s*\n/);

    return rawParagraphs.map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Handle Markdown headers in text (e.g., # Title or ## Subtitle)
      if (trimmed.startsWith('# ')) {
        return (
          <h2
            key={idx}
            className="text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-4 font-serif text-center"
          >
            {trimmed.replace(/^#\s+/, '')}
          </h2>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3
            key={idx}
            className="text-xl sm:text-2xl font-semibold tracking-tight mt-6 mb-3 font-serif text-center"
          >
            {trimmed.replace(/^##\s+/, '')}
          </h3>
        );
      }

      // Handle scene break markers like * * * or ---
      if (trimmed === '* * *' || trimmed === '***' || trimmed === '---') {
        return (
          <div key={idx} className="my-8 text-center tracking-[0.5em] opacity-50 font-serif select-none">
            ✦ ✦ ✦
          </div>
        );
      }

      // Dialogue detection (starts with em-dash or quotes)
      const isDialogue =
        trimmed.startsWith('—') ||
        trimmed.startsWith('- ') ||
        trimmed.startsWith('"') ||
        trimmed.startsWith('“');

      return (
        <p
          key={idx}
          className={`mb-5 ${textAlign === 'justify' ? 'text-justify' : 'text-left'} ${
            isDialogue ? 'pl-2 border-l-2 border-current/20' : 'indent-6 sm:indent-8'
          } leading-[inherit] transition-colors`}
        >
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div
      id="reading-mode-overlay"
      className={`fixed inset-0 z-50 flex flex-col ${themeClasses.bg} ${themeClasses.text} select-text transition-colors duration-200 overflow-hidden`}
    >
      {/* 1. Subtle, Non-Intrusive Top Bar (Auto-reveals or toggles) */}
      <header
        className={`shrink-0 z-30 transition-all duration-300 backdrop-blur-md border-b ${
          themeClasses.headerBg
        } ${themeClasses.border} ${
          isControlsVisible ? 'translate-y-0 opacity-100 py-2.5 px-4 sm:px-8' : '-translate-y-full opacity-0 py-0 px-4'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Project & Scene Meta */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className={`p-2 rounded-lg border ${themeClasses.border} hover:opacity-80 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0 shadow-xs`}
              title="Sair do Modo de Leitura (Esc)"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="hidden sm:inline">Voltar ao Estúdio</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] bg-black/5 dark:bg-white/10 font-mono">
                Esc
              </kbd>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${themeClasses.secondary} truncate`}>
                  {project.title}
                </span>
                <span className="text-[10px] opacity-40">•</span>
                <span className={`text-[11px] font-semibold truncate`}>
                  {activeChapter?.title}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold truncate">
                {scope === 'scene' ? activeScene?.title : `Capítulo Completo (${chapterScenes.length} cenas)`}
              </h1>
            </div>
          </div>

          {/* Center: Scope Toggle (Cena Atual vs Capítulo Completo) */}
          <div className="hidden md:flex items-center p-0.5 rounded-lg border border-current/15 bg-current/5 shrink-0">
            <button
              onClick={() => setScope('scene')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                scope === 'scene'
                  ? 'bg-current/15 shadow-xs font-semibold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Cena Atual
            </button>
            <button
              onClick={() => setScope('chapter')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                scope === 'chapter'
                  ? 'bg-current/15 shadow-xs font-semibold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Capítulo Completo
            </button>
          </div>

          {/* Right: Reading Stats, Appearance Menu, and Exit */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Word count & Read time */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold font-mono">
                {activeContentWords.toLocaleString()} palavras
              </span>
              <span className={`text-[10px] ${themeClasses.secondary}`}>
                ~{estimatedReadingMinutes} min de leitura
              </span>
            </div>

            {/* Previous / Next Scene Buttons */}
            {scope === 'scene' && (
              <div className="flex items-center border rounded-lg border-current/15 overflow-hidden">
                <button
                  onClick={handlePrevScene}
                  disabled={!hasPrevScene}
                  className="p-1.5 hover:bg-current/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Cena Anterior (Alt + ←)"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <div className="px-2 text-[11px] font-mono font-semibold hidden sm:inline">
                  {currentSceneIndex + 1} / {chapterScenes.length}
                </div>
                <button
                  onClick={handleNextScene}
                  disabled={!hasNextScene}
                  className="p-1.5 hover:bg-current/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Próxima Cena (Alt + →)"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}

            {/* Quick Edit Mode Toggle (allows light proofreading fixes) */}
            <button
              onClick={() => setIsEditable((prev) => !prev)}
              className={`p-2 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                isEditable
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : `border-current/20 hover:bg-current/5`
              }`}
              title={isEditable ? 'Modo Edição Ativo (clique para voltar à Leitura Pura)' : 'Corrigir Texto Diretamente (Revisão Ativa)'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isEditable ? 'edit' : 'edit_note'}
              </span>
              <span className="hidden sm:inline">{isEditable ? 'Editando' : 'Revisar'}</span>
            </button>

            {/* Appearance Settings Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowAppearanceMenu((prev) => !prev)}
                className={`p-2 rounded-lg border border-current/20 hover:bg-current/10 transition-colors flex items-center gap-1 cursor-pointer`}
                title="Configurações de Tipografia e Tema"
              >
                <span className="material-symbols-outlined text-[18px]">format_size</span>
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
              </button>

              {/* Appearance Dropdown */}
              {showAppearanceMenu && (
                <div
                  className={`absolute right-0 top-full mt-2 w-72 rounded-xl p-4 shadow-2xl border ${themeClasses.cardBg} ${themeClasses.border} z-50 text-xs`}
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-current/10">
                    <span className="font-bold uppercase tracking-wider text-[10px] opacity-80">
                      Aparência de Leitura
                    </span>
                    <button
                      onClick={() => setShowAppearanceMenu(false)}
                      className="p-1 rounded hover:bg-current/10"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>

                  {/* Theme Selector */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold mb-1.5 opacity-80">Tema</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => setTheme('paper')}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          theme === 'paper' ? 'border-amber-600 ring-2 ring-amber-600/30 font-bold' : 'border-gray-300'
                        } bg-[#faf8f5] text-[#1c1917]`}
                      >
                        Papel
                      </button>
                      <button
                        onClick={() => setTheme('sepia')}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          theme === 'sepia' ? 'border-amber-700 ring-2 ring-amber-700/30 font-bold' : 'border-[#e3d3bd]'
                        } bg-[#f5ede0] text-[#382a1d]`}
                      >
                        Sépia
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          theme === 'dark' ? 'border-blue-500 ring-2 ring-blue-500/30 font-bold' : 'border-slate-700'
                        } bg-[#0f172a] text-[#e2e8f0]`}
                      >
                        Noite
                      </button>
                      <button
                        onClick={() => setTheme('oled')}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          theme === 'oled' ? 'border-gray-400 ring-2 ring-gray-400/30 font-bold' : 'border-neutral-800'
                        } bg-black text-gray-200`}
                      >
                        OLED
                      </button>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold mb-1.5 opacity-80">Tipografia</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setFontFamily('serif')}
                        className={`py-1.5 px-2 rounded-lg border font-serif text-center transition-all ${
                          fontFamily === 'serif' ? 'bg-current/15 border-current font-bold' : 'border-current/20'
                        }`}
                      >
                        Serifada
                      </button>
                      <button
                        onClick={() => setFontFamily('sans')}
                        className={`py-1.5 px-2 rounded-lg border font-sans text-center transition-all ${
                          fontFamily === 'sans' ? 'bg-current/15 border-current font-bold' : 'border-current/20'
                        }`}
                      >
                        Moderna
                      </button>
                      <button
                        onClick={() => setFontFamily('mono')}
                        className={`py-1.5 px-2 rounded-lg border font-mono text-center transition-all ${
                          fontFamily === 'mono' ? 'bg-current/15 border-current font-bold' : 'border-current/20'
                        }`}
                      >
                        Mono
                      </button>
                    </div>
                  </div>

                  {/* Font Size & Line Spacing */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1.5 opacity-80">Tamanho</label>
                      <div className="flex items-center gap-1 border border-current/20 rounded-lg p-0.5">
                        <button
                          onClick={() => {
                            if (fontSize === '2xl') setFontSize('xl');
                            else if (fontSize === 'xl') setFontSize('lg');
                            else if (fontSize === 'lg') setFontSize('base');
                            else if (fontSize === 'base') setFontSize('sm');
                          }}
                          disabled={fontSize === 'sm'}
                          className="flex-1 py-1 text-center font-bold disabled:opacity-30 hover:bg-current/10 rounded"
                        >
                          A-
                        </button>
                        <span className="text-[11px] font-mono px-1">{fontSize.toUpperCase()}</span>
                        <button
                          onClick={() => {
                            if (fontSize === 'sm') setFontSize('base');
                            else if (fontSize === 'base') setFontSize('lg');
                            else if (fontSize === 'lg') setFontSize('xl');
                            else if (fontSize === 'xl') setFontSize('2xl');
                          }}
                          disabled={fontSize === '2xl'}
                          className="flex-1 py-1 text-center font-bold disabled:opacity-30 hover:bg-current/10 rounded"
                        >
                          A+
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold mb-1.5 opacity-80">Espaçamento</label>
                      <div className="flex items-center gap-1 border border-current/20 rounded-lg p-0.5">
                        {(['normal', 'relaxed', 'loose'] as const).map((spacing) => (
                          <button
                            key={spacing}
                            onClick={() => setLineHeight(spacing)}
                            className={`flex-1 py-1 text-center text-[10px] font-semibold rounded ${
                              lineHeight === spacing ? 'bg-current/15 font-bold' : 'hover:bg-current/10'
                            }`}
                          >
                            {spacing === 'normal' ? '1.6' : spacing === 'relaxed' ? '1.9' : '2.3'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column Width & Text Alignment */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1.5 opacity-80">Largura</label>
                      <div className="flex items-center gap-1 border border-current/20 rounded-lg p-0.5">
                        {(['narrow', 'normal', 'wide'] as const).map((w) => (
                          <button
                            key={w}
                            onClick={() => setColumnWidth(w)}
                            className={`flex-1 py-1 text-center text-[10px] font-semibold rounded ${
                              columnWidth === w ? 'bg-current/15 font-bold' : 'hover:bg-current/10'
                            }`}
                          >
                            {w === 'narrow' ? 'Estreita' : w === 'normal' ? 'Ideal' : 'Ampla'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold mb-1.5 opacity-80">Alinhamento</label>
                      <div className="flex items-center gap-1 border border-current/20 rounded-lg p-0.5">
                        <button
                          onClick={() => setTextAlign('justify')}
                          className={`flex-1 py-1 text-center text-[10px] font-semibold rounded ${
                            textAlign === 'justify' ? 'bg-current/15 font-bold' : 'hover:bg-current/10'
                          }`}
                        >
                          Justificado
                        </button>
                        <button
                          onClick={() => setTextAlign('left')}
                          className={`flex-1 py-1 text-center text-[10px] font-semibold rounded ${
                            textAlign === 'left' ? 'bg-current/15 font-bold' : 'hover:bg-current/10'
                          }`}
                        >
                          Esquerda
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Subtle Style Highlighting */}
                  <div className="pt-2 border-t border-current/10 flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-[11px]">Realçar Ecos / Repetições</span>
                      <span className={`text-[10px] ${themeClasses.secondary}`}>
                        Apoio visual sutil para revisão de estilo
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={highlightIssues}
                      onChange={(e) => setHighlightIssues(e.target.checked)}
                      className="cursor-pointer h-4 w-4 rounded accent-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Reading Progress Indicator Line */}
      <div className="w-full h-0.5 bg-current/10 shrink-0 z-20">
        <div
          className="h-full bg-blue-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* 3. Main Reading Canvas (Centered, pristine editorial layout) */}
      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-10 sm:py-16 focus:outline-none"
        tabIndex={0}
      >
        <article
          className={`mx-auto ${columnWidthClass} ${fontClass} ${fontSizeClass} transition-all duration-150`}
          style={{ lineHeight: lineHeightStyle }}
        >
          {/* Header of the Book / Scene Title */}
          <header className="mb-10 sm:mb-14 pb-6 border-b border-current/15 text-center select-none">
            <span
              className={`text-xs sm:text-sm uppercase tracking-[0.25em] font-sans font-semibold ${themeClasses.secondary} block mb-2`}
            >
              {activeChapter?.title}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif">
              {scope === 'scene' ? activeScene?.title : 'Capítulo Completo'}
            </h1>
            {activeScene?.synopsis && scope === 'scene' && (
              <p
                className={`text-xs sm:text-sm italic mt-3 max-w-lg mx-auto ${themeClasses.secondary} font-sans`}
              >
                &ldquo;{activeScene.synopsis}&rdquo;
              </p>
            )}
          </header>

          {/* Reading / Editing Body */}
          {scope === 'scene' ? (
            isEditable ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2 text-xs font-sans text-blue-500 font-semibold bg-blue-500/10 p-2 rounded-lg">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Modo de Revisão Direta: as alterações são salvas automaticamente.
                  </span>
                  <button
                    onClick={() => setIsEditable(false)}
                    className="underline hover:opacity-80"
                  >
                    Concluir
                  </button>
                </div>
                <textarea
                  value={activeScene?.content || ''}
                  onChange={(e) => handleUpdateActiveSceneText(e.target.value)}
                  placeholder="Digite ou revise o texto da cena aqui..."
                  rows={22}
                  className={`w-full p-4 sm:p-6 rounded-xl border border-current/20 bg-transparent resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/50 leading-[inherit] ${fontClass} ${fontSizeClass}`}
                  style={{ lineHeight: lineHeightStyle }}
                />
              </div>
            ) : (
              <div className="reading-content-body">
                {renderParagraphs(activeScene?.content || '')}
              </div>
            )
          ) : (
            // Full Chapter Continuous Flow
            <div className="space-y-12">
              {chapterScenes.map((sc, sIdx) => (
                <section key={sc.id} className="scene-section">
                  {sIdx > 0 && (
                    <div className="my-12 text-center select-none">
                      <span className="tracking-[0.4em] opacity-40 font-serif">✦ ✦ ✦</span>
                      <h3 className="text-sm font-sans uppercase font-bold tracking-widest opacity-60 mt-3">
                        {sc.title}
                      </h3>
                    </div>
                  )}
                  {sIdx === 0 && (
                    <h3 className="text-sm font-sans uppercase font-bold tracking-widest opacity-60 mb-6 text-center select-none">
                      {sc.title}
                    </h3>
                  )}
                  <div className="reading-content-body">
                    {renderParagraphs(sc.content || '')}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Bottom Scene Turn-Page Navigation */}
          {scope === 'scene' && (
            <footer className="mt-16 sm:mt-24 pt-8 border-t border-current/15 flex flex-wrap justify-between items-center gap-4 text-xs font-sans select-none">
              <button
                onClick={handlePrevScene}
                disabled={!hasPrevScene}
                className={`flex items-center gap-2 p-2.5 rounded-lg border border-current/20 hover:bg-current/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-semibold ${
                  !hasPrevScene ? 'invisible' : ''
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Cena Anterior</span>
              </button>

              <span className={`text-[11px] ${themeClasses.secondary} font-mono`}>
                Cena {currentSceneIndex + 1} de {chapterScenes.length}
              </span>

              <button
                onClick={handleNextScene}
                disabled={!hasNextScene}
                className={`flex items-center gap-2 p-2.5 rounded-lg border border-current/20 hover:bg-current/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-semibold ${
                  !hasNextScene ? 'invisible' : ''
                }`}
              >
                <span>Próxima Cena</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </footer>
          )}

          {/* Subtle Final Chapter Mark */}
          {scope === 'chapter' && (
            <footer className="mt-20 pt-8 border-t border-current/15 text-center text-xs font-sans opacity-60 select-none">
              Fim de {activeChapter?.title} • {activeContentWords.toLocaleString()} palavras revisadas.
            </footer>
          )}
        </article>
      </main>

      {/* 4. Minimalist Floating Pill to toggle Controls Visibility */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsControlsVisible((prev) => !prev)}
          className={`p-2 rounded-full border shadow-lg backdrop-blur-md transition-all cursor-pointer ${
            themeClasses.cardBg
          } ${themeClasses.border} opacity-70 hover:opacity-100 hover:scale-105`}
          title={isControlsVisible ? 'Ocultar barra de topo (Modo Imersivo Puro)' : 'Mostrar barra de controles'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isControlsVisible ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        <button
          onClick={onClose}
          className={`px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md transition-all cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
            themeClasses.cardBg
          } ${themeClasses.border} opacity-80 hover:opacity-100 active:scale-95`}
          title="Sair do Modo de Leitura (Esc)"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          <span>Sair (Esc)</span>
        </button>
      </div>
    </div>
  );
};
