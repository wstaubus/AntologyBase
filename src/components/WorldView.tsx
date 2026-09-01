import React, { useState } from 'react';
import { NovelProject, WorldLocation, LoreEntry, LocationCategory } from '../types';

interface WorldViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
  selectedLocationId?: string | null;
}

export const WorldView: React.FC<WorldViewProps> = ({
  project,
  onUpdateProject,
  selectedLocationId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'locations' | 'lore'>('locations');
  const [editingLocation, setEditingLocation] = useState<WorldLocation | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLore, setEditingLore] = useState<LoreEntry | null>(null);
  const [isAddingLore, setIsAddingLore] = useState(false);

  // New location state
  const [newLoc, setNewLoc] = useState<Partial<WorldLocation>>({
    name: '',
    category: 'Cidade',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    shortDescription: '',
    fullDescription: '',
    atmosphere: '',
    notableFeatures: [],
  });
  const [featuresInput, setFeaturesInput] = useState('');

  // New lore state
  const [newLore, setNewLore] = useState<Partial<LoreEntry>>({
    title: '',
    category: 'História',
    content: '',
    relatedTags: [],
  });
  const [tagsInput, setTagsInput] = useState('');

  const handleSaveLocation = (loc: WorldLocation) => {
    const updated = project.locations.map((l) => (l.id === loc.id ? loc : l));
    onUpdateProject({
      ...project,
      locations: updated,
    });
    setEditingLocation(null);
  };

  const handleAddLocation = () => {
    if (!newLoc.name?.trim()) return;
    const created: WorldLocation = {
      id: `loc-${Date.now()}`,
      name: newLoc.name.trim(),
      category: newLoc.category || 'Cidade',
      imageUrl:
        newLoc.imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      shortDescription: newLoc.shortDescription || '',
      fullDescription: newLoc.fullDescription || '',
      atmosphere: newLoc.atmosphere || '',
      notableFeatures: newLoc.notableFeatures || [],
      isPrimary: false,
    };
    onUpdateProject({
      ...project,
      locations: [...project.locations, created],
    });
    setIsAddingLocation(false);
    setNewLoc({
      name: '',
      category: 'Cidade',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      shortDescription: '',
      fullDescription: '',
      atmosphere: '',
      notableFeatures: [],
    });
  };

  const handleSaveLore = (entry: LoreEntry) => {
    const updated = project.lore.map((l) => (l.id === entry.id ? entry : l));
    onUpdateProject({
      ...project,
      lore: updated,
    });
    setEditingLore(null);
  };

  const handleAddLore = () => {
    if (!newLore.title?.trim()) return;
    const created: LoreEntry = {
      id: `lore-${Date.now()}`,
      title: newLore.title.trim(),
      category: newLore.category || 'História',
      content: newLore.content || '',
      relatedTags: newLore.relatedTags || [],
    };
    onUpdateProject({
      ...project,
      lore: [...project.lore, created],
    });
    setIsAddingLore(false);
    setNewLore({
      title: '',
      category: 'História',
      content: '',
      relatedTags: [],
    });
  };

  return (
    <main
      id="world-view-container"
      className="flex-grow w-full max-w-[1000px] mx-auto px-6 lg:px-12 py-10"
    >
      {/* Header */}
      <div className="mb-8 border-b border-[#c5c6ce] pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <span className="font-label-caps text-label-caps text-[#44474d] uppercase tracking-wider mb-2 block text-xs">
            Geografia, Cultura & Ambientação
          </span>
          <h1 className="font-display-lg text-display-lg text-[#04162e] text-3xl sm:text-4xl">
            Construção de Mundo
          </h1>
        </div>

        <div className="flex gap-2">
          {activeSubTab === 'locations' ? (
            <button
              id="btn-add-location"
              onClick={() => setIsAddingLocation(true)}
              className="bg-[#04162e] text-white font-interface-sm text-sm py-2 px-4 rounded hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
              <span>Novo Cenário</span>
            </button>
          ) : (
            <button
              id="btn-add-lore"
              onClick={() => setIsAddingLore(true)}
              className="bg-[#04162e] text-white font-interface-sm text-sm py-2 px-4 rounded hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">post_add</span>
              <span>Novo Artigo de Lore</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-3 border-b border-[#c5c6ce] mb-8">
        <button
          onClick={() => setActiveSubTab('locations')}
          className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'locations'
              ? 'border-[#04162e] text-[#04162e]'
              : 'border-transparent text-[#44474d] hover:text-[#04162e]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">map</span>
          Cenários & Locais ({project.locations.length})
        </button>

        <button
          onClick={() => setActiveSubTab('lore')}
          className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'lore'
              ? 'border-[#04162e] text-[#04162e]'
              : 'border-transparent text-[#44474d] hover:text-[#04162e]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">auto_stories</span>
          Códex & Conhecimento ({project.lore.length})
        </button>
      </div>

      {/* Locations SubTab */}
      {activeSubTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.locations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => setEditingLocation(loc)}
              className={`bg-[#ffffff] rounded-xl border border-[#c5c6ce] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#04162e] transition-all cursor-pointer group flex flex-col justify-between ${
                loc.isPrimary ? 'ring-2 ring-[#04162e]/30' : ''
              }`}
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={loc.imageUrl}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-[#04162e]/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded">
                        {loc.category}
                      </span>
                      {loc.isPrimary && (
                        <span className="bg-amber-400 text-amber-950 text-[11px] font-extrabold px-2.5 py-1 rounded flex items-center gap-1 shadow-sm">
                          <span className="material-symbols-outlined text-[14px]">star</span>
                          Cenário Principal
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline-md text-xl font-bold text-white drop-shadow-md">
                      {loc.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <p className="font-writing-canvas text-xs text-[#171c1f] leading-relaxed mb-3">
                    {loc.shortDescription}
                  </p>

                  {loc.atmosphere && (
                    <div className="bg-[#f0f4f8] rounded p-2.5 mb-3 border border-[#c5c6ce]/60 text-xs text-[#44474d] italic">
                      <strong className="not-italic text-[#04162e]">Atmosfera:</strong>{' '}
                      {loc.atmosphere}
                    </div>
                  )}

                  {loc.notableFeatures && loc.notableFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {loc.notableFeatures.map((feat, idx) => (
                        <span
                          key={idx}
                          className="bg-[#eaeef2] text-[#44474d] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#c5c6ce]"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 pb-4 pt-2 border-t border-[#eaeef2] flex items-center justify-between text-xs text-[#44474d]">
                <span className="text-[11px]">Clique para editar ou alterar imagem</span>
                <span className="text-[#04162e] font-semibold flex items-center gap-0.5 group-hover:underline">
                  Editar
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lore SubTab */}
      {activeSubTab === 'lore' && (
        <div className="space-y-4">
          {project.lore.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setEditingLore(entry)}
              className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] p-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#04162e] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <h3 className="font-headline-md text-base font-bold text-[#04162e]">
                  {entry.title}
                </h3>
                <span className="bg-[#d5e3ff] text-[#091c34] text-[11px] font-bold px-2.5 py-0.5 rounded">
                  {entry.category}
                </span>
              </div>

              <p className="font-writing-canvas text-xs text-[#44474d] leading-relaxed mb-3">
                {entry.content}
              </p>

              <div className="flex flex-wrap gap-1">
                {entry.relatedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#f0f4f8] text-[#44474d] text-[10px] px-2 py-0.5 rounded border border-[#c5c6ce]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Location Modal */}
      {editingLocation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#c5c6ce] mb-4">
              <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
                Editar Cenário
              </h2>
              <button
                onClick={() => setEditingLocation(null)}
                className="text-[#44474d] hover:text-[#04162e] p-1 rounded"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Nome do Local
                </label>
                <input
                  type="text"
                  value={editingLocation.name}
                  onChange={(e) =>
                    setEditingLocation({ ...editingLocation, name: e.target.value })
                  }
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                />
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Link Direto da Imagem (URL)
                </label>
                <input
                  type="url"
                  value={editingLocation.imageUrl}
                  onChange={(e) =>
                    setEditingLocation({ ...editingLocation, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e] font-mono text-[11px]"
                />
                {editingLocation.imageUrl && (
                  <div className="mt-2 h-28 rounded overflow-hidden border border-[#c5c6ce]">
                    <img
                      src={editingLocation.imageUrl}
                      alt="Prévia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps block text-[#44474d] mb-1">
                    Categoria
                  </label>
                  <select
                    value={editingLocation.category}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        category: e.target.value as LocationCategory,
                      })
                    }
                    className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded"
                  >
                    <option value="Cidade">Cidade</option>
                    <option value="Distrito">Distrito</option>
                    <option value="Edifício">Edifício</option>
                    <option value="Território Selvagem">Território Selvagem</option>
                    <option value="Instalação">Instalação</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-[#04162e] font-semibold">
                    <input
                      type="checkbox"
                      checked={editingLocation.isPrimary || false}
                      onChange={(e) =>
                        setEditingLocation({
                          ...editingLocation,
                          isPrimary: e.target.checked,
                        })
                      }
                      className="rounded text-[#04162e]"
                    />
                    Cenário Principal
                  </label>
                </div>
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Descrição Curta (Exibida no Painel)
                </label>
                <textarea
                  rows={2}
                  value={editingLocation.shortDescription}
                  onChange={(e) =>
                    setEditingLocation({
                      ...editingLocation,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-writing-canvas text-xs"
                />
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Atmosfera & Sensações
                </label>
                <input
                  type="text"
                  value={editingLocation.atmosphere}
                  onChange={(e) =>
                    setEditingLocation({
                      ...editingLocation,
                      atmosphere: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#c5c6ce]">
              <button
                type="button"
                onClick={() => setEditingLocation(null)}
                className="px-4 py-2 border border-[#c5c6ce] text-[#44474d] rounded font-semibold text-xs hover:bg-[#eaeef2]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveLocation(editingLocation)}
                className="px-4 py-2 bg-[#04162e] text-white rounded font-semibold text-xs hover:opacity-90"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Location Modal */}
      {isAddingLocation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#c5c6ce] mb-4">
              <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
                Criar Novo Cenário
              </h2>
              <button
                onClick={() => setIsAddingLocation(false)}
                className="text-[#44474d] hover:text-[#04162e] p-1 rounded"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Nome do Local *
                </label>
                <input
                  type="text"
                  required
                  value={newLoc.name}
                  onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                  placeholder="Ex: Cripta dos Antigos Navegadores"
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                />
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Link Direto da Imagem (URL)
                </label>
                <input
                  type="url"
                  value={newLoc.imageUrl}
                  onChange={(e) => setNewLoc({ ...newLoc, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Categoria
                </label>
                <select
                  value={newLoc.category}
                  onChange={(e) =>
                    setNewLoc({
                      ...newLoc,
                      category: e.target.value as LocationCategory,
                    })
                  }
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded"
                >
                  <option value="Cidade">Cidade</option>
                  <option value="Distrito">Distrito</option>
                  <option value="Edifício">Edifício</option>
                  <option value="Território Selvagem">Território Selvagem</option>
                  <option value="Instalação">Instalação</option>
                </select>
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Descrição Curta
                </label>
                <textarea
                  rows={2}
                  value={newLoc.shortDescription}
                  onChange={(e) =>
                    setNewLoc({ ...newLoc, shortDescription: e.target.value })
                  }
                  placeholder="Resumo do ambiente e sua relevância na trama..."
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded"
                />
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Elementos Notáveis (Separados por vírgula)
                </label>
                <input
                  type="text"
                  value={featuresInput}
                  onChange={(e) => {
                    setFeaturesInput(e.target.value);
                    const parsed = e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    setNewLoc({ ...newLoc, notableFeatures: parsed });
                  }}
                  placeholder="Ex: Torres de Vigia, Túnel Submerso"
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#c5c6ce]">
              <button
                type="button"
                onClick={() => setIsAddingLocation(false)}
                className="px-4 py-2 border border-[#c5c6ce] text-[#44474d] rounded font-semibold text-xs hover:bg-[#eaeef2]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddLocation}
                disabled={!newLoc.name?.trim()}
                className="px-4 py-2 bg-[#04162e] text-white rounded font-semibold text-xs hover:opacity-90 disabled:opacity-50"
              >
                Adicionar Cenário
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
