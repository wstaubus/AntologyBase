import React, { useState, useRef, useEffect } from 'react';
import {
  StoredImage,
  listProjectImages,
  uploadProjectImage,
  formatImageSize,
} from '../utils/imageService';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  title?: string;
  category?: 'Capa' | 'Personagem' | 'Cenário' | 'Inspiração' | 'Geral';
  isDarkMode?: boolean;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Enviar ou Escolher Imagem',
  category = 'Geral',
  isDarkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Capa' | 'Personagem' | 'Cenário' | 'Inspiração' | 'Geral'>(category);
  const [customUrl, setCustomUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadImages();
      setSelectedCategory(category);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, category]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const list = await listProjectImages();
      setImages(list);
    } catch (err) {
      console.error('Erro ao carregar imagens:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Valida se é imagem
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    try {
      const uploaded = await uploadProjectImage(file, selectedCategory);
      setSuccessMsg(`Imagem "${uploaded.name}" enviada com sucesso para /imagens!`);
      // Recarrega galeria
      await loadImages();
      setTimeout(() => {
        onSelectImage(uploaded.url);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleSelectExisting = (url: string) => {
    onSelectImage(url);
    onClose();
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onSelectImage(customUrl.trim());
    onClose();
  };

  return (
    <div
      id="modal-image-upload-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="modal-image-upload-card"
        className={`${
          isDarkMode
            ? 'bg-[#0b111a] border-[#1e293b] text-[#f8fafc]'
            : 'bg-[#ffffff] border-[#c5c6ce] text-[#04162e]'
        } rounded-xl border max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]`}
      >
        {/* Modal Header */}
        <div
          className={`flex justify-between items-center pb-3 border-b ${
            isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]'
          } mb-4`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-[22px] ${
                isDarkMode ? 'text-[#60a5fa]' : 'text-[#04162e]'
              }`}
            >
              add_photo_alternate
            </span>
            <h3 className="font-bold text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-[#94a3b8] hover:text-white hover:bg-[#16202f]'
                : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
            }`}
            title="Fechar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? isDarkMode
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-[#04162e] text-white shadow-xs'
                : isDarkMode
                ? 'bg-[#131b26] text-[#cbd5e1] hover:bg-[#1e293b]'
                : 'bg-[#eaeef2] text-[#44474d] hover:bg-[#dfe3e7]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Upload do Computador</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('gallery');
              loadImages();
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? isDarkMode
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-[#04162e] text-white shadow-xs'
                : isDarkMode
                ? 'bg-[#131b26] text-[#cbd5e1] hover:bg-[#1e293b]'
                : 'bg-[#eaeef2] text-[#44474d] hover:bg-[#dfe3e7]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">photo_library</span>
            <span>Pasta de Imagens ({images.length})</span>
          </button>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-3 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4 text-xs overflow-y-auto pr-1">
            {/* Category Selector */}
            <div className="flex items-center justify-between gap-2">
              <label
                className={`font-semibold ${
                  isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'
                }`}
              >
                Destino / Categoria da Imagem:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value as 'Capa' | 'Personagem' | 'Cenário' | 'Inspiração' | 'Geral'
                  )
                }
                className={`p-1.5 px-2.5 rounded border text-xs font-semibold ${
                  isDarkMode
                    ? 'bg-[#16202f] border-[#253347] text-[#f8fafc]'
                    : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e]'
                }`}
              >
                <option value="Capa">Capa do Livro</option>
                <option value="Personagem">Personagem</option>
                <option value="Cenário">Cenários</option>
                <option value="Inspiração">Inspiração</option>
                <option value="Geral">Geral</option>
              </select>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragOver
                  ? isDarkMode
                    ? 'border-[#60a5fa] bg-[#1e293b]/60 scale-[1.01]'
                    : 'border-[#04162e] bg-blue-50/60 scale-[1.01]'
                  : isDarkMode
                  ? 'border-[#253347] hover:border-[#60a5fa] bg-[#131b26]/60'
                  : 'border-[#cbd5e1] hover:border-[#04162e] bg-[#f8fafc]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
              />

              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-[#16202f] text-[#60a5fa]' : 'bg-[#e4e9ed] text-[#04162e]'
                }`}
              >
                <span className="material-symbols-outlined text-[28px]">
                  {uploading ? 'cloud_upload' : 'file_upload'}
                </span>
              </div>

              <div>
                <p className="font-bold text-sm mb-1">
                  {uploading
                    ? 'Enviando imagem para a pasta /imagens...'
                    : 'Arraste e solte uma imagem aqui'}
                </p>
                <p
                  className={`text-[11px] ${
                    isDarkMode ? 'text-[#94a3b8]' : 'text-[#64748b]'
                  }`}
                >
                  ou clique para selecionar do seu computador (PNG, JPG, WEBP, GIF, SVG)
                </p>
              </div>

              <span
                className={`text-[10px] px-2 py-0.5 rounded border ${
                  isDarkMode
                    ? 'bg-[#16202f] border-[#253347] text-[#94a3b8]'
                    : 'bg-white border-[#cbd5e1] text-[#64748b]'
                }`}
              >
                Salva permanentemente na pasta <strong>public/imagens</strong>
              </span>
            </div>

            {/* Direct URL input fallback */}
            <div
              className={`pt-3 border-t ${
                isDarkMode ? 'border-[#1e293b]' : 'border-[#eaeef2]'
              }`}
            >
              <label
                className={`block font-semibold mb-1 ${
                  isDarkMode ? 'text-[#cbd5e1]' : 'text-[#44474d]'
                }`}
              >
                Ou cole uma URL direta da internet:
              </label>
              <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://exemplo.com/minha-imagem.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className={`flex-1 p-2 rounded border font-mono text-[11px] ${
                    isDarkMode
                      ? 'bg-[#16202f] border-[#253347] text-white'
                      : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!customUrl.trim()}
                  className={`px-3 py-2 rounded font-semibold text-xs text-white transition-opacity disabled:opacity-40 cursor-pointer ${
                    isDarkMode ? 'bg-[#2563eb]' : 'bg-[#04162e]'
                  }`}
                >
                  Usar URL
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Gallery of existing images */}
        {activeTab === 'gallery' && (
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 text-center text-xs">
                <span className="material-symbols-outlined text-[24px] animate-spin mb-1 block">
                  refresh
                </span>
                <span>Carregando imagens da pasta...</span>
              </div>
            ) : images.length === 0 ? (
              <div className="py-10 text-center text-xs">
                <span
                  className={`material-symbols-outlined text-[36px] ${
                    isDarkMode ? 'text-[#334155]' : 'text-[#cbd5e1]'
                  } mb-2 block`}
                >
                  photo_library
                </span>
                <p className="font-semibold mb-1">Nenhuma imagem enviada ainda</p>
                <p
                  className={`text-[11px] mb-3 ${
                    isDarkMode ? 'text-[#94a3b8]' : 'text-[#64748b]'
                  }`}
                >
                  A pasta <strong>public/imagens</strong> está vazia. Faça o primeiro upload!
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1.5 rounded font-semibold text-xs text-white cursor-pointer ${
                    isDarkMode ? 'bg-[#2563eb]' : 'bg-[#04162e]'
                  }`}
                >
                  Fazer Upload Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => handleSelectExisting(img.url)}
                    className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-xs ${
                      isDarkMode
                        ? 'border-[#253347] bg-[#16202f] hover:border-[#60a5fa]'
                        : 'border-[#cbd5e1] bg-[#f8fafc] hover:border-[#04162e]'
                    }`}
                  >
                    <div className="aspect-square w-full bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center">
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
                        <span className="material-symbols-outlined text-3xl opacity-30">image</span>
                      )}
                    </div>
                    <div className="p-2 text-[11px]">
                      <p className="font-semibold truncate" title={img.name}>
                        {img.name}
                      </p>
                      <p
                        className={`text-[10px] ${
                          isDarkMode ? 'text-[#94a3b8]' : 'text-[#64748b]'
                        }`}
                      >
                        {formatImageSize(img.size)}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-[#04162e] font-bold text-xs px-2.5 py-1 rounded-md shadow-md">
                        Selecionar
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div
          className={`flex justify-end gap-2 pt-3 mt-4 border-t ${
            isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 border rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              isDarkMode
                ? 'border-[#334155] text-[#cbd5e1] hover:bg-[#16202f]'
                : 'border-[#c5c6ce] text-[#44474d] hover:bg-[#eaeef2]'
            }`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
