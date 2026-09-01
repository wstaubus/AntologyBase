import React, { useState } from 'react';
import { NovelProject, Chapter, Scene } from '../types';

interface NewChapterModalProps {
  project: NovelProject;
  onClose: () => void;
  onUpdateProject: (updated: NovelProject) => void;
}

export const NewChapterModal: React.FC<NewChapterModalProps> = ({
  project,
  onClose,
  onUpdateProject,
}) => {
  const [type, setType] = useState<'chapter' | 'scene'>('chapter');
  const [chapterTitle, setChapterTitle] = useState(`Capítulo ${project.chapters.length + 1}: `);
  const [targetChapterId, setTargetChapterId] = useState(project.chapters[0]?.id || '');
  const [sceneTitle, setSceneTitle] = useState('Cena 1: ');
  const [synopsis, setSynopsis] = useState('');
  const [povCharacterId, setPovCharacterId] = useState('');
  const [locationId, setLocationId] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'chapter') {
      if (!chapterTitle.trim()) return;
      const newOrder = project.chapters.length + 1;
      const newChapId = `chap-${Date.now()}`;
      const firstScene: Scene = {
        id: `sc-${Date.now()}-1`,
        chapterId: newChapId,
        title: sceneTitle.trim() || 'Cena 1: Abertura',
        content: '',
        synopsis: synopsis.trim(),
        povCharacterId: povCharacterId || undefined,
        locationId: locationId || undefined,
        characterIds: povCharacterId ? [povCharacterId] : [],
        status: 'Rascunho',
        wordCount: 0,
      };

      const newChapter: Chapter = {
        id: newChapId,
        order: newOrder,
        title: chapterTitle.trim(),
        status: 'Rascunho',
        scenes: [firstScene],
      };

      onUpdateProject({
        ...project,
        chapters: [...project.chapters, newChapter],
        history: [
          {
            id: `rev-${Date.now()}`,
            timestamp: 'Agora',
            action: `Criou novo capítulo: ${newChapter.title}`,
            author: project.author.name,
            wordsDelta: 0,
          },
          ...project.history,
        ],
      });
    } else {
      // Adding scene to existing chapter
      if (!sceneTitle.trim()) return;
      const targetChap = project.chapters.find((c) => c.id === targetChapterId);
      if (!targetChap) return;

      const newScene: Scene = {
        id: `sc-${Date.now()}`,
        chapterId: targetChapterId,
        title: sceneTitle.trim(),
        content: '',
        synopsis: synopsis.trim(),
        povCharacterId: povCharacterId || undefined,
        locationId: locationId || undefined,
        characterIds: povCharacterId ? [povCharacterId] : [],
        status: 'Rascunho',
        wordCount: 0,
      };

      const updatedChapters = project.chapters.map((c) =>
        c.id === targetChapterId ? { ...c, scenes: [...c.scenes, newScene] } : c
      );

      onUpdateProject({
        ...project,
        chapters: updatedChapters,
        history: [
          {
            id: `rev-${Date.now()}`,
            timestamp: 'Agora',
            action: `Adicionou nova cena em ${targetChap.title}`,
            author: project.author.name,
            wordsDelta: 0,
          },
          ...project.history,
        ],
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-lg w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center pb-3 border-b border-[#c5c6ce] mb-5">
          <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
            {type === 'chapter' ? 'Criar Novo Capítulo' : 'Adicionar Nova Cena'}
          </h2>
          <button onClick={onClose} className="text-[#44474d] hover:text-[#04162e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Toggle Chapter vs Scene */}
        <div className="flex gap-2 p-1 bg-[#eaeef2] rounded-lg mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setType('chapter')}
            className={`flex-1 py-1.5 rounded transition-all ${
              type === 'chapter' ? 'bg-[#04162e] text-white shadow-xs' : 'text-[#44474d]'
            }`}
          >
            Novo Capítulo Completo
          </button>
          <button
            type="button"
            onClick={() => setType('scene')}
            className={`flex-1 py-1.5 rounded transition-all ${
              type === 'scene' ? 'bg-[#04162e] text-white shadow-xs' : 'text-[#44474d]'
            }`}
          >
            Apenas Nova Cena
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {type === 'chapter' ? (
            <div>
              <label className="font-label-caps block text-[#44474d] mb-1">
                Título do Capítulo *
              </label>
              <input
                type="text"
                required
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Ex: Capítulo 13: O Despertar da Maré"
                className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-semibold text-[#04162e]"
              />
            </div>
          ) : (
            <div>
              <label className="font-label-caps block text-[#44474d] mb-1">
                Capítulo Destino *
              </label>
              <select
                value={targetChapterId}
                onChange={(e) => setTargetChapterId(e.target.value)}
                className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-semibold text-[#04162e]"
              >
                {project.chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-label-caps block text-[#44474d] mb-1">
              Título da Cena Inicial *
            </label>
            <input
              type="text"
              required
              value={sceneTitle}
              onChange={(e) => setSceneTitle(e.target.value)}
              placeholder="Ex: Cena 1: A Reunião Secreta"
              className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded"
            />
          </div>

          <div>
            <label className="font-label-caps block text-[#44474d] mb-1">
              Sinopse / Intenção Dramática
            </label>
            <textarea
              rows={2}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="O que acontece e qual o conflito nesta cena?"
              className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-writing-canvas text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label-caps block text-[#44474d] mb-1">
                Ponto de Vista (POV)
              </label>
              <select
                value={povCharacterId}
                onChange={(e) => setPovCharacterId(e.target.value)}
                className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded text-xs"
              >
                <option value="">Selecione...</option>
                {project.characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-label-caps block text-[#44474d] mb-1">
                Cenário Principal
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded text-xs"
              >
                <option value="">Selecione...</option>
                {project.locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#c5c6ce]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c5c6ce] text-[#44474d] rounded font-semibold hover:bg-[#eaeef2]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#04162e] text-white rounded font-semibold hover:opacity-90 shadow-sm"
            >
              Confirmar e Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
