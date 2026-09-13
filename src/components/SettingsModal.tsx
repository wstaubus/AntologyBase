import React, { useState, useRef } from 'react';
import { NovelProject, ProjectPhase, AutoSaveSettings } from '../types';
import {
  DEFAULT_AUTOSAVE_SETTINGS,
  calculateStorageUsage,
  saveBackupSnapshot,
} from '../utils/autoSaveManager';
import { getPortugueseJsonString } from '../utils/jsonProjectTranslator';
import { ImageUploadModal } from './ImageUploadModal';
import { uploadProjectImage, readFileAsDataUrl } from '../utils/imageService';

interface SettingsModalProps {
  project: NovelProject;
  onClose: () => void;
  onUpdateProject: (updated: NovelProject) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onForceSave?: () => void;
  onRestoreDefaults?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  project,
  onClose,
  onUpdateProject,
  isDarkMode = false,
  onToggleDarkMode,
  onForceSave,
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

  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string>('Agora');
  const [syncNotice, setSyncNotice] = useState<string>('');

  // Modal de Upload de Imagens
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [imageUploadTarget, setImageUploadTarget] = useState<'cover' | 'avatar'>('cover');
  const authorDirectFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAuthorImg, setIsUploadingAuthorImg] = useState(false);

  const handleDirectAuthorFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, GIF).');
      return;
    }

    try {
      setIsUploadingAuthorImg(true);
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

      setFormData((prev) => ({ ...prev, authorAvatarUrl: newAvatarUrl }));
    } catch (err) {
      console.error('Erro no upload de foto do autor:', err);
    } finally {
      setIsUploadingAuthorImg(false);
      if (authorDirectFileInputRef.current) authorDirectFileInputRef.current.value = '';
    }
  };

  const handleManualSync = () => {
    setSyncing(true);
    if (onForceSave) {
      onForceSave();
    }
    saveBackupSnapshot(project, 'manual');
    setTimeout(() => {
      setSyncing(false);
      const timeStr = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setSyncedAt(timeStr);
      setSyncNotice('Manuscrito e dados sincronizados com sucesso!');
      setTimeout(() => setSyncNotice(''), 3500);
    }, 600);
  };

  const handleDownloadBackup = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(getPortugueseJsonString(project, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `${project.title.toLowerCase().replace(/\s+/g, '_')}_backup_pt_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`${
          isDarkMode
            ? 'bg-[#0b111a] border-[#1e293b] text-[#f8fafc]'
            : 'bg-[#ffffff] border-[#c5c6ce] text-[#04162e]'
        } rounded-xl border max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl transition-colors duration-200`}
      >
        {/* Modal Header */}
        <div
          className={`flex justify-between items-center pb-4 border-b ${
            isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]'
          } mb-5`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined ${
                isDarkMode ? 'text-[#60a5fa]' : 'text-[#04162e]'
              } text-[22px]`}
            >
              settings
            </span>
            <h2 className="font-headline-md text-lg font-bold">Configurações do Projeto</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#16202f]'
                : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
            }`}
            title="Fechar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* 1. SEÇÃO APARÊNCIA & MODO NOTURNO */}
          <div
            className={`p-4 rounded-xl border ${
              isDarkMode
                ? 'bg-[#131b26] border-[#1e293b]'
                : 'bg-[#f8fafc] border-[#cbd5e1]'
            } space-y-3 transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    isDarkMode ? 'text-amber-400' : 'text-amber-600'
                  }`}
                >
                  {isDarkMode ? 'dark_mode' : 'light_mode'}
                </span>
                <div>
                  <h3 className="font-bold text-xs">Aparência do Aplicativo (Tema)</h3>
                  <p
                    className={`text-[11px] ${
                      isDarkMode ? 'text-[#94a3b8]' : 'text-[#64748b]'
                    }`}
                  >
                    Alterne entre o Modo Diurno (claro) e o Modo Noturno (escuro).
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Toggle Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (isDarkMode && onToggleDarkMode) onToggleDarkMode();
                }}
                className={`py-2.5 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !isDarkMode
                    ? 'bg-[#04162e] text-white border-[#04162e] shadow-xs font-bold'
                    : isDarkMode
                    ? 'bg-[#1e293b]/60 border-[#334155] text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white'
                    : 'bg-white border-[#cbd5e1] text-[#334155]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">light_mode</span>
                <span>Modo Diurno (Claro)</span>
                {!isDarkMode && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isDarkMode && onToggleDarkMode) onToggleDarkMode();
                }}
                className={`py-2.5 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-xs font-bold'
                    : 'bg-white border-[#cbd5e1] text-[#334155] hover:bg-[#eaeef2]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                <span>Modo Noturno (Escuro)</span>
                {isDarkMode && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* 2. SEÇÃO SINCRONIZAÇÃO & BACKUP LOCAL */}
          <div
            className={`p-4 rounded-xl border ${
              isDarkMode
                ? 'bg-[#131b26] border-[#1e293b]'
                : 'bg-[#f6fafe] border-[#cbd5e1]'
            } space-y-3 transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}
                >
                  cloud_sync
                </span>
                <div>
                  <h3 className="font-bold text-xs">Sincronização & Backup Local</h3>
                  <p
                    className={`text-[11px] ${
                      isDarkMode ? 'text-[#94a3b8]' : 'text-[#64748b]'
                    }`}
                  >
                    Mantenha seus capítulos, cenas e dados seguros no armazenamento local do navegador.
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Status Banner */}
            <div
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs">Manuscrito Protegido</p>
                <p
                  className={`text-[11px] ${
                    isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                  }`}
                >
                  Última sincronização: <strong>{syncedAt}</strong> &bull; Armazenamento usado: <strong>{storageInfo.formatted}</strong>
                </p>
              </div>
            </div>

            {/* Success Notice */}
            {syncNotice && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1.5 animate-fadeIn">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{syncNotice}</span>
              </div>
            )}

            {/* Quick Action Buttons for Sync and Backup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncing}
                className={`py-2.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] ${
                  isDarkMode
                    ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                    : 'bg-[#04162e] hover:opacity-90 text-white'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    syncing ? 'animate-spin' : ''
                  }`}
                >
                  refresh
                </span>
                <span>{syncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className={`py-2.5 px-3 rounded-lg border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] ${
                  isDarkMode
                    ? 'bg-[#1e293b] border-[#334155] text-white hover:bg-[#334155]'
                    : 'bg-white border-[#cbd5e1] text-[#04162e] hover:bg-[#eaeef2]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">file_download</span>
                <span>Baixar Backup (.JSON)</span>
              </button>
            </div>
          </div>

          {/* 3. SEÇÃO INFORMAÇÕES DO ROMANCE */}
          <div className="space-y-4 pt-1">
            <h3
              className={`font-bold text-xs uppercase tracking-wider ${
                isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'
              }`}
            >
              Dados do Romance
            </h3>

            {/* Project Title & Phase */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`font-label-caps block mb-1 ${
                    isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'
                  }`}
                >
                  Título do Romance *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full p-2.5 rounded font-semibold border ${
                    isDarkMode
                      ? 'bg-[#16202f] border-[#253347] text-[#f8fafc] focus:border-[#60a5fa]'
                      : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e] focus:border-[#04162e]'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`font-label-caps block mb-1 ${
                    isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'
                  }`}
                >
                  Fase Atual
                </label>
                <select
                  value={formData.phase}
                  onChange={(e) =>
                    setFormData({ ...formData, phase: e.target.value as ProjectPhase })
                  }
                  className={`w-full p-2.5 rounded font-semibold border ${
                    isDarkMode
                      ? 'bg-[#16202f] border-[#253347] text-[#f8fafc] focus:border-[#60a5fa]'
                      : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e] focus:border-[#04162e]'
                  }`}
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
                <label
                  className={`font-label-caps block mb-1 ${
                    isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'
                  }`}
                >
                  Subtítulo / Fase no Menu
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Ex: Fase de Rascunho"
                  className={`w-full p-2.5 rounded border ${
                    isDarkMode
                      ? 'bg-[#16202f] border-[#253347] text-[#f8fafc]'
                      : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e]'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`font-label-caps block mb-1 ${
                    isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'
                  }`}
                >
                  Meta de Palavras (Alvo)
                </label>
                <input
                  type="number"
                  value={formData.targetWords}
                  onChange={(e) =>
                    setFormData({ ...formData, targetWords: parseInt(e.target.value) || 80000 })
                  }
                  className={`w-full p-2.5 rounded font-mono border ${
                    isDarkMode
                      ? 'bg-[#16202f] border-[#253347] text-[#f8fafc]'
                      : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e]'
                  }`}
                />
              </div>
            </div>

            {/* Book Cover URL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  className={`font-label-caps ${
                    isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'
                  }`}
                >
                  Imagem de Capa do Livro
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setImageUploadTarget('cover');
                    setIsImageUploadOpen(true);
                  }}
                  className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#16202f] hover:bg-[#1e293b] text-[#60a5fa] border border-[#253347]'
                      : 'bg-[#eaeef2] hover:bg-[#dfe3e7] text-[#04162e] border border-[#c5c6ce]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                  <span>Upload / Escolher Imagem</span>
                </button>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="url"
                  placeholder="https://... ou /imagens/capa.png"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  className={`flex-1 p-2.5 rounded font-mono text-[11px] border ${
                    isDarkMode
                      ? 'bg-[#16202f] border-[#253347] text-[#f8fafc]'
                      : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e]'
                  }`}
                />
                {Boolean(formData.coverUrl?.trim()) && (
                  <img
                    src={formData.coverUrl.trim()}
                    alt="Capa"
                    className="w-10 h-10 rounded object-cover border border-[#c5c6ce]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuBayP8WjgxxSA55dAwxE1ga8QMmBsju_hQAmJVxValxUEmiSFuHesSbuxn_VvysE6oYJe9yyMUYDsnIFq3vT9bnetbXSPR-NVBxs6ZlmqTj09GzNoK9A3SymIIJ6hNYvTN87oFXL_oLrESHwcfgqdAn1LM1sEConNb3PX7KqDQyCt017-tFmrYeZwgQ7eLK4vGLybFl60NRd36KCcoKz-KeJ2qaPmqwkrdUMrw8yS9wROEiYNuwr35G';
                    }}
                  />
                )}
              </div>
            </div>

            {/* Author Details */}
            <div
              className={`border-t pt-4 ${
                isDarkMode ? 'border-[#1e293b]' : 'border-[#eaeef2]'
              }`}
            >
              <h4
                className={`font-bold text-xs uppercase tracking-wider mb-3 ${
                  isDarkMode ? 'text-[#94a3b8]' : 'text-[#04162e]'
                }`}
              >
                Perfil do Autor
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`font-label-caps block mb-1 ${
                      isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'
                    }`}
                  >
                    Nome do Autor
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className={`w-full p-2.5 rounded border ${
                      isDarkMode
                        ? 'bg-[#16202f] border-[#253347] text-[#f8fafc]'
                        : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e]'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className={`font-label-caps ${
                        isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'
                      }`}
                    >
                      Avatar / Foto do Autor
                    </label>
                    <div className="flex items-center gap-1.5">
                      {/* Hidden file input for direct computer file upload */}
                      <input
                        type="file"
                        ref={authorDirectFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleDirectAuthorFileChange}
                      />
                      <button
                        type="button"
                        onClick={() => authorDirectFileInputRef.current?.click()}
                        className={`text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#2563eb]/20 hover:bg-[#2563eb]/35 text-[#60a5fa] border border-[#2563eb]/50'
                            : 'bg-[#04162e]/10 hover:bg-[#04162e]/20 text-[#04162e] border border-[#04162e]/30'
                        }`}
                        title="Upload direto de arquivo de imagem do computador"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {isUploadingAuthorImg ? 'refresh' : 'add_photo_alternate'}
                        </span>
                        <span>{isUploadingAuthorImg ? 'Enviando...' : 'Upload do Computador'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUploadTarget('avatar');
                          setIsImageUploadOpen(true);
                        }}
                        className={`text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#16202f] hover:bg-[#1e293b] text-[#cbd5e1] border border-[#253347]'
                            : 'bg-[#eaeef2] hover:bg-[#dfe3e7] text-[#44474d] border border-[#c5c6ce]'
                        }`}
                        title="Galeria e biblioteca de imagens"
                      >
                        <span className="material-symbols-outlined text-[12px]">photo_library</span>
                        <span>Biblioteca</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      placeholder="https://... ou clique em Upload do Computador"
                      value={formData.authorAvatarUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, authorAvatarUrl: e.target.value })
                      }
                      className={`flex-1 p-2.5 rounded font-mono text-[11px] border ${
                        isDarkMode
                          ? 'bg-[#16202f] border-[#253347] text-[#f8fafc]'
                          : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e]'
                      }`}
                    />
                    {Boolean(formData.authorAvatarUrl?.trim()) ? (
                      <div
                        className="relative group/avatar shrink-0 cursor-pointer"
                        onClick={() => authorDirectFileInputRef.current?.click()}
                        title="Clique para trocar imagem do computador"
                      >
                        <img
                          src={formData.authorAvatarUrl.trim()}
                          alt="Autor"
                          className="w-9 h-9 rounded-full object-cover border border-[#c5c6ce] dark:border-[#334155] group-hover/avatar:ring-2 group-hover/avatar:ring-[#2563eb]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full bg-[#eaeef2] dark:bg-[#16202f] border border-[#c5c6ce] dark:border-[#334155] flex items-center justify-center text-[#04162e] dark:text-[#f8fafc] font-bold text-xs cursor-pointer shrink-0"
                        onClick={() => authorDirectFileInputRef.current?.click()}
                        title="Clique para carregar foto do autor"
                      >
                        {formData.authorName?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <label
                className={`font-label-caps block mb-1 ${
                  isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'
                }`}
              >
                Sinopse do Livro
              </label>
              <textarea
                rows={3}
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                className={`w-full p-2.5 rounded font-writing-canvas text-xs leading-relaxed border ${
                  isDarkMode
                    ? 'bg-[#16202f] border-[#253347] text-[#f8fafc]'
                    : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e]'
                }`}
              />
            </div>
          </div>

          {/* 4. SEÇÃO SALVAMENTO AUTOMÁTICO (AUTO-SAVE) */}
          <div
            className={`p-3.5 rounded-xl border ${
              isDarkMode
                ? 'bg-[#131b26] border-[#1e293b]'
                : 'bg-[#f6fafe] border-[#c5c6ce]'
            } space-y-3 transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isDarkMode ? 'text-[#60a5fa]' : 'text-[#04162e]'
                  }`}
                >
                  tune
                </span>
                <span className="font-bold text-xs">Configuração do Auto-Save</span>
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
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2563eb]"></div>
              </label>
            </div>

            {autoSaveConfig.enabled && (
              <div
                className={`space-y-2.5 pt-1 text-[11px] border-t ${
                  isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'}>
                    Frequência de Salvamento:
                  </span>
                  <select
                    value={autoSaveConfig.debounceMs}
                    onChange={(e) =>
                      setAutoSaveConfig({
                        ...autoSaveConfig,
                        debounceMs: Number(e.target.value),
                      })
                    }
                    className={`p-1 px-2 border rounded text-xs font-semibold ${
                      isDarkMode
                        ? 'bg-[#1e293b] border-[#334155] text-white'
                        : 'bg-white border-[#c5c6ce] text-[#04162e]'
                    }`}
                  >
                    <option value={500}>0.5 segundo (Ultrarrápido)</option>
                    <option value={1000}>1 segundo (Recomendado)</option>
                    <option value={2000}>2 segundos</option>
                    <option value={5000}>5 segundos</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'}>
                    Criar pontos de restauração (snapshots):
                  </span>
                  <input
                    type="checkbox"
                    checked={autoSaveConfig.createBackupSnapshots}
                    onChange={(e) =>
                      setAutoSaveConfig({
                        ...autoSaveConfig,
                        createBackupSnapshots: e.target.checked,
                      })
                    }
                    className="rounded border-[#c5c6ce] text-[#2563eb] focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'}>
                    Exibir indicador de status na barra:
                  </span>
                  <input
                    type="checkbox"
                    checked={autoSaveConfig.showStatusBadge}
                    onChange={(e) =>
                      setAutoSaveConfig({
                        ...autoSaveConfig,
                        showStatusBadge: e.target.checked,
                      })
                    }
                    className="rounded border-[#c5c6ce] text-[#2563eb] focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Storage Usage Bar */}
            <div
              className={`pt-2 border-t text-[11px] ${
                isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]/50'
              }`}
            >
              <div className="flex justify-between mb-1">
                <span className={isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'}>
                  Espaço de armazenamento local ocupado:
                </span>
                <span className="font-mono font-semibold">{storageInfo.formatted}</span>
              </div>
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-[#1e293b]' : 'bg-gray-200'
                }`}
              >
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.max(2, storageInfo.percentage)}%` }}
                />
              </div>
            </div>

            {/* Keyboard Shortcuts Reference */}
            <div
              className={`pt-3 border-t ${
                isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]/50'
              }`}
            >
              <h4
                className={`font-bold text-[11px] uppercase tracking-wider mb-2 ${
                  isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'
                }`}
              >
                Atalhos Rápidos de Teclado
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded ${
                    isDarkMode ? 'bg-[#16202f]' : 'bg-[#eaeef2]'
                  }`}
                >
                  <span className={isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'}>
                    Salvar Manuscrito:
                  </span>
                  <kbd
                    className={`px-1.5 py-0.5 border rounded font-mono font-bold ${
                      isDarkMode
                        ? 'bg-[#1e293b] border-[#334155] text-white'
                        : 'bg-white border-[#c5c6ce] text-[#04162e]'
                    }`}
                  >
                    Ctrl + S
                  </kbd>
                </div>
                <div
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded ${
                    isDarkMode ? 'bg-[#16202f]' : 'bg-[#eaeef2]'
                  }`}
                >
                  <span className={isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'}>
                    Menu Lateral:
                  </span>
                  <kbd
                    className={`px-1.5 py-0.5 border rounded font-mono font-bold ${
                      isDarkMode
                        ? 'bg-[#1e293b] border-[#334155] text-white'
                        : 'bg-white border-[#c5c6ce] text-[#04162e]'
                    }`}
                  >
                    Ctrl + B
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div
            className={`flex justify-end gap-2 pt-4 border-t ${
              isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg font-semibold transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-[#334155] text-[#cbd5e1] hover:bg-[#16202f]'
                  : 'border-[#c5c6ce] text-[#44474d] hover:bg-[#eaeef2]'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-semibold text-white shadow-xs transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-[#2563eb] hover:bg-[#1d4ed8]'
                  : 'bg-[#04162e] hover:opacity-90'
              }`}
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Upload de Imagens */}
      <ImageUploadModal
        isOpen={isImageUploadOpen}
        onClose={() => setIsImageUploadOpen(false)}
        category={imageUploadTarget === 'cover' ? 'Capa' : 'Personagem'}
        title={imageUploadTarget === 'cover' ? 'Escolher Capa do Livro' : 'Escolher Avatar do Autor'}
        isDarkMode={isDarkMode}
        onSelectImage={(url) => {
          if (imageUploadTarget === 'cover') {
            setFormData((prev) => ({ ...prev, coverUrl: url }));
          } else {
            setFormData((prev) => ({ ...prev, authorAvatarUrl: url }));
          }
        }}
      />
    </div>
  );
};
