import React, { useState, useMemo } from 'react';
import { NovelProject, Chapter, Scene, ContentStatus } from '../types';

interface StructureStoryboardViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
  onOpenSceneInEditor: (chapterId: string, sceneId: string) => void;
  onOpenNewChapter?: () => void;
  isDarkMode?: boolean;
}

type StoryboardSubView = 'board' | 'timeline' | 'matrix';

export const StructureStoryboardView: React.FC<StructureStoryboardViewProps> = ({
  project,
  onUpdateProject,
  onOpenSceneInEditor,
  onOpenNewChapter,
  isDarkMode = false,
}) => {
  // Current view mode: Board (Kanban), Timeline (Sequência e Ritmo), Matrix (POV e Arcos)
  const [subView, setSubView] = useState<StoryboardSubView>('board');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPovFilter, setSelectedPovFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal / Drawer state for editing scene metadata
  const [editingScene, setEditingScene] = useState<{ chapterId: string; scene: Scene } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSynopsis, setEditSynopsis] = useState('');
  const [editStatus, setEditStatus] = useState<ContentStatus>('Rascunho');
  const [editPovId, setEditPovId] = useState<string>('');
  const [editNotes, setEditNotes] = useState('');

  // Quick Chapter Creation Modal / Inline
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Quick Scene Creation State
  const [addingSceneToChapterId, setAddingSceneToChapterId] = useState<string | null>(null);
  const [newSceneTitle, setNewSceneTitle] = useState('');

  // Overall Statistics
  const stats = useMemo(() => {
    let totalScenes = 0;
    let totalWords = 0;
    let draftScenes = 0;
    let reviewedScenes = 0;
    let finalScenes = 0;

    const povCounts: Record<string, { count: number; words: number }> = {};

    project.chapters.forEach((chapter) => {
      totalScenes += chapter.scenes.length;
      chapter.scenes.forEach((scene) => {
        const words = scene.wordCount || 0;
        totalWords += words;

        if (scene.status === 'Final') finalScenes++;
        else if (scene.status === 'Revisado') reviewedScenes++;
        else draftScenes++;

        const pov = scene.povCharacterId || 'none';
        if (!povCounts[pov]) povCounts[pov] = { count: 0, words: 0 };
        povCounts[pov].count++;
        povCounts[pov].words += words;
      });
    });

    const avgWordsPerChapter = project.chapters.length > 0 ? Math.round(totalWords / project.chapters.length) : 0;
    const avgWordsPerScene = totalScenes > 0 ? Math.round(totalWords / totalScenes) : 0;

    return {
      totalChapters: project.chapters.length,
      totalScenes,
      totalWords,
      draftScenes,
      reviewedScenes,
      finalScenes,
      avgWordsPerChapter,
      avgWordsPerScene,
      povCounts,
    };
  }, [project]);

  // Filtered Chapters and Scenes
  const filteredChapters = useMemo(() => {
    return project.chapters.map((chap) => {
      const filteredScenes = chap.scenes.filter((sc) => {
        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = sc.title.toLowerCase().includes(q);
          const matchSyn = sc.synopsis?.toLowerCase().includes(q) || false;
          const matchNotes = sc.notes?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchSyn && !matchNotes) return false;
        }

        // Filter POV
        if (selectedPovFilter !== 'all') {
          if (selectedPovFilter === 'none') {
            if (sc.povCharacterId) return false;
          } else {
            if (sc.povCharacterId !== selectedPovFilter) return false;
          }
        }

        // Filter Status
        if (selectedStatusFilter !== 'all') {
          if (sc.status !== selectedStatusFilter) return false;
        }

        return true;
      });

      return {
        ...chap,
        scenes: filteredScenes,
      };
    });
  }, [project.chapters, searchQuery, selectedPovFilter, selectedStatusFilter]);

  // Handler: Add New Chapter
  const handleCreateChapter = () => {
    if (!newChapterTitle.trim()) return;
    const newChap: Chapter = {
      id: `chap-${Date.now()}`,
      order: project.chapters.length + 1,
      title: newChapterTitle.trim(),
      status: 'Rascunho',
      scenes: [],
    };
    onUpdateProject({
      ...project,
      chapters: [...project.chapters, newChap],
    });
    setNewChapterTitle('');
    setIsAddingChapter(false);
  };

  // Handler: Delete Chapter
  const handleDeleteChapter = (chapterId: string) => {
    const chapter = project.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o capítulo "${chapter.title}" e suas ${chapter.scenes.length} cenas?`
      )
    ) {
      return;
    }
    const updated = project.chapters
      .filter((c) => c.id !== chapterId)
      .map((c, idx) => ({ ...c, order: idx + 1 }));
    onUpdateProject({ ...project, chapters: updated });
  };

  // Handler: Add New Scene to Chapter
  const handleCreateScene = (chapterId: string) => {
    if (!newSceneTitle.trim()) return;
    const chapter = project.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;

    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      chapterId,
      title: newSceneTitle.trim(),
      content: '',
      synopsis: '',
      characterIds: [],
      status: 'Rascunho',
      wordCount: 0,
      updatedAt: new Date().toISOString(),
    };

    const updatedChapters = project.chapters.map((c) => {
      if (c.id === chapterId) {
        return {
          ...c,
          scenes: [...c.scenes, newScene],
        };
      }
      return c;
    });

    onUpdateProject({ ...project, chapters: updatedChapters });
    setNewSceneTitle('');
    setAddingSceneToChapterId(null);
  };

  // Handler: Delete Scene
  const handleDeleteScene = (chapterId: string, sceneId: string) => {
    const chapter = project.chapters.find((c) => c.id === chapterId);
    const scene = chapter?.scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    if (!window.confirm(`Tem certeza que deseja excluir a cena "${scene.title}"?`)) {
      return;
    }

    const updatedChapters = project.chapters.map((c) => {
      if (c.id === chapterId) {
        return {
          ...c,
          scenes: c.scenes.filter((s) => s.id !== sceneId),
        };
      }
      return c;
    });

    onUpdateProject({ ...project, chapters: updatedChapters });
  };

  // Handler: Move Scene Up/Down
  const handleMoveScene = (chapterId: string, sceneId: string, direction: 'up' | 'down') => {
    const chapter = project.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;

    const idx = chapter.scenes.findIndex((s) => s.id === sceneId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= chapter.scenes.length) return;

    const reorderedScenes = [...chapter.scenes];
    const temp = reorderedScenes[idx];
    reorderedScenes[idx] = reorderedScenes[targetIdx];
    reorderedScenes[targetIdx] = temp;

    const updatedChapters = project.chapters.map((c) => {
      if (c.id === chapterId) {
        return { ...c, scenes: reorderedScenes };
      }
      return c;
    });

    onUpdateProject({ ...project, chapters: updatedChapters });
  };

  // Handler: Move Scene to Another Chapter
  const handleMoveSceneToChapter = (sourceChapterId: string, sceneId: string, targetChapterId: string) => {
    if (sourceChapterId === targetChapterId) return;

    const sourceChapter = project.chapters.find((c) => c.id === sourceChapterId);
    const scene = sourceChapter?.scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    const movedScene = { ...scene, chapterId: targetChapterId };

    const updatedChapters = project.chapters.map((c) => {
      if (c.id === sourceChapterId) {
        return { ...c, scenes: c.scenes.filter((s) => s.id !== sceneId) };
      }
      if (c.id === targetChapterId) {
        return { ...c, scenes: [...c.scenes, movedScene] };
      }
      return c;
    });

    onUpdateProject({ ...project, chapters: updatedChapters });
  };

  // Handler: Open Edit Scene Modal
  const handleOpenEditModal = (chapterId: string, scene: Scene) => {
    setEditingScene({ chapterId, scene });
    setEditTitle(scene.title);
    setEditSynopsis(scene.synopsis || '');
    setEditStatus(scene.status);
    setEditPovId(scene.povCharacterId || '');
    setEditNotes(scene.notes || '');
  };

  // Handler: Save Scene Modal Changes
  const handleSaveSceneModal = () => {
    if (!editingScene) return;
    const { chapterId, scene } = editingScene;

    const updatedChapters = project.chapters.map((c) => {
      if (c.id === chapterId) {
        return {
          ...c,
          scenes: c.scenes.map((s) => {
            if (s.id === scene.id) {
              return {
                ...s,
                title: editTitle.trim() || s.title,
                synopsis: editSynopsis.trim(),
                status: editStatus,
                povCharacterId: editPovId || undefined,
                notes: editNotes.trim(),
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          }),
        };
      }
      return c;
    });

    onUpdateProject({ ...project, chapters: updatedChapters });
    setEditingScene(null);
  };

  // Helper: Get Character By ID
  const getCharacter = (charId?: string) => {
    if (!charId) return null;
    return project.characters.find((c) => c.id === charId);
  };

  return (
    <main
      id="structure-storyboard-page"
      className={`flex-1 flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden transition-colors duration-200 ${
        isDarkMode ? 'bg-[#080d14] text-[#e2e8f0]' : 'bg-[#f4f7fa] text-[#171c1f]'
      }`}
    >
      {/* 1. Top Header & Control Toolbar */}
      <header
        id="storyboard-header"
        className={`px-4 sm:px-6 py-3.5 sm:py-4 border-b shrink-0 flex flex-col gap-3 ${
          isDarkMode ? 'bg-[#0b111a] border-[#1e293b]' : 'bg-[#ffffff] border-[#c5c6ce]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-label-caps text-[11px] uppercase tracking-wider font-bold ${
                  isDarkMode ? 'text-[#60a5fa]' : 'text-[#2563eb]'
                }`}
              >
                Planejamento & Enredo
              </span>
              <span className="text-xs opacity-40">•</span>
              <span className={`text-xs ${isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'}`}>
                {project.title}
              </span>
            </div>
            <h1
              className={`font-headline-md text-xl sm:text-2xl font-extrabold tracking-tight ${
                isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'
              }`}
            >
              Estrutura & Storyboard
            </h1>
          </div>

          {/* Action Buttons: Add Chapter, Add Scene, Switch to Writing Studio */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              id="btn-storyboard-add-chapter"
              onClick={() => {
                if (onOpenNewChapter) {
                  onOpenNewChapter();
                } else {
                  setIsAddingChapter(true);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isDarkMode
                  ? 'border-[#253347] bg-[#16202f] text-[#f1f5f9] hover:bg-[#1e2b40]'
                  : 'border-[#c5c6ce] bg-[#eaeef2] text-[#04162e] hover:bg-[#dfe3e7]'
              }`}
              title="Criar novo capítulo no livro"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Novo Capítulo</span>
            </button>

            {project.chapters[0]?.scenes[0] && (
              <button
                id="btn-storyboard-open-editor"
                onClick={() => {
                  const firstChap = project.chapters[0];
                  const firstScene = firstChap.scenes[0];
                  if (firstChap && firstScene) {
                    onOpenSceneInEditor(firstChap.id, firstScene.id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-white shadow-xs transition-all cursor-pointer active:scale-95 ${
                  isDarkMode ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-[#04162e] hover:opacity-90'
                }`}
                title="Ir para o Estúdio de Escrita com o manuscrito"
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>Ir para o Editor</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode Tabs (Quadro Kanban, Linha do Tempo, Matriz POV) & Search/Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* SubView Mode Selector */}
          <div
            id="storyboard-subview-nav"
            className={`inline-flex p-1 rounded-lg border ${
              isDarkMode ? 'bg-[#0e1624] border-[#1e293b]' : 'bg-[#edf2f7] border-[#c5c6ce]'
            }`}
          >
            <button
              id="subview-board"
              onClick={() => setSubView('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                subView === 'board'
                  ? isDarkMode
                    ? 'bg-[#2563eb] text-white shadow-xs'
                    : 'bg-[#04162e] text-white shadow-xs'
                  : isDarkMode
                  ? 'text-[#94a3b8] hover:text-white'
                  : 'text-[#44474d] hover:text-[#04162e]'
              }`}
              title="Quadro de cartões com colunas por capítulo"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Quadro de Cenas</span>
            </button>

            <button
              id="subview-timeline"
              onClick={() => setSubView('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                subView === 'timeline'
                  ? isDarkMode
                    ? 'bg-[#2563eb] text-white shadow-xs'
                    : 'bg-[#04162e] text-white shadow-xs'
                  : isDarkMode
                  ? 'text-[#94a3b8] hover:text-white'
                  : 'text-[#44474d] hover:text-[#04162e]'
              }`}
              title="Sequência cronológica e ritmo narrativo de palavras"
            >
              <span className="material-symbols-outlined text-[16px]">timeline</span>
              <span>Linha do Tempo & Ritmo</span>
            </button>

            <button
              id="subview-matrix"
              onClick={() => setSubView('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                subView === 'matrix'
                  ? isDarkMode
                    ? 'bg-[#2563eb] text-white shadow-xs'
                    : 'bg-[#04162e] text-white shadow-xs'
                  : isDarkMode
                  ? 'text-[#94a3b8] hover:text-white'
                  : 'text-[#44474d] hover:text-[#04162e]'
              }`}
              title="Matriz de distribuição de Pontos de Vista (POV) e personagens"
            >
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span>Matriz de POV</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <span
                className={`material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none ${
                  isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'
                }`}
              >
                search
              </span>
              <input
                id="storyboard-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cena ou sinopse..."
                className={`w-40 sm:w-52 pl-8 pr-7 py-1 rounded-md text-xs border outline-hidden transition-all ${
                  isDarkMode
                    ? 'bg-[#111a28] border-[#223147] text-white placeholder-[#64748b] focus:border-[#3b82f6]'
                    : 'bg-[#ffffff] border-[#c5c6ce] text-[#04162e] placeholder-[#75777e] focus:border-[#04162e]'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>

            {/* POV Filter Dropdown */}
            <select
              id="storyboard-filter-pov"
              value={selectedPovFilter}
              onChange={(e) => setSelectedPovFilter(e.target.value)}
              className={`py-1 px-2 rounded-md text-xs border outline-hidden cursor-pointer ${
                isDarkMode
                  ? 'bg-[#111a28] border-[#223147] text-[#e2e8f0]'
                  : 'bg-[#ffffff] border-[#c5c6ce] text-[#04162e]'
              }`}
              title="Filtrar por Ponto de Vista (POV)"
            >
              <option value="all">Todos os POVs</option>
              <option value="none">Sem POV atribuído</option>
              {project.characters.map((c) => (
                <option key={c.id} value={c.id}>
                  POV: {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              id="storyboard-filter-status"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className={`py-1 px-2 rounded-md text-xs border outline-hidden cursor-pointer ${
                isDarkMode
                  ? 'bg-[#111a28] border-[#223147] text-[#e2e8f0]'
                  : 'bg-[#ffffff] border-[#c5c6ce] text-[#04162e]'
              }`}
              title="Filtrar por status da cena"
            >
              <option value="all">Todos os Status</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Revisado">Revisado</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>
      </header>

      {/* 2. Structural KPI Summary Strip */}
      <section
        id="storyboard-stats-strip"
        className={`px-4 sm:px-6 py-2.5 border-b shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'bg-[#0d1420] border-[#1e293b]' : 'bg-[#f8fafc] border-[#c5c6ce]'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <span className="opacity-70">Capítulos:</span>
            <span className="font-bold">{stats.totalChapters}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-70">Cenas:</span>
            <span className="font-bold">{stats.totalScenes}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-70">Palavras Totais:</span>
            <span className="font-bold">{stats.totalWords.toLocaleString('pt-BR')}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="opacity-70">Média por Cena:</span>
            <span className="font-bold">{stats.avgWordsPerScene.toLocaleString('pt-BR')} pal.</span>
          </div>
        </div>

        {/* Status Distribution Pills */}
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
            title={`${stats.finalScenes} cenas finalizadas`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{stats.finalScenes} Final</span>
          </span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
            title={`${stats.reviewedScenes} cenas revisadas`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>{stats.reviewedScenes} Revisado</span>
          </span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            title={`${stats.draftScenes} cenas em rascunho`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>{stats.draftScenes} Rascunho</span>
          </span>
        </div>
      </section>

      {/* 3. Main Viewport Content according to subView */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {/* VIEW 1: KANBAN STORYBOARD GRID */}
        {subView === 'board' && (
          <div className="flex gap-5 pb-8 overflow-x-auto min-h-full items-start">
            {filteredChapters.map((chapter) => {
              const chapterWords = chapter.scenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);

              return (
                <div
                  key={chapter.id}
                  id={`chapter-column-${chapter.id}`}
                  className={`w-72 sm:w-80 shrink-0 rounded-xl border flex flex-col max-h-[calc(100vh-14rem)] shadow-xs transition-colors ${
                    isDarkMode ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#ffffff] border-[#c5c6ce]'
                  }`}
                >
                  {/* Chapter Column Header */}
                  <div
                    className={`p-3 border-b flex items-center justify-between gap-2 shrink-0 ${
                      isDarkMode ? 'bg-[#141e33] border-[#1e293b]' : 'bg-[#f1f5f9] border-[#e2e8f0]'
                    } rounded-t-xl`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isDarkMode ? 'text-[#60a5fa]' : 'text-[#2563eb]'
                          }`}
                        >
                          Capítulo {chapter.order}
                        </span>
                        <span className="text-[10px] opacity-40">•</span>
                        <span className="text-[10px] opacity-70">{chapterWords.toLocaleString('pt-BR')} pal.</span>
                      </div>
                      <h3
                        className={`font-headline-md text-sm font-bold truncate ${
                          isDarkMode ? 'text-[#f8fafc]' : 'text-[#04162e]'
                        }`}
                        title={chapter.title}
                      >
                        {chapter.title}
                      </h3>
                    </div>

                    {/* Chapter action menu (delete / add scene) */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setAddingSceneToChapterId(chapter.id);
                          setNewSceneTitle('');
                        }}
                        className={`p-1 rounded hover:bg-current/10 transition-colors cursor-pointer`}
                        title="Adicionar cena neste capítulo"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className={`p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer`}
                        title="Excluir capítulo"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Add Scene Form in Chapter */}
                  {addingSceneToChapterId === chapter.id && (
                    <div
                      className={`p-2.5 border-b ${
                        isDarkMode ? 'bg-[#16202f] border-[#223147]' : 'bg-[#f8fafc] border-[#eaeef2]'
                      }`}
                    >
                      <input
                        type="text"
                        autoFocus
                        value={newSceneTitle}
                        onChange={(e) => setNewSceneTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateScene(chapter.id);
                          if (e.key === 'Escape') setAddingSceneToChapterId(null);
                        }}
                        placeholder="Título da nova cena..."
                        className={`w-full px-2.5 py-1.5 rounded text-xs border outline-hidden mb-2 ${
                          isDarkMode
                            ? 'bg-[#0f172a] border-[#253347] text-white'
                            : 'bg-white border-[#c5c6ce] text-[#04162e]'
                        }`}
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setAddingSceneToChapterId(null)}
                          className="px-2 py-1 text-xs opacity-70 hover:opacity-100 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleCreateScene(chapter.id)}
                          className={`px-3 py-1 rounded text-xs font-semibold text-white cursor-pointer ${
                            isDarkMode ? 'bg-[#2563eb]' : 'bg-[#04162e]'
                          }`}
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Scene Cards List in Column */}
                  <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                    {chapter.scenes.length === 0 && (
                      <div className="py-6 text-center text-xs opacity-50 italic">Nenhuma cena cadastrada</div>
                    )}

                    {chapter.scenes.map((scene, idx) => {
                      const povChar = getCharacter(scene.povCharacterId);

                      return (
                        <article
                          key={scene.id}
                          id={`scene-card-${scene.id}`}
                          className={`group rounded-lg border p-3 flex flex-col gap-2 transition-all shadow-2xs hover:shadow-md ${
                            isDarkMode
                              ? 'bg-[#141e33] border-[#223147] hover:border-[#3b82f6]'
                              : 'bg-[#f8fafc] border-[#c5c6ce]/80 hover:border-[#04162e]'
                          }`}
                        >
                          {/* Card Header: Scene order, title & status */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono opacity-50 block">Cena {idx + 1}</span>
                              <h4
                                className={`font-semibold text-xs leading-snug truncate ${
                                  isDarkMode ? 'text-[#f1f5f9]' : 'text-[#04162e]'
                                }`}
                                title={scene.title}
                              >
                                {scene.title}
                              </h4>
                            </div>

                            {/* Status badge */}
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                scene.status === 'Final'
                                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                  : scene.status === 'Revisado'
                                  ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              }`}
                            >
                              {scene.status}
                            </span>
                          </div>

                          {/* Synopsis Preview */}
                          <p
                            onClick={() => handleOpenEditModal(chapter.id, scene)}
                            className={`text-[11px] leading-relaxed line-clamp-3 cursor-pointer ${
                              scene.synopsis
                                ? isDarkMode
                                  ? 'text-[#94a3b8]'
                                  : 'text-[#44474d]'
                                : 'italic opacity-50'
                            }`}
                            title="Clique para editar sinopse e detalhes"
                          >
                            {scene.synopsis || 'Sem sinopse. Clique para adicionar...'}
                          </p>

                          {/* Card Metadata Footer: POV badge, words, quick actions */}
                          <div
                            className={`pt-2 border-t flex items-center justify-between gap-2 text-[10px] ${
                              isDarkMode ? 'border-[#223147]' : 'border-[#e2e8f0]'
                            }`}
                          >
                            {/* POV Info */}
                            {povChar ? (
                              <div className="flex items-center gap-1.5 min-w-0" title={`POV: ${povChar.name}`}>
                                <img
                                  src={povChar.avatarUrl}
                                  alt={povChar.name}
                                  className="w-4 h-4 rounded-full object-cover border border-current/20 shrink-0"
                                />
                                <span className="truncate max-w-[80px] font-semibold">{povChar.name}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenEditModal(chapter.id, scene)}
                                className="opacity-50 hover:opacity-100 flex items-center gap-1 cursor-pointer"
                                title="Atribuir Ponto de Vista"
                              >
                                <span className="material-symbols-outlined text-[13px]">person_add</span>
                                <span>+ POV</span>
                              </button>
                            )}

                            {/* Word count & Actions */}
                            <div className="flex items-center gap-1 shrink-0 ml-auto">
                              <span className="font-mono opacity-70 mr-1">
                                {(scene.wordCount || 0).toLocaleString('pt-BR')} pal.
                              </span>

                              {/* Edit Modal Button */}
                              <button
                                onClick={() => handleOpenEditModal(chapter.id, scene)}
                                className="p-1 rounded hover:bg-current/10 opacity-70 hover:opacity-100 cursor-pointer"
                                title="Editar sinopse e metadados"
                              >
                                <span className="material-symbols-outlined text-[15px]">edit</span>
                              </button>

                              {/* Primary Action: Go to Editor */}
                              <button
                                onClick={() => onOpenSceneInEditor(chapter.id, scene.id)}
                                className={`px-2 py-0.5 rounded font-semibold text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                                  isDarkMode
                                    ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                                    : 'bg-[#04162e] text-white hover:opacity-90'
                                }`}
                                title="Abrir e escrever esta cena no Estúdio de Escrita"
                              >
                                <span className="material-symbols-outlined text-[12px]">edit_note</span>
                                <span>Escrever</span>
                              </button>
                            </div>
                          </div>

                          {/* Reordering and Moving controls */}
                          <div className="flex items-center justify-between text-[10px] opacity-60 hover:opacity-100 pt-0.5">
                            <div className="flex items-center gap-1">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveScene(chapter.id, scene.id, 'up')}
                                className="p-0.5 rounded hover:bg-current/10 disabled:opacity-20 cursor-pointer"
                                title="Mover cena para cima"
                              >
                                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                              </button>
                              <button
                                disabled={idx === chapter.scenes.length - 1}
                                onClick={() => handleMoveScene(chapter.id, scene.id, 'down')}
                                className="p-0.5 rounded hover:bg-current/10 disabled:opacity-20 cursor-pointer"
                                title="Mover cena para baixo"
                              >
                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Move to another chapter select */}
                              {project.chapters.length > 1 && (
                                <select
                                  value={chapter.id}
                                  onChange={(e) => handleMoveSceneToChapter(chapter.id, scene.id, e.target.value)}
                                  className={`text-[9px] px-1 py-0.5 rounded border outline-hidden cursor-pointer ${
                                    isDarkMode ? 'bg-[#0d1420] border-[#223147]' : 'bg-white border-[#c5c6ce]'
                                  }`}
                                  title="Mover cena para outro capítulo"
                                >
                                  {project.chapters.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      Mover p/ Cap. {c.order}
                                    </option>
                                  ))}
                                </select>
                              )}

                              <button
                                onClick={() => handleDeleteScene(chapter.id, scene.id)}
                                className="p-0.5 rounded text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                                title="Excluir cena"
                              >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Add Scene button at bottom of column */}
                  <div
                    className={`p-2.5 border-t shrink-0 ${
                      isDarkMode ? 'bg-[#141e33] border-[#1e293b]' : 'bg-[#f1f5f9] border-[#e2e8f0]'
                    } rounded-b-xl`}
                  >
                    <button
                      onClick={() => {
                        setAddingSceneToChapterId(chapter.id);
                        setNewSceneTitle('');
                      }}
                      className={`w-full py-1.5 px-3 rounded-lg border border-dashed text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isDarkMode
                          ? 'border-[#223147] hover:border-[#60a5fa] text-[#94a3b8] hover:text-white hover:bg-[#18243b]'
                          : 'border-[#c5c6ce] hover:border-[#04162e] text-[#44474d] hover:text-[#04162e] hover:bg-[#e4e9ed]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Adicionar Cena</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Final Column: + Novo Capítulo */}
            <div
              className={`w-72 sm:w-80 shrink-0 rounded-xl border border-dashed p-6 flex flex-col items-center justify-center gap-3 transition-colors ${
                isDarkMode
                  ? 'border-[#223147] bg-[#0d1420]/50 hover:bg-[#0d1420] text-[#94a3b8]'
                  : 'border-[#c5c6ce] bg-[#ffffff]/50 hover:bg-[#ffffff] text-[#44474d]'
              }`}
            >
              <span className="material-symbols-outlined text-[36px] opacity-40">post_add</span>
              <div className="text-center">
                <h4 className="font-bold text-sm">Criar Novo Capítulo</h4>
                <p className="text-xs opacity-70 mt-0.5">Expanda a estrutura da sua obra</p>
              </div>
              <button
                onClick={() => {
                  if (onOpenNewChapter) {
                    onOpenNewChapter();
                  } else {
                    setIsAddingChapter(true);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-white shadow-xs cursor-pointer ${
                  isDarkMode ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-[#04162e] hover:opacity-90'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Novo Capítulo</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: TIMELINE & PACING */}
        {subView === 'timeline' && (
          <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Timeline Narrative Flow Header */}
            <div
              className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#ffffff] border-[#c5c6ce]'
              }`}
            >
              <h2 className="font-headline-md text-base font-bold mb-1">Ritmo Narrativo & Fluxo Contínuo</h2>
              <p className="text-xs opacity-70">
                Acompanhe a cadência de palavras e a progressão de cada cena ao longo dos capítulos.
              </p>

              {/* Visual Pacing Density Chart */}
              <div className="mt-4 pt-4 border-t border-current/10">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 block mb-2">
                  Densidade de Palavras por Cena
                </span>
                <div className="h-28 flex items-end gap-1.5 w-full bg-current/5 p-2 rounded-lg overflow-x-auto">
                  {project.chapters.flatMap((c) => c.scenes).map((sc, sIdx) => {
                    const words = sc.wordCount || 0;
                    const maxWords = Math.max(
                      1000,
                      ...project.chapters.flatMap((c) => c.scenes).map((s) => s.wordCount || 0)
                    );
                    const heightPercent = Math.max(12, Math.round((words / maxWords) * 100));

                    return (
                      <div
                        key={sc.id}
                        className="flex-1 min-w-[28px] max-w-[40px] flex flex-col items-center gap-1 group relative cursor-pointer"
                        onClick={() => {
                          const chap = project.chapters.find((c) => c.id === sc.chapterId);
                          if (chap) onOpenSceneInEditor(chap.id, sc.id);
                        }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                          <div
                            className={`px-2 py-1 rounded text-[10px] shadow-lg whitespace-nowrap border ${
                              isDarkMode ? 'bg-[#04162e] text-white border-blue-500' : 'bg-[#04162e] text-white'
                            }`}
                          >
                            <span className="font-bold">{sc.title}</span>: {words.toLocaleString('pt-BR')} pal.
                          </div>
                        </div>

                        <div
                          className={`w-full rounded-t transition-all ${
                            sc.status === 'Final'
                              ? 'bg-emerald-500'
                              : sc.status === 'Revisado'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          } group-hover:brightness-125`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] font-mono opacity-60">{sIdx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sequential Chapter & Scene List */}
            <div className="space-y-4">
              {filteredChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className={`rounded-xl border overflow-hidden ${
                    isDarkMode ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#ffffff] border-[#c5c6ce]'
                  }`}
                >
                  <div
                    className={`p-3.5 border-b flex items-center justify-between ${
                      isDarkMode ? 'bg-[#141e33] border-[#1e293b]' : 'bg-[#f1f5f9] border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">
                        Capítulo {chapter.order}: {chapter.title}
                      </span>
                      <span className="text-xs opacity-60">({chapter.scenes.length} cenas)</span>
                    </div>
                    <span className="text-xs font-mono font-semibold">
                      {chapter.scenes.reduce((a, s) => a + (s.wordCount || 0), 0).toLocaleString('pt-BR')} palavras
                    </span>
                  </div>

                  <div className="divide-y divide-current/10">
                    {chapter.scenes.map((sc, scIdx) => {
                      const pov = getCharacter(sc.povCharacterId);

                      return (
                        <div
                          key={sc.id}
                          className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-current/5 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-mono opacity-50">Cena {scIdx + 1}</span>
                              <h4 className="font-bold text-xs sm:text-sm">{sc.title}</h4>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                  sc.status === 'Final'
                                    ? 'bg-emerald-500/20 text-emerald-500'
                                    : sc.status === 'Revisado'
                                    ? 'bg-blue-500/20 text-blue-500'
                                    : 'bg-amber-500/20 text-amber-500'
                                }`}
                              >
                                {sc.status}
                              </span>
                            </div>
                            <p className="text-xs opacity-75 line-clamp-2 italic">
                              {sc.synopsis || 'Sem sinopse cadastrada'}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                            {pov && (
                              <div className="flex items-center gap-1.5 text-xs opacity-80" title={`POV: ${pov.name}`}>
                                <img src={pov.avatarUrl} alt={pov.name} className="w-5 h-5 rounded-full object-cover" />
                                <span className="font-medium text-xs">{pov.name}</span>
                              </div>
                            )}

                            <span className="font-mono text-xs opacity-70">
                              {(sc.wordCount || 0).toLocaleString('pt-BR')} pal.
                            </span>

                            <button
                              onClick={() => onOpenSceneInEditor(chapter.id, sc.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 text-white cursor-pointer ${
                                isDarkMode ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-[#04162e] hover:opacity-90'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">edit_note</span>
                              <span>Escrever</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: POV & CHARACTER ARCS MATRIX */}
        {subView === 'matrix' && (
          <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* POV Distribution Summary */}
            <div
              className={`p-5 rounded-xl border ${
                isDarkMode ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#ffffff] border-[#c5c6ce]'
              }`}
            >
              <h2 className="font-headline-md text-base font-bold mb-1">Distribuição de Ponto de Vista (POV)</h2>
              <p className="text-xs opacity-70 mb-4">
                Veja como o tempo narrativo e a contagem de palavras estão distribuídos entre seus personagens.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.characters.map((char) => {
                  const povInfo = stats.povCounts[char.id] || { count: 0, words: 0 };
                  const percentOfTotalWords =
                    stats.totalWords > 0 ? Math.round((povInfo.words / stats.totalWords) * 100) : 0;

                  return (
                    <div
                      key={char.id}
                      className={`p-3 rounded-lg border flex items-center gap-3 ${
                        isDarkMode ? 'bg-[#141e33] border-[#223147]' : 'bg-[#f8fafc] border-[#e2e8f0]'
                      }`}
                    >
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        className="w-10 h-10 rounded-full object-cover border border-current/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs truncate">{char.name}</h4>
                          <span className="text-[10px] font-mono font-bold text-blue-500">
                            {percentOfTotalWords}%
                          </span>
                        </div>
                        <span className="text-[10px] opacity-60 block">{char.role}</span>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span>
                            <strong>{povInfo.count}</strong> cenas
                          </span>
                          <span className="opacity-40">•</span>
                          <span>
                            <strong>{povInfo.words.toLocaleString('pt-BR')}</strong> pal.
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Unassigned POV */}
                {stats.povCounts['none'] && (
                  <div
                    className={`p-3 rounded-lg border flex items-center gap-3 ${
                      isDarkMode ? 'bg-[#141e33] border-[#223147]' : 'bg-[#f8fafc] border-[#e2e8f0]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-current/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px] opacity-60">help_outline</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs">Sem POV Atribuído</h4>
                      <span className="text-[10px] opacity-60 block">Cenas neutras / sem narrador</span>
                      <div className="flex items-center gap-2 mt-1 text-[11px]">
                        <span>
                          <strong>{stats.povCounts['none'].count}</strong> cenas
                        </span>
                        <span className="opacity-40">•</span>
                        <span>
                          <strong>{stats.povCounts['none'].words.toLocaleString('pt-BR')}</strong> pal.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Matrix Table: Chapters vs Characters */}
            <div
              className={`rounded-xl border overflow-hidden ${
                isDarkMode ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-[#ffffff] border-[#c5c6ce]'
              }`}
            >
              <div
                className={`p-4 border-b ${
                  isDarkMode ? 'bg-[#141e33] border-[#1e293b]' : 'bg-[#f1f5f9] border-[#e2e8f0]'
                }`}
              >
                <h3 className="font-headline-md text-sm font-bold">Matriz de Capítulos e Presença de Personagens</h3>
                <p className="text-xs opacity-70">
                  Identifique quem conduz cada capítulo ou onde personagens importantes estão ausentes.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-[#1e293b] bg-[#0d1420]' : 'border-[#e2e8f0] bg-[#f8fafc]'}`}>
                      <th className="p-3 font-semibold">Capítulo</th>
                      <th className="p-3 font-semibold">Cenas</th>
                      {project.characters.map((c) => (
                        <th key={c.id} className="p-3 font-semibold text-center whitespace-nowrap">
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-current/10">
                    {project.chapters.map((chap) => (
                      <tr key={chap.id} className="hover:bg-current/5">
                        <td className="p-3 font-medium">
                          Cap. {chap.order}: {chap.title}
                        </td>
                        <td className="p-3 opacity-70 font-mono">{chap.scenes.length}</td>
                        {project.characters.map((c) => {
                          const povScenesInChapter = chap.scenes.filter((s) => s.povCharacterId === c.id);
                          const isPresentInChapter =
                            povScenesInChapter.length > 0 ||
                            chap.scenes.some((s) => s.characterIds?.includes(c.id));

                          return (
                            <td key={c.id} className="p-3 text-center">
                              {povScenesInChapter.length > 0 ? (
                                <span
                                  className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-500"
                                  title={`${povScenesInChapter.length} cena(s) com POV de ${c.name}`}
                                >
                                  POV ({povScenesInChapter.length})
                                </span>
                              ) : isPresentInChapter ? (
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Presente no capítulo" />
                              ) : (
                                <span className="opacity-20 font-mono">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Edit Scene Metadata */}
      {editingScene && (
        <div
          id="modal-edit-scene-metadata"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div
            className={`w-full max-w-lg rounded-xl border p-5 sm:p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 ${
              isDarkMode ? 'bg-[#0d1420] border-[#223147] text-white' : 'bg-white border-[#c5c6ce] text-[#04162e]'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-current/10">
              <h3 className="font-headline-md text-base font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-500">edit_note</span>
                <span>Editar Metadados da Cena</span>
              </h3>
              <button
                onClick={() => setEditingScene(null)}
                className="p-1 rounded opacity-60 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Scene Title */}
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Título da Cena</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs border outline-hidden ${
                    isDarkMode ? 'bg-[#111a28] border-[#223147] text-white' : 'bg-[#f8fafc] border-[#c5c6ce] text-[#04162e]'
                  }`}
                />
              </div>

              {/* Status and POV row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">Status de Revisão</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ContentStatus)}
                    className={`w-full px-2.5 py-2 rounded-lg text-xs border outline-hidden cursor-pointer ${
                      isDarkMode ? 'bg-[#111a28] border-[#223147] text-white' : 'bg-[#f8fafc] border-[#c5c6ce] text-[#04162e]'
                    }`}
                  >
                    <option value="Rascunho">Rascunho</option>
                    <option value="Revisado">Revisado</option>
                    <option value="Final">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">Ponto de Vista (POV)</label>
                  <select
                    value={editPovId}
                    onChange={(e) => setEditPovId(e.target.value)}
                    className={`w-full px-2.5 py-2 rounded-lg text-xs border outline-hidden cursor-pointer ${
                      isDarkMode ? 'bg-[#111a28] border-[#223147] text-white' : 'bg-[#f8fafc] border-[#c5c6ce] text-[#04162e]'
                    }`}
                  >
                    <option value="">Sem narrador específico</option>
                    {project.characters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">
                  Sinopse / Resumo Narrativo da Cena
                </label>
                <textarea
                  rows={3}
                  value={editSynopsis}
                  onChange={(e) => setEditSynopsis(e.target.value)}
                  placeholder="Descreva os acontecimentos chave, o gancho inicial e o clímax desta cena..."
                  className={`w-full px-3 py-2 rounded-lg text-xs border outline-hidden resize-none ${
                    isDarkMode ? 'bg-[#111a28] border-[#223147] text-white' : 'bg-[#f8fafc] border-[#c5c6ce] text-[#04162e]'
                  }`}
                />
              </div>

              {/* Author Notes */}
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Notas do Autor / Lembretes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Lembretes de revisão, prenúncios (foreshadowing) ou pistas..."
                  className={`w-full px-3 py-2 rounded-lg text-xs border outline-hidden resize-none ${
                    isDarkMode ? 'bg-[#111a28] border-[#223147] text-white' : 'bg-[#f8fafc] border-[#c5c6ce] text-[#04162e]'
                  }`}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t pt-3 border-current/10">
              <button
                onClick={() => {
                  onOpenSceneInEditor(editingScene.chapterId, editingScene.scene.id);
                  setEditingScene(null);
                }}
                className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">edit_note</span>
                <span>Abrir no Editor Agora</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingScene(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSceneModal}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer ${
                    isDarkMode ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-[#04162e] hover:opacity-90'
                  }`}
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Chapter */}
      {isAddingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-md rounded-xl border p-5 sm:p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 ${
              isDarkMode ? 'bg-[#0d1420] border-[#223147] text-white' : 'bg-white border-[#c5c6ce] text-[#04162e]'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-current/10">
              <h3 className="font-headline-md text-base font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-500">create_new_folder</span>
                <span>Criar Novo Capítulo</span>
              </h3>
              <button
                onClick={() => setIsAddingChapter(false)}
                className="p-1 rounded opacity-60 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">Título do Capítulo</label>
              <input
                type="text"
                autoFocus
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateChapter();
                  if (e.key === 'Escape') setIsAddingChapter(false);
                }}
                placeholder="Ex: O Retorno das Sombras"
                className={`w-full px-3 py-2 rounded-lg text-xs border outline-hidden ${
                  isDarkMode ? 'bg-[#111a28] border-[#223147] text-white' : 'bg-[#f8fafc] border-[#c5c6ce] text-[#04162e]'
                }`}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3 border-current/10">
              <button
                onClick={() => setIsAddingChapter(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateChapter}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer ${
                  isDarkMode ? 'bg-[#2563eb] hover:bg-[#1d4ed8]' : 'bg-[#04162e] hover:opacity-90'
                }`}
              >
                Criar Capítulo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
