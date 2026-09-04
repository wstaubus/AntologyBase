import React, { useState } from 'react';
import { NovelProject, ProjectPhase, AutoSaveSettings } from '../types';
import { DEFAULT_AUTOSAVE_SETTINGS, calculateStorageUsage } from '../utils/autoSaveManager';

interface SettingsModalProps {
  project: NovelProject;
  onClose: () => void;
  onUpdateProject: (updated: NovelProject) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  project,
  onClose,
  onUpdateProject,
}) => {
  const storageInfo = calculateStorageUsage();

  const [formData, setFormData] = useState({
    title: project.title,
    subtitle: project.subtitle,
    phase: project.phase,
    coverUrl: project.coverUrl,
    authorName: project.author.name,
    authorAvatarUrl: project.author.avatarUrl,
    authorBio: project.author.bio,
    targetWords: project.targetWords,
    genre: project.genre,
    synopsis: project.synopsis,
  });

  const [autoSaveConfig, setAutoSaveConfig] = useState<AutoSaveSettings>(
    project.autoSaveSettings || DEFAULT_AUTOSAVE_SETTINGS
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProject({
      ...project,
      title: formData.title,
      subtitle: formData.subtitle,
      phase: formData.phase as ProjectPhase,
      coverUrl: formData.coverUrl,
      targetWords: Number(formData.targetWords) || 80000,
      genre: formData.genre,
      synopsis: formData.synopsis,
      autoSaveSettings: autoSaveConfig,
      author: {
        ...project.author,
        name: formData.authorName,
        avatarUrl: formData.authorAvatarUrl,
        bio: formData.authorBio,
      },
      history: [
        {
          id: `rev-${Date.now()}`,
          timestamp: 'Agora',
          action: 'Atualizou configurações gerais do projeto',
          author: formData.authorName,
          wordsDelta: 0,
        },
        ...project.history,
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-[#c5c6ce] mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#04162e]">settings</span>
            <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
              Configurações do Projeto
            </h2>
          </div>
          <button onClick={onClose} className="text-[#44474d] hover:text-[#04162e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Project Title & Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-label-caps block text-[#44474d] mb-1">
                Título do Romance *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-semibold text-[#04162e]"
              />
            </div>

            <div>
              <label className="font-label-caps block text-[#44474d] mb-1">
                Fase Atual
              </label>
              <select
                value={formData.phase}
                onChange={(e) =>
                  setFormData({ ...formData, phase: e.target.value as ProjectPhase })
                }
                className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-semibold text-[#04162e]"
              >
                <option value="Rascunho">Rascunho</option>
                <option value="Revisão">Revisão</option>
                <option value="Edição Final">Edição Final</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-label-caps block text-[#44474d] mb-1">
                Subtítulo / Fase no Menu
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Ex: Fase de Rascunho"
                className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded"
              />
            </div>

            <div>
              <label className="font-label-caps block text-[#44474d] mb-1">
                Meta de Palavras (Alvo)
              </label>
              <input
                type="number"
                value={formData.targetWords}
                onChange={(e) =>
                  setFormData({ ...formData, targetWords: parseInt(e.target.value) || 80000 })
                }
                className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-mono"
              />
            </div>
          </div>

          {/* Book Cover URL */}
          <div>
            <label className="font-label-caps block text-[#44474d] mb-1">
              Link Direto da Imagem de Capa (URL)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                className="flex-1 p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-mono text-[11px]"
              />
              {formData.coverUrl && (
                <img
                  src={formData.coverUrl}
                  alt="Capa"
                  className="w-10 h-10 rounded object-cover border border-[#c5c6ce]"
                />
              )}
            </div>
          </div>

          {/* Author Details */}
          <div className="border-t border-[#eaeef2] pt-4">
            <h3 className="font-bold text-xs text-[#04162e] uppercase tracking-wider mb-3">
              Perfil do Autor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Nome do Autor
                </label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) =>
                    setFormData({ ...formData, authorName: e.target.value })
                  }
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded"
                />
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Link Direto do Avatar / Foto do Autor
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={formData.authorAvatarUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, authorAvatarUrl: e.target.value })
                    }
                    className="flex-1 p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-mono text-[11px]"
                  />
                  {formData.authorAvatarUrl && (
                    <img
                      src={formData.authorAvatarUrl}
                      alt="Autor"
                      className="w-8 h-8 rounded-full object-cover border border-[#c5c6ce]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <label className="font-label-caps block text-[#44474d] mb-1">
              Sinopse do Livro
            </label>
            <textarea
              rows={3}
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-writing-canvas text-xs leading-relaxed"
            />
          </div>

          {/* Identidade Visual & Paleta: Azul, Branco e Grafite */}
          <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#cbd5e1] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0a1c38] text-[20px]">
                  palette
                </span>
                <div>
                  <h3 className="font-bold text-[#0a1c38] text-xs">
                    Paleta de Cores: Azul, Branco & Grafite
                  </h3>
                  <p className="text-[10px] text-[#475569]">
                    Design cromático focado em legibilidade tipográfica, redução de fadiga ocular e harmonia estética.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Swatch 1: Azul */}
              <div className="p-2.5 rounded-lg bg-[#0e1726] border border-[#1e2d44] text-white flex flex-col justify-between h-20 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Azul Naval</span>
                  <span className="w-3 h-3 rounded-full bg-blue-500 border border-white/50"></span>
                </div>
                <div className="text-[10px] text-slate-300">
                  <span className="font-mono text-[9px] text-blue-300 block">#0a1c38 · #1e3a8a · #2563eb</span>
                  <span>Acentos, links, botões e foco</span>
                </div>
              </div>

              {/* Swatch 2: Branco */}
              <div className="p-2.5 rounded-lg bg-white border border-[#cbd5e1] text-[#0f172a] flex flex-col justify-between h-20 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Branco Puro</span>
                  <span className="w-3 h-3 rounded-full bg-white border border-slate-400"></span>
                </div>
                <div className="text-[10px] text-slate-600">
                  <span className="font-mono text-[9px] text-slate-500 block">#ffffff · #f8fafc · #f1f5f9</span>
                  <span>Páginas de escrita e cartões</span>
                </div>
              </div>

              {/* Swatch 3: Grafite */}
              <div className="p-2.5 rounded-lg bg-[#18202f] border border-[#2d3a4f] text-white flex flex-col justify-between h-20 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Grafite Carvão</span>
                  <span className="w-3 h-3 rounded-full bg-[#334155] border border-slate-400"></span>
                </div>
                <div className="text-[10px] text-slate-300">
                  <span className="font-mono text-[9px] text-cyan-300 block">#0f172a · #1e293b · #475569</span>
                  <span>Estrutura, bordas e tipografia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Save & Storage Section */}
          <div className="p-3.5 bg-[#f6fafe] rounded-lg border border-[#c5c6ce] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#04162e] text-[18px]">
                  cloud_sync
                </span>
                <span className="font-bold text-[#04162e] text-xs">
                  Salvamento Automático (Auto-Save)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveConfig.enabled}
                  onChange={(e) =>
                    setAutoSaveConfig({ ...autoSaveConfig, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#04162e]"></div>
              </label>
            </div>

            {autoSaveConfig.enabled && (
              <div className="space-y-2.5 pt-1 text-[11px] border-t border-[#c5c6ce]/50">
                <div className="flex items-center justify-between">
                  <span className="text-[#44474d]">Frequência de Salvamento:</span>
                  <select
                    value={autoSaveConfig.debounceMs}
                    onChange={(e) =>
                      setAutoSaveConfig({
                        ...autoSaveConfig,
                        debounceMs: Number(e.target.value),
                      })
                    }
                    className="p-1 px-2 bg-white border border-[#c5c6ce] rounded text-xs text-[#04162e] font-semibold"
                  >
                    <option value={500}>0.5 segundo (Ultrarrápido)</option>
                    <option value={1000}>1 segundo (Recomendado)</option>
                    <option value={2000}>2 segundos</option>
                    <option value={5000}>5 segundos</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#44474d]">Criar pontos de restauração (snapshots):</span>
                  <input
                    type="checkbox"
                    checked={autoSaveConfig.createBackupSnapshots}
                    onChange={(e) =>
                      setAutoSaveConfig({
                        ...autoSaveConfig,
                        createBackupSnapshots: e.target.checked,
                      })
                    }
                    className="rounded border-[#c5c6ce] text-[#04162e] focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#44474d]">Exibir indicador de status na barra:</span>
                  <input
                    type="checkbox"
                    checked={autoSaveConfig.showStatusBadge}
                    onChange={(e) =>
                      setAutoSaveConfig({
                        ...autoSaveConfig,
                        showStatusBadge: e.target.checked,
                      })
                    }
                    className="rounded border-[#c5c6ce] text-[#04162e] focus:ring-0"
                  />
                </div>
              </div>
            )}

            {/* Storage Usage Bar */}
            <div className="pt-2 border-t border-[#c5c6ce]/50 text-[11px]">
              <div className="flex justify-between text-[#44474d] mb-1">
                <span>Espaço de armazenamento local ocupado:</span>
                <span className="font-mono font-semibold text-[#04162e]">
                  {storageInfo.formatted}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${Math.max(2, storageInfo.percentage)}%` }}
                />
              </div>
            </div>

            {/* Keyboard Shortcuts Reference */}
            <div className="pt-3 border-t border-[#c5c6ce]/50">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#44474d] mb-2">
                Atalhos Rápidos de Teclado
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center justify-between bg-[#eaeef2] px-2.5 py-1.5 rounded">
                  <span className="text-[#44474d]">Salvar Manuscrito:</span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#c5c6ce] rounded font-mono font-bold text-[#04162e]">
                    Ctrl + S
                  </kbd>
                </div>
                <div className="flex items-center justify-between bg-[#eaeef2] px-2.5 py-1.5 rounded">
                  <span className="text-[#44474d]">Menu Lateral (Recolher/Expandir):</span>
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#c5c6ce] rounded font-mono font-bold text-[#04162e]">
                    Ctrl + B
                  </kbd>
                </div>
              </div>
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
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
