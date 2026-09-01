import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NovelProject, Scene, StyleCheckerSettings, AutoSaveStatus } from '../types';
import { analyzeProseStyle, DEFAULT_STYLE_SETTINGS } from '../utils/styleChecker';
import { StyleCheckerPanel } from './StyleCheckerPanel';
import { AutoSaveIndicator } from './AutoSaveIndicator';

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
  const [theme, setTheme] = useState<'cream' | 'dark' | 'sepia'>('cream');
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

  // Theme styling classes
  const themeClasses = {
    cream: 'bg-[#faf8f5] text-[#1f2421]',
    dark: 'bg-[#0b1016] text-[#e0e4eb]',
    sepia: 'bg-[#f4ebd9] text-[#2b241c]',
  };

  return (
    <div
      id="modal-focus-mode"
      className={`fixed inset-0 z-50 flex flex-col justify-between transition-colors duration-300 ${themeClasses[theme]}`}
    >
      {/* Top Floating Zen Bar */}
      <div className="flex justify-between items-center px-6 py-4 opacity-40 hover:opacity-100 transition-opacity select-none border-b border-black/5">
        <div className="flex items-center gap-4 text-xs font-sans">
          <span className="font-bold tracking-wider uppercase text-[11px]">
            Modo Foco / Zen
          </span>

          <select
            value={currentSceneId}
            onChange={(e) => setCurrentSceneId(e.target.value)}
            className="bg-transparent border border-current/20 rounded px-2 py-1 text-xs font-semibold cursor-pointer"
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
        <div className="flex items-center gap-3 text-xs">
          {/* Theme toggles */}
          <div className="flex items-center bg-current/5 rounded p-0.5 border border-current/10">
            <button
              onClick={() => setTheme('cream')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                theme === 'cream' ? 'bg-white text-black shadow-xs' : ''
              }`}
            >
              Papel
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                theme === 'dark' ? 'bg-slate-800 text-white shadow-xs' : ''
              }`}
            >
              Escuro
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                theme === 'sepia' ? 'bg-[#d8caaf] text-black shadow-xs' : ''
              }`}
            >
              Sépia
            </button>
          </div>

          {/* Auto Save Status Indicator */}
          <AutoSaveIndicator
            status={autoSaveStatus}
            lastSavedAt={lastSavedAt}
            onForceSave={onForceSave}
            isDarkEffective={theme === 'dark'}
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
            <span>Estilo</span>
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

          {/* Exit Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1 bg-current/10 hover:bg-current/20 px-3 py-1.5 rounded font-semibold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            Sair do Foco
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
            placeholder="Apenas as palavras importam agora..."
            className="w-full flex-1 min-h-[500px] font-writing-canvas text-writing-canvas text-lg sm:text-xl leading-[2.1] bg-transparent focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Bottom Floating Stats */}
      <div className="flex justify-between items-center px-8 py-3 text-xs opacity-40 hover:opacity-100 transition-opacity border-t border-black/5 select-none">
        <div className="flex items-center gap-4">
          <span>
            Nesta sessão: <strong>+{wordsWrittenInSession}</strong> palavras
          </span>
          <span>
            Total na cena: <strong>{activeScene?.wordCount || 0}</strong> palavras
          </span>
        </div>
        <div>
          <span>Pressione <strong>ESC</strong> ou clique em Sair para voltar ao Estúdio</span>
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
    </div>
  );
};
