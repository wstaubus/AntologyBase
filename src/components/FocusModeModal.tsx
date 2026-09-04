import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NovelProject, Scene, StyleCheckerSettings, AutoSaveStatus } from '../types';
import { analyzeProseStyle, DEFAULT_STYLE_SETTINGS } from '../utils/styleChecker';
import { StyleCheckerPanel } from './StyleCheckerPanel';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { SynonymPopover } from './SynonymPopover';

interface FocusModeModalProps {
  project: NovelProject;
  initialSceneId?: string;
  onClose: () => void;
  onUpdateProject: (updated: NovelProject) => void;
  autoSaveStatus?: AutoSaveStatus;
  lastSavedAt?: Date | null;
  onForceSave?: () => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  project,
  initialSceneId,
  onClose,
  onUpdateProject,
  autoSaveStatus = 'saved',
  lastSavedAt = null,
  onForceSave = () => {},
}) => {
  // Find current scene or first scene
  const allScenes = project.chapters.flatMap((c) => c.scenes);
  const initial =
    allScenes.find((s) => s.id === initialSceneId) || allScenes[0];

  const [currentSceneId, setCurrentSceneId] = useState<string>(initial?.id || '');
  const [theme, setTheme] = useState<'white' | 'dark' | 'graphite' | 'platinum'>('dark');
  const [wordsWrittenInSession, setWordsWrittenInSession] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [typewriterAudio, setTypewriterAudio] = useState<boolean>(false);
  const [showStyleDrawer, setShowStyleDrawer] = useState<boolean>(false);

  const activeScene = allScenes.find((s) => s.id === currentSceneId) || initial;
  const initialWordCount = useRef<number>(activeScene?.wordCount || 0);

  const styleSettings: StyleCheckerSettings = useMemo(() => {
    return project.styleSettings || DEFAULT_STYLE_SETTINGS;
  }, [project.styleSettings]);

  const styleAnalysis = useMemo(() => {
    return analyzeProseStyle(activeScene?.content || '', styleSettings);
  }, [activeScene?.content, styleSettings]);

  const totalAlerts = styleAnalysis.avoidedTermsCount + styleAnalysis.echoCount;

  // Replace term handler
  const handleReplaceTerm = (
    oldTerm: string,
    replacement: string,
    startIndex?: number,
    endIndex?: number
  ) => {
    if (!activeScene) return;
    let nextContent = activeScene.content;
    if (typeof startIndex === 'number' && typeof endIndex === 'number') {
      nextContent = nextContent.slice(0, startIndex) + replacement + nextContent.slice(endIndex);
    } else {
      nextContent = nextContent.replace(new RegExp(oldTerm, 'i'), replacement);
    }
    handleTextChange(nextContent);
  };

  // Dicionário de Sinônimos em Modo Foco
  const [synonymPopoverData, setSynonymPopoverData] = useState<{
    word: string;
    originalWord: string;
    startIndex: number;
    endIndex: number;
    position: { x: number; y: number };
    contextSentence?: string;
  } | null>(null);

  const handleEditorContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
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

    if (targetWord && targetWord.length >= 1) {
      e.preventDefault();
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

  const handleSynonymReplace = (replacement: string, start: number, end: number) => {
    if (!activeScene) return;
    const currentContent = activeScene.content || '';
    const nextContent = currentContent.slice(0, start) + replacement + currentContent.slice(end);
    handleTextChange(nextContent);
  };

  const handleUpdateSettings = (newSettings: StyleCheckerSettings) => {
    onUpdateProject({
      ...project,
      styleSettings: newSettings,
    });
  };

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Escape key listener to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showStyleDrawer) {
          setShowStyleDrawer(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showStyleDrawer]);

  // Subtle typewriter click using Web Audio API
  const playTypewriterClick = () => {
    if (!typewriterAudio) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
      // AudioContext might be restricted
    }
  };

  const handleTextChange = (text: string) => {
    playTypewriterClick();
    if (!activeScene) return;

    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const diff = Math.max(0, words - initialWordCount.current);
    setWordsWrittenInSession(diff);

    const updatedChapters = project.chapters.map((chap) => {
      if (chap.id !== activeScene.chapterId) return chap;
      return {
        ...chap,
        scenes: chap.scenes.map((sc) =>
          sc.id === activeScene.id
            ? { ...sc, content: text, wordCount: words, updatedAt: new Date().toISOString() }
            : sc
        ),
      };
    });

    onUpdateProject({
      ...project,
      chapters: updatedChapters,
    });
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Theme styling classes (Paletas Azul, Branco & Grafite)
  const themeClasses = {
    dark: 'bg-[#080e18] text-[#ffffff] selection:bg-blue-600/50 selection:text-white',
    graphite: 'bg-[#111827] text-[#f8fafc] selection:bg-cyan-600/40 selection:text-white',
    white: 'bg-[#ffffff] text-[#0f172a] selection:bg-blue-100 selection:text-blue-900',
    platinum: 'bg-[#e2e8f0] text-[#1e293b] selection:bg-blue-200 selection:text-blue-950',
  };

  return (
    <div
      id="modal-focus-mode"
      className={`fixed inset-0 z-50 flex flex-col justify-between transition-colors duration-300 ${themeClasses[theme]}`}
    >
      {/* Top Floating Zen Bar */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 opacity-80 hover:opacity-100 focus-within:opacity-100 transition-opacity select-none border-b border-current/10">
        <div className="flex items-center gap-3 text-xs font-sans">
          {/* Botão Voltar Principal */}
          <button
            id="btn-focus-back"
            onClick={onClose}
            title="Voltar ao Estúdio de Escrita (ESC)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer bg-current/10 hover:bg-current/20 active:scale-95 border border-current/15 text-current shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Voltar</span>
          </button>

          <div className="h-4 w-px bg-current/20 hidden sm:block" />

          <span className="font-bold tracking-wider uppercase text-[11px] hidden md:inline opacity-80">
            Modo Foco
          </span>

          <select
            value={currentSceneId}
            onChange={(e) => setCurrentSceneId(e.target.value)}
            className="bg-transparent border border-current/20 rounded-md px-2 py-1 text-xs font-semibold cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
          >
            {project.chapters.map((chap) => (
              <optgroup key={chap.id} label={chap.title}>
                {chap.scenes.map((sc) => (
                  <option key={sc.id} value={sc.id} className="text-black bg-white">
                    {sc.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Theme toggles (Azul, Branco e Grafite) */}
          <div className="flex items-center bg-current/5 rounded-lg p-0.5 border border-current/10 gap-0.5">
            <button
              onClick={() => setTheme('dark')}
              title="Tema Azul Meia-Noite Noturno"
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                theme === 'dark' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-current/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-300"></span>
              <span>Azul</span>
            </button>
            <button
              onClick={() => setTheme('graphite')}
              title="Tema Grafite Carvão"
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                theme === 'graphite' ? 'bg-slate-700 text-cyan-300 shadow-xs' : 'hover:bg-current/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Grafite</span>
            </button>
            <button
              onClick={() => setTheme('white')}
              title="Tema Branco Puro Editorial"
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                theme === 'white' ? 'bg-white text-slate-900 border border-slate-300 shadow-xs' : 'hover:bg-current/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-200 border border-slate-400"></span>
              <span>Branco</span>
            </button>
            <button
              onClick={() => setTheme('platinum')}
              title="Tema Grafite Platina Suave"
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                theme === 'platinum' ? 'bg-slate-300 text-slate-900 font-bold shadow-xs' : 'hover:bg-current/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span>Platina</span>
            </button>
          </div>

          {/* Auto Save Status Indicator */}
          <AutoSaveIndicator
            status={autoSaveStatus}
            lastSavedAt={lastSavedAt}
            onForceSave={onForceSave}
            isDarkEffective={theme === 'dark' || theme === 'graphite'}
            compact={true}
          />

          {/* Style Checker Quick Alert Button */}
          <button
            onClick={() => setShowStyleDrawer(!showStyleDrawer)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              totalAlerts > 0
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 font-semibold'
                : 'border-current/20 hover:bg-current/10'
            }`}
            title="Verificador de Estilo & Repetições"
          >
            <span className="material-symbols-outlined text-[16px]">spellcheck</span>
            <span className="hidden sm:inline">Estilo</span>
            {totalAlerts > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Typewriter sound */}
          <button
            onClick={() => setTypewriterAudio(!typewriterAudio)}
            className={`p-1.5 rounded border border-current/20 flex items-center gap-1 ${
              typewriterAudio ? 'bg-current/10' : ''
            }`}
            title="Som mecânico suave ao digitar"
          >
            <span className="material-symbols-outlined text-[16px]">
              {typewriterAudio ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Timer button */}
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-current/20"
            title="Cronômetro de Sessão"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isTimerRunning ? 'pause' : 'timer'}
            </span>
            <span className="font-mono">{formatTimer(timerSeconds)}</span>
          </button>

          {/* Exit / Fechar Button */}
          <button
            id="btn-focus-exit-top"
            onClick={onClose}
            title="Sair do Modo Foco (ESC)"
            className="flex items-center gap-1 bg-current/10 hover:bg-current/20 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer border border-current/15"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            <span className="hidden md:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Large Writing Paper */}
      <div className="flex-1 flex justify-center overflow-y-auto px-6 py-12">
        <div className="w-full max-w-[780px] flex flex-col">
          <input
            type="text"
            value={activeScene?.title || ''}
            onChange={(e) => {
              const val = e.target.value;
              const updatedChapters = project.chapters.map((chap) => {
                if (chap.id !== activeScene?.chapterId) return chap;
                return {
                  ...chap,
                  scenes: chap.scenes.map((sc) =>
                    sc.id === activeScene?.id ? { ...sc, title: val } : sc
                  ),
                };
              });
              onUpdateProject({ ...project, chapters: updatedChapters });
            }}
            className="font-display-lg text-3xl sm:text-4xl font-bold mb-8 bg-transparent focus:outline-none border-b border-transparent focus:border-current/20 pb-2"
          />

          <textarea
            autoFocus
            value={activeScene?.content || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            onContextMenu={handleEditorContextMenu}
            placeholder="Apenas as palavras importam agora..."
            className="w-full flex-1 min-h-[500px] font-writing-canvas text-writing-canvas text-lg sm:text-xl leading-[2.1] bg-transparent focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Bottom Floating Stats */}
      <div className="flex flex-wrap justify-between items-center gap-3 px-6 sm:px-8 py-2.5 sm:py-3 text-xs opacity-75 hover:opacity-100 focus-within:opacity-100 transition-opacity border-t border-current/10 select-none">
        <div className="flex items-center gap-4">
          <span>
            Nesta sessão: <strong>+{wordsWrittenInSession}</strong> palavras
          </span>
          <span className="hidden sm:inline">
            Total na cena: <strong>{activeScene?.wordCount || 0}</strong> palavras
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-focus-back-bottom"
            onClick={onClose}
            className="flex items-center gap-1 font-semibold px-2.5 py-1 rounded bg-current/10 hover:bg-current/20 active:scale-95 transition-all cursor-pointer border border-current/15"
            title="Voltar ao Estúdio de Escrita (ESC)"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Voltar ao Estúdio</span>
          </button>
          <span className="hidden md:inline opacity-70">
            (ou <strong>ESC</strong>)
          </span>
        </div>
      </div>

      {/* Style Checker Slide-out Drawer */}
      {showStyleDrawer && (
        <div className="fixed inset-y-0 right-0 w-84 bg-slate-900 text-slate-100 shadow-2xl border-l border-slate-700 z-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-3 border-b border-slate-700 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-400">spellcheck</span>
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Verificador de Estilo
              </span>
            </div>
            <button
              onClick={() => setShowStyleDrawer(false)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 text-xs">
            <StyleCheckerPanel
              styleAnalysis={styleAnalysis}
              styleSettings={styleSettings}
              onUpdateSettings={handleUpdateSettings}
              onReplaceTerm={handleReplaceTerm}
              isDarkEffective={true}
            />
          </div>
        </div>
      )}

      {/* Popover flutuante do Dicionário de Sinônimos em Modo Foco */}
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
          isDarkEffective={theme === 'dark'}
        />
      )}
    </div>
  );
};
