import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NovelProject, Chapter, Scene, TopSubTab, ContentStatus, StudioTheme, StudioFontSize, StyleCheckerSettings, AutoSaveStatus } from '../types';
import { analyzeProseStyle, DEFAULT_STYLE_SETTINGS, StyleAnalysisResult } from '../utils/styleChecker';
import { StyleCheckerPanel } from './StyleCheckerPanel';
import { StyleHighlightedViewer } from './StyleHighlightedViewer';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { ReadingModeView } from './ReadingModeView';
import { SynonymPopover } from './SynonymPopover';

interface WritingStudioViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
  subTab: TopSubTab;
  onSelectSubTab: (subTab: TopSubTab) => void;
  isBinderOpen?: boolean;
  onToggleBinder?: () => void;
  isInspectorOpen?: boolean;
  onToggleInspector?: () => void;
  isStoryboardOpen?: boolean;
  onToggleStoryboard?: () => void;
  onNavigateStoryboard?: () => void;
  selectedChapterId?: string;
  selectedSceneId?: string;
  isReadingMode?: boolean;
  onToggleReadingMode?: () => void;
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
  isBinderOpen: isBinderOpenProp,
  onToggleBinder: onToggleBinderProp,
  isInspectorOpen: isInspectorOpenProp,
  onToggleInspector: onToggleInspectorProp,
  isStoryboardOpen: isStoryboardOpenProp,
  onToggleStoryboard: onToggleStoryboardProp,
  onNavigateStoryboard,
  selectedChapterId,
  selectedSceneId,
  isReadingMode: isReadingModeProp,
  onToggleReadingMode: onToggleReadingModeProp,
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
    selectedChapterId || project.chapters[0]?.id || ''
  );
  const [activeSceneId, setActiveSceneId] = useState<string>(
    selectedSceneId || project.chapters[0]?.scenes[0]?.id || ''
  );

  // Sync when selectedChapterId or selectedSceneId change externally (e.g. clicked from Storyboard page)
  React.useEffect(() => {
    if (selectedChapterId && project.chapters.some((c) => c.id === selectedChapterId)) {
      setActiveChapterId(selectedChapterId);
    }
    if (selectedSceneId) {
      setActiveSceneId(selectedSceneId);
    }
  }, [selectedChapterId, selectedSceneId, project.chapters]);

  // Local state fallback for Binder, Inspector, Storyboard, and Reading Mode
  const [localBinderOpen, setLocalBinderOpen] = useState<boolean>(true);
  const [localInspectorOpen, setLocalInspectorOpen] = useState<boolean>(true);
  const [localStoryboardOpen, setLocalStoryboardOpen] = useState<boolean>(false);
  const [localReadingModeOpen, setLocalReadingModeOpen] = useState<boolean>(false);

  const effectiveBinderOpen = isBinderOpenProp !== undefined ? isBinderOpenProp : localBinderOpen;
  const effectiveInspectorOpen = isInspectorOpenProp !== undefined ? isInspectorOpenProp : localInspectorOpen;
  const effectiveStoryboardOpen = isStoryboardOpenProp !== undefined ? isStoryboardOpenProp : localStoryboardOpen;
  const effectiveReadingModeOpen = isReadingModeProp !== undefined ? isReadingModeProp : localReadingModeOpen;

  const handleToggleReadingMode = () => {
    if (onToggleReadingModeProp) {
      onToggleReadingModeProp();
    } else {
      setLocalReadingModeOpen((prev) => !prev);
    }
  };

  const handleToggleBinder = () => {
    if (effectiveInspectorOpen && inspectorTab === 'ficheiro') {
      handleToggleInspector();
    } else {
      if (!effectiveInspectorOpen) handleToggleInspector();
      setInspectorTab('ficheiro');
    }
  };

  const handleToggleInspector = () => {
    if (onToggleInspectorProp) {
      onToggleInspectorProp();
    } else {
      setLocalInspectorOpen((prev) => !prev);
    }
  };

  const handleToggleStoryboard = () => {
    if (onNavigateStoryboard) {
      onNavigateStoryboard();
      return;
    }
    if (onToggleStoryboardProp) {
      onToggleStoryboardProp();
    } else {
      setLocalStoryboardOpen((prev) => !prev);
    }
  };

  // Inspector tab Pills: ficheiro, cena, estilo (ordem: ficheiro, cena, estilo)
  const [inspectorTab, setInspectorTab] = useState<'ficheiro' | 'scene' | 'style'>('ficheiro');

  // Expanded Chapter IDs in the binder accordion (default all expanded)
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(() => {
    return new Set(project.chapters.map((c) => c.id));
  });

  // Scene search query in the binder
  const [sceneFilterQuery, setSceneFilterQuery] = useState('');

  // Canvas Mode: Direct Editing, Visual Style Highlights, or Storyboard
  const [canvasViewMode, setCanvasViewMode] = useState<'edit' | 'checker' | 'board'>('edit');

  // Style Checker Settings
  const styleSettings: StyleCheckerSettings = useMemo(() => {
    return project.styleSettings || DEFAULT_STYLE_SETTINGS;
  }, [project.styleSettings]);

  // Studio Theme State (defaults to azul-meia-noite or branco-editorial)
  const [studioTheme, setStudioTheme] = useState<StudioTheme>(() => {
    return isDarkMode ? 'azul-meia-noite' : 'branco-editorial';
  });

  // Keep studio theme in sync with global dark mode toggle
  useEffect(() => {
    if (isDarkMode && (studioTheme === 'branco-editorial' || studioTheme === 'grafite-gelo' || studioTheme === 'paper-light')) {
      setStudioTheme('azul-meia-noite');
    } else if (!isDarkMode && (studioTheme === 'azul-meia-noite' || studioTheme === 'grafite-intenso' || studioTheme === 'night-slate' || studioTheme === 'oled' || studioTheme === 'sepia-dark')) {
      setStudioTheme('branco-editorial');
    }
  }, [isDarkMode]);

  // Keep expanded chapters synced when project changes
  useEffect(() => {
    setExpandedChapterIds((prev) => {
      const next = new Set(prev);
      project.chapters.forEach((c) => next.add(c.id));
      return next;
    });
  }, [project.chapters]);

  // Font Size and Line Height for comfortable nocturnal sessions
  const [fontSize, setFontSize] = useState<StudioFontSize>('base');
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'spacious'>('relaxed');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Sync with subTab changes
  useEffect(() => {
    if (subTab === 'inspector') {
      if (!effectiveInspectorOpen) handleToggleInspector();
      if (inspectorTab === 'ficheiro') setInspectorTab('scene');
    } else if (subTab === 'binder') {
      if (!effectiveInspectorOpen) handleToggleInspector();
      setInspectorTab('ficheiro');
    }
  }, [subTab]);

  // Dicionário de Sinônimos: estado do popover disparado por clique direito ou botão da barra
  const [synonymPopoverData, setSynonymPopoverData] = useState<{
    word: string;
    originalWord: string;
    startIndex: number;
    endIndex: number;
    position: { x: number; y: number };
    contextSentence?: string;
  } | null>(null);

  // Handler para clique com o botão direito no editor (Dicionário de Sinônimos)
  const handleEditorContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    // Se o usuário segurar Shift, permite o menu de contexto padrão do navegador
    if (e.shiftKey) return;

    const textarea = e.currentTarget;
    const text = textarea.value;
    const selStart = textarea.selectionStart;
    const selEnd = textarea.selectionEnd;

    let targetWord = '';
    let start = selStart;
    let end = selEnd;

    if (selEnd > selStart) {
      targetWord = text.slice(selStart, selEnd).trim();
    } else {
      // Localizar limites da palavra sob o cursor
      const isWordChar = (c: string) => /[\wÀ-ÿ]/i.test(c);

      let idx = selStart;
      if (idx > 0 && (!text[idx] || !isWordChar(text[idx])) && isWordChar(text[idx - 1])) {
        idx--;
      }

      if (idx >= 0 && idx < text.length && isWordChar(text[idx])) {
        start = idx;
        while (start > 0 && isWordChar(text[start - 1])) {
          start--;
        }
        end = idx;
        while (end < text.length && isWordChar(text[end])) {
          end++;
        }
        targetWord = text.slice(start, end);
      }
    }

    if (targetWord && targetWord.length >= 1) {
      e.preventDefault();

      // Extrair frase circundante para contextualização do modelo de linguagem
      const sentenceStart = Math.max(0, text.lastIndexOf('.', start) + 1);
      let sentenceEnd = text.indexOf('.', end);
      if (sentenceEnd === -1) sentenceEnd = text.length;
      const contextSentence = text.slice(sentenceStart, sentenceEnd).trim();

      setSynonymPopoverData({
        word: targetWord,
        originalWord: targetWord,
        startIndex: start,
        endIndex: end,
        position: { x: e.clientX, y: e.clientY },
        contextSentence,
      });
    }
  };

  // Substituição de termo pelo Dicionário de Sinônimos
  const handleSynonymReplace = (replacement: string, start: number, end: number) => {
    if (!activeScene) return;
    const currentContent = activeScene.content || '';
    const nextContent = currentContent.slice(0, start) + replacement + currentContent.slice(end);
    handleContentChange(nextContent);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = start + replacement.length;
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 50);
  };

  // Abrir o Dicionário de Sinônimos a partir da barra de ferramentas
  const handleOpenSynonymsFromToolbar = (e: React.MouseEvent) => {
    const textarea = textareaRef.current;
    let targetWord = 'olhar';
    let start = 0;
    let end = 0;

    if (textarea) {
      const text = textarea.value;
      const selStart = textarea.selectionStart;
      const selEnd = textarea.selectionEnd;

      if (selEnd > selStart) {
        targetWord = text.slice(selStart, selEnd).trim();
        start = selStart;
        end = selEnd;
      } else {
        const isWordChar = (c: string) => /[\wÀ-ÿ]/i.test(c);
        let idx = selStart;
        if (idx > 0 && (!text[idx] || !isWordChar(text[idx])) && isWordChar(text[idx - 1])) {
          idx--;
        }
        if (idx >= 0 && idx < text.length && isWordChar(text[idx])) {
          start = idx;
          while (start > 0 && isWordChar(text[start - 1])) start--;
          end = idx;
          while (end < text.length && isWordChar(text[end])) end++;
          targetWord = text.slice(start, end);
        }
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setSynonymPopoverData({
      word: targetWord || 'olhar',
      originalWord: targetWord || 'olhar',
      startIndex: start,
      endIndex: end,
      position: { x: Math.max(16, rect.left - 120), y: rect.bottom + 8 },
      contextSentence: '',
    });
  };

  // Global keyboard shortcuts for Writer workflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      // Ctrl+B / Cmd+B toggles Ficheiro in Inspector when not in textarea
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          handleToggleBinder();
        }
      }

      // Ctrl+I / Cmd+I toggles Inspector when not in textarea
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i' && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          if (effectiveInspectorOpen && inspectorTab !== 'ficheiro') {
            handleToggleInspector();
          } else {
            if (!effectiveInspectorOpen) handleToggleInspector();
            if (inspectorTab === 'ficheiro') setInspectorTab('scene');
          }
        }
      }

      // Alt+R toggles Reading Mode (Modo de Leitura)
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleToggleReadingMode();
      }

      // Escape closes reading mode if open
      if (e.key === 'Escape') {
        if (effectiveReadingModeOpen) {
          e.preventDefault();
          handleToggleReadingMode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [effectiveReadingModeOpen, handleToggleBinder, handleToggleInspector, handleToggleReadingMode]);

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

  // Add new scene to chapter
  const handleAddNewScene = (targetChapterId?: string) => {
    const targetChap = (targetChapterId && project.chapters.find((c) => c.id === targetChapterId)) || activeChapter;
    if (!targetChap) return;
    const newSceneNumber = targetChap.scenes.length + 1;
    const newSc: Scene = {
      id: `sc-${Date.now()}`,
      chapterId: targetChap.id,
      title: `Cena ${newSceneNumber}: Nova Cena`,
      content: '',
      synopsis: 'Breve descrição dos acontecimentos desta cena...',
      status: 'Rascunho',
      wordCount: 0,
      characterIds: [],
      notes: '',
    };

    const updatedChapters = project.chapters.map((chap) => {
      if (chap.id !== targetChap.id) return chap;
      return {
        ...chap,
        scenes: [...chap.scenes, newSc],
      };
    });

    onUpdateProject({
      ...project,
      chapters: updatedChapters,
    });

    setActiveChapterId(targetChap.id);
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

  // Theme styling definitions for high ergonomic contrast (Azul, Branco & Grafite)
  const canvasThemeStyles = {
    'azul-meia-noite': {
      bgOuter: 'bg-[#070c16]',
      cardBg: 'bg-[#0e1726]',
      cardBorder: 'border-[#1e2d44]',
      cardShadow: 'shadow-[0_6px_30px_rgba(3,11,26,0.6)]',
      textColor: 'text-[#ffffff]',
      headerBorder: 'border-[#1e2d44]',
      titleColor: 'text-[#ffffff]',
      subtitleColor: 'text-[#60a5fa]',
      metaColor: 'text-[#94a3b8]',
      selectBg: 'bg-[#142034] text-[#ffffff] border-[#223652]',
      selectionClass: 'selection:bg-[#2563eb]/50 selection:text-white',
      name: 'Azul Meia-Noite',
      icon: 'nights_stay',
    },
    'grafite-intenso': {
      bgOuter: 'bg-[#0b0f17]',
      cardBg: 'bg-[#131924]',
      cardBorder: 'border-[#232d3d]',
      cardShadow: 'shadow-[0_6px_30px_rgba(0,0,0,0.55)]',
      textColor: 'text-[#f8fafc]',
      headerBorder: 'border-[#232d3d]',
      titleColor: 'text-[#ffffff]',
      subtitleColor: 'text-[#38bdf8]',
      metaColor: 'text-[#cbd5e1]',
      selectBg: 'bg-[#1b2332] text-[#ffffff] border-[#2d394d]',
      selectionClass: 'selection:bg-[#3b82f6]/50 selection:text-white',
      name: 'Grafite Intenso',
      icon: 'dark_mode',
    },
    'branco-editorial': {
      bgOuter: 'bg-[#f0f4f9]',
      cardBg: 'bg-[#ffffff]',
      cardBorder: 'border-[#cbd5e1]',
      cardShadow: 'shadow-[0_2px_20px_rgba(15,23,42,0.06)]',
      textColor: 'text-[#0f172a]',
      headerBorder: 'border-[#e2e8f0]',
      titleColor: 'text-[#0a1c38]',
      subtitleColor: 'text-[#1d4ed8]',
      metaColor: 'text-[#475569]',
      selectBg: 'bg-[#eff6ff] text-[#0a1c38] border-[#bfdbfe]',
      selectionClass: 'selection:bg-[#dbeafe] selection:text-[#1e3a8a]',
      name: 'Branco Editorial',
      icon: 'light_mode',
    },
    'grafite-gelo': {
      bgOuter: 'bg-[#e2e8f0]',
      cardBg: 'bg-[#f8fafc]',
      cardBorder: 'border-[#94a3b8]',
      cardShadow: 'shadow-[0_2px_16px_rgba(30,41,59,0.08)]',
      textColor: 'text-[#1e293b]',
      headerBorder: 'border-[#cbd5e1]',
      titleColor: 'text-[#04162e]',
      subtitleColor: 'text-[#2563eb]',
      metaColor: 'text-[#334155]',
      selectBg: 'bg-[#ffffff] text-[#0f172a] border-[#94a3b8]',
      selectionClass: 'selection:bg-[#bfdbfe] selection:text-[#0a1c38]',
      name: 'Grafite Platina',
      icon: 'palette',
    },
    'night-slate': {
      bgOuter: 'bg-[#070c16]',
      cardBg: 'bg-[#0e1726]',
      cardBorder: 'border-[#1e2d44]',
      cardShadow: 'shadow-[0_6px_30px_rgba(3,11,26,0.6)]',
      textColor: 'text-[#ffffff]',
      headerBorder: 'border-[#1e2d44]',
      titleColor: 'text-[#ffffff]',
      subtitleColor: 'text-[#60a5fa]',
      metaColor: 'text-[#94a3b8]',
      selectBg: 'bg-[#142034] text-[#ffffff] border-[#223652]',
      selectionClass: 'selection:bg-[#2563eb]/50 selection:text-white',
      name: 'Azul Meia-Noite',
      icon: 'nights_stay',
    },
    'oled': {
      bgOuter: 'bg-[#000000]',
      cardBg: 'bg-[#080808]',
      cardBorder: 'border-[#1f293d]',
      cardShadow: 'shadow-[0_4px_30px_rgba(0,0,0,0.9)]',
      textColor: 'text-[#ffffff]',
      headerBorder: 'border-[#1f293d]',
      titleColor: 'text-[#ffffff]',
      subtitleColor: 'text-[#38bdf8]',
      metaColor: 'text-[#94a3b8]',
      selectBg: 'bg-[#101520] text-[#ffffff] border-[#202b3d]',
      selectionClass: 'selection:bg-blue-600 selection:text-white',
      name: 'OLED Safira',
      icon: 'contrast',
    },
    'sepia-dark': {
      bgOuter: 'bg-[#e2e8f0]',
      cardBg: 'bg-[#f8fafc]',
      cardBorder: 'border-[#94a3b8]',
      cardShadow: 'shadow-[0_2px_16px_rgba(30,41,59,0.08)]',
      textColor: 'text-[#1e293b]',
      headerBorder: 'border-[#cbd5e1]',
      titleColor: 'text-[#04162e]',
      subtitleColor: 'text-[#2563eb]',
      metaColor: 'text-[#334155]',
      selectBg: 'bg-[#ffffff] text-[#0f172a] border-[#94a3b8]',
      selectionClass: 'selection:bg-[#bfdbfe] selection:text-[#0a1c38]',
      name: 'Grafite Platina',
      icon: 'palette',
    },
    'paper-light': {
      bgOuter: 'bg-[#f0f4f9]',
      cardBg: 'bg-[#ffffff]',
      cardBorder: 'border-[#cbd5e1]',
      cardShadow: 'shadow-[0_2px_20px_rgba(15,23,42,0.06)]',
      textColor: 'text-[#0f172a]',
      headerBorder: 'border-[#e2e8f0]',
      titleColor: 'text-[#0a1c38]',
      subtitleColor: 'text-[#1d4ed8]',
      metaColor: 'text-[#475569]',
      selectBg: 'bg-[#eff6ff] text-[#0a1c38] border-[#bfdbfe]',
      selectionClass: 'selection:bg-[#dbeafe] selection:text-[#1e3a8a]',
      name: 'Branco Editorial',
      icon: 'light_mode',
    },
  }[studioTheme] || {
    bgOuter: 'bg-[#070c16]',
    cardBg: 'bg-[#0e1726]',
    cardBorder: 'border-[#1e2d44]',
    cardShadow: 'shadow-[0_6px_30px_rgba(3,11,26,0.6)]',
    textColor: 'text-[#ffffff]',
    headerBorder: 'border-[#1e2d44]',
    titleColor: 'text-[#ffffff]',
    subtitleColor: 'text-[#60a5fa]',
    metaColor: 'text-[#94a3b8]',
    selectBg: 'bg-[#142034] text-[#ffffff] border-[#223652]',
    selectionClass: 'selection:bg-[#2563eb]/50 selection:text-white',
    name: 'Azul Meia-Noite',
    icon: 'nights_stay',
  };

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

  const isDarkEffective =
    studioTheme === 'azul-meia-noite' ||
    studioTheme === 'grafite-intenso' ||
    studioTheme === 'night-slate' ||
    studioTheme === 'oled' ||
    (studioTheme !== 'branco-editorial' && studioTheme !== 'grafite-gelo' && studioTheme !== 'paper-light' && isDarkMode);

  // Toggle single chapter accordion
  const toggleChapterExpand = (chapId: string) => {
    setExpandedChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapId)) {
        next.delete(chapId);
      } else {
        next.add(chapId);
      }
      return next;
    });
  };

  // Expand all or collapse all chapters
  const toggleAllChapters = () => {
    if (expandedChapterIds.size === project.chapters.length) {
      setExpandedChapterIds(new Set());
    } else {
      setExpandedChapterIds(new Set(project.chapters.map((c) => c.id)));
    }
  };

  // Total scene count across all chapters
  const totalSceneCount = project.chapters.reduce((acc, c) => acc + (c.scenes?.length || 0), 0);

  // If Reading Mode (Modo de Leitura) is active, render distraction-free reading canvas
  if (effectiveReadingModeOpen) {
    return (
      <ReadingModeView
        project={project}
        activeChapterId={activeChapterId}
        activeSceneId={activeSceneId}
        onSelectScene={(chapId, scId) => {
          setActiveChapterId(chapId);
          setActiveSceneId(scId);
        }}
        onUpdateProject={onUpdateProject}
        onClose={handleToggleReadingMode}
        isDarkMode={isDarkEffective}
      />
    );
  }

  return (
    <div id="writing-studio-container" className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden relative">
      {/* Studio Responsive Workspace Bar (Computer, Tablet & Mobile): Ficheiro, Inspetor & Leitura */}
      <div
        id="studio-responsive-nav-bar"
        className={`flex flex-wrap items-center justify-between gap-2 border-b px-2 sm:px-4 py-1.5 shrink-0 z-20 transition-colors select-none ${
          isDarkEffective ? 'bg-[#0d1420] border-[#1e293b]' : 'bg-[#f0f4f8] border-[#c5c6ce]'
        }`}
      >
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* 1. Ficheiro */}
          <button
            id="studio-btn-chapters"
            onClick={() => {
              if (effectiveInspectorOpen && inspectorTab === 'ficheiro') {
                handleToggleInspector();
              } else {
                if (!effectiveInspectorOpen) handleToggleInspector();
                setInspectorTab('ficheiro');
              }
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              effectiveInspectorOpen && inspectorTab === 'ficheiro'
                ? isDarkEffective
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-[#04162e] text-white shadow-xs'
                : isDarkEffective
                ? 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#16202f]'
                : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
            }`}
            title="Ficheiro: Capítulos & Cenas no Inspetor (Ctrl+B)"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">folder_open</span>
            <span>Ficheiro</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                effectiveInspectorOpen && inspectorTab === 'ficheiro'
                  ? 'bg-white/20 text-white'
                  : isDarkEffective
                  ? 'bg-[#1e293b] text-[#93c5fd]'
                  : 'bg-[#c5c6ce] text-[#04162e]'
              }`}
            >
              {totalSceneCount}
            </span>
          </button>

          {/* 2. Inspetor */}
          <button
            id="studio-btn-inspector"
            onClick={handleToggleInspector}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              effectiveInspectorOpen
                ? isDarkEffective
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-[#04162e] text-white shadow-xs'
                : isDarkEffective
                ? 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#16202f]'
                : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
            }`}
            title={effectiveInspectorOpen ? 'Fechar painel do Inspetor lateral (Ctrl+I)' : 'Abrir painel do Inspetor lateral (Ctrl+I)'}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              {effectiveInspectorOpen ? 'view_sidebar' : 'vertical_split'}
            </span>
            <span>Inspetor</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                effectiveInspectorOpen
                  ? 'bg-white/20 text-white'
                  : isDarkEffective
                  ? 'bg-[#1e293b] text-[#93c5fd]'
                  : 'bg-[#c5c6ce] text-[#04162e]'
              }`}
            >
              {effectiveInspectorOpen ? 'Aberto' : 'Fechado'}
            </span>
            {totalStyleAlerts > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                {totalStyleAlerts}
              </span>
            )}
          </button>
        </div>

        {/* Right side utilities: Active Scene Info + Leitura */}
        <div className="flex items-center flex-wrap gap-2">
          {activeScene && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] opacity-80 px-2.5 py-1 rounded-lg border border-current/10">
              <span className="font-semibold truncate max-w-[130px] sm:max-w-[200px] lg:max-w-[280px]">{activeScene.title}</span>
              <span className="opacity-50">•</span>
              <span>{activeScene.wordCount.toLocaleString()} palavras</span>
            </div>
          )}

          {/* Reading Mode Button */}
          <button
            id="studio-btn-reading-mode"
            onClick={handleToggleReadingMode}
            className={`flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              effectiveReadingModeOpen
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDarkEffective
                ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 border border-emerald-600/30'
            }`}
            title="Modo de Leitura: Foco imersivo no texto para revisão (Alt+R)"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">auto_stories</span>
            <span className="hidden sm:inline">Leitura</span>
          </button>
        </div>
      </div>

      {/* Main Studio Work Area with Panes: Editor on Left, Inspector on Right */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
        {/* 1. The Writing Editor (Text editor is ALWAYS visible, occupying fluid space) */}
        <section
          id="studio-canvas-center"
          className={`flex flex-1 flex-col h-full min-w-0 ${canvasThemeStyles.bgOuter} overflow-hidden transition-colors duration-200`}
        >
        {/* Formatting & Studio Atmosphere Toolbar */}
        <div
          id="editor-toolbar"
          className={`min-h-[44px] py-1.5 px-2 sm:px-4 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 select-none text-xs ${
            isDarkEffective
              ? 'bg-[#0d1420] border-[#1e293b] text-[#f1f5f9]'
              : 'bg-[#ffffff] border-[#cbd5e1] text-[#0f172a]'
          }`}
        >
          {/* Left toolbar formatting buttons (responsive flex-wrap) */}
          <div className="flex items-center flex-wrap gap-1">
            {/* Quick Toggle Ficheiro in Inspector Button */}
            <button
              id="toolbar-btn-ficheiro"
              onClick={() => {
                if (effectiveInspectorOpen && inspectorTab === 'ficheiro') {
                  handleToggleInspector();
                } else {
                  if (!effectiveInspectorOpen) handleToggleInspector();
                  setInspectorTab('ficheiro');
                }
              }}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 mr-1 cursor-pointer ${
                effectiveInspectorOpen && inspectorTab === 'ficheiro'
                  ? isDarkEffective ? 'text-[#60a5fa] hover:bg-[#1a2536]' : 'text-[#04162e] hover:bg-[#eaeef2]'
                  : isDarkEffective ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1a2536]' : 'text-[#1e293b] hover:text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title={effectiveInspectorOpen && inspectorTab === 'ficheiro' ? 'Ocultar Ficheiro (Ctrl+B)' : 'Abrir Ficheiro no Inspetor (Ctrl+B)'}
            >
              <span className="material-symbols-outlined text-[18px]">
                folder_open
              </span>
              <span className="text-[11px] font-bold hidden sm:inline">Ficheiro</span>
            </button>
            <div className={`w-px h-5 mx-1 hidden sm:block ${isDarkEffective ? 'bg-[#1e293b]' : 'bg-[#cbd5e1]'}`}></div>

            <button
              onClick={() => insertFormatting('**', '**')}
              className={`p-1.5 rounded transition-colors ${
                isDarkEffective
                  ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1a2536]'
                  : 'text-[#1e293b] hover:text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Negrito (**texto**)"
            >
              <span className="material-symbols-outlined text-[18px]">format_bold</span>
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className={`p-1.5 rounded transition-colors ${
                isDarkEffective
                  ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1a2536]'
                  : 'text-[#1e293b] hover:text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Itálico (*texto*)"
            >
              <span className="material-symbols-outlined text-[18px]">format_italic</span>
            </button>
            <button
              onClick={() => insertFormatting('## ', '\n')}
              className={`p-1.5 rounded transition-colors ${
                isDarkEffective
                  ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1a2536]'
                  : 'text-[#1e293b] hover:text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Subtítulo de Cena"
            >
              <span className="material-symbols-outlined text-[18px]">title</span>
            </button>
            <button
              onClick={() => insertFormatting('> ', '\n')}
              className={`p-1.5 rounded transition-colors ${
                isDarkEffective
                  ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1a2536]'
                  : 'text-[#1e293b] hover:text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Citação / Pensamento"
            >
              <span className="material-symbols-outlined text-[18px]">format_quote</span>
            </button>
            <div className={`w-px h-5 mx-1 ${isDarkEffective ? 'bg-[#1e293b]' : 'bg-[#cbd5e1]'}`}></div>
            <button
              onClick={insertDialogueDash}
              className={`px-2 py-1 rounded font-bold flex items-center gap-1 text-[11px] transition-colors ${
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
              className={`px-2 py-1 rounded font-bold text-[11px] transition-colors ${
                isDarkEffective
                  ? 'text-[#93c5fd] hover:bg-[#1a2536]'
                  : 'text-[#04162e] hover:bg-[#eaeef2]'
              }`}
              title="Quebra de Cena (* * *)"
            >
              * * *
            </button>
            <div className={`w-px h-5 mx-1 ${isDarkEffective ? 'bg-[#1e293b]' : 'bg-[#cbd5e1]'}`}></div>

            {/* Quick Verificador de Estilo & Leitura Controls */}
            <div className="flex items-center flex-wrap gap-1">
              <button
                id="toolbar-btn-checker"
                onClick={() => {
                  if (canvasViewMode === 'checker') {
                    setCanvasViewMode('edit');
                  } else {
                    setCanvasViewMode('checker');
                    if (!effectiveInspectorOpen) handleToggleInspector();
                    setInspectorTab('style');
                  }
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all border cursor-pointer ${
                  canvasViewMode === 'checker'
                    ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                    : isDarkEffective
                    ? 'border-[#253347] bg-[#16202f] text-amber-400 hover:text-amber-300'
                    : 'border-[#c5c6ce] bg-[#eaeef2] text-amber-800 hover:bg-[#dfe3e7]'
                }`}
                title={canvasViewMode === 'checker' ? 'Voltar para Modo de Edição Normal' : 'Ativar Destaques do Verificador de Estilo'}
              >
                <span className="material-symbols-outlined text-[14px]">spellcheck</span>
                <span>Verificador</span>
                {totalStyleAlerts > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                    {totalStyleAlerts}
                  </span>
                )}
              </button>

              <button
                id="toolbar-btn-reading-mode"
                onClick={handleToggleReadingMode}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all border cursor-pointer ${
                  effectiveReadingModeOpen
                    ? isDarkEffective
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-700 border-emerald-700 text-white shadow-xs'
                    : isDarkEffective
                    ? 'border-[#253347] bg-[#16202f] text-emerald-400 hover:text-emerald-300'
                    : 'border-[#c5c6ce] bg-[#eaeef2] text-emerald-800 hover:bg-[#dfe3e7]'
                }`}
                title="Modo de Leitura: Oculta painéis e foca no texto para revisão (Alt+R)"
              >
                <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                <span>Leitura</span>
              </button>

              <button
                id="toolbar-btn-synonyms"
                onClick={handleOpenSynonymsFromToolbar}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all border cursor-pointer ${
                  synonymPopoverData
                    ? isDarkEffective
                      ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                      : 'bg-purple-700 border-purple-700 text-white shadow-xs'
                    : isDarkEffective
                    ? 'border-[#253347] bg-[#16202f] text-purple-300 hover:text-purple-200'
                    : 'border-[#c5c6ce] bg-[#eaeef2] text-purple-900 hover:bg-[#dfe3e7]'
                }`}
                title="Dicionário de Sinônimos: Clique com o botão direito em uma palavra no texto ou abra para pesquisar sugestões ricas"
              >
                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                <span>Sinônimos</span>
              </button>
            </div>
          </div>

          {/* Right toolbar controls: Dark Mode & Theme Picker & Font Scale */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 relative">
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
                if (!effectiveInspectorOpen) handleToggleInspector();
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
                  className={`absolute right-0 top-full mt-1.5 w-64 rounded-xl border shadow-2xl z-50 p-2.5 text-xs space-y-1.5 ${
                    isDarkEffective
                      ? 'bg-[#0e1726] border-[#1e2d44] text-[#f1f5f9]'
                      : 'bg-[#ffffff] border-[#cbd5e1] text-[#0f172a]'
                  }`}
                >
                  <div className="px-2 py-1 flex items-center justify-between border-b border-gray-700/40 pb-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Paletas: Azul, Branco & Grafite
                    </span>
                    <span className="material-symbols-outlined text-xs text-blue-400">palette</span>
                  </div>

                  {/* 1. Azul Meia-Noite */}
                  <button
                    onClick={() => {
                      setStudioTheme('azul-meia-noite');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                      studioTheme === 'azul-meia-noite' || studioTheme === 'night-slate'
                        ? 'bg-blue-600/30 text-blue-200 font-bold border border-blue-400/50 shadow-xs'
                        : 'hover:bg-blue-900/20 text-slate-300'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#0e1726] border-2 border-blue-400 shrink-0 shadow-xs ring-1 ring-white/20"></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs flex items-center gap-1.5">
                        <span>Azul Meia-Noite</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">Noturno</span>
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">Azul naval profundo, texto branco e grafite</p>
                    </div>
                  </button>

                  {/* 2. Grafite Intenso */}
                  <button
                    onClick={() => {
                      setStudioTheme('grafite-intenso');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                      studioTheme === 'grafite-intenso'
                        ? 'bg-blue-600/30 text-blue-200 font-bold border border-blue-400/50 shadow-xs'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#131924] border-2 border-cyan-400 shrink-0 shadow-xs ring-1 ring-white/20"></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs flex items-center gap-1.5">
                        <span>Grafite Intenso</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700/60 text-cyan-300">Carvão</span>
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">Grafite carbono com safira e branco níveo</p>
                    </div>
                  </button>

                  {/* 3. Branco Editorial */}
                  <button
                    onClick={() => {
                      setStudioTheme('branco-editorial');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                      studioTheme === 'branco-editorial' || studioTheme === 'paper-light'
                        ? 'bg-blue-50 text-blue-900 font-bold border border-blue-300 shadow-xs dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-700'
                        : isDarkEffective
                        ? 'hover:bg-slate-800/40 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white border-2 border-blue-600 shrink-0 shadow-xs ring-1 ring-slate-400/30"></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs flex items-center gap-1.5">
                        <span>Branco Editorial</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">Diurno</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Branco níveo com azul real e grafite nítido</p>
                    </div>
                  </button>

                  {/* 4. Grafite Platina */}
                  <button
                    onClick={() => {
                      setStudioTheme('grafite-gelo');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                      studioTheme === 'grafite-gelo' || studioTheme === 'sepia-dark'
                        ? 'bg-slate-200/80 text-slate-900 font-bold border border-slate-400 shadow-xs dark:bg-slate-800 dark:text-white dark:border-slate-600'
                        : isDarkEffective
                        ? 'hover:bg-slate-800/40 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#e2e8f0] border-2 border-slate-700 shrink-0 shadow-xs ring-1 ring-blue-500/40"></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs flex items-center gap-1.5">
                        <span>Grafite Platina</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">Equilibrado</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Grafite suave, branco e detalhes em azul naval</p>
                    </div>
                  </button>

                  {/* 5. OLED Safira */}
                  <button
                    onClick={() => {
                      setStudioTheme('oled');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                      studioTheme === 'oled'
                        ? 'bg-blue-600/30 text-blue-200 font-bold border border-blue-400/50 shadow-xs'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-black border-2 border-blue-500 shrink-0 shadow-xs ring-1 ring-white/20"></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs flex items-center gap-1.5">
                        <span>OLED Safira</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black text-blue-400 border border-blue-900">Preto Puro</span>
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">Preto absoluto sem reflexos com azul e branco</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Word count live pill */}
            <span
              className={`text-[11px] font-mono px-2.5 py-1 rounded border font-medium ${
                isDarkEffective
                  ? 'bg-[#15202f] border-[#253347] text-[#93c5fd]'
                  : 'bg-[#eaeef2] border-[#cbd5e1] text-[#0f172a]'
              }`}
            >
              <strong>{activeScene?.wordCount || 0}</strong> pal.
            </span>

            {/* Focus Mode button */}
            <button
              onClick={() => onOpenFocusMode(activeScene?.id)}
              className={`px-2.5 py-1 font-bold rounded text-xs flex items-center gap-1 transition-all border ${
                isDarkEffective
                  ? 'bg-[#15202f] hover:bg-[#1f2e42] border-[#28384f] text-[#cbd5e1]'
                  : 'bg-[#eaeef2] hover:bg-[#dfe3e7] border-[#cbd5e1] text-[#04162e]'
              }`}
              title="Tela Cheia Sem Distrações"
            >
              <span className="material-symbols-outlined text-[16px]">fullscreen</span>
              <span className="hidden sm:inline">Foco</span>
            </button>

            {/* Toggle Inspector Button in Toolbar */}
            <button
              id="toolbar-btn-toggle-inspector"
              onClick={handleToggleInspector}
              className={`px-2.5 py-1 rounded font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                effectiveInspectorOpen
                  ? isDarkEffective
                    ? 'bg-[#1b2637] border-[#2e405b] text-[#93c5fd] hover:bg-[#243348]'
                    : 'bg-[#eaeef2] border-[#cbd5e1] text-[#04162e] hover:bg-[#dfe3e7]'
                  : isDarkEffective
                  ? 'bg-[#2563eb] border-[#3b82f6] text-white hover:bg-[#1d4ed8]'
                  : 'bg-[#04162e] border-[#04162e] text-white hover:bg-[#0a2750]'
              }`}
              title={effectiveInspectorOpen ? 'Fechar painel do Inspetor lateral (Ctrl+I)' : 'Abrir painel do Inspetor lateral (Ctrl+I)'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {effectiveInspectorOpen ? 'view_sidebar' : 'vertical_split'}
              </span>
              <span className="hidden sm:inline">
                {effectiveInspectorOpen ? 'Fechar Inspetor' : 'Abrir Inspetor'}
              </span>
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
                onContextMenu={handleEditorContextMenu}
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

      {/* 2. The Inspector (Right Pane: beside editor on desktop/tablet, drawer/pane on mobile) */}
      {effectiveInspectorOpen && (
        <aside
          id="studio-inspector-pane"
          className={`w-full md:w-80 lg:w-96 shrink-0 border-t md:border-t-0 md:border-l flex flex-col h-72 sm:h-80 md:h-full overflow-hidden transition-colors duration-200 ${
            isDarkEffective
              ? 'bg-[#0d1420] border-[#1e293b] text-[#f1f5f9]'
              : 'bg-[#ffffff] border-[#cbd5e1] text-[#0f172a]'
          }`}
        >
          {/* Inspector Header with Tab Pills: ficheiro, cena, estilo */}
          <div
            className={`p-2.5 border-b flex items-center justify-between gap-2 shrink-0 ${
              isDarkEffective ? 'bg-[#111a28] border-[#1e293b]' : 'bg-[#eaeef2] border-[#cbd5e1]'
            }`}
          >
            <div className="flex items-center flex-wrap gap-1 bg-black/10 p-0.5 rounded border border-current/10 flex-1 min-w-0">
              {/* Tab 1: Ficheiro */}
              <button
                id="inspector-tab-btn-ficheiro"
                onClick={() => setInspectorTab('ficheiro')}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  inspectorTab === 'ficheiro'
                    ? isDarkEffective
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'bg-[#04162e] text-white shadow-xs'
                    : isDarkEffective
                    ? 'text-[#cbd5e1] hover:text-white'
                    : 'text-[#1e293b] hover:text-[#04162e]'
                }`}
                title="Ficheiro: Capítulos e Cenas"
              >
                <span className="material-symbols-outlined text-[14px]">folder_open</span>
                <span className="truncate">Ficheiro</span>
              </button>

              {/* Tab 2: Cena */}
              <button
                id="inspector-tab-btn-scene"
                onClick={() => setInspectorTab('scene')}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  inspectorTab === 'scene'
                    ? isDarkEffective
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'bg-[#04162e] text-white shadow-xs'
                    : isDarkEffective
                    ? 'text-[#cbd5e1] hover:text-white'
                    : 'text-[#1e293b] hover:text-[#04162e]'
                }`}
                title="Cena: Metadados, POV e Sinopse"
              >
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span className="truncate">Cena</span>
              </button>

              {/* Tab 3: Estilo */}
              <button
                id="inspector-tab-btn-style"
                onClick={() => setInspectorTab('style')}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  inspectorTab === 'style'
                    ? isDarkEffective
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'bg-[#04162e] text-white shadow-xs'
                    : isDarkEffective
                    ? 'text-[#cbd5e1] hover:text-white'
                    : 'text-[#1e293b] hover:text-[#04162e]'
                }`}
                title="Estilo: Diagnóstico estilístico"
              >
                <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                <span className="truncate">Estilo</span>
                {totalStyleAlerts > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                    {totalStyleAlerts}
                  </span>
                )}
              </button>
            </div>

            <button
              id="inspector-btn-close-header"
              onClick={handleToggleInspector}
              className={`p-1.5 rounded-md transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
                isDarkEffective ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]' : 'text-[#334155] hover:text-[#04162e] hover:bg-[#dfe3e7]'
              }`}
              title="Fechar painel do Inspetor (Ctrl+I)"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1 text-xs">
            {inspectorTab === 'ficheiro' ? (
              <div id="inspector-ficheiro-content" className="flex flex-col h-full -m-4">
                {/* Header with Stats & Actions */}
                <div
                  className={`p-3 border-b flex items-center justify-between gap-2 ${
                    isDarkEffective ? 'bg-[#111a28] border-[#1e293b]' : 'bg-[#eaeef2] border-[#c5c6ce]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-blue-500">folder_open</span>
                    <div>
                      <span className="font-label-caps text-xs font-bold uppercase tracking-wider block">
                        FICHEIRO
                      </span>
                      <span className={`text-[10px] font-medium ${isDarkEffective ? 'text-[#cbd5e1]' : 'text-[#334155]'}`}>
                        {project.chapters.length} cap. • {totalSceneCount} cenas
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      id="ficheiro-btn-toggle-expand"
                      onClick={toggleAllChapters}
                      title={expandedChapterIds.size === project.chapters.length ? 'Recolher todos' : 'Expandir todos'}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        isDarkEffective ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]' : 'text-[#1e293b] hover:bg-[#dfe3e7]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {expandedChapterIds.size === project.chapters.length ? 'unfold_less' : 'unfold_more'}
                      </span>
                    </button>

                    <button
                      id="ficheiro-btn-new-chapter"
                      onClick={onOpenNewChapter}
                      title="Criar novo capítulo"
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        isDarkEffective
                          ? 'text-[#60a5fa] hover:text-white hover:bg-[#1e293b]'
                          : 'text-[#04162e] hover:bg-[#dfe3e7]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
                    </button>
                  </div>
                </div>

                {/* Quick Scene Search Bar */}
                <div className={`p-2.5 border-b ${isDarkEffective ? 'border-[#1e293b]' : 'border-[#cbd5e1]'}`}>
                  <div className="relative">
                    <span className={`material-symbols-outlined absolute left-2.5 top-2 text-[14px] ${isDarkEffective ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                      search
                    </span>
                    <input
                      id="ficheiro-search-input"
                      type="text"
                      value={sceneFilterQuery}
                      onChange={(e) => setSceneFilterQuery(e.target.value)}
                      placeholder="Filtrar capítulos e cenas..."
                      className={`w-full pl-8 pr-7 py-1 text-xs rounded border transition-colors ${
                        isDarkEffective
                          ? 'bg-[#15202f] border-[#223147] text-white placeholder-slate-400 focus:border-blue-400'
                          : 'bg-white border-[#cbd5e1] text-[#04162e] placeholder-slate-500 focus:border-[#04162e]'
                      }`}
                    />
                    {sceneFilterQuery && (
                      <button
                        onClick={() => setSceneFilterQuery('')}
                        className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-200 text-xs p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Chapters & Scenes Accordion List */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                  {project.chapters.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className={`text-xs ${isDarkEffective ? 'text-[#cbd5e1]' : 'text-[#334155]'} mb-2`}>
                        Nenhum capítulo cadastrado.
                      </p>
                      <button
                        onClick={onOpenNewChapter}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Novo Capítulo
                      </button>
                    </div>
                  ) : (
                    project.chapters.map((chap) => {
                      const isChapActive = chap.id === activeChapter?.id;
                      const isExpanded = expandedChapterIds.has(chap.id);
                      
                      // Filter scenes if query exists
                      const filteredScenes = sceneFilterQuery
                        ? chap.scenes.filter(
                            (s) =>
                              s.title.toLowerCase().includes(sceneFilterQuery.toLowerCase()) ||
                              (s.synopsis || '').toLowerCase().includes(sceneFilterQuery.toLowerCase())
                          )
                        : chap.scenes;

                      if (sceneFilterQuery && filteredScenes.length === 0 && !chap.title.toLowerCase().includes(sceneFilterQuery.toLowerCase())) {
                        return null;
                      }

                      return (
                        <div
                          key={chap.id}
                          className={`rounded border transition-colors ${
                            isChapActive
                              ? isDarkEffective
                                ? 'border-[#24334a] bg-[#121c2b]'
                                : 'border-[#cbd5e1] bg-white shadow-xs'
                              : isDarkEffective
                              ? 'border-[#1e293b]/50 bg-[#0d1420]'
                              : 'border-transparent bg-transparent'
                          }`}
                        >
                          {/* Chapter Header */}
                          <div
                            className={`flex items-center justify-between px-2.5 py-2 rounded-t text-xs font-bold cursor-pointer transition-colors ${
                              isChapActive
                                ? isDarkEffective
                                  ? 'text-[#60a5fa]'
                                  : 'text-[#04162e]'
                                : isDarkEffective
                                ? 'text-[#cbd5e1] hover:bg-[#131d2b] hover:text-[#f8fafc]'
                                : 'text-[#1e293b] hover:bg-[#eaeef2] hover:text-[#04162e]'
                            }`}
                            onClick={() => {
                              setActiveChapterId(chap.id);
                              toggleChapterExpand(chap.id);
                            }}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="material-symbols-outlined text-[16px] shrink-0 text-blue-400">
                                {isExpanded ? 'expand_more' : 'chevron_right'}
                              </span>
                              <span className="truncate">{chap.title}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${isDarkEffective ? 'bg-[#1e293b] text-[#cbd5e1]' : 'bg-[#eaeef2] text-[#334155]'}`}>
                                {chap.scenes.length}
                              </span>
                            </div>
                          </div>

                          {/* Scenes List */}
                          {isExpanded && (
                            <div className={`p-1 space-y-0.5 border-t ${isDarkEffective ? 'border-[#1e293b]' : 'border-[#eaeef2]'}`}>
                              {filteredScenes.map((sc) => {
                                const isScActive = sc.id === activeScene?.id;
                                return (
                                  <button
                                    key={sc.id}
                                    onClick={() => {
                                      setActiveChapterId(chap.id);
                                      setActiveSceneId(sc.id);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between gap-1 cursor-pointer ${
                                      isScActive
                                        ? isDarkEffective
                                          ? 'bg-[#2563eb] text-white font-semibold shadow-xs'
                                          : 'bg-[#04162e] text-white font-semibold shadow-xs'
                                        : isDarkEffective
                                        ? 'text-[#cbd5e1] hover:bg-[#182335] hover:text-[#f8fafc]'
                                        : 'text-[#1e293b] hover:bg-[#eaeef2] hover:text-[#04162e]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        sc.status === 'final'
                                          ? 'bg-emerald-400'
                                          : sc.status === 'revised'
                                          ? 'bg-blue-400'
                                          : 'bg-amber-400'
                                      }`} />
                                      <span className="truncate">{sc.title}</span>
                                    </div>
                                    <span
                                      className={`text-[10px] font-mono shrink-0 ${
                                        isScActive
                                          ? 'text-blue-100 font-bold'
                                          : isDarkEffective
                                          ? 'text-[#94a3b8]'
                                          : 'text-[#64748b]'
                                      }`}
                                    >
                                      {sc.wordCount || 0}
                                    </span>
                                  </button>
                                );
                              })}

                              <button
                                onClick={() => {
                                  handleAddNewScene(chap.id);
                                }}
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
                    })
                  )}
                </div>
              </div>
            ) : inspectorTab === 'style' ? (
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
                  <label className={`font-label-caps block mb-1.5 font-bold ${isDarkEffective ? 'text-[#cbd5e1]' : 'text-[#1e293b]'}`}>
                    Sinopse / Objetivos da Cena
                  </label>
                  <textarea
                    rows={3}
                    value={activeScene?.synopsis || ''}
                    onChange={(e) => handleSceneMetaUpdate({ synopsis: e.target.value })}
                    placeholder="Qual o objetivo e ponto de virada dramático desta cena?"
                    className={`w-full p-2.5 rounded font-writing-canvas text-xs leading-relaxed border transition-colors ${
                      isDarkEffective
                        ? 'bg-[#141e2c] border-[#24334a] text-[#f1f5f9] placeholder-gray-400 focus:border-blue-400'
                        : 'bg-[#f6fafe] border-[#cbd5e1] text-[#0f172a] placeholder-slate-400 focus:border-[#04162e]'
                    }`}
                  />
                </div>

                {/* POV Character */}
                <div>
                  <label className={`font-label-caps block mb-1.5 font-bold ${isDarkEffective ? 'text-[#cbd5e1]' : 'text-[#1e293b]'}`}>
                    Ponto de Vista (POV)
                  </label>
                  <select
                    value={activeScene?.povCharacterId || ''}
                    onChange={(e) => handleSceneMetaUpdate({ povCharacterId: e.target.value })}
                    className={`w-full p-2 rounded text-xs mb-2 border transition-colors ${
                      isDarkEffective
                        ? 'bg-[#141e2c] border-[#24334a] text-[#f1f5f9] focus:border-blue-400'
                        : 'bg-[#f6fafe] border-[#cbd5e1] text-[#0f172a] focus:border-[#04162e]'
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
                          : 'bg-[#eaeef2] border-[#cbd5e1]'
                      }`}
                    >
                      <img
                        src={povChar.avatarUrl}
                        alt={povChar.name}
                        className={`w-8 h-8 rounded-full object-cover border ${
                          isDarkEffective ? 'border-[#334155]' : 'border-[#cbd5e1]'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className={`font-bold truncate ${isDarkEffective ? 'text-[#f8fafc]' : 'text-[#04162e]'}`}>
                          {povChar.name}
                        </p>
                        <p className={`text-[10px] truncate font-medium ${isDarkEffective ? 'text-[#cbd5e1]' : 'text-[#334155]'}`}>
                          {povChar.tagline}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className={`font-label-caps block mb-1.5 font-bold ${isDarkEffective ? 'text-[#cbd5e1]' : 'text-[#1e293b]'}`}>
                    Cenário / Localização
                  </label>
                  <select
                    value={activeScene?.locationId || ''}
                    onChange={(e) => handleSceneMetaUpdate({ locationId: e.target.value })}
                    className={`w-full p-2 rounded text-xs mb-2 border transition-colors ${
                      isDarkEffective
                        ? 'bg-[#141e2c] border-[#24334a] text-[#f1f5f9] focus:border-blue-400'
                        : 'bg-[#f6fafe] border-[#cbd5e1] text-[#0f172a] focus:border-[#04162e]'
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
                    <div className={`relative rounded overflow-hidden h-20 border mb-1 ${isDarkEffective ? 'border-[#24334a]' : 'border-[#cbd5e1]'}`}>
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
                  <label className={`font-label-caps block mb-1.5 font-bold ${isDarkEffective ? 'text-[#cbd5e1]' : 'text-[#1e293b]'}`}>
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
                              ? 'bg-[#141e2c] text-[#cbd5e1] hover:bg-[#1e2a3c] border border-[#24334a]'
                              : 'bg-[#eaeef2] text-[#1e293b] hover:bg-[#dfe3e7] border border-[#cbd5e1]'
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
                  <label className={`font-label-caps block mb-1.5 font-bold ${isDarkEffective ? 'text-[#cbd5e1]' : 'text-[#1e293b]'}`}>
                    Notas & Ideias de Pesquisa
                  </label>
                  <textarea
                    rows={3}
                    value={activeScene?.notes || ''}
                    onChange={(e) => handleSceneMetaUpdate({ notes: e.target.value })}
                    placeholder="Rascunhos de diálogos, detalhes sensoriais a incluir..."
                    className={`w-full p-2.5 rounded font-mono text-xs border transition-colors ${
                      isDarkEffective
                        ? 'bg-[#141e2c] border-[#24334a] text-[#f1f5f9] placeholder-gray-400 focus:border-blue-400'
                        : 'bg-[#f6fafe] border-[#cbd5e1] text-[#0f172a] placeholder-slate-400 focus:border-[#04162e]'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
      </div>

      {/* Floating dock to reopen Inspector when closed */}
      {!effectiveInspectorOpen && (
        <button
          id="dock-btn-reopen-inspector"
          onClick={handleToggleInspector}
          title="Abrir painel do Inspetor lateral (Ctrl+I)"
          className={`hidden md:flex items-center gap-1.5 px-2 py-3.5 ${
            isDarkEffective
              ? 'bg-[#111a28] hover:bg-[#1d2b40] text-[#60a5fa] border-[#223147]'
              : 'bg-[#ffffff] hover:bg-[#f0f4f8] text-[#04162e] border-[#c5c6ce]'
          } text-xs font-semibold rounded-l-xl shadow-lg fixed right-0 top-1/2 -translate-y-1/2 z-30 cursor-pointer border border-r-0 transition-all hover:-translate-x-1 group active:scale-95`}
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
            chevron_left
          </span>
          <span className="[writing-mode:vertical-lr] rotate-180 text-[11px] tracking-wider uppercase font-bold py-1">
            Abrir Inspetor
          </span>
        </button>
      )}

      {/* Popover flutuante do Dicionário de Sinônimos ativado por clique direito no editor */}
      {synonymPopoverData && (
        <SynonymPopover
          word={synonymPopoverData.word}
          originalWord={synonymPopoverData.originalWord}
          startIndex={synonymPopoverData.startIndex}
          endIndex={synonymPopoverData.endIndex}
          position={synonymPopoverData.position}
          contextSentence={synonymPopoverData.contextSentence}
          onReplace={handleSynonymReplace}
          onClose={() => setSynonymPopoverData(null)}
          isDarkEffective={isDarkEffective}
        />
      )}
    </div>
  );
};

