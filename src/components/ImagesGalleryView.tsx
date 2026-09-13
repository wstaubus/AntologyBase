import React, { useState, useEffect, useRef } from 'react';
import { NovelProject, Character, WorldLocation } from '../types';
import {
  StoredImage,
  listProjectImages,
  uploadProjectImage,
  deleteProjectImage,
  formatImageSize,
} from '../utils/imageService';

interface ImagesGalleryViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
  isDarkMode?: boolean;
}

export const ImagesGalleryView: React.FC<ImagesGalleryViewProps> = ({
  project,
  onUpdateProject,
  isDarkMode = false,
}) => {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [uploadCategory, setUploadCategory] = useState<'Capa' | 'Personagem' | 'Cenário' | 'Inspiração' | 'Geral'>('Geral');
  
  // Modais de vinculação rápida
  const [toastMessage, setToastMessage] = useState<string>('');
  const [linkingImage, setLinkingImage] = useState<StoredImage | null>(null);
  const [linkTargetType, setLinkTargetType] = useState<'character' | 'location' | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const list = await listProjectImages();
      setImages(list);
    } catch (err) {
      console.error('Erro ao listar imagens:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let count = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          await uploadProjectImage(file, uploadCategory);
          count++;
        } catch (err) {
          console.error('Erro ao enviar imagem:', file.name, err);
        }
      }
    }

    setUploading(false);
    await loadImages();
    if (count > 0) {
      showToast(`${count} ${count === 1 ? 'imagem salva' : 'imagens salvas'} na pasta public/imagens com sucesso!`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = async (img: StoredImage) => {
    if (window.confirm(`Tem certeza que deseja excluir a imagem "${img.name}" da pasta de imagens?`)) {
      await deleteProjectImage(img.id);
      await loadImages();
      showToast(`Imagem "${img.name}" excluída.`);
    }
  };

  const handleCopyUrl = (url: string) => {
    // Resolve URL completa ou relativa
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    showToast('Link da imagem copiado para a área de transferência!');
  };

  const handleSetAsBookCover = (img: StoredImage) => {
    onUpdateProject({
      ...project,
      coverUrl: img.url,
      history: [
        {
          id: `rev-${Date.now()}`,
          timestamp: 'Agora',
          action: `Definiu "${img.name}" como capa do romance`,
          author: project.author.name,
          wordsDelta: 0,
        },
        ...project.history,
      ],
    });
    showToast(`"${img.name}" definida como Capa do Livro!`);
  };

  const handleOpenLinkModal = (img: StoredImage, type: 'character' | 'location') => {
    setLinkingImage(img);
    setLinkTargetType(type);
    if (type === 'character' && project.characters.length > 0) {
      setSelectedTargetId(project.characters[0].id);
    } else if (type === 'location' && project.locations.length > 0) {
      setSelectedTargetId(project.locations[0].id);
    }
  };

  const handleConfirmLink = () => {
    if (!linkingImage || !linkTargetType || !selectedTargetId) return;

    if (linkTargetType === 'character') {
      const updatedChars = project.characters.map((c: Character) =>
        c.id === selectedTargetId ? { ...c, avatarUrl: linkingImage.url } : c
      );
      const targetChar = project.characters.find((c) => c.id === selectedTargetId);
      onUpdateProject({
        ...project,
        characters: updatedChars,
        history: [
          {
            id: `rev-${Date.now()}`,
            timestamp: 'Agora',
            action: `Atualizou o avatar de ${targetChar?.name || 'personagem'}`,
            author: project.author.name,
            wordsDelta: 0,
          },
          ...project.history,
        ],
      });
      showToast(`Avatar de "${targetChar?.name}" atualizado!`);
    } else {
      const updatedLocs = project.locations.map((l: WorldLocation) =>
        l.id === selectedTargetId ? { ...l, imageUrl: linkingImage.url } : l
      );
      const targetLoc = project.locations.find((l) => l.id === selectedTargetId);
      onUpdateProject({
        ...project,
        locations: updatedLocs,
        history: [
          {
            id: `rev-${Date.now()}`,
            timestamp: 'Agora',
            action: `Atualizou a imagem de ${targetLoc?.name || 'cenário'}`,
            author: project.author.name,
            wordsDelta: 0,
          },
          ...project.history,
        ],
      });
      showToast(`Imagem do cenário "${targetLoc?.name}" atualizada!`);
    }

    setLinkingImage(null);
    setLinkTargetType(null);
  };

  // Filtragem
  const filteredImages = images.filter((img) => {
    const matchesSearch = img.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Todos' || img.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalBytes = images.reduce((acc, img) => acc + (img.size || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#04162e] dark:bg-[#2563eb] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Path and Stats */}
      <div
        className={`p-6 rounded-2xl border ${
          isDarkMode
            ? 'bg-[#0b111a] border-[#1e293b] text-[#f8fafc]'
            : 'bg-[#ffffff] border-[#c5c6ce] text-[#04162e]'
        } shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`material-symbols-outlined text-[26px] ${
                isDarkMode ? 'text-[#60a5fa]' : 'text-[#04162e]'
              }`}
            >
              folder_special
            </span>
            <h1 className="font-bold text-xl sm:text-2xl">Pasta de Imagens</h1>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isDarkMode
                  ? 'bg-[#16202f] border-[#253347] text-[#94a3b8]'
                  : 'bg-[#f1f5f9] border-[#cbd5e1] text-[#475569]'
              }`}
            >
              public/imagens/
            </span>
          </div>
          <p
            className={`text-xs ${
              isDarkMode ? 'text-[#94a3b8]' : 'text-[#44474d]'
            }`}
          >
            Faça upload, visualize e gerencie ilustrações, capas, avatares de personagens e cenários do seu romance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`text-right px-3 py-1.5 rounded-lg border ${
              isDarkMode
                ? 'bg-[#131b26] border-[#1e293b]'
                : 'bg-[#f8fafc] border-[#cbd5e1]'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-[#64748b] dark:text-[#94a3b8]">
              Total de Arquivos
            </div>
            <div className="text-sm font-bold font-mono">
              {images.length} {images.length === 1 ? 'imagem' : 'imagens'} &bull; {formatImageSize(totalBytes)}
            </div>
          </div>

          <button
            onClick={loadImages}
            title="Atualizar lista"
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-[#16202f] border-[#253347] text-[#cbd5e1] hover:text-white'
                : 'bg-white border-[#c5c6ce] text-[#44474d] hover:bg-[#eaeef2]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                loading ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`p-6 rounded-2xl border ${
          isDarkMode
            ? 'bg-[#0b111a] border-[#1e293b]'
            : 'bg-[#ffffff] border-[#c5c6ce]'
        } shadow-sm space-y-4`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-500">
                cloud_upload
              </span>
              Fazer Upload de Novas Imagens
            </h2>
            <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
              Suporte a arrastar e soltar (drag-and-drop) ou seleção de múltiplos arquivos de uma vez.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#44474d] dark:text-[#cbd5e1]">
              Categoria do Envio:
            </span>
            <select
              value={uploadCategory}
              onChange={(e) =>
                setUploadCategory(
                  e.target.value as 'Capa' | 'Personagem' | 'Cenário' | 'Inspiração' | 'Geral'
                )
              }
              className={`p-1.5 px-2.5 rounded-lg border text-xs font-semibold ${
                isDarkMode
                  ? 'bg-[#16202f] border-[#253347] text-white'
                  : 'bg-[#f8fafc] border-[#c5c6ce] text-[#04162e]'
              }`}
            >
              <option value="Geral">Geral</option>
              <option value="Capa">Capa do Livro</option>
              <option value="Personagem">Personagem</option>
              <option value="Cenário">Cenários</option>
              <option value="Inspiração">Inspiração</option>
            </select>
          </div>
        </div>

        {/* Drag and Drop Container */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
            dragOver
              ? isDarkMode
                ? 'border-[#60a5fa] bg-[#1e293b]/80 scale-[1.005]'
                : 'border-[#04162e] bg-blue-50 scale-[1.005]'
              : isDarkMode
              ? 'border-[#253347] hover:border-[#60a5fa] bg-[#131b26]/50'
              : 'border-[#cbd5e1] hover:border-[#04162e] bg-[#f8fafc]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />

          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-[#16202f] text-[#60a5fa]' : 'bg-[#e2e8f0] text-[#04162e]'
            }`}
          >
            <span className="material-symbols-outlined text-[28px]">
              {uploading ? 'sync' : 'add_photo_alternate'}
            </span>
          </div>

          <div>
            <p className="font-bold text-sm">
              {uploading ? 'Enviando imagens para o projeto...' : 'Arraste imagens aqui ou clique para selecionar'}
            </p>
            <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
              Formatos aceitos: PNG, JPG, JPEG, WEBP, GIF, SVG (arquivos são salvos na pasta <code>public/imagens</code>)
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="absolute left-3 top-2.5 material-symbols-outlined text-[18px] text-[#94a3b8]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nome da imagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs ${
              isDarkMode
                ? 'bg-[#0b111a] border-[#1e293b] text-white placeholder-[#64748b]'
                : 'bg-white border-[#cbd5e1] text-[#04162e] placeholder-[#94a3b8]'
            }`}
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['Todos', 'Capa', 'Personagem', 'Cenário', 'Inspiração', 'Geral'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? isDarkMode
                    ? 'bg-[#2563eb] text-white shadow-xs'
                    : 'bg-[#04162e] text-white shadow-xs'
                  : isDarkMode
                  ? 'bg-[#131b26] text-[#cbd5e1] hover:bg-[#1e293b]'
                  : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs">
          <span className="material-symbols-outlined text-[32px] animate-spin mb-2 block">
            refresh
          </span>
          <span>Carregando imagens...</span>
        </div>
      ) : filteredImages.length === 0 ? (
        <div
          className={`py-16 text-center rounded-2xl border ${
            isDarkMode
              ? 'bg-[#0b111a] border-[#1e293b] text-[#94a3b8]'
              : 'bg-white border-[#cbd5e1] text-[#64748b]'
          }`}
        >
          <span className="material-symbols-outlined text-[48px] opacity-40 mb-2 block">
            image_not_supported
          </span>
          <p className="font-bold text-sm mb-1">Nenhuma imagem encontrada</p>
          <p className="text-xs">
            {searchTerm || selectedCategory !== 'Todos'
              ? 'Tente remover os filtros ou o termo de busca.'
              : 'A pasta public/imagens ainda não contém fotos. Use a área de upload acima!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className={`group rounded-xl border overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md flex flex-col ${
                isDarkMode
                  ? 'bg-[#0b111a] border-[#1e293b] text-[#f8fafc]'
                  : 'bg-white border-[#cbd5e1] text-[#04162e]'
              }`}
            >
              {/* Image Preview Box */}
              <div className="relative aspect-video bg-black/10 dark:bg-white/5 overflow-hidden flex items-center justify-center">
                {img.url?.trim() ? (
                  <img
                    src={img.url.trim()}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl opacity-30">image</span>
                )}

                {img.category && (
                  <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {img.category}
                  </span>
                )}

                {/* Hover overlay quick buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={() => handleCopyUrl(img.url)}
                    title="Copiar Link"
                    className="p-2 bg-white text-[#04162e] rounded-full shadow hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">link</span>
                  </button>

                  <a
                    href={img.url}
                    download={img.name}
                    title="Baixar imagem"
                    className="p-2 bg-white text-[#04162e] rounded-full shadow hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </a>

                  <button
                    onClick={() => handleDelete(img)}
                    title="Excluir imagem"
                    className="p-2 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Info & Metadata */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 text-xs">
                <div>
                  <h3 className="font-bold text-xs truncate" title={img.name}>
                    {img.name}
                  </h3>
                  <div
                    className={`flex items-center justify-between text-[11px] mt-1 ${
                      isDarkMode ? 'text-[#94a3b8]' : 'text-[#64748b]'
                    }`}
                  >
                    <span>{formatImageSize(img.size)}</span>
                    <span>
                      {new Date(img.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Direct Assignment Actions */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 grid grid-cols-1 gap-1.5 text-[11px]">
                  <button
                    onClick={() => handleSetAsBookCover(img)}
                    className={`w-full py-1.5 px-2 rounded font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#131b26] hover:bg-[#1e293b] text-[#60a5fa]'
                        : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#04162e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                    <span>Definir como Capa</span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleOpenLinkModal(img, 'character')}
                      className={`py-1 px-1.5 rounded font-semibold text-center truncate transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'bg-[#131b26] hover:bg-[#1e293b] text-[#cbd5e1]'
                          : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569]'
                      }`}
                      title="Vincular a um Personagem"
                    >
                      + Personagem
                    </button>

                    <button
                      onClick={() => handleOpenLinkModal(img, 'location')}
                      className={`py-1 px-1.5 rounded font-semibold text-center truncate transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'bg-[#131b26] hover:bg-[#1e293b] text-[#cbd5e1]'
                          : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569]'
                      }`}
                      title="Vincular a um Cenário"
                    >
                      + Cenário
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para vincular a Personagem ou Cenário */}
      {linkingImage && linkTargetType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`rounded-xl border max-w-md w-full p-5 shadow-2xl ${
              isDarkMode
                ? 'bg-[#0b111a] border-[#1e293b] text-[#f8fafc]'
                : 'bg-white border-[#c5c6ce] text-[#04162e]'
            }`}
          >
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">
                {linkTargetType === 'character' ? 'group' : 'public'}
              </span>
              {linkTargetType === 'character'
                ? 'Vincular Imagem a um Personagem'
                : 'Vincular Imagem a um Cenário'}
            </h3>

            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-4">
              A imagem <strong>{linkingImage.name}</strong> será definida como o novo avatar visual.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1">
                Selecione o destinatário:
              </label>
              {linkTargetType === 'character' ? (
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs font-semibold ${
                    isDarkMode
                      ? 'bg-[#16202f] border-[#253347] text-white'
                      : 'bg-[#f8fafc] border-[#c5c6ce] text-[#04162e]'
                  }`}
                >
                  {project.characters.map((c: Character) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs font-semibold ${
                    isDarkMode
                      ? 'bg-[#16202f] border-[#253347] text-white'
                      : 'bg-[#f8fafc] border-[#c5c6ce] text-[#04162e]'
                  }`}
                >
                  {project.locations.map((l: WorldLocation) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.category})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setLinkingImage(null);
                  setLinkTargetType(null);
                }}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLink}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer ${
                  isDarkMode ? 'bg-[#2563eb]' : 'bg-[#04162e]'
                }`}
              >
                Aplicar Imagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
